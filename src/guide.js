// 提案資料（スライド）の各項目 → mock の該当箇所
//
// tour：自動操作の手順（いつも「前日の夜・ホーム」から始める）
//   { t: 'time', to, say }        シナリオの時間を進める（STEPS の番号 - 1 まで）。時間早送りの画面を出す
//   { t: 'tap', target, say }     指を動かして data-tour="target" を押す
//   { t: 'look', anchor, say }    data-anchor="anchor" までスクロールして光らせる
//   { t: 'flag', set, label, say } デモ用の設定を変える（画面のボタンでは変えられないもの）
//   { t: 'wait', ms, say }        待つ（相手の応答・アニメーションを見せる）
// done：最後に出す一言 / jump：「すぐ移動」用 / near：mock では近い機能で見せているもの
export const GUIDE = [
  {
    slide: '04',
    title: '病院に来るまで',
    items: [
      {
        t: '家族・近大生から紹介',
        sub: '家族連携（招待・見守り通知）',
        near: '近大生からの紹介そのものは未実装。家族を招待する流れで見せています',
        tour: [
          { t: 'tap', target: 'account', say: '右上の人のアイコンからアカウントを開きます' },
          { t: 'look', anchor: 'family', say: '家族と連携すると、通院の様子が家族にも届きます' },
        ],
        done: '離れて暮らす家族も、受付・呼び出し・会計・帰宅を見守れます',
        jump: { step: 0, view: 'account', anchor: 'family' },
      },
      {
        t: '垂れ幕、のぼり旗で周知',
        sub: 'ホームのバナー「まだ待合室で待ってるの？」',
        tour: [{ t: 'look', anchor: 'banner', say: 'ホームの下に、垂れ幕と同じキャッチコピーのバナー' }],
        done: '病院の外壁・泉ケ丘駅の垂れ幕とアプリの見た目をそろえます',
        jump: { step: 0, view: 'home', anchor: 'banner' },
      },
      {
        t: '24時間の受付予約',
        sub: '夜でもマグロと話して仮受付 → 翌朝本受付',
        tour: [
          { t: 'tap', target: 'act-reception', say: '前日の夜 21:30。バーコードの下の「受付」を押します' },
          { t: 'tap', target: 'talk', say: '「押して話す」で、マグロに話しかけます' },
          { t: 'wait', ms: 2200, say: '話すだけで仮受付。体調日記から問診票の下書きもできます' },
          { t: 'time', to: 2, say: '翌朝 6:00 に、自動で本受付になります' },
        ],
        done: '当日の朝を待たずに、いつでも受付できます',
        jump: { step: 1, view: 'reception' },
      },
      {
        t: '自動運転で通院支援',
        sub: '行き方に自動運転バス（将来構想）',
        tour: [{ t: 'look', anchor: 'transit', say: '「病院への行き方」に、自動運転バス（将来構想）' }],
        done: '近大の研究と連携して、駅や自宅から病院までの移動を支えます',
        jump: { step: 0, view: 'home', anchor: 'transit' },
      },
    ],
  },
  {
    slide: '06',
    title: 'すいすいと診察室へ',
    items: [
      {
        t: '日記からAIで問診表を作成',
        sub: '体調日記 → AI問診票・医療データの利活用',
        tour: [
          { t: 'tap', target: 'svc-records', say: 'サービスの「体調日記」を開きます' },
          { t: 'look', anchor: 'monshin', say: '記録から、AI が主訴・経過・随伴症状にまとめます' },
        ],
        done: '診断はせず、医師が読みやすい下書きを作ります',
        jump: { step: 0, view: 'records', anchor: 'monshin' },
      },
      {
        t: '案内板の増設',
        sub: '区画番号（3L・3B）に色を付けた案内板と連動',
        tour: [
          { t: 'time', to: 5, say: '当日の朝、病院に着いて採血へ向かうところまで進めます' },
          { t: 'look', anchor: 'signboard', say: '院内の案内板と同じ「3L（赤）」の記号で案内します' },
        ],
        done: '看板とアプリが同じ番号・色でつながるので迷いません',
        jump: { step: 5, view: 'nav', anchor: 'signboard' },
      },
      {
        t: '空いている診療科から案内',
        sub: '検査→診察の順番と待ち状況',
        tour: [
          { t: 'time', to: 6, say: '採血が終わったところまで進めます' },
          { t: 'tap', target: 'queue-row', say: '「あと◯人」を押して、待ち状況を詳しく見ます' },
        ],
        done: '検査の順番を守りつつ、次に行く場所と待ち時間の目安を出します',
        jump: { step: 6, view: 'queue' },
      },
      {
        t: '自動チェックイン',
        sub: '位置情報で到着を自動で受付',
        tour: [
          { t: 'time', to: 4, say: '泉ケ丘駅から歩いて、病院に着くまで進めます' },
          { t: 'wait', ms: 1800, say: '敷地に入ると、診察券をかざさなくても自動で到着を受付' },
        ],
        done: '受付機に並ばず、そのまま検査へ向かえます',
        jump: { step: 4, view: 'home' },
      },
      {
        t: '待つ場所を選べる',
        sub: 'カフェなどで待って呼び出し通知',
        tour: [
          { t: 'time', to: 6, say: '採血が終わって、診察を待つところまで進めます' },
          { t: 'tap', target: 'act-nav', say: '「院内案内」を開きます' },
          { t: 'tap', target: 'wait-cafe', say: '待つ場所に「7号館 3F CAFE CORE」を選びます' },
        ],
        done: '順番が近づいたら通知が来るので、待合室にいなくても大丈夫',
        jump: { step: 7, view: 'nav', anchor: 'wait' },
      },
      {
        t: '呼び出し通知',
        sub: '診察の順番が来たら通知（ベルのお知らせ・端末の通知）',
        tour: [
          { t: 'time', to: 9, say: 'カフェで待っている間に、順番が進みます' },
          { t: 'tap', target: 'bell', say: '右上のベルから、届いたお知らせを確認します' },
        ],
        done: '「あと2人」の予告と呼び出しが、端末の通知でも届きます',
        jump: { step: 9, view: 'queue' },
      },
      {
        t: 'マイナンバーとの連携',
        sub: '診察券画面のマイナ保険証連携',
        tour: [
          { t: 'tap', target: 'nav-card', say: '下の真ん中の「診察券」を押します' },
          { t: 'look', anchor: 'mynumber', say: 'マイナ保険証と連携して、保険の情報を自動で更新' },
        ],
        done: '毎月の保険証の確認が不要になることを目指します',
        jump: { step: 0, view: 'card', anchor: 'mynumber' },
      },
    ],
  },
  {
    slide: '08',
    title: '会計から帰宅まで支援',
    items: [
      {
        t: '選べる支払い方法',
        sub: 'カード後払い・Apple Pay・窓口',
        tour: [
          { t: 'time', to: 10, say: '診察が終わるところまで進めます' },
          { t: 'look', anchor: 'paymethods', say: 'カード後払い・Apple Pay・窓口から選べます' },
        ],
        done: 'カード登録があれば、会計に並ばずそのまま帰れます',
        jump: { step: 10, view: 'pay', anchor: 'paymethods' },
      },
      {
        t: '窓口の強化',
        sub: 'カード登録が不安な人の登録サポート窓口',
        tour: [
          { t: 'flag', set: { card: false }, label: 'カード未登録の人として見ます', say: 'カード登録が怖くて、まだ登録していない人の場合' },
          { t: 'time', to: 10, say: '診察が終わるところまで進めます' },
          { t: 'look', anchor: 'cardhelp', say: '登録サポート窓口で、職員や近大生と一緒に登録できます' },
        ],
        done: '登録しなくても、窓口・自動支払機でいつもどおり払えます',
        jump: { step: 10, view: 'pay', anchor: 'cardhelp', flags: { card: false } },
      },
      {
        t: '領収書・明細を簡便に',
        sub: 'PDF保存・コンビニ印刷・アプリで管理',
        tour: [
          { t: 'time', to: 11, say: '支払いが済むところまで進めます' },
          { t: 'tap', target: 'nav-home', say: '「ホーム」に戻ります' },
          { t: 'tap', target: 'svc-receipts', say: 'サービスの「領収書」を開きます' },
        ],
        done: 'PDF で保存したり、コンビニで印刷したりできます',
        jump: { step: 11, view: 'receipts' },
      },
      {
        t: '会計ファイルを色分け',
        sub: 'アプリ利用者専用の水色ファイル',
        tour: [
          { t: 'flag', set: { card: false }, label: '窓口で払う人として見ます', say: '窓口で払う人の場合' },
          { t: 'time', to: 10, say: '診察が終わるところまで進めます' },
          { t: 'look', anchor: 'paymethods', say: '「窓口・自動支払機」に、アプリ利用者用の水色ファイル' },
        ],
        done: '色の違いに気づいた人に、アプリが自然に広まります',
        jump: { step: 10, view: 'pay', anchor: 'paymethods', flags: { card: false } },
      },
      {
        t: '帰宅前に検査を確認',
        sub: '検査を残して出口へ → 帰宅防止アラート',
        tour: [
          { t: 'time', to: 4, say: '病院に着いたところまで進めます（採血はまだ）' },
          { t: 'tap', target: 'demo-leave', say: '採血を忘れて、出口へ向かってしまうと…' },
        ],
        done: '画面と音声で引き止めます。家族にも知らせます',
        jump: { step: 4, view: 'home', actions: [{ type: 'LEAVE' }] },
      },
      {
        t: '帰りの交通情報を表示',
        sub: '帰りの徒歩・バスの時刻',
        tour: [
          { t: 'time', to: 12, say: '会計を済ませて、病院を出るところまで進めます' },
          { t: 'look', anchor: 'transit', say: '帰りの徒歩ルートとバスの時刻が出ます' },
        ],
        done: '開くだけで、帰りの移動まで分かります',
        jump: { step: 12, view: 'home', anchor: 'transit' },
      },
    ],
  },
  {
    slide: '09',
    title: 'その他',
    items: [
      {
        t: 'シンプルUI',
        sub: 'やさしい表示（院内Wi-Fiのワンタッチ接続はアカウント画面）',
        tour: [
          { t: 'time', to: 4, say: '病院に着いたところまで進めます' },
          { t: 'tap', target: 'easy', say: '「やさしい表示」に切り替えます' },
          { t: 'wait', ms: 1600, say: '文字が大きく、ことばがやさしくなり、項目も減ります' },
        ],
        done: '高齢の方でも、迷わず使えます',
        jump: { step: 4, view: 'home', flags: { easy: true } },
      },
      {
        t: '音声AIで説明・操作',
        sub: 'AIコンシェルジュ（話して質問・字幕でも確認）',
        tour: [
          { t: 'time', to: 4, say: '病院に着いたところまで進めます' },
          { t: 'tap', target: 'nav-ai', say: '右下の「AIに相談」を開きます' },
          { t: 'tap', target: 'faq-0', say: '「次はどこに行けばいい？」と聞いてみます' },
          { t: 'wait', ms: 2500, say: '声で答え、字幕でも確認できます' },
        ],
        done: '案内デスクや電話の問い合わせを、AI が24時間受けます',
        jump: { step: 4, view: 'ai' },
      },
      {
        t: 'ユニークな案内役達',
        sub: '近大マグロ・マンモス（テキスト／2D／3D）',
        tour: [
          { t: 'tap', target: 'nav-ai', say: '「AIに相談」を開きます' },
          { t: 'tap', target: 'mode-2d', say: '見た目を「2D」にします' },
          { t: 'tap', target: 'who-mammoth', say: '案内役を「マンモス」に' },
          { t: 'tap', target: 'faq-3', say: '話しかけると、口を動かして答えます' },
          { t: 'wait', ms: 2500, say: '' },
        ],
        done: '親しみのあるキャラで、老若男女が話したくなるように',
        jump: { step: 4, view: 'ai', flags: { avatar: '2d', who: 'mammoth', easy: false } },
      },
      {
        t: '非常時のサポート',
        sub: '救急外来・119・#7119',
        near: '災害時の連絡機能は未実装。救急の画面で見せています',
        tour: [{ t: 'tap', target: 'svc-er', say: 'サービスの「救急外来」を開きます' }],
        done: '119・#7119・病院への電話と、院内からのルートをまとめています',
        jump: { step: 4, view: 'er' },
      },
      {
        t: '近大生と操作練習',
        sub: '登録サポート窓口（職員・近大生ボランティア）',
        near: '操作練習そのものは未実装。登録サポートの案内で見せています',
        tour: [
          { t: 'flag', set: { card: false }, label: 'カード未登録の人として見ます', say: 'まだアプリの登録が済んでいない人の場合' },
          { t: 'tap', target: 'nav-pay', say: '「支払い」を開きます' },
          { t: 'look', anchor: 'cardhelp', say: '職員や近大生ボランティアが、登録から一緒に手伝います' },
        ],
        done: '',
        jump: { step: 10, view: 'pay', anchor: 'cardhelp', flags: { card: false } },
      },
      {
        t: '院内SNS・ブログ',
        sub: 'みんなの広場',
        tour: [
          { t: 'tap', target: 'svc-community', say: 'サービスの「みんなの広場」を開きます' },
          { t: 'tap', target: 'sns-review', say: '「レビュー」では、先生へのありがとうと、お薬の飲みやすさを共有' },
        ],
        done: '同じ病院に通う人どうしで情報を分け合い、不安を減らします',
        jump: { step: 4, view: 'community', flags: { easy: false } },
      },
    ],
  },
]
