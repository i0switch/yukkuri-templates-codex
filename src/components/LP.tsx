import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import './LP.css';

const agents = [
  {name: '企画エージェント', status: 'ターゲットと構成を定義しました。', icon: '📋', time: '10:00'},
  {name: '台本エージェント', status: '台本を作成しました（約2,800文字）。', icon: '✍️', time: '10:01'},
  {name: '画像エージェント', status: 'サムネ・挿絵・背景を生成中...', icon: '🖼️', time: '10:02'},
  {name: '音声エージェント', status: 'ナレーションを生成中...', icon: '🎙️', time: '10:03'},
  {name: '動画エージェント', status: 'カット編集・BGM・テロップを合成中...', icon: '🎬', time: '10:04'},
  {name: '品質チェックエージェント', status: '最終チェック完了。出力します！', icon: '🛡️', time: '10:05'},
];

const pains = [
  {icon: '◷', text: '時間がかかりすぎて\n続かない...'},
  {icon: '✎', text: '台本や構成を考えるのが\n大変...'},
  {icon: '▧', text: '素材集めや編集が\nめんどう...'},
  {icon: '♪', text: 'ナレーション収録が\nむずかしい...'},
  {icon: '↗', text: 'クオリティにばらつきが\n出てしまう...'},
];

const features = [
  {title: '企画エージェント', body: 'トレンドと目的を分析し、\n最適な構成を自動設計！', char: 'zundamon', visual: 'chart'},
  {title: '台本エージェント', body: '視聴者を引き込む台本を\nわかりやすく自動生成！', char: 'marisa', visual: 'book'},
  {title: '画像エージェント', body: '挿絵・背景・サムネを\nまとめて自動生成！', char: 'zundamon', visual: 'gallery'},
  {title: '音声エージェント', body: '自然なAIナレーションを\n感情豊かに自動生成！', char: 'reimu', visual: 'mic'},
  {title: '動画エージェント', body: 'カット編集・BGM・効果・\nテロップを自動で合成！', char: 'marisa', visual: 'movie'},
  {title: '品質チェックエージェント', body: '誤字脱字・テンポ・音量まで\n自動チェックで安心出力！', char: 'zundamon', visual: 'check'},
];

const steps = [
  {num: '01', title: '指示を入力', body: '作りたい動画の内容を\nテキストで入力します。', char: 'reimu', visual: 'pc'},
  {num: '02', title: 'エージェントが自動実行', body: 'AIが役割分担して、\n制作を自動で進めます。', char: 'group', visual: 'spark'},
  {num: '03', title: '進捗を確認', body: '各工程の進捗を\nリアルタイムで確認。', char: 'none', visual: 'progress'},
  {num: '04', title: '動画を出力', body: '高品質な動画が完成！\nすぐに使えます。', char: 'none', visual: 'player'},
];

const audiences = [
  {title: 'YouTube・TikTokで\n発信したい方', icon: '▶', body: '短時間で継続的に\n動画を投稿したい！'},
  {title: 'ブログ・メディア運営者', icon: 'PC', body: '記事を動画化して\n集客力をアップ！'},
  {title: '企業・店舗の担当者', icon: 'ビル', body: '商品・サービスを\nわかりやすくPR！'},
  {title: '教育・研修コンテンツ\nを作りたい方', icon: '本', body: 'わかりやすい教材を\n効率よく作成！'},
  {title: '個人で副業したい方', icon: '人', body: '時間をかけずに\n収益化を目指したい！'},
];

const reviews = [
  {text: '台本作成から編集まで全部おまかせ！\n本当に助かっています！', user: 'YouTuber / 30代・男性', char: 'reimu'},
  {text: 'クオリティが高くて驚きました。\n作業時間が1/5になりました！', user: 'ブロガー / 40代・女性', char: 'zundamon'},
  {text: 'ナレーションも自然で、\n商用利用にも安心です！', user: '企業マーケ担当 / 30代・男性', char: 'marisa'},
];

const charSrc = {
  reimu: staticFile('characters/reimu/compose_open_close.png'),
  marisa: staticFile('characters/marisa/compose_open_close.png'),
  zundamon: staticFile('characters/zundamon/compose_open_close.png'),
  zundamonFull: staticFile('characters/zundamon/full_body.png'),
};

const Character: React.FC<{type: 'reimu' | 'marisa' | 'zundamon'; className?: string}> = ({type, className}) => (
  <img src={charSrc[type]} className={className ?? ''} alt={type} />
);

const Visual: React.FC<{type: string}> = ({type}) => {
  if (type === 'chart') {
    return (
      <div className="mini-chart">
        <span />
        <span />
        <span />
        <span />
        <b />
      </div>
    );
  }
  if (type === 'book') {
    return <div className="mini-book"><span /><span /></div>;
  }
  if (type === 'gallery') {
    return <div className="mini-gallery"><span>🎨</span><span>🖼️</span><span>✨</span></div>;
  }
  if (type === 'mic') {
    return <div className="mini-mic">🎙️<span /></div>;
  }
  if (type === 'movie') {
    return <div className="mini-movie"><span /><b>▶</b></div>;
  }
  if (type === 'check') {
    return <div className="mini-check">✓<span>✓</span><b>✓</b></div>;
  }
  if (type === 'pc') {
    return <div className="step-pc">⌨</div>;
  }
  if (type === 'spark') {
    return <div className="step-spark">✦</div>;
  }
  if (type === 'progress') {
    return <div className="step-progress"><span /><span /><span /></div>;
  }
  if (type === 'player') {
    return <div className="step-player">▶</div>;
  }
  return null;
};

