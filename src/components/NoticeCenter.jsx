import { useState } from 'react'
import { X, Bell, BellRing, TriangleExclamationPoint, ChevronRight } from 'lucide-react'
import { useSim } from '../sim/context.js'

export const osSupported = () => typeof window !== 'undefined' && 'Notification' in window

// ベルを押すと開く「お知らせ」一覧。端末の通知（ブラウザの通知機能）の許可もここから。
export default function NoticeCenter({ onClose }) {
  const { s, d, t } = useSim()
  const list = [...s.notices].reverse()
  const [perm, setPerm] = useState(osSupported() ? Notification.permission : 'unsupported')

  const enable = async () => {
    if (!osSupported()) return
    let p = Notification.permission
    if (p === 'default') p = await Notification.requestPermission()
    setPerm(p)
    if (p === 'granted') {
      d({ type: 'OS_NOTIFY', on: true })
      try {
        new Notification('KIND-AI', { body: '端末への通知をオンにしました。呼び出しなどをお知らせします。', tag: 'kindai-test' })
      } catch {
        /* Android Chrome などはページから直接出せない場合がある */
      }
    }
  }
  const osOn = s.flags.osNotify && perm === 'granted'

  return (
    <div className="absolute inset-x-0 top-0 bottom-0 z-[65] bg-slate-900/30 fade-in" onClick={onClose}>
      <div className="absolute inset-x-0 top-[92px] bg-white rounded-b-3xl shadow-2xl max-h-[75%] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <p className="font-bold text-slate-800 flex items-center gap-2">
            <Bell size={18} className="text-brand-600" /> {t('お知らせ', 'おしらせ')}
          </p>
          <button onClick={onClose} className="p-1 text-slate-400" aria-label="閉じる">
            <X size={20} />
          </button>
        </div>

        {/* 端末への通知 */}
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
          {osOn ? (
            <div className="flex items-center gap-2">
              <BellRing size={16} className="text-emerald-600" />
              <p className="text-xs font-bold text-emerald-700 flex-1">{t('端末にも通知します（呼び出し・帰宅防止など）', 'スマホにも おしらせします')}</p>
              <button onClick={() => d({ type: 'OS_NOTIFY', on: false })} className="text-[11px] font-bold text-slate-400">
                オフにする
              </button>
            </div>
          ) : perm === 'denied' ? (
            <p className="text-[11px] text-slate-500">端末の通知はブラウザの設定でブロックされています。アプリの中のお知らせは引き続き届きます。</p>
          ) : perm === 'unsupported' ? (
            <p className="text-[11px] text-slate-500">この端末のブラウザは通知に対応していません（iPhone の Safari など）。アプリの中のお知らせは届きます。</p>
          ) : (
            <button onClick={enable} className="w-full py-2.5 rounded-xl bg-brand-600 text-white text-sm font-bold flex items-center justify-center gap-2">
              <BellRing size={16} /> {t('端末にも通知する（画面を閉じていても届く想定）', 'スマホにも しらせる')}
            </button>
          )}
        </div>

        <div className="overflow-y-auto">
          {list.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">{t('お知らせはまだありません', 'まだ ありません')}</p>
          ) : (
            list.map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  if (n.view) d({ type: 'VIEW', view: n.view })
                  onClose()
                }}
                className={`w-full text-left px-5 py-3 border-b border-slate-50 flex gap-3 items-start ${n.tone === 'urgent' ? 'bg-rose-50' : n.tone === 'call' ? 'bg-brand-50/50' : ''}`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${n.tone === 'urgent' ? 'bg-rose-600 text-white' : 'bg-brand-50 text-lg'}`}>
                  {n.tone === 'urgent' ? <TriangleExclamationPoint size={18} /> : '🐟'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-slate-400">{n.clock}</p>
                  <p className={`text-sm leading-snug ${n.tone === 'urgent' ? 'font-black text-rose-700' : 'font-bold text-slate-800'}`}>{n.text}</p>
                </div>
                {n.view && <ChevronRight size={16} className="text-slate-300 shrink-0 mt-3" />}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
