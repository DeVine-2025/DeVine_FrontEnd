import ReloadIcon from '@assets/icons/reload.svg?react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import {
  ADMIN_INTEGRATION_HEALTH_QUERY_KEY,
  getIntegrationHealth,
  type IntegrationStatus,
  refreshIntegrationHealth,
} from '../../apis/integration';
import {
  ADMIN_MAINTENANCE_QUERY_KEY,
  getMaintenance,
  updateMaintenance,
} from '../../apis/maintenance';
import { AdminDateTimePicker } from '../../components/common/admin-date-time-picker';
import { AdminHighlightCard } from '../../components/common/admin-highlight-card';
import { AdminPageTitle } from '../../components/common/admin-page-title';

const STATUS_STYLE = {
  NORMAL: 'bg-[var(--positive-bg)] text-[var(--positive-text)]',
  DELAYED: 'bg-[var(--negative-bg)] text-[var(--negative-text)]',
  DOWN: 'bg-[var(--negative-bg)] text-[var(--negative-text)]',
  UNKNOWN: 'bg-[var(--ui-50)] text-[var(--ui-400)]',
} as const;

const STATUS_LABEL: Record<IntegrationStatus, string> = {
  NORMAL: '정상',
  DELAYED: '지연',
  DOWN: '장애',
  UNKNOWN: '확인불가',
};

function formatCheckedAt(value: string | null) {
  if (!value) return '점검 이력 없음';

  return value.replace('T', ' ').slice(0, 16);
}

function parseDate(value: string | null | undefined) {
  if (!value) return null;

  // 서버가 UTC 시각을 시간대 정보 없이 내려주는 경우가 있어 UTC로 보정합니다.
  const normalizedValue = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value) ? value : `${value}Z`;
  const parsedValue = new Date(normalizedValue);
  return Number.isNaN(parsedValue.getTime()) ? null : parsedValue;
}