const LaptopMock: React.FC = () => (
  <div className="lp-laptop">
    <div className="laptop-screen">
      <div className="workspace">
        <div className="workspace-rail">
          <span>制<br />作</span>
          <b>AI</b>
        </div>
        <div className="workspace-main">
          <div className="workspace-title">AIエージェントワークスペース</div>
          <div className="chat-card">
            <strong>あなた</strong>
            <p>「初心者向けに、AIで副業を始める方法」を解説する動画を作って！</p>
            <small>10:00</small>
          </div>
          <div className="agent-panel">
            <h3>エージェントAI</h3>
            {agents.map((agent) => (
              <div className="agent-row" key={agent.name}>
                <span className="agent-icon">{agent.icon}</span>
                <strong>{agent.name}</strong>
                <p>{agent.status}</p>
                <small>{agent.time}</small>
                <em>✓</em>
              </div>
            ))}
          </div>
        </div>
        <div className="workspace-side">
          <h3>進行状況</h3>
          {['企画', '台本', '画像', '音声', '動画', '品質チェック'].map((item) => (
            <div className="side-step" key={item}>
              <span>{item}</span>
              <b>完了</b>
            </div>
          ))}
          <div className="done-chip">動画出力完了！🎉</div>
        </div>
      </div>
    </div>
    <div className="laptop-base"><span /></div>
  </div>
);

export const LP: React.FC = () => {
  return (
    <AbsoluteFill className="lp-page">
      <section className="lp-hero">
        <div className="hero-glow hero-glow-a" />
        <div className="hero-glow hero-glow-b" />
        <div className="star-field" />
        <div className="hero-copy">
          <div className="hero-badge">ゆっくり＆ずんだもんが、あなたの動画制作をまるっとサポート！</div>
          <h1>
            エージェントAI<span>が</span>
            <br />
            役割分担して、
            <br />
            <mark>動画制作</mark>を
            <br />
            <mark>自動</mark>で前に進める。
          </h1>
          <p>企画から動画出力まで、すべてAIにおまかせ！</p>
          <div className="hero-points">
            <div><b>🚀</b><span>最短数分で<br />動画完成</span></div>
            <div><b>👥</b><span>エージェントが<br />自動で役割分担</span></div>
            <div><b>✅</b><span>高品質な動画を<br />安定出力</span></div>
          </div>
        </div>
        <div className="hero-chars">
          <Character type="reimu" className="hero-char hero-reimu" />
          <Character type="marisa" className="hero-char hero-marisa" />
          <img src={charSrc.zundamonFull} className="hero-char hero-zunda" alt="zundamon" />
        </div>
        <LaptopMock />
      </section>

      <section className="top-cta">
        <button className="gold-button">今すぐ無料で始める　»</button>
        <button className="green-button">機能を詳しく見る　›</button>
      </section>

      <section className="pain-section">
        <h2>動画制作で、こんな<span>お悩み</span>はありませんか？</h2>
        <div className="pain-grid">
          {pains.map((pain) => (
            <div className="pain-card" key={pain.text}>
              <b>{pain.icon}</b>
              <p>{pain.text}</p>
            </div>
          ))}
        </div>
        <div className="solution-ribbon">そのお悩み、ゆっくり＆ずんだもん解説AI自動生成アプリが解決します！💡</div>
      </section>

      <section className="features-section">
        <h2 className="lp-heading">すべてを自動化するエージェント機能</h2>
        <div className="feature-grid">
          {features.map((feature) => (
            <div className="feature-card" key={feature.title}>
              <h3><span>✦</span>{feature.title}</h3>
              <p>{feature.body}</p>
              <div className="feature-visual">
                <Visual type={feature.visual} />
                <Character type={feature.char as 'reimu' | 'marisa' | 'zundamon'} className="feature-char" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="steps-section">
        <h2 className="lp-heading">使い方は、とってもカンタン！</h2>
        <div className="steps-grid">
          {steps.map((step, index) => (
            <React.Fragment key={step.num}>
              <div className="step-card">
                <div className="step-num">{step.num}</div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
                <div className="step-visual">
                  <Visual type={step.visual} />
                  {step.char === 'group' && (
                    <div className="step-group">
                      <Character type="zundamon" />
                      <Character type="marisa" />
                      <Character type="reimu" />
                    </div>
                  )}
                  {step.char === 'reimu' && <Character type="reimu" className="step-character" />}
                </div>
              </div>
              {index < steps.length - 1 && <div className="step-arrow">▶</div>}
            </React.Fragment>
          ))}
        </div>
      </section>

      <section className="audience-section">
        <h2>こんな方におすすめ！</h2>
        <div className="audience-grid">
          {audiences.map((audience) => (
            <div className="audience-card" key={audience.title}>
              <h3>{audience.title}</h3>
              <b>{audience.icon}</b>
              <p>{audience.body}</p>
            </div>
          ))}
        </div>
        <div className="review-grid">
          {reviews.map((review) => (
            <div className="review-card" key={review.user}>
              <div className="stars">★★★★★</div>
              <p>{review.text}</p>
              <div>
                <Character type={review.char as 'reimu' | 'marisa' | 'zundamon'} />
                <span>{review.user}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="footer-cta">
        <Character type="reimu" className="footer-reimu" />
        <div className="footer-copy">
          <p>あなたのアイデアを、最高の動画に。</p>
          <h2>今すぐ無料で始めよう！</h2>
          <div className="footer-checks">
            <span>✓ 登録無料</span>
            <span>✓ クレカ登録不要</span>
            <span>✓ すぐに使える</span>
          </div>
          <button className="gold-button">今すぐ無料で始める　»</button>
        </div>
        <div className="footer-chars">
          <Character type="marisa" />
          <Character type="zundamon" />
        </div>
      </section>
    </AbsoluteFill>
  );
};
