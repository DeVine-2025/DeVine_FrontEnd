import ReportCard from '@components/report/ReportCard';
import { cn } from '@libs/cn';
import { useLocation, useNavigate } from 'react-router-dom';

const ReportResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location?.state;

  const { mainReport, detailReport } = data;

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-[5.6rem] py-[10rem] lg:max-2xl:gap-[32px] lg:max-2xl:py-[clamp(44px,8svh,76px)]">

      {/* 헤더 */}
      <div className="flex flex-col items-center gap-[2rem]">
        <div
          className="flex h-[5.2rem] w-[5.2rem] items-center justify-center rounded-full"
          style={{
            background: 'linear-gradient(145deg, #6C63FF, #6654F5)',
            boxShadow: '0 0 0 1px rgba(102,84,245,0.4), 0 8px 20px rgba(102,84,245,0.4)',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 6L9 17l-5-5"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="flex flex-col items-center gap-[0.6rem]">
          <h1
            className={cn(
              'text-[2.8rem] font-bold tracking-[-0.02em]',
              'text-white/90',
            )}
          >
            리포트 생성이 완료되었어요
          </h1>
          <p
            className={cn(
              'text-[1.4rem]',
              'text-white/40',
            )}
          >
            카드를 클릭해 상세 내용을 확인하세요
          </p>
        </div>
      </div>

      {/* 카드 영역 */}
      <div className="flex w-full max-w-[56rem] gap-[1.4rem] report-result-cards lg:max-2xl:max-w-[500px]">
        <ReportCard
          type="main"
          label="MAIN"
          isPublic={mainReport?.visibility === 'PUBLIC'}
          title={mainReport?.content?.projectInfo?.projectName}
          description={mainReport?.content?.overview?.summary}
          gitRepoId={mainReport?.gitRepoId}
          reportId={mainReport?.reportId}
        />
        <ReportCard
          type="main"
          label="DETAIL"
          isPublic={detailReport?.visibility === 'PUBLIC'}
          title={detailReport?.content?.reportTitle}
          description={mainReport?.content?.overview?.summary}
          gitRepoId={detailReport?.gitRepoId}
          reportId={detailReport?.reportId}
        />
      </div>

      {/* 하단 액션 */}
      <button
        type="button"
        onClick={() => navigate('/report')}
        className={cn(
          'rounded-full px-[2.2rem] py-[0.9rem] text-[1.35rem] font-medium transition-opacity duration-150 hover:opacity-70',
          'bg-white/[0.07] text-white/60',
        )}
      >
        리포트 목록 보기
      </button>
    </div>
  );
};

export default ReportResultPage;
