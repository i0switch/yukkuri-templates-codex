import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {stringify} from 'yaml';

import {blockLegacyEpisodeGenerator} from './legacy-generator-guard.mjs';

blockLegacyEpisodeGenerator('create-two-five-minute-episodes.mjs');

const rootDir = process.cwd();

const episodes = [
  {
    id: 'ep501-zm-ai-habit-automation',
    title: 'AI自動化で時間が増えない本当の理由',
    template: 'Scene02',
    templateFile: 'templates/scene-02_gray-3panel.md',
    templateMemo: {
      main_content: '左上の大きなグレー枠に図解カードを表示',
      sub_content: '右縦長枠に3項目以内の補足',
      subtitle_area: '下部白帯に短い字幕を表示',
      title_area: 'title_areaなし',
    },
    theme: '便利なAIを入れても時間が増えない理由を、仕組み化と運用設計の観点で解説',
    angle: '損失回避型。ツール導入だけで安心すると、確認作業が増えて逆に消耗する',
    chapters: [
      {
        role: 'intro',
        visual: 'AI導入で逆に忙しくなる図',
        sub: ['導入だけ', '確認地獄', '仕組み不足'],
        lines: [
          ['right', 'AIで時短したはずが危ないのよ', 'serious'],
          ['left', 'え、楽になる話じゃないのだ', 'surprised'],
          ['right', '入れ方を間違えると逆に増えるわ', 'calm'],
          ['left', '仕事が増えるのはイヤなのだ', 'worried'],
          ['right', '今日はその罠をほどくわ', 'smile'],
          ['left', 'ちゃんと助かりたいのだ', 'happy'],
        ],
      },
      {
        role: 'body',
        visual: '時短のつもりが確認で詰まる',
        sub: ['生成', '確認', '修正'],
        lines: [
          ['right', 'まず時短は生成だけじゃないの', 'calm'],
          ['left', '作ってくれたら勝ちなのだ', 'puzzled'],
          ['right', 'その後の確認が本番なのよ', 'serious'],
          ['left', 'そこを忘れてたのだ', 'worried'],
          ['right', '確認が曖昧だと全部見る羽目よ', 'calm'],
          ['left', '結局手作業なのだ', 'shocked'],
        ],
      },
      {
        role: 'body',
        visual: 'プロンプトより入力素材が大事',
        sub: ['目的', '制約', '例'],
        lines: [
          ['right', 'プロンプトだけ磨いても弱いわ', 'serious'],
          ['left', '魔法の文章じゃないのだ', 'surprised'],
          ['right', '必要なのは良い入力なのよ', 'calm'],
          ['left', '材料が雑だと崩れるのだ', 'puzzled'],
          ['right', '目的と制約と例を先に渡すの', 'smile'],
          ['left', '料理の下ごしらえなのだ', 'happy'],
        ],
      },
      {
        role: 'body',
        visual: '任せる仕事と任せない仕事の境界',
        sub: ['下書き', '分類', '要約'],
        lines: [
          ['right', '全部任せる発想が危ないの', 'serious'],
          ['left', '全自動って言葉に弱いのだ', 'worried'],
          ['right', 'AIは下書きと整理が得意よ', 'calm'],
          ['left', '決定は人間が持つのだ', 'happy'],
          ['right', '境界を決めるだけで事故が減るわ', 'smile'],
          ['left', '任せ方の設計なのだ', 'surprised'],
        ],
      },
      {
        role: 'body',
        visual: '確認リストがないと不安が増える',
        sub: ['事実', '数字', '口調'],
        lines: [
          ['right', '確認リストは必須なのよ', 'serious'],
          ['left', '毎回なんとなく見てたのだ', 'worried'],
          ['right', 'それだと不安が消えないわ', 'calm'],
          ['left', 'だから全部読み返すのだ', 'shocked'],
          ['right', '見る場所を先に固定するの', 'smile'],
          ['left', '安心の地図なのだ', 'happy'],
        ],
      },
      {
        role: 'body',
        visual: '一回きり作業は自動化しない',
        sub: ['頻度', '時間', '失敗'],
        lines: [
          ['right', '何でも自動化はコスパ悪いわ', 'calm'],
          ['left', '自動化は正義じゃないのだ', 'surprised'],
          ['right', '繰り返す作業から選ぶのよ', 'serious'],
          ['left', '一回だけなら手でいいのだ', 'happy'],
          ['right', '失敗時の戻し方も見るわ', 'calm'],
          ['left', '出口も大事なのだ', 'puzzled'],
        ],
      },
      {
        role: 'body',
        visual: '小さく試してから広げる',
        sub: ['1業務', '1週間', '1指標'],
        lines: [
          ['right', '最初は小さく試すのが強いわ', 'smile'],
          ['left', 'いきなり全社は怖いのだ', 'worried'],
          ['right', '一業務だけで数字を見るの', 'calm'],
          ['left', '時間が減ったか見るのだ', 'happy'],
          ['right', '増えたなら戻せばいいわ', 'smile'],
          ['left', 'それなら怖くないのだ', 'happy'],
        ],
      },
      {
        role: 'body',
        visual: '出力よりフロー全体を見る',
        sub: ['前工程', 'AI処理', '後工程'],
        lines: [
          ['right', '大事なのはフロー全体なのよ', 'serious'],
          ['left', 'AI部分だけ見てたのだ', 'puzzled'],
          ['right', '前後が重いと時短にならないわ', 'calm'],
          ['left', '入口と出口も仕事なのだ', 'surprised'],
          ['right', 'そこを短くして初めて効くの', 'smile'],
          ['left', '点じゃなく線なのだ', 'happy'],
        ],
      },
      {
        role: 'body',
        visual: '人に渡せる手順にする',
        sub: ['手順書', '例文', 'NG例'],
        lines: [
          ['right', '属人化したAI活用は弱いわ', 'serious'],
          ['left', 'あの人だけ使える状態なのだ', 'worried'],
          ['right', '手順と例文を残すのよ', 'calm'],
          ['left', '新人でも回せる形なのだ', 'happy'],
          ['right', 'それが仕組み化の入口ね', 'smile'],
          ['left', '便利から資産になるのだ', 'happy'],
        ],
      },
      {
        role: 'body',
        visual: '成果物の置き場を決める',
        sub: ['保存名', '場所', '期限'],
        lines: [
          ['right', '保存ルールも地味に効くわ', 'calm'],
          ['left', 'そこまで必要なのだ', 'puzzled'],
          ['right', '探す時間は毎日漏れるのよ', 'serious'],
          ['left', '確かにファイル迷子なのだ', 'worried'],
          ['right', '名前と場所を固定するだけよ', 'smile'],
          ['left', '小さいけど効くのだ', 'happy'],
        ],
      },
      {
        role: 'body',
        visual: '自動化の失敗をログに残す',
        sub: ['原因', '対処', '再発'],
        lines: [
          ['right', '失敗ログを残すと強くなるわ', 'calm'],
          ['left', '失敗は消したいのだ', 'worried'],
          ['right', '消すと同じ事故が戻るのよ', 'serious'],
          ['left', '痛い記録だけど必要なのだ', 'puzzled'],
          ['right', '原因と対処だけで十分よ', 'smile'],
          ['left', '次の自分を助けるのだ', 'happy'],
        ],
      },
      {
        role: 'body',
        visual: 'AI活用の判断基準3つ',
        sub: ['繰返し', '確認可', '戻せる'],
        lines: [
          ['right', '判断基準は三つでいいわ', 'smile'],
          ['left', '覚えやすいのがいいのだ', 'happy'],
          ['right', '繰り返す、確認できる、戻せる', 'calm'],
          ['left', 'この三つが合格ラインなのだ', 'surprised'],
          ['right', '外れたら無理に使わないの', 'serious'],
          ['left', '引き算も大事なのだ', 'happy'],
        ],
      },
      {
        role: 'body',
        visual: 'よくある誤解を整理',
        sub: ['早い', '安い', '万能'],
        lines: [
          ['right', 'AIは万能ではなく増幅器なの', 'serious'],
          ['left', '雑さも増えるのだ', 'shocked'],
          ['right', '良い手順はさらに速くなるわ', 'calm'],
          ['left', '悪い手順も速く崩れるのだ', 'worried'],
          ['right', 'だから先に型を作るのよ', 'smile'],
          ['left', '型が主役なのだ', 'happy'],
        ],
      },
      {
        role: 'body',
        visual: '今日からできる小さな一手',
        sub: ['1作業', '1型', '1確認'],
        lines: [
          ['right', '今日やるなら一作業だけ選ぶの', 'smile'],
          ['left', '欲張らないのだ', 'happy'],
          ['right', '型を作って確認リストを添えるわ', 'calm'],
          ['left', 'それならすぐ試せるのだ', 'surprised'],
          ['right', '一週間だけ数字を見るのよ', 'serious'],
          ['left', '時間で判断するのだ', 'happy'],
        ],
      },
      {
        role: 'body',
        visual: 'コメント誘導：あなたの作業は？',
        sub: ['文章', '整理', '返信'],
        lines: [
          ['right', 'みんなは何を任せたいかしら', 'smile'],
          ['left', 'コメントで知りたいのだ', 'happy'],
          ['right', '文章、整理、返信で変わるわ', 'calm'],
          ['left', '向き不向きがあるのだ', 'puzzled'],
          ['right', '作業名で考えるのがコツよ', 'smile'],
          ['left', 'ツール名より作業名なのだ', 'happy'],
        ],
      },
      {
        role: 'outro',
        visual: 'まとめ：AIは仕組みに入れる',
        sub: ['型', '確認', '小さく'],
        lines: [
          ['right', 'まとめると道具より仕組みよ', 'smile'],
          ['left', 'AIを置くだけではダメなのだ', 'serious'],
          ['right', '型、確認、小さな検証が大事ね', 'calm'],
          ['left', '今日から一つ変えるのだ', 'happy'],
          ['right', '放置すると確認地獄になるわ', 'serious'],
          ['left', '仕組みにして助かるのだ', 'happy'],
        ],
      },
    ],
  },
  {
    id: 'ep502-zm-money-leak-subscription',
    title: 'サブスク貧乏を止める3つの見直し方',
    template: 'Scene17',
    templateFile: 'templates/scene-17_sf-3stack-mid.md',
    templateMemo: {
      main_content: '中央の明るい大パネルに図解カードを表示',
      sub_content: 'sub_contentなし',
      subtitle_area: '下部黒帯に白字幕を表示',
      title_area: '上部黒帯に章タイトルを表示',
    },
    theme: '毎月のサブスク固定費が気づかないうちに増える理由と見直し方',
    angle: '損失回避型。小さい月額の放置が年間支出を静かに削る',
    chapters: [
      {
        role: 'intro',
        visual: '小さな月額が年間で大きくなる',
        titleText: 'サブスク貧乏の入口',
        lines: [
          ['right', '小さい月額ほど危ないのよ', 'serious'],
          ['left', '数百円なら平気なのだ', 'puzzled'],
          ['right', '年間にすると顔が変わるわ', 'calm'],
          ['left', '急に怖くなったのだ', 'worried'],
          ['right', '今日は漏れを止める話よ', 'smile'],
          ['left', '財布を救いたいのだ', 'happy'],
        ],
      },
      {
        role: 'body',
        visual: '月額表示の心理トリック',
        titleText: '月額表示の罠',
        lines: [
          ['right', '月額表示は痛みが小さく見えるの', 'calm'],
          ['left', '確かに安く見えるのだ', 'surprised'],
          ['right', 'でも支払いは毎月続くわ', 'serious'],
          ['left', '終わりがないのだ', 'worried'],
          ['right', 'だから年額に直すのが第一歩よ', 'smile'],
          ['left', '現実を見るのだ', 'happy'],
        ],
      },
      {
        role: 'body',
        visual: '使ってないのに払う状態',
        titleText: '未使用の固定費',
        lines: [
          ['right', '一番多いのは使ってない課金ね', 'serious'],
          ['left', '登録した記憶だけあるのだ', 'worried'],
          ['right', '人は解約作業を先延ばしするわ', 'calm'],
          ['left', '面倒が勝つのだ', 'puzzled'],
          ['right', 'その面倒代を毎月払ってるの', 'serious'],
          ['left', '言い方が刺さるのだ', 'shocked'],
        ],
      },
      {
        role: 'body',
        visual: '無料体験の終わりを忘れる',
        titleText: '無料体験の出口',
        lines: [
          ['right', '無料体験は出口を決めて使うの', 'calm'],
          ['left', '入口しか見てなかったのだ', 'surprised'],
          ['right', '登録日に解約日を予定に入れるわ', 'smile'],
          ['left', '未来の自分を守るのだ', 'happy'],
          ['right', '使うなら継続判断をするだけよ', 'calm'],
          ['left', '放置をなくすのだ', 'serious'],
        ],
      },
      {
        role: 'body',
        visual: '似たサービスが重複する',
        titleText: '重複サブスク',
        lines: [
          ['right', '似たサービスの重複も多いわ', 'calm'],
          ['left', '動画サービスが増えがちなのだ', 'puzzled'],
          ['right', '同じ役割なら一つに絞るのよ', 'serious'],
          ['left', '使い分けてる気がするのだ', 'worried'],
          ['right', '実績で見ると答えが出るわ', 'smile'],
          ['left', '気分じゃなく履歴なのだ', 'happy'],
        ],
      },
      {
        role: 'body',
        visual: '年額割引にも注意',
        titleText: '年額割引の注意',
        lines: [
          ['right', '年額割引も常に得とは限らないわ', 'serious'],
          ['left', '安いなら得じゃないのだ', 'puzzled'],
          ['right', '一年使う前提なら得なのよ', 'calm'],
          ['left', '飽きたら損なのだ', 'worried'],
          ['right', '迷うなら月額で様子を見るの', 'smile'],
          ['left', '安さに飛びつかないのだ', 'happy'],
        ],
      },
      {
        role: 'body',
        visual: '解約しづらさを見抜く',
        titleText: '解約導線を見る',
        lines: [
          ['right', '契約前に解約方法を見るのよ', 'serious'],
          ['left', 'そこから見るのだ', 'surprised'],
          ['right', '出口が遠いサービスは注意ね', 'calm'],
          ['left', '迷路みたいなやつなのだ', 'worried'],
          ['right', 'スクショを残すのもありよ', 'smile'],
          ['left', '証拠を持つのだ', 'happy'],
        ],
      },
      {
        role: 'body',
        visual: '家族共有と個人契約を整理',
        titleText: '共有で減らす',
        lines: [
          ['right', '家族共有で減らせるものもあるわ', 'calm'],
          ['left', '同じものを別々に払うのだ', 'puzzled'],
          ['right', '規約の範囲で整理するのよ', 'serious'],
          ['left', 'ルール違反はダメなのだ', 'serious'],
          ['right', '正しくまとめるだけで軽くなるわ', 'smile'],
          ['left', '固定費ダイエットなのだ', 'happy'],
        ],
      },
      {
        role: 'body',
        visual: '月一のサブスク棚卸し',
        titleText: '月一棚卸し',
        lines: [
          ['right', '月一回だけ棚卸し日を作るの', 'smile'],
          ['left', '毎日見るのは無理なのだ', 'worried'],
          ['right', 'カード明細を一画面で見るわ', 'calm'],
          ['left', '現実チェックの日なのだ', 'happy'],
          ['right', '残す理由が言えない物は候補よ', 'serious'],
          ['left', '理由がない課金は危険なのだ', 'shocked'],
        ],
      },
      {
        role: 'body',
        visual: '残す基準を3つにする',
        titleText: '残す基準',
        lines: [
          ['right', '残す基準は三つでいいわ', 'smile'],
          ['left', '簡単なのが助かるのだ', 'happy'],
          ['right', '週一で使う、代替不可、元が取れる', 'calm'],
          ['left', 'かなりはっきりするのだ', 'surprised'],
          ['right', '曖昧なら一度止めるのよ', 'serious'],
          ['left', '止めて困るか試すのだ', 'happy'],
        ],
      },
      {
        role: 'body',
        visual: '解約しても戻れる安心',
        titleText: '一度止める',
        lines: [
          ['right', '解約は永遠の別れじゃないわ', 'calm'],
          ['left', 'また入ってもいいのだ', 'surprised'],
          ['right', '必要なら戻せばいいだけよ', 'smile'],
          ['left', 'それなら止めやすいのだ', 'happy'],
          ['right', '怖いのは放置し続けることね', 'serious'],
          ['left', '静かな出血なのだ', 'worried'],
        ],
      },
      {
        role: 'body',
        visual: '支払い方法を分ける',
        titleText: '見える化',
        lines: [
          ['right', '支払い方法を分けるのも有効よ', 'calm'],
          ['left', 'サブスク専用カードなのだ', 'puzzled'],
          ['right', '一覧で見えると判断しやすいわ', 'smile'],
          ['left', '散らばると見逃すのだ', 'worried'],
          ['right', '管理は気合より設計なのよ', 'serious'],
          ['left', 'ここでも仕組みなのだ', 'happy'],
        ],
      },
      {
        role: 'body',
        visual: '浮いたお金の行き先を決める',
        titleText: '浮いたお金',
        lines: [
          ['right', '減らしたお金の行き先も決めるの', 'smile'],
          ['left', '浮いたら使っちゃうのだ', 'worried'],
          ['right', '貯金や投資に自動で逃がすわ', 'calm'],
          ['left', '守った分を残すのだ', 'happy'],
          ['right', '削減は残って初めて勝ちよ', 'serious'],
          ['left', '勝ちを確定するのだ', 'happy'],
        ],
      },
      {
        role: 'body',
        visual: 'よくある反論を整理',
        titleText: '反論チェック',
        lines: [
          ['right', '便利だから全部悪ではないわ', 'calm'],
          ['left', '必要なものもあるのだ', 'happy'],
          ['right', '問題は使ってない支払いよ', 'serious'],
          ['left', '価値ある課金は残すのだ', 'smile'],
          ['right', '我慢大会にしないのがコツね', 'smile'],
          ['left', '生活を軽くするのだ', 'happy'],
        ],
      },
      {
        role: 'body',
        visual: 'コメント誘導：残すなら何？',
        titleText: 'あなたの基準',
        lines: [
          ['right', 'みんなが残す一つは何かしら', 'smile'],
          ['left', 'コメントで見たいのだ', 'happy'],
          ['right', '必要な課金は人で違うわ', 'calm'],
          ['left', '基準を聞くと学べるのだ', 'happy'],
          ['right', '他人の見直し方も参考になるわ', 'smile'],
          ['left', '財布会議なのだ', 'happy'],
        ],
      },
      {
        role: 'outro',
        visual: 'まとめ：年額化して棚卸し',
        titleText: '今日のまとめ',
        lines: [
          ['right', 'まとめると年額で見ることよ', 'smile'],
          ['left', '月額の小ささに騙されないのだ', 'serious'],
          ['right', '使ってない物は一度止めるわ', 'calm'],
          ['left', '困ったら戻ればいいのだ', 'happy'],
          ['right', '放置こそ一番高いのよ', 'serious'],
          ['left', '今日一つ解約確認なのだ', 'happy'],
        ],
      },
    ],
  },
];

