import { useState } from 'react'
import { UserPlus, Bell, HandHelping, Trash2, Wifi, Type, Volume2, ShieldCheck, Check, Smartphone } from 'lucide-react'
import { useSim } from '../sim/context.js'
import { FAMILY_INVITE } from '../sim/model.js'
import { Page, Card, Pill, Btn } from '../components/ui.jsx'
import { PATIENT } from '../components/Barcode.jsx'

function Switch({ on, onClick, label }) {
  return (
    <button onClick={onClick} role="switch" aria-checked={on} aria-label={label} className={`w-11 h-6 rounded-full relative transition-all shrink-0 ${on ? 'bg-brand-600' : 'bg-slate-300'}`}>
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all `} style={{ left: on ? 22 : 2 }} />
    </button>
  )
}

// 家族のスマホに届く画面のプレビュー（見守り）
function FamilyPreview() {
  const { s, t } = useSim()
  const feed = [...s.familyFeed].reverse()
  return (
    <Card className="bg-slate-50">
      <div className="flex items-center gap-2 mb-3">
        <Smartphone size={18} className="text-slate-500" />
        <p className="font-bold text-slate-800 text-sm">{t('家族のスマホに届く通知（プレビュー）', 'かぞくに とどく おしらせ')}</p>
      </div>
      {feed.length === 0 ? (
        <p className="text-xs text-slate-500">{t('まだ通知はありません。シナリオを進める（→ キー）と、受付・到着・呼び出し・会計などのたびにここに届きます。', 'まだ ありません')}</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {feed.map((f) => (
            <div key={f.id} className={`rounded-2xl p-3 flex gap-3 items-start ${f.urgent ? 'bg-rose-600 text-white' : 'bg-white border border-slate-100'}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0 ${f.urgent ? 'bg-white/20' : 'bg-brand-50'}`}>🐟</div>
              <div className="min-w-0">
                <p className={`text-[10px] font-bold ${f.urgent ? 'text-rose-100' : 'text-slate-400'}`}>
                  KIND-AI 見守り・{f.clock}
                </p>
                <p className="text-sm font-bold leading-snug">
                  {t('お父さん', 'お父さん')}（{PATIENT.name}）：{f.msg}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

export default function AccountView() {
  const { s, d, t } = useSim()
  const fam = s.flags.family
  const [inviting, setInviting] = useState(false)
  const invited = fam.some((f) => f.id === FAMILY_INVITE.id)

  return (
    <Page title={t('アカウント', 'わたしの せってい')}>
      <Card className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-brand-600 text-white flex items-center justify-center font-black text-lg">田</div>
        <div className="flex-1">
          <p className="font-bold text-slate-800">{PATIENT.name} 様</p>
          <p className="text-xs text-slate-500">患者番号 {PATIENT.no}</p>
        </div>
        <Pill tone="green">マイナ保険証 連携済み</Pill>
      </Card>

      {/* ===== 家族連携 ===== */}
      <div data-anchor="family">
        <div className="flex items-center justify-between px-1 mb-2">
          <p className="font-bold text-slate-800">{t('家族連携', 'かぞくと つながる')}</p>
          <span className="text-[11px] text-slate-400">{fam.length}人と連携中</span>
        </div>
        <p className="text-xs text-slate-500 px-1 mb-3">
          {t('離れて暮らす家族に、受付・到着・呼び出し・会計・帰宅をお知らせします。検査を残して帰りそうなときは家族にも知らせます。家族が代わりに受付や支払いをすることもできます。', 'かぞくに おしらせが とどきます')}
        </p>
        <div className="space-y-3">
          {fam.map((f) => (
            <Card key={f.id}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">{f.name.split(' ')[1][0]}</div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800">
                    {f.name}さん <span className="text-xs text-slate-500 font-normal">（{f.rel}）</span>
                  </p>
                  <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                    <Check size={12} /> 本人の同意を確認済み
                  </p>
                </div>
                <button onClick={() => d({ type: 'FAMILY_REMOVE', id: f.id })} className="p-2 text-slate-300 hover:text-rose-500" aria-label="連携を解除">
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Bell size={18} className="text-slate-400 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-700">{t('通院の通知を共有', 'おしらせを とどける')}</p>
                    <p className="text-[11px] text-slate-500">{t('受付・到着・呼び出し・会計・帰宅、帰宅防止アラート', '')}</p>
                  </div>
                  <Switch on={f.share} onClick={() => d({ type: 'FAMILY_SET', id: f.id, key: 'share' })} label="通知の共有" />
                </div>
                <div className="flex items-center gap-3">
                  <HandHelping size={18} className="text-slate-400 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-700">{t('代わりに受付・支払い', 'かわりに てつづき')}</p>
                    <p className="text-[11px] text-slate-500">{t('家族のスマホから仮受付・後払い・領収書の確認ができる', '')}</p>
                  </div>
                  <Switch on={f.proxy} onClick={() => d({ type: 'FAMILY_SET', id: f.id, key: 'proxy' })} label="代わりに受付・支払い" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {!invited && (
          <div className="mt-3">
            {inviting ? (
              <Card className="text-center">
                <p className="text-xs font-bold text-slate-400">{t('家族のスマホでこのコードを入力してもらいます', 'この ばんごうを かぞくに')}</p>
                <p className="text-3xl font-black tracking-[0.2em] text-slate-800 my-2 font-mono">4821-0637</p>
                <p className="text-[11px] text-slate-400 mb-3">10分間有効・デモ用</p>
                <Btn onClick={() => { d({ type: 'FAMILY_ADD' }); setInviting(false) }}>
                  {t(`（デモ）${FAMILY_INVITE.name}さんが入力した`, 'つながった（デモ）')}
                </Btn>
              </Card>
            ) : (
              <Btn tone="ghost" onClick={() => setInviting(true)}>
                <UserPlus size={18} /> {t('家族を招待する', 'かぞくを よぶ')}
              </Btn>
            )}
          </div>
        )}
      </div>

      <FamilyPreview />

      <div className="flex items-start gap-2 px-1 text-[11px] text-slate-400">
        <ShieldCheck size={14} className="shrink-0 mt-0.5" />
        <p>{t('家族に共有されるのは通院の状況だけで、診察内容や検査結果は共有されません（設計案）。連携はいつでも解除できます。', 'しんさつの なかみは とどきません')}</p>
      </div>

      {/* ===== 設定 ===== */}
      <div>
        <p className="font-bold text-slate-800 px-1 mb-2">{t('設定', 'せってい')}</p>
        <Card className="space-y-4">
          {[
            [Type, t('やさしい表示（文字を大きく）', 'やさしい ひょうじ'), 'easy'],
            [Volume2, t('音声で読み上げ', 'こえで よむ'), 'sound'],
          ].map(([Icon, label, flag]) => (
            <div key={flag} className="flex items-center gap-3">
              <Icon size={18} className="text-slate-400" />
              <p className="flex-1 text-sm font-bold text-slate-700">{label}</p>
              <Switch on={s.flags[flag]} onClick={() => d({ type: 'TOGGLE', flag })} label={label} />
            </div>
          ))}
          <div className="flex items-center gap-3">
            <Wifi size={18} className="text-slate-400" />
            <p className="flex-1 text-sm font-bold text-slate-700">{t('院内Wi-Fiに自動でつなぐ', 'Wi-Fi')}</p>
            <Switch on={s.wifi} onClick={() => d({ type: 'WIFI' })} label="院内Wi-Fi" />
          </div>
        </Card>
      </div>
    </Page>
  )
}
