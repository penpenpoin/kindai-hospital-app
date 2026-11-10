import { MessagesSquare, IdCard, Footprints, Users, ChevronRight, TriangleExclamationPoint, Map, ClipboardList, CreditCard, Activity, Bus, Car, Wifi, WifiOff, Check, Mic, Coffee, FileText, MapPin, Sparkles, Pill, Receipt, Store, Siren } from 'lucide-react'
import { useSim } from '../sim/context.js'
import { PLACES, openTasks, BILL } from '../sim/model.js'
import { Card, Sign, Btn, Demo } from '../components/ui.jsx'
import Barcode, { PATIENT } from '../components/Barcode.jsx'
import { faqs } from './AIView.jsx'

// ---------------------------------------------------------------
// 一番上の「いまの状況」カード（場面ごとに中身が入れ替わる）
// ---------------------------------------------------------------
function StatusCard() {
  const { s, d, t } = useSim()
  const chip = { before: '来院前', travel: '移動中', hospital: t('近大病院 滞在中', '病院にいます'), after: t('診察が終わりました', 'おわりました'), home: 'お帰りなさい' }[s.scene]
  const greeting = { before: 'こんばんは', travel: 'おはようございます', hospital: t('ご来院ありがとうございます', 'こんにちは'), after: 'おつかれさまでした', home: 'お大事に' }[s.scene]

  let inner
  if (s.scene === 'before') {
    inner = s.reception ? (
      <Row icon={<Check size={20} />} label={s.reception.status === 'confirmed' ? '受付が確定しました' : t('仮受付済み（翌朝6時に本受付）', 'うけつけ できました')}>
        受付番号 <span className="text-2xl">{s.reception.no}</span>
      </Row>
    ) : (
      <Row icon={<ClipboardList size={20} />} label={t('明日 9:30 循環器内科', 'あした 9:30')} onClick={() => d({ type: 'VIEW', view: 'reception' })}>
        {t('まだ受付していません', 'まだ うけつけ していません')}
      </Row>
    )
  } else if (s.scene === 'travel') {
    inner = (
      <Row icon={<Footprints size={20} />} label="泉ケ丘駅 → 病院（550m）">
        歩いて <span className="text-2xl">約6分</span>
        <span className="block text-[11px] font-normal text-brand-100">{t('病院に着いたら自動で受付します', 'ついたら じどうで うけつけ')}</span>
      </Row>
    )
  } else if (s.scene === 'hospital') {
    if (s.needManualCheckin)
      inner = (
        <Row icon={<IdCard size={20} />} label={t('位置情報がオフ：総合受付前の自動受付機へ', 'うけつけき へ')} onClick={() => d({ type: 'MANUAL_CHECKIN' })}>
          {t('受付機に診察券（アプリ）をかざす', 'しんさつけんを かざす')}
        </Row>
      )
    else if (!s.checkedIn)
      inner = (
        <Row icon={<MapPin size={20} />} label="到着前">
          病院に近づくと自動で受付
        </Row>
      )
    else if (s.called)
      inner = (
        <Row icon={<Users size={20} />} label={t('診察の順番です', 'あなたの ばんです')} pulse onClick={() => d({ type: 'VIEW', view: 'queue' })}>
          3B 循環器内科 <span className="text-2xl">3番</span>
        </Row>
      )
    else
      inner = (
        <Row icon={<Users size={20} />} tour="queue-row" label={t('現在の待ち状況（タップで詳しく）', 'まっている人')} onClick={() => d({ type: 'VIEW', view: 'queue' })}>
          あと <span className="text-2xl">{s.queueAhead}</span> 人
          {s.waitPlace && <span className="block text-[11px] font-normal text-brand-100">{PLACES[s.waitPlace]}で待機中・呼ばれたら通知</span>}
        </Row>
      )
  } else if (s.scene === 'after') {
    inner = (
      <Row icon={<CreditCard size={20} />} label={s.paid ? 'お支払い' : t('お会計', 'おかね')} onClick={() => d({ type: 'VIEW', view: 'pay' })}>
        {s.paid ? '完了しました' : <>{BILL.total.toLocaleString()} <span className="text-base">円</span></>}
      </Row>
    )
  } else {
    inner = (
      <Row icon={<ClipboardList size={20} />} label={t('次回の予約', 'つぎの よやく')}>
        11月20日（木）<span className="text-2xl">9:30</span>
      </Row>
    )
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-brand-600 to-brand-500 rounded-[2.5rem] p-6 shadow-2xl shadow-brand-200 text-white">
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-5 gap-2">
          <div>
            <p className="text-brand-100 text-xs font-bold tracking-wider mb-1">{greeting}</p>
            <h2 className="text-2xl font-bold tracking-tight">{t('田中 太郎 様', '田中さん')}</h2>
          </div>
          <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap">{chip}</div>
        </div>
        {inner}
      </div>
    </div>
  )
}

