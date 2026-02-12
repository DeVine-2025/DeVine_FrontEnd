import { useCreateReportMutation } from '@apis/report/report-mutation';
import { useAuth } from '@clerk/clerk-react';
import Loading from '@components/common/Loading';
import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ReportLoadingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const gitRepoId = location.state?.gitRepoId;

  const { getToken } = useAuth();
  const { mutate } = useCreateReportMutation();

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
          },
        },
      );
    };

    create();
  }, []);

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
