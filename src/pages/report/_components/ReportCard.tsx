import { usePatchReportVisibility } from '@apis/report/report-mutation';
import LockCloseIcon from '@assets/icons/lock-close.svg?react';
import LockOpenIcon from '@assets/icons/lock-open.svg?react';
import { cn } from '@libs/cn';
import { useThemeStore } from '@store/theme.store';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type ReportCardProps = {
  type: 'create' | 'main';
  gitRepoId?: number;
  reportId?: number;
  label?: string;
  title?: string;
  description?: string;
  isPublic?: boolean;
  onClickCreate?: () => void;
  onClickShowDetails?: () => void;
  onClickLock?: () => void;
};

const ReportCard = ({
  type,
  label,
  gitRepoId,
  reportId,
  title,
  description,
  isPublic,
}: ReportCardProps) => {
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  const [isOn, setIsOn] = useState(isPublic);
  const [hovered, setHovered] = useState(false);
  const { mutate } = usePatchReportVisibility();

  const to = type === 'create' ? '/report/create' : `/report/detail/${gitRepoId}?type=${label}`;

  const handleCardClick = () => navigate(to);

  const handleLockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (reportId) {
      const visibility = isOn ? 'PRIVATE' : 'PUBLIC';
      mutate({ reportId, visibility }, { onSuccess: () => setIsOn((prev) => !prev) });
    }
  };

  /* ── 생성 카드 ── */
  if (type === 'create') {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(); } }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          'group col-span-1 flex cursor-pointer flex-col items-center justify-center gap-[1.4rem] rounded-[16px] border-2 border-dashed py-[4rem] transition-all duration-300 hover:border-[rgba(78,73,255,0.55)]',
          isLight
            ? 'border-[var(--ui-300)] bg-[var(--ui-50)] hover:bg-[rgba(78,73,255,0.06)]'
            : 'border-white/10 hover:bg-[rgba(78,73,255,0.04)]',
        )}
      >
        <div
          className={cn(
            'flex h-[4.8rem] w-[4.8rem] items-center justify-center rounded-full border transition-all duration-300 group-hover:scale-110 group-hover:border-[rgba(78,73,255,0.45)] group-hover:bg-[rgba(78,73,255,0.12)]',
            isLight
              ? 'border-[var(--ui-300)] bg-white'
              : 'border-white/10 bg-white/5 group-hover:bg-[rgba(78,73,255,0.1)]',
          )}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className={cn(
                'transition-colors duration-300',
                isLight ? 'text-[var(--ui-500)] group-hover:text-[#4E49FF]' : 'text-white/30 group-hover:text-[#8C88FF]',
              )}
            />
          </svg>
        </div>
        <p
          className={cn(
            'text-[13px] font-medium tracking-wide transition-colors duration-300',
            isLight ? 'text-[var(--ui-700)] group-hover:text-[#4E49FF]' : 'text-white/25 group-hover:text-[rgba(140,136,255,0.85)]',
          )}
        >
          리포트 생성하기
        </p>
      </div>
    );
  }

  /* ── 일반 카드 ── */
  const isMain = label === 'MAIN';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(); } }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'group relative flex cursor-pointer flex-col gap-0 overflow-hidden rounded-[16px] border transition-all duration-200 hover:scale-[1.02] min-h-[14rem]',
        isLight
          ? 'border-[var(--ui-200)] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:border-[var(--ui-300)] hover:bg-[var(--ui-50)] hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)]'
          : 'border-white/[0.07] bg-white/[0.03] hover:border-white/[0.12] hover:bg-white/[0.05]',
      )}
    >

      <div className="h-[3px] w-full bg-[#4E49FF]" />
      <div className="flex flex-col gap-[1.4rem] p-[2rem]">
        {/* 배지 + 토글 */}
        <div className="flex items-center justify-between">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-[0.9rem] py-[0.3rem] text-[11px] font-semibold',
              isLight
                ? 'bg-[rgba(78,73,255,0.14)] text-[#4E49FF]'
                : 'bg-[rgba(78,73,255,0.12)] text-[rgba(140,136,255,0.9)]',
            )}
          >
            {isMain ? '메인' : '상세'}
          </span>

          <button
            type="button"
            onClick={handleLockClick}
            className={cn(
              'relative h-[2.4rem] w-[4.8rem] rounded-full border transition-all duration-200',
              isOn
                ? 'border-[rgba(78,73,255,0.45)] bg-[rgba(78,73,255,0.22)]'
                : isLight
                  ? 'border-[var(--ui-300)] bg-[var(--ui-100)]'
                  : 'border-white/10 bg-white/5',
            )}
          >
            <div className="flex h-full items-center justify-between px-[0.5rem]">
              <LockOpenIcon
                className={cn(
                  'h-[1.1rem] w-[1.1rem]',
                  isLight ? 'text-[var(--ui-500)]' : 'text-white/25',
                )}
              />
              <LockCloseIcon
                className={cn(
                  'h-[1.1rem] w-[1.1rem] transition-colors',
                  isOn
                    ? 'text-[#4E49FF]'
                    : isLight
                      ? 'text-[var(--ui-400)]'
                      : 'text-white/20',
                )}
              />
            </div>
            <div
              className={cn(
                '-translate-y-1/2 absolute top-1/2 left-[0.2rem] h-[2rem] w-[2rem] rounded-full border shadow-sm transition-transform duration-200 ease-out',
                isLight
                  ? 'border-[var(--ui-200)] bg-white'
                  : 'border-white/10 bg-[var(--ui-bg)]',
                isOn && 'translate-x-[2.2rem]',
              )}
            />
          </button>
        </div>

        {/* 제목 */}
        <div className="flex flex-col gap-[0.6rem]">
          <p
            className={cn(
              'line-clamp-1 text-[15px] font-semibold leading-[1.4]',
              isLight ? 'text-[var(--ui-900)]' : 'text-white/90',
            )}
          >
            {title}
          </p>
          <p
            className={cn(
              'line-clamp-2 text-[12px] leading-[1.7]',
              isLight ? 'text-[var(--ui-600)]' : 'text-white/35',
            )}
          >
            {description || '설명이 없습니다.'}
          </p>
        </div>

      </div>
    </div>
  );
};

export default ReportCard;
