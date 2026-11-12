import { cn } from '@libs/cn';
import type { ProjectCardProps } from '@t/project/ui';
import type { ReactNode } from 'react';
import ProjectBase from './ProjectBase';

type ProjectLgProps = ProjectCardProps & {
  action?: ReactNode;
  showBookmark?: boolean;
  showDue?: boolean;
};

export default function ProjectLg({
  action,
  showBookmark = true,
  showDue = true,
  ...props
}: ProjectLgProps) {
  return (
    <ProjectBase
      {...props}
      render={(ui) => (
        <article
          {...ui.CardActionProps}
          className={cn(
            'flex h-[180px] w-full max-w-[1180px] items-center gap-8 overflow-hidden rounded-2xl border border-card-border bg-card-bg p-8 lg:max-2xl:h-[156px] lg:max-2xl:gap-6 lg:max-2xl:p-6',
            props.onClick && 'cursor-pointer recommend-card-hover-border',
            props.className,
          )}
        >
          {ui.Thumbnail}

          <div className="flex flex-1 flex-col justify-center gap-9 lg:max-2xl:gap-6">
            {ui.HeaderBadges}
            <div>{ui.Title}</div>
            {ui.Meta}
          </div>

          <div className="ml-auto flex shrink-0 items-center justify-end gap-17 pr-10 lg:max-2xl:gap-6 lg:max-2xl:pr-4">
            {ui.RolesLg}
            {showDue && props.dueLabel && <div className="flex text-center">{ui.Due}</div>}
            {action ? action : showBookmark ? ui.Bookmark : null}
          </div>
        </article>
      )}
    />
  );
}
