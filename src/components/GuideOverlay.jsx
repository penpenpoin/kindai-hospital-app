import { ChevronRight } from 'lucide-react'
import { GUIDE } from '../guide.js'
import { useSim } from '../sim/context.js'

// 提案資料（スライド）の項目一覧。押すとその機能の場面・画面へ飛ぶ。
// px 指定なのは、やさしい表示で文字が大きくなっても一覧が崩れないようにするため
export default function GuideOverlay({ onClose, onTour }) {
  const { d } = useSim()
  // すぐその場面へ（自動操作なし）
  const go = (g, it) => {
    d({ type: 'JUMP', slide: g.slide, title: it.t, jump: it.jump })
    onClose()
  }
  // 自動操作で、ボタンを順に押してその場所まで案内する
  const tour = (g, it) => {
    onClose()
    onTour(g, it)
  }
  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl max-h-[92vh] flex flex-col" onClick={(e) => e.stopPropagation()} style={{ fontSize: 14 }}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-slate-800" style={{ fontSize: 18 }}>
              提案資料から機能をさがす
            </h2>
            <p className="text-slate-400" style={{ fontSize: 12 }}>
              項目を押すと、自動操作でボタンを順に押してその場所まで案内します（F キーで開閉・Esc で止める）
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 font-bold">
            Esc
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4 space-y-5">
          {GUIDE.map((g) => (
            <section key={g.slide}>
              <p className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                <span className="text-brand-600 font-black tabular-nums" style={{ fontSize: 12 }}>
                  {g.slide}
                </span>
                {g.title}
              </p>
              <div className="grid sm:grid-cols-2 gap-2">
                {g.items.map((it) => (
                  <div key={it.t} className="relative">
                  <button onClick={() => tour(g, it)} className="w-full h-full text-left p-3 pr-16 rounded-2xl bg-slate-50 hover:bg-brand-50 border border-slate-100 hover:border-brand-200 flex items-center gap-2 transition-all">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800">{it.t}</p>
                      <p className="text-slate-500 leading-snug" style={{ fontSize: 11.5 }}>
                        {it.sub}
                      </p>
                      {it.near && (
                        <p className="text-amber-600 leading-snug mt-0.5" style={{ fontSize: 10.5 }}>
                          ※{it.near}
                        </p>
                      )}
                    </div>
                    <ChevronRight size={16} className="text-slate-300 shrink-0" />
                  </button>
                  <button onClick={() => go(g, it)} className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-brand-600 font-bold" style={{ fontSize: 10 }} title="自動操作なしで、すぐその場面へ">
                    すぐ移動
                  </button>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
