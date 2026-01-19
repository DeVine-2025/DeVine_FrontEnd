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

export type RoleItem = {
  key: string;
  label: string;
  tone: BadgeTone;
  current: number;
  total: number;
  techStack?: TechStackItem[];
};

export type SuggetsedProjectProps = {
  id?: string;

  thumbnailUrl?: string;
  thumbnailAlt?: string;

  categoryLabels?: string[]; // 예: ['모바일/앱', '라이프스타일']
  title: string;
  location?: string;
  period?: string;
  mode?: string;

  roles?: RoleItem[];

  techSuitability?: number; // 기술 적합도 (1-5)
  domainSuitability?: number; // 도메인 적합도 (1-5)
  growthPotential?: number; // 성장 가능성 (1-5)
  overallScore?: number; // 종합 점수
  deadlineText?: string; // 마감일 텍스트 (예: "오늘 마감")

  bookmarked?: boolean;
  onBookmarkChange?: (next: boolean, id?: string) => void;

  className?: string;
};

const badgeToneToClass: Record<BadgeTone, string> = {
  blue: 'bg-badge-bg-blue text-badge-text-blue',
  green: 'bg-badge-bg-green text-badge-text-green',
  pink: 'bg-badge-bg-pink text-badge-text-pink',
  orange: 'bg-badge-bg-orange text-badge-text-orange',
};

const SuggetsedProject = ({
  id,
  thumbnailUrl,
  thumbnailAlt,
  categoryLabels,
  title,
  location,
  period,
  mode,
  roles,
  techSuitability,
  domainSuitability,
  growthPotential,
  overallScore,
  deadlineText,
  bookmarked = false,
  onBookmarkChange,
  className,
}: SuggetsedProjectProps) => {
  const meta = [location, period, mode].filter(Boolean).join(' · ');

  return (
    <article
      className={cn(
        'relative bg-[var(--ui-bg)] border border-[var(--badge-text-primary)] rounded-[24px] h-[270px] w-full max-w-[1280px] p-8',
        className,
      )}
    >
      {/* 프로젝트 이미지 */}
      <div className="absolute left-8 top-8 rounded-xl size-[148px] overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={thumbnailAlt ?? title}
            className="size-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="size-full bg-[var(--ui-100)]" />
        )}
      </div>

      {/* 프로젝트 정보 영역 */}
      <div className="absolute left-[200px] top-8 flex flex-col gap-4 w-[448px]">
        {/* 카테고리 배지들 */}
        {categoryLabels && categoryLabels.length > 0 && (
          <div className="flex gap-1 items-center">
            {categoryLabels.map((label, idx) => (
              <span
                key={idx}
                className="bg-[var(--ui-100)] rounded-lg px-2 py-1 Label1 text-[var(--ui-600)]"
              >
                {label}
              </span>
            ))}
          </div>
        )}

        {/* 프로젝트 제목 */}
        <h3 className="Heading2 text-[var(--ui-1000)] leading-[1.4] tracking-[-0.24px]">
          {title}
        </h3>

        {/* 메타 정보 (위치 · 기간 · 모드) */}
        {meta && (
          <p className="Label1 text-[var(--ui-600)] tracking-[0.203px]">
            {meta}
          </p>
        )}
      </div>

      {/* 역할 정보 영역 */}
      {roles && roles.length > 0 && (
        <div className="absolute left-[calc(50%+88px)] top-8 flex flex-col gap-3 w-[202px]">
          {roles.map((role) => (
            <div key={role.key} className="flex gap-3 items-center">
              {/* 역할 배지 */}
              <span
                className={cn(
                  'inline-flex rounded-lg px-2 py-1 Label1',
                  badgeToneToClass[role.tone],
                )}
              >
                {role.label}
              </span>

              {/* 인원 수 및 기술 스택 */}
              <div className="flex gap-3 items-center">
                {/* 인원 수 */}
                <div className="flex gap-1 items-center">
                  <span className="Label1 text-[var(--ui-400)]">👤</span>
                  <span className="Label1 text-[var(--ui-700)] font-medium">
                    {role.current}/{role.total}
                  </span>
                </div>

                {/* 구분선 */}
                <span className="h-4 w-px bg-[var(--ui-200)]" />

                {/* 기술 스택 아이콘 */}
                {role.techStack && role.techStack.length > 0 && (
                  <div className="flex gap-1 items-center">
                    {role.techStack.map((tech) => (
                      <span key={tech.id} className="size-5">
                        {tech.icon}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 마감일 텍스트 */}
      {deadlineText && (
        <div className="absolute left-[calc(75%+56px)] top-[72px] flex items-center justify-center w-[100px] h-[148px]">
          <p className="Headline1 text-[var(--ui-400)] text-center leading-[1.445]">
            {deadlineText}
          </p>
        </div>
      )}

      {/* 북마크 아이콘 */}
      <button
        type="button"
        aria-pressed={bookmarked}
        onClick={() => onBookmarkChange?.(!bookmarked, id)}
        className="absolute left-[calc(87.5%+76px)] top-[120px] size-[52px] flex items-center justify-center"
      >
        {bookmarked ? (
          <BookmarkFilled aria-hidden="true" className="size-[52px] text-[var(--ui-700)]" />
        ) : (
          <BookmarkIcon aria-hidden="true" className="size-[52px] text-[var(--ui-700)]" />
        )}
      </button>

      {/* 하단 추천 정보 박스 */}
      {(techSuitability !== undefined ||
        domainSuitability !== undefined ||
        growthPotential !== undefined ||
        overallScore !== undefined) && (
        <div className="absolute left-8 bottom-8 bg-[var(--ui-100)] rounded-xl px-12 py-8 w-[calc(100%-64px)]">
          <p className="Headline1 text-[var(--ui-1000)] leading-[1.445] tracking-[-0.0036px]">
            {techSuitability !== undefined && `기술 적합도 : ${techSuitability}/5`}
            {domainSuitability !== undefined && `, 도메인 적합도 : ${domainSuitability}/5`}
            {growthPotential !== undefined && `, 성장 가능성 : ${growthPotential}/5`}
            {overallScore !== undefined && ` 종합 점수: ${overallScore}`}
          </p>
        </div>
      )}
    </article>
  );
};

export default SuggetsedProject;
