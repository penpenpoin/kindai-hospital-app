// =====================================================================
// 通院シミュレーション（アプリの「裏側」）
//  - 画面はこの state を描くだけ。出来事（action）で state が変わる。
//  - 外部システムとのやりとりは log() に「想定」として記録し、デバッグパネルに出す。
//  - 実在システムの仕様ではなく、「何をきっかけに・どこへ・何を送るか」の設計案。
// =====================================================================

export const SCENES = [
  { id: 'before', label: '来院前', key: '1' },
  { id: 'travel', label: '移動中', key: '2' },
  { id: 'hospital', label: '院内', key: '3' },
  { id: 'after', label: '診察後', key: '4' },
  { id: 'home', label: '帰宅', key: '5' },
]

// ログの発信元（色分けに使う）
export const SYS = {
  step: 'シナリオ',
  app: 'アプリ',
  loc: '位置検知',
  rsv: '予約・受付システム（想定）',
  emr: '電子カルテ（想定）',
  pay: '決済（想定）',
  push: 'プッシュ通知',
  ai: 'AI（想定）',
  transit: '交通情報（想定）',
  debug: 'デバッグ',
  family: '家族連携',
}

export const PLACES = {
  home: '自宅',
  station: '泉ケ丘駅',
  entrance: '1号館（外来棟）入口',
  lab: '2号館 3F 採血・生理検査（3L）',
  waiting: '循環器内科 待合（3B）',
  cafe: '7号館 3F CAFE CORE',
  info: '1号館 3F 情報コーナー',
  cardio: '1号館 3F 循環器内科（3B）',
  front: '1号館 3F 総合受付前',
  exit: '泉ケ丘駅方面の出口',
}

// 近大病院の実際の区画番号（3L・3B など／公式フロアマップより）に色を付けた案内板（色は提案）
export const SIGNS = {
  lab: { letter: '3L', color: '#e11d48', name: '採血・生理検査', easy: '血をとる部屋' },
  cardio: { letter: '3B', color: '#2563eb', name: '循環器内科', easy: 'しんぞうの科' },
  cashier: { letter: '¥', color: '#d97706', name: '会計・自動受付（総合受付前）', easy: 'おかね・うけつけ' },
  exit: { letter: '駅', color: '#059669', name: '泉ケ丘駅', easy: 'えき' },
  er: { letter: '2R', color: '#ea580c', name: '救急外来', easy: 'きゅうきゅう' },
}

const initialTasks = () => [
  { id: 'blood', name: '採血', easy: '血をとる検査', place: 'lab', status: 'todo' },
  { id: 'consult', name: '循環器内科 診察', easy: 'お医者さんの診察', place: 'cardio', status: 'todo' },
]

// ---------------------------------------------------------------------
// 体調日記（提案書：日々の状態をアプリで記録 → AI が問診票を自動生成・医療データの利活用）
//  入力はタップで選ぶだけ。ひとことは声でも入れられる（吹き込んだ体調メモ）。
// ---------------------------------------------------------------------
export const DIARY_PARTS = ['頭', 'むね', 'おなか', '背中・腰', 'ひざ・足', 'その他']
export const DIARY_SYMPTOMS = ['痛い', '腫れている', 'しびれる', '息が切れる', 'めまい', '眠れない']
export const DIARY_MOODS = ['よい', 'ふつう', 'わるい']
const SYM_NOUN = { 痛い: '痛み', 腫れている: '腫れ', しびれる: 'しびれ', 息が切れる: '息切れ', めまい: 'めまい', 眠れない: '睡眠障害（眠れない）' }

export const DIARY_SEED = [
  { id: 1, date: '10月2日', mood: 'わるい', parts: ['ひざ・足'], sym: ['痛い'], level: 3, note: '階段をおりるときがつらい', voice: false },
  { id: 2, date: '10月4日', mood: 'ふつう', parts: ['ひざ・足'], sym: ['腫れている'], level: 2, note: '湿布で楽になった', voice: false },
  { id: 3, date: '10月6日', mood: 'わるい', parts: ['ひざ・足'], sym: ['痛い', '眠れない'], level: 4, note: '夜に目が覚めた', voice: true },
]

// 問診票に添える既往（デモ用の例）
export const ALLERGIES = ['ペニシリン系抗菌薬：発疹の既往', 'そば：じんましん']

const top = (arr) => {
  const c = {}
  arr.forEach((x) => (c[x] = (c[x] || 0) + 1))
  return Object.entries(c).sort((a, b) => b[1] - a[1]).map(([k]) => k)
}

