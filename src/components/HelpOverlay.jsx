import { KEYMAP } from '../keys.js'

// px 指定にしているのは「やさしい表示」で全体の文字が大きくなっても崩れないようにするため
export default function HelpOverlay({ onClose }) {
  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ fontSize: 14 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-800" style={{ fontSize: 18 }}>
            キーボード操作（デバッグ用）
          </h2>
          <button onClick={onClose} className="text-slate-400 font-bold">
            Esc
          </button>
        </div>
        <table className="w-full">
          <tbody>
            {KEYMAP.map((k) => (
              <tr key={k.label} className="border-t border-slate-100">
                <td className="py-1.5 pr-3 whitespace-nowrap">
                  {k.keys.map((x) => (
                    <kbd
                      key={x}
                      className="inline-block text-center px-1.5 py-0.5 mr-1 rounded-md bg-slate-100 border border-slate-300 font-mono font-bold text-slate-700"
                      style={{ fontSize: 12, minWidth: 22 }}
                    >
                      {x}
                    </kbd>
                  ))}
                </td>
                <td className="py-1.5 text-slate-600">{k.label}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-slate-400 mt-4" style={{ fontSize: 12 }}>
          スマホで見るときは、上のバーの ‹ › で場面を進められます。LOG でイベントログを開閉できます。
        </p>
      </div>
    </div>
  )
}
