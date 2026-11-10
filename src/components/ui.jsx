import { ArrowLeft } from 'lucide-react'
import { SIGNS } from '../sim/model.js'
import { useSim } from '../sim/context.js'

export function Page({ title, badge, children, back = true }) {
  const { d } = useSim()
  return (
    <div className="p-5 fade-in space-y-5 pb-8">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {back && (
            <button onClick={() => d({ type: 'VIEW', view: 'home' })} className="p-1.5 -ml-1.5 rounded-full text-slate-400 hover:bg-slate-100" aria-label="もどる">
              <ArrowLeft size={22} />
            </button>
          )}
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h2>
        </div>
        {badge}
      </div>
      {children}
    </div>
  )
}

export function Card({ className = '', children, ...rest }) {
  return (
    <div className={`bg-white rounded-3xl p-4 shadow-xl shadow-slate-200/50 border border-slate-100 ${className}`} {...rest}>
      {children}
    </div>
  )
}

// 院内の案内板と同じ「色＋記号」
export function Sign({ id, size = 'md' }) {
  const { t } = useSim()
  const sg = SIGNS[id]
  if (!sg) return null
  const big = size === 'lg'
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`${big ? 'min-w-14 h-14 px-2 text-2xl rounded-2xl' : 'min-w-8 h-7 px-1 text-xs rounded-lg'} inline-flex items-center justify-center font-black text-white shadow shrink-0`}
        style={{ background: sg.color }}
      >
        {sg.letter}
      </span>
      {big && <span className="font-bold text-slate-700">{t(sg.name, sg.easy)}</span>}
    </span>
  )
}

export function Pill({ children, tone = 'blue' }) {
  const tones = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
    rose: 'bg-rose-100 text-rose-600',
    slate: 'bg-slate-100 text-slate-500',
  }
  return <span className={`${tones[tone]} px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap`}>{children}</span>
}

export function Btn({ children, tone = 'primary', className = '', ...rest }) {
  const tones = {
    primary: 'bg-brand-600 text-white shadow-lg shadow-brand-200',
    dark: 'bg-slate-800 text-white',
    ghost: 'bg-slate-100 text-slate-700',
    danger: 'bg-rose-600 text-white shadow-lg shadow-rose-200',
    white: 'bg-white text-brand-700',
  }
  return (
    <button
      className={`w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[.98] disabled:opacity-40 ${tones[tone]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

// 審査員が自分で触るとき用の「出来事を起こす」ボタン（キーボードと同じ動き）
export function Demo({ children, onClick, tour }) {
  return (
    <button
      data-tour={tour}
      onClick={onClick}
      className="w-full text-[11px] font-bold text-slate-400 border border-dashed border-slate-300 rounded-xl py-2 hover:text-brand-500 hover:border-brand-300"
    >
      ▶ デモ：{children}
    </button>
  )
}
