import { TriangleExclamationPoint, Navigation } from 'lucide-react'
import { useSim } from '../sim/context.js'
import { PLACES } from '../sim/model.js'
import { Btn, Sign } from './ui.jsx'

// 帰宅防止アラート：未完了の検査があるまま出口へ向かったとき
export default function LeaveAlert() {
  const { s, d, t } = useSim()
  if (!s.alert) return null
  const tasks = s.alert.tasks.map((id) => s.tasks.find((x) => x.id === id))
  const first = tasks[0]
  return (
    <div className="absolute inset-0 z-[70] bg-rose-600/95 backdrop-blur flex flex-col items-center justify-center p-7 text-white text-center fade-in">
      <div className="shake w-24 h-24 rounded-full bg-white text-rose-600 flex items-center justify-center mb-6 shadow-2xl">
        <TriangleExclamationPoint size={52} />
      </div>
      <p className="text-sm font-bold text-rose-100 mb-2">{t('お帰りの前にご確認ください', 'まって！')}</p>
      <h2 className="text-3xl font-black leading-tight mb-5">
        田中さん、まだ
        <br />
        {t(first.name, first.easy)}が
        <br />
        残っています！
      </h2>
      <div className="bg-white/15 rounded-2xl p-4 w-full mb-6 space-y-3 text-left">
        {tasks.map((x) => (
          <div key={x.id} className="flex items-center gap-3">
            <Sign id={x.place} />
            <div>
              <p className="font-bold">{t(x.name, x.easy)}</p>
              <p className="text-xs text-rose-100">{PLACES[x.place]}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="w-full space-y-3">
        <Btn tone="white" onClick={() => d({ type: 'ALERT_GUIDE' })}>
          <Navigation size={18} /> {t(`${PLACES[first.place]}へ案内する`, 'つれていって')}
        </Btn>
        <button onClick={() => d({ type: 'ALERT_SKIP' })} className="w-full py-3 text-sm font-bold text-rose-100 underline underline-offset-4">
          {t('今日は受けずに帰る（病院に連絡します）', '今日はうけない')}
        </button>
      </div>
    </div>
  )
}
