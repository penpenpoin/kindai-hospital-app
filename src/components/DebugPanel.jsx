import { useEffect, useRef } from 'react'
import { X, Keyboard, RotateCcw } from 'lucide-react'
import { useSim } from '../sim/context.js'
import { STEPS, SYS, PLACES, SCENES, openTasks } from '../sim/model.js'

const SRC_COLOR = {
  [SYS.step]: '#f8fafc',
  [SYS.app]: '#a5b4fc',
  [SYS.loc]: '#5eead4',
  [SYS.rsv]: '#93c5fd',
  [SYS.emr]: '#f9a8d4',
  [SYS.pay]: '#fcd34d',
  [SYS.push]: '#c4b5fd',
  [SYS.ai]: '#86efac',
  [SYS.transit]: '#7dd3fc',
  [SYS.debug]: '#94a3b8',
  [SYS.family]: '#fda4af',
}

const FLAGS = [
  ['gps', 'G', '位置情報'],
  ['online', 'O', '通信'],
  ['card', 'K', 'カード登録'],
  ['easy', 'Y', 'やさしい表示'],
  ['sound', 'M', '音声'],
]

// 画面の裏で何が起きているか（＝アプリの仕組み）を見せるパネル。px 指定で文字サイズを固定。
export default function DebugPanel({ onClose, onHelp }) {
  const { s, d } = useSim()
  const endRef = useRef(null)
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [s.logs.length])

  const state = [
    ['場面', SCENES.find((x) => x.id === s.scene).label],
    ['時刻', s.clock],
    ['現在地', PLACES[s.location]],
    ['受付', s.reception ? `${s.reception.status === 'confirmed' ? '確定' : '仮'} ${s.reception.no}` : '未'],
    ['到着', s.checkedIn ? '済' : s.needManualCheckin ? '受付機待ち' : '未'],
    ['待ち', s.queueAhead == null ? '—' : `あと${s.queueAhead}人`],
    ['未完了', openTasks(s).map((x) => x.name).join('・') || 'なし'],
    ['支払い', s.paid ? `済（${s.payMethod}）` : '未'],
    ['送信待ち', `${s.pending.length}件`],
  ]

  return (
    <aside
      className="fixed lg:static inset-x-0 bottom-0 z-[90] lg:z-auto h-[45vh] lg:h-[880px] lg:max-h-[calc(100vh-48px)] w-full lg:w-[440px] bg-slate-900 text-slate-200 flex flex-col lg:rounded-3xl shadow-2xl overflow-hidden"
      style={{ fontSize: 12 }}
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
        <span className="font-bold text-white" style={{ fontSize: 14 }}>
          裏側のようす
        </span>
        <span className="text-slate-500">イベントログ</span>
        <div className="ml-auto flex gap-1">
          <button onClick={onHelp} className="p-1.5 rounded hover:bg-white/10" title="キー一覧 (?)">
            <Keyboard size={16} />
          </button>
          <button onClick={() => d({ type: 'RESET' })} className="p-1.5 rounded hover:bg-white/10" title="最初から (R)">
            <RotateCcw size={16} />
          </button>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-white/10" title="閉じる (L)">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-white/10 space-y-3 overflow-y-auto max-h-[40%] lg:max-h-none shrink-0">
        <div className="grid grid-cols-3 gap-1.5">
          {state.map(([k, v]) => (
            <div key={k} className="bg-white/5 rounded-lg px-2 py-1.5 min-w-0">
              <div className="text-slate-500" style={{ fontSize: 10 }}>
                {k}
              </div>
              <div className="font-bold text-white truncate" title={v}>
                {v}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {FLAGS.map(([f, key, label]) => (
            <button
              key={f}
              onClick={() => d({ type: 'TOGGLE', flag: f })}
              className={`px-2 py-1 rounded-md font-bold border ${s.flags[f] ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300' : 'bg-rose-500/15 border-rose-400/40 text-rose-300'}`}
            >
              <kbd className="font-mono opacity-60 mr-1">{key}</kbd>
              {label} {s.flags[f] ? 'ON' : 'OFF'}
            </button>
          ))}
        </div>

        <details className="group" open>
          <summary className="cursor-pointer text-slate-400 font-bold select-none">シナリオ（→ ← で進む／戻る・クリックでジャンプ）</summary>
          <ol className="mt-2 space-y-0.5 max-h-[170px] overflow-y-auto">
            {STEPS.map((st, i) => (
              <li key={i}>
                <button
                  onClick={() => d({ type: 'GOTO', n: i })}
                  className={`w-full text-left px-2 py-1 rounded ${i === s.step ? 'bg-brand-500 text-white font-bold' : i < s.step ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-white/5'}`}
                >
                  {i + 1}. {st.label}
                </button>
              </li>
            ))}
          </ol>
        </details>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 font-mono space-y-1 min-h-0">
        {s.logs.map((l) =>
          l.kind === 'step' ? (
            <div key={l.id} className="pt-2 text-white font-bold font-sans">
              {l.msg}
            </div>
          ) : (
            <div key={l.id} className="flex gap-2 leading-snug">
              <span className="text-slate-600 shrink-0 tabular-nums" style={{ width: 64 }}>
                {l.clock.replace('当日 ', '').replace('前日 ', '前日')}
              </span>
              <span className="min-w-0">
                <span className="font-bold" style={{ color: SRC_COLOR[l.src] ?? '#cbd5e1' }}>
                  {l.kind === 'api' ? '⇄ ' : ''}
                  {l.src}
                </span>
                <span
                  className={
                    l.kind === 'warn' ? 'text-amber-300' : l.kind === 'queued' ? 'text-rose-300' : l.kind === 'debug' ? 'text-slate-500' : 'text-slate-300'
                  }
                >
                  {l.kind === 'warn' ? ' ⚠ ' : ' '}
                  {l.msg}
                </span>
              </span>
            </div>
          ),
        )}
        <div ref={endRef} />
      </div>
      <div className="px-4 py-2 border-t border-white/10 text-slate-500" style={{ fontSize: 10.5 }}>
        ⇄ は外部システムとのやりとり。「（想定）」の連携先・内容は設計案で、実際の仕様は病院・事業者と協議して決める部分です。
      </div>
    </aside>
  )
}