const escapePs = (value) => value.replace(/'/g, "''");

const runPowerShell = (script) => {
  const result = spawnSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', script], {
    cwd: rootDir,
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    throw new Error(`PowerShell failed\nSTDOUT:\n${result.stdout}\nSTDERR:\n${result.stderr}`);
  }
};

const drawCard = (file, title, body, accent) => {
  const ps = `
Add-Type -AssemblyName System.Drawing
$file = '${escapePs(file)}'
$dir = Split-Path -Parent $file
New-Item -ItemType Directory -Force -Path $dir | Out-Null
$bmp = New-Object System.Drawing.Bitmap 1280, 720
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$bg = [System.Drawing.ColorTranslator]::FromHtml('#F7FBFF')
$g.Clear($bg)
$accent = [System.Drawing.ColorTranslator]::FromHtml('${accent}')
$pen = New-Object System.Drawing.Pen($accent, 10)
$brushAccent = New-Object System.Drawing.SolidBrush($accent)
$brushText = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#16323F'))
$brushMuted = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#4B6470'))
$brushPale = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(38, $accent.R, $accent.G, $accent.B))
$g.FillRectangle($brushPale, 0, 0, 1280, 720)
$g.DrawRectangle($pen, 34, 34, 1212, 652)
$titleFont = New-Object System.Drawing.Font('Yu Gothic', 54, [System.Drawing.FontStyle]::Bold)
$bodyFont = New-Object System.Drawing.Font('Yu Gothic', 34, [System.Drawing.FontStyle]::Bold)
$smallFont = New-Object System.Drawing.Font('Yu Gothic', 24, [System.Drawing.FontStyle]::Regular)
$sf = New-Object System.Drawing.StringFormat
$sf.Alignment = [System.Drawing.StringAlignment]::Center
$sf.LineAlignment = [System.Drawing.StringAlignment]::Center
$g.DrawString('${escapePs(title)}', $titleFont, $brushText, (New-Object System.Drawing.RectangleF(80, 88, 1120, 150)), $sf)
$g.DrawLine($pen, 160, 250, 1120, 250)
$g.DrawString('${escapePs(body)}', $bodyFont, $brushText, (New-Object System.Drawing.RectangleF(110, 290, 1060, 260)), $sf)
$g.FillEllipse($brushAccent, 588, 586, 104, 104)
$g.DrawString('✓', $bodyFont, [System.Drawing.Brushes]::White, (New-Object System.Drawing.RectangleF(588, 586, 104, 104)), $sf)
$g.DrawString('動画用ローカル生成図解', $smallFont, $brushMuted, (New-Object System.Drawing.RectangleF(0, 640, 1280, 48)), $sf)
$bmp.Save($file, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
`;
  runPowerShell(ps);
};

