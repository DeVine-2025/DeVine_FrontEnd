import type { CodeInsight, Improvement, NextStep, ReportDetailContent } from '@apis/report/report';
import FileSmallIcon from '@assets/icons/detail-page/file-small.svg?react';
import CheckLineIcon from '@assets/icons/check-line.svg?react';
import CancelLineIcon from '@assets/icons/cancel-line.svg?react';
import ContentBox from './ContentBox';

type ReportDetailProps = {
  data: ReportDetailContent;
};

type FileCardItemProps = {
  filePath: string;
};

const FileCardItem = ({ filePath }: FileCardItemProps) => {
  return (
    <div className="relative flex items-start gap-2 rounded-lg border border-1 border-ui-100 bg-ui-bg px-[0.7rem] pr-[6rem] py-[0.8rem]">
      <FileSmallIcon />
      <p className="font-normal text-sm text-ui-800 whitespace-pre-line break-all">{filePath}</p>
    </div>
  );
};

const ReportDetail = ({ data }: ReportDetailProps) => {
  const sectionTitleStyle = 'text-ui-1000 text-3xl font-bold';
  const subtTitleStyle = 'text-ui-900 text-xl font-semibold min-w-[160px]';
  const contentGapStyle = 'flex-col gap-[2rem]';
  const contentStyle = 'flex-col gap-2 p-[1.6rem]';
  const listGapStyle = 'flex-col gap-[0.2rem]';
  const listItemStyle =
    'flex items-start flex-col gap-[1rem] font-normal text-lg text-ui-1000 pb-2';

  const scale = data.projectOverview.projectScale;

  const scaleItems = [
    `총 코드 라인: ${scale.totalCodeLines}줄`,
    `작업파일 : ${scale.mainCodeFiles}개 이상`,
    `개발 기간: ${scale.developmentPeriod}`,
    `패키지 구조: ${scale.architecturePattern}`,
  ];

  return (
    <div className="mb-30 flex-col gap-[8rem]">
      {/* 프로젝트 개요 */}
      <section className="report-print-section flex-col gap-[2.4rem]">
        <div className="flex-col gap-[1rem]">
          <p className={sectionTitleStyle}>프로젝트 개요</p>
          <hr className="border-ui-100" />
        </div>

        <div className="flex-col gap-[3rem]">
          <div>
            <p className={subtTitleStyle}>프로젝트 목적</p>
            <p className="pt-3 font-medium text-lg text-ui-700">{data.projectOverview.purpose}</p>
          </div>

          {/* 기술 스택 */}
          <div className={contentGapStyle}>
            <p className={subtTitleStyle}>핵심 기술 스택</p>
            <ContentBox>
              <section className={contentStyle}>
                {data.projectOverview.techStack.map(
                  (item: { title: string; content: string }, idx: number) => (
                    <div key={idx} className="flex items-center gap-20 pb-2 pl-5">
                      <p className={subtTitleStyle}>{item.title}</p>
                      <p className="font-medium text-lg text-ui-900">{item.content}</p>
                    </div>
                  ),
                )}
              </section>
            </ContentBox>
          </div>

          {/* 프로젝트 규모 */}
          <div className={contentGapStyle}>
            <p className={subtTitleStyle}>프로젝트 규모</p>
            <ContentBox>
              <div className="flex px-[3rem] py-[1.5rem]">
                <p className="text-ui-400 pr-[10.6rem]">프로젝트 규모</p>
                <div className="gap-6">
                  {scaleItems.map((text) => (
                    <p key={text} className={listItemStyle}>
                      <span>• {text}</span>
                    </p>
                  ))}
                </div>
              </div>
            </ContentBox>
          </div>
        </div>
      </section>

      {/* 구현 기능 상세 (한 페이지에 모두) */}
      <section className="report-print-section report-print-implement">
        <div className="flex-col gap-[1rem]">
          <p className={sectionTitleStyle}>구현 기능 상세분석</p>
          <hr className="border-ui-100" />

          {data.implementedFeatures.map((item: any, idx: number) => (
            <ContentBox key={idx}>
              <div className="report-print-implement-inner flex-col gap-13 p-[2rem]">
                <p className="font-bold text-ui-1000 text-xl">
                  {item.categoryNumber + ' . ' + item.category}
                </p>

                {item.features.map((feature: any, fIdx: number) => (
                  <div key={fIdx} className="report-print-block flex-col gap-[2.9rem]">
                    <div className="flex-col gap-[1rem]">
                      <p className="font-semibold text-lg text-ui-400">
                        {feature.name} - 구현 내용
                      </p>
                      <div className={listGapStyle}>
                        {feature.details.map((detail: string, dIdx: number) => (
                          <p key={dIdx} className="font-medium text-lg text-ui-900">
                            • {detail}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="flex-col gap-[1rem]">
                      <p className="font-semibold text-lg text-ui-400">
                        {feature.name} - 코드 위치
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {feature.codeLocation.map((file: string, fileIdx: number) => (
                          <FileCardItem key={fileIdx} filePath={file} />
                        ))}
                      </div>
                    </div>

                    <div className="flex-col gap-[1rem]">
                      <p className="font-semibold text-lg text-ui-400">
                        {feature.name} - 구현 방식
                      </p>
                      <div className="flex flex-col flex-wrap gap-2">
                        {feature.implementation.map((implementation: string, iIdx: number) => (
                          <p key={iIdx} className="font-medium text-lg text-ui-900">
                            • {implementation}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ContentBox>
          ))}
        </div>
      </section>

      {/*프로젝트 분석 요약*/}
      <div className="report-print-section report-print-implement">
        {/* 코드 인사이트 */}
        <section className="flex-col gap-[1rem]">
          <p className={sectionTitleStyle}>프로젝트 분석 요약</p>
          <hr className="border-ui-100" />
          <ContentBox>
            <div className="flex p-[3.2rem] gap-[4.8rem]">
              <div className="flex-1/2 flex-col gap-[2.4rem]">
                <p className="w-fit rounded-[8px] bg-positive-bg px-[0.8rem] py-[0.4rem] text-bold text-positive-text">이 프로젝트에서
                  구현한것</p>
                <div className="flex-col gap-[1rem]">
                  {data.projectSummary.implemented.map((item) => (
                    <p key={item} className="flex items-center gap-[1.2rem] text-ui-900"><CheckLineIcon
                      className="text-positive-text" />{item}</p>
                  ))}

                </div>
              </div>
              <div className="flex-1/2 flex-col gap-[2.4rem]">
                <p className="w-fit rounded-[8px] bg-negative-bg px-[0.8rem] py-[0.4rem] text-bold text-negative-text">이
                  프로젝트에서
                  구현하지 않은 것</p>
                <div className="flex-col gap-[1rem]">
                  {data.projectSummary.notImplemented.map((item) => (
                    <p key={item} className="flex items-center gap-[1.2rem] text-ui-900"><CancelLineIcon
                      className="text-negative-text" />{item}</p>
                  ))}

                </div>
              </div>
            </div>
          </ContentBox>
        </section>
      </div>


      {/* 코드 인사이트 + 개선 가능한 영역 (같은 페이지) */}
      <div className="report-print-section report-print-same-page flex flex-col gap-[8rem]">
            {/* 코드 인사이트 */}
            <section className="flex-col gap-[1rem]">
              <p className={sectionTitleStyle}>코드 분석 인사이트</p>
              <hr className="border-ui-100" />
              <ContentBox>
                <div className="flex-col gap-[3rem] p-[3.2rem]">
                  {data.codeInsights.map((item: CodeInsight, idx: number) => (
                    <div key={idx} className="report-print-block flex-col gap-[0.7rem]">
                      <p className="pb-1 font-semibold text-ui-1000 text-xl">
                        {item.number + ' . ' + item.title}
                      </p>
                      {item.points.map((description: string, pIdx: number) => (
                        <p key={pIdx} className="text-lg text-ui-1000">
                          • {description}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              </ContentBox>
            </section>

            {/* 개선 가능한 영역 (인쇄 시 컴팩트) */}
            <section className="report-print-compact flex-col gap-[1rem]">
              <p className={sectionTitleStyle}>개선 가능한 영역</p>
              <hr className="border-ui-100" />

              {data.improvements.map((item: Improvement, idx: number) => (
                <ContentBox key={idx}>
                  <div className="flex-col gap-10 p-[3rem] report-print-compact-inner">
                    <p className="font-bold text-ui-1000 text-xl">{item.number + ' . ' + item.title}</p>
                  </div>
                </ContentBox>
              ))}
            </section>
          </div>

          {/* 다음 스텝 */}
          <section className="report-print-section">
            <div className="flex-col gap-[1rem]">
              <p className={sectionTitleStyle}>다음 프로젝트에서 시도해볼 만한 것</p>
              <hr className="border-ui-100" />

              {data.nextSteps.map((item: NextStep, idx: number) => (
                <ContentBox key={idx}>
                  <div className="flex-col gap-[0.7rem] p-[3rem]">
                    <p className="font-bold text-ui-1000 text-xl">{item.number + ' . ' + item.title}</p>
                    <p className="text-lg text-ui-400">{item.description.join(', ')}</p>
                    <div className="mt-2 flex gap-2">
                      <p
                        className="flex w-fit items-center justify-center rounded border border-indigo-600/20 bg-indigo-600/10 px-2 py-1 font-bold text-primary">
                        추천 기술
                      </p>
                      <p className="flex items-center gap-3 font-medium text-sm text-ui-1000">
                        {item.recommendKeyword.join(' , ')}
                      </p>
                    </div>
                  </div>
                </ContentBox>
              ))}
            </div>
          </section>
      </div>
      );
      };

      export default ReportDetail;
