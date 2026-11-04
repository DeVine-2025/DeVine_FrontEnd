import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { FolderCard } from './FolderCard';
import './prototype.css';
function Preview() {
  const [selected, setSelected] = useState('');
  return <main className="prototype"><div className="prototype-content"><h1>폴더 프로토타입</h1><p>폴더에 마우스를 올려 움직임을 확인해 보세요.</p><FolderCard title="Eternal-FE" description="프로젝트 분석 리포트" tone="dark" onMain={() => setSelected('메인')} onDetail={() => setSelected('상세')} /><p className="prototype-result" role="status">{selected ? selected + ' 리포트 선택됨' : ' '}</p></div></main>;
}
createRoot(document.getElementById('root')!).render(<Preview />);
