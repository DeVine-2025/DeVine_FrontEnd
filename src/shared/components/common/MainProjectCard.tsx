import ProjectBase from '@components/common/ProjectBase';
import { cn } from '@libs/cn';
import type { ProjectCardProps } from '@t/project/ui';

type MainProjectCardProps = ProjectCardProps & {
  showBookmark?: boolean;
};

export default function MainProjectCard(props: MainProjectCardProps) {
  const { showBookmark = true, ...restProps } = props;
  const metaText = [restProps.location, restProps.durationRangeName, restProps.mode]
    .filter(Boolean)
    .join(' · ');
  const thumbnailAlt = restProps.thumbnailAlt ?? restProps.title;
  const hasThumbnail = Boolean(restProps.thumbnailUrl);

  return (
    <ProjectBase
      {...restProps}
      render={({ HeaderBadges, Bookmark, CardActionProps }) => (
        <article
          {...CardActionProps}
          className={cn(
            'w-full min-w-0 overflow-hidden rounded-3xl border-0 bg-[var(--ui-bg)] shadow-none outline-none ring-0',
            restProps.onClick && 'cursor-pointer',
            restProps.className,
          )}
        >
          <div className="relative h-[180px] w-full overflow-hidden rounded-3xl border-0 bg-[#F3F5FC] shadow-none outline-none ring-0">
            {hasThumbnail ? (
              <img
                src={restProps.thumbnailUrl}
                alt={thumbnailAlt}
                className="block h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-[#F3F5FC]" />
            )}
            {showBookmark && <div className="absolute top-4 right-4 z-10">{Bookmark}</div>}
          </div>
          <div className="flex flex-col gap-2 px-6 py-5">
            <div className="flex gap-2">{HeaderBadges}</div>
            <p className="line-clamp-2 font-semibold text-card-title text-xl">{restProps.title}</p>
            <p className="text-base text-card-muted">{metaText}</p>
          </div>
        </article>
      )}
    />
  );
}
