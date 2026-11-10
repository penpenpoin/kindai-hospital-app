import { useState } from 'react'
import { Phone, MapPin, Siren, Clock, Check, Download, Printer, FileText, Pill as PillIcon } from 'lucide-react'
import { useSim } from '../sim/context.js'
import { BILL } from '../sim/model.js'
import { Page, Card, Pill, Btn } from '../components/ui.jsx'

const MapBtn = ({ target, children }) => {
  const { d } = useSim()
  return (
    <Btn tone="ghost" onClick={() => d({ type: 'VIEW', view: 'map', target })}>
      <MapPin size={18} /> {children}
    </Btn>
  )
}

// s.clock（例「当日 9:20」「前日 21:30」）→ 分。デモは平日の想定
const minutes = (clock) => {
  const m = clock.match(/(\d+):(\d+)/)
  return m ? Number(m[1]) * 60 + Number(m[2]) : 0
}
const hm = (h, m = 0) => h * 60 + m

// ------------------------------------------------------------------
// 救急外来（場所・電話は公式サイトより）
// ------------------------------------------------------------------
export function ErView() {
  const { t } = useSim()
  return (
    <Page title={t('救急外来', 'きゅうきゅう')}>
      <div className="rounded-3xl p-5 bg-rose-600 text-white">
        <p className="text-xs font-bold text-rose-100">{t('命にかかわる・意識がない・激しい痛み など', 'いのちに かかわるとき')}</p>
        <p className="text-2xl font-black mt-1">{t('迷わず 119 番へ', 'すぐ 119 ばん')}</p>
        <a href="tel:119" className="mt-4 w-full py-3.5 rounded-2xl bg-white text-rose-600 font-black flex items-center justify-center gap-2">
          <Phone size={20} /> 119 に電話
        </a>
      </div>

      <Card>
        <p className="text-xs font-bold text-slate-400 mb-2">{t('救急車を呼ぶか迷ったら', 'まよったら')}</p>
        <p className="font-bold text-slate-800">救急安心センターおおさか（#7119）</p>
        <p className="text-xs text-slate-500 mt-1">{t('看護師などが、救急車が必要か・受診先を電話で案内します。', 'でんわで そうだん できます')}</p>
        <a href="tel:#7119" className="mt-3 w-full py-3 rounded-2xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center gap-2">
          <Phone size={18} /> #7119 に電話
        </a>
      </Card>

      <Card>
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <Siren />
          </div>
          <div className="flex-1">
            <p className="font-bold text-slate-800">{t('近大病院の救急外来', 'びょういんの きゅうきゅう')}</p>
            <p className="text-sm text-slate-600 mt-1">2号館（診療棟）2F・区画「2R」</p>
            <p className="text-xs text-slate-500 mt-1">{t('受診する前に、まず病院へ電話で連絡してください。', 'まず でんわ してね')}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 mt-4">
          <a href="tel:0722887222" className="w-full py-3 rounded-2xl bg-brand-600 text-white font-bold flex items-center justify-center gap-2">
            <Phone size={18} /> 病院（代表）072-288-7222
          </a>
          <MapBtn target="er">{t('院内にいる人：地図でルートを見る', 'ちずで みる')}</MapBtn>
        </div>
      </Card>
      <p className="text-[10px] text-slate-400 px-1">場所・電話番号は近畿大学病院の公式サイトより。受診の流れは病院の案内に従ってください。</p>
    </Page>
  )
}

