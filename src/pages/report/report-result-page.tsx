import ReportCard from '@components/report/ReportCard';
import { useLocation } from 'react-router-dom';

const ReportResultPage = () => {
  const location = useLocation();
  const data = location?.state;

  const { mainReport, detailReport } = data;
  return (
    <div className="mt-[100px] flex-col items-center gap-10">
      <p className="text-center font-bold text-4xl text-ui-1000">리포트 생성이 완료되었어요!</p>
      <div className="flex gap-3">
        <ReportCard
          type={'main'}
          label={'MAIN'}
          isPublic={mainReport?.visibility === 'PUBLIC'}
          title={mainReport?.content?.projectInfo?.projectName}
          description={mainReport?.content?.overview?.summary}
          gitRepoId={mainReport?.gitRepoId}
          reportId={mainReport?.reportId}
        />
        <ReportCard
          type={'main'}
          label={'DETAIL'}
          isPublic={detailReport?.visibility === 'PUBLIC'}
          title={detailReport?.content?.reportTitle}
          description={mainReport?.content?.overview?.summary}
          gitRepoId={detailReport.gitRepoId}
          reportId={detailReport?.reportId}
        />
      </div>
    </div>
  );
};

export default ReportResultPage;
