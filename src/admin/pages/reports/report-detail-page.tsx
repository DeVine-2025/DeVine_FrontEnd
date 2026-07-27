import ArrowLeftAdminIcon from '@assets/icons/arrow-left-admin.svg?react';
import AdminDemographyIcon from '@assets/icons/admin-demography.svg?react';
import AdminShieldCheckIcon from '@assets/icons/admin-shield-check.svg?react';
import ChevronDownIcon from '@assets/icons/chevron-down.svg?react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@libs/cn';
import { AdminPageTitle } from '../../components/common/admin-page-title';

type ReportInfo = {
  id: string;
  type: string;
  reporter: string;
  reported: string;
  receivedAt: string;
};

type ContentMessage = {
  id: string;
  sentAt: string;
  text: string;
};

const REPORT_INFO: ReportInfo = {
  id: 'R-1042',
  type: '채팅',
  reporter: 'user_12',
  reported: 'user_88',
  receivedAt: '26-07-15 16:02',
};

const CONTENT_MESSAGES: ContentMessage[] = [
  { id: 'm1', sentAt: '2025-06-02 16:01', text: '이 프로젝트 진짜 별로네' },
  { id: 'm2', sentAt: '2025-06-02 16:01', text: '이 프로젝트 진짜 별로네' },
  { id: 'm3', sentAt: '2025-06-02 16:01', text: '이 프로젝트 진짜 별로네' },
];

const STATUS_OPTIONS = ['대기', '검토중', '처리 완료'] as const;
const ACTION_OPTIONS = ['경고', '삭제', '정지', '기각'] as const;

type ActionOption = (typeof ACTION_OPTIONS)[number];

const CARD_CLASS = 'rounded-[10px] border border-[var(--ui-200)] bg-[var(--ui-bg)] p-[24px]';
const SECTION_TITLE_CLASS = 'Headline1 font-semibold text-[var(--ui-1000)]';

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-[16px] border-[var(--ui-200)] border-b px-[16px] py-[13px]">
      <span className="Body1 w-[64px] shrink-0 font-semibold text-[var(--ui-1000)]">{label}</span>
      <span className="Body1 font-normal text-[var(--ui-1000)]">{value}</span>
    </div>
  );
}

