import ReloadIcon from '@assets/icons/reload.svg?react';
import { useState } from 'react';
import { AdminDateTimePicker } from '../../components/common/admin-date-time-picker';
import { AdminHighlightCard } from '../../components/common/admin-highlight-card';
import { AdminPageTitle } from '../../components/common/admin-page-title';

const INTEGRATIONS = [
  { name: 'Github API', status: '정상', checkedAt: '07-09 15:20', tone: 'positive' },
  { name: '결제(PG) API', status: '정상', checkedAt: '07-09 15:20', tone: 'positive' },
  { name: '이메일 발송', status: '지연', checkedAt: '07-09 15:20', tone: 'negative' },
  { name: 'Github OAuth', status: '확인불가', checkedAt: '07-09 15:20', tone: 'neutral' },
] as const;

const STATUS_STYLE = {
  positive: 'bg-[var(--positive-bg)] text-[var(--positive-text)]',
  negative: 'bg-[var(--negative-bg)] text-[var(--negative-text)]',
  neutral: 'bg-[var(--ui-50)] text-[var(--ui-400)]',
} as const;

export default function SystemSettingPage() {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [scheduledAt, setScheduledAt] = useState(() => new Date(2026, 6, 21, 21, 0));

  const handleRefresh = () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    window.setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <section>
      <AdminPageTitle title="시스템 설정" />

      <div className="mt-[40px] grid grid-cols-1 items-start gap-[20px] lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <AdminHighlightCard className="overflow-hidden px-[24px] py-[26px]">
          <div className="flex-items-center justify-between gap-[16px]">
            <h2 className="Heading1 font-semibold text-[var(--ui-1000)]">
              외부 연동 상태 모니터링
            </h2>
            <button
              aria-label="외부 연동 상태 새로고침"
              aria-busy={isRefreshing}
              className="admin-reload-button h-[40px] w-[40px] flex-row-center shrink-0 cursor-pointer rounded-[8px] bg-transparent text-[var(--ui-700)] transition-colors hover:bg-[var(--ui-50)] disabled:cursor-wait"
              disabled={isRefreshing}
              onClick={handleRefresh}
              type="button"
            >
              <ReloadIcon
                aria-hidden="true"
                className={`h-[20px] w-[20px] ${
                  isRefreshing ? '[animation:spin_0.8s_linear_infinite]' : ''
                } [&_path]:fill-current`}
              />
            </button>
          </div>

          <div className="mt-[24px] overflow-x-auto">
            <div className="min-w-[500px]">
              <div className="grid grid-cols-[minmax(150px,1fr)_100px_140px] gap-[16px] pb-[13px]">
                <span className="Caption1 font-semibold text-[var(--ui-500)]">연동명</span>
                <span className="Caption1 font-semibold text-[var(--ui-500)]">상태</span>
                <span className="Caption1 font-semibold text-[var(--ui-500)]">최근 확인 시각</span>
              </div>

              {INTEGRATIONS.map((integration) => (
                <div
                  className="grid grid-cols-[minmax(150px,1fr)_100px_140px] items-center gap-[16px] border-[var(--ui-200)] border-t py-[14px]"
                  key={integration.name}
                >
                  <span className="Body1 font-medium text-[var(--ui-800)]">{integration.name}</span>
                  <span
                    className={`Caption1 w-fit rounded-[8px] px-[10px] py-[4px] font-semibold ${STATUS_STYLE[integration.tone]}`}
                  >
                    {integration.status}
                  </span>
                  <time className="Label1 font-medium text-[var(--ui-1000)]">
                    {integration.checkedAt}
                  </time>
                </div>
              ))}
            </div>
          </div>
        </AdminHighlightCard>

        <form
          className="rounded-[10px] border border-[var(--ui-200)] bg-[var(--ui-bg)] px-[24px] py-[26px]"
          onSubmit={(event) => event.preventDefault()}
        >
          <h2 className="Heading1 font-semibold text-[var(--ui-1000)]">점검 모드 설정</h2>

          <div className="mt-[24px] flex-items-center justify-between">
            <span className="Body1 font-medium text-[var(--ui-800)]">점검 모드</span>
            <div className="flex-items-center gap-[12px]">
              <button
                aria-checked={isMaintenanceMode}
                aria-label="점검 모드 전환"
                className={`relative h-[26px] w-[46px] cursor-pointer rounded-full ${
                  isMaintenanceMode ? 'bg-[#4e49ff]' : 'bg-[var(--ui-200)]'
                }`}
                onClick={() => setIsMaintenanceMode((current) => !current)}
                role="switch"
                type="button"
              >
                <span
                  className={`absolute top-[3px] h-[20px] w-[20px] rounded-full bg-white shadow-sm transition-[left] ${
                    isMaintenanceMode ? 'left-[23px]' : 'left-[3px]'
                  }`}
                />
              </button>
              <strong className="Body1 w-[28px] font-semibold text-[var(--ui-400)]">
                {isMaintenanceMode ? 'ON' : 'OFF'}
              </strong>
            </div>
          </div>

          <label className="mt-[28px] block">
            <span className="Body1 font-medium text-[var(--ui-800)]">점검 안내 메시지</span>
            <textarea
              className="Body1 mt-[12px] h-[240px] w-full resize-none rounded-[8px] border border-[var(--ui-200)] bg-[var(--ui-bg)] px-[16px] py-[14px] text-[var(--ui-800)] outline-none placeholder:text-[var(--ui-300)] focus:border-[#4e49ff]"
              placeholder="점검 사유를 입력해주세요."
            />
          </label>

          <div className="mt-[24px]">
            <span className="Body1 font-medium text-[var(--ui-800)]">예상 종료 시각(선택)</span>
            <div className="mt-[12px]">
              <AdminDateTimePicker onChange={setScheduledAt} value={scheduledAt} />
            </div>
          </div>

          <button
            className="Headline1 mt-[36px] h-[54px] w-full cursor-pointer rounded-[12px] bg-[#4e49ff] font-semibold text-white transition-colors hover:bg-[#3e39e8]"
            type="submit"
          >
            점검 모드 적용
          </button>
        </form>
      </div>
    </section>
  );
}
