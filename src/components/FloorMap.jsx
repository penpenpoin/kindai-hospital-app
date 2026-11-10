import { useEffect, useMemo, useState } from 'react'
import { BUILDINGS, FLOORS, NODES, route } from '../sim/map.js'

const short = (n) => NODES[n].code && NODES[n].code !== '¥' && NODES[n].code !== '駅' ? NODES[n].code : NODES[n].name.split('（')[0]

// 院内の模式図にルートを描く。from が現在地、to が行き先（どちらも map.js の地点 id）
export default function FloorMap({ from, to, onPick, className = '' }) {
  const r = useMemo(() => (to ? route(from, to) : { legs: [], meters: 0, change: null }), [from, to])
  const startFloor = NODES[from]?.floor ?? '3F'
  const [floor, setFloor] = useState(startFloor)
  useEffect(() => setFloor(startFloor), [from, to, startFloor])

  const leg = r.legs.find((l) => l.floor === floor)
  const pts = leg ? leg.path.map((n) => `${NODES[n].x},${NODES[n].y}`).join(' ') : ''
  const lift = floor === '3F' ? 'h3' : 'h2'
  const places = Object.entries(NODES).filter(([, n]) => n.floor === floor && n.kind === 'place')

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
          {FLOORS.map((f) => {
            const has = r.legs.some((l) => l.floor === f)
            return (
              <button key={f} onClick={() => setFloor(f)} className={`relative px-4 py-1 rounded-lg text-sm font-bold ${floor === f ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500'}`}>
                {f}
                {has && floor !== f && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-brand-500" />}
              </button>
            )
          })}
        </div>
        {to && (
          <p className="text-xs font-bold text-slate-500">
            約 {r.meters}m{r.change ? `・エレベーターで ${r.change}` : ''}
          </p>
        )}
      </div>

      <svg viewBox="0 0 370 275" className="w-full rounded-2xl bg-slate-50 border border-slate-100">
        <defs>
          <style>{`.route{stroke-dasharray:6 6;animation:dash 1s linear infinite}@keyframes dash{to{stroke-dashoffset:-12}}.pulse{animation:pl 1.6s ease-out infinite;transform-origin:center;transform-box:fill-box}@keyframes pl{0%{opacity:.6;transform:scale(1)}100%{opacity:0;transform:scale(2.6)}}`}</style>
        </defs>
        {/* 通路 */}
        <rect x="200" y="132" width="50" height="16" fill="#e2e8f0" />
        <rect x="197" y="46" width="16" height="16" fill="#e2e8f0" />
        {floor === '2F' && <rect x="252" y="220" width="16" height="14" fill="#e2e8f0" />}
        {floor === '3F' && <rect x="0" y="132" width="40" height="16" fill="#e2e8f0" />}
        {BUILDINGS.map((b) => (
          <g key={b.id}>
            <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="10" fill="#fff" stroke="#cbd5e1" />
            <text x={b.x + 6} y={b.y + b.h - 6} fontSize="8" fontWeight="700" fill="#94a3b8">
              {b.name}
            </text>
          </g>
        ))}
        {/* エレベーター */}
        <g>
          <rect x={NODES[lift].x - 8} y={NODES[lift].y - 8} width="16" height="16" rx="3" fill={r.change ? '#f5002d' : '#94a3b8'} />
          <text x={NODES[lift].x} y={NODES[lift].y + 3} fontSize="8" textAnchor="middle" fill="#fff" fontWeight="700">
            EV
          </text>
        </g>
        {/* 行き先にできる場所 */}
        {places.map(([id, n]) => (
          <g key={id} onClick={() => onPick?.(id)} style={{ cursor: onPick ? 'pointer' : 'default' }}>
            <circle cx={n.x} cy={n.y} r="5" fill={id === to ? '#f5002d' : '#64748b'} />
            <text x={id === 'deck' ? 2 : id === to ? n.x + 10 : n.x} y={id === to ? n.y - 14 : n.y - 8} fontSize="8.5" textAnchor={id === 'deck' || id === to ? 'start' : 'middle'} fontWeight="700" fill={id === to ? '#f5002d' : '#334155'}>
              {short(id)}
            </text>
          </g>
        ))}
        {/* ルート */}
        {leg && leg.path.length > 1 && <polyline points={pts} fill="none" stroke="#f5002d" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="route" />}
        {/* 現在地 */}
        {NODES[from]?.floor === floor && (
          <g>
            <circle cx={NODES[from].x} cy={NODES[from].y} r="7" fill="#2563eb" className="pulse" />
            <circle cx={NODES[from].x} cy={NODES[from].y} r="6" fill="#2563eb" stroke="#fff" strokeWidth="2" />
          </g>
        )}
        {/* 行き先のピン */}
        {to && NODES[to].floor === floor && (
          <g transform={`translate(${NODES[to].x} ${NODES[to].y - 4})`}>
            <path d="M0 0 C-9 -12 -9 -24 0 -24 C9 -24 9 -12 0 0 Z" fill="#f5002d" />
            <circle cx="0" cy="-16" r="3.5" fill="#fff" />
          </g>
        )}
        {/* 別フロアへの案内 */}
        {leg && r.change && (
          <text x="185" y="268" fontSize="9" textAnchor="middle" fontWeight="700" fill="#f5002d">
            {floor === NODES[from].floor ? `EV で ${NODES[to].floor} へ → 上のタブで ${NODES[to].floor} を表示` : `${NODES[from].floor} から EV で来たところ`}
          </text>
        )}
      </svg>
      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
        <span className="flex items-center gap-1 whitespace-nowrap">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" /> 現在地
        </span>
        <span className="flex items-center gap-1 whitespace-nowrap">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-600 inline-block" /> 行き先
        </span>
        <span className="ml-auto">配置は公式フロアマップの階・館に合わせた模式図です</span>
      </div>
    </div>
  )
}