// ------------------------------------------------------------------
// 駐車場（料金は公式「駐車・駐輪料金」より）。外来患者の料金を計算できる
// ------------------------------------------------------------------
export function ParkingView() {
  const { d, t } = useSim()
  const [min, setMin] = useState(150)
  const outpatient = min <= 15 ? 0 : Math.min(1000, Math.ceil(min / 15) * 100)
  const general = min <= 15 ? 0 : Math.ceil(min / 60) * 600
  const [done, setDone] = useState(false)
  return (
    <Page title={t('駐車場', 'ちゅうしゃじょう')}>
      <Card>
        <p className="text-xs font-bold text-slate-400 mb-2">{t('外来を受診した日の料金', 'じゅしんした ひ')}</p>
        <p className="text-3xl font-black text-slate-800">
          15分 100円<span className="text-base font-bold text-slate-500">・最大 1,000円</span>
        </p>
        <p className="text-xs text-slate-500 mt-2">{t('駐車券を必ず院内に持っていき、割引の処理をしてください。15分以内は無料です。', 'ちゅうしゃけんを びょういんの なかへ')}</p>
      </Card>

      <Card>
        <p className="font-bold text-slate-800 mb-1">{t('料金のめやす', 'いくら かかる？')}</p>
        <p className="text-xs text-slate-500 mb-3">{t('とめる時間を動かしてください', '')}</p>
        <input type="range" min="10" max="480" step="5" value={min} onChange={(e) => setMin(Number(e.target.value))} className="w-full accent-brand-600" />
        <p className="text-center font-bold text-slate-700 mt-1">
          {Math.floor(min / 60)}時間{min % 60 ? `${min % 60}分` : ''}
        </p>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="rounded-2xl bg-brand-50 p-3 text-center">
            <p className="text-[11px] font-bold text-brand-700">{t('受診した人（割引あり）', 'じゅしんした ひと')}</p>
            <p className="text-2xl font-black text-brand-700">{outpatient.toLocaleString()}円</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3 text-center">
            <p className="text-[11px] font-bold text-slate-500">{t('お見舞い・一般（平日昼）', 'おみまい')}</p>
            <p className="text-2xl font-black text-slate-600">{general.toLocaleString()}円</p>
          </div>
        </div>
      </Card>

      <Card>
        <p className="font-bold text-slate-800">{t('駐車券の割引をアプリで（提案）', 'アプリで わりびき')}</p>
        <p className="text-xs text-slate-500 mt-1 mb-3">{t('駐車券の番号を読み取っておけば、受付と同時に割引の処理が済み、出口でそのまま精算できる仕組みを提案します。', '')}</p>
        <Btn
          tone={done ? 'ghost' : 'primary'}
          onClick={() => {
            setDone(true)
            d({ type: 'PARKING' })
          }}
        >
          {done ? (
            <>
              <Check size={18} /> {t('割引を登録しました（デモ）', 'できました')}
            </>
          ) : (
            t('駐車券を読み取る（デモ）', 'よみとる')
          )}
        </Btn>
      </Card>
      <p className="text-[10px] text-slate-400 px-1">
        料金は近畿大学病院の公式サイトより（お見舞い・一般は平日 8〜16時 60分600円、それ以外の時間 60分400円）。駐車場は混雑するため、電車・バスでの来院が呼びかけられています。入院患者さま専用の駐車場はありません。
      </p>
    </Page>
  )
}

// ------------------------------------------------------------------
// カフェ・売店（営業時間は公式フロアマップより）。シナリオの時刻で営業中かを出す
// ------------------------------------------------------------------
const SHOPS = [
  { id: 'conbini', name: 'セブン‐イレブン', where: '1号館（外来棟）2F', hours: '7:00〜22:00（年中無休）', open: [hm(7), hm(22)] },
  { id: 'cafe', name: 'CAFE CORE（カフェ・コア）', where: '7号館（管理棟）3F', hours: '平日 8:00〜18:00', open: [hm(8), hm(18)] },
  { id: 'ffields', name: '外来食堂 ffields', where: '7号館（管理棟）2F', hours: '平日・土 10:00〜18:00', open: [hm(10), hm(18)] },
  { id: 'green', name: 'グリーンリーブスモール', where: '3号館（サービス棟）2F', hours: '平日 8:00〜19:00／土日祝 9:00〜17:00', open: [hm(8), hm(19)] },
]

