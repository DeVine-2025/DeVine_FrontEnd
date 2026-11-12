import { useEffect, useState } from 'react';
import MainDetail from '@components/report/MainDetail';
import { devineReportPreview } from '../devine-report-preview';
const REPORT_PREVIEW_SECTION_COUNT = 5;
export default function ReportPreview() {
  const [previewTab, setPreviewTab] = useState(0);
  const [isPreviewHovered, setIsPreviewHovered] = useState(false);
  const [isPreviewFocused, setIsPreviewFocused] = useState(false);
  useEffect(() => {
    if (
      isPreviewHovered ||
      isPreviewFocused ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return;

    const intervalId = window.setInterval(() => {
      setPreviewTab((currentTab) => (currentTab + 1) % REPORT_PREVIEW_SECTION_COUNT);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [isPreviewHovered, isPreviewFocused]);

  return (
    <section
      aria-labelledby="report-preview-title"
      onMouseEnter={() => setIsPreviewHovered(true)}
      onMouseLeave={() => setIsPreviewHovered(false)}
      onFocusCapture={() => setIsPreviewFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsPreviewFocused(false);
        }
      }}
      className={`relative min-w-0 rounded-[1.8rem] border p-[2.4rem] max-[743px]:p-[1.8rem] ${'border-[rgba(127,133,150,0.2)] bg-[rgba(28,30,35,0.82)]'}`}
    >
      <div className="mb-[2.2rem] flex flex-wrap items-center gap-[1.2rem]">
        <h2 id="report-preview-title" className="text-[2.2rem] font-bold text-card-title">
          리포트 미리보기
        </h2>
        <span className="rounded-full bg-[rgba(180,154,255,0.12)] px-[1.2rem] py-[0.6rem] text-[1.2rem] font-semibold text-[#B49AFF]">
          샘플 리포트
        </span>
      </div>

      <div
        className="pay-preview-progress"
        aria-label={`샘플 리포트 ${previewTab + 1} / ${REPORT_PREVIEW_SECTION_COUNT}`}
      >
        <span>
          {String(previewTab + 1).padStart(2, '0')} /{' '}
          {String(REPORT_PREVIEW_SECTION_COUNT).padStart(2, '0')}
        </span>
        <div className="pay-preview-progress-track" aria-hidden="true">
          <span
            key={`${previewTab}-${isPreviewHovered}-${isPreviewFocused}`}
            className={isPreviewHovered || isPreviewFocused ? 'is-paused' : ''}
          />
        </div>
      </div>
      <div className="pay-report-preview" aria-label="DeVine 샘플 리포트">
        <MainDetail
          data={devineReportPreview}
          preview={{ active: previewTab, onSelect: setPreviewTab }}
        />
      </div>
      <p className="mt-[1.2rem] text-[1.15rem] text-[var(--ui-500)]">
        DeVine을 예시로 구성한 샘플이며, 프로젝트 규모를 포함한 내용은 실제 분석 결과가 아닙니다.
      </p>
    </section>
  );
}