// 日記の記録から、医師が読みやすい形（主訴・経過・随伴症状）にまとめる。
// まとめるだけで、診断や受診科の判断はしない。
export function buildMonshin(diary, talk = null) {
  const list = diary.filter((r) => r.parts.length || r.sym.length || r.note)
  if (!list.length) return null
  const parts = top(list.flatMap((r) => r.parts))
  const syms = top(list.flatMap((r) => r.sym))
  const mainSym = syms[0]
  const mainPart = parts[0]
  const withMain = list.find((r) => r.sym.includes(mainSym) && r.note)
  const chief = `${mainPart ?? ''}${mainPart && mainSym ? 'の' : ''}${mainSym ? SYM_NOUN[mainSym] : ''}${withMain ? `（${withMain.note}）` : ''}` || '体調の変化'
  const levels = list.map((r) => r.level).filter(Boolean)
  const first = list[0]
  const last = list[list.length - 1]
  let trend = ''
  if (levels.length >= 2) trend = levels[levels.length - 1] > levels[0] ? '悪化傾向' : levels[levels.length - 1] < levels[0] ? '改善傾向' : '横ばい'
  const notes = list.filter((r) => r.note && r !== withMain).map((r) => `${r.date}「${r.note}」`)
  const course = [`${first.date}ごろから。記録 ${list.length} 件${trend ? `、つらさは${trend}` : ''}。`, ...notes].join(' ')
  const related = syms.slice(1).map((x) => `${SYM_NOUN[x]}（${list.filter((r) => r.sym.includes(x)).map((r) => r.date).join('・')}）`).join('、') || 'なし'
  const severity = levels.length ? `つらさ ${Math.min(...levels)}〜${Math.max(...levels)} / 5（最新 ${last.level || '—'}）` : '—'
  return {
    chief,
    course: talk ? `${course} 前日の会話「${talk}」。` : course,
    related,
    severity,
    otherParts: parts.slice(1).join('・') || null,
    allergies: ALLERGIES,
    sources: list.length,
    voiceCount: list.filter((r) => r.voice).length + (talk ? 1 : 0),
    status: 'draft',
    sent: false,
  }
}

export const BILL = { total: 3240, items: [['再診料', 760], ['検査（採血）', 1680], ['処方箋料', 800]] }

// 家族連携（アカウント画面で設定）。シナリオを戻しても消えないよう flags に入れる
export const FAMILY_DEFAULT = [{ id: 'hanako', name: '田中 花子', rel: '娘', share: true, proxy: true }]
export const FAMILY_INVITE = { id: 'ken', name: '田中 健', rel: '息子', share: true, proxy: false }

// 家族・日記はシナリオを戻しても消えないよう flags に入れる。research は匿名化データの研究利用への同意（任意）
export const DEFAULT_FLAGS = { easy: false, gps: true, online: true, card: true, sound: true, avatar: '3d', who: 'maguro', family: FAMILY_DEFAULT, diary: DIARY_SEED, research: false, notifyAt: 2, osNotify: false }

export function createInitial(flags = DEFAULT_FLAGS) {
  return {
    flags: structuredClone(flags),
    step: 0,
    scene: 'before',
    clock: '前日 21:30',
    view: 'home',
    location: 'home',
    reception: null, // { status: 'provisional'|'confirmed', no }
    monshin: null,
    checkedIn: false,
    needManualCheckin: false,
    tasks: initialTasks(),
    queueAhead: null,
    waitPlace: null,
    called: false,
    paid: false,
    payMethod: null,
    wifi: false,
    mapTarget: null,
    familyFeed: [],
    notices: [],
    lastNotice: null,
    snsPosts: [],
    chat: [],
    alert: null, // { id, kind: 'leave', tasks: [...] }
    toast: null, // { id, text, tone }
    pending: [], // 通信なしで送れなかった送信
    logs: [],
    seq: 0,
  }
}

