import { useState } from 'react'
import { BadgeCheck, Heart, Lock, Pill as PillIcon, Star, ShieldCheck, MessageSquareWarning } from 'lucide-react'
import { useSim } from '../sim/context.js'
import { Card, Btn } from '../components/ui.jsx'

// =====================================================================
// みんなの広場：レビュー（設計の考え方）
//  - 先生：星の点数や悪い口コミは公開しない。「よかった点」と「ありがとうの声」だけ。
//          受診した人だけが送れる（確認済みの口コミ）。改善の要望は非公開で患者相談窓口へ。
//  - お薬：効き目の評価はしない（個人差・誤解・医薬品の広告規制）。飲みやすさと工夫だけ。
//          処方されている人だけが書ける。効き目の断定は AI が止める。
//  先生・お薬・件数はすべてデモ用の例。
// =====================================================================

const DOCTOR_TAGS = ['説明がわかりやすい', '話をよく聞いてくれる', '質問しやすい', '不安が減った', '待ち時間の案内がていねい']
const DOCTORS = [
  {
    id: 'dr1',
    name: '循環器内科 A 先生（例）',
    spec: '不整脈・高血圧',
    note: '気になることは、体調日記にひとこと書いておいてください。',
    tags: { 説明がわかりやすい: 128, 話をよく聞いてくれる: 96, 質問しやすい: 74, 不安が減った: 61, 待ち時間の案内がていねい: 22 },
    thanks: [
      { who: '60代', text: '検査の結果をグラフで見せてもらい、よく分かりました。' },
      { who: '70代', text: '日記を見て「夜に目が覚めるのはつらいですね」と言ってもらえて安心しました。' },
    ],
  },
  {
    id: 'dr2',
    name: '循環器内科 B 先生（例）',
    spec: '心不全・心臓リハビリ',
    note: 'リハビリは無理せず、続けられる量からいきましょう。',
    tags: { 説明がわかりやすい: 84, 話をよく聞いてくれる: 102, 質問しやすい: 57, 不安が減った: 70, 待ち時間の案内がていねい: 15 },
    thanks: [{ who: '50代', text: '家族の質問にも時間をとって答えてくださいました。' }],
  },
]

const MED_TAGS = ['錠剤が小さい', '1日1回で忘れにくい', '水が少なくても飲める', '一包化で楽', '味・においが気にならない']
const MEDS = [
  {
    id: 'medA',
    name: 'お薬A（例）',
    mine: true,
    ease: 4.4,
    count: 212,
    tags: { 錠剤が小さい: 130, '1日1回で忘れにくい': 154, 水が少なくても飲める: 66, 一包化で楽: 40, '味・においが気にならない': 88 },
    tips: [{ who: '70代', text: '朝ごはんのお皿の横に置いておくと忘れません。' }],
  },
  {
    id: 'medB',
    name: 'お薬B（例）',
    mine: true,
    ease: 3.6,
    count: 97,
    tags: { 錠剤が小さい: 21, '1日1回で忘れにくい': 0, 水が少なくても飲める: 18, 一包化で楽: 52, '味・においが気にならない': 33 },
    tips: [{ who: '60代', text: '朝と夜の2回なので、スマホのアラームと薬箱を使っています。' }],
  },
]

// 効き目の断定や、ほかの人への勧め・やめる話はのせない（AI 見守りのデモ）
const NG = /(効く|効かない|治る|治った|やめた|やめて|飲まなくて|おすすめ|勧め)/

function Tags({ tags, max }) {
  return (
    <div className="space-y-1.5">
      {Object.entries(tags)
        .sort((a, b) => b[1] - a[1])
        .map(([k, v]) => (
          <div key={k} className="flex items-center gap-2">
            <span className="text-xs text-slate-600 w-36 shrink-0">{k}</span>
            <span className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
              <span className="block h-full rounded-full bg-brand-400" style={{ width: `${(v / max) * 100}%` }} />
            </span>
            <span className="text-[11px] font-bold text-slate-500 w-8 text-right tabular-nums">{v}</span>
          </div>
        ))}
    </div>
  )
}

function Compose({ tags, placeholder, gate, gateText, onSend, sentText, already }) {
  const [pick, setPick] = useState([])
  const [text, setText] = useState('')
  const [err, setErr] = useState('')
  const [sent, setSent] = useState(false)
  if (!gate)
    return (
      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-3">
        <Lock size={12} /> {gateText}
      </p>
    )
  if (sent || already) return <p className="text-xs font-bold text-emerald-600 mt-3">✓ {sentText}</p>
  const send = () => {
    if (!pick.length && !text.trim()) return
    if (NG.test(text)) {
      setErr('効き目の言い切りや、やめる・勧める内容はのせられません。体のことは主治医・薬剤師に相談してください。')
      return
    }
    setErr('')
    onSend({ tags: pick, text: text.trim() })
    setSent(true)
  }
  return (
    <div className="mt-3 pt-3 border-t border-slate-100">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((x) => (
          <button
            key={x}
            onClick={() => setPick((p) => (p.includes(x) ? p.filter((y) => y !== x) : [...p, x]))}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${pick.includes(x) ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white border-slate-200 text-slate-500'}`}
          >
            {x}
          </button>
        ))}
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder={placeholder} className="w-full mt-2 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 resize-none" />
      {err && <p className="text-[11px] text-rose-600 font-bold mt-1">{err}</p>}
      <Btn className="mt-2 !py-2.5 text-sm" onClick={send}>
        送る
      </Btn>
    </div>
  )
}

