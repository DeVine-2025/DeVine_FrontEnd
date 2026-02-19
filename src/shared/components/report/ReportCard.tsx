import { usePatchReportVisibility } from '@apis/report/report-mutation';
import LockCloseIcon from '@assets/icons/lock-close.svg?react';
import LockOpenIcon from '@assets/icons/lock-open.svg?react';
import PlusIcon from '@assets/icons/plus.svg?react';
import { cn } from '@libs/cn';
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
  const [isOn, setIsOn] = useState(isPublic);
  const { mutate } = usePatchReportVisibility();

  const to = type === 'create' ? '/report/create' : `/report/detail/${gitRepoId}?type=${label}`;

  const handleCardClick = () => {
    navigate(to);
  };

  const handleLockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (reportId) {
      const visibility = isOn ? 'PRIVATE' : 'PUBLIC';
      mutate(
        { reportId, visibility },
        {
          onSuccess: () => setIsOn((prev) => !prev),
        },
      );
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      className="inline-flex h-[25rem] w-fit cursor-pointer rounded-3xl border border-[var(--ui-200)] p-[2.5rem] text-left transition-colors duration-200 hover:border-[#4E49FF]"
    >
      <div className="w-[21rem]">
        {type === 'create' && (
          <div className="flex h-full w-full items-center justify-center p-6">
            <div className="flex-col-center gap-[3.3rem]">
              <PlusIcon className="h-[6rem] w-[6rem] text-ui-200" />
              <p className="text-3xl text-[var(--ui-400)]">리포트 생성하기</p>
            </div>
          </div>
        )}

        {type === 'main' && (
          <div>
            <div className="flex w-full justify-between">
              <div className="flex-col-center rounded-lg bg-[var(--badge-bg-primary)] px-[0.8rem] py-[0.4rem]">
                <p className="Label1 text-[var(--badge-text-primary)]">
                  {label === 'MAIN' ? '메인' : '상세'}
                </p>
              </div>

              {/* 내부 인터랙션은 이벤트 버블링 막기 - 버튼 클릭 시 비공개 설정 */}
              <button
                type="button"
                onClick={handleLockClick}
                className={cn(
                  'relative h-[2.8rem] w-[5.6rem] rounded-[80px] border border-[var(--ui-200)] bg-[var(--ui-100)] px-[0.8rem]',
                  isOn && 'bg-primary',
                )}
              >
                <div className="flex h-full items-center justify-between">
                  <LockOpenIcon className="text-[#F3F5FC]" />
                  <LockCloseIcon
                    className={cn(
                      'transition-colors',
                      isOn ? 'text-[#F3F5FC]' : 'text-[var(--ui-300)]',
                    )}
                  />
                </div>

                <div
                  className={cn(
                    '-translate-y-1/2 absolute top-1/2 left-[0.2rem] h-[2.4rem] w-[2.6rem] rounded-full border border-[var(--ui-200)] bg-[var(--ui-bg)] transition-transform duration-200 ease-out',
                    isOn && 'translate-x-[2.4rem]',
                  )}
                />
              </button>
            </div>

            <p className="Heading1 mt-[2rem] line-clamp-2 font-semibold text-[var(--ui-1000)]">
              {title}
            </p>
            <p className="Body1 mt-[1.6rem] line-clamp-2 text-[var(--ui-400)]">{description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportCard;
