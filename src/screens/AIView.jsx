import { useState } from 'react'
import { Mic } from 'lucide-react'
import { useSim } from '../sim/context.js'
import { PLACES, openTasks } from '../sim/model.js'
import { Page } from '../components/ui.jsx'
import { Bubble } from './ReceptionView.jsx'

const AVATARS = [
  { id: 'maguro', emoji: '🐟', name: '近大マグロ' },
  { id: 'mammoth', emoji: '🦣', name: 'マンモス' },
]

// 院内マニュアル・よくある質問から答える想定（デモでは固定の回答）
export function faqs(s) {
  const next = openTasks(s)[0]
  return [
    {
      q: '次はどこに行けばいい？',
      a: s.scene !== 'hospital' && s.scene !== 'after'
        ? '病院に着いたら、ぼくが順番に案内するね。まずは受付をすませておこう！'
        : next
          ? `次は「${next.name}」だよ。${PLACES[next.place]}へ行こう。案内板の色と記号をたどってね。`
          : s.paid
            ? '今日はぜんぶ終わり！帰りのバスは 10:41 だよ。お大事にね。'
            : 'あとはお支払いだけ。カード登録してあれば、そのまま帰って大丈夫だよ。',
    },
    { q: '採血の前に食べていい？', a: '今日の採血は「食事を抜く」指示は出ていないよ。水やお茶は飲んで大丈夫。※検査によって違うので、指示がある日はアプリでお知らせするね。' },
    { q: '駐車料金はいくら？', a: '外来を受診した日は 15分ごとに100円、その日の最大は 1,000円だよ。駐車券は必ず病院の中に持ってきて、割引の処理をしてね。15分以内なら無料。駐車場は混むので、電車やバスがおすすめだよ。' },
    { q: '救急外来はどこ？', a: '救急外来は 2号館（診療棟）2F の「2R」だよ。急ぐときは近くの職員に声をかけるか、119 番に電話してね。' },
    { q: 'コンビニはある？', a: '1号館（外来棟）2F にセブン‐イレブン（7:00〜22:00・年中無休）があるよ。7号館 3F には CAFE CORE（平日 8:00〜18:00）もあるよ。' },
    { q: 'クレジットカード登録が不安…', a: '総合受付の近くに「登録サポート窓口」を置く予定だよ（提案）。職員さんや近大生ボランティアが一緒に登録するから安心してね。登録しなくても窓口で払えるよ。' },
  ]
}

export default function AIView() {
  const { s, d, t } = useSim()
  const [avatar, setAvatar] = useState(AVATARS[0])
  const [listening, setListening] = useState(false)
  const list = faqs(s)

  const ask = (f) => d({ type: 'ASK', q: f.q, answer: f.a })
  const talk = () => {
    if (listening) return
    setListening(true)
    setTimeout(() => {
      setListening(false)
      ask(list[0])
    }, 1300)
  }

  return (
    <Page title={t('AIコンシェルジュ', 'そうだん')}>
      <div className="flex gap-2">
        {AVATARS.map((a) => (
          <button
            key={a.id}
            onClick={() => setAvatar(a)}
            className={`flex-1 py-2 rounded-2xl border font-bold text-sm flex items-center justify-center gap-2 ${avatar.id === a.id ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-slate-100 bg-white text-slate-500'}`}
          >
            <span className="text-xl">{a.emoji}</span> {a.name}
          </button>
        ))}
      </div>

      <div className="space-y-3 min-h-[180px]">
        <AvatarBubble emoji={avatar.emoji}>{t(`こんにちは！${avatar.name}だよ。病院のこと、なんでも聞いてね。`, 'なんでも きいてね')}</AvatarBubble>
        {s.chat.map((m, i) =>
          m.role === 'user' ? (
            <Bubble key={i} role="user">
              {m.text}
            </Bubble>
          ) : (
            <AvatarBubble key={i} emoji={avatar.emoji}>
              {m.text}
            </AvatarBubble>
          ),
        )}
        {listening && <Bubble role="user">…</Bubble>}
      </div>

      <div className="flex flex-wrap gap-2">
        {list.map((f) => (
          <button key={f.q} onClick={() => ask(f)} className="px-3 py-2 rounded-full bg-white border border-brand-100 text-brand-600 text-xs font-bold shadow-sm active:scale-95">
            {f.q}
          </button>
        ))}
      </div>

      <div className="bg-white/80 backdrop-blur-md p-4 rounded-[2rem] shadow-2xl border border-brand-100 text-center">
        <p className="text-xs text-brand-400 mb-3 font-bold tracking-widest">VOICE ASSISTANT</p>
        <button
          onClick={talk}
          className={`w-full py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-all ${listening ? 'bg-rose-500 text-white animate-pulse' : 'bg-brand-600 text-white shadow-lg shadow-brand-200'}`}
        >
          <Mic size={20} /> {listening ? '聞き取り中…' : t('押して話す', 'おして はなす')}
        </button>
        <p className="text-[11px] text-slate-400 mt-3">{t('話した内容は文字でも確認できます。案内デスク・電話の問い合わせを AI が24時間代わりに受けます。', 'もじでも みられます')}</p>
      </div>
    </Page>
  )
}

function AvatarBubble({ emoji, children }) {
  return (
    <div className="flex justify-start gap-2">
      <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-lg shrink-0">{emoji}</div>
      <div className="p-3.5 rounded-[1.6rem] rounded-tl-none max-w-[80%] shadow-sm text-sm leading-relaxed bg-white border border-slate-100 text-slate-700">{children}</div>
    </div>
  )
}
