import Loading from '@components/common/Loading';
import { useAuth } from '@clerk/clerk-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCreateReportMutation } from '@apis/report/report-mutation';
import { useEffect, useRef } from 'react';

const ReportLoadingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const gitRepoId = location.state?.gitRepoId;

  const { getToken } = useAuth();
  const { mutate } = useCreateReportMutation();

  // ⭐ 추가: effect 중복 실행 방지
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
        }
      );
    };

    create();
  }, []);

  return (
    <div className="flex flex-col w-full items-center justify-center pt-50">
      <Loading className="w-[300px]" />
      <p className="text-3xl font-bold text-ui-900">리포트를 생성하는 중이에요</p>
      <div className="flex-col gap-[1.6rem] items-center mt-[3rem]">
        <p className="text-badge-text-primary w-fit text-sm font-bold px-[0.8rem] py-[0.4rem] bg-badge-bg-primary rounded-lg">
          Tip
        </p>
        <p className=" text-ui-600 text-xl font-medium text-center">
          나와 맞는 프로젝트와 개발자를
          <br />
          추천 프로젝트/개발자 탭에서 확인해보세요.
        </p>
      </div>
    </div>
  );
};

export default ReportLoadingPage;
