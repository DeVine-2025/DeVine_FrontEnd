import type { ReactNode, KeyboardEvent } from 'react';
import ProjectBase from './ProjectBase';
import DevineLogo from '@assets/images/Devine.svg';
import { cn } from '@libs/cn';
import type { ProjectCardProps } from '@t/project/ui';
import type { RecommendProjectCardProps } from '../../types/recommendProjectCard.types';

export type IntegratedProjectCardProps = ProjectCardProps &
  Partial<RecommendProjectCardProps> & {
    variant: 'grid' | 'list' | 'compact' | 'recommend';
    action?: ReactNode;
    showBookmark?: boolean;
    showDue?: boolean;
  };

export function ProjectCard({
  variant,
  action,
  showBookmark = true,
  showDue = true,
  ...props
}: IntegratedProjectCardProps) {
  // For 'grid' variant specific meta computation
  const gridMetaText = [props.location, props.durationRangeName, props.mode]
    .filter(Boolean)
    .join(' · ');
  const thumbnailAlt = props.thumbnailAlt ?? props.title;
  const hasThumbnail = Boolean(props.thumbnailUrl);

  // For 'recommend' variant specifics
  const handleClick =
    props.onNavigateToProject && props.projectId != null
      ? () => props.onNavigateToProject!(props.projectId!)
      : props.onClick;

  const handleBookmark =
    props.onBookmarkChangeById && props.projectId != null
      ? (next: boolean) => props.onBookmarkChangeById!(props.projectId!, next, props.bookmarkId)
      : props.onBookmarkChange;

  const hasSuitability =
    props.techstackScorePercent != null ||
    props.similarityScorePercent != null ||
    props.domainMatch != null ||
    props.totalScore != null;

  const suitabilityParts: string[] = [];
  if (props.techstackScorePercent != null) suitabilityParts.push(`기술스택 ${props.techstackScorePercent}%`);
  if (props.domainMatch != null) suitabilityParts.push(props.domainMatch ? '도메인 일치' : '도메인 불일치');
  if (props.similarityScorePercent != null) suitabilityParts.push(`리포트 ${props.similarityScorePercent}%`);
  if (props.totalScore != null) suitabilityParts.push(`종합 ${props.totalScore}`);
  const suitabilityText = suitabilityParts.join(' · ');
  const suitabilityHeight = 40;
  const cardHeight = hasSuitability && suitabilityText ? 180 + suitabilityHeight : 180;

  return (
    <ProjectBase
      {...props}
      onBookmarkChange={variant === 'recommend' ? handleBookmark : props.onBookmarkChange}
      onClick={variant === 'recommend' ? handleClick : props.onClick}
      render={(ui) => {
        if (variant === 'grid') {
          return (
            <article
              {...ui.CardActionProps}
              className={cn(
                'w-full min-w-0 overflow-hidden rounded-3xl border-0 bg-[var(--ui-bg)] shadow-none outline-none ring-0',
                props.onClick && 'cursor-pointer',
                props.className,
              )}
            >
              <div
                className={cn(
                  'group/thumb relative h-[180px] w-full overflow-hidden rounded-3xl border-0 shadow-none outline-none ring-0',
                  hasThumbnail ? 'bg-[#F3F5FC]' : 'bg-[var(--ui-200)]',
                )}
              >
                {hasThumbnail ? (
                  <img
                    src={props.thumbnailUrl}
                    alt={thumbnailAlt}
                    className="block h-full w-full object-cover transition-transform duration-300 ease-out group-hover/thumb:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <img
                      src={DevineLogo}
                      alt="Devine logo"
                      className="h-50 w-50 object-contain opacity-60 transition-transform duration-300 ease-out group-hover/thumb:scale-110"
                    />
                  </div>
                )}
                {showBookmark && (
                  <div className="main-project-card-bookmark absolute top-4 right-4 z-10">
                    {ui.Bookmark}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 px-6 py-5">
                <div className="flex gap-2">{ui.HeaderBadges}</div>
                <p className="line-clamp-2 font-semibold text-card-title text-xl">{props.title}</p>
                <p className="text-base text-card-muted">{gridMetaText}</p>
              </div>
            </article>
          );
        }

        if (variant === 'list') {
          return (
            <article
              {...ui.CardActionProps}
              className={cn(
                'flex h-[180px] w-full max-w-[1180px] items-center gap-8 overflow-hidden rounded-2xl border border-card-border bg-card-bg p-8',
                props.onClick && 'cursor-pointer recommend-card-hover-border',
                props.className,
              )}
            >
              {ui.Thumbnail}
              <div className="flex flex-1 flex-col justify-center gap-9">
                {ui.HeaderBadges}
                <div>{ui.Title}</div>
                {ui.Meta}
              </div>
              <div className="ml-auto flex shrink-0 items-center justify-end gap-17 pr-10">
                {ui.RolesLg}
                {showDue && props.dueLabel && <div className="flex text-center">{ui.Due}</div>}
                {action ? action : showBookmark ? ui.Bookmark : null}
              </div>
            </article>
          );
        }

        if (variant === 'compact') {
          return (
            <article
              {...ui.CardActionProps}
              className={cn(
                'flex h-[240px] w-[280px] shrink-0 flex-col gap-6 rounded-3xl bg-profile-card-bg px-9 py-7',
                props.onClick && 'cursor-pointer',
                props.className,
              )}
            >
              <div className="relative flex items-start justify-between">
                <div>{ui.HeaderBadges}</div>
                <div className="-top-2 -right-3 absolute">{ui.Bookmark}</div>
              </div>
              <div>{ui.Title}</div>
              <div>{ui.Meta}</div>
              <div className="my-1 h-px w-full bg-card-border" />
              <div>{ui.RolesMd}</div>
            </article>
          );
        }

        if (variant === 'recommend') {
          return (
            <article
              role={handleClick ? 'button' : undefined}
              tabIndex={handleClick ? 0 : undefined}
              onClick={handleClick}
              onKeyDown={
                handleClick
                  ? (e: KeyboardEvent<HTMLElement>) => {
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
                props.className
              )}
              style={{ height: cardHeight }}
            >
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
                    {props.dueLabel && (
                      <div className="flex shrink-0 justify-center text-center">{ui.Due}</div>
                    )}
                    {ui.Bookmark}
                  </div>
                </div>
              </div>
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

        return null;
      }}
    />
  );
}
