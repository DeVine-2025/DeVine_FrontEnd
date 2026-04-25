import { memo } from 'react';
import BookmarkButton from '@ui/BookmarkButton';
import AvatarIcon from '@assets/icons/avatar.svg?react';
import { cn } from '@libs/cn';
import { useThemeStore } from '@store/theme';
import { normalizeTechKey, findTechBadge, SKIP_TECH_NAMES } from '@libs/tech-stack-utils';
import type { ProfileCardProps } from '../../types/profileCard.types';
import { BadgeList, Intro, TechChips, HeaderBlock } from './ProfileBase';

export type DeveloperTech = { id: string; name: string; icon?: React.ReactNode };

export type DeveloperCardProps = ProfileCardProps & {
  variant: 'search' | 'recommend' | 'bookmark';
  size?: 'lg' | 'md' | 'sm';
  
  // Recommend & Bookmark specific
  domains?: Array<{ label: string }>;
  techStackArray?: DeveloperTech[];
  
  matchedProjectName?: string;
  matchedReason?: string;
  showMatchedReason?: boolean;
  
  memberId?: number;
  bookmarkId?: number;
  listItemId?: string;
  onBookmarkChangeById?: (
    memberId: number,
    listItemId: string,
    next: boolean,
    bookmarkId?: number,
  ) => void;
  onNavigateToDeveloper?: (nickname: string) => void;
};

export const DeveloperCard = memo(function DeveloperCard(props: DeveloperCardProps) {
  const { variant, size = 'sm' } = props;

  if (variant === 'search') {
    if (size === 'lg') return <ProfileLgLayout {...props} />;
    if (size === 'md') return <ProfileMdLayout {...props} />;
    if (size === 'sm') return <ProfileSmLayout {...props} />;
  }
  
  if (variant === 'recommend') return <RecommendLayout {...props} />;
  if (variant === 'bookmark') return <BookmarkLayout {...props} />;
  
  return null;
});

function ProfileLgLayout(props: DeveloperCardProps) {
  const { nickname, profileImageUrl, profileImageAlt, id, bookmarked = false, onBookmarkChange, badges, introduction, techStack, action, className, header, onClick } = props;
  return (
    <article
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
      className={cn('rounded-2xl border border-card-border bg-card-bg', 'card-size-lg flex flex-col', header && 'card-size-lg--with-header', onClick && 'cursor-pointer recommend-card-hover-border', className)}
    >
      {header ? <div className="">{header}</div> : null}
      <div className="group/profile flex min-h-0 flex-1 items-center gap-9">
        <img src={profileImageUrl} alt={profileImageAlt ?? nickname} className={cn('card-avatar-sm', 'shrink-0 rounded-full object-cover ring-2 ring-white/10', onClick && 'transition-transform duration-300 ease-out group-hover/profile:scale-105')} loading="lazy" />
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-4">
          <div className="truncate pl-1 font-semibold text-2xl text-card-title">{nickname}</div>
          <BadgeList badges={badges} className="gap-4" />
          <Intro introduction={introduction} />
        </div>
        <div className="flex w-[330px] items-center">
          <TechChips techStack={techStack} max={5} />
        </div>
        <div className="ml-auto flex items-center pr-5">
          {action ?? (
            <BookmarkButton bookmarked={bookmarked} onBookmarkChange={(next) => onBookmarkChange?.(next, id)} stopPropagation={false} className="inline-flex" iconClassName="h-[30px] w-[30px]" colorIconClassName="h-[44px] w-[44px]" />
          )}
        </div>
      </div>
    </article>
  );
}

function ProfileMdLayout(props: DeveloperCardProps) {
  const { nickname, profileImageUrl, profileImageAlt, id, bookmarked = false, onBookmarkChange, badges, introduction, techStack, className, onClick } = props;
  return (
    <article
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
      className={cn('rounded-2xl border border-card-border bg-card-bg', 'card-size-md', onClick && 'cursor-pointer', className)}
    >
      <div className="flex h-full items-start gap-6">
        <img src={profileImageUrl} alt={profileImageAlt ?? nickname} className={cn('card-avatar-sm', 'shrink-0 rounded-full object-cover ring-2 ring-white/10')} loading="lazy" />
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <div className="truncate pl-2 font-semibold text-2xl text-card-title">{nickname}</div>
          <BadgeList badges={badges} className="gap-3" />
          <Intro introduction={introduction} />
        </div>
        <div className="flex h-full w-[220px] items-center">
          <TechChips techStack={techStack} max={4} />
        </div>
        <BookmarkButton bookmarked={bookmarked} onBookmarkChange={(next) => onBookmarkChange?.(next, id)} stopPropagation={false} className="ml-auto flex h-full items-center" iconClassName="h-[32px] w-[32px]" colorIconClassName="h-[44px] w-[44px]" />
      </div>
    </article>
  );
}

