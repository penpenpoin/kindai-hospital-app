import { useEffect, useState } from 'react'
import { Mic } from 'lucide-react'
import { useSim } from '../sim/context.js'
import { PLACES, openTasks } from '../sim/model.js'
import { Page } from '../components/ui.jsx'
import { Bubble } from './ReceptionView.jsx'
import { useSpeaker } from '../avatar/useSpeaker.js'
import Avatar2D from '../avatar/Avatar2D.jsx'
import Avatar3D from '../avatar/Avatar3D.jsx'

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

const MODES = [
  { id: 'chat', label: 'テキスト' },
  { id: '2d', label: '2D' },
  { id: '3d', label: '3D' },
]

// 同じ回答を2回読み上げないための目印（画面を開き直しても残す）
let lastSpoken = 0

export default function AIView() {
  const { s, d, t } = useSim()
  const easy = s.flags.easy
  const mode = easy && s.flags.avatar === '3d' ? '2d' : s.flags.avatar
  const who = mode === '3d' ? 'maguro' : s.flags.who
  const char = AVATARS.find((a) => a.id === who)
  const [listening, setListening] = useState(false)
  // やさしい表示では少しゆっくり話す
  const { talking, talkingRef, speak, stop } = useSpeaker({ enabled: s.flags.sound, rate: easy ? 0.85 : 1.05 })
  const list = faqs(s)
  const shown = easy ? list.slice(0, 4) : list
  const lastAi = [...s.chat].reverse().find((m) => m.role === 'ai')
  const lastUser = [...s.chat].reverse().find((m) => m.role === 'user')
  const greeting = t(`こんにちは！${char.name}だよ。病院のこと、なんでも聞いてね。`, `${char.name}だよ。なんでも きいてね。`)

  // 新しい回答が来たら読み上げる（ホームのサービスから質問して開いたときも）
  useEffect(() => {
    const n = s.chat.length
    if (n < lastSpoken) lastSpoken = 0
    if (n > lastSpoken && lastAi) {
      lastSpoken = n
      speak(lastAi.text)
    }
  }, [s.chat.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const ask = (f) => d({ type: 'ASK', q: f.q, answer: f.a })
  const talk = () => {
    if (listening) return
    stop()
    setListening(true)
    setTimeout(() => {
      setListening(false)
      ask(list[0])
    }, 1300)
  }
  const status = listening ? t('聞いています…', 'きいています') : talking ? t('話しています', 'はなしています') : t('待機中', 'まっています')

  return (
    <Page title={t('AIコンシェルジュ', 'そうだん')}>
      {/* 見た目の切り替え（やさしい表示では 3D を使わない） */}
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-2xl">
          {MODES.map((m) => {
            const off = easy && m.id === '3d'
            return (
              <button
                key={m.id}
                disabled={off}
                onClick={() => d({ type: 'AVATAR', mode: m.id })}
                className={`py-2 rounded-xl text-sm font-bold transition-all ${mode === m.id ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500'} disabled:opacity-35`}
              >
                {m.label}
              </button>
            )
          })}
        </div>
        <div className="flex gap-2">
          {AVATARS.map((a) => {
            const off = mode === '3d' && a.id !== 'maguro'
            return (
              <button
                key={a.id}
                disabled={off}
                onClick={() => d({ type: 'AVATAR', mode, who: a.id })}
                className={`flex-1 py-2 rounded-2xl border font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-35 ${who === a.id ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-slate-100 bg-white text-slate-500'}`}
              >
                <span className="text-xl">{a.emoji}</span> {a.name}
              </button>
            )
          })}
        </div>
        {easy && <p className="text-xs text-slate-500 px-1">やさしい表示では、見やすい 2D で案内します。</p>}
        {!easy && mode === '3d' && <p className="text-[11px] text-slate-400 px-1">3D は近大マグロのみです。</p>}
      </div>

      {mode === 'chat' ? (
        <div className="space-y-3 min-h-[180px]">
          <AvatarBubble emoji={char.emoji}>{greeting}</AvatarBubble>
          {s.chat.map((m, i) =>
            m.role === 'user' ? (
              <Bubble key={i} role="user">
                {m.text}
              </Bubble>
            ) : (
              <AvatarBubble key={i} emoji={char.emoji}>
                {m.text}
              </AvatarBubble>
            ),
          )}
          {listening && <Bubble role="user">…</Bubble>}
        </div>
      ) : (
        <div className="rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-xl shadow-slate-200/60">
          <div className={`relative bg-gradient-to-b from-sky-100 via-sky-50 to-white ${easy ? 'h-72' : 'h-60'}`}>
            {mode === '2d' ? (
              <Avatar2D who={who} talkingRef={talkingRef} className="w-full h-full p-4" />
            ) : (
              <Avatar3D talkingRef={talkingRef} className="w-full h-full" />
            )}
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-white/85 backdrop-blur rounded-full pl-2 pr-3 py-1 shadow-sm">
              <span className={`w-2 h-2 rounded-full ${listening ? 'bg-rose-500 animate-pulse' : talking ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
              <span className="text-[11px] font-bold text-slate-700">
                {char.name}・{status}
              </span>
            </div>
            {talking && (
              <button onClick={stop} className="absolute top-3 right-3 bg-white/85 backdrop-blur rounded-full px-3 py-1 text-[11px] font-bold text-slate-500 shadow-sm">
                {t('とめる', 'とめる')}
              </button>
            )}
          </div>
          {/* 字幕：話した内容を文字でも */}
          <div className="p-4 border-t border-slate-100 space-y-2">
            {(lastUser || listening) && (
              <p className={`${easy ? 'text-sm' : 'text-xs'} text-slate-400 font-bold`}>
                {t('あなた', 'あなた')}：{listening ? '…' : lastUser.text}
              </p>
            )}
            <p className={`${easy ? 'text-xl font-bold leading-relaxed' : 'text-sm leading-relaxed'} text-slate-800`}>{lastAi && !listening ? lastAi.text : greeting}</p>
          </div>
        </div>
      )}

      <div className={`flex flex-wrap gap-2 ${easy ? 'grid grid-cols-1' : ''}`}>
        {shown.map((f) => (
          <button
            key={f.q}
            onClick={() => ask(f)}
            className={`rounded-full bg-white border border-brand-100 text-brand-600 font-bold shadow-sm active:scale-95 ${easy ? 'px-4 py-3 text-base text-left rounded-2xl' : 'px-3 py-2 text-xs'}`}
          >
            {f.q}
          </button>
        ))}
      </div>

      <div className="bg-white/80 backdrop-blur-md p-4 rounded-[2rem] shadow-2xl border border-brand-100 text-center">
        {!easy && <p className="text-xs text-brand-400 mb-3 font-bold tracking-widest">VOICE ASSISTANT</p>}
        <button
          onClick={talk}
          className={`w-full ${easy ? 'py-5 text-lg' : 'py-4'} rounded-full font-bold flex items-center justify-center gap-2 transition-all ${listening ? 'bg-rose-500 text-white animate-pulse' : 'bg-brand-600 text-white shadow-lg shadow-brand-200'}`}
        >
          <Mic size={easy ? 24 : 20} /> {listening ? '聞き取り中…' : t('押して話す', 'おして はなす')}
        </button>
        <p className="text-[11px] text-slate-400 mt-3">
          {t('話した内容は文字でも確認できます。案内デスク・電話の問い合わせを AI が24時間代わりに受けます。', 'はなした ことは もじでも でます')}
          {!s.flags.sound && t('（いまは音声オフ：口の動きと字幕だけ）', '')}
        </p>
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