// ---------------------------------------------------------------------
// シナリオ（→ / ← で1ステップずつ進む。毎回「最初から再生」するので戻れる）
// ---------------------------------------------------------------------
export const STEPS = [
  { label: '前日の夜：アプリを開く', view: 'home', actions: [] },
  { label: 'マグロと話して仮受付・問診票を作る', view: 'reception', actions: [{ type: 'RECEPTION_PROVISIONAL' }] },
  { label: '翌朝 6:00 本受付に確定', view: 'home', actions: [{ type: 'RECEPTION_CONFIRM' }] },
  { label: '泉ケ丘駅から歩いて病院へ', view: 'home', actions: [{ type: 'GO_STATION' }] },
  { label: '病院に到着（自動チェックイン）', view: 'home', actions: [{ type: 'ARRIVE' }] },
  // 位置情報オフのときは、ここで 診察券での受付を済ませた扱いにして先へ進める
  { label: '案内板 3L をたどって採血へ', view: 'nav', actions: [{ type: 'MANUAL_CHECKIN', ifNeeded: true }, { type: 'GO', place: 'lab' }] },
  { label: '採血が終わる', view: 'home', actions: [{ type: 'EXAM_DONE' }] },
  { label: 'CAFE CORE で待つことにする', view: 'nav', actions: [{ type: 'WAIT_AT', place: 'cafe' }] },
  { label: '「あと2人」の予告通知', view: 'home', actions: [{ type: 'QUEUE', ahead: 2 }] },
  { label: '診察の呼び出し', view: 'home', actions: [{ type: 'CALL' }] },
  { label: '診察が終わる', view: 'pay', actions: [{ type: 'CONSULT_DONE' }] },
  { label: '支払い（カード後払い）', view: 'pay', actions: [{ type: 'PAY', method: 'auto' }] },
  { label: '帰宅：帰りのバスを確認', view: 'home', actions: [{ type: 'LEAVE' }] },
]

export const SCENE_FIRST_STEP = { before: 0, travel: 3, hospital: 4, after: 10, home: 12 }

// ---------------------------------------------------------------------
// helpers（s は reducer 内で複製済みのものを直接書き換える）
// ---------------------------------------------------------------------
function log(s, src, msg, kind = 'event') {
  s.seq++
  s.logs.push({ id: s.seq, clock: s.clock, src, msg, kind })
}

// 外部システムへの送信。通信がなければ送信待ちに積む。
function send(s, src, msg) {
  if (s.flags.online) log(s, src, msg, 'api')
  else {
    s.pending.push({ src, msg })
    log(s, SYS.app, `通信なし → 送信待ちに保存：${msg}`, 'queued')
  }
}

function toast(s, text, tone = 'info') {
  s.seq++
  s.toast = { id: s.seq, text, tone }
}

// 病院から届く「お知らせ」（ベルの一覧に残る・許可があれば端末の通知にも出す）。
// シナリオ再生で過去の段階を作り直しているときは、端末への通知は出さない（fresh=false）
function notice(s, text, { tone = 'info', view = null } = {}) {
  s.seq++
  const n = { id: s.seq, clock: s.clock, text, tone, view, fresh: !s.replaying }
  s.notices.push(n)
  if (n.fresh) s.lastNotice = n
}

function warn(s, msg) {
  log(s, SYS.app, msg, 'warn')
}

export const openTasks = (s) => s.tasks.filter((t) => t.status === 'todo')

