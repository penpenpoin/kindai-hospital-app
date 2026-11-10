import { useEffect, useId, useRef } from 'react'
import { mouthOpen } from './useSpeaker.js'

// SVG のキャラ（近大マグロ／マンモス）。
// まばたき・ふわふわ揺れ・しっぽ（鼻）・口パク（話すと口の中と舌が見える）を requestAnimationFrame で動かす。
export default function Avatar2D({ who = 'maguro', talkingRef, className = '' }) {
  const uid = useId().replace(/:/g, '')
  const body = useRef(null)
  const swing = useRef(null)
  const eyes = useRef(null)
  const mouth = useRef(null)
  const tongue = useRef(null)
  const cheeks = useRef(null)
  const fx = useRef(null)

  useEffect(() => {
    let raf
    const t0 = performance.now()
    const M = who === 'maguro'
    const cfg = M ? { pivot: '190 104', eye: [70, 88], mouthY: 112, amp: 13 } : { pivot: '112 112', eye: [134, 84], mouthY: 121, amp: 11 }
    const loop = (now) => {
      const t = (now - t0) / 1000
      const talking = !!talkingRef?.current
      const m = mouthOpen(t, talking)
      body.current?.setAttribute('transform', `translate(0 ${(Math.sin(t * 1.6) * 4).toFixed(2)}) rotate(${(Math.sin(t * 1.1) * (M ? 2.2 : 1.2)).toFixed(2)} 130 105)`)
      swing.current?.setAttribute('transform', `rotate(${(Math.sin(t * (talking ? 7 : 3)) * (M ? 13 : 7)).toFixed(2)} ${cfg.pivot})`)
      // まばたき（ときどき2回続けて）
      const ph = t % 4.2
      const blink = ph < 0.12 || (ph > 0.3 && ph < 0.4 && Math.floor(t / 4.2) % 3 === 0) ? 0.08 : 1
      const [ex, ey] = cfg.eye
      eyes.current?.setAttribute('transform', `translate(${ex} ${ey}) scale(1 ${blink}) translate(${-ex} ${-ey})`)
      // 口：縦に開く。開いたら舌が見える
      mouth.current?.setAttribute('transform', `translate(0 ${cfg.mouthY}) scale(1 ${(0.12 + m).toFixed(3)}) translate(0 ${-cfg.mouthY})`)
      tongue.current?.setAttribute('opacity', m > 0.35 ? '1' : '0')
      // 話している間はほっぺが少し赤く、泡（マグロ）・音符（マンモス）が出る
      cheeks.current?.setAttribute('opacity', (0.45 + (talking ? 0.25 : 0) + Math.sin(t * 2) * 0.05).toFixed(2))
      fx.current?.setAttribute('opacity', talking ? '1' : '0.35')
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [who, talkingRef])

  const g = (n) => `${n}-${uid}`

  return (
    <svg viewBox="0 0 260 210" className={className} role="img" aria-label={who === 'maguro' ? '近大マグロ' : 'マンモス'}>
      <defs>
        <style>{`
          @keyframes rise-${uid}{0%{transform:translateY(0);opacity:0}15%{opacity:.9}100%{transform:translateY(-120px);opacity:0}}
          .b-${uid}{animation:rise-${uid} 3.2s ease-in infinite;transform-box:fill-box}
          @keyframes nt-${uid}{0%{transform:translate(0,0) rotate(0);opacity:0}20%{opacity:1}100%{transform:translate(18px,-60px) rotate(18deg);opacity:0}}
          .n-${uid}{animation:nt-${uid} 2.6s ease-out infinite;transform-box:fill-box}
        `}</style>
        <filter id={g('sh')} x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0f172a" floodOpacity=".18" />
        </filter>
        {/* マグロ */}
        <linearGradient id={g('back')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1e2f6b" />
          <stop offset=".45" stopColor="#2f4fa8" />
          <stop offset=".62" stopColor="#7d93c9" />
          <stop offset=".75" stopColor="#e7ecf5" />
          <stop offset="1" stopColor="#ffffff" />
        </linearGradient>
        <linearGradient id={g('fin')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2f4fa8" />
          <stop offset="1" stopColor="#16245a" />
        </linearGradient>
        <linearGradient id={g('gold')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fde047" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
        <radialGradient id={g('shine')} cx=".35" cy=".25" r=".6">
          <stop offset="0" stopColor="#fff" stopOpacity=".55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={g('iris')} cx=".4" cy=".4" r=".6">
          <stop offset="0" stopColor="#334155" />
          <stop offset="1" stopColor="#020617" />
        </radialGradient>
        <linearGradient id={g('sea')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e0f2fe" />
          <stop offset="1" stopColor="#bae6fd" />
        </linearGradient>
        {/* マンモス */}
        <radialGradient id={g('fur')} cx=".4" cy=".3" r=".8">
          <stop offset="0" stopColor="#c08a4a" />
          <stop offset=".6" stopColor="#9a5b28" />
          <stop offset="1" stopColor="#6b3a17" />
        </radialGradient>
        <radialGradient id={g('head')} cx=".4" cy=".35" r=".7">
          <stop offset="0" stopColor="#d4a062" />
          <stop offset="1" stopColor="#9a5b28" />
        </radialGradient>
        <linearGradient id={g('ivory')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fffbeb" />
          <stop offset="1" stopColor="#e7d8b5" />
        </linearGradient>
        <linearGradient id={g('field')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ecfccb" />
          <stop offset="1" stopColor="#bef264" />
        </linearGradient>
      </defs>

      {who === 'maguro' ? (
        <>
          {/* 背景：海と泡 */}
          <ellipse cx="130" cy="196" rx="96" ry="9" fill="#0f172a" opacity=".08" />
          <g ref={fx}>
            {[
              [24, 150, 5, 0],
              [36, 170, 3.5, 1.1],
              [16, 176, 2.5, 2.1],
            ].map(([x, y, r, delay]) => (
              <circle key={x} className={`b-${uid}`} style={{ animationDelay: `${delay}s` }} cx={x} cy={y} r={r} fill="none" stroke="#7dd3fc" strokeWidth="1.6" />
            ))}
          </g>
          <g ref={body} filter={`url(#${g('sh')})`}>
            {/* しっぽ */}
            <g ref={swing}>
              <path d="M186 104 C200 92 214 70 240 50 C232 80 230 96 236 104 C230 112 232 128 240 158 C214 138 200 116 186 104 Z" fill={`url(#${g('fin')})`} stroke="#0f1a44" strokeWidth="2" strokeLinejoin="round" />
            </g>
            {/* 小離鰭（黄色） */}
            {[148, 161, 174].map((x, i) => (
              <g key={x} stroke="#b45309" strokeWidth="1" strokeLinejoin="round">
                <path d={`M${x} ${60 + i * 5} l9 -10 l3 13 z`} fill={`url(#${g('gold')})`} />
                <path d={`M${x} ${148 - i * 5} l9 10 l3 -13 z`} fill={`url(#${g('gold')})`} />
              </g>
            ))}
            {/* 背びれ */}
            <path d="M96 54 C104 34 118 18 132 12 C134 30 140 44 150 58 Z" fill={`url(#${g('fin')})`} stroke="#0f1a44" strokeWidth="2" strokeLinejoin="round" />
            <path d="M118 150 C124 164 134 172 146 176 C142 164 142 156 146 148 Z" fill={`url(#${g('fin')})`} stroke="#0f1a44" strokeWidth="2" strokeLinejoin="round" />
            {/* 体 */}
            <path d="M22 104 C26 66 70 44 120 46 C162 48 192 76 196 104 C192 132 162 160 120 162 C70 164 26 142 22 104 Z" fill={`url(#${g('back')})`} stroke="#0f1a44" strokeWidth="2.5" />
            <path d="M44 98 C90 90 150 92 190 100" stroke="#93c5fd" strokeWidth="2.5" fill="none" opacity=".7" strokeLinecap="round" />
            <path d="M60 122 C100 130 150 130 186 114" stroke="#cbd5e1" strokeWidth="1.5" fill="none" opacity=".8" strokeLinecap="round" />
            <ellipse cx="96" cy="72" rx="52" ry="20" fill={`url(#${g('shine')})`} />
            {/* エラ・胸びれ */}
            <path d="M98 76 C108 92 108 116 98 132" stroke="#1e2f6b" strokeWidth="2" fill="none" opacity=".55" strokeLinecap="round" />
            <path d="M112 112 C130 116 148 126 156 142 C138 140 122 132 108 122 Z" fill="#a5b4fc" stroke="#3730a3" strokeWidth="1.5" strokeLinejoin="round" opacity=".9" />
            {/* 目 */}
            <g ref={eyes}>
              <circle cx="70" cy="88" r="19" fill="#fff" stroke="#0f1a44" strokeWidth="2" />
              <circle cx="65" cy="90" r="11" fill={`url(#${g('iris')})`} />
              <circle cx="61" cy="85" r="4" fill="#fff" />
              <circle cx="69" cy="95" r="1.8" fill="#fff" opacity=".9" />
            </g>
            <path d="M54 66 C62 62 74 62 82 66" stroke="#0f1a44" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {/* ほっぺ */}
            <g ref={cheeks}>
              <ellipse cx="88" cy="114" rx="10" ry="6" fill="#fb7185" />
            </g>
            {/* 口 */}
            <g ref={mouth}>
              <path d="M28 104 C34 104 46 104 52 106 C50 116 40 122 32 120 C28 116 26 110 28 104 Z" fill="#7f1d1d" stroke="#0f1a44" strokeWidth="1.5" strokeLinejoin="round" />
              <ellipse ref={tongue} cx="40" cy="116" rx="7" ry="3.5" fill="#fb7185" opacity="0" />
            </g>
          </g>
        </>
      ) : (
        <>
          {/* 背景：草原と音符 */}
          <ellipse cx="135" cy="198" rx="100" ry="9" fill="#365314" opacity=".12" />
          <g ref={fx} fill="#a16207">
            <text className={`n-${uid}`} x="210" y="70" fontSize="18" style={{ animationDelay: '0s' }}>
              ♪
            </text>
            <text className={`n-${uid}`} x="226" y="90" fontSize="14" style={{ animationDelay: '1.2s' }}>
              ♫
            </text>
          </g>
          <g ref={body} filter={`url(#${g('sh')})`}>
            {/* 体・足 */}
            <ellipse cx="158" cy="128" rx="78" ry="56" fill={`url(#${g('fur')})`} stroke="#4a2810" strokeWidth="2.5" />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <path key={i} d={`M${108 + i * 18} ${88 + (i % 2) * 6} q6 -8 12 0`} stroke="#4a2810" strokeWidth="1.6" fill="none" opacity=".45" strokeLinecap="round" />
            ))}
            {[
              [104, '#6b3a17'],
              [146, '#7c4419'],
              [186, '#6b3a17'],
              [214, '#7c4419'],
            ].map(([x, c]) => (
              <g key={x}>
                <rect x={x} y="160" width="24" height="34" rx="10" fill={c} stroke="#4a2810" strokeWidth="2" />
                <path d={`M${x + 4} 190 h4 M${x + 10} 190 h4 M${x + 16} 190 h4`} stroke="#fef3c7" strokeWidth="2.5" strokeLinecap="round" />
              </g>
            ))}
            <path d="M232 112 q16 -6 14 12" stroke="#4a2810" strokeWidth="3" fill="none" strokeLinecap="round" />
            {/* 耳 */}
            <path d="M160 52 C194 46 210 80 200 110 C192 128 170 126 162 112 Z" fill="#7c4419" stroke="#4a2810" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M168 64 C188 64 196 84 190 104 C184 112 174 110 170 102 Z" fill="#d4a062" opacity=".55" />
            {/* 頭 */}
            <circle cx="128" cy="86" r="52" fill={`url(#${g('head')})`} stroke="#4a2810" strokeWidth="2.5" />
            <ellipse cx="112" cy="62" rx="26" ry="14" fill="#fff" opacity=".18" />
            {/* 頭のけ */}
            <path d="M110 38 C110 22 124 20 124 34 C126 18 142 20 138 36 C146 26 156 34 148 44" stroke="#4a2810" strokeWidth="3.5" fill="#9a5b28" strokeLinecap="round" strokeLinejoin="round" />
            {/* 鼻（話すと揺れる） */}
            <g ref={swing}>
              <path d="M110 112 C96 140 98 170 120 178 C136 184 144 166 132 160 C120 156 122 138 130 116 Z" fill={`url(#${g('head')})`} stroke="#4a2810" strokeWidth="2.5" strokeLinejoin="round" />
              {[132, 144, 156].map((y) => (
                <path key={y} d={`M${104 + (y - 132) * 0.1} ${y} q8 4 16 0`} stroke="#4a2810" strokeWidth="1.5" fill="none" opacity=".5" strokeLinecap="round" />
              ))}
            </g>
            {/* きば */}
            <path d="M96 122 C72 132 70 160 90 170" stroke="#4a2810" strokeWidth="10" fill="none" strokeLinecap="round" />
            <path d="M96 122 C72 132 70 160 90 170" stroke={`url(#${g('ivory')})`} strokeWidth="7" fill="none" strokeLinecap="round" />
            <path d="M150 124 C168 138 168 160 152 170" stroke="#4a2810" strokeWidth="10" fill="none" strokeLinecap="round" />
            <path d="M150 124 C168 138 168 160 152 170" stroke={`url(#${g('ivory')})`} strokeWidth="7" fill="none" strokeLinecap="round" />
            {/* 目 */}
            <g ref={eyes}>
              <ellipse cx="112" cy="84" rx="9" ry="10.5" fill={`url(#${g('iris')})`} />
              <ellipse cx="156" cy="84" rx="9" ry="10.5" fill={`url(#${g('iris')})`} />
              <circle cx="109" cy="80" r="3.2" fill="#fff" />
              <circle cx="153" cy="80" r="3.2" fill="#fff" />
              <circle cx="114" cy="88" r="1.4" fill="#fff" opacity=".9" />
              <circle cx="158" cy="88" r="1.4" fill="#fff" opacity=".9" />
            </g>
            <path d="M102 68 q9 -5 18 0 M146 68 q9 -5 18 0" stroke="#4a2810" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <g ref={cheeks}>
              <ellipse cx="98" cy="104" rx="9" ry="5.5" fill="#fb7185" />
              <ellipse cx="166" cy="104" rx="9" ry="5.5" fill="#fb7185" />
            </g>
            {/* 口（鼻の右側） */}
            <g ref={mouth}>
              <path d="M138 114 C142 112 152 112 156 114 C155 124 147 128 142 126 C138 124 136 118 138 114 Z" fill="#7f1d1d" stroke="#4a2810" strokeWidth="1.5" strokeLinejoin="round" />
              <ellipse ref={tongue} cx="147" cy="123" rx="5.5" ry="2.8" fill="#fb7185" opacity="0" />
            </g>
          </g>
        </>
      )}
    </svg>
  )
}