function ProfileSmLayout(props: DeveloperCardProps) {
  const { onClick } = props;
  return (
    <article
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
      className={cn('rounded-2xl bg-ui-50', 'card-size-sm', onClick && 'cursor-pointer')}
    >
      <HeaderBlock {...props} avatarClass="card-avatar-sm" roleClass="text-base" titleClass="text-[16px] font-medium" />
      <div><BadgeList badges={props.badges} className="mt-6 gap-3" /></div>
      <div className="mt-1 ml-2"><Intro introduction={props.introduction} /></div>
      <div className="mt-1"><TechChips techStack={props.techStack} max={4} /></div>
    </article>
  );
}

function RecommendLayout(props: DeveloperCardProps) {
  const { nickname, profileImageUrl, introduction, domains, techStackArray, matchedProjectName = 'A 프로젝트', matchedReason = '프로젝트의 요구사항과 일치합니다.', showMatchedReason = true, bookmarked = false, onBookmarkChange, memberId, bookmarkId, listItemId, onBookmarkChangeById, onClick, onNavigateToDeveloper } = props;
  const { theme } = useThemeStore();

  const filteredTechStack = techStackArray?.filter((t) => !SKIP_TECH_NAMES.has(normalizeTechKey(t.name))) ?? [];
  const techChips = filteredTechStack.slice(0, 5);
  const techOverflow = filteredTechStack.length - techChips.length;

  const handleClick = onNavigateToDeveloper && nickname ? () => onNavigateToDeveloper(nickname) : onClick;
  const handleBookmark = onBookmarkChangeById && listItemId != null ? (next: boolean) => onBookmarkChangeById(memberId ?? 0, listItemId, next, bookmarkId) : (next: boolean) => onBookmarkChange?.(next, nickname);

  return (
    <article
      role={handleClick ? 'button' : undefined}
      tabIndex={handleClick ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={handleClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } } : undefined}
      className={cn('relative h-[196px] w-full max-w-[1280px] overflow-hidden rounded-[24px] border border-[var(--ui-200)] bg-[var(--ui-bg)]', handleClick && 'cursor-pointer recommend-card-hover-border')}
    >
      <div className="absolute left-[24px] top-[calc(50%-30px)] flex -translate-y-1/2 items-center gap-[12px]">
        <div className="h-[56px] w-[56px] shrink-0 overflow-hidden rounded-full border-2 border-[var(--ui-200)] bg-[var(--ui-50)]">
          {profileImageUrl ? (
            <img src={profileImageUrl} alt={nickname} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[var(--ui-300)]">
              <AvatarIcon aria-hidden className="h-[56px] w-[56px]" />
            </div>
          )}
        </div>
        <div className="flex w-[394px] flex-col gap-[10px]">
          <div className="flex min-w-0 flex-col gap-[4px]">
            <p className="Body1 h-[26px] font-semibold text-[var(--ui-1000)]">{nickname}</p>
            <div className="flex flex-nowrap gap-[8px]">
              {domains?.slice(0, 3).map((d) => (
                <span key={d.label} className="Caption1 shrink-0 flex h-[24px] items-center justify-center rounded-[8px] bg-[var(--ui-100)] px-[6px] font-semibold text-[var(--ui-600)]">{d.label}</span>
              ))}
            </div>
          </div>
          <p className="Caption1 line-clamp-2 text-[var(--ui-600)]">{introduction}</p>
        </div>
      </div>
      <div className="absolute left-[780px] top-1/2 w-[300px] -translate-y-1/2">
        <div className="flex min-h-[72px] flex-wrap items-center gap-[4px]">
          {techChips.map((t) => {
            const badge = findTechBadge(t.name);
            if (badge) {
              const offSrc = theme === 'dark' ? (badge.offDark ?? badge.off) : badge.off;
              return <span key={t.id} className="inline-flex items-center"><img src={offSrc} alt={badge.label} className="h-[32px] w-auto select-none" draggable={false} /></span>;
            }
            return <span key={t.id} className="Caption1 inline-flex items-center rounded-[20px] border border-[var(--ui-200)] bg-[var(--ui-100)] px-[10px] py-[6px] font-medium text-[var(--ui-800)]">{t.name}</span>;
          })}
          {techOverflow > 0 ? <span className="Label1 font-medium text-[var(--ui-400)]">+{techOverflow}</span> : null}
        </div>
      </div>
      <BookmarkButton bookmarked={bookmarked} onBookmarkChange={handleBookmark} stopPropagation className="absolute right-[24px] top-1/2 h-[52px] w-[52px] -translate-y-1/2" iconClassName="h-[32px] w-[32px]" colorIconClassName="h-[44px] w-[44px]" />
      {showMatchedReason && (
        <div className="absolute left-[24px] bottom-[32px] flex items-center justify-center rounded-[12px] bg-[var(--ui-100)] px-[12px] py-[8px]">
          <p className="Label1 font-medium text-[var(--ui-1000)]">
            <span className="text-[var(--badge-text-primary)]">[{matchedProjectName}]</span> {matchedReason}
          </p>
        </div>
      )}
    </article>
  );
}