export function ShopsView() {
  const { s, d, t } = useSim()
  const now = minutes(s.clock)
  return (
    <Page title={t('カフェ・売店', 'おみせ')} badge={<Pill tone="slate"><Clock size={12} className="inline -mt-0.5" /> {s.clock}</Pill>}>
      <div className="space-y-3">
        {SHOPS.map((x) => {
          const open = now >= x.open[0] && now < x.open[1]
          return (
            <Card key={x.id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-slate-800">{x.name}</p>
                  <p className="text-xs text-slate-500">{x.where}</p>
                  <p className="text-xs text-slate-500 mt-1">{x.hours}</p>
                </div>
                <Pill tone={open ? 'green' : 'slate'}>{open ? t('営業中', 'あいてる') : t('営業時間外', 'しまってる')}</Pill>
              </div>
              <button onClick={() => d({ type: 'VIEW', view: 'map', target: x.id })} className="mt-3 text-sm font-bold text-brand-600 flex items-center gap-1">
                <MapPin size={16} /> {t('地図で行き方を見る', 'ちずで みる')}
              </button>
            </Card>
          )
        })}
      </div>
      <p className="text-[10px] text-slate-400 px-1">営業時間は近畿大学病院の公式フロアマップより（デモは平日として表示）。年末年始・創立記念日（11/5）などは休みの店舗があります。</p>
    </Page>
  )
}

// ------------------------------------------------------------------
// お薬（薬の名前はデモ用の例）
// ------------------------------------------------------------------
const MEDS = [
  { name: 'お薬A（例）', dose: '1回1錠', times: ['朝'] },
  { name: 'お薬B（例）', dose: '1回1錠', times: ['朝', '夜'] },
]

export function MedsView() {
  const { d, t } = useSim()
  const [taken, setTaken] = useState({})
  const tap = (k) => {
    setTaken((v) => ({ ...v, [k]: !v[k] }))
    if (!taken[k]) d({ type: 'MED_TAKEN', what: k })
  }
  return (
    <Page title={t('お薬', 'くすり')}>
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-[11px] font-bold text-slate-400">{t('残り', 'のこり')}</p>
          <p className="text-3xl font-black text-slate-800">
            12<span className="text-sm ml-1">日分</span>
          </p>
        </Card>
        <Card>
          <p className="text-[11px] font-bold text-slate-400">{t('次の受診', 'つぎの しんさつ')}</p>
          <p className="font-black text-slate-800 text-xl mt-1">11/20</p>
          <p className="text-[11px] text-emerald-600 font-bold">{t('薬が切れる前に受診できます', 'まにあいます')}</p>
        </Card>
      </div>

      <Card>
        <p className="font-bold text-slate-800 mb-3">{t('今日のお薬', 'きょうの くすり')}</p>
        <div className="space-y-3">
          {MEDS.map((m) => (
            <div key={m.name} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center shrink-0">
                <PillIcon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800">{m.name}</p>
                <p className="text-[11px] text-slate-500">{m.dose}</p>
              </div>
              {m.times.map((tm) => {
                const k = `${m.name}-${tm}`
                return (
                  <button key={k} onClick={() => tap(k)} className={`px-3 py-2 rounded-xl text-xs font-bold border ${taken[k] ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-slate-500 border-slate-200'}`}>
                    {taken[k] ? '✓ ' : ''}
                    {tm}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
        <p className="text-[11px] text-slate-400 mt-3">{t('飲んだら押してください。飲み忘れが続くと、次の受診時に医師へ伝わります（提案）。', 'のんだら おしてね')}</p>
      </Card>

      <Card>
        <p className="font-bold text-slate-800">{t('お薬の受け取り', 'くすりを もらう ところ')}</p>
        <p className="text-sm text-slate-600 mt-1">{t('総合受付の「おくすり受付カウンター」（1号館 3F）', 'そうごう うけつけ')}</p>
        <div className="mt-3">
          <MapBtn target="front">{t('地図で見る', 'ちずで みる')}</MapBtn>
        </div>
      </Card>
      <p className="text-[10px] text-slate-400 px-1">お薬の名前・飲み方はデモ用の例です。</p>
    </Page>
  )
}

// ------------------------------------------------------------------
// 領収書・明細（過去分はデモ用の例）
// ------------------------------------------------------------------
export function ReceiptsView() {
  const { s, d, t } = useSim()
  const rows = [...(s.paid ? [{ date: '今日', dept: '循環器内科', total: BILL.total, today: true }] : []), { date: '2026.09.10', dept: '循環器内科', total: 2980 }, { date: '2026.08.06', dept: '循環器内科', total: 1420 }]
  return (
    <Page title={t('領収書・明細', 'りょうしゅうしょ')}>
      {!s.paid && (s.scene === 'after' || s.scene === 'hospital') && <p className="text-xs text-slate-500 px-1">{t('今日の分は、お支払いが終わるとここに追加されます。', 'はらうと ここに でます')}</p>}
      <div className="space-y-2">
        {rows.map((r) => (
          <Card key={r.date} className={r.today ? 'border-brand-200' : ''}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                <FileText size={20} />
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-bold text-brand-600">{r.date}</p>
                <p className="font-bold text-slate-800 text-sm">{r.dept}</p>
              </div>
              <p className="font-black text-slate-800 tabular-nums">{r.total.toLocaleString()}円</p>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <button onClick={() => d({ type: 'RECEIPT', how: 'pdf' })} className="py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1">
                <Download size={14} /> PDF保存
              </button>
              <button onClick={() => d({ type: 'RECEIPT', how: 'conbini' })} className="py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1">
                <Printer size={14} /> コンビニ印刷
              </button>
            </div>
          </Card>
        ))}
      </div>
      <p className="text-[10px] text-slate-400 px-1">{t('医療費控除の確定申告用に、1年分をまとめて PDF にできます（提案）。過去の金額はデモ用の例です。', '')}</p>
    </Page>
  )
}
