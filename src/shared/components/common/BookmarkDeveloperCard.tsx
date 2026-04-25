import { memo } from 'react';
import BookmarkButton from '@ui/BookmarkButton';
import AvatarIcon from '@assets/icons/avatar.svg?react';
import { useThemeStore } from '@store/theme';
import { normalizeTechKey, findTechBadge, SKIP_TECH_NAMES } from '@libs/tech-stack-utils';

type BookmarkDeveloperTech = {
  id: string;
  name: string;
  icon?: React.ReactNode;
};

export type BookmarkDeveloperCardProps = {
  nickname: string;
  profileImageUrl?: string;
  introduction?: string;
  domains?: Array<{ label: string }>;
  techStack?: BookmarkDeveloperTech[];
  bookmarked?: boolean;
  onBookmarkChange?: (next: boolean) => void;
  onClick?: () => void;
};

function BookmarkDeveloperCard({
  nickname,
  profileImageUrl,
  introduction,
  domains,
  techStack,
  bookmarked = false,
  onBookmarkChange,
  onClick,
}: BookmarkDeveloperCardProps) {
  const { theme } = useThemeStore();
  const maxChips = 5;

  const filteredTechStack =
    techStack?.filter((t) => !SKIP_TECH_NAMES.has(normalizeTechKey(t.name))) ?? [];
  const chips = filteredTechStack.slice(0, maxChips);
  const overflow = filteredTechStack.length - chips.length;

  return (
    <article
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`relative overflow-hidden rounded-[24px] bg-[var(--ui-bg)] h-[180px] max-w-[1180px] w-full border border-[var(--ui-200)] ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* 왼쪽 블록(프로필 + 소개) - 세로 정중앙 */}
      <div className="absolute left-[20px] top-[calc(50%-40px)] flex -translate-y-1/2 items-center gap-[12px]">
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

      {/* 스택(우) */}
      <div className="absolute left-[518px] top-1/2 flex h-[76px] w-[360px] -translate-y-1/2 flex-wrap items-center gap-[4px]">
        {chips.map((t) => (
          <span key={t.id} className="inline-flex items-center">
            {(() => {
              const badge = findTechBadge(t.name);
              if (badge) {
                const offSrc = theme === 'dark' ? (badge.offDark ?? badge.off) : badge.off;
                return (
                  <img
                    src={offSrc}
                    alt={badge.label}
                    className="h-[36px] w-auto select-none"
                    draggable={false}
                  />
                );
              }
              return (
                <span className="flex items-center gap-[8px] rounded-[24px] border border-[var(--ui-200)] bg-[var(--ui-100)] px-[12px] py-[8px]">
                  {t.icon ? <span className="h-[20px] w-[20px]">{t.icon}</span> : null}
                  <span className="Caption1 font-medium text-[var(--ui-800)]">{t.name}</span>
                </span>
              );
            })()}
          </span>
        ))}
        {overflow > 0 ? (
          <span className="Label1 font-medium text-[var(--ui-400)]">+{overflow}</span>
        ) : null}
      </div>

      {/* 북마크 */}
      <BookmarkButton
        bookmarked={bookmarked}
        onBookmarkChange={onBookmarkChange}
        stopPropagation
        className="absolute right-[24px] top-1/2 h-[44px] w-[44px] -translate-y-1/2"
        iconClassName="h-[28px] w-[28px]"
        colorIconClassName="h-[36px] w-[36px]"
      />
    </article>
  );
}

export default memo(BookmarkDeveloperCard);
