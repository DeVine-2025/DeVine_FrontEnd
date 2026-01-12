import { cn } from '@libs/cn';
import type { ReactNode } from 'react';
import BookmarkIcon from '@assets/icons/bookmark.svg?react';
import BookmarkFilled from '@assets/icons/bookmark-filled.svg?react';

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

  const rootSizeClass =
    size === 'sm' ? 'card-size-sm' : 'card-container-md card-size-md';
  const avatarClass = size === 'sm' ? 'card-avatar-sm' : 'card-avatar-md';

  const meta =
    location && experience
      ? `${location} | ${experience}`
      : location || experience || '';

  // 역할 배지와 중복되는 항목은 배지 리스트에서 제거
  const filteredBadges = badges?.filter(({ label }) => normalize(label) !== normalize(role));

  return (
    <article
      className={cn(
        'bg-profile-card-bg rounded-2xl flex flex-col border border-transparent',
        rootSizeClass,
        className,
      )}
    >
      {/* 상단 영역 */}
      <div className="flex items-start gap-4">
        <img
          src={profileImageUrl}
          alt={profileImageAlt ?? nickname}
          className={cn(avatarClass, 'rounded-full object-cover flex-shrink-0')}
          loading="lazy"
        />

        <div className="flex-1 min-w-0">
          {/* 역할 배지 */}
          {role && roleTone && (
            <span
              className={cn(
                'inline-flex rounded-full px-3 py-1 Label1',
                // 역할 배지 톤은 서버 값(roleTone) 사용, 없으면 배지 미표시
                badgeToneToClass[roleTone],
              )}
            >
              {role}
            </span>
          )}

          {/* 닉네임 */}
          <div className="mt-2 Title2 text-card-title truncate">{nickname}</div>

          {/* 메타(지역 | 경력) */}
          {meta && <div className="Label1 text-card-muted mt-1 truncate">{meta}</div>}
        </div>

        {/* 북마크 버튼 */}
        <button
          type="button"
          aria-pressed={bookmarked}
          onClick={() => onBookmarkChange?.(!bookmarked, id)}
          className="ml-auto p-1 rounded-md hover:opacity-80"
        >
          {bookmarked ? (
            <BookmarkFilled aria-hidden="true" className="w-13 h-10 text-card-title" />
          ) : (
            <BookmarkIcon aria-hidden="true" className="w-13 h-10 text-card-muted" />
          )}
        </button>
      </div>

      {/* 소개 */}
      {introduction && (
        <p className="Body1 text-card-text line-clamp-2">{introduction}</p>
      )}

      {/* 배지 리스트(포지션/프로젝트 등) */}
      {filteredBadges && filteredBadges.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {filteredBadges.map(({ label, tone }, idx) => (
            <span
              key={`${label}-${idx}`}
              className={cn('rounded-full px-3 py-1 Label1', badgeToneToClass[tone])}
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

      {(recommendationReason ?? '') !== '' && (
        <div className="border-t border-divider" />
      )}

      {/* 추천 이유 */}
      {recommendationReason && (
        <div className="bg-card-profile-reason-bg rounded-xl p-10">
          <p className="Body1 text-card-title">{recommendationReason}</p>
        </div>
      )}
    </article>
  );
}