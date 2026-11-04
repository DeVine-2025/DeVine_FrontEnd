import type { ReportMainContent } from '@apis/report/report';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { FileText, Code2, Layers, ScanSearch, Compass, ChevronRight, ArrowRight, ExternalLink, Printer, CalendarDays, LayoutList } from 'lucide-react';
import Github from '@assets/icons/github.svg?react';
import './report-workspace.css';

const sections = [
  { title: '프로젝트 개요', description: '프로젝트의 목적과 규모를 살펴봅니다.', icon: FileText },
  { title: '기술 및 역량', description: '사용한 기술과 프로젝트에서 확인된 역량입니다.', icon: Code2 },
  { title: '핵심 구현 사례', description: '실제 구현 내용과 각 경험에서 확인된 역량을 살펴봅니다.', icon: Layers },
  { title: 'AI 종합 평가', description: '프로젝트 분석을 통해 정리된 평가입니다.', icon: ScanSearch },
  { title: '추천 프로젝트', description: '분석된 경험을 활용할 수 있는 프로젝트 분야입니다.', icon: Compass },
];
const Empty = () => <p className="rw-empty">제공된 분석 내용이 없습니다.</p>;
const TextList = ({ items }: { items?: string[] }) => items?.length ? <ul className="report-reading-list">{items.map((text, i) => <li key={i}>{text}</li>)}</ul> : <Empty />;

type ScaleMetric = { label: string; value: string };
function getScaleMetrics(primary?: string, secondary?: string) {
  const metrics = new Map<string, ScaleMetric>();
  const extras: string[] = [];
  for (const source of [primary, secondary]) {
    if (!source?.trim()) continue;
    for (const raw of source.split(/\s*[|·]\s*/)) {
      const part = raw.trim();
      if (!part) continue;
      const lines = part.match(/([\d,]+)\s*줄/);
      const files = part.match(/([\d,]+)\s*개?\s*파일|파일\s*(?:수)?\s*[:：]?\s*([\d,]+)\s*개?/);
      const duration = part.match(/(?:약\s*)?\d+(?:\s*[~～-]\s*\d+)?\s*(?:시간|일|주일|주|개월|달|년)(?:\s*(?:미만|이내|이상|정도))?/);
      const matched: ScaleMetric[] = [];
      if (lines) matched.push({ label: '코드 라인', value: lines[1] + '줄' });
      if (files) matched.push({ label: '파일 수', value: (files[1] || files[2]) + '개' });
      if (duration) matched.push({ label: '개발 기간', value: duration[0] });
      for (const item of matched) if (!metrics.has(item.label)) metrics.set(item.label, item);
      if (!matched.length && !extras.includes(part)) extras.push(part);
    }
  }
  return { metrics: [...metrics.values()], extras };
}