const mdEscape = (value) => value.replace(/\|/g, '\\|');

const makeScriptMarkdown = (episode, scenes) => {
  const lines = [
    `# 動画台本`,
    '',
    `## 1. 基本情報`,
    '',
    `- 動画タイプ：ずんだもん解説`,
    `- テーマ：${episode.theme}`,
    `- 想定尺：約5分`,
    `- 想定視聴者：AI活用や家計改善を始めたい初心者`,
    `- 動画の目的：放置リスクを短く刺し、今日の行動へつなげる`,
    `- トーン：少し危機感あり、でも実用的でフランク`,
    '',
    `## 2. タイトル案`,
    '',
    `1. ${episode.title}`,
    `2. 知らないと毎月損する静かな罠`,
    `3. 放置すると時間とお金が消える理由`,
    '',
    `## 3. 冒頭フック案`,
    '',
    `- ${episode.chapters[0].lines[0][1]}`,
    `- ${episode.chapters[0].lines[1][1]}`,
    '',
    `## 4. 全体構成`,
    '',
    `| 章 | 役割 | 内容概要 | 目安尺 |`,
    `|---|---|---|---:|`,
  ];
  scenes.forEach((scene, index) => {
    lines.push(`| ${scene.id} | ${scene.role} | ${mdEscape(scene.main.caption)} | 約${Math.round(300 / scenes.length)}秒 |`);
  });
  lines.push('', `## 5. 本編台本`, '', `| scene_id | パート | 話者 | セリフ | 目的 | 素材候補メモ |`, `|---|---|---|---|---|---|`);
  scenes.forEach((scene) => {
    scene.dialogue.forEach((line) => {
      lines.push(`| ${scene.id} | ${scene.role} | ${line.speaker === 'left' ? 'ずんだもん' : 'めたん'} | ${mdEscape(line.text)} | ${scene.role === 'intro' ? '興味付け' : scene.role === 'outro' ? '要点回収' : '解説'} | ${mdEscape(scene.main.caption)} |`);
    });
  });
  lines.push('', `## 6. 重要用語リスト`, '', `| 用語 | かんたんな説明 |`, `|---|---|`, `| 仕組み化 | 気合ではなく手順と置き場で回すこと |`, `| 固定費 | 毎月ほぼ自動で出ていく支出 |`, '', `## 7. 視聴者がコメントしやすい問い`, '', `- あなたが今いちばん見直したい作業や支出はどれ？`, `- 残す基準、やめる基準は何にしてる？`, '', `## 8. 次回予告案`, '', `- 次回は「作業を減らすチェックリスト」の作り方を扱う`);
  return `${lines.join('\n')}\n`;
};

