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
import GuideOverlay from './components/GuideOverlay.jsx'
import NoticeCenter, { osSupported } from './components/NoticeCenter.jsx'
import HomeView from './screens/HomeView.jsx'
import NavView from './screens/NavView.jsx'
import ReceptionView from './screens/ReceptionView.jsx'
import PayView from './screens/PayView.jsx'
import RecordsView from './screens/RecordsView.jsx'
import AIView from './screens/AIView.jsx'
import CardView from './screens/CardView.jsx'
import MapView from './screens/MapView.jsx'
import AccountView from './screens/AccountView.jsx'
import CommunityView from './screens/CommunityView.jsx'
import QueueView from './screens/QueueView.jsx'
import { ErView, ParkingView, ShopsView, MedsView, ReceiptsView } from './screens/InfoViews.jsx'

const VIEWS = { home: HomeView, nav: NavView, reception: ReceptionView, pay: PayView, records: RecordsView, ai: AIView, card: CardView, map: MapView, account: AccountView, community: CommunityView, queue: QueueView, er: ErView, parking: ParkingView, shops: ShopsView, meds: MedsView, receipts: ReceiptsView }

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
  const [guide, setGuide] = useState(false)
  const [bell, setBell] = useState(false)
  const bellRef = useRef(null) // キーボード（B）から最新の openBell を呼ぶため
  const [seen, setSeen] = useState(0) // ここまで読んだお知らせの id
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
      if (cmd.ui === 'guide') setGuide((v) => !v)
      if (cmd.ui === 'bell') bellRef.current?.()
      if (cmd.ui === 'close') {
        setHelp(false)
        setGuide(false)
      }
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

  // 提案資料からジャンプしたとき：該当箇所までスクロールして光らせる
  useEffect(() => {
    if (!s.anchor) return
    const id = setTimeout(() => {
      const el = mainRef.current?.querySelector(`[data-anchor="${s.anchor.id}"]`)
      if (!el) return
      el.scrollIntoView({ block: 'center', behavior: 'smooth' })
      el.classList.remove('jump-flash')
      void el.offsetWidth
      el.classList.add('jump-flash')
    }, 120)
    return () => clearTimeout(id)
  }, [s.anchor?.seq])

  // 新しいお知らせ → 端末の通知（許可があれば）＋スマホならバイブ
  useEffect(() => {
    const n = s.lastNotice
    if (!n) return
    try {
      if (n.tone !== 'info') navigator.vibrate?.(n.tone === 'urgent' ? [300, 120, 300, 120, 300] : [200, 100, 200])
    } catch {
      /* noop */
    }
    if (!s.flags.osNotify || !osSupported() || Notification.permission !== 'granted') return
    try {
      const os = new Notification(n.tone === 'urgent' ? '⚠ KIND-AI 近大病院' : 'KIND-AI 近大病院', { body: n.text, tag: `kindai-${n.id}`, requireInteraction: n.tone !== 'info' })
      os.onclick = () => {
        window.focus()
        if (n.view) d({ type: 'VIEW', view: n.view })
        os.close()
      }
    } catch {
      /* ページから直接通知を出せないブラウザ（Android Chrome 等）では、アプリ内のお知らせのみ */
    }
  }, [s.lastNotice?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (s.notices.length === 0) setSeen(0)
  }, [s.notices.length])
  const unread = s.notices.filter((n) => n.id > seen).length
  const openBell = () => {
    setBell((v) => !v)
    setSeen(s.notices.reduce((m, n) => Math.max(m, n.id), 0))
  }
  bellRef.current = openBell

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
              <button onClick={() => setGuide(true)} className="text-white/70 font-bold" title="提案資料から機能へ飛ぶ (F)">資料</button>
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
              <button onClick={openBell} className={`p-2 hover:text-brand-600 relative ${bell ? 'text-brand-600' : 'text-slate-400'}`} aria-label={`お知らせ（未読 ${unread} 件）`}>
                <Bell size={20} />
                {unread > 0 && (
                  <span className="absolute top-0.5 right-0 min-w-[18px] h-[18px] px-1 bg-brand-600 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>
              <button
                onClick={() => d({ type: 'VIEW', view: 'account' })}
                className={`p-2 hover:text-brand-600 ${s.view === 'account' ? 'text-brand-600' : 'text-slate-400'}`}
                aria-label="アカウント・家族連携"
              >
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
          {bell && <NoticeCenter onClose={() => setBell(false)} />}
        </div>

        {/* ===== デバッグパネル ===== */}
        {showLog && <DebugPanel onClose={() => setShowLog(false)} onHelp={() => setHelp(true)} />}
        {help && <HelpOverlay onClose={() => setHelp(false)} />}
        {guide && <GuideOverlay onClose={() => setGuide(false)} />}
      </div>
    </Sim.Provider>
  )
}
