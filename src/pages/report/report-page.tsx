import { useState } from 'react';
import {useQuery} from '@tanstack/react-query';

import {reportQueries} from '@apis/report/report-queries';
import { ReportCardRequest } from '@apis/report/report';

import ReportCard from '@components/report/ReportCard';
import Blank from '@components/report/Blank';
import TabMenu from '@components/report/TabMenu';


const TAB_TYPE_MAP: Record<string, ReportCardRequest['type'] | undefined> = {
  전체: undefined,
  '메인 리포트': 'MAIN',
  '상세 리포트': 'DETAIL',
};


const ReportPage = () => {
  const [activeTab, setActiveTab] = useState('전체');

  const type = TAB_TYPE_MAP[activeTab];

  const { data } = useQuery(
    reportQueries.report(type ? { type } : undefined)
  );

  const reportData = data?.result?.reports;
  const tabs = ['전체', '메인 리포트', '상세 리포트'];

  return (
    <div className="flex h-full flex-col gap-[3rem]">
      {/* 상단 탭 */}
      <div className="flex gap-[1.2rem]">
        {tabs.map((tab) => (
          <TabMenu
            key={tab}
            text={tab}
            isActive={activeTab === tab}
            onClick={() => setActiveTab(tab)}
          />
        ))}
      </div>

      {/* 하단 컨텐츠 영역 */}
      <div>
        {reportData?.length > 0 ? (
          <div className="grid flex-1 items-center justify-start gap-[1.6rem] grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <ReportCard type="create"  />
            {reportData?.map((report) => (
              <ReportCard
                key={report.reportId}
                reportId={report.reportId}
                type="main"
                label={report.reportType}
                title={report.repoName}
                isPublic={report.visibility === 'PUBLIC'}
                description={report.repoDescription}
              />
            ))}
          </div>
        ): (
          <div>
            <Blank />
          </div>

        )}


      </div>
    </div>
  );
};

export default ReportPage;
