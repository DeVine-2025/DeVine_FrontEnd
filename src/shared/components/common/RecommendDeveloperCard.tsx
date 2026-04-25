import { memo } from 'react';
import BookmarkButton from '@components/common/BookmarkButton';
import AvatarIcon from '@assets/icons/avatar.svg?react';
import { cn } from '@libs/cn';
import type { BadgeTone } from '@t/badgeTone';
import { useThemeStore } from '@store/theme';
import { normalizeTechKey, findTechBadge, SKIP_TECH_NAMES } from '@libs/tech-stack-utils';

export type RecommendDeveloperCardTech = { id: string; name: string; icon?: React.ReactNode };

export type RecommendDeveloperCardProps = {
  role: string;
  roleTone?: BadgeTone;
  nickname: string;
  profileImageUrl?: string;
  introduction?: string;

  domains?: Array<{ label: string }>;
  techStack?: RecommendDeveloperCardTech[];

  matchedProjectName?: string;
  matchedReason?: string;
  /** 매칭 문구 표시 여부 */
  showMatchedReason?: boolean;

  bookmarked?: boolean;
  onBookmarkChange?: (next: boolean) => void;
  memberId?: number;
  bookmarkId?: number;
  listItemId?: string;
  onBookmarkChangeById?: (
    memberId: number,
    listItemId: string,
    next: boolean,
    bookmarkId?: number,
  ) => void;
  onClick?: () => void;
  /** 메모 최적화: 부모에서 stable callback 전달 시 사용 */
  onNavigateToDeveloper?: (nickname: string) => void;
};



function RecommendDeveloperCard({
  role: _role,
  roleTone: _roleTone,
  nickname,
  profileImageUrl,
  introduction,
  domains,
  techStack,
  matchedProjectName = 'A 프로젝트',
  matchedReason = '프로젝트의 요구사항과 일치합니다.',
  showMatchedReason = true,
  bookmarked = false,
  onBookmarkChange,
  memberId,
  bookmarkId,
  listItemId,
  onBookmarkChangeById,
  onClick,
  onNavigateToDeveloper,
}: RecommendDeveloperCardProps) {
  const { theme } = useThemeStore();

  const filteredTechStack =
    techStack?.filter((t) => !SKIP_TECH_NAMES.has(normalizeTechKey(t.name))) ?? [];
  const techChips = filteredTechStack.slice(0, 5);
  const techOverflow = filteredTechStack.length - techChips.length;

  const handleClick =
    onNavigateToDeveloper && nickname
      ? () => onNavigateToDeveloper(nickname)
      : onClick;

  const handleBookmark =
    onBookmarkChangeById && listItemId != null
      ? (next: boolean) => onBookmarkChangeById(memberId ?? 0, listItemId, next, bookmarkId)
      : onBookmarkChange;

  return (
    <article
      role={handleClick ? 'button' : undefined}
      tabIndex={handleClick ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={
        handleClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClick();
              }
            }
          : undefined
      }
      className={cn(
        'relative h-[196px] w-full max-w-[1280px] overflow-hidden rounded-[24px] border border-[var(--ui-200)] bg-[var(--ui-bg)]',
        handleClick && 'cursor-pointer recommend-card-hover-border',
      )}
    >
      {/* 왼쪽 블록(프로필 + 소개) - 세로 정중앙, 아주 살짝 위로 */}
      <div className="absolute left-[24px] top-[calc(50%-30px)] flex -translate-y-1/2 items-center gap-[12px]">
        {/* 아바타 */}
        <div className="h-[56px] w-[56px] shrink-0 overflow-hidden rounded-full border-2 border-[var(--ui-200)] bg-[var(--ui-50)]">
          {profileImageUrl ? (
            <img src={profileImageUrl} alt={nickname} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[var(--ui-300)]">
              <AvatarIcon aria-hidden className="h-[56px] w-[56px]" />
            </div>
          )}
        </div>

        {/* 본문(좌) */}
        <div className="flex w-[394px] flex-col gap-[10px]">
          <div className="flex min-w-0 flex-col gap-[4px]">
            <p className="Body1 h-[26px] font-semibold text-[var(--ui-1000)]">{nickname}</p>
            <div className="flex flex-nowrap gap-[8px]">
              {domains?.slice(0, 3).map((d) => (
                <span
                  key={d.label}
                  className="Caption1 shrink-0 flex h-[24px] items-center justify-center rounded-[8px] bg-[var(--ui-100)] px-[6px] font-semibold text-[var(--ui-600)]"
                >
                  {d.label}
                </span>
              ))}
            </div>
          </div>
          <p className="Caption1 line-clamp-2 text-[var(--ui-600)]">{introduction}</p>
        </div>
      </div>

      {/* 기술스택 뱃지 - 3개 넘으면 두 줄로 */}
      <div className="absolute left-[780px] top-1/2 w-[300px] -translate-y-1/2">
        <div className="flex min-h-[72px] flex-wrap items-center gap-[4px]">
        {techChips.map((t) => {
          const badge = findTechBadge(t.name);
          if (badge) {
            const offSrc = theme === 'dark' ? (badge.offDark ?? badge.off) : badge.off;
            return (
              <span key={t.id} className="inline-flex items-center">
                <img
                  src={offSrc}
                  alt={badge.label}
                  className="h-[32px] w-auto select-none"
                  draggable={false}
                />
              </span>
            );
          }
          return (
            <span
              key={t.id}
              className="Caption1 inline-flex items-center rounded-[20px] border border-[var(--ui-200)] bg-[var(--ui-100)] px-[10px] py-[6px] font-medium text-[var(--ui-800)]"
            >
              {t.name}
            </span>
          );
        })}
        {techOverflow > 0 ? (
          <span className="Label1 font-medium text-[var(--ui-400)]">+{techOverflow}</span>
        ) : null}
        </div>
      </div>

      {/* 북마크 */}
      <BookmarkButton
        bookmarked={bookmarked}
        onBookmarkChange={handleBookmark}
        stopPropagation
        className="absolute right-[24px] top-1/2 h-[52px] w-[52px] -translate-y-1/2"
        iconClassName="h-[32px] w-[32px]"
        colorIconClassName="h-[44px] w-[44px]"
      />

      {showMatchedReason && (
        <div className="absolute left-[24px] bottom-[32px] flex items-center justify-center rounded-[12px] bg-[var(--ui-100)] px-[12px] py-[8px]">
          <p className="Label1 font-medium text-[var(--ui-1000)]">
            <span className="text-[var(--badge-text-primary)]">[{matchedProjectName}]</span>
            {matchedReason}
          </p>
        </div>
      )}
    </article>
  );
}

export default memo(RecommendDeveloperCard);

