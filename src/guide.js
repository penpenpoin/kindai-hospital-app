// 提案資料（スライド）の各項目 → mock の該当箇所へのジャンプ先
//   step：シナリオの段階（0 始まり。STEPS の番号 - 1） / view：画面 / anchor：画面内でスクロールする場所
//   flags：そのとき切り替える設定 / actions：ジャンプ後に起こす出来事 / near：mock では近い機能で見せているもの
export const GUIDE = [
  {
    slide: '04',
    title: '病院に来るまで',
    items: [
      { t: '家族・近大生から紹介', sub: '家族連携（招待・見守り通知）', jump: { step: 0, view: 'account' }, near: '近大生からの紹介そのものは未実装。家族を招待する流れで見せています' },
      { t: '垂れ幕、のぼり旗で周知', sub: 'ホームのバナー「まだ待合室で待ってるの？」', jump: { step: 0, view: 'home', anchor: 'banner' } },
      { t: '24時間の受付予約', sub: '夜でもマグロと話して仮受付 → 翌朝本受付', jump: { step: 1, view: 'reception' } },
      { t: '自動運転で通院支援', sub: '行き方に自動運転バス（将来構想）', jump: { step: 0, view: 'home', anchor: 'transit' } },
    ],
  },
  {
    slide: '06',
    title: 'すいすいと診察室へ',
    items: [
      { t: '日記からAIで問診表を作成', sub: '体調日記 → AI問診票・医療データの利活用', jump: { step: 0, view: 'records' } },
      { t: '案内板の増設', sub: '区画番号（3L・3B）に色を付けた案内板と連動', jump: { step: 5, view: 'nav', anchor: 'signboard' } },
      { t: '空いている診療科から案内', sub: '検査→診察の順番と待ち状況', jump: { step: 6, view: 'queue' } },
      { t: '自動チェックイン', sub: '位置情報で到着を自動で受付', jump: { step: 4, view: 'home' } },
      { t: '待つ場所を選べる', sub: 'カフェなどで待って呼び出し通知', jump: { step: 7, view: 'nav', anchor: 'wait' } },
      { t: '呼び出し通知', sub: '診察の順番が来たら通知（ベルのお知らせ・端末の通知）', jump: { step: 9, view: 'queue' } },
      { t: 'マイナンバーとの連携', sub: '診察券画面のマイナ保険証連携', jump: { step: 0, view: 'card', anchor: 'mynumber' } },
    ],
  },
  {
    slide: '08',
    title: '会計から帰宅まで支援',
    items: [
      { t: '選べる支払い方法', sub: 'カード後払い・Apple Pay・窓口', jump: { step: 10, view: 'pay', anchor: 'paymethods' } },
      { t: '窓口の強化', sub: 'カード登録が不安な人の登録サポート窓口', jump: { step: 10, view: 'pay', anchor: 'cardhelp', flags: { card: false } } },
      { t: '領収書・明細を簡便に', sub: 'PDF保存・コンビニ印刷・アプリで管理', jump: { step: 11, view: 'receipts' } },
      { t: '会計ファイルを色分け', sub: 'アプリ利用者専用の水色ファイル', jump: { step: 10, view: 'pay', anchor: 'paymethods', flags: { card: false } } },
      { t: '帰宅前に検査を確認', sub: '検査を残して出口へ → 帰宅防止アラート', jump: { step: 4, view: 'home', actions: [{ type: 'LEAVE' }] } },
      { t: '帰りの交通情報を表示', sub: '帰りの徒歩・バスの時刻', jump: { step: 12, view: 'home', anchor: 'transit' } },
    ],
  },
  {
    slide: '09',
    title: 'その他',
    items: [
      { t: 'シンプルUI', sub: 'やさしい表示（院内Wi-Fiのワンタッチ接続はアカウント画面）', jump: { step: 4, view: 'home', flags: { easy: true } } },
      { t: '音声AIで説明・操作', sub: 'AIコンシェルジュ（話して質問・字幕でも確認）', jump: { step: 4, view: 'ai' } },
      { t: 'ユニークな案内役達', sub: '近大マグロ・マンモス（テキスト／2D／3D）', jump: { step: 4, view: 'ai', flags: { avatar: '2d', who: 'mammoth', easy: false } } },
      { t: '非常時のサポート', sub: '救急外来・119・#7119', jump: { step: 4, view: 'er' }, near: '災害時の連絡機能は未実装。救急の画面で見せています' },
      { t: '近大生と操作練習', sub: '登録サポート窓口（職員・近大生ボランティア）', jump: { step: 10, view: 'pay', anchor: 'cardhelp', flags: { card: false } }, near: '操作練習そのものは未実装。登録サポートの案内で見せています' },
      { t: '院内SNS・ブログ', sub: 'みんなの広場', jump: { step: 4, view: 'community', flags: { easy: false } } },
    ],
  },
]
