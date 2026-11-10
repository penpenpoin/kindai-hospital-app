import { Pill as PillIcon, FileText, Activity, Sparkles } from 'lucide-react'
import { useSim } from '../sim/context.js'
import { DIARY } from '../sim/model.js'
import { Page, Card, Btn } from '../components/ui.jsx'
import { MonshinCard } from './ReceptionView.jsx'

const MOODS = [
  ['よい', '😊'],
  ['ふつう', '😐'],
  ['わるい', '😣'],
]

export default function RecordsView() {
  const { s, d, t } = useSim()
  return (
    <Page title={t('お薬と記録', 'きろく')}>
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <PillIcon size={14} /> {t('お薬の残り', 'くすり')}
          </p>
          <p className="text-3xl font-black text-slate-800 mt-1">
            12<span className="text-sm ml-1">日分</span>
          </p>
        </Card>
        <Card>
          <p className="text-[11px] font-bold text-slate-400">{t('前回の受診', 'まえの しんさつ')}</p>
          <p className="font-bold text-slate-800 mt-2">9/10</p>
          <p className="text-xs text-slate-500">循環器内科</p>
        </Card>
      </div>

      <Card>
        <p className="font-bold text-slate-800 mb-1">{t('からだの記録', 'きょうの ちょうし')}</p>
        <p className="text-xs text-slate-500 mb-3">{s.diaryToday ? `今日は「${s.diaryToday}」で記録しました` : t('今日はまだ記録していません', 'まだ つけていません')}</p>
        <div className="grid grid-cols-3 gap-2">
          {MOODS.map(([m, e]) => (
            <button
              key={m}
              onClick={() => d({ type: 'DIARY', mood: m })}
              className={`py-3 rounded-2xl border font-bold text-sm flex flex-col items-center gap-1 ${s.diaryToday === m ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-slate-50 text-slate-600'}`}
            >
              <span className="text-2xl">{e}</span>
              {m}
            </button>
          ))}
        </div>
      </Card>

      <div className="space-y-2">
        {DIARY.map((x) => (
          <div key={x.date} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex gap-3 items-center">
            <div className="w-9 h-9 rounded-full bg-purple-50 text-purple-500 font-black flex items-center justify-center shrink-0">{x.level}</div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-indigo-500">
                {x.date}　{x.part}
              </p>
              <p className="text-sm font-bold text-slate-700">
                {x.mood}／{x.tags.join('／')}
              </p>
              <p className="text-xs text-slate-500">{x.note}</p>
            </div>
          </div>
        ))}
      </div>

      {s.monshin ? (
        <MonshinCard />
      ) : (
        <Btn onClick={() => d({ type: 'MAKE_MONSHIN' })}>
          <Sparkles size={18} /> {t('記録を受診メモ（問診票）にまとめる', 'おいしゃさんへの メモを つくる')}
        </Btn>
      )}

      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-400 px-1">{t('医療記録', 'これまでの きろく')}</p>
        {[
          ['2026.09.10', '循環器内科 診察', FileText],
          ['2026.09.10', '血液検査結果', Activity],
        ].map(([date, name, Icon]) => (
          <div key={name} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-indigo-500 mb-1">{date}</p>
              <p className="font-bold text-slate-700 text-sm">{name}</p>
            </div>
            <Icon className="text-slate-300" />
          </div>
        ))}
      </div>
    </Page>
  )
}
