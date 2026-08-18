import ArrowLeftAdminIcon from '@assets/icons/arrow-left-admin.svg?react';
import AdminAttachMoneyIcon from '@assets/icons/admin-attach-money.svg?react';
import AdminCreditScoreIcon from '@assets/icons/admin-credit-score.svg?react';
import AdminDemographyIcon from '@assets/icons/admin-demography.svg?react';
import AdminVerifiedUserIcon from '@assets/icons/admin-verified-user.svg?react';
import AdminWarningIcon from '@assets/icons/admin-warning.svg?react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { cn } from '@libs/cn';
import { getAdminMemberDetail } from '../../apis/member';
import { AdminPageTitle } from '../../components/common/admin-page-title';

const CARD_CLASS = 'rounded-[10px] border border-[var(--ui-200)] bg-[var(--ui-bg)] p-[24px]';
const SECTION_TITLE_CLASS = 'Headline1 font-semibold text-[var(--ui-1000)]';

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-[16px] border-[var(--ui-200)] border-b px-[13px] py-[10px] first:border-t">
      <span className="Body1 w-[96px] shrink-0 font-semibold text-[var(--ui-1000)]">{label}</span>
      <span className="Body1 min-w-0 break-all font-normal text-[var(--ui-1000)]">{value}</span>
    </div>
  );
}

function SummaryItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value?: string;
}) {
  return (
    <div className="flex h-[60px] items-center justify-center gap-[8px] rounded-[10px] border border-[var(--ui-200)] px-[16px]">
      {icon}
      <span className="Body1 font-semibold text-[var(--ui-1000)]">{label}</span>
      {value ? <span className="Body1 font-normal text-[var(--ui-1000)]">{value}</span> : null}
    </div>
  );
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: '정상',
  SUSPENDED: '정지',
  WITHDRAWN: '탈퇴',
  PENDING_WITHDRAWAL: '탈퇴 예정',
};

const MAIN_TYPE_LABELS: Record<string, string> = {
  DEVELOPER: '개발자',
  DESIGNER: '디자이너',
  PLANNER: '기획자',
  PM: 'PM',
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PAID: '결제 완료',
  REFUNDED: '환불 완료',
  CANCELLED: '결제 취소',
  FAILED: '결제 실패',
};

const formatDateTime = (value?: string | null) => {
  if (!value) return '-';

  const date = dayjs(value);
  return date.isValid() ? date.format('YYYY-MM-DD HH:mm') : '-';
};

