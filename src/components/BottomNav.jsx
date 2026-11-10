import { House, Navigation, Wallet, IdCard } from 'lucide-react'
import { useSim } from '../sim/context.js'

function Item({ id, Icon, label }) {
  const { s, d } = useSim()
  return (
    <button
      className={`flex flex-col items-center gap-1 flex-1 transition-all ${s.view === id ? 'text-indigo-600 font-bold scale-110' : 'text-slate-400'}`}
      onClick={() => d({ type: 'VIEW', view: id })}
    >
      <Icon size={20} />
      <span className="text-[10px] tracking-wider whitespace-nowrap">{label}</span>
    </button>
  )
}

export default function BottomNav() {
  const { s, d, t } = useSim()
  return (
    <nav className="glass-nav px-3 pt-3 pb-4 flex justify-around items-end shrink-0 z-40">
      <Item id="home" Icon={House} label="ホーム" />
      <Item id="nav" Icon={Navigation} label={t('院内案内', '案内')} />
      <button className="flex-1 flex flex-col items-center -mt-9 relative" onClick={() => d({ type: 'VIEW', view: 'ai' })}>
        <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-3xl shadow-xl transition-all hover:scale-110 active:scale-95 maguro-glow">
          🐟
        </div>
        <span className={`text-[10px] mt-2 font-black whitespace-nowrap ${s.view === 'ai' ? 'text-indigo-600' : 'text-slate-400'}`}>{t('AIに相談', '相談')}</span>
      </button>
      <Item id="pay" Icon={Wallet} label={t('お支払い', '支払い')} />
      <Item id="card" Icon={IdCard} label={t('診察券', 'しんさつけん')} />
    </nav>
  )
}
