import type { ReportDetailContent } from '@apis/report/report';
import { useId, useState, type KeyboardEvent, type ReactNode } from 'react';
import { FileText, Layers, Code2, ScanSearch, Compass, ChevronRight, Printer, LayoutList, CalendarDays } from 'lucide-react';
import './report-workspace.css';
import './report-detail-workspace.css';

const sections = [
  { title: '프로젝트 정보', icon: FileText },
  { title: '기능별 구현', icon: Layers },
  { title: '코드 인사이트', icon: Code2 },
  { title: '분석 요약', icon: ScanSearch },
  { title: '향후 제안', icon: Compass },
];
const Empty = () => <p className="rw-empty">제공된 분석 내용이 없습니다.</p>;
const List = ({ items }: { items?: string[] }) => items?.length ? <ul className="report-reading-list">{items.map((text, index) => <li key={index}>{text}</li>)}</ul> : <Empty />;
function Card({ title, icon: Icon = FileText, children }: { title: string; icon?: typeof FileText; children: ReactNode }) {
  return <section className="rd-card"><h3><Icon aria-hidden="true" />{title}</h3>{children}</section>;
}
function Files({ items }: { items?: string[] }) {
  return items?.length ? <div className="rd-files">{items.map((file, index) => <code key={index}><FileText size={14} aria-hidden="true" />{file}</code>)}</div> : <Empty />;
}