export default function UserDetailPage() {
  const { nickname } = useParams();
  const decodedNickname = nickname ? decodeURIComponent(nickname) : '';
  const { data, isError, isPending } = useQuery({
    queryKey: ['admin', 'members', 'detail', decodedNickname],
    queryFn: () => getAdminMemberDetail(decodedNickname),
    enabled: Boolean(decodedNickname),
  });
  const loginHistory = [...(data?.loginHistory ?? [])].sort((a, b) => {
    const aTimestamp = a.loginAt ? dayjs(a.loginAt).valueOf() : 0;
    const bTimestamp = b.loginAt ? dayjs(b.loginAt).valueOf() : 0;
    return bTimestamp - aTimestamp;
  });
  const paymentSummary = data?.paymentSummary;
  const hasPaymentSummary = Boolean(
    paymentSummary &&
      (paymentSummary.paymentId != null ||
        paymentSummary.orderName ||
        paymentSummary.amount != null ||
        paymentSummary.paidAt ||
        paymentSummary.status),
  );

  return (
    <section>
      <Link
        className="Body1 inline-flex cursor-pointer items-center gap-[6px] font-medium text-[1.5rem] text-[var(--ui-700)] no-underline hover:text-[var(--ui-1000)]"
        to="/admin/users"
      >
        <ArrowLeftAdminIcon
          aria-hidden="true"
          className="[&_path]:!fill-current size-[20px] shrink-0"
        />
        유저 검색/목록 으로
      </Link>

      <AdminPageTitle className="mt-[8px]" title="유저 상세" />

      {isPending && (
        <div className={cn(CARD_CLASS, 'mt-[28px] py-[80px] text-center text-[var(--ui-500)]')}>
          유저 정보를 불러오는 중입니다.
        </div>
      )}

      {isError && (
        <div
          className={cn(
            CARD_CLASS,
            'mt-[28px] py-[80px] text-center text-[var(--negative-text)]',
          )}
        >
          유저 정보를 불러오지 못했습니다.
        </div>
      )}

      {data && (
        <div className="mt-[28px] grid grid-cols-1 gap-[24px] lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-[24px]">
            <div className={cn(CARD_CLASS, 'border-[rgba(135,157,255,0.65)]')}>
              <h2 className={SECTION_TITLE_CLASS}>프로필</h2>
              <div className="mt-[16px] flex flex-col">
                <InfoCell label="이름" value={data.name?.trim() || '-'} />
                <InfoCell label="닉네임" value={data.nickname} />
                <InfoCell label="이메일" value={data.email?.trim() || '-'} />
                <InfoCell
                  label="회원 유형"
                  value={data.mainType ? (MAIN_TYPE_LABELS[data.mainType] ?? data.mainType) : '-'}
                />
                <InfoCell label="가입일" value={formatDateTime(data.createdAt)} />
                <InfoCell
                  label="계정 상태"
                  value={STATUS_LABELS[data.status] ?? data.status}
                />
                {data.scheduledWithdrawalAt && (
                  <InfoCell
                    label="탈퇴 예정일"
                    value={formatDateTime(data.scheduledWithdrawalAt)}
                  />
                )}
              </div>
            </div>

            <div className={CARD_CLASS}>
              <h2 className={SECTION_TITLE_CLASS}>최근 결제 요약</h2>
              {hasPaymentSummary && paymentSummary ? (
                <>
                  <div className="mt-[16px] grid grid-cols-1 gap-[16px] sm:grid-cols-2">
                    {paymentSummary.orderName && (
                      <SummaryItem
                        icon={
                          <AdminCreditScoreIcon
                            aria-hidden="true"
                            className="size-[24px] shrink-0"
                          />
                        }
                        label={paymentSummary.orderName}
                      />
                    )}
                    {typeof paymentSummary.amount === 'number' && (
                      <SummaryItem
                        icon={
                          <AdminAttachMoneyIcon
                            aria-hidden="true"
                            className="size-[24px] shrink-0"
                          />
                        }
                        label={`${paymentSummary.amount.toLocaleString('ko-KR')}원`}
                      />
                    )}
                  </div>
                  <div className="mt-[16px] flex flex-col">
                    {paymentSummary.status && (
                      <InfoCell
                        label="결제 상태"
                        value={PAYMENT_STATUS_LABELS[paymentSummary.status] ?? paymentSummary.status}
                      />
                    )}
                    {paymentSummary.paidAt && (
                      <InfoCell label="결제일" value={formatDateTime(paymentSummary.paidAt)} />
                    )}
                    {paymentSummary.paymentId != null && (
                      <InfoCell label="결제 ID" value={paymentSummary.paymentId.toString()} />
                    )}
                  </div>
                </>
              ) : (
                <p className="Body1 mt-[16px] py-[28px] text-center text-[var(--ui-500)]">
                  결제 이력이 없습니다.
                </p>
              )}
            </div>

            <div className={CARD_CLASS}>
              <h2 className={SECTION_TITLE_CLASS}>신고/제재 이력</h2>
              <div className="mt-[16px] grid grid-cols-1 gap-[16px] sm:grid-cols-2">
                <SummaryItem
                  icon={<AdminDemographyIcon aria-hidden="true" className="size-[24px] shrink-0" />}
                  label="신고"
                  value="-"
                />
                <SummaryItem
                  icon={
                    <AdminVerifiedUserIcon aria-hidden="true" className="size-[24px] shrink-0" />
                  }
                  label="제재 이력"
                  value="-"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-[24px] self-start">
            <div className={cn(CARD_CLASS, 'flex h-fit flex-col')}>
              <h2 className={SECTION_TITLE_CLASS}>계정 상태 변경</h2>

              <div className="mt-[24px] flex flex-col gap-[20px]">
                <button
                  className="Heading2 h-[56px] w-full cursor-pointer rounded-[12px] bg-[#4e49ff] font-medium text-white transition-colors hover:bg-[#3e39e8]"
                  type="button"
                >
                  정지
                </button>
                <button
                  className="Heading2 h-[56px] w-full cursor-pointer rounded-[12px] border border-[#4e49ff] bg-[var(--ui-bg)] font-medium text-[#4e49ff] transition-colors hover:bg-[var(--ui-50)]"
                  type="button"
                >
                  정지 해제
                </button>
                <button
                  className="Heading2 h-[56px] w-full cursor-pointer rounded-[12px] bg-[#ec221f] font-medium text-white transition-colors hover:bg-[#d41e1b]"
                  type="button"
                >
                  강제 탈퇴
                </button>
              </div>

              <div className="mt-[32px] flex items-center gap-[12px] rounded-[10px] border border-[var(--negative-text)] bg-[var(--negative-bg)] px-[20px] py-[22px]">
                <AdminWarningIcon aria-hidden="true" className="size-[24px] shrink-0" />
                <p className="Body1 font-medium text-[var(--negative-text)]">
                  강제 탈퇴는 즉시 삭제가 아닌 30일 소멸 절차 후 확정됩니다.
                </p>
              </div>
            </div>

            <div className={cn(CARD_CLASS, 'flex h-fit flex-col')}>
              <div className="flex items-center gap-[8px]">
                <AdminVerifiedUserIcon aria-hidden="true" className="size-[24px] shrink-0" />
                <h2 className={SECTION_TITLE_CLASS}>로그인 이력</h2>
              </div>

              {loginHistory.length > 0 ? (
                <ol className="mt-[16px] max-h-[440px] overflow-y-auto border-[var(--ui-200)] border-t">
                  {loginHistory.map((history, index) => (
                    <li
                      className="Body1 flex items-center justify-between gap-[16px] border-[var(--ui-200)] border-b px-[12px] py-[14px]"
                      key={`${history.loginAt ?? 'unknown'}-${index}`}
                    >
                      <span className="text-[var(--ui-600)]">
                        {index === 0 ? '최근 로그인' : `${index + 1}번째`}
                      </span>
                      <time
                        className="font-medium text-[var(--ui-1000)]"
                        dateTime={history.loginAt ?? undefined}
                      >
                        {formatDateTime(history.loginAt)}
                      </time>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="Body1 mt-[16px] py-[28px] text-center text-[var(--ui-500)]">
                  로그인 이력이 없습니다.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
