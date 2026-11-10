import { useEffect } from 'react'
import { useSim } from '../sim/context.js'

// プッシュ通知風のバナー
export default function Toast() {
  const { s, d } = useSim()
  const tt = s.toast
  useEffect(() => {
    if (!tt) return
    const id = setTimeout(() => d({ type: 'CLEAR_TOAST', id: tt.id }), tt.tone === 'call' ? 9000 : 4500)
    return () => clearTimeout(id)
  }, [tt?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  if (!tt) return null
  const call = tt.tone === 'call'
  return (
    <div className="absolute left-3 right-3 top-24 z-[60] drop-in" key={tt.id}>
      <button
        onClick={() => d({ type: 'CLEAR_TOAST', id: tt.id })}
        className={`w-full text-left rounded-2xl p-3.5 flex gap-3 items-start shadow-2xl border backdrop-blur-xl ${
          call ? 'bg-indigo-600/95 text-white border-indigo-400' : 'bg-white/95 text-slate-800 border-slate-200'
        }`}
      >
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xl shrink-0 ${call ? 'bg-white/20' : 'bg-indigo-50'}`}>🐟</div>
        <div className="min-w-0">
          <p className={`text-[10px] font-bold ${call ? 'text-indigo-100' : 'text-slate-400'}`}>KIND-AI ・ いま</p>
          <p className="text-sm font-bold leading-snug">{tt.text}</p>
        </div>
      </button>
    </div>
  )
}
