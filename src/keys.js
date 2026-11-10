// キーボードでのデバッグ操作（? で一覧表示）
export const KEYMAP = [
  { keys: ['1', '2', '3', '4', '5'], label: '場面へジャンプ（来院前／移動中／院内／診察後／帰宅）' },
  { keys: ['→', '←'], label: 'シナリオを1ステップ進める／戻す' },
  { keys: ['A'], label: '病院に到着（位置を検知）', action: { type: 'ARRIVE' } },
  { keys: ['E'], label: '採血を完了にする', action: { type: 'EXAM_DONE' } },
  { keys: ['N'], label: '順番を1人進める（設定した人数で予告通知）', action: { type: 'QUEUE', dec: 1 } },
  { keys: ['C'], label: '診察の呼び出し通知', action: { type: 'CALL' } },
  { keys: ['D'], label: '診察を終える', action: { type: 'CONSULT_DONE' } },
  { keys: ['X'], label: '出口へ移動（未完了があれば帰宅防止アラート）', action: { type: 'LEAVE' } },
  { keys: ['P'], label: '診察券を表示', action: { type: 'VIEW', view: 'card' } },
  { keys: ['V'], label: 'AI の案内役を切り替え（テキスト → 2D → 3D）', action: { type: 'AVATAR' } },
  { keys: ['G'], label: '位置情報 ON/OFF', action: { type: 'TOGGLE', flag: 'gps' } },
  { keys: ['O'], label: '通信 ON/OFF（オフライン）', action: { type: 'TOGGLE', flag: 'online' } },
  { keys: ['K'], label: 'カード登録 あり/なし', action: { type: 'TOGGLE', flag: 'card' } },
  { keys: ['Y'], label: 'やさしい表示 ON/OFF', action: { type: 'TOGGLE', flag: 'easy' } },
  { keys: ['M'], label: '音声読み上げ ON/OFF', action: { type: 'TOGGLE', flag: 'sound' } },
  { keys: ['L'], label: 'イベントログを表示／非表示' },
  { keys: ['R'], label: '最初からやり直す' },
  { keys: ['?'], label: 'このキー一覧' },
]

const SINGLE = Object.fromEntries(
  KEYMAP.filter((k) => k.action).map((k) => [k.keys[0].toLowerCase(), k.action]),
)

export function keyToCommand(e) {
  if (e.ctrlKey || e.metaKey || e.altKey) return null
  const k = e.key.toLowerCase()
  if (['1', '2', '3', '4', '5'].includes(k)) {
    const scene = ['before', 'travel', 'hospital', 'after', 'home'][Number(k) - 1]
    return { sim: { type: 'SCENE', scene } }
  }
  if (e.key === 'ArrowRight') return { sim: { type: 'NEXT' } }
  if (e.key === 'ArrowLeft') return { sim: { type: 'PREV' } }
  if (k === 'r') return { sim: { type: 'RESET' } }
  if (k === 'l') return { ui: 'log' }
  if (e.key === '?' || (k === '/' && e.shiftKey)) return { ui: 'help' }
  if (e.key === 'Escape') return { ui: 'close' }
  if (SINGLE[k]) return { sim: SINGLE[k] }
  return null
}
