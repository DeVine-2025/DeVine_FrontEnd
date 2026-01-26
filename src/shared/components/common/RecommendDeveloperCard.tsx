import BookmarkFilledIcon from '@assets/icons/bookmark-filled.svg?react';
import PersonIcon from '@assets/icons/person.svg?react';
import { badgeToneToClass } from 'src/shared/types/badgeTone';

type RecommendDeveloperTech = {
  id: string;
  name: string;
  icon?: React.ReactNode;
};

export type RecommendDeveloperCardProps = {
  role: string;
  roleTone: keyof typeof badgeToneToClass;
  nickname: string;
  profileImageUrl?: string;
  introduction?: string;

  domains?: Array<{ label: string }>;
  techStack?: RecommendDeveloperTech[];

  matchedProjectName?: string;
  matchedReason?: string;

  bookmarked?: boolean;
  onBookmarkChange?: (next: boolean) => void;
  onClick?: () => void;
};

export default function RecommendDeveloperCard({
  role,
  roleTone,
  nickname,
  profileImageUrl,
  introduction,
  domains,
  techStack,
  matchedProjectName = 'A 프로젝트',
  matchedReason = '의 Java/Springboot 요구사항과 일치합니다.',
  bookmarked = false,
  onBookmarkChange,
  onClick,
}: RecommendDeveloperCardProps) {
  const maxChips = 5;
  const chips = techStack?.slice(0, maxChips) ?? [];
  const overflow = (techStack?.length ?? 0) - chips.length;

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
      className={`relative h-[248px] w-full max-w-[1280px] overflow-hidden rounded-[24px] bg-[var(--ui-bg)] ${
        onClick ? 'cursor-pointer' : ''
      }`}
      style={{
        border: '1px solid transparent',
        background:
          'linear-gradient(var(--ui-bg), var(--ui-bg)) padding-box, linear-gradient(90deg, rgba(114, 110, 255, 0.4) 0%, rgba(219, 80, 179, 0.4) 100%) border-box',
      }}
    >
      {/* 아바타 */}
      <div className="absolute left-[24px] top-[24px] h-[64px] w-[64px] overflow-hidden rounded-full border-2 border-[var(--ui-200)] bg-[var(--ui-50)]">
        {profileImageUrl ? (
          <img src={profileImageUrl} alt={nickname} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[var(--ui-300)]">
            <PersonIcon aria-hidden className="h-[28px] w-[28px]" />
          </div>
        )}
      </div>

      {/* 본문(좌) */}
      <div className="absolute left-[104px] top-[24px] flex h-[142px] w-[394px] flex-col gap-[12px]">
        <div className="flex w-[220px] flex-col gap-[8px]">
          <span
            className={`Label1 w-fit rounded-[8px] px-[8px] py-[4px] font-semibold ${badgeToneToClass[roleTone]}`}
          >
            {role}
          </span>

          <p className="Headline1 h-[26px] font-semibold text-[var(--ui-1000)]">{nickname}</p>

          <div className="flex flex-wrap gap-[8px]">
            {domains?.slice(0, 3).map((d) => (
              <span
                key={d.label}
                className="Label1 flex h-[28px] items-center justify-center rounded-[8px] bg-[var(--ui-100)] px-[8px] py-[4px] font-semibold text-[var(--ui-600)]"
              >
                {d.label}
              </span>
            ))}
          </div>
        </div>

        <p className="Caption1 line-clamp-2 text-[var(--ui-600)]">
          {introduction}
        </p>
      </div>

      {/* 스택(우) */}
      <div className="absolute left-[698px] top-[53px] flex h-[76px] w-[360px] flex-wrap items-center gap-[4px]">
        {chips.map((t) => (
          <span
            key={t.id}
            className="flex items-center gap-[8px] rounded-[24px] border border-[var(--ui-200)] bg-[var(--ui-100)] px-[12px] py-[8px]"
          >
            {t.icon ? <span className="h-[20px] w-[20px]">{t.icon}</span> : null}
            <span className="Caption1 font-medium text-[var(--ui-800)]">{t.name}</span>
          </span>
        ))}

        {overflow > 0 ? (
          <span className="Label1 font-medium text-[var(--ui-400)]">+{overflow}</span>
        ) : null}
      </div>

      {/* 북마크 */}
      <button
        type="button"
        aria-pressed={bookmarked}
        onClick={(e) => {
          e.stopPropagation();
          onBookmarkChange?.(!bookmarked);
        }}
        className="group absolute right-[24px] top-1/2 flex h-[60px] w-[60px] -translate-y-1/2 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ui-300)]"
      >
        <BookmarkFilledIcon
          aria-hidden
          className="h-[40px] w-[40px] text-[var(--ui-200)] transition-transform duration-200 ease-out group-hover:scale-105 group-active:scale-[0.98] group-hover:text-[var(--ui-300)]"
        />
      </button>

      {/* 하단 매칭 문구 */}
      <div className="absolute left-[24px] top-[182px] flex items-center justify-center rounded-[12px] bg-[var(--ui-100)] px-[12px] py-[8px]">
        <p className="Headline1 font-medium text-[var(--ui-1000)]">
          <span className="text-[var(--badge-text-primary)]">[{matchedProjectName}]</span>
          {matchedReason}
        </p>
      </div>
    </article>
  );
}

