import { useSim } from '../sim/context.js'
import { NODES, DESTINATIONS, nodeForLocation, route } from '../sim/map.js'
import { PLACES } from '../sim/model.js'
import { Page, Card } from '../components/ui.jsx'
import FloorMap from '../components/FloorMap.jsx'

// 院内マップ：行き先をえらぶ（一覧 or 地図の点をタップ）→ 現在地からのルートを地図に描く
export default function MapView() {
  const { s, d, t } = useSim()
  const from = nodeForLocation(s.location)
  const to = s.mapTarget
  const pick = (id) => d({ type: 'MAP_TARGET', id, name: NODES[id].name })
  const r = to ? route(from, to) : null
  const outside = ['home', 'station'].includes(s.location)

  return (
    <Page title={t('院内マップ', 'ちず')} badge={<span className="max-w-[45%] truncate text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">📍 {outside ? t('病院の外', 'そと') : PLACES[s.location]}</span>}>
      <Card>
        {to ? (
          <div className="mb-3">
            <p className="text-[10px] font-black text-brand-600 tracking-widest">{t('行き先', 'いきさき')}</p>
            <p className="font-bold text-slate-800 leading-snug">{NODES[to].name}</p>
            <p className="text-xs text-slate-500">
              {t(`歩いて 約${r.meters}m`, `やく ${r.meters}m`)}
              {r.change && t(`・エレベーター／エスカレーターで ${r.change}`, `・エレベーターで ${r.change}`)}
            </p>
          </div>
        ) : (
          <p className="text-sm font-bold text-slate-600 mb-3">{t('行き先をえらぶと、地図にルートが出ます（地図の点もタップできます）', 'いきさきを えらんでね')}</p>
        )}
        <FloorMap from={from} to={to} onPick={pick} />
      </Card>

      <div className="space-y-4">
        {DESTINATIONS.map((g) => (
          <div key={g.group}>
            <p className="text-xs font-bold text-slate-400 mb-2 px-1">{g.group}</p>
            <div className="grid grid-cols-2 gap-2">
              {g.items.map((id) => (
                <button
                  key={id}
                  onClick={() => pick(id)}
                  className={`text-left p-3 rounded-2xl border text-sm font-bold leading-snug ${to === id ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-slate-100 bg-white text-slate-700'}`}
                >
                  {NODES[id].name.split('（')[0]}
                  <span className="block text-[10px] font-normal text-slate-400">{NODES[id].floor}{NODES[id].name.includes('（') ? `・${NODES[id].name.split('（')[1].replace('）', '')}` : ''}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Page>
  )
}
