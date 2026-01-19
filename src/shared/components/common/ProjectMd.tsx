import type { ProjectCardProps } from 'src/shared/types/projectCard.types.ts';
import ProjectBase from './ProjectBase';

export default function ProjectMd(props: ProjectCardProps) {
  return (
    <ProjectBase
      {...props}
      render={({ Thumbnail, HeaderBadges, Title, Meta, RolesMd, Bookmark }) => (
        <article className="relative h-[200px] w-full max-w-[580px] rounded-2xl border border-card-border bg-card-bg px-8 py-7">
          <div className="absolute top-6 right-0 text-card-muted">{Bookmark}</div>

          <div className="flex gap-8">
            <div className="shrink-0">{Thumbnail}</div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-4">
                {HeaderBadges}
                <div className="line-clamp-2 font-semibold text-2xl text-card-title leading-snug">
                  {Title}
                </div>
                {Meta}
                {RolesMd}
              </div>
            </div>
          </div>
        </article>
      )}
    />
  );
}
