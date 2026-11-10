import { House, Navigation, Wallet, ScanBarcode } from 'lucide-react'
import { useSim } from '../sim/context.js'

function Item({ id, Icon, emoji, label }) {
  const { s, d } = useSim()
  const on = s.view === id
  return (
    <button className={`flex flex-col items-center gap-1 flex-1 transition-all ${on ? 'text-brand-600 font-bold' : 'text-slate-400'}`} onClick={() => d({ type: 'VIEW', view: id })}>
      {emoji ? <span className={`text-xl leading-5 ${on ? '' : 'grayscale opacity-60'}`}>{emoji}</span> : <Icon size={22} />}
      <span className="text-[10px] tracking-wide whitespace-nowrap">{label}</span>
    </button>
  )
}

// 中央の大きな赤いボタン＝診察券（いつでも1タップでバーコードを出す）
export default function BottomNav() {
  const { s, d, t } = useSim()
  return (
    <nav className="bg-white border-t border-slate-100 px-2 pt-2 pb-3 flex justify-around items-end shrink-0 z-40">
      <Item id="home" Icon={House} label="ホーム" />
      <Item id="nav" Icon={Navigation} label={t('院内案内', 'あんない')} />
      <button className="flex-1 flex flex-col items-center -mt-7" onClick={() => d({ type: 'VIEW', view: 'card' })}>
        <div className="w-16 h-16 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-200 border-4 border-white transition-all active:scale-95">
          <ScanBarcode size={28} />
        </div>
        <span className={`text-[10px] mt-1 font-black whitespace-nowrap ${s.view === 'card' ? 'text-brand-600' : 'text-slate-500'}`}>{t('診察券', 'しんさつけん')}</span>
      </button>
      <Item id="pay" Icon={Wallet} label={t('支払い', 'しはらい')} />
      <Item id="ai" emoji="🐟" label={t('AIに相談', 'そうだん')} />
    </nav>
  )
}
