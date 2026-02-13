import { memo } from 'react';
import BookmarkButton from '@components/common/BookmarkButton';
import AvatarIcon from '@assets/icons/avatar.svg?react';
import { useThemeStore } from '@store/theme';
import type { BadgeTone } from '@t/badgeTone';
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
  roleTone?: BadgeTone;
  nickname: string;
  profileImageUrl?: string;
  introduction?: string;

  domains?: Array<{ label: string }>;
  techStack?: RecommendDeveloperTech[];

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
  /** 저장한 개발자용: 단순 테두리 + 원래 크기(180px), 적합도 문구는 showMatchedReason=false 로 별도 제어 */
  variant?: 'recommend' | 'bookmark';
  /** 테두리: gradient(기본) | gray(저장한 개발자 등) */
  borderStyle?: 'gradient' | 'gray';
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
  variant = 'recommend',
  borderStyle,
}: RecommendDeveloperCardProps) {
  const handleClick =
    onNavigateToDeveloper && nickname
      ? () => onNavigateToDeveloper(nickname)
      : onClick;

  const handleBookmark =
    onBookmarkChangeById && listItemId != null
      ? (next: boolean) => onBookmarkChangeById(memberId ?? 0, listItemId, next, bookmarkId)
      : onBookmarkChange;
  const { theme } = useThemeStore();
  const maxChips = 5;
  const normalizeTechKey = (v: unknown): string => {
    const s = typeof v === 'string' ? v : v != null ? String(v) : '';
    return s
      .trim()
      .toLowerCase()
      .replace(/\s/g, '')
      .replace(/\./g, '')
      .replace(/-/g, '')
      .replace(/_/g, '');
  };

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

  const findBadge = (name: unknown) => {
    const normalized = normalizeTechKey(name);
    const alias = normalized
      .replace(/^spring$/g, 'springboot')
      .replace(/typescript/g, 'typescript')
      .replace(/nextjs/g, 'nextjs')
      .replace(/nodejs/g, 'nodejs')
      .replace(/reactnative/g, 'reactnative');
    return TECH_BADGE_BY_NAME.get(alias) ?? TECH_BADGE_BY_NAME.get(normalized) ?? null;
  };

  const SKIP_TECH_NAMES = new Set([
    'backend',
    'frontend',
    'infra',
    '백엔드',
    '프론트엔드',
    '프런트엔드',
    '인프라',
  ]);
  const filteredTechStack =
    techStack?.filter((t) => !SKIP_TECH_NAMES.has(normalizeTechKey(t.name))) ?? [];
  const chips = filteredTechStack.slice(0, maxChips);
  const overflow = filteredTechStack.length - chips.length;

  const isBookmark = variant === 'bookmark';
  const useGrayBorder = borderStyle === 'gray' || isBookmark;
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
      className={`relative overflow-hidden rounded-[24px] bg-[var(--ui-bg)] ${
        isBookmark
          ? 'h-[180px] max-w-[1180px] w-full'
          : useGrayBorder
            ? 'h-[192px] w-full max-w-[1280px]'
            : 'h-[236px] w-full max-w-[1280px]'
      } ${useGrayBorder ? 'border border-[var(--ui-200)]' : ''} ${handleClick ? 'cursor-pointer' : ''}`}
      style={
        useGrayBorder
          ? undefined
          : {
              border: '1px solid transparent',
              background:
                'linear-gradient(var(--ui-bg), var(--ui-bg)) padding-box, linear-gradient(90deg, rgba(114, 110, 255, 0.4) 0%, rgba(219, 80, 179, 0.4) 100%) border-box',
            }
      }
    >
      {/* 아바타 - 저장한 개발자(회색 테두리)일 때 세로 중앙 */}
      <div
        className={`absolute overflow-hidden rounded-full border-2 border-[var(--ui-200)] bg-[var(--ui-50)] ${
          useGrayBorder && !isBookmark
            ? 'left-[24px] top-[calc(50%-12px)] h-[64px] w-[64px] -translate-y-1/2'
            : isBookmark
              ? 'left-[20px] top-[20px] h-[56px] w-[56px]'
              : 'left-[24px] top-[24px] h-[64px] w-[64px]'
        }`}
      >
        {profileImageUrl ? (
          <img src={profileImageUrl} alt={nickname} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[var(--ui-300)]">
            <AvatarIcon aria-hidden className={isBookmark ? 'h-[56px] w-[56px]' : 'h-[64px] w-[64px]'} />
          </div>
        )}
      </div>

      {/* 본문(좌) - 저장한 개발자(회색 테두리)일 때 세로 중앙 */}
      <div
        className={`absolute flex flex-col w-[394px] ${
          useGrayBorder
            ? 'left-[104px] top-[calc(50%-12px)] -translate-y-1/2 gap-[22px]'
            : isBookmark
              ? 'left-[88px] top-[20px] gap-[10px]'
              : 'left-[104px] top-[24px] gap-[22px]'
        }`}
      >
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

        <p className="Caption1 line-clamp-2 text-[var(--ui-600)]">
          {introduction}
        </p>
      </div>

      {/* 스택(우) - 카드 세로 중앙 */}
      <div
        className={`absolute top-1/2 flex h-[76px] w-[360px] -translate-y-1/2 flex-wrap items-center gap-[4px] ${
          isBookmark ? 'left-[518px]' : 'left-[698px]'
        }`}
      >
        {chips.map((t) => (
          <span key={t.id} className="inline-flex items-center">
            {(() => {
              const badge = findBadge(t.name);
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
        onBookmarkChange={handleBookmark}
        stopPropagation
        className={`absolute right-[24px] top-1/2 -translate-y-1/2 ${isBookmark ? 'h-[44px] w-[44px]' : 'h-[52px] w-[52px]'}`}
        iconClassName={isBookmark ? 'h-[28px] w-[28px]' : 'h-[32px] w-[32px]'}
        colorIconClassName={isBookmark ? 'h-[36px] w-[36px]' : 'h-[44px] w-[44px]'}
      />

      {showMatchedReason && (
        <div className="absolute left-[24px] top-[172px] flex items-center justify-center rounded-[12px] bg-[var(--ui-100)] px-[12px] py-[8px]">
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

