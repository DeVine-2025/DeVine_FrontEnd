import BookmarkButton from '@components/common/BookmarkButton';
import { cn } from '@libs/cn';
import { badgeToneToClass } from '../../types/badgeTone';
import type { ProfileCardProps } from '../../types/profileCard.types';
import { BadgeList, Intro, TechChips } from './ProfileBase';

export default function ProfileCardLg(props: ProfileCardProps) {
  const {
    role,
    roleTone,
    nickname,
    profileImageUrl,
    profileImageAlt,
    id,
    bookmarked = false,
    onBookmarkChange,
    badges,
    introduction,
    techStack,
    action,
    className,
    header,
    onClick,
  } = props;

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
      className={cn(
        'rounded-2xl border border-card-border bg-card-bg',
        'card-size-lg',
        header && 'card-size-lg--with-header',
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {header ? <div className="">{header}</div> : null}
      <div className="flex items-stretch gap-7">
        <img
          src={profileImageUrl}
          alt={profileImageAlt ?? nickname}
          className={cn(
            'card-avatar-sm',
            'shrink-0 self-start rounded-full object-cover ring-2 ring-white/10',
          )}
          loading="lazy"
        />

        <div className="flex min-w-0 flex-1 flex-col gap-5">
          {role && roleTone && (
            <span
              className={cn(
                'inline-flex w-fit items-center whitespace-nowrap rounded-lg px-3 py-1 font-semibold text-lg',
                badgeToneToClass[roleTone],
              )}
            >
              {role}
            </span>
          )}

          <div className="truncate pl-1 font-semibold text-2xl text-card-title">{nickname}</div>

          <BadgeList badges={badges} className="gap-4" />

          <Intro introduction={introduction} />
        </div>

        <div className="flex h-full w-[240px] self-center">
          <TechChips techStack={techStack} max={5} />
        </div>

        <div className="ml-auto flex h-full self-center pr-5">
          {action ?? (
            <BookmarkButton
              bookmarked={bookmarked}
              onBookmarkChange={(next) => onBookmarkChange?.(next, id)}
              stopPropagation={false}
              className="inline-flex"
              iconClassName="h-[30px] w-[30px]"
              colorIconClassName="h-[44px] w-[44px]"
            />
          )}
        </div>
      </div>
    </article>
  );
}
