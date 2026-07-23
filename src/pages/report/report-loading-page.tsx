import { useCreateReportMutation } from '@apis/report/report-mutation';
import { CreateReportError } from '@apis/reports';
import { useAuth } from '@clerk/clerk-react';
import Loading from '@components/common/Loading';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ReportLoadingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const gitRepoId = location.state?.gitRepoId;

  const { getToken } = useAuth();
  const { mutate } = useCreateReportMutation();
  const [error, setError] = useState<{ code?: string; message: string } | null>(null);

  // 추가: effect 중복 실행 방지
  const hasRequested = useRef(false);

  useEffect(() => {
    // 이미 실행했으면 다시 실행 안 함
    if (hasRequested.current) return;
    hasRequested.current = true;

    const create = async () => {
      if (!gitRepoId) {
        navigate(-1);
        return;
      }

      const token = await getToken();

      if (!token) {
        navigate(-1);
        return;
      }

      mutate(
        { gitRepoId, token },
        {
          onSuccess: (data) => {
            console.log('성공 응답 옴', data);
            navigate('/report/result', { state: data });
          },
          onError: (error) => {
            console.error(error);
            setError({
              code: error instanceof CreateReportError ? error.code : undefined,
              message:
                error instanceof Error
                  ? error.message
                  : '리포트 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.',
            });
          },
        },
      );
    };

    create();
  }, []);

  if (error) {
    const isInsufficientCredit = error.code === 'TICKET400_2';

    return (
      <div className="flex w-full flex-col items-center justify-center px-6 pt-50">
        <div className="flex w-full max-w-[440px] flex-col items-center rounded-3xl border border-card-border bg-card-bg px-8 py-10 text-center shadow-sm">
          <p className="Title3 font-bold text-card-title">
            {isInsufficientCredit ? '리포트를 생성할 수 없어요' : '리포트 생성에 실패했어요'}
          </p>
          <p className="mt-4 Body1 text-card-muted">{error.message}</p>
          {isInsufficientCredit && (
            <p className="mt-2 Label1 text-card-muted">이용권을 구매한 뒤 다시 시도해 주세요.</p>
          )}

          <div className="mt-8 flex w-full flex-col gap-3">
            {isInsufficientCredit ? (
              <button
                type="button"
                onClick={() => navigate('/pay')}
                className="w-full cursor-pointer rounded-xl bg-[var(--color-primary)] py-4 Label1 font-semibold text-white transition-opacity hover:opacity-90"
              >
                이용권 구매하기
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => navigate('/report/create')}
              className="w-full cursor-pointer rounded-xl border border-card-border bg-ui-bg py-4 Label1 font-semibold text-card-title transition-colors hover:bg-ui-50"
            >
              레포지토리 목록으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center justify-center pt-50">
      <Loading className="w-[300px]" />
      <p className="font-bold text-3xl text-ui-900">리포트를 생성하는 중이에요</p>
      <div className="mt-[3rem] flex-col items-center gap-[1.6rem]">
        <p className="w-fit rounded-lg bg-badge-bg-primary px-[0.8rem] py-[0.4rem] font-bold text-badge-text-primary text-sm">
          Tip
        </p>
        <p className="text-center font-medium text-ui-600 text-xl">
          나와 맞는 프로젝트와 개발자를
          <br />
          추천 프로젝트/개발자 탭에서 확인해보세요.
        </p>
      </div>
    </div>
  );
};

export default ReportLoadingPage;
