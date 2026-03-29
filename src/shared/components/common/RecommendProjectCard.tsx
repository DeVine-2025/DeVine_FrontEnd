import ProjectBase from '@components/common/ProjectBase';
import { cn } from '@libs/cn';
import { memo } from 'react';
import type { RecommendProjectCardProps } from 'src/shared/types/recommendProjectCard.types';

function RecommendProjectCard({
  categoryLabel,
  deadlineLabel,
  thumbnailUrl,
  thumbnailAlt,
  title,
  location,
  period,
  mode,
  roles,
  dueLabel,
  bookmarked = false,
  onBookmarkChange,
  projectId,
  bookmarkId,
  onBookmarkChangeById,
  onClick,
  onNavigateToProject,
  techstackScorePercent,
  similarityScorePercent,
  domainMatch,
  totalScore,
}: RecommendProjectCardProps) {
  const handleClick =
    onNavigateToProject && projectId != null ? () => onNavigateToProject(projectId) : onClick;

  const handleBookmark =
    onBookmarkChangeById && projectId != null
      ? (next: boolean) => onBookmarkChangeById(projectId, next, bookmarkId)
      : onBookmarkChange;

  const hasSuitability =
    techstackScorePercent != null ||
    similarityScorePercent != null ||
    domainMatch != null ||
    totalScore != null;

  const suitabilityParts: string[] = [];
  if (techstackScorePercent != null) suitabilityParts.push(`기술스택 ${techstackScorePercent}%`);
  if (domainMatch != null) suitabilityParts.push(domainMatch ? '도메인 일치' : '도메인 불일치');
  if (similarityScorePercent != null) suitabilityParts.push(`리포트 ${similarityScorePercent}%`);
  if (totalScore != null) suitabilityParts.push(`종합 ${totalScore}`);
  const suitabilityText = suitabilityParts.join(' · ');

  const suitabilityHeight = 40;
  const cardHeight = hasSuitability && suitabilityText ? 180 + suitabilityHeight : 180;

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
      className={cn(
        'group relative flex w-full max-w-[1180px] flex-col overflow-hidden rounded-2xl border border-[var(--ui-200)] bg-[var(--ui-bg)]',
        handleClick && 'recommend-card-hover-border cursor-pointer',
      )}
      style={{ height: cardHeight }}
    >
      <ProjectBase
        categoryLabel={categoryLabel}
        deadlineLabel={deadlineLabel}
        thumbnailUrl={thumbnailUrl}
        thumbnailAlt={thumbnailAlt}
        title={title}
        location={location}
        durationRangeName={period}
        mode={mode}
        roles={roles}
        dueLabel={dueLabel}
        bookmarked={bookmarked}
        onBookmarkChange={handleBookmark}
        render={(ui) => (
          <div className="flex h-[180px] w-full items-center gap-10 overflow-hidden px-8 py-6">
            {ui.Thumbnail}

            <div className="flex min-w-0 flex-1 flex-col justify-center gap-6">
              {ui.HeaderBadges}
              <div>{ui.Title}</div>
              {ui.Meta}
            </div>

            <div className="mr-2 ml-auto flex w-[340px] shrink-0 items-center gap-4">
              <div className="min-w-0 flex-1">{ui.RolesLg}</div>
              <div className="flex shrink-0 items-center gap-12">
                {dueLabel && (
                  <div className="flex shrink-0 justify-center text-center">{ui.Due}</div>
                )}
                {ui.Bookmark}
              </div>
            </div>
          </div>
        )}
      />

      {hasSuitability && suitabilityText ? (
        <div className="flex shrink-0 items-center border-[var(--ui-200)] border-t px-8 py-4">
          <p className="font-medium text-[12px] text-[var(--ui-500)] tracking-tight">
            {suitabilityText}
          </p>
        </div>
      ) : null}
    </article>
  );
}

export default memo(RecommendProjectCard);
