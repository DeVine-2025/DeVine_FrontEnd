import { useRef } from 'react';
import { createRoot } from 'react-dom/client';
import Lottie, { type LottieRefCurrentProps } from 'lottie-react';
import animation from './shared/assets/animation/loading.json';

function Preview() {
  const player = useRef<LottieRefCurrentProps>(null);
  const buttonStyle = { padding: '10px 18px', border: '1px solid #494452', borderRadius: 8, background: '#262330', color: '#fff', cursor: 'pointer' };
  return <main style={{ minHeight: '100vh', background: '#17181c', color: '#f4f2fc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', padding: 24, boxSizing: 'border-box' }}>
    <h1 style={{ fontSize: 24 }}>리포트 생성 애니메이션</h1>
    <p style={{ color: '#b8b2c6' }}>loading.json · 미리보기</p>
    <Lottie lottieRef={player} animationData={animation} loop style={{ width: 'min(560px,90vw)' }}/>
    <div style={{ display: 'flex', gap: 12 }}><button style={buttonStyle} onClick={() => player.current?.play()}>재생</button><button style={buttonStyle} onClick={() => player.current?.pause()}>일시정지</button><button style={buttonStyle} onClick={() => player.current?.goToAndPlay(0, true)}>처음부터</button></div>
  </main>;
}
createRoot(document.getElementById('root')!).render(<Preview/>);
