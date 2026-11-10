import { useState } from 'react'
import { ShieldCheck, BadgeCheck, Send } from 'lucide-react'
import { useSim } from '../sim/context.js'
import { Page, Card } from '../components/ui.jsx'

// 院内SNS「みんなの広場」：患者どうしの情報共有（ピアサポート）＋医療スタッフの発信。AI と職員が見守る。
// 投稿はすべてデモ用の例。
const TOPICS = ['すべて', '待ち時間', 'ひざ・関節', 'お薬', 'はじめて']
const SEED = [
  { id: 's1', staff: true, name: '看護師（循環器内科）', topic: 'お薬', time: '昨日', text: '採血のあとは、針の跡を5分ほどしっかり押さえてください。血液をサラサラにするお薬を飲んでいる方は、少し長めにお願いします。', r: { help: 42, me: 0, like: 18 } },
  { id: 'u1', name: 'マグロ好き（70代）', topic: '待ち時間', time: '2日前', text: '呼び出しの通知が来るので、カフェで待っていました。待合でずっと座っているより楽でした。', r: { help: 25, me: 31, like: 12 } },
  { id: 'u2', name: 'ひざ痛仲間（60代）', topic: 'ひざ・関節', time: '3日前', text: '体調日記をつけてから受診したら、いつから痛いか先生にすぐ伝わりました。同じようにひざが痛い方におすすめです。', r: { help: 19, me: 22, like: 9 } },
  { id: 's2', staff: true, name: '薬剤師', topic: 'お薬', time: '4日前', text: '飲み忘れに気づいても、次の分と2回分を一度に飲まないでください。迷ったときは薬局で気軽に声をかけてくださいね。', r: { help: 37, me: 0, like: 14 } },
  { id: 'u3', name: 'はじめての通院（40代）', topic: 'はじめて', time: '1週間前', text: '案内板の「3L」「3B」の番号とアプリの案内が同じなので、初めてでも迷いませんでした。', r: { help: 16, me: 8, like: 11 } },
]
const REACTIONS = [
  ['help', '参考になった'],
  ['me', '私も'],
  ['like', '♡'],
]

function Post({ p }) {
  const [mine, setMine] = useState({})
  return (
    <Card className={p.staff ? 'border-sky-100 bg-sky-50/40' : ''}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${p.staff ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-500'}`}>{p.staff ? '医' : p.name[0]}</div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-800 flex items-center gap-1">
            {p.name}
            {p.staff && <BadgeCheck size={15} className="text-sky-500" aria-label="病院が確認したスタッフ" />}
          </p>
          <p className="text-[10px] text-slate-400">
            #{p.topic}・{p.time}
          </p>
        </div>
      </div>
      <p className="text-sm text-slate-700 leading-relaxed">{p.text}</p>
      <div className="flex gap-2 mt-3">
        {REACTIONS.filter(([k]) => !(p.staff && k === 'me')).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setMine((m) => ({ ...m, [k]: !m[k] }))}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${mine[k] ? 'bg-brand-50 border-brand-200 text-brand-600' : 'bg-white border-slate-200 text-slate-500'}`}
          >
            {label} {(p.r?.[k] ?? 0) + (mine[k] ? 1 : 0)}
          </button>
        ))}
      </div>
    </Card>
  )
}

export default function CommunityView() {
  const { s, d } = useSim()
  const [topic, setTopic] = useState('すべて')
  const [tab, setTab] = useState('all')
  const [text, setText] = useState('')
  const [checked, setChecked] = useState(false)
  const posts = [...s.snsPosts, ...SEED].filter((p) => (tab === 'staff' ? p.staff : true) && (topic === 'すべて' || p.topic === topic))

  const post = () => {
    if (!text.trim()) return
    d({ type: 'SNS_POST', text: text.trim(), topic: topic === 'すべて' ? '待ち時間' : topic })
    setText('')
    setChecked(true)
    setTimeout(() => setChecked(false), 3500)
  }

  return (
    <Page title="みんなの広場">
      <div className="flex items-start gap-2 text-[11px] text-slate-500 -mt-2">
        <ShieldCheck size={14} className="text-emerald-500 shrink-0 mt-0.5" />
        <p>同じ病院に通う人どうしの情報交換の場です。AI と職員が見守り、名前や連絡先などはのせません。体のことの相談は主治医へ。</p>
      </div>

      <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-2xl">
        {[
          ['all', 'みんなの投稿'],
          ['staff', '病院スタッフから'],
        ].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} className={`py-2 rounded-xl text-sm font-bold ${tab === k ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5">
        {TOPICS.map((x) => (
          <button key={x} onClick={() => setTopic(x)} className={`px-3 py-1.5 rounded-full text-xs font-bold border whitespace-nowrap ${topic === x ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200'}`}>
            #{x}
          </button>
        ))}
      </div>

      {tab === 'all' && (
        <Card>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            placeholder={`${topic === 'すべて' ? '#待ち時間' : `#${topic}`} について書く（例：カフェで待つと楽でした）`}
            className="w-full resize-none text-sm outline-none placeholder:text-slate-400"
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-[10px] text-slate-400">{checked ? '✓ AI が確認して投稿しました' : '投稿前に AI が個人情報や誤った医療情報がないか確認します'}</p>
            <button onClick={post} disabled={!text.trim()} className="px-4 py-2 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center gap-1 disabled:opacity-40">
              <Send size={14} /> 投稿
            </button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {posts.map((p) => (
          <Post key={p.id} p={p} />
        ))}
        {posts.length === 0 && <p className="text-center text-sm text-slate-400 py-6">この話題の投稿はまだありません</p>}
      </div>
      <p className="text-[10px] text-slate-400 px-1">投稿はデモ用の例です。</p>
    </Page>
  )
}
