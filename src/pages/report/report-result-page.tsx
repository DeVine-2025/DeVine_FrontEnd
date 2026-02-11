import React from 'react';
import { useLocation } from 'react-router-dom';
import ReportCard from '@components/report/ReportCard';

const ReportResultPage = () => {
  const location = useLocation();
  const data = location?.state;

  const { mainReport, detailReport } = data;
  return (
    <div className="flex-col items-center gap-15 mt-[183px]">
      <p className="text-center text-ui-1000 text-4xl font-bold">리포트 생성이 완료되었어요!</p>
      <div className="flex gap-3">
        <ReportCard type={'main'}  label={"MAIN"} isPublic={mainReport?.visibility === "PUBLIC"} title={mainReport?.content?.projectInfo?.projectName} description={mainReport?.content?.overview?.summary} gitRepoId={mainReport.gitRepoId}/>
        <ReportCard type={'main'} label={"DETAIL"} isPublic={detailReport?.visibility === "PUBLIC"} title={detailReport?.content?.reportTitle}  description={mainReport?.content?.overview?.summary} gitRepoId={detailReport.gitRepoId}/>
      </div>
    </div>
  );
};

export default ReportResultPage;