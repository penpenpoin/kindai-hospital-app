import { useState } from 'react'
import { Mic, Sparkles, FlaskConical, Pill as PillIcon, ChevronRight } from 'lucide-react'
import { useSim } from '../sim/context.js'
import { DIARY_PARTS, DIARY_SYMPTOMS, DIARY_MOODS } from '../sim/model.js'
import { Page, Card, Btn } from '../components/ui.jsx'
import { MonshinCard } from './ReceptionView.jsx'

const MOOD_EMOJI = { よい: '😊', ふつう: '😐', わるい: '😣' }
const EMPTY = { mood: '', parts: [], sym: [], level: 0, note: '', voice: false }

function Chip({ on, onClick, children, big }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={`rounded-full border font-bold transition-all ${big ? 'px-4 py-2.5 text-base' : 'px-3 py-1.5 text-sm'} ${on ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white border-slate-200 text-slate-600'}`}
    >
      {children}
    </button>
  )
}

const Label = ({ children }) => <p className="text-xs font-bold text-slate-500 mb-2 mt-4 first:mt-0">{children}</p>

// つらさの推移（棒グラフ）
function Trend({ list }) {
  const { t } = useSim()
  if (list.length < 2) return null
  return (
    <Card>
      <p className="text-xs font-bold text-slate-500 mb-3">{t('つらさの変化', 'つらさ')}</p>
      <div className="flex items-end gap-3 h-24">
        {list.map((r) => (
          <div key={r.id} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[11px] font-black text-slate-700">{r.level || '—'}</span>
            <div className="w-full max-w-8 rounded-t-lg bg-brand-500" style={{ height: `${(r.level || 0) * 14}px`, opacity: 0.45 + (r.level || 0) * 0.11 }} />
            <span className="text-[10px] text-slate-400 whitespace-nowrap">{r.date.replace('月', '/').replace('日', '')}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default function RecordsView() {
  const { s, d, t } = useSim()
  const easy = s.flags.easy
  const list = s.flags.diary
  const today = list.find((r) => r.date === '今日')
  const [draft, setDraft] = useState(EMPTY)
  const [listening, setListening] = useState(false)
  const [warn, setWarn] = useState('')
  const toggle = (key, v) => setDraft((x) => ({ ...x, [key]: x[key].includes(v) ? x[key].filter((y) => y !== v) : [...x[key], v] }))

  const voice = () => {
    if (listening) return
    setListening(true)
    setTimeout(() => {
      const text = '朝は少し楽だけど、階段がつらい'
      setListening(false)
      setDraft((x) => ({ ...x, note: text, voice: true }))
      d({ type: 'DIARY_VOICE', text })
    }, 1300)
  }
  const save = () => {
    if (!draft.mood && !draft.parts.length && !draft.sym.length) {
      setWarn(t('今日の調子か、気になるところを選んでください', 'ちょうしを えらんでね'))
      return
    }
    setWarn('')
    d({ type: 'DIARY_ADD', entry: draft })
    setDraft(EMPTY)
  }

  return (
    <Page title={t('体調日記', 'からだの きろく')}>
      <p className="text-xs text-slate-500 -mt-2">{t('タップで選ぶだけ。記録は受診のときの問診票づくりに使われます。', 'えらぶ だけで OK')}</p>

      <Card>
        <p className={`text-sm font-bold mb-4 ${today ? 'text-emerald-600' : 'text-slate-500'}`}>
          {today ? t('今日の記録をつけました（つけ直すと上書きします）', 'きょうは つけました') : t('今日はまだ記録していません', 'まだ つけていません')}
        </p>

        <Label>{t('今日の調子', 'きょうの ちょうし')}</Label>
        <div className="grid grid-cols-3 gap-2">
          {DIARY_MOODS.map((m) => (
            <button
              key={m}
              onClick={() => setDraft((x) => ({ ...x, mood: m }))}
              className={`py-3 rounded-2xl border font-bold flex flex-col items-center gap-1 ${easy ? 'text-base' : 'text-sm'} ${draft.mood === m ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-slate-100 bg-slate-50 text-slate-600'}`}
            >
              <span className="text-2xl">{MOOD_EMOJI[m]}</span>
              {m}
            </button>
          ))}
        </div>

        <Label>{t('気になるところ（いくつでも）', 'きになる ところ')}</Label>
        <div className="flex flex-wrap gap-2">
          {DIARY_PARTS.map((p) => (
            <Chip key={p} big={easy} on={draft.parts.includes(p)} onClick={() => toggle('parts', p)}>
              {p}
            </Chip>
          ))}
        </div>

        {/* やさしい表示では項目を減らす（症状はひとこと・声で） */}
        {!easy && (
          <>
            <Label>どんな感じ（いくつでも）</Label>
            <div className="flex flex-wrap gap-2">
              {DIARY_SYMPTOMS.map((p) => (
                <Chip key={p} on={draft.sym.includes(p)} onClick={() => toggle('sym', p)}>
                  {p}
                </Chip>
              ))}
            </div>
          </>
        )}

        <Label>{t('つらさ', 'つらさ')}</Label>
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setDraft((x) => ({ ...x, level: n }))}
              className={`py-2.5 rounded-xl border font-black ${easy ? 'text-lg' : ''} ${draft.level === n ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white border-slate-200 text-slate-600'}`}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-[11px] text-slate-400 mt-1">
          <span>{t('軽い', 'かるい')}</span>
          <span>{t('とてもつらい', 'とても つらい')}</span>
        </div>

        <Label>{t('ひとこと（なくてもかまいません・声でも入れられます）', 'ひとこと（こえで OK）')}</Label>
        <div className="flex gap-2">
          <input
            value={draft.note}
            onChange={(e) => setDraft((x) => ({ ...x, note: e.target.value, voice: false }))}
            placeholder={t('例：階段がつらい', 'れい：かいだんが つらい')}
            className={`flex-1 min-w-0 rounded-xl border border-slate-200 px-3 ${easy ? 'py-3 text-base' : 'py-2.5 text-sm'} outline-none focus:border-brand-400`}
          />
          <button
            onClick={voice}
            aria-label="声で入力する"
            className={`${easy ? 'w-14' : 'w-12'} rounded-xl border flex items-center justify-center shrink-0 ${listening ? 'bg-rose-500 border-rose-500 text-white animate-pulse' : 'bg-white border-slate-200 text-brand-600'}`}
          >
            <Mic size={easy ? 24 : 20} />
          </button>
        </div>
        {listening && <p className="text-xs text-rose-500 font-bold mt-1">聞き取り中…</p>}
        {warn && <p className="text-xs text-rose-500 font-bold mt-2">{warn}</p>}

        <Btn className="mt-4" onClick={save}>
          {t('今日の記録をつける', 'きろくする')}
        </Btn>
      </Card>

      <Trend list={list} />

      <div className="space-y-2">
        {[...list].reverse().map((x) => (
          <div key={x.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex gap-3 items-center">
            <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-600 font-black flex items-center justify-center shrink-0">{x.level || '—'}</div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-brand-600">
                {x.date}　{x.parts.join('・') || '—'}
                {x.voice && <span className="ml-1 text-slate-400">🎤</span>}
              </p>
              <p className="text-sm font-bold text-slate-700">{[x.mood, ...x.sym].filter(Boolean).join('／') || '—'}</p>
              {x.note && <p className="text-xs text-slate-500">{x.note}</p>}
            </div>
          </div>
        ))}
      </div>

      <div data-anchor="monshin">
      {s.monshin ? (
        <MonshinCard />
      ) : (
        <Btn tone="dark" onClick={() => d({ type: 'MAKE_MONSHIN' })}>
          <Sparkles size={18} /> {t('記録をAIで問診票にまとめる', 'おいしゃさんへの メモを つくる')}
        </Btn>
      )}
      </div>

      {!easy && (
        <Card className="flex items-start gap-3">
          <FlaskConical size={20} className="text-slate-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-700">医療データの研究利用に協力する（任意）</p>
            <p className="text-[11px] text-slate-500">氏名などを除いて匿名化した記録を、近大の医療研究に役立てます。いつでもやめられます（提案）。</p>
          </div>
          <button
            onClick={() => d({ type: 'RESEARCH' })}
            role="switch"
            aria-checked={s.flags.research}
            className={`w-11 h-6 rounded-full relative shrink-0 ${s.flags.research ? 'bg-brand-600' : 'bg-slate-300'}`}
          >
            <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all" style={{ left: s.flags.research ? 22 : 2 }} />
          </button>
        </Card>
      )}

      <button onClick={() => d({ type: 'VIEW', view: 'meds' })} className="w-full bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3 text-left">
        <PillIcon size={20} className="text-sky-500" />
        <span className="flex-1 text-sm font-bold text-slate-700">{t('お薬（残り 12 日分）', 'くすり')}</span>
        <ChevronRight size={18} className="text-slate-300" />
      </button>
    </Page>
  )
}
