import { useEffect, useRef } from 'react'
import { mouthOpen } from './useSpeaker.js'

// SVG のキャラ。まばたき・ふわふわ揺れ・しっぽ（鼻）・口パクを requestAnimationFrame で動かす。
export default function Avatar2D({ who = 'maguro', talkingRef, className = '' }) {
  const body = useRef(null)
  const swing = useRef(null)
  const eyes = useRef(null)
  const mouth = useRef(null)

  useEffect(() => {
    let raf
    const t0 = performance.now()
    const cfg = who === 'maguro' ? { pivot: '192 100', eye: '62 86', mouthBase: 1.5, mouthAmp: 10 } : { pivot: '104 104', eye: '122 80', mouthBase: 1.2, mouthAmp: 9 }
    const loop = (now) => {
      const t = (now - t0) / 1000
      const talking = talkingRef?.current
      body.current?.setAttribute('transform', `translate(0 ${(Math.sin(t * 1.6) * 4).toFixed(2)}) rotate(${(Math.sin(t * 1.1) * 2).toFixed(2)} 130 100)`)
      swing.current?.setAttribute('transform', `rotate(${(Math.sin(t * (talking ? 7 : 3)) * (who === 'maguro' ? 12 : 8)).toFixed(2)} ${cfg.pivot})`)
      const blink = t % 3.8 < 0.13 ? 0.1 : 1
      const [ex, ey] = cfg.eye.split(' ')
      eyes.current?.setAttribute('transform', `translate(${ex} ${ey}) scale(1 ${blink}) translate(${-ex} ${-ey})`)
      mouth.current?.setAttribute('ry', (cfg.mouthBase + mouthOpen(t, talking) * cfg.mouthAmp).toFixed(2))
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [who, talkingRef])

  return (
    <svg viewBox="0 0 260 200" className={className} role="img" aria-label={who === 'maguro' ? '近大マグロ' : 'マンモス'}>
      <ellipse cx="130" cy="188" rx="80" ry="7" fill="#0f172a" opacity=".08" />
      {who === 'maguro' ? (
        <g ref={body}>
          {/* しっぽ */}
          <g ref={swing}>
            <path d="M188 100 L244 54 Q228 100 244 146 Z" fill="#1e3a8a" />
          </g>
          {/* 小さなひれ（マグロの黄色い小離鰭） */}
          {[150, 164, 178].map((x) => (
            <g key={x}>
              <path d={`M${x} 56 l8 -9 l3 11 z`} fill="#facc15" />
              <path d={`M${x} 144 l8 9 l3 -11 z`} fill="#facc15" />
            </g>
          ))}
          <path d="M100 52 L128 16 L146 54 Z" fill="#1e3a8a" />
          <ellipse cx="115" cy="100" rx="92" ry="56" fill="#1e3a8a" />
          <ellipse cx="108" cy="122" rx="82" ry="32" fill="#e2e8f0" />
          <path d="M40 104 Q115 92 196 100" stroke="#93c5fd" strokeWidth="3" fill="none" opacity=".7" />
          <path d="M118 112 Q142 126 152 144 Q128 136 110 120 Z" fill="#94a3b8" />
          <g ref={eyes}>
            <circle cx="62" cy="86" r="17" fill="#fff" />
            <circle cx="57" cy="87" r="9" fill="#0f172a" />
            <circle cx="54" cy="83" r="3" fill="#fff" />
          </g>
          <ellipse cx="80" cy="112" rx="9" ry="5" fill="#fb7185" opacity=".55" />
          <ellipse ref={mouth} cx="36" cy="110" rx="9" ry="1.5" fill="#7f1d1d" />
        </g>
      ) : (
        <g ref={body}>
          <ellipse cx="150" cy="122" rx="78" ry="58" fill="#92400e" />
          <rect x="100" y="150" width="22" height="34" rx="9" fill="#7c2d12" />
          <rect x="176" y="150" width="22" height="34" rx="9" fill="#7c2d12" />
          <ellipse cx="160" cy="78" rx="30" ry="34" fill="#78350f" />
          <circle cx="122" cy="86" r="48" fill="#a16207" />
          <path d="M108 40 q8 -16 18 -4 q8 -14 16 2" stroke="#78350f" strokeWidth="6" fill="none" strokeLinecap="round" />
          {/* 鼻（話すと揺れる） */}
          <g ref={swing}>
            <path d="M104 104 C92 132 96 160 116 166 C128 170 132 156 122 152 C110 148 112 128 120 108 Z" fill="#a16207" />
          </g>
          <path d="M92 118 C70 132 70 152 86 160" stroke="#fff7ed" strokeWidth="7" fill="none" strokeLinecap="round" />
          <path d="M136 120 C150 136 150 154 136 162" stroke="#fff7ed" strokeWidth="7" fill="none" strokeLinecap="round" />
          <g ref={eyes}>
            <circle cx="104" cy="80" r="8" fill="#1c1917" />
            <circle cx="140" cy="80" r="8" fill="#1c1917" />
            <circle cx="101" cy="77" r="2.5" fill="#fff" />
            <circle cx="137" cy="77" r="2.5" fill="#fff" />
          </g>
          <ellipse cx="92" cy="98" rx="8" ry="5" fill="#fb7185" opacity=".5" />
          <ellipse cx="152" cy="98" rx="8" ry="5" fill="#fb7185" opacity=".5" />
          <ellipse ref={mouth} cx="134" cy="112" rx="8" ry="1.2" fill="#7f1d1d" />
        </g>
      )}
    </svg>
  )
}