const makeImagePointMarkdown = (episode, scenes) => {
  const lines = [
    `# 画像ポイント付き台本`,
    '',
    `## テンプレート認識`,
    '',
    `- scene_template：${episode.template}`,
    `- main_content：${episode.templateMemo.main_content}`,
    `- sub_content：${episode.templateMemo.sub_content}`,
    `- subtitle_area：${episode.templateMemo.subtitle_area}`,
    `- title_area：${episode.templateMemo.title_area}`,
    `- 使用テンプレート指示書：${episode.templateFile}`,
    '',
    `## 画像挿入ポイント`,
    '',
    `| scene_id | scene_template | main_content | sub_content | subtitle_area | title_area | image_insert_point | asset_path |`,
    `|---|---|---|---|---|---|---|---|`,
  ];
  scenes.forEach((scene) => {
    lines.push(`| ${scene.id} | ${episode.template} | ${mdEscape(scene.main.caption)} | ${scene.sub ? mdEscape(scene.sub.items.join(' / ')) : 'sub_contentなし'} | ${episode.templateMemo.subtitle_area} | ${scene.title_text ?? episode.templateMemo.title_area} | ${scene.dialogue[0].id} の開始前から表示 | script/${episode.id}/${scene.main.asset} |`);
  });
  lines.push('', `## 台本`, '');
  scenes.forEach((scene) => {
    lines.push(`### ${scene.id}：${scene.main.caption}`, '', `- image_insert_point：${scene.dialogue[0].id} の開始前から表示`, `- asset_path：script/${episode.id}/${scene.main.asset}`, '');
    scene.dialogue.forEach((line) => lines.push(`- ${line.speaker === 'left' ? 'ずんだもん' : 'めたん'}：${line.text}`));
    lines.push('');
  });
  return `${lines.join('\n')}\n`;
};