export default function ReportDetail({ data, onPrint, repoUrl }: { data: ReportDetailContent; onPrint?: () => void; repoUrl?: string }) {
  const [active, setActive] = useState(0);
  const id = useId();
  const overview = data.projectOverview;
  const scale = overview?.projectScale;
  let repoName = '';
  try { repoName = repoUrl ? new URL(repoUrl).pathname.split('/').filter(Boolean).pop() || '' : ''; } catch { /* Use report title. */ }
  const projectName = repoName || data.reportTitle || '프로젝트';
  const select = (index: number) => { setActive(index); window.scrollTo({ top: 0, behavior: 'auto' }); };
  const onKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % sections.length;
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index + sections.length - 1) % sections.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = sections.length - 1;
    else return;
    event.preventDefault(); select(next); document.getElementById(`${id}-tab-${next}`)?.focus();
  };
  const contents = [
    <div className="rd-cards">
      <Card title="프로젝트 목적" icon={Compass}>{overview?.purpose ? <p>{overview.purpose}</p> : <Empty />}</Card>
      <Card title="핵심 기술 스택" icon={Layers}>{overview?.techStack?.length ? <dl className="rd-stack-table">{overview.techStack.map((item: { title: string; content: string }, index: number) => <div key={index}><dt>{item.title}</dt><dd>{item.content}</dd></div>)}</dl> : <Empty />}</Card>
      <Card title="프로젝트 규모" icon={Code2}><dl className="rd-metrics">{[
        { label: '코드 라인', value: scale?.totalCodeLines != null ? `${scale.totalCodeLines.toLocaleString('ko-KR')}줄` : '정보 없음', icon: Code2 },
        { label: '작업 파일', value: scale?.mainCodeFiles != null ? `${scale.mainCodeFiles.toLocaleString('ko-KR')}개+` : '정보 없음', icon: FileText },
        { label: '개발 기간', value: scale?.developmentPeriod || '정보 없음', icon: CalendarDays },
      ].map(({ label, value, icon: Icon }) => <div key={label}><Icon aria-hidden="true"/><div><dt>{label}</dt><dd>{value}</dd></div></div>)}</dl></Card>
      <Card title="아키텍처" icon={Layers}>{scale?.architecturePattern ? <p>{scale.architecturePattern}</p> : <Empty />}</Card>
    </div>,
    <div className="rd-cards">{data.implementedFeatures?.length ? data.implementedFeatures.map((category, index) => <Card key={index} title={`${category.categoryNumber ?? index + 1}. ${category.category}`} icon={Layers}>{category.features?.map((feature: { name: string; details?: string[]; codeLocation?: string[]; implementation?: string[] }, featureIndex: number) => <article className="rd-feature" key={featureIndex}><h4>{feature.name}</h4><h5>구현 내용</h5><List items={feature.details}/><h5>코드 위치</h5><Files items={feature.codeLocation}/><h5>구현 방식</h5><List items={feature.implementation}/></article>)}</Card>) : <Empty />}</div>,
    <div className="rd-cards">{data.codeInsights?.length ? data.codeInsights.map((item, index) => <Card key={index} title={`${item.number ?? index + 1}. ${item.title}`} icon={Code2}><List items={item.points}/>{item.codeLocation?.length > 0 && <><h4 className="rd-subheading">관련 코드</h4><Files items={item.codeLocation}/></>}</Card>) : <Empty />}</div>,
    <div className="rd-summary-grid"><Card title="구현한 것" icon={ScanSearch}><List items={data.projectSummary?.implemented}/></Card><Card title="구현하지 않은 것" icon={FileText}><List items={data.projectSummary?.notImplemented}/></Card></div>,
    <div className="rd-cards"><h3 className="rd-group-title">개선 가능한 영역</h3>{data.improvements?.length ? data.improvements.map((item, index) => <Card key={index} title={`${item.number ?? index + 1}. ${item.title}`} icon={Compass}>{item.keywords && <p className="rd-keyword">{item.keywords}</p>}<h4 className="rd-subheading">현재 상태</h4><List items={item.currentState}/><h4 className="rd-subheading">개선 제안</h4><List items={item.suggestions}/></Card>) : <Empty />}<h3 className="rd-group-title">다음 프로젝트에서 시도할 것</h3>{data.nextSteps?.length ? data.nextSteps.map((item, index) => <Card key={index} title={`${item.number ?? index + 1}. ${item.title}`} icon={Layers}><List items={item.description}/><div className="report-stack">{item.recommendKeyword?.map((keyword, i) => <span key={i}>{keyword}</span>)}</div></Card>) : <Empty />}</div>,
  ];
  return <div className="report-workspace report-redesign report-detail-workspace">
    <aside className="rw-sidebar"><div className="rw-project"><FileText aria-hidden="true"/><div><strong title={projectName}>{projectName}</strong><span>상세 분석 리포트</span></div></div>
      <div className="rw-tablist" role="tablist" aria-label="상세 리포트 목차" aria-orientation="vertical">{sections.map(({ title, icon: Icon }, index) => <button key={title} type="button" role="tab" id={`${id}-tab-${index}`} aria-controls={`${id}-panel-${index}`} aria-selected={active === index} tabIndex={active === index || (active === -1 && index === 0) ? 0 : -1} onClick={() => select(index)} onKeyDown={event => onKey(event, index)}><Icon aria-hidden="true"/><span>{title}</span>{active === index && <ChevronRight className="rw-chevron" aria-hidden="true"/>}</button>)}</div>
      <div className="rw-sidebar-actions"><button type="button" className="rw-sidebar-action" aria-pressed={active === -1} aria-controls={`${id}-all-content`} onClick={() => select(-1)}><LayoutList aria-hidden="true"/>전체 리포트 보기</button>{onPrint && <button type="button" className="rw-sidebar-action" onClick={onPrint}><Printer aria-hidden="true"/>PDF로 출력하기</button>}</div><p className="rw-disclaimer">분석 결과는 제공된 코드를 바탕으로 작성되었습니다. 실제 구현과 함께 확인해 주세요.</p>
    </aside>
    <div id={`${id}-all-content`} className={`rw-content ${active === -1 ? 'report-all-view' : ''}`} key={active} role={active === -1 ? 'region' : undefined} aria-label={active === -1 ? '상세 전체 리포트' : undefined}>
      {active === -1 && <header className="rd-all-header"><div className="report-panel-kicker">DETAIL REPORT / ALL</div><h1>{projectName} 상세 전체 리포트</h1><p>프로젝트 정보부터 향후 제안까지 모든 상세 분석을 이어서 확인하세요.</p><nav aria-label="전체 리포트 바로가기">{sections.map(({ title }, index) => <a key={title} href={`#${id}-panel-${index}`}>{String(index + 1).padStart(2, '0')} {title}</a>)}</nav></header>}
      {sections.map(({ title }, index) => <section key={title} className="rw-panel report-section-panel" id={`${id}-panel-${index}`} role={active === -1 ? undefined : 'tabpanel'} aria-labelledby={`${id}-tab-${index}`} tabIndex={0} hidden={active !== -1 && active !== index}><header><div className="rw-breadcrumb"><span>리포트</span><ChevronRight aria-hidden="true"/><span>{projectName}</span><ChevronRight aria-hidden="true"/><span>상세 리포트</span><ChevronRight aria-hidden="true"/><span>{title}</span></div><div className="report-panel-kicker">DETAIL REPORT / {String(index + 1).padStart(2, '0')}</div><h2>{title}</h2></header><div className="rw-section-body">{contents[index]}</div></section>)}</div>
  </div>;
}
