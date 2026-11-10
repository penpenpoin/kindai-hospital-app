import { Bell, Coffee, Users, Check, Clock } from 'lucide-react'
import { useSim } from '../sim/context.js'
import { PLACES } from '../sim/model.js'
import { Page, Card, Pill, Btn, Demo, Sign } from '../components/ui.jsx'

const MIN_PER_PERSON = 8 // 1人あたりの目安（デモ用）

// 待ち状況の詳しい画面：番号・目安時間・今日の流れ・予告のタイミング・待つ場所
export default function QueueView() {
  const { s, d, t } = useSim()
  const blood = s.tasks.find((x) => x.id === 'blood')
  const consult = s.tasks.find((x) => x.id === 'consult')
  const myNo = s.reception?.no ?? '当日受付'
  const ahead = s.queueAhead
  const waiting = s.checkedIn && consult.status === 'todo'
  const nowNo = waiting && ahead != null && /\d+$/.test(myNo) ? `A-${String(Number(myNo.match(/\d+$/)[0]) - (s.called ? 0 : ahead)).padStart(4, '0')}` : '—'
  const sharing = (s.flags.family || []).filter((f) => f.share)

  const flow = [
    { label: '受付', sub: s.checkedIn ? '到着を自動で受付' : '病院に着くと自動で受付', st: s.checkedIn ? 'done' : 'now' },
    { label: t('採血', '血をとる検査'), sign: 'lab', sub: '2号館 3F', st: blood.status !== 'todo' ? 'done' : s.checkedIn ? 'now' : 'todo' },
    { label: t('診察', 'しんさつ'), sign: 'cardio', sub: '1号館 3F 診察室 3番', st: consult.status !== 'todo' ? 'done' : s.called ? 'now' : blood.status !== 'todo' ? 'wait' : 'todo' },
    { label: t('会計', 'おかね'), sign: 'cashier', sub: s.flags.card ? 'カード後払いなら並ばなくてよい' : '総合受付前', st: s.paid ? 'done' : consult.status !== 'todo' ? 'now' : 'todo' },
    { label: t('帰宅', 'かえる'), sub: '泉ケ丘駅まで徒歩 約6分', st: s.scene === 'home' ? 'done' : 'todo' },
  ]

  return (
    <Page title={t('待ち状況', 'まちじょうきょう')} badge={<Pill tone="slate"><Clock size={12} className="inline -mt-0.5" /> {s.clock}</Pill>}>
      {!s.checkedIn ? (
        <Card className="text-center py-8">
          <Users className="mx-auto text-slate-300 mb-2" size={36} />
          <p className="font-bold text-slate-700">{t('病院に着いて受付が済むと、ここに順番が出ます', 'ついたら ばんごうが でます')}</p>
        </Card>
      ) : (
        <div className={`rounded-3xl p-5 text-white ${s.called ? 'bg-emerald-600' : 'bg-gradient-to-br from-brand-600 to-brand-500'}`}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] font-bold text-white/80">{t('あなたの番号', 'あなたの ばんごう')}</p>
              <p className="text-3xl font-black tracking-wider">{myNo}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-white/80">{t('いま呼ばれている番号', 'いま よばれている')}</p>
              <p className="text-3xl font-black tracking-wider opacity-90">{nowNo}</p>
            </div>
          </div>
          <div className="mt-4 bg-white/15 rounded-2xl p-3 flex items-center justify-between">
            {s.called ? (
              <p className="font-black text-lg">{t('あなたの番です。診察室 3番へ', 'あなたの ばんです')}</p>
            ) : waiting ? (
              <>
                <p className="font-black text-lg">
                  あと {ahead} 人
                </p>
                <p className="text-sm font-bold">
                  {t('目安', 'やく')} 約{ahead * MIN_PER_PERSON}分
                </p>
              </>
            ) : (
              <p className="font-bold">{t('診察は終わりました', 'おわりました')}</p>
            )}
          </div>
          {waiting && !s.called && <p className="text-[11px] text-white/80 mt-2">{t(`予約 9:30・1人あたり約${MIN_PER_PERSON}分で計算した目安です。前の人の診察の長さで前後します。`, 'じかんは めやすです')}</p>}
        </div>
      )}

      {/* 今日の流れ */}
      <Card>
        <p className="text-xs font-bold text-slate-400 mb-3">{t('今日の流れ', 'きょうの ながれ')}</p>
        <ol className="relative">
          {flow.map((f, i) => (
            <li key={f.label} className="flex gap-3 pb-4 last:pb-0 relative">
              {i < flow.length - 1 && <span className="absolute left-[13px] top-7 bottom-0 w-0.5 bg-slate-200" />}
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 z-10 ${
                  f.st === 'done' ? 'bg-emerald-500 text-white' : f.st === 'now' ? 'bg-brand-600 text-white ring-4 ring-brand-100' : f.st === 'wait' ? 'bg-amber-400 text-white' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {f.st === 'done' ? <Check size={14} /> : i + 1}
              </span>
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <div className="flex-1">
                  <p className={`text-sm font-bold ${f.st === 'todo' ? 'text-slate-400' : 'text-slate-800'}`}>
                    {f.label}
                    {f.st === 'now' && <span className="ml-2 text-[10px] text-brand-600">いまここ</span>}
                    {f.st === 'wait' && <span className="ml-2 text-[10px] text-amber-600">順番待ち</span>}
                  </p>
                  <p className="text-[11px] text-slate-500">{f.sub}</p>
                </div>
                {f.sign && <Sign id={f.sign} />}
              </div>
            </li>
          ))}
        </ol>
      </Card>

      {/* 予告のタイミング */}
      <Card>
        <div className="flex items-center gap-2 mb-1">
          <Bell size={18} className="text-brand-600" />
          <p className="font-bold text-slate-800">{t('何人前で知らせる？', 'いつ しらせる？')}</p>
        </div>
        <p className="text-xs text-slate-500 mb-3">{t('待つ場所から診察室までの移動時間も考えて選べます。', '')}</p>
        <div className="grid grid-cols-3 gap-2">
          {[2, 3, 5].map((n) => (
            <button
              key={n}
              onClick={() => d({ type: 'NOTIFY_AT', n })}
              className={`py-2.5 rounded-xl border font-bold text-sm ${s.flags.notifyAt === n ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white border-slate-200 text-slate-600'}`}
            >
              あと {n} 人
            </button>
          ))}
        </div>
        {sharing.length > 0 && (
          <p className="text-[11px] text-slate-500 mt-3">
            {t(`呼び出しは ${sharing.map((f) => `${f.name.split(' ')[1]}さん`).join('・')}にも届きます（家族連携）`, 'かぞくにも とどきます')}
          </p>
        )}
      </Card>

      {waiting && !s.called && (
        <Btn tone="ghost" onClick={() => d({ type: 'VIEW', view: 'nav' })}>
          <Coffee size={18} /> {s.waitPlace ? t(`いまは ${PLACES[s.waitPlace]} で待機中（変える）`, 'まつ ばしょを かえる') : t('好きな場所で待つ（カフェなど）', 'すきな ところで まつ')}
        </Btn>
      )}

      {waiting && !s.called && (
        <div className="space-y-2">
          <Demo onClick={() => d({ type: 'QUEUE', dec: 1 })}>順番が1人進む（N）</Demo>
          <Demo onClick={() => d({ type: 'CALL' })}>診察に呼ばれる（C）</Demo>
        </div>
      )}
    </Page>
  )
}
