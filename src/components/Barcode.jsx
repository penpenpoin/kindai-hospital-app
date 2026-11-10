import { useMemo } from 'react'

export const PATIENT = { no: '0012-3456', name: '田中 太郎', kana: 'タナカ タロウ', birth: '1952年4月12日' }

// 見た目だけのバーコード（デモ用・読み取りはできない）。番号から毎回同じ模様を作る。
export default function Barcode({ value = PATIENT.no, className = '' }) {
  const bars = useMemo(() => {
    let x = [...value].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) >>> 0
    const w = () => 1 + (((x = (x * 1103515245 + 12345) >>> 0) >>> 16) % 3)
    const out = []
    let pos = 0
    const add = (width, bar) => {
      if (bar) out.push([pos, width])
      pos += width
    }
    ;[1, 1, 1, 1].forEach((v, i) => add(v, i % 2 === 0)) // 開始パターン
    for (let i = 0; i < 44; i++) add(w(), i % 2 === 0)
    ;[2, 1, 1, 1, 2].forEach((v, i) => add(v, i % 2 === 0)) // 終了パターン
    return { out, total: pos }
  }, [value])
  return (
    <svg viewBox={`-6 0 ${bars.total + 12} 40`} preserveAspectRatio="none" className={className} shapeRendering="crispEdges" aria-label={`診察券のバーコード ${value}（デモ）`}>
      <rect x="-6" y="0" width={bars.total + 12} height="40" fill="#fff" />
      {bars.out.map(([px, wd]) => (
        <rect key={px} x={px} y="0" width={wd} height="40" fill="#0f172a" />
      ))}
    </svg>
  )
}
