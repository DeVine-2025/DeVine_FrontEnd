import { memo } from 'react';
import BookmarkButton from '@components/common/BookmarkButton';
import AvatarIcon from '@assets/icons/avatar.svg?react';
import { badgeToneToClass } from 'src/shared/types/badgeTone';
import { useThemeStore } from '@store/theme';
import {
  BACKEND_DATABASE,
  BACKEND_FRAMEWORK,
  BACKEND_LANGUAGE,
  FRONTEND_LANGUAGE_FRAMEWORK,
  FRONTEND_MOBILE,
  INFRA_CLOUD,
  INFRA_CONTAINER,
  type TechStackChip,
} from '@constants/position-tech-stack';

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
  /** 메모/안정 콜백용 */
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
};

function RecommendDeveloperCard({
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
  memberId,
  bookmarkId,
  listItemId,
  onBookmarkChangeById,
  onClick,
}: RecommendDeveloperCardProps) {
  const handleBookmark =
    onBookmarkChangeById && memberId != null && listItemId != null
      ? (next: boolean) => onBookmarkChangeById(memberId, listItemId, next, bookmarkId)
      : onBookmarkChange;
  const { theme } = useThemeStore();
  const maxChips = 5;
  const chips = techStack?.slice(0, maxChips) ?? [];
  const overflow = (techStack?.length ?? 0) - chips.length;

  const normalizeTechKey = (v: string) =>
    v
      .trim()
      .toLowerCase()
      .replace(/\s/g, '')
      .replace(/\./g, '')
      .replace(/-/g, '')
      .replace(/_/g, '');

  const ALL_TECH_STACK_BADGES: Array<Extract<TechStackChip, { off: string; on: string }>> = [
    ...FRONTEND_LANGUAGE_FRAMEWORK,
    ...FRONTEND_MOBILE,
    ...BACKEND_LANGUAGE,
    ...BACKEND_FRAMEWORK,
    ...BACKEND_DATABASE,
    ...INFRA_CLOUD,
    ...INFRA_CONTAINER,
  ].filter((b): b is Extract<TechStackChip, { off: string; on: string }> => 'off' in b && 'on' in b);

  const TECH_BADGE_BY_NAME = new Map<string, Extract<TechStackChip, { off: string; on: string }>>(
    ALL_TECH_STACK_BADGES.flatMap((b: Extract<TechStackChip, { off: string; on: string }>) => [
      [normalizeTechKey(b.key), b],
      [normalizeTechKey(b.label), b],
    ]),
  );

  const findBadge = (name: string) => {
    const normalized = normalizeTechKey(name);
    // 목데이터/백엔드에서 들어올 수 있는 표기 흔들림 대응
    const alias = normalized
      .replace(/typescript/g, 'typescript')
      .replace(/nextjs/g, 'nextjs')
      .replace(/nodejs/g, 'nodejs')
      .replace(/reactnative/g, 'reactnative');
    return TECH_BADGE_BY_NAME.get(alias) ?? TECH_BADGE_BY_NAME.get(normalized) ?? null;
  };

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
      className={`relative h-[236px] w-full max-w-[1280px] overflow-hidden rounded-[24px] bg-[var(--ui-bg)] ${
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
            <AvatarIcon aria-hidden className="h-[64px] w-[64px]" />
          </div>
        )}
      </div>

      {/* 본문(좌) */}
      <div className="absolute left-[104px] top-[24px] flex h-[142px] w-[394px] flex-col gap-[12px]">
        <div className="flex w-[220px] flex-col gap-[8px]">
          <span
            className={`Caption1 inline-flex h-[24px] w-fit items-center rounded-[8px] px-[6px] font-semibold ${badgeToneToClass[roleTone]}`}
          >
            {role}
          </span>

          <p className="Body1 h-[26px] font-semibold text-[var(--ui-1000)]">{nickname}</p>

          <div className="flex flex-wrap gap-[8px]">
            {domains?.slice(0, 3).map((d) => (
              <span
                key={d.label}
                className="Caption1 flex h-[24px] items-center justify-center rounded-[8px] bg-[var(--ui-100)] px-[6px] font-semibold text-[var(--ui-600)]"
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
      <div className="absolute left-[698px] top-[50px] flex h-[76px] w-[360px] flex-wrap items-center gap-[4px]">
        {chips.map((t) => (
          <span key={t.id} className="inline-flex items-center">
            {(() => {
              const badge = findBadge(t.name);
              if (badge) {
                // 추천 카드의 기술스택은 "선택 상태"가 아니므로 Off 배지를 사용
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

              // 에셋이 없는 항목(Figma 등)은 기존 pill fallback
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
        onBookmarkChange={handleBookmark}
        stopPropagation
        className="absolute right-[24px] top-1/2 h-[52px] w-[52px] -translate-y-1/2"
        iconClassName="h-[32px] w-[32px]"
        colorIconClassName="h-[44px] w-[44px]"
      />

      {/* 하단 매칭 문구 */}
      <div className="absolute left-[24px] top-[172px] flex items-center justify-center rounded-[12px] bg-[var(--ui-100)] px-[12px] py-[8px]">
        <p className="Label1 font-medium text-[var(--ui-1000)]">
          <span className="text-[var(--badge-text-primary)]">[{matchedProjectName}]</span>
          {matchedReason}
        </p>
      </div>
    </article>
  );
}

export default memo(RecommendDeveloperCard);

