import { useEffect, useReducer, useRef, useState, useCallback } from 'react'
import { Bell, User } from 'lucide-react'
import { reducer, init, SCENES, STEPS } from './sim/model.js'
import { Sim } from './sim/context.js'
import { keyToCommand } from './keys.js'
import BottomNav from './components/BottomNav.jsx'
import Toast from './components/Toast.jsx'
import LeaveAlert from './components/LeaveAlert.jsx'
import DebugPanel from './components/DebugPanel.jsx'
import HelpOverlay from './components/HelpOverlay.jsx'
import HomeView from './screens/HomeView.jsx'
import NavView from './screens/NavView.jsx'
import ReceptionView from './screens/ReceptionView.jsx'
import PayView from './screens/PayView.jsx'
import RecordsView from './screens/RecordsView.jsx'
import AIView from './screens/AIView.jsx'
import CardView from './screens/CardView.jsx'

const VIEWS = { home: HomeView, nav: NavView, reception: ReceptionView, pay: PayView, records: RecordsView, ai: AIView, card: CardView }

function speak(text) {
  try {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'ja-JP'
    window.speechSynthesis.speak(u)
  } catch {
    /* 音声が使えない環境では何もしない */
  }
}

export default function App() {
  const [s, d] = useReducer(reducer, undefined, init)
  const [showLog, setShowLog] = useState(() => window.innerWidth >= 1024)
  const [help, setHelp] = useState(false)
  const mainRef = useRef(null)
  const easy = s.flags.easy
  const t = useCallback((normal, easyText) => (easy && easyText ? easyText : normal), [easy])

  // キーボード操作
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea')) return
      const cmd = keyToCommand(e)
      if (!cmd) return
      e.preventDefault()
      if (cmd.sim) d(cmd.sim)
      if (cmd.ui === 'log') setShowLog((v) => !v)
      if (cmd.ui === 'help') setHelp((v) => !v)
      if (cmd.ui === 'close') setHelp(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // やさしい表示：全体の文字を大きく
  useEffect(() => {
    document.documentElement.style.fontSize = easy ? '18.5px' : '16px'
  }, [easy])

  // 画面が変わったら上までスクロール
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 })
  }, [s.view, s.step])

  // 音声（帰宅防止アラート・呼び出し）
  useEffect(() => {
    if (!s.flags.sound || !s.alert) return
    const task = s.tasks.find((x) => x.id === s.alert.tasks[0])
    speak(`田中さん、まだ${easy ? task.easy : task.name}が残っています。`)
  }, [s.alert?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (s.flags.sound && s.toast?.tone === 'call') speak(s.toast.text)
  }, [s.toast?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const View = VIEWS[s.view] ?? HomeView
  const scene = SCENES.find((x) => x.id === s.scene)

  return (
    <Sim.Provider value={{ s, d, t }}>
      <div className="min-h-screen lg:flex lg:items-start lg:justify-center lg:gap-6 lg:p-6">
        {/* ===== スマホ ===== */}
        <div className="relative mx-auto lg:mx-0 w-full max-w-[430px] h-[100dvh] lg:h-[880px] lg:max-h-[calc(100vh-48px)] bg-slate-50 flex flex-col overflow-hidden shadow-2xl lg:rounded-[2.75rem] lg:border-[10px] lg:border-slate-900 shrink-0">
          {/* シミュレーター用トップバー（デモ操作。スマホでも押せるようにボタンも置く） */}
          <div className="bg-slate-900 text-white text-[11px] flex items-center gap-2 px-3 py-1.5 shrink-0 z-50">
            <span className="font-bold opacity-50 tracking-tighter italic hidden sm:inline">Kindai Hosp. DX</span>
            <button onClick={() => d({ type: 'PREV' })} className="px-1.5 rounded bg-white/10 hover:bg-white/20" title="← 戻る">‹</button>
            <span className="font-bold tabular-nums whitespace-nowrap" title={STEPS[s.step].label}>
              {s.step + 1}/{STEPS.length} {scene.label}
            </span>
            <button onClick={() => d({ type: 'NEXT' })} className="px-1.5 rounded bg-white/10 hover:bg-white/20" title="→ 進む">›</button>
            <span className="opacity-60 tabular-nums">{s.clock}</span>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => d({ type: 'TOGGLE', flag: 'easy' })}
                className={`${easy ? 'text-yellow-400' : 'text-white/40'} font-bold uppercase`}
                title="Y"
              >
                Easy Mode
              </button>
              <button onClick={() => setShowLog((v) => !v)} className={`${showLog ? 'text-emerald-400' : 'text-white/40'} font-bold`} title="L">
                LOG
              </button>
              <button onClick={() => setHelp(true)} className="text-white/40 font-bold" title="?">?</button>
            </div>
          </div>

          <header className="bg-white/80 backdrop-blur-md px-5 py-3 flex justify-between items-center shrink-0 z-40 border-b border-slate-100">
            <button className="flex items-center gap-2" onClick={() => d({ type: 'VIEW', view: 'home' })}>
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-black italic shadow-lg shadow-brand-100">K</div>
              <h1 className="font-black text-brand-600 text-lg tracking-tight">KIND-AI</h1>
            </button>
            <div className="flex gap-1 items-center">
              {!s.flags.online && <span className="text-[10px] font-bold bg-slate-800 text-white px-2 py-0.5 rounded-full">オフライン</span>}
              <button className="p-2 text-slate-400 hover:text-brand-600 relative">
                <Bell size={20} />
                {s.toast && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />}
              </button>
              <button className="p-2 text-slate-400 hover:text-brand-600">
                <User size={20} />
              </button>
            </div>
          </header>

          <Toast />

          <main ref={mainRef} className="flex-1 overflow-y-auto no-scrollbar">
            <View key={s.view} />
          </main>

          <BottomNav />
          <LeaveAlert />
        </div>

        {/* ===== デバッグパネル ===== */}
        {showLog && <DebugPanel onClose={() => setShowLog(false)} onHelp={() => setHelp(true)} />}
        {help && <HelpOverlay onClose={() => setHelp(false)} />}
      </div>
    </Sim.Provider>
  )
}
