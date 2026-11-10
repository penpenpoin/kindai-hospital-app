import { useCallback, useRef, useState } from 'react'
import { FastForward, Square, SkipForward, Settings2 } from 'lucide-react'
import { STEPS } from '../sim/model.js'

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

// 提案資料の項目を「自動操作」で見せる。
//  - tap：指のカーソルが動いて、本物のボタンを押す（React のクリックがそのまま動く）
//  - time：時間を進める場面は早送りの画面を出し、裏でシナリオを1段ずつ進める
//  - flag：画面のボタンでは変えられないデモ設定は、ラベルを出してから変える
export function useTour({ d, sRef, phoneRef }) {
  const [ui, setUi] = useState(null)
  const token = useRef(0)
  const skip = useRef(false)

  const stop = useCallback(() => {
    token.current++
    setUi(null)
  }, [])

  const run = useCallback(
    async (group, item) => {
      const my = ++token.current
      const alive = () => token.current === my
      const phone = phoneRef.current
      if (!phone) return
      const pr = () => phone.getBoundingClientRect()
      const center = () => ({ x: phone.clientWidth / 2, y: phone.clientHeight * 0.55 })
      let cur = center()
      const total = item.tour.length
      const base = { slide: group.slide, title: item.t, total, idx: 0, say: '', cursor: { ...cur, show: false, tap: false }, time: null, flag: null, done: null }
      setUi(base)
      // いつも「前日の夜・ホーム」から始める
      d({ type: 'JUMP', slide: group.slide, title: item.t, jump: { step: 0, view: 'home' } })
      await wait(500)

      for (let i = 0; i < total && alive(); i++) {
        const op = item.tour[i]
        setUi((u) => ({ ...u, idx: i, say: op.say, flag: null }))

        if (op.t === 'time') {
          const start = sRef.current.step
          const passed = []
          skip.current = false
          setUi((u) => ({ ...u, cursor: { ...u.cursor, show: false }, time: { from: sRef.current.clock, clock: sRef.current.clock, passed: [], done: 0, total: op.to - start } }))
          await wait(500)
          while (alive() && sRef.current.step < op.to) {
            d({ type: 'NEXT' })
            await wait(skip.current ? 60 : 50)
            const s = sRef.current
            passed.push(STEPS[s.step].label)
            setUi((u) => ({ ...u, time: { ...u.time, clock: s.clock, passed: [...passed], done: s.step - start } }))
            await wait(skip.current ? 60 : 850)
          }
          await wait(skip.current ? 100 : 500)
          setUi((u) => ({ ...u, time: null }))
          await wait(450)
          continue
        }

        if (op.t === 'flag') {
          setUi((u) => ({ ...u, flag: op.label }))
          await wait(1100)
          d({ type: 'SET_FLAGS', flags: op.set, label: op.label })
          await wait(900)
          continue
        }

        if (op.t === 'wait') {
          await wait(op.ms)
          continue
        }

        // tap / look：対象を見つけて、画面内にスクロールしてから指を動かす
        const sel = op.t === 'tap' ? `[data-tour="${op.target}"]` : `[data-anchor="${op.anchor}"]`
        let el = null
        for (let k = 0; k < 20 && !el && alive(); k++) {
          el = phone.querySelector(sel)
          if (!el) await wait(100)
        }
        if (!el && alive()) console.warn(`[tour] ${item.t}: 見つからない ${sel}`)
        if (!el || !alive()) continue
        el.scrollIntoView({ block: 'center', behavior: 'smooth' })
        await wait(550)
        const r = el.getBoundingClientRect()
        const p = pr()
        const target = { x: r.left - p.left - phone.clientLeft + r.width / 2, y: r.top - p.top - phone.clientTop + Math.min(r.height / 2, 60) }
        cur = target
        setUi((u) => ({ ...u, cursor: { ...target, show: true, tap: false } }))
        await wait(750)
        if (!alive()) break
        if (op.t === 'tap') {
          setUi((u) => ({ ...u, cursor: { ...u.cursor, tap: true } }))
          await wait(220)
          el.click()
          await wait(380)
          setUi((u) => ({ ...u, cursor: { ...u.cursor, tap: false } }))
          await wait(700)
        } else {
          el.classList.remove('jump-flash')
          void el.offsetWidth
          el.classList.add('jump-flash')
          await wait(1700)
        }
      }
      if (!alive()) return
      setUi((u) => ({ ...u, idx: total, say: '', done: item.done || '案内はここまでです', cursor: { ...u.cursor, show: false } }))
      await wait(2600)
      if (alive()) setUi(null)
    },
    [d, sRef, phoneRef],
  )

  const fast = useCallback(() => (skip.current = true), [])
  return { ui, run, stop, fast }
}

