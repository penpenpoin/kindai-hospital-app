import { ArrowUp, ArrowUpRight, ArrowLeft as ArrowL, Coffee, Armchair, Sofa, Check, MapPin } from 'lucide-react'
import { useSim } from '../sim/context.js'
import { PLACES, SIGNS, openTasks } from '../sim/model.js'
import { Page, Card, Sign, Pill, Demo, Btn } from '../components/ui.jsx'
import FloorMap from '../components/FloorMap.jsx'
import { nodeForLocation } from '../sim/map.js'

const ROUTES = {
  lab: {
    arrow: ArrowUp,
    head: ['2号館（診療棟）3F の 3L へ', '3L の へやへ'],
    steps: [
      ['2号館（診療棟）へ', '案内板の 3L（赤）をたどる'],
      ['3L 採血・生理検査', '受付票は不要・番号で呼ばれます（提案）'],
    ],
  },
  cardio: {
    arrow: ArrowUpRight,
    head: ['1号館（外来棟）3F の 3B へ', '3B の へやへ'],
    steps: [
      ['1号館（外来棟）3F へ', '案内板の 3B（青）をたどる'],
      ['3B 循環器内科 診察室 3番', 'そのままお入りください'],
    ],
  },
  cashier: {
    arrow: ArrowL,
    head: ['1号館 3F 総合受付前へ', 'そうごう うけつけ へ'],
    steps: [['1号館（外来棟）3F へ', ''], ['総合受付前の会計・自動支払機', '水色ファイルの方は優先窓口（提案）']],
  },
  exit: {
    arrow: ArrowL,
    head: ['泉ケ丘駅へ（徒歩 約6分）', 'えきへ'],
    steps: [
      ['けやき橋を渡って駅方面へ', '550m・約6分'],
      ['バスの場合はロータリーのバス停', '270系統・213系統'],
    ],
  },
}

// 案内の行き先 → 地図上の地点
const MAP_DEST = { lab: 'lab', cardio: 'cardio', cashier: 'front', exit: 'deck' }

// 院内の案内板（駅・空港型）をそのまま画面に再現 → 看板とアプリが同じ記号でつながる
function Signboard({ dest }) {
  const { t } = useSim()
  const rows = [
    ['lab', '↑'],
    ['cardio', '↗'],
    ['cashier', '←'],
    ['exit', '←'],
  ]
  return (
    <div className="bg-slate-800 rounded-2xl p-3 space-y-1.5">
      <p className="text-[10px] font-bold text-slate-400 px-1">{t('案内板：実際の区画番号（3L・3B など）に色を付ける提案', 'かんばん と おなじ いろ')}</p>
      {rows.map(([id, arrow]) => (
        <div key={id} className={`flex items-center gap-3 rounded-xl px-2 py-1.5 transition-all ${id === dest ? 'bg-white/15 ring-2 ring-yellow-300' : 'opacity-50'}`}>
          <Sign id={id} />
          <span className="flex-1 text-white font-bold text-sm">{t(SIGNS[id].name, SIGNS[id].easy)}</span>
          <span className="text-white text-xl font-black">{arrow}</span>
        </div>
      ))}
    </div>
  )
}

const WAIT = [
  { id: 'waiting', Icon: Armchair, name: '循環器内科 待合（3B）', note: '混雑：多い', tone: 'rose', walk: 'すぐ' },
  { id: 'cafe', Icon: Coffee, name: '7号館 3F CAFE CORE', note: '平日 8:00〜18:00・クーポン（提案）', tone: 'green', walk: '数分' },
  { id: 'info', Icon: Sofa, name: '1号館 3F 情報コーナー', note: '同じ階・本や情報が見られる', tone: 'green', walk: '数分' },
]

