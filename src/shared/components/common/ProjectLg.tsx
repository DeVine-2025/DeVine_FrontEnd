import type { ReactNode } from 'react';
import type { ProjectCardProps } from 'src/shared/types/projectCard.types.ts';
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
      render={({ Thumbnail, HeaderBadges, Title, Meta, RolesLg, Due, Bookmark }) => (
        <article className="flex h-[180px] w-full max-w-[1180px] items-center gap-8 overflow-hidden rounded-2xl border border-card-border bg-card-bg p-8">
          {Thumbnail}

          <div className="flex flex-1 flex-col justify-center gap-9">
            {HeaderBadges}
            <div>{Title}</div>
            {Meta}
          </div>

          <div className="ml-auto flex shrink-0 items-center justify-end gap-17 pr-10">
            {RolesLg}
            {showDue && props.dueLabel && <div className="flex text-center">{Due}</div>}
            {action ? action : showBookmark ? Bookmark : null}
          </div>
        </article>
      )}
    />
  );
}
