import type { ReportCardRequest } from '@apis/report/report';
import { reportQueries } from '@apis/report/report-queries';
import Blank from '@components/report/Blank';
import ReportCard from '@components/report/ReportCard';
import TabMenu from '@components/report/TabMenu';
import { useThemeStore } from '@store/theme';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

const TAB_TYPE_MAP: Record<string, ReportCardRequest['type'] | undefined> = {
  전체: undefined,
  '메인 리포트': 'MAIN',
  '상세 리포트': 'DETAIL',
};

const ReportPage = () => {
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
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
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={
                  isLight
                    ? 'h-[14rem] animate-pulse rounded-[16px] border border-[var(--ui-200)] bg-[var(--ui-100)]'
                    : 'h-[14rem] animate-pulse rounded-[16px] border border-white/[0.06] bg-white/[0.04]'
                }
              />
            ))}
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
          <div className="grid grid-cols-2 gap-[1.4rem] sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            <ReportCard type="create" />
            <Blank />
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportPage;
