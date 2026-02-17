import BookmarkButton from '@components/common/BookmarkButton';
import { cn } from '@libs/cn';
import type { ProfileCardProps } from '../../types/profileCard.types';
import { BadgeList, Intro, TechChips } from './ProfileBase';

export default function ProfileCardLg(props: ProfileCardProps) {
  const {
    role: _role,
    roleTone: _roleTone,
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
        'rounded-2xl border border-card-border bg-card-bg transition-all duration-300',
        'card-size-lg flex flex-col',
        header && 'card-size-lg--with-header',
        onClick && 'cursor-pointer recommend-card-hover-border',
        className,
      )}
    >
      {header ? <div className="">{header}</div> : null}
      <div className="flex min-h-0 flex-1 items-center gap-9">
        <img
          src={profileImageUrl}
          alt={profileImageAlt ?? nickname}
          className={cn(
            'card-avatar-sm',
            'shrink-0 rounded-full object-cover ring-2 ring-white/10',
          )}
          loading="lazy"
        />

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
