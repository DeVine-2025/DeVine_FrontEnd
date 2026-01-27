import type { ProjectCardProps } from 'src/shared/types/projectCard.types.ts';
import ProjectBase from '@components/common/ProjectBase';

type MainProjectLgProps = ProjectCardProps & {
  scoreSummary?: string;
};

const DEFAULT_SCORE_SUMMARY =
  '기술 적합도 : 4/5, 도메인 적합도 : 4/5, 성장 가능성 : 3/5 종합 점수: 95';

export default function MainProjectLg(props: MainProjectLgProps) {
  const { scoreSummary = DEFAULT_SCORE_SUMMARY } = props;
  const borderGradient =
    'linear-gradient(90deg, var(--color-main-project-border-start) 0%, var(--color-main-project-border-mid) 50%, var(--color-main-project-border-end) 100%)';

  return (
    <ProjectBase
      {...props}
      render={({ Thumbnail, HeaderBadges, Title, Meta, RolesLg, Due, Bookmark }) => (
        <div className="w-full max-w-[1180px] rounded-2xl p-[1px]" style={{ backgroundImage: borderGradient }}>
          <article className="flex w-full flex-col gap-4 rounded-2xl bg-card-bg p-8">
            <div className="flex items-center gap-8">
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
            </div>

            <div className="w-full max-w-[950px] rounded-xl bg-[var(--color-main-project-score-bg)] px-5 py-3 text-[14px] text-[var(--color-main-project-score-text)]">
              {scoreSummary}
            </div>
          </article>
        </div>
      )}
    />
  );
}
