import { useCallback, useEffect, useRef, useState } from 'react'

// 口の開き具合（0〜1）。話している間だけ、自然に見えるよう2つの波を重ねる。
export function mouthOpen(t, talking) {
  if (!talking) return 0
  return Math.min(1, 0.2 + 0.8 * Math.abs(Math.sin(t * 11)) * (0.65 + 0.35 * Math.sin(t * 3.7)))
}

// 読み上げ＋「いま話しているか」。アバターは talkingRef を毎フレーム見て口を動かす。
// 音声オフや日本語の声がない環境でも、文字数から話す時間を見積もって口だけ動かす。
export function useSpeaker({ enabled, rate = 1 }) {
  const [talking, setTalking] = useState(false)
  const talkingRef = useRef(false)
  const timer = useRef(null)

  const end = useCallback(() => {
    clearTimeout(timer.current)
    talkingRef.current = false
    setTalking(false)
  }, [])

  const stop = useCallback(() => {
    end()
    try {
      window.speechSynthesis?.cancel()
    } catch {
      /* noop */
    }
  }, [end])

  const speak = useCallback(
    (text) => {
      clearTimeout(timer.current)
      const estimate = Math.max(1500, (text.length * 150) / rate)
      talkingRef.current = true
      setTalking(true)
      let voiced = false
      try {
        if (enabled && 'speechSynthesis' in window) {
          const synth = window.speechSynthesis
          synth.cancel()
          const u = new SpeechSynthesisUtterance(text)
          u.lang = 'ja-JP'
          u.rate = rate
          u.pitch = 1.15
          const started = performance.now()
          u.onend = u.onerror = () => {
            // すぐ終わった＝声が出ていない環境。見積もり時間ぶんは口を動かし続ける
            const left = estimate - (performance.now() - started)
            if (left > 300) timer.current = setTimeout(end, left)
            else end()
          }
          synth.speak(u)
          voiced = true
        }
      } catch {
        voiced = false
      }
      // 念のための上限（onend が来ない環境向け）
      timer.current = setTimeout(end, voiced ? estimate * 2.5 + 3000 : estimate)
    },
    [enabled, rate, end],
  )

  useEffect(() => stop, [stop])
  return { talking, talkingRef, speak, stop }
}