// スマホ画面の上にかぶせる層（指・字幕・早送り画面）。操作の邪魔をしないよう、ボタン以外は押せない
export function TourLayer({ ui, onStop, onFast }) {
  if (!ui) return null
  const { cursor, time } = ui
  return (
    <div className="absolute inset-0 z-[80] pointer-events-none" style={{ fontSize: 14 }}>
      {/* 上：どの項目の案内か・止める */}
      <div className="absolute top-[42px] inset-x-3 flex items-center gap-2 pointer-events-auto">
        <div className="flex-1 min-w-0 bg-slate-900/90 text-white rounded-full pl-3 pr-2 py-1.5 flex items-center gap-2 shadow-lg backdrop-blur">
          <span className="font-black text-brand-300 shrink-0" style={{ fontSize: 11 }}>
            資料 {ui.slide}
          </span>
          <span className="font-bold truncate" style={{ fontSize: 12 }}>
            {ui.title}
          </span>
          <span className="ml-auto flex gap-1 shrink-0">
            {Array.from({ length: ui.total }).map((_, i) => (
              <span key={i} className={`w-1.5 h-1.5 rounded-full ${i < ui.idx ? 'bg-brand-400' : i === ui.idx ? 'bg-white' : 'bg-white/30'}`} />
            ))}
          </span>
        </div>
        <button onClick={onStop} className="bg-white/95 text-slate-700 rounded-full px-3 py-1.5 font-bold shadow-lg flex items-center gap-1" style={{ fontSize: 12 }}>
          <Square size={12} /> 止める
        </button>
      </div>

      {/* 指のカーソル */}
      {cursor.show && (
        <div className="absolute transition-all duration-700 ease-in-out" style={{ left: cursor.x, top: cursor.y, transform: 'translate(-6px, -4px)' }}>
          {cursor.tap && <span className="absolute -left-5 -top-5 w-12 h-12 rounded-full bg-brand-500/40 animate-ping" />}
          <span className={`absolute -left-3 -top-3 w-8 h-8 rounded-full border-2 border-brand-500 bg-brand-500/15 transition-transform ${cursor.tap ? 'scale-75' : 'scale-100'}`} />
          <span className={`relative block text-3xl drop-shadow-lg transition-transform ${cursor.tap ? 'scale-90 translate-y-0.5' : ''}`} style={{ marginLeft: 2, marginTop: 6 }}>
            👆
          </span>
        </div>
      )}

      {/* デモ設定の変更 */}
      {ui.flag && (
        <div className="absolute top-[84px] inset-x-0 flex justify-center">
          <div className="bg-amber-400 text-amber-950 rounded-full px-4 py-2 font-bold shadow-lg flex items-center gap-2 drop-in" style={{ fontSize: 12.5 }}>
            <Settings2 size={15} /> デモ設定：{ui.flag}
          </div>
        </div>
      )}

      {/* 時間の早送り */}
      {time && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-white px-8 fade-in pointer-events-auto">
          <div className="flex items-center gap-2 text-brand-300 font-black tracking-widest" style={{ fontSize: 12 }}>
            <FastForward size={16} className="animate-pulse" /> 時間を進めています
          </div>
          <div className="mt-3 font-black tabular-nums tracking-tight" style={{ fontSize: 44, lineHeight: 1 }}>
            {time.clock}
          </div>
          <div className="text-white/50 mt-1" style={{ fontSize: 11 }}>
            {time.from} から
          </div>
          <div className="w-full h-1.5 bg-white/15 rounded-full mt-5 overflow-hidden">
            <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${time.total ? (time.done / time.total) * 100 : 100}%` }} />
          </div>
          <ol className="w-full mt-5 space-y-1.5 min-h-[120px]">
            {time.passed.slice(-4).map((p, i, arr) => (
              <li key={p} className={`flex items-center gap-2 fade-in ${i === arr.length - 1 ? 'text-white font-bold' : 'text-white/45'}`} style={{ fontSize: 13 }}>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${i === arr.length - 1 ? 'bg-brand-400' : 'bg-white/30'}`} />
                {p}
              </li>
            ))}
          </ol>
          <button onClick={onFast} className="mt-4 text-white/70 font-bold flex items-center gap-1 border border-white/20 rounded-full px-3 py-1" style={{ fontSize: 12 }}>
            <SkipForward size={13} /> スキップ
          </button>
        </div>
      )}

      {/* 字幕 */}
      {(ui.say || ui.done) && !time && (
        <div className="absolute bottom-[92px] inset-x-3 flex justify-center">
          <div key={ui.say || ui.done} className={`rounded-2xl px-4 py-3 shadow-2xl font-bold leading-snug fade-in ${ui.done ? 'bg-brand-600 text-white' : 'bg-slate-900/92 text-white'}`} style={{ fontSize: 13.5 }}>
            {ui.done ? `✓ ${ui.done}` : ui.say}
          </div>
        </div>
      )}
    </div>
  )
}