function Row({ icon, label, children, onClick, pulse, tour }) {
  return (
    <button
      data-tour={tour}
      onClick={onClick}
      disabled={!onClick}
      className={`w-full text-left bg-white/15 backdrop-blur-md rounded-2xl p-4 flex justify-between items-center border border-white/20 ${pulse ? 'animate-pulse' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div className="bg-white text-brand-600 w-10 h-10 rounded-full flex items-center justify-center shadow-lg shrink-0">{icon}</div>
        <div>
          <p className="text-[10px] text-brand-100 font-bold">{label}</p>
          <p className="font-bold text-lg leading-tight">{children}</p>
        </div>
      </div>
      {onClick && <ChevronRight className="text-white/50 shrink-0" />}
    </button>
  )
}

// ---------------------------------------------------------------
// 「いま やること」：画面を開いた瞬間に次の行動が1つだけ分かる
// ---------------------------------------------------------------
function NextAction() {
  const { s, d, t } = useSim()
  const open = openTasks(s)
  let a = null
  if (s.scene === 'before' && !s.reception)
    a = { icon: <Mic size={18} />, text: t('マグロと話して受付する', 'はなして うけつけ'), sub: t('夜でも受付できます（翌朝6時に本受付）', 'よるでも できます'), go: () => d({ type: 'VIEW', view: 'reception' }) }
  else if (s.scene === 'before')
    a = { icon: <Activity size={18} />, text: t('今日の体調を記録する', 'きょうの ちょうしを つける'), sub: t('記録は問診票づくりに使われます', ''), go: () => d({ type: 'VIEW', view: 'records' }) }
  else if (s.scene === 'travel') a = { icon: <Footprints size={18} />, text: t('けやき橋を渡って病院へ', 'あるいて びょういんへ'), sub: t('泉ケ丘駅の改札から 550m・約6分', 'やく6ぷん'), go: null }
  else if (s.scene === 'hospital' && s.called) a = { sign: 'cardio', text: t('循環器内科（3B）診察室 3番へ', 'しんさつしつ 3番へ'), sub: t('1号館 3F・案内板の 3B（青）をたどってください', 'あおい 3B の かんばん'), go: () => d({ type: 'VIEW', view: 'nav' }) }
  else if (s.scene === 'hospital' && open[0]?.id === 'blood')
    a = { sign: 'lab', text: t('採血・生理検査（3L）へ', '血をとる部屋へ'), sub: t('2号館 3F・案内板の 3L（赤）をたどってください', 'あかい 3L の かんばん'), go: () => d({ type: 'VIEW', view: 'nav' }) }
  else if (s.scene === 'hospital') a = { icon: <Coffee size={18} />, text: t('好きな場所で待つ', 'すきな ところで まつ'), sub: t('順番が近づいたら通知します', 'よびだしが きます'), go: () => d({ type: 'VIEW', view: 'nav' }) }
  else if (s.scene === 'after' && open.length) a = { sign: open[0].place, text: t(`${open[0].name}が残っています`, 'まだ のこっています'), sub: '', go: () => d({ type: 'VIEW', view: 'nav' }) }
  else if (s.scene === 'after' && !s.paid) a = { icon: <CreditCard size={18} />, text: t('お支払いをする', 'おかねを はらう'), sub: s.flags.card ? t('カード登録済み：そのまま帰れます', '') : t('総合受付前の会計・自動支払機でも払えます', ''), go: () => d({ type: 'VIEW', view: 'pay' }) }
  else if (s.scene === 'after') a = { sign: 'exit', text: t('お帰りはこちら', 'でぐち'), sub: '泉ケ丘駅まで徒歩 約6分', go: () => d({ type: 'LEAVE' }) }
  else a = { icon: <FileText size={18} />, text: t('領収書を見る', 'りょうしゅうしょ'), sub: 'PDF で保存・コンビニ印刷', go: () => d({ type: 'VIEW', view: 'pay' }) }

  return (
    <button onClick={a.go ?? undefined} className="w-full bg-white rounded-3xl p-4 flex items-center gap-4 shadow-xl shadow-slate-200/50 border-2 border-brand-100 text-left active:scale-[.99] transition-all">
      {a.sign ? <Sign id={a.sign} size="sm" /> : <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">{a.icon}</div>}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black text-brand-500 tracking-widest">{t('いま やること', 'つぎは これ')}</p>
        <p className="font-bold text-slate-800 leading-snug">{a.text}</p>
        {a.sub && <p className="text-xs text-slate-500">{a.sub}</p>}
      </div>
      {a.go && <ChevronRight className="text-slate-300 shrink-0" />}
    </button>
  )
}

function TodayTasks() {
  const { s, t } = useSim()
  return (
    <Card>
      <p className="text-xs font-bold text-slate-400 mb-3">{t('今日の予定', 'きょう やること')}</p>
      <div className="space-y-2">
        {s.tasks.map((x, i) => (
          <div key={x.id} className={`flex items-center gap-3 p-2.5 rounded-2xl ${x.status === 'todo' ? 'bg-slate-50' : 'opacity-50'}`}>
            <span className="text-xs font-black text-slate-300 w-4">{i + 1}</span>
            <Sign id={x.place} />
            <div className="flex-1">
              <p className={`text-sm font-bold text-slate-800 ${x.status !== 'todo' ? 'line-through' : ''}`}>{t(x.name, x.easy)}</p>
              <p className="text-[11px] text-slate-500">{PLACES[x.place]}</p>
            </div>
            {x.status === 'done' && <Check size={18} className="text-emerald-500" />}
            {x.status === 'skipped' && <span className="text-[10px] font-bold text-slate-400">再予約</span>}
          </div>
        ))}
      </div>
    </Card>
  )
}

function Transit({ back }) {
  const { t } = useSim()
  // 徒歩・バス系統・駐車料金は近大病院の公式「交通アクセス」より。バスの時刻はデモ用の例。
  const rows = back
    ? [
        [Footprints, '徒歩', '病院 → 泉ケ丘駅（550m）', ['約6分', '']],
        [Bus, '路線バス', t('ロータリーのバス停（270・213系統）', 'バス'), ['10:41', '10:56']],
      ]
    : [
        [Footprints, '徒歩', t('泉ケ丘駅 → 病院（550m）', 'えきから あるく'), ['約6分', '']],
        [Bus, '路線バス', t('泉ケ丘駅 → 病院（270・213系統）', 'バス'), ['8:41', '8:56']],
        [Bus, '自動運転バス', t('自宅前 → 病院（将来構想）', 'いえ → びょういん'), ['—', '']],
      ]
  return (
    <Card>
      <p className="text-xs font-bold text-slate-400 mb-3">{back ? t('帰りの交通', 'かえりの みち') : t('病院への行き方と時刻', 'びょういんへの いきかた')}</p>
      <div className="space-y-3">
        {rows.map(([Icon, k, sub, times]) => (
          <div key={k} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800">{k}</p>
              <p className="text-[11px] text-slate-500 truncate">{sub}</p>
            </div>
            <div className="text-right font-bold tabular-nums">
              <p className="text-slate-800">{times[0]}</p>
              <p className="text-[11px] text-slate-400">{times[1]}</p>
            </div>
          </div>
        ))}
        {!back && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
              <Car size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800">自家用車</p>
              <p className="text-[11px] text-slate-500">外来の日は 15分100円・当日最大 1,000円（駐車券を院内で割引処理）</p>
            </div>
          </div>
        )}
        <p className="text-[10px] text-slate-400">バスの時刻はデモ用の例です</p>
      </div>
    </Card>
  )
}

// バーコードのすぐ下に並ぶ、よく使う4つ
const ACTIONS = [
  { view: 'reception', Icon: ClipboardList, label: ['受付', 'うけつけ'] },
  { view: 'nav', Icon: Map, label: ['院内案内', 'あんない'] },
  { view: 'pay', Icon: CreditCard, label: ['支払い', 'しはらい'] },
  { view: 'ai', emoji: '🐟', label: ['AIに相談', 'そうだん'] },
]

// サービス一覧（小さなアイコンを並べる）。ask は AI に質問した状態で開く
const SERVICES = [
  { Icon: MessagesSquare, color: 'text-brand-600', label: ['みんなの広場', 'ひろば'], view: 'community', easyAlt: { Icon: Map, label: ['院内マップ', 'ちず'], view: 'map' } },
  { Icon: Activity, color: 'text-purple-500', label: ['体調日記', 'にっき'], view: 'records' },
  { Icon: Pill, color: 'text-sky-500', label: ['お薬', 'くすり'], view: 'meds' },
  { Icon: Receipt, color: 'text-amber-500', label: ['領収書', 'りょうしゅう'], view: 'receipts' },
  { Icon: Users, color: 'text-emerald-500', label: ['家族連携', 'かぞく'], view: 'account' },
  { Icon: Car, color: 'text-slate-500', label: ['駐車場', 'ちゅうしゃ'], view: 'parking' },
  { Icon: Store, color: 'text-orange-500', label: ['カフェ・売店', 'おみせ'], view: 'shops' },
  { Icon: Siren, color: 'text-rose-500', label: ['救急外来', 'きゅうきゅう'], view: 'er' },
]

function HeroCard() {
  const { d, t } = useSim()
  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
      {/* 診察券：開いた瞬間に一番上に見える。タップで大きく表示 */}
      <button onClick={() => d({ type: 'VIEW', view: 'card' })} className="w-full text-left px-5 pt-4 pb-3 active:bg-slate-50">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
            <IdCard size={16} className="text-brand-600" /> {t('診察券', 'しんさつけん')}
          </p>
          <p className="text-[11px] font-bold text-brand-600 flex items-center">
            {t('タップで大きく', 'おすと おおきく')} <ChevronRight size={14} />
          </p>
        </div>
        <Barcode className="w-full h-16" />
        <div className="flex justify-between items-center mt-1.5">
          <p className="font-mono font-bold text-slate-800 tracking-[0.25em]">{PATIENT.no}</p>
          <p className="text-[10px] text-slate-400">{t('受付機・支払機にかざす', 'きかいに かざす')}</p>
        </div>
      </button>
      <div className="grid grid-cols-4 border-t border-slate-100 py-3">
        {ACTIONS.map((a) => (
          <button key={a.view} data-tour={`act-${a.view}`} onClick={() => d({ type: 'VIEW', view: a.view })} className="flex flex-col items-center gap-1.5 active:scale-95 transition-all">
            <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center text-2xl">
              {a.emoji ?? <a.Icon size={22} />}
            </div>
            <span className="text-[11px] font-bold text-slate-700 whitespace-nowrap">{t(...a.label)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function Services() {
  const { s, d, t } = useSim()
  const list = faqs(s)
  const tap = (x) => {
    if (x.ask) {
      const f = list.find((q) => q.q === x.ask)
      d({ type: 'ASK', q: f.q, answer: f.a })
      d({ type: 'VIEW', view: 'ai' })
    } else if (x.action) d(x.action)
    else d({ type: 'VIEW', view: x.view })
  }
  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
      <p className="text-xs font-bold text-slate-500 mb-3">{t('サービス', 'べんりな きのう')}</p>
      <div className="grid grid-cols-4 gap-y-4">
        {SERVICES.map((x0) => {
          const x = s.flags.easy && x0.easyAlt ? { ...x0, ...x0.easyAlt } : x0
          return (
          <button key={x.label[0]} data-tour={`svc-${x.view}`} onClick={() => tap(x)} className="flex flex-col items-center gap-1.5 active:scale-95 transition-all">
            <div className={`w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center ${x.color}`}>
              {x.Icon === Wifi && s.wifi ? <Check size={20} className="text-emerald-500" /> : <x.Icon size={22} />}
            </div>
            <span className="text-[10.5px] font-bold text-slate-600 whitespace-nowrap">{t(...x.label)}</span>
          </button>
          )
        })}
      </div>
    </div>
  )
}

// 提案書のキャッチコピーをバナーに
function Banner() {
  const { t } = useSim()
  return (
    <div className="rounded-3xl p-5 bg-gradient-to-r from-brand-600 to-orange-400 text-white relative overflow-hidden">
      <div className="absolute -right-4 -bottom-6 text-7xl opacity-30 rotate-[-12deg]">🐟</div>
      <p className="text-[11px] font-bold text-white/80">{t('近大病院のスマート通院', 'スマホで かんたん')}</p>
      <p className="text-lg font-black leading-snug mt-1">
        まだ待合室で
        <br />
        待ってるの？
      </p>
      <p className="text-[11px] font-bold mt-2 bg-white/20 inline-block px-2.5 py-1 rounded-full">{t('スマホが診察券になる病院', 'スマホが しんさつけん')}</p>
    </div>
  )
}

export default function HomeView() {
  const { s, d, t } = useSim()
  const open = openTasks(s)
  return (
    <div className="p-4 fade-in space-y-4 pb-8">
      {!s.flags.online && (
        <div className="bg-slate-800 text-white p-3.5 rounded-2xl flex items-center gap-3 text-sm">
          <WifiOff size={20} className="shrink-0" />
          <p className="leading-snug">
            <b>{t('オフラインです', 'つながっていません')}</b>
            <br />
            <span className="text-xs text-slate-300">
              {t('診察券と予定はこのまま見られます。', '')}
              {s.pending.length > 0 && `送信待ち ${s.pending.length} 件は、つながったら自動で送ります。`}
            </span>
          </p>
        </div>
      )}

      <HeroCard />

      <StatusCard />

      {/* 未完了の検査アラート（院内にいる間） */}
      {(s.scene === 'hospital' || s.scene === 'after') && s.checkedIn && open.some((x) => x.id === 'blood') && (
        <button onClick={() => d({ type: 'VIEW', view: 'nav' })} className="w-full text-left bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-4">
          <div className="bg-rose-500 p-2 rounded-xl text-white shadow-lg shadow-rose-200">
            <TriangleExclamationPoint size={20} />
          </div>
          <p className="text-rose-600 font-bold text-sm tracking-tight leading-tight">
            {t('未完了の検査があります', 'まだ おわっていない けんさ')}
            <br />
            <span className="text-[11px] opacity-70">{t('採血は診察の前に必要です（2号館 3F 3L）', '血をとる検査が さきです')}</span>
          </p>
        </button>
      )}

      <NextAction />

      {(s.scene === 'hospital' || s.scene === 'after') && <TodayTasks />}

      <Services />

      <div data-anchor="transit">
        {(s.scene === 'before' || s.scene === 'travel') && <Transit />}
        {s.scene === 'home' && <Transit back />}
      </div>

      <div data-anchor="banner">
        <Banner />
      </div>

      {/* 審査員がタップで試せる「出来事」 */}
      <div className="space-y-2 pt-1">
        {s.scene === 'travel' && <Demo onClick={() => d({ type: 'ARRIVE' })}>病院に着く（A）</Demo>}
        {s.scene === 'hospital' && open.length > 0 && <Demo tour="demo-leave" onClick={() => d({ type: 'LEAVE' })}>検査を残したまま出口へ向かう（X）</Demo>}
        {s.scene === 'hospital' && s.checkedIn && !s.called && open[0]?.id === 'consult' && <Demo onClick={() => d({ type: 'CALL' })}>診察に呼ばれる（C）</Demo>}
        {s.scene === 'hospital' && s.called && <Demo onClick={() => d({ type: 'CONSULT_DONE' })}>診察が終わる（D）</Demo>}
      </div>
    </div>
  )
}