export default function ReportDetailPage() {
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>('대기');
  const [selectedAction, setSelectedAction] = useState<ActionOption>('삭제');
  const [reason, setReason] = useState('');

  return (
    <section>
      <Link
        className="Body1 inline-flex cursor-pointer items-center gap-[6px] font-medium text-[1.5rem] text-[var(--ui-700)] no-underline hover:text-[var(--ui-1000)]"
        to="/admin/reports"
      >
        <ArrowLeftAdminIcon
          aria-hidden="true"
          className="[&_path]:!fill-current h-[18px] w-[18px] shrink-0"
        />
        신고 목록으로
      </Link>

      <AdminPageTitle className="mt-[8px]" title="신고 상세/처리" />

      <div className="mt-[28px] grid grid-cols-1 gap-[24px] lg:grid-cols-2">
        <div className="flex flex-col gap-[24px]">
          <div
            className={cn(
              CARD_CLASS,
              'border-[rgba(135,157,255,0.65)]',
            )}
          >
            <h2 className={SECTION_TITLE_CLASS}>신고 정보</h2>

            <div className="mt-[16px] overflow-hidden rounded-[8px] border border-[var(--ui-200)]">
              <div className="grid grid-cols-2">
                <div className="border-[var(--ui-200)] border-r">
                  <InfoCell label="신고 ID" value={REPORT_INFO.id} />
                </div>
                <InfoCell label="유형" value={REPORT_INFO.type} />
                <div className="border-[var(--ui-200)] border-r">
                  <InfoCell label="신고자" value={REPORT_INFO.reporter} />
                </div>
                <InfoCell label="피신고자" value={REPORT_INFO.reported} />
              </div>
              <div className="flex items-center gap-[16px] px-[16px] py-[13px]">
                <span className="Body1 w-[64px] shrink-0 font-semibold text-[var(--ui-1000)]">
                  접수일시
                </span>
                <span className="Body1 font-normal text-[var(--ui-1000)]">
                  {REPORT_INFO.receivedAt}
                </span>
              </div>
            </div>
          </div>

          <div className={CARD_CLASS}>
            <h2 className={SECTION_TITLE_CLASS}>관련 콘텐츠 원문</h2>

            <ul className="mt-[16px] flex flex-col gap-[14px]">
              {CONTENT_MESSAGES.map((message) => (
                <li className="flex items-center gap-[16px]" key={message.id}>
                  <time className="Label1 shrink-0 font-normal text-[var(--ui-1000)]">
                    {message.sentAt}
                  </time>
                  <p className="Label1 flex-1 rounded-[10px] border border-[var(--ui-200)] bg-[var(--ui-50)] px-[16px] py-[8px] font-normal text-[var(--ui-1000)]">
                    {message.text}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className={CARD_CLASS}>
            <h2 className={SECTION_TITLE_CLASS}>피신고자 누적 신고/제제 이력</h2>

            <div className="mt-[16px] grid grid-cols-2 gap-[16px]">
              <div className="flex items-center justify-center gap-[8px] rounded-[10px] border border-[var(--ui-200)] px-[16px] py-[18px]">
                <AdminDemographyIcon aria-hidden="true" className="size-[24px] shrink-0" />
                <span className="Body1 font-semibold text-[var(--ui-1000)]">누적신고</span>
                <span className="Body1 font-normal text-[var(--ui-1000)]">2건</span>
              </div>
              <div className="flex items-center justify-center gap-[8px] rounded-[10px] border border-[var(--ui-200)] px-[16px] py-[18px]">
                <AdminShieldCheckIcon aria-hidden="true" className="size-[24px] shrink-0" />
                <span className="Body1 font-semibold text-[var(--ui-1000)]">최근 제재 없음</span>
              </div>
            </div>
          </div>
        </div>

        <div className={cn(CARD_CLASS, 'flex flex-col')}>
          <h2 className={SECTION_TITLE_CLASS}>처리 상태</h2>

          <div className="relative mt-[16px]">
            <select
              className="Body1 h-[50px] w-full cursor-pointer appearance-none rounded-[5px] border border-[var(--ui-200)] bg-[var(--ui-bg)] pr-[40px] pl-[16px] font-medium text-[var(--ui-800)] outline-none focus:border-[#4e49ff]"
              onChange={(event) => setStatus(event.target.value as (typeof STATUS_OPTIONS)[number])}
              value={status}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDownIcon
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-[16px] h-[8px] w-[14px] -translate-y-1/2 [&_path]:stroke-[var(--ui-400)]"
            />
          </div>

          <h2 className={cn(SECTION_TITLE_CLASS, 'mt-[28px]')}>세부 액션</h2>

          <div className="mt-[16px] flex overflow-hidden rounded-[5px] border border-[var(--ui-200)]">
            {ACTION_OPTIONS.map((action, index) => {
              const isSelected = action === selectedAction;

              return (
                <button
                  className={cn(
                    'Body1 h-[50px] flex-1 cursor-pointer font-medium transition-colors',
                    index > 0 && 'border-[var(--ui-200)] border-l',
                    isSelected
                      ? 'bg-[#4e49ff] text-white'
                      : 'bg-[var(--ui-bg)] text-[var(--ui-800)] hover:bg-[var(--ui-50)]',
                  )}
                  key={action}
                  onClick={() => setSelectedAction(action)}
                  type="button"
                >
                  {action}
                </button>
              );
            })}
          </div>

          <h2 className={cn(SECTION_TITLE_CLASS, 'mt-[28px]')}>처리 사유</h2>

          <textarea
            className="Body1 mt-[16px] h-[243px] w-full resize-none rounded-[5px] border border-[var(--ui-200)] bg-[var(--ui-bg)] px-[16px] py-[14px] font-normal text-[var(--ui-1000)] outline-none placeholder:text-[var(--ui-300)] focus:border-[#4e49ff]"
            onChange={(event) => setReason(event.target.value)}
            placeholder="처리 사유를 입력해주세요."
            value={reason}
          />

          <button
            className="Heading2 mt-[24px] h-[56px] w-full cursor-pointer rounded-[12px] bg-[#4e49ff] font-medium text-white transition-colors hover:bg-[#3e39e8]"
            type="button"
          >
            저장
          </button>
        </div>
      </div>
    </section>
  );
}
