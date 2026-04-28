import React from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame, spring, interpolate, useVideoConfig} from 'remotion';
import './LP.css';

export const LP: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Animations
  const spr = (delay: number) => spring({frame: frame - delay, fps, config: {damping: 12}});
  
  const agents = [
    {name: '企画エージェント', status: 'ターゲットと構成を定義しました。', icon: '📁', time: '10:00'},
    {name: '台本エージェント', status: '台本を作成しました（約2,800文字）。', icon: '✍️', time: '10:01'},
    {name: '画像エージェント', status: 'サムネ・挿絵・背景を生成中...', icon: '🎨', time: '10:02'},
    {name: '音声エージェント', status: 'ナレーションを生成中...', icon: '🎤', time: '10:03'},
    {name: '動画エージェント', status: 'カット編集・BGM・テロップを合成中...', icon: '🎞️', time: '10:04'},
    {name: '品質チェックエージェント', status: '最終チェック完了。出力します！', icon: '🛡️', time: '10:05'},
  ];

  return (
    <div className="lp-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content" style={{opacity: spr(0), transform: `translateY(${interpolate(spr(0), [0, 1], [50, 0])}px)`}}>
          <div className="hero-badge">ゆっくり & ずんだもんが、あなたの動画制作をまるっとサポート！</div>
          <h1 className="hero-title">
            エージェントAI<span className="hero-title-suffix">が</span>
            <br />
            役割分担して、
            <br />
            動画制作を
            <br />
            <span className="hero-highlight">自動で前に進める。</span>
          </h1>
          <p className="hero-subtitle">企画から動画出力まで、すべてAIにおまかせ！</p>
          
          <div className="hero-features">
            {[
              {icon: '🚀', text: '最短数分で\n動画完成'},
              {icon: '👥', text: 'エージェントが\n自動で役割分担'},
              {icon: '✅', text: '高品質な動画を\n安定出力'}
            ].map((f, i) => (
              <div key={i} className="hero-feature" style={{opacity: spr(10 + i * 5), transform: `scale(${spr(10 + i * 5)})`}}>
                <div className="hero-feature-icon">{f.icon}</div>
                <div className="hero-feature-text">{f.text}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-characters">
          <img src={staticFile('characters/reimu/compose_open_close.png')} className="char char-reimu" style={{transform: `translateX(${interpolate(spr(20), [0, 1], [200, 0])}px)`, opacity: spr(20)}} alt="Reimu" />
          <img src={staticFile('characters/marisa/compose_open_close.png')} className="char char-marisa" style={{transform: `translateX(${interpolate(spr(25), [0, 1], [200, 0])}px)`, opacity: spr(25)}} alt="Marisa" />
          <img src={staticFile('characters/zundamon/full_body.png')} className="char char-zundamon" style={{transform: `translateX(${interpolate(spr(15), [0, 1], [200, 0])}px)`, opacity: spr(15)}} alt="Zundamon" />
        </div>
      </section>

      {/* Product Mockup */}
      <section className="product-mockup">
        <div className="laptop-frame" style={{transform: `scale(${interpolate(spr(30), [0, 1], [0.8, 1])})`, opacity: spr(30)}}>
          <div className="workspace-ui">
            <div className="workspace-header">
              <div className="workspace-title">AIエージェントワークスペース</div>
            </div>
            <div className="workspace-content">
              <div className="workspace-main">
                <div className="chat-item user" style={{opacity: spr(40), transform: `translateX(${interpolate(spr(40), [0, 1], [-20, 0])}px)`}}>
                  <div className="avatar">👤</div>
                  <div className="chat-bubble">
                    「初心者向けに、AIで副業を始める方法」を解説する動画を作って！
                  </div>
                </div>
                <div className="agent-list">
                  {agents.map((agent, i) => (
                    <div key={i} className="agent-item" style={{opacity: spr(50 + i * 15), transform: `translateY(${interpolate(spr(50 + i * 15), [0, 1], [20, 0])}px)`}}>
                      <div className="agent-avatar">{agent.icon}</div>
                      <div className="agent-info">
                        <span className="agent-name">{agent.name}</span>
                        <span className="agent-status">{agent.status}</span>
                      </div>
                      <div className="agent-time">{agent.time} {frame > (50 + i * 15 + 10) ? '✓' : ''}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="workspace-sidebar">
                <div className="progress-section">
                  <div className="progress-title">進行状況</div>
                  <div className="progress-steps">
                    {['企画', '台本', '画像', '音声', '動画', '品質チェック'].map((step, i) => {
                      const isDone = frame > (50 + i * 15 + 20);
                      return (
                        <div key={i} className={`p-step ${isDone ? 'completed' : ''}`}>
                          {step} <span style={{opacity: isDone ? 1 : 0.3}}>{isDone ? '完了' : '待機中'}</span>
                        </div>
                      );
                    })}
                  </div>
                  <button className="output-button" style={{opacity: spr(150), transform: `scale(${spr(150)})`}}>動画出力完了！ 🎉</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Buttons */}
      <section className="cta-buttons">
        <button className="btn btn-primary">今すぐ無料で始める »</button>
        <button className="btn btn-secondary">機能を詳しく見る ＞</button>
      </section>

      {/* Problem Section */}
      <section className="problems">
        <h2 className="section-title">動画制作で、こんなお悩みはありませんか？</h2>
        <div className="problem-grid">
          <div className="problem-card">
            <div className="problem-icon">🕒</div>
            <div className="problem-text">時間がかかりすぎて<br />続かない...</div>
          </div>
          <div className="problem-card">
            <div className="problem-icon">📝</div>
            <div className="problem-text">台本や構成を考えるのが<br />大変...</div>
          </div>
          <div className="problem-card">
            <div className="problem-icon">🖼️</div>
            <div className="problem-text">素材集めや編集が<br />めんどう...</div>
          </div>
          <div className="problem-card">
            <div className="problem-icon">🎤</div>
            <div className="problem-text">ナレーション収録が<br />むずかしい...</div>
          </div>
          <div className="problem-card">
            <div className="problem-icon">📈</div>
            <div className="problem-text">クオリティにばらつきが<br />出てしまう...</div>
          </div>
        </div>
        <div className="solution-banner">
          そのお悩み、ゆっくり＆ずんだもん解説AI自動生成アプリが解決します！ 💡
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2 className="section-title">✨ すべてを自動化するエージェント機能 ✨</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-card-header">
              <span className="feature-card-title">企画エージェント</span>
              <p>トレンドと目的を分析し、最適な構成を自動設計！</p>
            </div>
            <div className="feature-card-image">
              <img src={staticFile('characters/zundamon/compose_open_close.png')} alt="Zundamon" />
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-card-header">
              <span className="feature-card-title">台本エージェント</span>
              <p>視聴者を引き込む台本をわかりやすく自動生成！</p>
            </div>
            <div className="feature-card-image">
              <img src={staticFile('characters/marisa/compose_open_close.png')} alt="Marisa" />
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-card-header">
              <span className="feature-card-title">画像エージェント</span>
              <p>挿絵・背景・サムネをまとめて自動生成！</p>
            </div>
            <div className="feature-card-image">
               <img src={staticFile('characters/zundamon/compose_open_close.png')} alt="Zundamon" />
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-card-header">
              <span className="feature-card-title">音声エージェント</span>
              <p>自然なAIナレーションを感情豊かに自動生成！</p>
            </div>
            <div className="feature-card-image">
              <img src={staticFile('characters/reimu/compose_open_close.png')} alt="Reimu" />
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-card-header">
              <span className="feature-card-title">動画エージェント</span>
              <p>カット編集・BGM・効果・テロップを自動で合成！</p>
            </div>
            <div className="feature-card-image">
              <img src={staticFile('characters/marisa/compose_open_close.png')} alt="Marisa" />
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-card-header">
              <span className="feature-card-title">品質チェックエージェント</span>
              <p>誤字脱字・テンポ・音量まで自動チェックで安心出力！</p>
            </div>
            <div className="feature-card-image">
              <img src={staticFile('characters/zundamon/compose_open_close.png')} alt="Zundamon" />
            </div>
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section className="how-to-use">
        <h2 className="section-title">✨ 使い方は、とってもカンタン！ ✨</h2>
        <div className="steps">
          <div className="step">
            <div className="step-num">01</div>
            <div className="step-title">指示を入力</div>
            <p>作りたい動画の内容をテキストで入力します。</p>
            <div className="step-img">
              <img src={staticFile('characters/reimu/compose_open_close.png')} alt="Step 1" />
            </div>
          </div>
          <div className="step">
            <div className="step-num">02</div>
            <div className="step-title">エージェントが自動実行</div>
            <p>AIが役割分担して、制作を自動で進めます。</p>
            <div className="step-img">
              <img src={staticFile('characters/marisa/compose_open_close.png')} alt="Step 2" />
            </div>
          </div>
          <div className="step">
            <div className="step-num">03</div>
            <div className="step-title">進捗を確認</div>
            <p>各工程の進捗をリアルタイムで確認。</p>
            <div className="step-img">
              <img src={staticFile('characters/reimu/compose_open_close.png')} alt="Step 3" />
            </div>
          </div>
          <div className="step">
            <div className="step-num">04</div>
            <div className="step-title">動画を出力</div>
            <p>高品質な動画が完成！すぐに使えます。</p>
            <div className="step-img">
              <img src={staticFile('characters/zundamon/compose_open_close.png')} alt="Step 4" />
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="target-audience">
        <h2 className="section-title">こんな方におすすめ！</h2>
        <div className="audience-grid">
          <div className="audience-card">
            <div className="audience-card-title">YouTube・TikTokで発信したい方</div>
            <div className="audience-icon">🎬</div>
            <p>短時間で継続的に動画を投稿したい！</p>
          </div>
          <div className="audience-card">
            <div className="audience-card-title">ブログ・メディア運営者</div>
            <div className="audience-icon">💻</div>
            <p>記事を動画化して集客力をアップ！</p>
          </div>
          <div className="audience-card">
            <div className="audience-card-title">企業・店舗の担当者</div>
            <div className="audience-icon">🏢</div>
            <p>商品・サービスをわかりやすくPR！</p>
          </div>
          <div className="audience-card">
            <div className="audience-card-title">教育・研修コンテンツを作りたい方</div>
            <div className="audience-icon">📚</div>
            <p>わかりやすい教材を効率よく作成！</p>
          </div>
          <div className="audience-card">
            <div className="audience-card-title">個人で副業したい方</div>
            <div className="audience-icon">💰</div>
            <p>時間をかけずに収益化を目指したい！</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="testimonial-card">
          <div className="stars">★★★★★</div>
          <p>台本作成から編集まで全部おまかせ！本当に助かっています！</p>
          <div className="user-info">
            <img src={staticFile('characters/reimu/compose_open_close.png')} className="user-avatar" alt="User" />
            <span>YouTuber / 30代・男性</span>
          </div>
        </div>
        <div className="testimonial-card">
          <div className="stars">★★★★★</div>
          <p>クオリティが高くて驚きました。作業時間が1/5になりました！</p>
          <div className="user-info">
            <img src={staticFile('characters/zundamon/compose_open_close.png')} className="user-avatar" alt="User" />
            <span>ブロガー / 40代・女性</span>
          </div>
        </div>
        <div className="testimonial-card">
          <div className="stars">★★★★★</div>
          <p>ナレーションも自然で、商用利用にも安心です！</p>
          <div className="user-info">
            <img src={staticFile('characters/marisa/compose_open_close.png')} className="user-avatar" alt="User" />
            <span>企業マーケ担当 / 30代・男性</span>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="footer-cta">
        <h2 className="footer-cta-title">あなたのアイデアを、最高の動画に。</h2>
        <h3 className="footer-cta-main">今すぐ無料で始めよう！</h3>
        <div className="footer-checks">
          <div className="check-item">✅ 登録無料</div>
          <div className="check-item">✅ クレカ登録不要</div>
          <div className="check-item">✅ すぐに使える</div>
        </div>
        <button className="btn btn-primary footer-btn">今すぐ無料で始める »</button>
      </section>
    </div>
  );
};
