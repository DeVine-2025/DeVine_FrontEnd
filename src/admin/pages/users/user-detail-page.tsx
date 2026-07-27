import ArrowLeftAdminIcon from '@assets/icons/arrow-left-admin.svg?react';
import AdminAttachMoneyIcon from '@assets/icons/admin-attach-money.svg?react';
import AdminCreditScoreIcon from '@assets/icons/admin-credit-score.svg?react';
import AdminDemographyIcon from '@assets/icons/admin-demography.svg?react';
import AdminVerifiedUserIcon from '@assets/icons/admin-verified-user.svg?react';
import AdminWarningIcon from '@assets/icons/admin-warning.svg?react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@libs/cn';
import { AdminPageTitle } from '../../components/common/admin-page-title';

const USER_PROFILE = {
  name: '김계발',
  email: 'Kim@kimgal.com',
  joinedAt: '2025-11-02',
  status: '정상',
  recentPayments: '3건',
  totalAmount: '총 23,400원',
  reportCount: '1건',
  sanctionLabel: '제재 이력 없음',
};

const CARD_CLASS = 'rounded-[10px] border border-[var(--ui-200)] bg-[var(--ui-bg)] p-[24px]';
const SECTION_TITLE_CLASS = 'Headline1 font-semibold text-[var(--ui-1000)]';

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-[16px] border-[var(--ui-200)] border-b px-[13px] py-[10px] first:border-t">
      <span className="Body1 w-[64px] shrink-0 font-semibold text-[var(--ui-1000)]">{label}</span>
      <span className="Body1 font-normal text-[var(--ui-1000)]">{value}</span>
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

export default function UserDetailPage() {
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

      <div className="mt-[28px] grid grid-cols-1 gap-[24px] lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-[24px]">
          <div className={cn(CARD_CLASS, 'border-[rgba(135,157,255,0.65)]')}>
            <h2 className={SECTION_TITLE_CLASS}>프로필</h2>
            <div className="mt-[16px] flex flex-col">
              <InfoCell
                label="이름"
                value={`${USER_PROFILE.name} ( ${USER_PROFILE.email} )`}
              />
              <InfoCell label="가입일" value={USER_PROFILE.joinedAt} />
              <InfoCell label="계정 상태" value={USER_PROFILE.status} />
            </div>
          </div>

          <div className={CARD_CLASS}>
            <h2 className={SECTION_TITLE_CLASS}>결제 이력 요약</h2>
            <div className="mt-[16px] grid grid-cols-1 gap-[16px] sm:grid-cols-2">
              <SummaryItem
                icon={<AdminCreditScoreIcon aria-hidden="true" className="size-[24px] shrink-0" />}
                label="최근 결제"
                value={USER_PROFILE.recentPayments}
              />
              <SummaryItem
                icon={<AdminAttachMoneyIcon aria-hidden="true" className="size-[24px] shrink-0" />}
                label={USER_PROFILE.totalAmount}
              />
            </div>
          </div>

          <div className={CARD_CLASS}>
            <h2 className={SECTION_TITLE_CLASS}>신고/제제 이력</h2>
            <div className="mt-[16px] grid grid-cols-1 gap-[16px] sm:grid-cols-2">
              <SummaryItem
                icon={<AdminDemographyIcon aria-hidden="true" className="size-[24px] shrink-0" />}
                label="신고"
                value={USER_PROFILE.reportCount}
              />
              <SummaryItem
                icon={<AdminVerifiedUserIcon aria-hidden="true" className="size-[24px] shrink-0" />}
                label={USER_PROFILE.sanctionLabel}
              />
            </div>
          </div>
        </div>

        <div className={cn(CARD_CLASS, 'flex h-fit flex-col self-start')}>
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
              강제 탈퇴는 즉시 삭제가 아닌 30일 소멸 절차 후 확정 됩니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
