import ProjectBase from '@components/common/ProjectBase';
import type { ProjectCardProps } from 'src/shared/types/projectCard.types';

export default function MainProjectCard(props: ProjectCardProps) {
  const metaText = [props.location, props.period, props.mode].filter(Boolean).join(' · ');
  const thumbnailAlt = props.thumbnailAlt ?? props.title;
  const hasThumbnail = Boolean(props.thumbnailUrl);

  return (
    <ProjectBase
      {...props}
      render={({ HeaderBadges, Bookmark }) => (
        <article className="w-[280px] shrink-0 overflow-hidden rounded-3xl border-0 bg-[var(--ui-bg)] shadow-none ring-0 outline-none">
          <div className="relative h-[160px] w-full overflow-hidden rounded-3xl border-0 bg-[#F3F5FC] shadow-none ring-0 outline-none">
            {hasThumbnail ? (
              <img
                src={props.thumbnailUrl}
                alt={props.thumbnailAlt}
                className="block h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-[#F3F5FC]" />
            )}
            <div className="absolute top-4 right-4 z-10">{Bookmark}</div>
          </div>
          <div className="flex flex-col gap-2 px-6 py-5">
            <div className="flex gap-2">{HeaderBadges}</div>
            <p className="line-clamp-2 font-semibold text-card-title text-xl">{props.title}</p>
            <p className="text-base text-card-muted">{metaText}</p>
          </div>
        </article>
      )}
    />
  );
}
