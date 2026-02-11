import { ReportMainContent } from '@apis/report/report';
import {cn} from '@libs/cn';

import ContentBox from '@components/report/ContentBox';
import CodeIcon from "@assets/icons/detail-page/code.svg?react";
import FileIcon from "@assets/icons/detail-page/file.svg?react";
import TimeIcon from "@assets/icons/detail-page/time.svg?react";
import CheckGreenIcon from "@assets/icons/detail-page/check-green.svg?react";

type MainDetailProps = {
  data: ReportMainContent;
};

const MainDetail = ({data} : MainDetailProps) => {
  const subtTitleStyle =
    'text-slate-500 text-base font-semibold pl-6 min-w-[160px]';
  const contentStyle = 'flex gap-20 items-center pr-8 py-[1.6rem]';
  const sectionTitleStyle = ' text-ui-1000 text-3xl font-bold';
  const projectScaleStyle = 'flex gap-[0.4rem] items-center';
  const titleContentGapStyle = 'flex-col gap-[2.4rem]';

  const scale = data?.projectInfo?.scale?.split(" | ");

  return (
    <div className="flex-col gap-[4.9rem]">

      <ContentBox>
        <section className={contentStyle}>
          <p className={subtTitleStyle}>프로젝트 개요</p>
          <p className="text-ui-1000 text-2xl font-bold">{data?.overview?.summary}</p>
        </section>
        <section className={cn(contentStyle, 'border-b-1 border-t-1 border-ui-200')}>
          <p className={subtTitleStyle}>주요 기술</p>
          <p className="text-ui-1000 text-base ">{data?.overview?.mainTech}</p>
        </section>
        <section className={contentStyle}>
          <p className={subtTitleStyle}>할 수 있는 것</p>
          <div className="flex-col gap-[0.3rem] ">
            {data?.overview?.capabilities.map((todo) => (
              <p className=" text-ui-1000 text-base font-normal flex items-center gap-2">
                <span className="text-[#4E49FF] text-2xl">•</span>
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
            <p className="text-ui-1000 text-2xl font-bold">{data?.projectInfo?.projectName}</p>
          </section>
          <section className={cn(contentStyle, 'border-b-1 border-t-1 border-ui-200')}>
            <p className={subtTitleStyle}>기술 스택</p>

            <div className="grid grid-cols-2 gap-y-1 gap-x-10">
              {data?.projectInfo?.techStack.map((stack) => (
                <p
                  key={stack}
                  className="text-ui-1000 text-base font-normal flex items-center gap-2"
                >
                  <span className="text-[#4E49FF] text-2xl">•</span>
                  {stack}
                </p>
              ))}
            </div>
          </section>
          <section className={contentStyle}>
            <p className={subtTitleStyle}>프로젝트 규모</p>
            <div className="flex items-center gap-[2.4rem]">
              <p className={projectScaleStyle}><CodeIcon />{scale != undefined ? scale[0] : ''}</p>
              <p>|</p>
              <p className={projectScaleStyle}><FileIcon />{scale != undefined ? scale[1] : ''}</p>
              <p>|</p>
              <p className={projectScaleStyle}><TimeIcon />{scale != undefined ? scale[2] : ''}</p>
            </div>
          </section>
        </ContentBox>
      </div>

      <div className={titleContentGapStyle}>
        <p className={sectionTitleStyle}>핵심 구현 사례</p>
        <div className="flex-col gap-[2rem]">
          {data?.keyImplementations?.map((item) => (
            <ContentBox>
              <div className="p-[2.4rem]">
                <p className="text-ui-1000 text-xl font-semibold">{item?.title}</p>
                <p className="text-ui-600 text-base font-normal mt-[1.1rem] mb-[2.4rem]">{item?.description}</p>
                <p className="flex text-ui-1000 text-base font-semibold items-center gap-2"><CheckGreenIcon />이 경험으로 할 수
                  있는 것</p>
                {item?.capabilities.map((item) => (
                  <p className="text-ui-900 text-sm font-normal flex items-center gap-2"><span
                    className="text-[#4E49FF] text-2xl">•</span>{item}</p>
                ))}

              </div>

            </ContentBox>
          ))}
        </div>
      </div>


      <div className={titleContentGapStyle}>
        <p className={sectionTitleStyle}>AI 평가</p>
        <ContentBox>
          <div className="p-[3.3rem] flex-col gap-[1.2rem]">
            {data?.aiEvaluation.map((item) => (
              <>
                <p className="text-ui-1000 text-lg font-semibold flex items-center gap-[0.8rem]">
                  <CheckGreenIcon />{item?.title}</p>
                <div className="px-[3.2rem]">
                  {item?.details.map((description) => (
                    <p className="text-ui-900 text-sm font-normal flex items-center gap-2"><span
                      className="text-[#4E49FF] text-2xl">•</span>{description}</p>
                  ))}
                </div>
              </>
            ))}
          </div>

        </ContentBox>
      </div>

      <div className={titleContentGapStyle}>
        <p className={sectionTitleStyle}>이런 프로젝트에 추천합니다</p>
        <div className="flex gap-[2.4rem]">
          {data?.recommendations?.map((item) => (
            <div
              className="w-full h-48 px-8 pt-8 pb-px bg-gradient-to-br from-indigo-600 to-slate-300 rounded-[10px] inline-flex flex-col justify-start items-start">
              <div className="self-stretch h-28 flex flex-col justify-start items-start gap-4">
                <div
                  className="self-stretch justify-start text-white text-2xl font-bold font-['Pretendard'] leading-8">
                  {item}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};

export default MainDetail;