// ---------------------------------------------------------------------
// 出来事 → state
// ---------------------------------------------------------------------
function apply(s, a) {
  switch (a.type) {
    case 'VIEW':
      s.view = a.view
      if (a.view === 'card') log(s, SYS.app, '診察券（バーコード）を表示：端末に保存済みなので通信なしでも出せる・画面の明るさを最大に')
      if (a.target !== undefined) s.mapTarget = a.target
      return

    case 'MAP_TARGET':
      s.mapTarget = a.id
      log(s, SYS.app, `院内マップ：現在地 → ${a.name} のルートを表示（模式図）`)
      return

    case 'TOGGLE': {
      const k = a.flag
      s.flags[k] = !s.flags[k]
      const labels = {
        easy: ['やさしい表示', '文字を大きく・ひらがな多めに'],
        gps: ['位置情報', '自動チェックイン・帰宅防止に使う'],
        online: ['通信', ''],
        card: ['カード登録', '後払いの可否'],
        sound: ['音声読み上げ', ''],
      }
      log(s, SYS.debug, `${labels[k][0]} を ${s.flags[k] ? 'ON' : 'OFF'}${labels[k][1] ? `（${labels[k][1]}）` : ''}`, 'debug')
      if (k === 'online' && s.flags.online && s.pending.length) {
        log(s, SYS.app, `通信が戻った → 送信待ち ${s.pending.length} 件を再送`, 'event')
        s.pending.forEach((p) => log(s, p.src, `（再送）${p.msg}`, 'api'))
        s.pending = []
      }
      if (k === 'gps' && !s.flags.gps) warn(s, '位置情報なし：自動チェックイン・帰宅防止アラートは使えない → 診察券のバーコードで受付する方法に切り替える')
      if (k === 'easy' && s.flags.easy && s.flags.avatar === '3d') {
        s.flags.avatar = '2d'
        log(s, SYS.app, 'やさしい表示では AI の案内役を 3D → 2D に切り替え（動きが少なく見やすい・古いスマホでも軽い）')
      }
      return
    }

    // AI 案内役の見た目：chat（テキスト）／2d／3d、キャラ：maguro／mammoth
    case 'AVATAR': {
      const order = s.flags.easy ? ['chat', '2d'] : ['chat', '2d', '3d']
      let mode = a.mode ?? order[(order.indexOf(s.flags.avatar) + 1) % order.length]
      if (mode === '3d' && s.flags.easy) mode = '2d'
      s.flags.avatar = mode
      if (a.who) s.flags.who = a.who
      if (mode === '3d') s.flags.who = 'maguro'
      const names = { chat: 'テキスト', '2d': '2D', '3d': '3D' }
      log(s, SYS.debug, `AI の案内役を「${names[mode]}・${s.flags.who === 'maguro' ? '近大マグロ' : 'マンモス'}」に`, 'debug')
      return
    }

    case 'RECEPTION_PROVISIONAL':
      if (s.reception) return
      log(s, SYS.ai, '音声「明日の受付をしておくね。気になる症状はある？」→「ひざが痛い」を聞き取り')
      s.monshin = buildMonshin(s.flags.diary, 'ひざが痛くて、夜に目が覚めることがある')
      log(s, SYS.ai, `体調日記 ${s.monshin?.sources ?? 0} 件＋会話 → 問診票の下書きを生成（主訴・経過・随伴症状）`)
      s.reception = { status: 'provisional', no: '仮-0412' }
      send(s, SYS.rsv, '仮受付を登録：明日 9:30 循環器内科（夜間は仮受付 → 6:00 に本受付）')
      send(s, SYS.emr, '問診票の下書きを送信（医師が確認するまで確定しない）')
      toast(s, '仮受付しました。明日の朝6時に本受付になります')
      notice(s, '仮受付しました。明日の朝6時に本受付になります（受付番号は朝にお知らせします）', { view: 'reception' })
      return

    case 'RECEPTION_CONFIRM':
      s.clock = '当日 6:00'
      if (!s.reception) {
        warn(s, '受付していないので本受付はスキップ')
        return
      }
      s.reception = { status: 'confirmed', no: 'A-0123' }
      send(s, SYS.rsv, '本受付に確定：受付番号 A-0123')
      notifyFamily(s, '今日 9:30 循環器内科の受付が確定しました')
      log(s, SYS.push, '通知「受付が確定しました。受付番号 A-0123」')
      toast(s, '受付が確定しました（受付番号 A-0123）')
      notice(s, '本受付が確定しました。受付番号 A-0123・9:30 循環器内科', { view: 'home' })
      return

    case 'GO_STATION':
      s.scene = 'travel'
      s.clock = '当日 8:48'
      s.location = 'station'
      if (s.flags.gps) log(s, SYS.loc, 'GPS：泉ケ丘駅付近 → 「移動中」の表示に切り替え')
      else log(s, SYS.app, '位置情報なし → 予約時刻の1時間前なので「移動中」の表示に切り替え')
      send(s, SYS.transit, '泉ケ丘駅 → 病院：徒歩ルート（550m・約6分）と、バス 270・213系統の発車時刻を取得')
      return

    case 'ARRIVE':
      s.scene = 'hospital'
      s.clock = '当日 8:58'
      s.location = 'entrance'
      if (s.flags.gps) {
        log(s, SYS.loc, 'ジオフェンス：病院の敷地に入った')
        log(s, SYS.loc, 'ビーコン：1号館（外来棟）入口')
        doCheckin(s, '自動')
        toast(s, 'おはようございます。到着を受け付けました')
        notice(s, '到着を受け付けました。まず 2号館 3F の採血（3L）へどうぞ', { view: 'nav' })
      } else {
        s.needManualCheckin = true
        warn(s, '位置情報なし → 自動チェックインできない。総合受付前の自動受付機にアプリの診察券をかざすよう案内')
      }
      return

    case 'MANUAL_CHECKIN':
      if (s.checkedIn || (a.ifNeeded && !s.needManualCheckin)) return
      s.scene = 'hospital'
      s.location = 'entrance'
      log(s, SYS.loc, '総合受付前の自動受付機に、アプリの診察券（バーコード）をかざした')
      doCheckin(s, '診察券バーコード')
      toast(s, '到着を受け付けました')
      return

    case 'GO': {
      s.location = a.place
      const next = openTasks(s)[0]
      log(s, SYS.loc, `ビーコン：${PLACES[a.place]}`)
      if (a.place === 'lab') {
        send(s, SYS.rsv, '採血受付に到着を通知（受付票の発行不要）')
        s.clock = '当日 9:05'
      }
      if (next && next.place !== a.place && a.place !== 'cafe' && a.place !== 'info' && a.place !== 'waiting')
        warn(s, `次の行き先は ${PLACES[next.place]} → ルート案内を出し直す`)
      return
    }

    case 'EXAM_DONE': {
      const t = s.tasks.find((x) => x.id === 'blood')
      if (t.status !== 'todo') {
        log(s, SYS.debug, '採血はすでに完了しています', 'debug')
        return
      }
      t.status = 'done'
      s.clock = '当日 9:20'
      send(s, SYS.emr, '採血：実施済み')
      log(s, SYS.app, 'やること を更新：残り「循環器内科 診察」')
      if (s.checkedIn) s.queueAhead = 4
      toast(s, '採血おつかれさまでした。診察まで好きな場所で待てます')
      notice(s, '採血が終わりました。診察まで好きな場所で待てます（呼ばれる前にお知らせします）', { view: 'queue' })
      return
    }

    case 'WAIT_AT':
      s.waitPlace = a.place
      s.location = a.place
      log(s, SYS.loc, `ビーコン：${PLACES[a.place]}`)
      send(s, SYS.rsv, `待つ場所を登録：${PLACES[a.place]}（呼び出しはプッシュ通知で）`)
      if (a.place === 'cafe') log(s, SYS.app, 'CAFE CORE の混み具合と、アプリ利用者クーポン（提案）を表示')
      return

    case 'QUEUE': {
      if (!s.checkedIn) return warn(s, 'まだ到着していないので順番がない')
      if (s.called) return warn(s, 'すでに呼ばれています')
      // ahead：その人数にする／dec：1人進める（N キー）
      const ahead = a.dec ? Math.max(1, (s.queueAhead ?? 5) - a.dec) : a.ahead
      s.queueAhead = ahead
      s.clock = a.dec ? s.clock : '当日 9:50'
      send(s, SYS.rsv, `順番の更新を受信：あと ${ahead} 人`)
      if (ahead <= s.flags.notifyAt) {
        log(s, SYS.push, `通知「あと ${ahead} 人です。そろそろ ${PLACES.cardio} へ」（あと ${s.flags.notifyAt} 人で知らせる設定・移動時間を見込んで早めに）`)
        toast(s, `あと ${ahead} 人です。そろそろ戻りましょう（移動時間を見込んでお知らせしています）`, 'call')
        notice(s, `診察まであと ${ahead} 人です。そろそろ 1号館 3F 循環器内科（3B）へお戻りください`, { tone: 'call', view: 'queue' })
      }
      return
    }

    case 'OS_NOTIFY':
      s.flags.osNotify = a.on
      log(s, SYS.push, a.on ? '端末の通知を許可：お知らせを端末の通知にも出す（ブラウザの通知機能）' : '端末への通知をオフ', 'debug')
      return

    case 'NOTIFY_AT':
      s.flags.notifyAt = a.n
      log(s, SYS.app, `呼び出しの予告を「あと ${a.n} 人」に設定`)
      return

    case 'CALL':
      if (!s.checkedIn) return warn(s, 'まだ到着していないので呼び出せない（自動チェックインされていない）')
      if (s.tasks.find((x) => x.id === 'consult').status !== 'todo') return warn(s, '診察は終わっています')
      s.clock = '当日 10:00'
      s.queueAhead = 0
      s.called = true
      send(s, SYS.rsv, '呼び出しを受信：診察室 3 番')
      log(s, SYS.push, '通知「田中さん、診察の順番です。循環器内科（3B）診察室 3番 へ」＋バイブ')
      notifyFamily(s, '診察が始まります（循環器内科）')
      if (s.waitPlace && s.waitPlace !== 'waiting') log(s, SYS.app, `${PLACES[s.waitPlace]} → ${PLACES.cardio} のルートを表示`)
      toast(s, '診察の順番です。循環器内科（3B）診察室 3番 へお入りください', 'call')
      notice(s, '診察の順番です。循環器内科（3B）診察室 3番 へお入りください', { tone: 'call', view: 'queue' })
      return

    case 'CONSULT_DONE': {
      const t = s.tasks.find((x) => x.id === 'consult')
      if (!s.checkedIn) return warn(s, 'まだ到着していない')
      t.status = 'done'
      s.scene = 'after'
      s.clock = '当日 10:20'
      s.location = 'cardio'
      s.called = false
      s.queueAhead = null
      if (s.monshin) s.monshin.status = 'confirmed'
      send(s, SYS.emr, '診察終了。問診票を医師が確認済みに')
      notifyFamily(s, '診察が終わりました。次はお会計です')
      send(s, SYS.pay, `会計金額が確定：${BILL.total.toLocaleString()} 円`)
      if (openTasks(s).length) warn(s, `まだ未完了：${openTasks(s).map((x) => x.name).join('・')}`)
      log(s, SYS.push, '通知「お会計の準備ができました」')
      notice(s, `お会計の準備ができました（${BILL.total.toLocaleString()} 円）`, { view: 'pay' })
      return
    }

    case 'PAY': {
      if (s.paid) return
      if (s.scene !== 'after' && s.scene !== 'home') return warn(s, 'まだ会計の金額が出ていない')
      if (openTasks(s).length) return warn(s, `未完了の検査があるので会計できない：${openTasks(s).map((x) => x.name).join('・')}`)
      let m = a.method
      if (m === 'auto') m = s.flags.card ? 'card' : 'counter'
      if (m === 'card' && !s.flags.card) return warn(s, 'カード未登録 → 後払いは使えない。登録サポート窓口（提案） or 窓口払いを案内')
      s.payMethod = m
      s.clock = '当日 10:25'
      if (m === 'card') {
        send(s, SYS.pay, `登録カードで後払いを予約：${BILL.total.toLocaleString()} 円（受診の5日後に引き落とし）`)
        log(s, SYS.app, '会計窓口に並ばずに帰れる')
      } else if (m === 'applepay') {
        send(s, SYS.pay, `Apple Pay で支払い：${BILL.total.toLocaleString()} 円`)
      } else {
        log(s, SYS.app, '総合受付前の会計・自動支払機を案内（アプリ利用者用の水色ファイルを渡す・提案）')
        send(s, SYS.pay, '窓口で支払い済みの連絡を受信')
      }
      s.paid = true
      send(s, SYS.pay, '領収書・明細の PDF を発行 → アプリに保存')
      notifyFamily(s, `お会計が済みました（${BILL.total.toLocaleString()} 円）`)
      toast(s, 'お支払いが完了しました。領収書はアプリに保存されています')
      notice(s, 'お支払いが完了しました。領収書はアプリに保存されています', { view: 'receipts' })
      return
    }

    case 'LEAVE': {
      s.location = 'exit'
      log(s, SYS.loc, 'ビーコン：出口付近へ移動')
      const open = openTasks(s)
      if (open.length && (s.scene === 'hospital' || s.scene === 'after')) {
        if (!s.flags.gps) {
          warn(s, `未完了「${open.map((x) => x.name).join('・')}」があるが、位置情報なしで出口を検知できない → 帰宅防止アラートは出ない（だから位置情報の許可を初回に案内する）`)
          return
        }
        s.seq++
        s.alert = { id: s.seq, kind: 'leave', tasks: open.map((x) => x.id) }
        notice(s, `まだ ${open[0].name}が残っています！お帰りの前にご確認ください`, { tone: 'urgent', view: 'nav' })
        warn(s, `未完了「${open.map((x) => x.name).join('・')}」のまま出口へ → 帰宅防止アラート（画面＋音声）`)
        log(s, SYS.push, `通知「田中さん、まだ ${open[0].name} が残っています！」`)
        notifyFamily(s, `⚠ ${open[0].name}が残ったまま出口へ向かっています。電話で声をかけてください`, true)
        return
      }
      s.scene = 'home'
      s.clock = '当日 10:35'
      if (!s.paid) log(s, SYS.app, '会計は後日カードで引き落とし（またはアプリで支払い）')
      send(s, SYS.transit, '病院 → 泉ケ丘駅：徒歩約6分／バスの発車時刻を取得')
      log(s, SYS.app, '表示を「帰宅」に切り替え：次回予約・領収書・帰りのバス')
      notifyFamily(s, '病院を出ました。お迎え・帰りのバスの時刻を確認できます')
      toast(s, 'おつかれさまでした。お大事に')
      notice(s, 'おつかれさまでした。次回は 11月20日 9:30 です。お大事に', { view: 'home' })
      return
    }

    case 'ALERT_GUIDE':
      s.alert = null
      s.view = 'nav'
      log(s, SYS.app, `${PLACES[openTasks(s)[0]?.place] ?? ''} へのルート案内を表示`)
      return

    case 'ALERT_SKIP': {
      s.alert = null
      const open = openTasks(s)
      open.forEach((t) => (t.status = 'skipped'))
      send(s, SYS.rsv, `本日は「${open.map((x) => x.name).join('・')}」を受けずに帰る旨を担当部署へ連絡（再予約の候補を返信）`)
      toast(s, '病院に連絡しました。あとで再予約のご案内が届きます')
      notice(s, `${open.map((x) => x.name).join('・')}の再予約のご案内：アプリから日時を選べます`, { view: 'reception' })
      return
    }

    case 'PARKING':
      send(s, SYS.rsv, '駐車券の番号を受付に登録 → 外来患者の割引を自動で適用（提案）')
      toast(s, '駐車券の割引を登録しました')
      return

    case 'MED_TAKEN':
      log(s, SYS.app, `服薬を記録：${a.what}（飲み忘れが続くと次回の問診票に反映・提案）`)
      return

    case 'FAMILY_ADD':
      if (s.flags.family.some((f) => f.id === FAMILY_INVITE.id)) return
      s.flags.family.push({ ...FAMILY_INVITE })
      send(s, SYS.app, `招待コードで ${FAMILY_INVITE.name}さん（${FAMILY_INVITE.rel}）と連携（本人の同意を確認済み）`)
      toast(s, `${FAMILY_INVITE.name}さんと連携しました`)
      return

    case 'FAMILY_SET': {
      const f = s.flags.family.find((x) => x.id === a.id)
      if (!f) return
      f[a.key] = !f[a.key]
      const label = { share: '通知の共有', proxy: '代わりに受付・支払い' }[a.key]
      log(s, SYS.family, `${f.name}さん：${label}を ${f[a.key] ? 'ON' : 'OFF'}`, 'debug')
      return
    }

    case 'FAMILY_REMOVE':
      s.flags.family = s.flags.family.filter((x) => x.id !== a.id)
      log(s, SYS.family, '家族との連携を解除', 'debug')
      return

    case 'WIFI':
      if (s.wifi) {
        s.wifi = false
        log(s, SYS.app, '院内Wi-Fi の自動接続をオフ', 'debug')
        return
      }
      s.wifi = true
      log(s, SYS.app, '院内 Free Wi-Fi の設定プロファイルを適用（パスワード入力なし）')
      toast(s, '院内Wi-Fiにつながりました')
      return

    case 'DIARY_ADD': {
      const e = { ...a.entry, id: Date.now(), date: '今日' }
      s.flags.diary = [...s.flags.diary.filter((r) => r.date !== '今日'), e]
      const desc = [e.mood, ...e.parts, ...e.sym, e.level ? `つらさ${e.level}` : ''].filter(Boolean).join('・')
      send(s, SYS.app, `体調日記を保存：${desc}${e.note ? `「${e.note}」` : ''}${e.voice ? '（声で入力）' : ''}`)
      if (s.flags.research) log(s, SYS.app, '研究利用に同意済み → 氏名などを除いて匿名化したデータを研究用に登録（提案）')
      if (s.monshin && s.monshin.status === 'draft') {
        s.monshin = { ...buildMonshin(s.flags.diary), sent: false }
        log(s, SYS.ai, '新しい記録を問診票の下書きに反映')
      }
      toast(s, '今日の記録をつけました')
      return
    }

    case 'DIARY_VOICE':
      log(s, SYS.ai, `音声メモを文字に変換：「${a.text}」（端末内で変換する想定）`)
      return

    case 'MAKE_MONSHIN':
      s.monshin = buildMonshin(s.flags.diary)
      if (s.monshin) log(s, SYS.ai, `体調日記 ${s.monshin.sources} 件 → 問診票の下書きを生成（主訴・経過・随伴症状。診断はしない）`)
      return

    case 'MONSHIN_SEND':
      if (!s.monshin) return
      s.monshin.sent = true
      send(s, SYS.emr, '問診票の下書きを担当医へ共有（電子カルテの問診欄に取り込み、医師が確認して確定）')
      toast(s, '問診票を医師に渡しました。診察前ならまだ直せます')
      return

    case 'SNS_POST':
      s.seq++
      s.snsPosts.unshift({ id: `p${s.seq}`, name: 'あなた（ニックネーム）', topic: a.topic, time: 'いま', text: a.text, r: { help: 0, me: 0, like: 0 } })
      log(s, SYS.ai, '院内SNS：投稿を確認（名前・電話番号などの個人情報、誤った医療情報がないか）→ 問題なしで公開')
      return

    case 'RESEARCH':
      s.flags.research = !s.flags.research
      log(s, SYS.debug, `医療データの研究利用（匿名化）への同意を ${s.flags.research ? 'ON' : 'OFF'}`, 'debug')
      return

    case 'ASK': {
      s.chat.push({ role: 'user', text: a.q })
      s.chat.push({ role: 'ai', text: a.answer })
      log(s, SYS.ai, `よくある質問に回答：「${a.q}」（院内マニュアルから回答・職員の電話対応を減らす）`)
      if (a.then) apply(s, a.then)
      return
    }

    case 'RECEIPT':
      log(s, SYS.app, a.how === 'pdf' ? '領収書 PDF を端末に保存' : 'コンビニ印刷用の予約番号を発行（例：AB12CD）')
      toast(s, a.how === 'pdf' ? 'PDF を保存しました' : 'コンビニで印刷できます（予約番号 AB12CD）')
      return

    case 'CLEAR_TOAST':
      if (s.toast?.id === a.id) s.toast = null
      return

    default:
      return
  }
}

