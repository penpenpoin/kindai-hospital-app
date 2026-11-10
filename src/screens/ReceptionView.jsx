import { useState } from 'react'
import { Mic, Sparkles, Check, ClipboardList } from 'lucide-react'
import { useSim } from '../sim/context.js'
import { Page, Card, Pill, Btn } from '../components/ui.jsx'

export function Bubble({ role, children }) {
  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
      {role === 'ai' && <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-lg shrink-0">🐟</div>}
      <div
        className={`p-3.5 rounded-[1.6rem] max-w-[80%] shadow-sm text-sm leading-relaxed ${
          role === 'user' ? 'bg-brand-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
        }`}
      >
        {children}
      </div>
    </div>
  )
}

// AI が日記と会話から作る問診票の下書き（医師が確認して確定）
export function MonshinCard() {
  const { s, t } = useSim()
  const m = s.monshin
  if (!m) return null
  const rows = [
    ['主訴', m.chief],
    ['経過', m.course],
    ['随伴症状', m.related],
    ['つらさ', m.severity],
  ]
  return (
    <Card className="border-emerald-100">
      <div className="flex items-center justify-between mb-3">
        <p className="font-bold text-slate-800 flex items-center gap-2">
          <Sparkles size={18} className="text-emerald-500" /> {t('AI問診票', 'おいしゃさんへの メモ')}
        </p>
        {m.status === 'confirmed' ? <Pill tone="green">医師確認済み</Pill> : <Pill tone="amber">下書き・医師の確認待ち</Pill>}
      </div>
      <dl className="space-y-2 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[4.5rem_1fr] gap-2">
            <dt className="text-xs font-bold text-slate-400 pt-0.5">{k}</dt>
            <dd className="text-slate-700">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100">根拠：体調日記 {m.sources} 件＋音声での会話。AI は下書きまで、診断はしません。</p>
    </Card>
  )
}

export default function ReceptionView() {
  const { s, d, t } = useSim()
  const [listening, setListening] = useState(false)
  const done = !!s.reception
  const late = s.scene !== 'before'

  const talk = () => {
    if (done || listening) return
    setListening(true)
    setTimeout(() => {
      setListening(false)
      d({ type: 'RECEPTION_PROVISIONAL' })
    }, 1400)
  }

  return (
    <Page
      title={t('予約・受付', 'うけつけ')}
      badge={done ? <Pill tone="green">{s.reception.status === 'confirmed' ? `確定 ${s.reception.no}` : `仮受付 ${s.reception.no}`}</Pill> : <Pill tone="slate">24時間受付</Pill>}
    >
      <Card className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
          <ClipboardList />
        </div>
        <div className="flex-1">
          <p className="text-xs text-slate-400 font-bold">{t('次回の予約', 'つぎの よやく')}</p>
          <p className="font-bold text-slate-800">{late ? '今日' : '明日'} 9:30　循環器内科</p>
        </div>
      </Card>

      <div className="space-y-3">
        <Bubble role="ai">{t('こんばんは、田中さん。明日の受付をしておくね。気になる症状はある？', 'あしたの うけつけを するね。きになる ところは ある？')}</Bubble>
        {(done || listening) && (
          <Bubble role="user">{listening ? '…' : 'ひざが痛くて、夜に目が覚めることがあります'}</Bubble>
        )}
        {done && (
          <Bubble role="ai">
            {t('受付しておいたよ。日記の記録とあわせて、お医者さん向けのメモ（問診票）も作ったよ。明日の朝6時に本受付になるからね。', 'うけつけ したよ。おいしゃさんへの メモも つくったよ。')}
          </Bubble>
        )}
      </div>

      {!done && (
        <div className="bg-white/80 backdrop-blur-md p-4 rounded-[2rem] shadow-2xl border border-brand-100 text-center">
          <p className="text-xs text-brand-400 mb-3 font-bold tracking-widest">{t('話すだけで受付できます', 'ボタンを おして はなしてね')}</p>
          <button
            onClick={talk}
            className={`w-full py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-all ${listening ? 'bg-rose-500 text-white animate-pulse' : 'bg-brand-600 text-white shadow-lg shadow-brand-200'}`}
          >
            <Mic size={20} /> {listening ? '聞き取り中…' : t('押して話す', 'おして はなす')}
          </button>
          <p className="text-[11px] text-slate-400 mt-3">{t('夜間・休日でも仮受付 → 翌朝6時に本受付になります', 'よるでも うけつけ できます')}</p>
        </div>
      )}

      <MonshinCard />

      {done && (
        <Btn tone="dark" onClick={() => d({ type: 'VIEW', view: 'home' })}>
          <Check size={18} /> {t('ホームに戻る', 'もどる')}
        </Btn>
      )}
    </Page>
  )
}
