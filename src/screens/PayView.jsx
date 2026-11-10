import { Check, CreditCard, Smartphone, Building2, Download, Printer, TriangleExclamationPoint, Info } from 'lucide-react'
import { useSim } from '../sim/context.js'
import { BILL, openTasks } from '../sim/model.js'
import { Page, Card, Pill, Btn, Sign } from '../components/ui.jsx'

function Receipt() {
  const { s, d, t } = useSim()
  const how = { card: '登録カード（**** 1234）で後払い・受診の5日後に引き落とし', applepay: 'Apple Pay でお支払い済み', counter: '窓口でお支払い済み' }[s.payMethod]
  return (
    <div className="space-y-5">
      <div className="text-center pt-4 space-y-4">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <Check size={48} />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-800">{t('お支払いが完了しました', 'はらいました')}</h3>
          <p className="text-slate-500 text-sm mt-2 leading-relaxed">{how}</p>
          {s.payMethod === 'card' && <p className="text-emerald-600 text-sm font-bold mt-1">{t('会計窓口に寄らずにお帰りいただけます', 'そのまま かえれます')}</p>}
        </div>
      </div>
      <Card>
        <p className="text-xs font-bold text-slate-400 mb-3">{t('領収書・明細', 'りょうしゅうしょ')}</p>
        <div className="grid grid-cols-2 gap-3">
          <Btn tone="ghost" onClick={() => d({ type: 'RECEIPT', how: 'pdf' })}>
            <Download size={18} /> PDF保存
          </Btn>
          <Btn tone="ghost" onClick={() => d({ type: 'RECEIPT', how: 'conbini' })}>
            <Printer size={18} /> コンビニ印刷
          </Btn>
        </div>
      </Card>
      <Btn tone="dark" onClick={() => d({ type: 'VIEW', view: 'home' })}>
        ホームに戻る
      </Btn>
    </div>
  )
}

export default function PayView() {
  const { s, d, t } = useSim()
  const open = openTasks(s)
  const billed = s.scene === 'after' || s.scene === 'home'

  const methods = [
    {
      id: 'card',
      Icon: CreditCard,
      name: t('登録カードで後払い', 'カードで あとばらい'),
      sub: s.flags.card ? t('**** 1234・窓口に並ばずそのまま帰れます', 'そのまま かえれます') : t('カード未登録です', 'カードが ありません'),
      disabled: !s.flags.card,
      rec: true,
    },
    { id: 'applepay', Icon: Smartphone, name: 'Apple Pay', sub: t('カード番号を登録しなくても使えます', ''), disabled: false },
    { id: 'counter', Icon: Building2, name: t('窓口・自動支払機', 'まどぐち'), sub: t('1号館 3F 総合受付前の会計・自動支払機で（水色ファイルの方は優先窓口・提案）', 'そうごう うけつけ の まえで'), disabled: false },
  ]

  return (
    <Page title={t('お支払い', 'しはらい')} badge={s.paid ? <Pill tone="green">支払い済み</Pill> : billed ? <Pill tone="amber">未精算</Pill> : null}>
      {s.paid ? (
        <Receipt />
      ) : !billed ? (
        <>
          <Card className="text-center py-8">
            <p className="font-bold text-slate-700">{t('診察が終わると、ここに金額が表示されます', 'しんさつの あとに でます')}</p>
            <p className="text-xs text-slate-500 mt-2">カード登録：{s.flags.card ? '済み（後払いで帰れます）' : '未登録'}</p>
          </Card>
          {!s.flags.card && (
            <div data-anchor="cardhelp">
              <CardHelp />
            </div>
          )}
        </>
      ) : open.length ? (
        <Card className="border-rose-100 bg-rose-50">
          <div className="flex gap-3 items-start">
            <TriangleExclamationPoint className="text-rose-500 shrink-0" />
            <div>
              <p className="font-bold text-rose-700">{t('まだ終わっていない検査があります', 'まだ けんさが あります')}</p>
              <p className="text-sm text-rose-600 mt-1">検査が終わると金額が確定します。</p>
              <div className="mt-3 flex items-center gap-2">
                <Sign id={open[0].place} /> <span className="font-bold text-slate-700 text-sm">{t(open[0].name, open[0].easy)}</span>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <>
          <Card>
            <p className="text-xs font-bold text-slate-400">{t('本日のお会計', 'きょうの おかね')}</p>
            <p className="text-4xl font-black text-slate-800 my-2 tabular-nums">
              {BILL.total.toLocaleString()}
              <span className="text-lg ml-1">円</span>
            </p>
            {!s.flags.easy && (
              <div className="space-y-1 pt-2 border-t border-slate-100">
                {BILL.items.map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm text-slate-500">
                    <span>{k}</span>
                    <span className="tabular-nums">{v.toLocaleString()} 円</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div className="space-y-3" data-anchor="paymethods">
            {methods.map((m) => (
              <button
                key={m.id}
                disabled={m.disabled}
                onClick={() => d({ type: 'PAY', method: m.id })}
                className="w-full bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 text-left disabled:opacity-50 active:scale-[.99]"
              >
                <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                  <m.Icon />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 flex items-center gap-2">
                    {m.name} {m.rec && !m.disabled && <Pill tone="green">おすすめ</Pill>}
                  </p>
                  <p className="text-xs text-slate-500">{m.sub}</p>
                </div>
              </button>
            ))}
          </div>
          {!s.flags.card && (
            <div data-anchor="cardhelp">
              <CardHelp />
            </div>
          )}
        </>
      )}
    </Page>
  )
}

// 「カード登録が怖い」人向け：対面の登録サポート窓口
function CardHelp() {
  const { t } = useSim()
  return (
    <Card className="bg-sky-50 border-sky-100">
      <div className="flex gap-3">
        <Info className="text-sky-500 shrink-0" />
        <div className="text-sm">
          <p className="font-bold text-sky-800">{t('カード登録が不安な方へ', 'カードの とうろくを てつだいます')}</p>
          <p className="text-sky-700 mt-1">{t('総合受付の近くに「登録サポート窓口」を置き、職員や近大生ボランティアが一緒に登録します（提案）。', 'まどぐちで いっしょに やります')}</p>
        </div>
      </div>
    </Card>
  )
}