export default function SystemSettingPage() {
  const queryClient = useQueryClient();
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
  const {
    data: integrationHealth,
    isError: isIntegrationHealthError,
    isPending: isIntegrationHealthPending,
    refetch: refetchIntegrationHealth,
  } = useQuery({
    queryKey: ADMIN_INTEGRATION_HEALTH_QUERY_KEY,
    queryFn: getIntegrationHealth,
  });
  const {
    isError: isRefreshError,
    isPending: isRefreshing,
    mutate: refresh,
  } = useMutation({
    mutationFn: refreshIntegrationHealth,
    onSuccess: (health) => queryClient.setQueryData(ADMIN_INTEGRATION_HEALTH_QUERY_KEY, health),
  });
  const {
    data: maintenance,
    isError: isMaintenanceError,
    isPending: isMaintenancePending,
  } = useQuery({
    queryKey: ADMIN_MAINTENANCE_QUERY_KEY,
    queryFn: getMaintenance,
  });
  const {
    isError: isMaintenanceUpdateError,
    isPending: isMaintenanceUpdating,
    mutate: update,
  } = useMutation({
    mutationFn: updateMaintenance,
    onSuccess: (nextMaintenance) =>
      queryClient.setQueryData(ADMIN_MAINTENANCE_QUERY_KEY, nextMaintenance),
  });

  useEffect(() => {
    if (!maintenance) return;

    setIsMaintenanceMode(maintenance.enabled);
    setMaintenanceMessage(maintenance.message ?? '');
    setScheduledAt(parseDate(maintenance.estimatedEndAt));
  }, [maintenance]);

  const handleRefresh = () => {
    if (isRefreshing) return;

    refresh();
  };

  const handleMaintenanceSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    update(
      isMaintenanceMode
        ? {
            enabled: true,
            message: maintenanceMessage.trim(),
            ...(scheduledAt && { estimatedEndAt: scheduledAt.toISOString() }),
          }
        : { enabled: false },
    );
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

              {isIntegrationHealthPending && (
                <div className="Body1 border-[var(--ui-200)] border-t py-[14px] text-[var(--ui-500)]">
                  외부 연동 상태를 불러오는 중입니다.
                </div>
              )}

              {isIntegrationHealthError && (
                <div className="flex items-center justify-between gap-[16px] border-[var(--ui-200)] border-t py-[14px]">
                  <p className="Body1 text-[var(--negative-text)]">
                    외부 연동 상태를 불러오지 못했습니다.
                  </p>
                  <button
                    className="Caption1 cursor-pointer rounded-[6px] border border-[var(--ui-200)] px-[10px] py-[6px] font-semibold text-[var(--ui-700)] hover:bg-[var(--ui-50)]"
                    onClick={() => void refetchIntegrationHealth()}
                    type="button"
                  >
                    다시 시도
                  </button>
                </div>
              )}

              {!isIntegrationHealthPending &&
                !isIntegrationHealthError &&
                integrationHealth?.integrations.length === 0 && (
                  <div className="Body1 border-[var(--ui-200)] border-t py-[14px] text-[var(--ui-500)]">
                    아직 점검 이력이 없습니다.
                  </div>
                )}

              {integrationHealth?.integrations.map((integration) => (
                <div
                  className="grid grid-cols-[minmax(150px,1fr)_100px_140px] items-center gap-[16px] border-[var(--ui-200)] border-t py-[14px]"
                  key={integration.type}
                >
                  <span className="Body1 font-medium text-[var(--ui-800)]">{integration.name}</span>
                  <span
                    className={`Caption1 w-fit rounded-[8px] px-[10px] py-[4px] font-semibold ${STATUS_STYLE[integration.status]}`}
                  >
                    {integration.statusLabel || STATUS_LABEL[integration.status]}
                  </span>
                  <time className="Label1 font-medium text-[var(--ui-1000)]">
                    {formatCheckedAt(integration.checkedAt ?? integrationHealth.checkedAt)}
                  </time>
                </div>
              ))}

              {isRefreshError && (
                <p className="Body1 border-[var(--ui-200)] border-t py-[14px] text-[var(--negative-text)]">
                  재점검 요청을 완료하지 못했습니다. 잠시 후 다시 시도해주세요.
                </p>
              )}
            </div>
          </div>
        </AdminHighlightCard>

        <form
          className="rounded-[10px] border border-[var(--ui-200)] bg-[var(--ui-bg)] px-[24px] py-[26px]"
          onSubmit={handleMaintenanceSubmit}
        >
          <h2 className="Heading1 font-semibold text-[var(--ui-1000)]">점검 모드 설정</h2>

          {isMaintenancePending && (
            <p className="Body1 mt-[12px] text-[var(--ui-500)]">
              점검 모드 상태를 불러오는 중입니다.
            </p>
          )}

          {isMaintenanceError && (
            <p className="Body1 mt-[12px] text-[var(--negative-text)]">
              점검 모드 상태를 불러오지 못했습니다.
            </p>
          )}

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
              onChange={(event) => setMaintenanceMessage(event.target.value)}
              placeholder="점검 사유를 입력해주세요."
              value={maintenanceMessage}
            />
          </label>

          <div className="mt-[24px]">
            <span className="Body1 font-medium text-[var(--ui-800)]">예상 종료 시각(선택)</span>
            <div className="mt-[12px]">
              <AdminDateTimePicker onChange={setScheduledAt} value={scheduledAt} />
            </div>
          </div>

          <button
            aria-busy={isMaintenanceUpdating}
            className="Headline1 mt-[36px] h-[54px] w-full cursor-pointer rounded-[12px] bg-[#4e49ff] font-semibold text-white transition-colors hover:bg-[#3e39e8] disabled:cursor-wait disabled:opacity-60"
            disabled={isMaintenancePending || isMaintenanceUpdating}
            type="submit"
          >
            {isMaintenanceUpdating ? '적용 중...' : '점검 모드 적용'}
          </button>

          {isMaintenanceUpdateError && (
            <p className="Body1 mt-[12px] text-[var(--negative-text)]">
              점검 모드 적용에 실패했습니다. 잠시 후 다시 시도해주세요.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