// 家族連携：通知を共有している家族へ送る（家族のスマホにプッシュ通知する想定）
function notifyFamily(s, msg, urgent = false) {
  const to = (s.flags.family || []).filter((f) => f.share)
  if (!to.length) return
  s.seq++
  s.familyFeed.push({ id: s.seq, clock: s.clock, msg, urgent })
  send(s, SYS.family, `${to.map((f) => `${f.name.split(' ')[1]}さん（${f.rel}）`).join('・')}へ通知「${msg}」`)
}

function doCheckin(s, how) {
  s.checkedIn = true
  s.needManualCheckin = false
  s.queueAhead = 5
  send(s, SYS.rsv, `到着を登録（${how}・診察券スキャン不要）：受付番号 ${s.reception?.no ?? '当日受付'}`)
  log(s, SYS.app, `やること：${openTasks(s).map((t) => t.name).join(' → ')}（検査が先）`)
  notifyFamily(s, '病院に着きました（受付済み）')
}

// ---------------------------------------------------------------------
function goto(state, n) {
  const k = Math.max(0, Math.min(STEPS.length - 1, n))
  const s = createInitial(state.flags)
  for (let i = 0; i <= k; i++) {
    s.replaying = i < k // 今回の段階より前は「作り直し」なので端末通知は出さない
    log(s, SYS.step, `▶ ${i + 1}. ${STEPS[i].label}`, 'step')
    if (i === k) s.toast = null // 再生で出たトーストは最後のステップのものだけ見せる
    STEPS[i].actions.forEach((a) => apply(s, a))
  }
  s.replaying = false
  s.step = k
  s.view = STEPS[k].view
  return s
}