function WaitChooser() {
  const { s, d, t } = useSim()
  return (
    <Card>
      <p className="font-bold text-slate-800 mb-1">{t('待つ場所をえらぶ', 'どこで まちますか？')}</p>
      <p className="text-xs text-slate-500 mb-3">{t('順番が近づいたら（あと2人）、移動時間も見込んで通知します。', 'よばれたら おしらせします')}</p>
      <div className="space-y-2">
        {WAIT.map((w) => (
          <button
            key={w.id}
            onClick={() => d({ type: 'WAIT_AT', place: w.id })}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${s.waitPlace === w.id ? 'border-brand-400 bg-brand-50' : 'border-slate-100 bg-slate-50'}`}
          >
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-brand-500 shadow-sm shrink-0">
              <w.Icon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800">{w.name}</p>
              <p className={`text-[11px] font-bold ${w.tone === 'rose' ? 'text-rose-500' : 'text-emerald-600'}`}>{w.note}</p>
            </div>
            <span className="text-[11px] text-slate-400 whitespace-nowrap">診察室まで {w.walk}</span>
            {s.waitPlace === w.id && <Check size={18} className="text-brand-600" />}
          </button>
        ))}
      </div>
      {s.waitPlace === 'cafe' && (
        <div className="mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-100 text-amber-800 text-xs font-bold flex items-center gap-2">
          🎟 クーポン（提案）：アプリ利用者はドリンク割引
        </div>
      )}
    </Card>
  )
}

export default function NavView() {
  const { s, d, t } = useSim()
  const open = openTasks(s)

  let dest = null
  if (s.scene === 'hospital') {
    if (s.called) dest = 'cardio'
    else if (open[0]?.id === 'blood') dest = 'lab'
  } else if (s.scene === 'after') {
    if (open.length) dest = open[0].place
    else dest = !s.paid && !s.flags.card ? 'cashier' : 'exit'
  }
  const arrived = dest && s.location === dest
  const route = dest && ROUTES[dest]

  return (
    <Page title={t('院内案内', 'あんない')} badge={<span className="max-w-[45%] truncate text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">📍 {PLACES[s.location]}</span>}>
      {(s.scene === 'before' || s.scene === 'travel' || s.scene === 'home') && (
        <Card className="text-center py-8">
          <MapPin className="mx-auto text-brand-400 mb-3" size={36} />
          <p className="font-bold text-slate-700">{s.scene === 'home' ? 'おつかれさまでした' : t('病院に着いたら、ここで次の行き先を案内します', 'びょういんに ついたら あんないします')}</p>
          <p className="text-xs text-slate-500 mt-2">{t('行き先は「予約・検査の順番」と「混み具合」から自動で決まります', '')}</p>
        </Card>
      )}

      {route && (
        <Card>
          <div className="flex items-center gap-3 mb-3">
            <Sign id={dest} />
            <div className="min-w-0">
              <p className="text-[10px] font-black text-brand-600 tracking-widest">{arrived ? t('到着しました', 'つきました') : t('行き先', 'いきさき')}</p>
              <p className="font-bold text-slate-800 leading-snug">{arrived ? <span className="flex items-center gap-1"><Check size={18} className="text-emerald-500" />{t(...route.head)}</span> : t(...route.head)}</p>
            </div>
          </div>
          {/* 地図の上でルート案内（現在地 → 行き先） */}
          <FloorMap from={nodeForLocation(s.location)} to={MAP_DEST[dest]} className="mb-4" />
          <div className="space-y-2">
            {route.steps.map(([name, sub], i) => (
              <div key={name} className={`flex items-center gap-4 p-3 rounded-2xl ${i === 0 && !arrived ? 'bg-slate-50' : 'opacity-50'}`}>
                <div className={`${i === 0 && !arrived ? 'bg-brand-500' : 'bg-slate-300'} text-white w-8 h-8 rounded-full flex items-center justify-center font-bold italic shrink-0`}>{i + 1}</div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{name}</p>
                  {sub && <p className="text-xs text-slate-500">{sub}</p>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {route && (
        <div data-anchor="signboard">
          <Signboard dest={dest} />
        </div>
      )}

      {s.scene === 'hospital' && !s.called && open[0]?.id === 'consult' && (
        <div data-anchor="wait">
          <WaitChooser />
        </div>
      )}

      <Btn tone="ghost" onClick={() => d({ type: 'VIEW', view: 'map' })}>
        <MapPin size={18} /> {t('院内マップで行き先をさがす', 'ちずで さがす')}
      </Btn>

      <div className="space-y-2">
        {dest === 'lab' && !arrived && <Demo onClick={() => d({ type: 'GO', place: 'lab' })}>3L（採血）に着く</Demo>}
        {dest === 'lab' && <Demo onClick={() => d({ type: 'EXAM_DONE' })}>採血が終わる（E）</Demo>}
        {s.scene === 'hospital' && !s.called && open[0]?.id === 'consult' && <Demo onClick={() => d({ type: 'QUEUE', dec: 1 })}>順番が1人進む（N）</Demo>}
        {s.called && <Demo onClick={() => d({ type: 'CONSULT_DONE' })}>診察が終わる（D）</Demo>}
        {dest === 'exit' && <Demo onClick={() => d({ type: 'LEAVE' })}>出口から帰る（X）</Demo>}
      </div>
    </Page>
  )
}
