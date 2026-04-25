import type { ReportCardRequest } from '@apis/report/report';
import { reportQueries } from '@apis/report/report-queries';
import Blank from './_components/Blank';
import ReportCard from './_components/ReportCard';
import { ReportCardSkeletonList } from './_components/ReportCardSkeleton';
import TabMenu from './_components/TabMenu';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

const TAB_TYPE_MAP: Record<string, ReportCardRequest['type'] | undefined> = {
  전체: undefined,
  '메인 리포트': 'MAIN',
  '상세 리포트': 'DETAIL',
};

const ReportPage = () => {
  const [activeTab, setActiveTab] = useState('전체');

  const type = TAB_TYPE_MAP[activeTab];

  const { data, isPending } = useQuery(reportQueries.report(type ? { type } : undefined));

  const reportData = data?.result?.reports;
  const hasReports = Array.isArray(reportData) && reportData.length > 0;
  const tabs = ['전체', '메인 리포트', '상세 리포트'];

  return (
    <div className="flex h-full flex-col gap-[3.2rem]">

      {/* 탭 영역 */}
      <div className="flex items-center gap-[0.8rem]">
        {tabs.map((tab) => (
          <TabMenu
            key={tab}
            text={tab}
            isActive={activeTab === tab}
            onClick={() => setActiveTab(tab)}
          />
        ))}
      </div>

      {/* 컨텐츠 영역 */}
      <div>
        {isPending ? (
          <div className="grid grid-cols-2 gap-[1.4rem] sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            <ReportCard type="create" />
            <ReportCardSkeletonList count={3} />
          </div>
        ) : hasReports ? (
          <div className="grid grid-cols-2 gap-[1.4rem] sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            <ReportCard type="create" />
            {reportData.map((report) => (
              <ReportCard
                key={report.reportId}
                reportId={report.reportId}
                gitRepoId={report.gitRepoId}
                type="main"
                label={report.reportType}
                title={report.repoName}
                isPublic={report.visibility === 'PUBLIC'}
                description={report.repoDescription}
              />
            ))}
          </div>
        ) : (
          <Blank />
        )}
      </div>
    </div>
  );
};

export default ReportPage;