export function reducer(state, action) {
  switch (action.type) {
    case 'GOTO':
      return goto(state, action.n)
    case 'NEXT':
      return goto(state, state.step + 1)
    case 'PREV':
      return goto(state, state.step - 1)
    case 'RESET':
      return goto({ flags: state.flags }, 0)
    case 'SCENE':
      return goto(state, SCENE_FIRST_STEP[action.scene])
    // 提案資料の項目から、その場面へ飛ぶ（段階・設定・画面・スクロール位置）
    case 'JUMP': {
      const j = action.jump
      // ほかの項目で変えた設定を引きずらないよう、毎回ふつうの状態から（項目が指定したものだけ変える）
      const base = { easy: false, card: true, gps: true, online: true }
      const s = goto({ flags: { ...state.flags, ...base, ...(j.flags || {}) } }, j.step ?? state.step)
      log(s, SYS.step, `📌 提案資料 ${action.slide}「${action.title}」へジャンプ`, 'step')
      ;(j.actions || []).forEach((a) => apply(s, a))
      s.view = j.view ?? s.view
      // seq は再生で同じ値になりうるので、毎回かならず変わる値にする（同じ段階へ続けて飛んでもスクロールさせる）
      s.anchor = j.anchor ? { id: j.anchor, seq: Date.now() + Math.random() } : null
      return s
    }
    default: {
      const s = structuredClone(state)
      apply(s, action)
      return s
    }
  }
}

export const init = () => goto({ flags: DEFAULT_FLAGS }, 0)
