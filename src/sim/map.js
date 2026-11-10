// =====================================================================
// 院内マップ（模式図）
//  - 「どの館の何階に何があるか」は近大病院の公式フロアマップに合わせている。
//  - 建物の形・位置関係・通路は説明用の模式図で、実際の配置とは異なる。
// =====================================================================

export const FLOORS = ['3F', '2F']

// 建物（両フロア共通の外形）
export const BUILDINGS = [
  { id: 'b1', name: '1号館（外来棟）', x: 40, y: 60, w: 160, h: 160 },
  { id: 'b2', name: '2号館（診療棟）', x: 250, y: 60, w: 110, h: 160 },
  { id: 'b7', name: '7号館（管理棟）', x: 150, y: 6, w: 110, h: 40 },
  { id: 'b3', name: '3号館（サービス棟）', x: 220, y: 232, w: 110, h: 34 },
]

// 地点。kind: place（行き先にできる）/ hub（通路）
export const NODES = {
  // ---- 3F（デッキ連絡階）----
  deck: { floor: '3F', x: 10, y: 140, name: '駅方面（デッキ）', code: '駅', kind: 'place' },
  entrance: { floor: '3F', x: 52, y: 140, name: '1号館 入口', kind: 'hub' },
  front: { floor: '3F', x: 95, y: 160, name: '総合受付（自動受付機・会計・おくすり受付）', code: '¥', kind: 'place' },
  cardio: { floor: '3F', x: 95, y: 84, name: '3B 循環器内科', code: '3B', kind: 'place' },
  waiting: { floor: '3F', x: 140, y: 92, name: '3B 待合', kind: 'place' },
  info: { floor: '3F', x: 140, y: 200, name: '情報コーナー', kind: 'place' },
  h3: { floor: '3F', x: 175, y: 140, name: 'エレベーター・エスカレーター', kind: 'hub' },
  bridge3: { floor: '3F', x: 225, y: 140, name: '連絡通路', kind: 'hub' },
  lab: { floor: '3F', x: 305, y: 110, name: '3L 採血・生理検査', code: '3L', kind: 'place' },
  n73: { floor: '3F', x: 205, y: 70, name: '7号館への通路', kind: 'hub' },
  cafe: { floor: '3F', x: 205, y: 26, name: 'CAFE CORE（7号館 3F）', kind: 'place' },
  // ---- 2F ----
  h2: { floor: '2F', x: 175, y: 140, name: 'エレベーター・エスカレーター', kind: 'hub' },
  conbini: { floor: '2F', x: 95, y: 175, name: 'セブン‐イレブン（1号館 2F）', kind: 'place' },
  bridge2: { floor: '2F', x: 225, y: 140, name: '連絡通路', kind: 'hub' },
  er: { floor: '2F', x: 305, y: 175, name: '2R 救急外来', code: '2R', kind: 'place' },
  s32: { floor: '2F', x: 260, y: 205, name: '3号館への通路', kind: 'hub' },
  green: { floor: '2F', x: 275, y: 249, name: 'グリーンリーブスモール（3号館 2F）', kind: 'place' },
  n72: { floor: '2F', x: 205, y: 70, name: '7号館への通路', kind: 'hub' },
  ffields: { floor: '2F', x: 205, y: 26, name: '外来食堂 ffields（7号館 2F）', kind: 'place' },
}

const EDGES = [
  ['deck', 'entrance'], ['entrance', 'front'], ['entrance', 'h3'], ['front', 'h3'], ['entrance', 'cardio'], ['cardio', 'waiting'],
  ['waiting', 'h3'], ['front', 'info'], ['info', 'h3'], ['h3', 'bridge3'], ['bridge3', 'lab'], ['h3', 'n73'], ['n73', 'cafe'],
  ['h2', 'conbini'], ['h2', 'bridge2'], ['bridge2', 'er'], ['bridge2', 's32'], ['s32', 'green'], ['h2', 'n72'], ['n72', 'ffields'],
]
const ADJ = {}
EDGES.forEach(([a, b]) => {
  ;(ADJ[a] ||= []).push(b)
  ;(ADJ[b] ||= []).push(a)
})
const LIFT = { '3F': 'h3', '2F': 'h2' }

function dist(a, b) {
  const p = NODES[a]
  const q = NODES[b]
  return Math.hypot(p.x - q.x, p.y - q.y)
}

// 同じフロア内の最短経路（ダイクストラ。ノードが少ないので単純に）
function pathOnFloor(from, to) {
  const d = { [from]: 0 }
  const prev = {}
  const todo = new Set([from])
  while (todo.size) {
    let u = null
    todo.forEach((n) => (u === null || d[n] < d[u] ? (u = n) : null))
    todo.delete(u)
    if (u === to) break
    for (const v of ADJ[u] || []) {
      const nd = d[u] + dist(u, v)
      if (d[v] === undefined || nd < d[v]) {
        d[v] = nd
        prev[v] = u
        todo.add(v)
      }
    }
  }
  const out = [to]
  while (out[0] !== from) {
    if (!prev[out[0]]) return [from]
    out.unshift(prev[out[0]])
  }
  return out
}

// 画面の現在地（sim の location）→ 地図上の地点
export function nodeForLocation(loc) {
  if (loc === 'exit' || loc === 'station' || loc === 'home') return 'deck'
  return NODES[loc] ? loc : 'entrance'
}

// 経路：フロアごとの区間と、歩く距離（模式図の距離をおおよその m に換算）
export function route(from, to) {
  const A = NODES[from]
  const B = NODES[to]
  if (!A || !B) return { legs: [], meters: 0, change: null }
  let legs
  if (A.floor === B.floor) legs = [{ floor: A.floor, path: pathOnFloor(from, to) }]
  else
    legs = [
      { floor: A.floor, path: pathOnFloor(from, LIFT[A.floor]) },
      { floor: B.floor, path: pathOnFloor(LIFT[B.floor], to) },
    ]
  let len = 0
  legs.forEach((l) => l.path.forEach((n, i) => i && (len += dist(l.path[i - 1], n))))
  return { legs, meters: Math.round((len * 0.6) / 10) * 10 + (legs.length > 1 ? 20 : 0), change: legs.length > 1 ? `${A.floor} → ${B.floor}` : null }
}

// 行き先の候補（院内マップ画面の一覧）
export const DESTINATIONS = [
  { group: '診療・検査', items: ['cardio', 'lab', 'er'] },
  { group: '受付・会計', items: ['front'] },
  { group: '食事・買い物', items: ['cafe', 'ffields', 'conbini', 'green'] },
  { group: 'そのほか', items: ['info', 'waiting', 'deck'] },
]
