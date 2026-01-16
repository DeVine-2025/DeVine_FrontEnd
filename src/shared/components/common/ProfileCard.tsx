import BookmarkIcon from '@assets/icons/bookmark.svg?react';
import BookmarkFilled from '@assets/icons/bookmark-filled.svg?react';
import { cn } from '@libs/cn';
import type { ReactNode } from 'react';

export type BadgeTone = 'blue' | 'green' | 'pink' | 'orange';

export type TechStackItem = {
  id: string;
  name: string;
  icon?: ReactNode;
};

export type ProfileCardProps = {
  role: string;
  roleTone?: BadgeTone;
  nickname: string;
  profileImageUrl: string;
  profileImageAlt?: string;
  id?: string;

  location?: string;
  experience?: string;

  introduction?: string;
  recommendationReason?: string;

  badges?: Array<{ label: string; tone: BadgeTone }>;
  techStack?: TechStackItem[];

  bookmarked?: boolean;
  onBookmarkChange?: (next: boolean, id?: string) => void;

  size?: 'sm' | 'md';
  className?: string;
};

const badgeToneToClass: Record<BadgeTone, string> = {
  blue: 'bg-badge-bg-blue text-badge-text-blue',
  green: 'bg-badge-bg-green text-badge-text-green',
  pink: 'bg-badge-bg-pink text-badge-text-pink',
  orange: 'bg-badge-bg-orange text-badge-text-orange',
};

export default function ProfileCard({
  role,
  roleTone,
  nickname,
  profileImageUrl,
  profileImageAlt,
  id,
  location,
  experience,
  introduction,
  recommendationReason,
  badges,
  techStack,
  bookmarked = false,
  onBookmarkChange,
  size = 'md',
  className,
}: ProfileCardProps) {
  const normalize = (s: string) => (s ?? '').replace(/\s+/g, '').toLowerCase();

  const rootSizeClass = size === 'sm' ? 'card-size-sm' : 'card-container-md card-size-md';
  const avatarClass = size === 'sm' ? 'card-avatar-sm' : 'card-avatar-md';

  const meta =
    location && experience ? `${location} | ${experience}` : location || experience || '';

  // 역할 배지와 중복되는 항목은 배지 리스트에서 제거
  const filteredBadges = badges?.filter(({ label }) => normalize(label) !== normalize(role));

  return (
    <article
      className={cn(
        'flex flex-col rounded-2xl border border-transparent bg-profile-card-bg',
        rootSizeClass,
        className,
      )}
    >
      {/* 상단 영역 */}
      <div className="flex items-start gap-4">
        <img
          src={profileImageUrl}
          alt={profileImageAlt ?? nickname}
          className={cn(avatarClass, 'flex-shrink-0 rounded-full object-cover')}
          loading="lazy"
        />

        <div className="min-w-0 flex-1">
          {/* 역할 배지 */}
          {role && roleTone && (
            <span
              className={cn(
                'Label1 inline-flex rounded-full px-3 py-1',
                // 역할 배지 톤은 서버 값(roleTone) 사용, 없으면 배지 미표시
                badgeToneToClass[roleTone],
              )}
            >
              {role}
            </span>
          )}

          {/* 닉네임 */}
          <div className="Title2 mt-2 truncate text-card-title">{nickname}</div>

          {/* 메타(지역 | 경력) */}
          {meta && <div className="Label1 mt-1 truncate text-card-muted">{meta}</div>}
        </div>

        {/* 북마크 버튼 */}
        <button
          type="button"
          aria-pressed={bookmarked}
          onClick={() => onBookmarkChange?.(!bookmarked, id)}
          className="ml-auto rounded-md p-1 hover:opacity-80"
        >
          {bookmarked ? (
            <BookmarkFilled aria-hidden="true" className="h-10 w-13 text-card-title" />
          ) : (
            <BookmarkIcon aria-hidden="true" className="h-10 w-13 text-card-muted" />
          )}
        </button>
      </div>

      {/* 소개 */}
      {introduction && <p className="Body1 line-clamp-2 text-card-text">{introduction}</p>}

      {/* 배지 리스트(포지션/프로젝트 등) */}
      {filteredBadges && filteredBadges.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {filteredBadges.map(({ label, tone }, idx) => (
            <span
              key={`${label}-${idx}`}
              className={cn('Label1 rounded-full px-3 py-1', badgeToneToClass[tone])}
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* 스킬 */}
      {techStack && techStack.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {techStack.map((s) => (
            <div key={s.id} className="flex items-center gap-1">
              {s.icon}
              <span className="Label1 text-card-text">{s.name}</span>
            </div>
          ))}
        </div>
      )}

      {(recommendationReason ?? '') !== '' && <div className="border-divider border-t" />}

      {/* 추천 이유 */}
      {recommendationReason && (
        <div className="rounded-xl bg-card-profile-reason-bg p-10">
          <p className="Body1 text-card-title">{recommendationReason}</p>
        </div>
      )}
    </article>
  );
}
