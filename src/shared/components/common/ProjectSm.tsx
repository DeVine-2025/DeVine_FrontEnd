import type { ProjectCardProps } from 'src/shared/types/projectCard.types';
import ProjectBase from './ProjectBase';

export default function ProjectSm(props: ProjectCardProps) {
  return (
    <ProjectBase
      {...props}
      render={({ HeaderBadges, Title, Meta, RolesMd, Bookmark }) => (
        <article className="flex h-[240px] w-[280px] shrink-0 flex-col gap-5 rounded-3xl bg-profile-card-bg px-9 py-7">
          <div className="flex items-start justify-between">
            <div>{HeaderBadges}</div>
            <div>{Bookmark}</div>
          </div>
          <div>{Title}</div>
          <div>{Meta}</div>
          <div className="my-1 h-px w-full bg-card-border" />
          <div>{RolesMd}</div>
        </article>
      )}
    />
  );
}
