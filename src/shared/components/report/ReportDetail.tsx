import { ReportDetailContent, ReportMainContent } from '@apis/report/report';
import ContentBox from '@components/report/ContentBox';

type ReportDetailProps = {
  data: ReportDetailContent;
};
const ReportDetail = ({ data }: ReportDetailProps) => {
  const sectionTitleStyle = 'text-ui-1000 text-3xl font-bold';
  const subtTitleStyle = 'text-ui-900 text-lg font-semibold min-w-[160px]';
  const contentGapStyle = 'flex-col gap-[2rem]';
  const contentStyle = 'flex-col gap-2 p-[1.6rem]';

  return (
    <div className="flex-col gap-[8rem]">
      <section className="flex-col gap-[2.4rem]">
        <div className="flex-col gap-[1rem]">
          <p className={sectionTitleStyle}>프로젝트 개요</p>
          <hr className="border-ui-100" />
        </div>
        <div className="flex-col gap-[3rem]">
          <div>
            <p className={subtTitleStyle}>프로젝트 목적</p>
            <p className="text-ui-700 text-base font-medium">{data?.projectOverview?.purpose}</p>
          </div>
          <div className={contentGapStyle}>
            <p className={subtTitleStyle}>핵심 기술 스택</p>
            <ContentBox>
              <section className={contentStyle}>
                {data?.projectOverview.techStack.map((item) => (
                  <div className="flex gap-30 items-center">
                    <p className={subtTitleStyle}>{item.title}</p>
                    <p className="text-ui-900 text-sm font-medium">{item.content}</p>
                  </div>
                ))}
              </section>
            </ContentBox>
          </div>
          <div className={contentGapStyle}>
            <p className={subtTitleStyle}>프로젝트 규모</p>
            <ContentBox>
              <div className="flex py-[2rem] px-[3rem]">
                <p className={subtTitleStyle}>프로젝트 규모</p>
                <div>
                  <p className="text-ui-1000 text-sm font-normal flex items-center"><span
                    className="text-2xl">•</span> 총 코드 라인: {data?.projectOverview?.projectScale?.totalCodeLines}줄</p>
                  <p className="text-ui-1000 text-sm font-normal flex items-center"><span
                    className="text-2xl">•</span> 작업파일 : {data?.projectOverview?.projectScale?.mainCodeFiles}개 이상</p>
                  <p className="text-ui-1000 text-sm font-normal flex items-center"><span
                    className="text-2xl">•</span> 개발 기간: {data?.projectOverview?.projectScale?.developmentPeriod}</p>
                  <p className="text-ui-1000 text-sm font-normal flex items-center"><span
                    className="text-2xl">•</span> 패키지 구조: {data?.projectOverview?.projectScale?.architecturePattern}</p>
                </div>
              </div>
            </ContentBox>
          </div>
        </div>
      </section>

      <section>
        <div className="flex-col gap-[1rem]">
          <p className={sectionTitleStyle}>구현 기능 상세분석</p>
          <hr className="border-ui-100" />
        </div>
      </section>

      <section>
        <div className="flex-col gap-[1rem]">
          <p className={sectionTitleStyle}>프로젝트 분석 요약</p>
          <hr className="border-ui-100" />
          <div>
            <ContentBox>
              <div>
                <div>
                  <p className="w-fit px-2 py-1 bg-positive-bg text-positive-text rounded-lg">이 프로젝트에서 구현한 것</p>
                </div>
                <div></div>
              </div>
            </ContentBox>
          </div>
        </div>
      </section>

      <section>
        <div className="flex-col gap-[1rem]">
          <p className={sectionTitleStyle}>코드 분석 인사이트</p>
          <hr className="border-ui-100" />
        </div>
      </section>

      <section>
        <div className="flex-col gap-[1rem]">
          <p className={sectionTitleStyle}>개선 가능한 영역</p>
          <hr className="border-ui-100" />
        </div>
      </section>

      <section>
        <div className="flex-col gap-[1rem]">
          <p className={sectionTitleStyle}>다음 프로젝트에서 시도해볼 만한 것</p>
          <hr className="border-ui-100" />
        </div>
      </section>
    </div>
  );
};

export default ReportDetail;