export default function MainDetail({ data, onPrint, repoUrl, preview }: { data: ReportMainContent; onPrint?: () => void; repoUrl?: string; preview?: { active: number; onSelect: (index: number) => void } }) {
  const [internalActive, setActive] = useState(0);
  const active = preview?.active ?? internalActive;
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => { if (preview) panel.current?.scrollTo({ top: 0 }); }, [preview?.active]);
  const select = (index: number) => { if (preview) preview.onSelect(index); else { setActive(index); panel.current?.scrollTo({ top: 0 }); window.scrollTo({ top: 0, behavior: 'auto' }); } };
  const onKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % sections.length;
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index + sections.length - 1) % sections.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = sections.length - 1;
    else return;
    event.preventDefault(); select(next); document.getElementById(`${id}-tab-${next}`)?.focus();
  };
  const projectName = data?.projectInfo?.projectName || '프로젝트';
  const { metrics, extras } = getScaleMetrics(data?.projectInfo?.scale, data?.overview?.scale);
  const validRepo = repoUrl && /^https:\/\/github\.com\//i.test(repoUrl);
  const contents = [
    <div className="report-overview"><div className="report-project-title"><h2>{projectName.split('/').pop()}</h2>{validRepo && <a href={repoUrl} target="_blank" rel="noopener noreferrer" aria-label="GitHub 저장소 열기"><ExternalLink aria-hidden="true" /></a>}</div><div className="report-overview-summary">{data?.overview?.summary ? <p>{data.overview.summary}</p> : <Empty />}</div><section className="report-overview-scale"><h3><Layers aria-hidden="true" />프로젝트 규모</h3>{metrics.length > 0 && <dl className="report-scale-metrics">{metrics.map(item => { const Icon = item.label === '코드 라인' ? Code2 : item.label === '파일 수' ? FileText : CalendarDays; return <div key={item.label}><span className="report-scale-icon"><Icon aria-hidden="true" /></span><div className="report-scale-copy"><dt>{item.label}</dt><dd>{item.value}</dd></div></div>; })}</dl>}{extras.map((text, i) => <p className="report-scale-extra" key={i}>{text}</p>)}{!metrics.length && !extras.length && <Empty />}</section>{active !== -1 && <div className="report-overview-nav"><span>01 / 05</span><button type="button" onClick={() => select(1)}>다음: 기술 및 역량 <ArrowRight aria-hidden="true" /></button></div>}</div>,
    <div className="report-technical"><section className="report-feature"><span>주요 기술</span>{data?.overview?.mainTech ? <p>{data.overview.mainTech}</p> : <Empty />}</section><section className="report-section"><div className="report-section-heading"><div><h3>기술 스택</h3><p>프로젝트에 사용된 기술</p></div></div>{data?.projectInfo?.techStack?.length ? <div className="report-stack">{data.projectInfo.techStack.map((tech, i) => <span key={i}>{tech}</span>)}</div> : <Empty />}</section><section className="report-section"><h3>확인된 역량</h3><TextList items={data?.overview?.capabilities} /></section></div>,
    <div className="report-cases">{data?.keyImplementations?.length ? data.keyImplementations.map((item, i) => <article key={i} className="report-case" id={`${id}-case-${i}`}><div className="report-case-index">{String(i + 1).padStart(2, '0')} <span>IMPLEMENTATION</span></div><h3>{item.title}</h3><p className="report-case-description">{item.description}</p><div className="report-case-capabilities"><h4>이 경험으로 할 수 있는 것</h4><TextList items={item.capabilities} /></div></article>) : <Empty />}</div>,
    <div className="report-evaluation"><div className="report-evaluation-note"><ScanSearch aria-hidden="true"/><p>제공된 프로젝트 분석을 바탕으로 한 AI 평가입니다.</p></div>{data?.aiEvaluation?.length ? data.aiEvaluation.map((item, i) => <article key={i} className="report-evaluation-row"><div><span>{String(i + 1).padStart(2, '0')}</span><h3>{item.title}</h3></div><TextList items={item.details} /></article>) : <Empty />}</div>,
    <div className="report-recommendations">{data?.recommendations?.length ? data.recommendations.map((text, i) => <div key={i}><span>{String(i + 1).padStart(2, '0')}</span><p>{text}</p><ArrowRight aria-hidden="true" /></div>) : <Empty />}</div>,
  ];
  return <div className="report-workspace report-redesign">
    <aside className="rw-sidebar"><div className="rw-project"><Github aria-hidden="true"/><div><strong title={projectName}>{projectName.split('/').pop()}</strong>{projectName.includes('/') && <span className="report-repo-path" title={projectName}>{projectName}</span>}<span>프로젝트 분석 리포트</span></div></div>
      <div className="rw-tablist" role="tablist" aria-label="리포트 목차" aria-orientation="vertical">{sections.map(({ title, icon: Icon }, i) => <button key={title} type="button" role="tab" id={`${id}-tab-${i}`} aria-controls={`${id}-panel-${i}`} aria-selected={active === i} tabIndex={active === i || (active === -1 && i === 0) ? 0 : -1} onClick={() => select(i)} onKeyDown={e => onKey(e, i)}><Icon aria-hidden="true"/><span>{title}</span>{active === i && <ChevronRight className="rw-chevron" aria-hidden="true"/>}</button>)}</div>
      {!preview && <><div className="rw-sidebar-actions"><button type="button" className="rw-sidebar-action" aria-pressed={active === -1} aria-controls={`${id}-all-panel`} onClick={() => select(-1)}><LayoutList aria-hidden="true" />전체 리포트 보기</button>{onPrint && <button type="button" className="rw-sidebar-action" onClick={onPrint}><Printer aria-hidden="true" />PDF로 출력하기</button>}</div><p className="rw-disclaimer">분석 결과는 제공된 코드를 바탕으로 작성되었습니다. 실제 구현과 함께 확인해 주세요.</p></>}
    </aside>
    <div className={`rw-content ${active === -1 ? 'report-all-view' : ''}`} ref={panel}><div id={`${id}-all-panel`} role={active === -1 ? "region" : undefined} aria-label={active === -1 ? "전체 리포트" : undefined}>{sections.map(({ title, description }, i) => <section key={title} className="rw-panel report-section-panel" id={`${id}-panel-${i}`} role={active === -1 ? undefined : "tabpanel"} aria-labelledby={active === -1 ? undefined : `${id}-tab-${i}`} tabIndex={active === -1 ? undefined : 0} hidden={active !== -1 && active !== i}><header><div className="rw-breadcrumb"><span>리포트</span><ChevronRight aria-hidden="true"/><span>{projectName}</span><ChevronRight aria-hidden="true"/><span>{title}</span></div><><div className="report-panel-kicker">PROJECT REPORT <span>/ {String(i + 1).padStart(2, '0')}</span></div><h2>{title}</h2><p>{description}</p></></header><div className="rw-section-body">{contents[i]}</div>{active !== -1 && i > 0 && i < sections.length - 1 && <div className="report-page-next"><button type="button" onClick={() => select(i + 1)}>다음: {sections[i + 1].title} <ArrowRight aria-hidden="true" /></button></div>}</section>)}</div></div>
  </div>;
}