const makeEditMarkdown = (episode, scenes) => {
  const lines = [
    `# 編集演出指示書`,
    '',
    `## 1. 全体設定`,
    '',
    `- 動画タイプ：ずんだもん解説`,
    `- 画面比率：16:9`,
    `- 解像度：1280x720`,
    `- 想定尺：約5分`,
    `- 編集環境：Remotion`,
    `- 通常字幕フォント：けいふぉんと相当`,
    `- 通常字幕スタイル：白文字 + 太い黒縁 + 軽い影`,
    `- テンプレート：全シーン ${episode.template} 固定`,
    '',
    `## 2. タイムライン概要`,
    '',
    `| パート | 目安時間 | 主な演出 | BGM |`,
    `|---|---:|---|---|`,
    `| OP | 0:00-0:20 | 図解カードを初手表示、危機感の一言で開始 | 軽いループ |`,
    `| 本編 | 0:20-4:40 | 各章カードを切替、キャラの表情で緩急 | 軽いループ |`,
    `| まとめ | 4:40-5:00 | 要点カード、行動CTA | フェードアウト |`,
    '',
    `## 3. シーン別演出`,
    '',
    `| scene_id | パート | 表示素材 | 字幕スタイル | 画面演出 | キャラ演出 | SE | BGM | 備考 |`,
    `|---|---|---|---|---|---|---|---|---|`,
  ];
  scenes.forEach((scene, index) => {
    const motion = index === 0 ? 'タイトル的に少し強め、カードを大きく見せる' : index % 4 === 0 ? '章切替感を出すため表示直後に軽く強調' : '通常カード表示';
    lines.push(`| ${scene.id} | ${scene.role} | ${scene.main.asset} | 1セリフ25字以内、下部帯に表示 | ${motion} | 発話側を口パク、驚き場面は表情強め | 必要ならポン | 低音量で通奏 | ${scene.main.caption} |`);
  });
  lines.push('', `## 4. 必要素材リスト`, '', `| asset_id | 種類 | 内容 | 用途 | 入手元候補 |`, `|---|---|---|---|---|`);
  scenes.forEach((scene) => lines.push(`| ${scene.id}_main | PNG図解 | ${mdEscape(scene.main.caption)} | メイン枠表示 | ローカル生成 |`));
  lines.push('', `## 5. 必要SEリスト`, '', `| se_id | 内容 | 使用場面 | 候補サイト |`, `|---|---|---|---|`, `| se_chapter | ポン | 章切替 | 効果音ラボ等 |`, '', `## 6. 必要BGMリスト`, '', `| bgm_id | 雰囲気 | 使用パート | 候補サイト |`, `|---|---|---|---|`, `| bgm_main | 軽い解説用ループ | 全編 | 既存ローカルBGM |`, '', `## 7. 字幕プリセット`, '', `| preset_id | 用途 | フォント | 色 | 縁取り | 背景 | サイズ目安 |`, `|---|---|---|---|---|---|---|`, `| subtitle_normal | 通常セリフ | けいふぉんと相当 | 白 | 黒太縁 | テンプレ字幕帯 | 60px前後 |`, `| subtitle_emphasis | 強調 | けいふぉんと相当 | 黄 | 黒太縁 | 必要時 | 通常より大きめ |`, '', `## 8. 実装時の注意`, '', `- 15〜20秒以上、同じ意味の画面を続けない`, `- SEを入れすぎない`, `- 字幕は最大2行`, `- 背景が複雑な場面では字幕帯を優先`, `- 素材はローカル生成PNGとして meta.json に記録済み`);
  return `${lines.join('\n')}\n`;
};

