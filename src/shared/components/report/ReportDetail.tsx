import {
  ReportDetailContent,
  CodeInsight,
  Improvement,
  NextStep,
} from '@apis/report/report';
import ContentBox from '@components/report/ContentBox';
import FileSmallIcon from "@assets/icons/detail-page/file-small.svg?react";
import CheckGreenIcon from "@assets/icons/detail-page/check-green.svg?react";
import CancelRedIcon from "@assets/icons/detail-page/cacanel-red.svg?react";

type ReportDetailProps = {
  data: ReportDetailContent;
};

type FileCardItemProps = {
  filePath: string;
};

const FileCardItem = ({ filePath }: FileCardItemProps) => {
  return (
    <div className="flex items-center gap-2 rounded-lg px-[0.7rem] py-[1.2rem] w-96 h-8 relative bg-ui-bg border border-1 border-ui-100">
      <FileSmallIcon />
      <p className="text-ui-800 text-xs font-normal">{filePath}</p>
    </div>
  );
};

const ReportDetail = ({ data }: ReportDetailProps) => {
  const sectionTitleStyle = 'text-ui-1000 text-3xl font-bold';
  const subtTitleStyle = 'text-ui-900 text-lg font-semibold min-w-[160px]';
  const contentGapStyle = 'flex-col gap-[2rem]';
  const contentStyle = 'flex-col gap-2 p-[1.6rem]';
  const listGapStyle = 'flex-col gap-[0.2rem]';

  return (
    <div className="flex-col gap-[8rem]">
      {/* 프로젝트 개요 */}
      <section className="flex-col gap-[2.4rem]">
        <div className="flex-col gap-[1rem]">
          <p className={sectionTitleStyle}>프로젝트 개요</p>
          <hr className="border-ui-100" />
        </div>

        <div className="flex-col gap-[3rem]">
          <div>
            <p className={subtTitleStyle}>프로젝트 목적</p>
            <p className="text-ui-700 text-base font-medium">
              {data.projectOverview.purpose}
            </p>
          </div>

          {/* 기술 스택 */}
          <div className={contentGapStyle}>
            <p className={subtTitleStyle}>핵심 기술 스택</p>
            <ContentBox>
              <section className={contentStyle}>
                {data.projectOverview.techStack.map(
                  (item: { title: string; content: string }, idx: number) => (
                    <div key={idx} className="flex gap-30 items-center">
                      <p className={subtTitleStyle}>{item.title}</p>
                      <p className="text-ui-900 text-sm font-medium">
                        {item.content}
                      </p>
                    </div>
                  )
                )}
              </section>
            </ContentBox>
          </div>

          {/* 프로젝트 규모 */}
          <div className={contentGapStyle}>
            <p className={subtTitleStyle}>프로젝트 규모</p>
            <ContentBox>
              <div className="flex py-[2rem] px-[3rem]">
                <p className={subtTitleStyle}>프로젝트 규모</p>
                <div>
                  <p className="text-ui-1000 text-sm font-normal flex items-center">
                    <span className="text-2xl">•</span> 총 코드 라인:
                    {data.projectOverview.projectScale.totalCodeLines}줄
                  </p>
                  <p className="text-ui-1000 text-sm font-normal flex items-center">
                    <span className="text-2xl">•</span> 작업파일 :
                    {data.projectOverview.projectScale.mainCodeFiles}개 이상
                  </p>
                  <p className="text-ui-1000 text-sm font-normal flex items-center">
                    <span className="text-2xl">•</span> 개발 기간:
                    {data.projectOverview.projectScale.developmentPeriod}
                  </p>
                  <p className="text-ui-1000 text-sm font-normal flex items-center">
                    <span className="text-2xl">•</span> 패키지 구조:
                    {data.projectOverview.projectScale.architecturePattern}
                  </p>
                </div>
              </div>
            </ContentBox>
          </div>
        </div>
      </section>

      {/* 구현 기능 상세 */}
      <section>
        <div className="flex-col gap-[1rem]">
          <p className={sectionTitleStyle}>구현 기능 상세분석</p>
          <hr className="border-ui-100" />

          {data.implementedFeatures.map((item: any, idx: number) => (
            <ContentBox key={idx}>
              <div className="p-[2rem] flex-col gap-10">
                <p className="text-ui-1000 text-xl font-bold">
                  {item.categoryNumber + ' . ' + item.category}
                </p>

                {item.features.map((feature: any, fIdx: number) => (
                  <div key={fIdx} className="flex-col gap-[2.9rem]">
                    <div className="flex-col gap-[1rem]">
                      <p className="text-ui-400 text-xs font-semibold">
                        {feature.name} - 구현 내용
                      </p>
                      <div className={listGapStyle}>
                        {feature.details.map(
                          (detail: string, dIdx: number) => (
                            <p key={dIdx} className="text-ui-900 text-sm font-medium">
                              • {detail}
                            </p>
                          )
                        )}
                      </div>
                    </div>

                    <div className="flex-col gap-[1rem]">
                      <p className="text-ui-400 text-xs font-semibold">
                        {feature.name} - 코드 위치
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {feature.codeLocation.map((file: string, fileIdx: number) => (
                          <FileCardItem key={fileIdx} filePath={file} />
                        ))}
                      </div>
                    </div>

                    <div className={listGapStyle}>
                      <p className="text-ui-400 text-xs font-semibold">
                        {feature.name} - 구현 방식
                      </p>
                      {feature.implementation.map(
                        (implementation: string, iIdx: number) => (
                          <p key={iIdx} className="text-ui-900 text-sm font-medium">
                            • {implementation}
                          </p>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ContentBox>
          ))}
        </div>
      </section>

      {/* 코드 인사이트 */}
      <section>
        <div className="flex-col gap-[1rem]">
          <p className={sectionTitleStyle}>코드 분석 인사이트</p>
          <hr className="border-ui-100" />
          <ContentBox>
            <div className="p-[3.2rem] flex-col gap-[3rem]">
              {data.codeInsights.map((item: CodeInsight, idx: number) => (
                <div key={idx} className="flex-col gap-[0.7rem]">
                  <p className="text-ui-1000 text-lg font-semibold">
                    {item.number + ' . ' + item.title}
                  </p>
                  {item.points.map((description: string, pIdx: number) => (
                    <p key={pIdx} className="text-ui-1000 text-base">
                      • {description}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </ContentBox>
        </div>
      </section>

      {/* 개선 */}
      <section>
        <div className="flex-col gap-[1rem]">
          <p className={sectionTitleStyle}>개선 가능한 영역</p>
          <hr className="border-ui-100" />

          {data.improvements.map((item: Improvement, idx: number) => (
            <ContentBox key={idx}>
              <div className="p-[3rem] flex-col gap-10">
                <p className="text-ui-1000 text-lg font-bold">
                  {item.number + ' . ' + item.title}
                </p>
              </div>
            </ContentBox>
          ))}
        </div>
      </section>

      {/* 다음 스텝 */}
      <section>
        <div className="flex-col gap-[1rem]">
          <p className={sectionTitleStyle}>다음 프로젝트에서 시도해볼 만한 것</p>
          <hr className="border-ui-100" />

          {data.nextSteps.map((item: NextStep, idx: number) => (
            <ContentBox key={idx}>
              <div className="p-[3rem] flex-col gap-[0.7rem]">
                <p className="text-ui-1000 text-xl font-bold">
                  {item.number + ' . ' + item.title}
                </p>
                <p className="text-ui-400 text-base">
                  {item.description.join(', ')}
                </p>
              </div>
            </ContentBox>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ReportDetail;
