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
  const sizeStyles =
    size === 'sm'
      ? { avatar: 'w-12 h-12', padding: 'p-4', gap: 'gap-3' }
      : { avatar: 'w-14 h-14', padding: 'p-6', gap: 'gap-4' };

  const meta =
    location && experience
      ? `${location} | ${experience}`
      : location || experience || '';

  return (
    <article
      className={cn(
        'bg-card-bg border border-card-border rounded-2xl shadow-sm flex flex-col',
        sizeStyles.padding,
        sizeStyles.gap,
        className,
      )}
    >
      {/* 상단 영역 */}
      <div className={cn('flex items-start', sizeStyles.gap)}>
        <img
          src={profileImageUrl}
          alt={profileImageAlt ?? nickname}
          className={cn(sizeStyles.avatar, 'rounded-full object-cover flex-shrink-0')}
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

        {/* 북마크 버튼(아이콘은 팀 에셋으로 교체) */}
        <button
          type="button"
          aria-pressed={bookmarked}
          onClick={() => onBookmarkChange?.(!bookmarked, id)}
          className="ml-auto p-1 rounded-md hover:opacity-80"
        >
          {/* 아이콘 자리 */}
          <span className="Label1 text-card-muted">{bookmarked ? '★' : '☆'}</span>
        </button>
      </div>

      {/* 소개 */}
      {introduction && (
        <p className="Body1 text-card-text line-clamp-2">{introduction}</p>
      )}

      {/* 배지 리스트(포지션/프로젝트 등) */}
      {badges && badges.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {badges.map(({ label, tone }, idx) => (
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

      {/* 구분선 */}
      {(recommendationReason ?? '') !== '' && (
        <div className="border-t border-divider" />
      )}

      {/* 추천 이유 */}
      {recommendationReason && (
        <div className="bg-card-profile-reason-bg rounded-xl p-4">
          <p className="Body1 text-card-title">{recommendationReason}</p>
        </div>
      )}
    </article>
  );
}