const createEpisode = async (episode) => {
  const episodeDir = path.join(rootDir, 'script', episode.id);
  const assetsDir = path.join(episodeDir, 'assets');
  const bgmDir = path.join(episodeDir, 'bgm');
  await fs.mkdir(assetsDir, {recursive: true});
  await fs.mkdir(bgmDir, {recursive: true});

  const sourceBgm = path.join(rootDir, 'script', 'ep000-test-all-21-scenes', 'bgm', 'track.mp3');
  const targetBgm = path.join(bgmDir, 'track.mp3');
  try {
    await fs.copyFile(sourceBgm, targetBgm);
  } catch {
    // BGM is optional for the renderer, but existing workspaces usually have it.
  }

  const scenes = episode.chapters.map((chapter, index) => {
    const sceneNo = String(index + 1).padStart(2, '0');
    const assetName = `s${sceneNo}_main.png`;
    const assetFile = path.join(assetsDir, assetName);
    drawCard(assetFile, chapter.visual, chapter.lines.slice(0, 3).map((line) => line[1]).join('\n'), episode.template === 'Scene02' ? '#2F9EC8' : '#47D18C');

    return {
      id: `s${sceneNo}`,
      role: chapter.role,
      ...(chapter.titleText ? {title_text: chapter.titleText} : {}),
      main: {
        kind: 'image',
        asset: `assets/${assetName}`,
        caption: chapter.visual,
      },
      sub: episode.template === 'Scene02'
        ? {
            kind: 'bullets',
            items: chapter.sub,
          }
        : null,
      dialogue: chapter.lines.map((line, lineIndex) => ({
        id: `l${String(lineIndex + 1).padStart(2, '0')}`,
        speaker: line[0],
        text: line[1],
        expression: line[2],
        pre_pause_sec: 0.08,
        post_pause_sec: 0.22,
      })),
    };
  });

  const script = {
    meta: {
      id: episode.id,
      title: episode.title,
      pair: 'ZM',
      fps: 30,
      width: 1280,
      height: 720,
      audience: '初心者向け',
      tone: '少し危機感あり、実用重視',
      bgm_mood: '軽い解説用ループ',
      voice_engine: 'voicevox',
      target_duration_sec: 300,
      image_style: 'ローカル生成のフラット図解カード',
      scene_template: episode.template,
    },
    characters: {
      left: {
        character: 'zundamon',
        voicevox_speaker_id: 3,
        speaking_style: '疑問役。語尾はのだ。',
      },
      right: {
        character: 'metan',
        voicevox_speaker_id: 2,
        speaking_style: '解説役。語尾はわ、のよ、ね。',
      },
    },
    bgm: {
      file: 'bgm/track.mp3',
      license: '既存ローカルBGM。プロジェクト内素材として流用',
      volume: 0.08,
      fade_in_sec: 1,
      fade_out_sec: 2,
    },
    scenes,
  };

  const meta = {
    episode_id: episode.id,
    title: episode.title,
    created_by: 'Codex local generation',
    template: episode.template,
    assets: [
      {
        file: 'bgm/track.mp3',
        title: '既存ローカルBGM',
        source_type: 'local_project_asset',
        license: '既存プロジェクト内素材。公開前に原典ライセンス再確認推奨',
      },
      ...scenes.map((scene) => ({
        file: scene.main.asset,
        title: scene.main.caption,
        source_type: 'local_generated_png',
        imagegen_prompt: `${episode.title} / ${scene.main.caption} / 日本語フラット図解カード`,
        license: 'ローカル生成素材',
      })),
    ],
  };

  await fs.writeFile(path.join(episodeDir, 'script.yaml'), stringify(script, {lineWidth: 0}), 'utf8');
  await fs.writeFile(path.join(episodeDir, 'meta.json'), `${JSON.stringify(meta, null, 2)}\n`, 'utf8');
  await fs.writeFile(path.join(episodeDir, 'script.md'), makeScriptMarkdown(episode, scenes), 'utf8');
  await fs.writeFile(path.join(episodeDir, 'script_with_image_points.md'), makeImagePointMarkdown(episode, scenes), 'utf8');
  await fs.writeFile(path.join(episodeDir, 'script_with_edit_notes.md'), makeEditMarkdown(episode, scenes), 'utf8');
};

for (const episode of episodes) {
  await createEpisode(episode);
}

console.log(JSON.stringify({created: episodes.map((episode) => episode.id)}, null, 2));