function BookmarkLayout(props: DeveloperCardProps) {
  const { nickname, profileImageUrl, introduction, domains, techStackArray, bookmarked = false, onBookmarkChange, onClick } = props;
  const { theme } = useThemeStore();
  const maxChips = 5;

  const filteredTechStack = techStackArray?.filter((t) => !SKIP_TECH_NAMES.has(normalizeTechKey(t.name))) ?? [];
  const chips = filteredTechStack.slice(0, maxChips);
  const overflow = filteredTechStack.length - chips.length;

  return (
    <article
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
      className={`relative overflow-hidden rounded-[24px] bg-[var(--ui-bg)] h-[180px] max-w-[1180px] w-full border border-[var(--ui-200)] ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="absolute left-[20px] top-[calc(50%-40px)] flex -translate-y-1/2 items-center gap-[12px]">
        <div className="h-[56px] w-[56px] shrink-0 overflow-hidden rounded-full border-2 border-[var(--ui-200)] bg-[var(--ui-50)]">
          {profileImageUrl ? (
            <img src={profileImageUrl} alt={nickname} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[var(--ui-300)]">
              <AvatarIcon aria-hidden className="h-[56px] w-[56px]" />
            </div>
          )}
        </div>
        <div className="flex w-[394px] flex-col gap-[10px]">
          <div className="flex min-w-0 flex-col gap-[4px]">
            <p className="Body1 h-[26px] font-semibold text-[var(--ui-1000)]">{nickname}</p>
            <div className="flex flex-nowrap gap-[8px]">
              {domains?.slice(0, 3).map((d) => (
                <span key={d.label} className="Caption1 shrink-0 flex h-[24px] items-center justify-center rounded-[8px] bg-[var(--ui-100)] px-[6px] font-semibold text-[var(--ui-600)]">{d.label}</span>
              ))}
            </div>
          </div>
          <p className="Caption1 line-clamp-2 text-[var(--ui-600)]">{introduction}</p>
        </div>
      </div>
      <div className="absolute left-[518px] top-1/2 flex h-[76px] w-[360px] -translate-y-1/2 flex-wrap items-center gap-[4px]">
        {chips.map((t) => (
          <span key={t.id} className="inline-flex items-center">
            {(() => {
              const badge = findTechBadge(t.name);
              if (badge) {
                const offSrc = theme === 'dark' ? (badge.offDark ?? badge.off) : badge.off;
                return <img src={offSrc} alt={badge.label} className="h-[36px] w-auto select-none" draggable={false} />;
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
        {overflow > 0 ? <span className="Label1 font-medium text-[var(--ui-400)]">+{overflow}</span> : null}
      </div>
      <BookmarkButton bookmarked={bookmarked} onBookmarkChange={(next) => onBookmarkChange?.(next, nickname)} stopPropagation className="absolute right-[24px] top-1/2 h-[44px] w-[44px] -translate-y-1/2" iconClassName="h-[28px] w-[28px]" colorIconClassName="h-[36px] w-[36px]" />
    </article>
  );
}
