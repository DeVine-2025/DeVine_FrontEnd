import type { ReportMainContent } from '@apis/report/report';
import CheckGreenIcon from '@assets/icons/detail-page/check-green.svg?react';
import CodeIcon from '@assets/icons/detail-page/code.svg?react';
import FileIcon from '@assets/icons/detail-page/file.svg?react';
import TimeIcon from '@assets/icons/detail-page/time.svg?react';
import ContentBox from '@components/report/ContentBox';
import { cn } from '@libs/cn';

type MainDetailProps = {
  data: ReportMainContent;
};

const MainDetail = ({ data }: MainDetailProps) => {
  const subtTitleStyle = 'text-slate-500 text-lg font-semibold pl-3 min-w-[160px]';
  const contentStyle = 'flex gap-20 items-center pr-8 py-[1.6rem]';
  const sectionTitleStyle = 'pl-2 text-ui-1000 text-3xl font-bold';
  const projectScaleStyle = 'flex gap-[0.4rem] text-ui-1000 items-center';
  const titleContentGapStyle = 'flex-col gap-[2.4rem]';

  const scale = data?.projectInfo?.scale?.split(' | ');

  return (
    <div className="mb-30 flex-col gap-[4.9rem]">
      {/* 첫 페이지: 프로젝트 개요 + 프로젝트 기본 정보 */}
      <div className={`report-print-section report-print-main-first ${titleContentGapStyle}`}>
        <ContentBox>
          <section className={contentStyle}>
            <p className={subtTitleStyle}>프로젝트 개요</p>
            <p className="font-bold text-ui-1000 text-xl leading-relaxed">
              {data?.overview?.summary}
            </p>{' '}
          </section>
          <section className={cn(contentStyle, 'border-ui-200 border-t-1 border-b-1')}>
            <p className={subtTitleStyle}>주요 기술</p>
            <p className="text-lg text-ui-1000">{data?.overview?.mainTech}</p>
          </section>
          <section className={contentStyle}>
            <p className={subtTitleStyle}>할 수 있는 것</p>
            <div className="flex-col gap-[0.3rem]">
              {data?.overview?.capabilities.map((todo) => (
                <p key={todo} className="flex items-center gap-2 font-normal text-lg text-ui-1000">
                  <span className="text-2xl text-[#4E49FF]">•</span>
                  {todo}
                </p>
              ))}
            </div>
          </section>
        </ContentBox>

        <div className={titleContentGapStyle}>
        <p className={sectionTitleStyle}>프로젝트 기본 정보</p>
        <ContentBox>
          <section className={contentStyle}>
            <p className={subtTitleStyle}>프로젝트명</p>
            <p className="font-bold text-2xl text-ui-1000">{data?.projectInfo?.projectName}</p>
          </section>
          <section className={cn(contentStyle, 'border-ui-200 border-t-1 border-b-1')}>
            <p className={subtTitleStyle}>기술 스택</p>

            <div className="grid grid-cols-2 gap-x-10 gap-y-1">
              {data?.projectInfo?.techStack.map((stack) => (
                <p key={stack} className="flex items-center gap-2 font-normal text-lg text-ui-1000">
                  <span className="text-2xl text-[#4E49FF]">•</span>
                  {stack}
                </p>
              ))}
            </div>
          </section>
          <section className={contentStyle}>
            <p className={subtTitleStyle}>프로젝트 규모</p>
            <div className="flex items-center gap-[2.4rem]">
              <p className={projectScaleStyle}>
                <CodeIcon />
                {scale?.[0]}
              </p>
              <p>|</p>
              <p className={projectScaleStyle}>
                <FileIcon />
                {scale?.[1]}
              </p>
              <p>|</p>
              <p className={projectScaleStyle}>
                <TimeIcon />
                {scale?.[2]}
              </p>
            </div>
          </section>
        </ContentBox>
        </div>
      </div>

      <div className={`report-print-section ${titleContentGapStyle}`}>
        <p className={sectionTitleStyle}>핵심 구현 사례</p>
        <div className="flex-col gap-[2rem]">
          {data?.keyImplementations?.map((item) => (
            <ContentBox key={`${item.title}-${item.description}`}>
              <div className="p-[2.4rem]">
                <p className="font-semibold text-2xl text-ui-1000">{item?.title}</p>
                <p className="mt-[1.1rem] mb-[2.4rem] font-normal text-lg text-ui-600">
                  {item?.description}
                </p>
                <p className="mb-3 flex items-center gap-2 font-semibold text-lg text-ui-1000">
                  <CheckGreenIcon />이 경험으로 할 수 있는 것
                </p>
                {item?.capabilities.map((item) => (
                  <p
                    key={item}
                    className="flex items-center gap-2 pb-1 font-normal text-lg text-ui-900"
                  >
                    <span className="text-2xl text-[#4E49FF]">•</span>
                    {item}
                  </p>
                ))}
              </div>
            </ContentBox>
          ))}
        </div>
      </div>

      {/* 한 페이지: AI 평가 + 이런 프로젝트에 추천합니다 */}
      <div className={`report-print-section report-print-main-last ${titleContentGapStyle}`}>
        <div className={titleContentGapStyle}>
        <p className={sectionTitleStyle}>AI 평가</p>
        <ContentBox>
          <div className="flex-col gap-[1.2rem] p-[3.3rem]">
            {data?.aiEvaluation.map((item) => (
              <div key={item.title} className="report-print-block">
                <p className="flex items-center gap-[0.8rem] font-semibold text-2xl text-ui-1000">
                  <CheckGreenIcon />
                  {item?.title}
                </p>
                <div className="px-[3.2rem]">
                  {item?.details.map((description) => (
                    <p
                      key={description}
                      className="flex items-center gap-2 pb-1 font-normal text-lg text-ui-900"
                    >
                      <span className="text-2xl text-[#4E49FF]">•</span>
                      {description}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ContentBox>
        </div>

        <div className={titleContentGapStyle}>
        <p className={sectionTitleStyle}>이런 프로젝트에 추천합니다</p>
        <div className="flex gap-[2.4rem]">
          {data?.recommendations?.map((item) => (
            <div
              key={item}
              className="report-print-block inline-flex h-48 w-full flex-col items-start justify-start rounded-[10px] bg-gradient-to-br from-indigo-600 to-slate-300 px-8 pt-8 pb-px"
            >
              <div className="flex h-28 flex-col items-start justify-start gap-4 self-stretch">
                <div className="justify-start self-stretch p-2 font-['Pretendard'] font-bold text-2xl text-white leading-8">
                  {item}
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
};

export default MainDetail;
