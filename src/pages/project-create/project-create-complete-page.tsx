import CheckIcon from '@assets/icons/check.svg?react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const ProjectCreateCompletePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const projectId = (location.state as { projectId?: number })?.projectId;

  useEffect(() => {
    if (projectId == null) {
      navigate('/', { replace: true });
    }
  }, [projectId, navigate]);

  if (projectId == null) {
    return null;
  }

  return (
    <div className="flex min-h-[72vh] w-full items-center justify-center px-6 py-24">
      <article className="flex w-full max-w-[420px] flex-col items-center rounded-2xl border border-[var(--ui-200)] bg-[var(--ui-bg)] p-12 shadow-[0_4px_24px_rgba(0,0,0,0.06)] sm:p-14">
        {/* 성공 아이콘: 참고 이미지처럼 원형 + 체크 */}
        <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)]">
          <CheckIcon className="h-7 w-6" aria-hidden />
        </div>

        <h1 className="Title3 mb-2 text-center font-bold tracking-tight text-[var(--ui-900)]">
          프로젝트 등록이 완료되었어요
        </h1>
        <p className="Body1 mb-10 text-center leading-relaxed text-[var(--ui-600)]">
          프로젝트를 보고 지원할 개발자들을 만나보세요.
        </p>

        <div className="flex w-full flex-col items-center gap-4">
          <Link
            to={`/project/${projectId}`}
            className="Body1 flex h-[52px] w-full items-center justify-center rounded-xl bg-[var(--color-primary)] font-semibold text-white transition-all duration-200 ease-out hover:-translate-y-px hover:opacity-95 active:translate-y-0 active:opacity-100"
          >
            내 프로젝트 글 보러 가기
          </Link>
          <Link
            to="/"
            className="Body1 text-[var(--ui-600)] transition-colors hover:text-[var(--ui-800)]"
          >
            메인으로 가기
          </Link>
        </div>
      </article>
    </div>
  );
};

export default ProjectCreateCompletePage;