function DoctorCard({ dr }) {
  const { s, d } = useSim()
  const visited = s.tasks.find((x) => x.id === 'consult')?.status === 'done'
  const max = Math.max(...Object.values(dr.tags))
  const mine = s.drThanks.filter((x) => x.dr === dr.id)
  return (
    <Card>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-full bg-sky-500 text-white flex items-center justify-center font-black shrink-0">医</div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800 flex items-center gap-1">
            {dr.name} <BadgeCheck size={15} className="text-sky-500" />
          </p>
          <p className="text-[11px] text-slate-500">専門：{dr.spec}</p>
        </div>
      </div>
      <p className="text-xs text-slate-600 bg-sky-50 rounded-xl px-3 py-2 mb-3">💬 {dr.note}</p>
      <p className="text-[11px] font-bold text-slate-400 mb-2">受診した人が選んだ「よかった点」</p>
      <Tags tags={dr.tags} max={max} />
      <p className="text-[11px] font-bold text-slate-400 mt-4 mb-2 flex items-center gap-1">
        <Heart size={12} className="text-rose-400" /> ありがとうの声
      </p>
      <div className="space-y-2">
        {[...mine.map((m) => ({ who: 'あなた', text: m.text || m.tags.join('・') })), ...dr.thanks].map((x, i) => (
          <p key={i} className="text-xs text-slate-600 bg-slate-50 rounded-xl px-3 py-2">
            <span className="font-bold text-slate-400 mr-1">{x.who}</span>
            {x.text}
          </p>
        ))}
      </div>
      <Compose
        tags={DOCTOR_TAGS}
        placeholder="ありがとうのひとこと（なくてもかまいません）"
        gate={visited}
        gateText="この先生を受診した人だけが送れます（受診の記録で確認）"
        sentText="ありがとうの声を送りました"
        already={mine.length > 0}
        onSend={(v) => d({ type: 'DR_THANKS', dr: dr.id, name: dr.name, ...v })}
      />
    </Card>
  )
}

function MedCard({ m }) {
  const { s, d } = useSim()
  const max = Math.max(...Object.values(m.tags))
  const mine = s.medReviews.filter((x) => x.med === m.id)
  return (
    <Card>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center shrink-0">
          <PillIcon />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800">{m.name}</p>
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            飲みやすさ <Star size={12} className="text-amber-400 fill-amber-400" /> <b className="text-slate-700">{m.ease.toFixed(1)}</b>（処方された {m.count} 人）
          </p>
        </div>
        {m.mine && <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">あなたも服用中</span>}
      </div>
      <Tags tags={m.tags} max={max} />
      <p className="text-[11px] font-bold text-slate-400 mt-4 mb-2">飲み方の工夫</p>
      <div className="space-y-2">
        {[...mine.map((x) => ({ who: 'あなた', text: x.text || x.tags.join('・') })), ...m.tips].map((x, i) => (
          <p key={i} className="text-xs text-slate-600 bg-slate-50 rounded-xl px-3 py-2">
            <span className="font-bold text-slate-400 mr-1">{x.who}</span>
            {x.text}
          </p>
        ))}
      </div>
      <Compose
        tags={MED_TAGS}
        placeholder="飲み方の工夫（例：薬箱を朝ごはんの横に置く）"
        gate={m.mine}
        gateText="このお薬を処方されている人だけが書けます"
        sentText="飲みやすさの声を送りました"
        already={mine.length > 0}
        onSend={(v) => d({ type: 'MED_REVIEW', med: m.id, name: m.name, ...v })}
      />
    </Card>
  )
}

export default function Reviews() {
  const [kind, setKind] = useState('dr')
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-2xl">
        {[
          ['dr', '先生へのありがとう'],
          ['med', 'お薬の飲みやすさ'],
        ].map(([k, label]) => (
          <button key={k} onClick={() => setKind(k)} className={`py-2 rounded-xl text-sm font-bold ${kind === k ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500'}`}>
            {label}
          </button>
        ))}
      </div>

      {kind === 'dr' ? (
        <>
          <div className="flex items-start gap-2 text-[11px] text-slate-500">
            <ShieldCheck size={14} className="text-emerald-500 shrink-0 mt-0.5" />
            <p>受診した人だけが送れる「よかった点」と「ありがとうの声」です。点数で比べたり、悪い口コミを公開したりはしません。</p>
          </div>
          {DOCTORS.map((dr) => (
            <DoctorCard key={dr.id} dr={dr} />
          ))}
          <Card className="flex items-start gap-3 bg-slate-50">
            <MessageSquareWarning size={20} className="text-slate-400 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-700">改善してほしいことがあるとき</p>
              <p className="text-[11px] text-slate-500 mt-0.5">公開されず、患者相談窓口に直接届きます。病院が確認して対応します。</p>
            </div>
          </Card>
        </>
      ) : (
        <>
          <div className="flex items-start gap-2 text-[11px] text-slate-500">
            <ShieldCheck size={14} className="text-emerald-500 shrink-0 mt-0.5" />
            <p>飲みやすさと工夫の共有です。効き目や副作用には個人差があります。お薬をやめる・変えるときは、自分で決めずに主治医・薬剤師に相談してください。</p>
          </div>
          {MEDS.map((m) => (
            <MedCard key={m.id} m={m} />
          ))}
        </>
      )}
      <p className="text-[10px] text-slate-400 px-1">先生・お薬・件数はデモ用の例です。</p>
    </div>
  )
}
