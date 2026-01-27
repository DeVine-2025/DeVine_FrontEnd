import ProjectBase from '@components/common/ProjectBase';
import type { ProjectCardProps } from 'src/shared/types/projectCard.types';

export default function MainProjectCard(props: ProjectCardProps) {
  const metaText = [props.location, props.period, props.mode].filter(Boolean).join(' · ');
  const thumbnailAlt = props.thumbnailAlt ?? props.title;
  const thumbnail = props.thumbnailUrl ? (
    <img
      src={props.thumbnailUrl}
      alt={thumbnailAlt}
      className="h-[120px] w-full rounded-2xl bg-card-section-bg object-cover"
      loading="lazy"
    />
  ) : (
    <div className="h-[120px] w-full rounded-2xl bg-card-section-bg" />
  );

  return (
    <ProjectBase
      {...props}
      render={({ HeaderBadges, Bookmark }) => (
        <article className="flex w-[280px] shrink-0 flex-col gap-4 rounded-3xl bg-profile-card-bg p-4">
          <div className="relative flex justify-center">
            {thumbnail}
            <div className="absolute right-3 top-3 scale-75">{Bookmark}</div>
          </div>
          <div className="flex flex-wrap gap-2">{HeaderBadges}</div>
          <div className="flex flex-col gap-2">
            <p className="line-clamp-2 text-[12px] font-semibold text-card-title">
              {props.title}
            </p>
            {metaText && <p className="text-[10px] text-card-muted">{metaText}</p>}
          </div>
        </article>
      )}
    />
  );
}
