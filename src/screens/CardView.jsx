import { Sun, WifiOff, ShieldCheck, Bus, ClipboardList, Droplet, CreditCard } from 'lucide-react'
import { useSim } from '../sim/context.js'
import { Page, Card, Pill } from '../components/ui.jsx'
import Barcode, { PATIENT } from '../components/Barcode.jsx'

const USES = [
  [ClipboardList, '総合受付前の自動受付機', 'かざすだけ（自動チェックインできないとき）'],
  [Droplet, '採血・検査の受付', '番号札の代わりに'],
  [CreditCard, '総合受付前の会計・自動支払機', '駐車場の精算機でも'],
  [Bus, '自動運転バスの乗車（将来構想）', '自宅前 → 病院'],
]

export default function CardView() {
  const { s, t } = useSim()
  return (
    <Page title={t('診察券', 'しんさつけん')} badge={<Pill tone="green">プラスチックの診察券は不要</Pill>}>
      {/* 診察券本体 */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-700 to-blue-500 text-white p-5 shadow-2xl shadow-blue-200">
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        <div className="relative flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-indigo-600 font-black italic">K</div>
            <div>
              <p className="text-[10px] font-bold text-blue-100 leading-none">KINDAI UNIVERSITY HOSPITAL</p>
              <p className="font-bold leading-tight">近畿大学病院 診察券</p>
            </div>
          </div>
          <span className="text-2xl">🐟</span>
        </div>
        <div className="relative bg-white rounded-2xl px-4 py-5 flex flex-col items-center">
          <Barcode className="w-full h-24" />
          <p className="mt-2 font-mono text-slate-800 font-bold tracking-[0.3em] text-xl">{PATIENT.no}</p>
          <p className="text-[10px] text-slate-400">患者番号（デモ用のバーコードです・読み取れません）</p>
        </div>
        <div className="relative mt-4 flex justify-between items-end">
          <div>
            <p className="text-[10px] text-blue-100">{PATIENT.kana}</p>
            <p className="text-xl font-bold">{PATIENT.name} 様</p>
          </div>
          <p className="text-xs text-blue-100">{t(`生年月日 ${PATIENT.birth}`, '')}</p>
        </div>
      </div>

      <div className="flex gap-2 text-[11px] font-bold">
        <span className="flex-1 flex items-center justify-center gap-1 bg-amber-50 text-amber-700 rounded-xl py-2">
          <Sun size={14} /> {t('画面が自動で明るくなります', 'あかるく なります')}
        </span>
        <span className={`flex-1 flex items-center justify-center gap-1 rounded-xl py-2 ${s.flags.online ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-700'}`}>
          <WifiOff size={14} /> {t('通信がなくても表示できます', 'ネットなしで OK')}
        </span>
      </div>

      <Card className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
          <ShieldCheck />
        </div>
        <div className="flex-1">
          <p className="font-bold text-slate-800">{t('マイナ保険証と連携済み', 'ほけんしょう OK')}</p>
          <p className="text-xs text-slate-500">{t('保険の情報は自動で更新。毎月の保険証確認は不要です（想定）', '')}</p>
        </div>
      </Card>

      {!s.flags.easy && (
        <Card>
          <p className="text-xs font-bold text-slate-400 mb-3">この診察券が使える場所</p>
          <div className="space-y-3">
            {USES.map(([Icon, name, sub]) => (
              <div key={name} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{name}</p>
                  {sub && <p className="text-[11px] text-slate-500">{sub}</p>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </Page>
  )
}
