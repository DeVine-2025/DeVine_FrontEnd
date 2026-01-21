import type { ProjectCardProps } from 'src/shared/types/projectCard.types.ts';
import ProjectBase from './ProjectBase';

export default function ProjectLg(props: ProjectCardProps) {
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

          <div className="ml-auto flex w-[300px] shrink-0 items-center justify-end gap-13">
            {RolesLg}
            {props.dueLabel && <div className="flex items-center">{Due}</div>}
            {Bookmark}
          </div>
        </article>
      )}
    />
  );
}
