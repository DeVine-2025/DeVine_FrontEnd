import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useUser } from '@clerk/clerk-react';
import { useAuthMe } from '@hooks/useAuthMe';

import CheckBox from '@components/report/CheckBox';
import GithubRepoListSkeleton from '@components/report/GithubRepoListSkeleton';
import { cn } from '@libs/cn';
import { useThemeStore } from '@store/theme';
import { myInfoQueries } from '@apis/myInfo/myInfo-queries';
import { BeatLoader } from 'react-spinners';

const ReportCreatePage = () => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  const { user } = useUser();
  const memberQuery = useAuthMe();
  const githubLinked = user?.externalAccounts.some((account) => account.provider === 'github');

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    ...myInfoQueries.reposInfinite(),
    queryKey: ['repos', import.meta.env.VITE_API_BASE_URL, user?.id],
    enabled: memberQuery.data?.isRegistered === true,
  });

  const repo =
    data?.pages.flatMap((page) => page.result?.content ?? []) ?? [];

  const navigate = useNavigate();
  const errorCode = isAxiosError(error) ? error.response?.data?.code : undefined;
  const needsSignup = errorCode === 'AUTH403_1';
  const needsGithub = errorCode === 'AUTH404_1' && githubLinked === false;
  const authenticationFailed = isAxiosError(error) && error.response?.status === 401;
  const feedback = needsSignup
    ? '서비스 회원가입을 완료해야 레포지토리를 불러올 수 있어요.'
    : needsGithub
      ? '레포지토리를 불러오려면 GitHub 계정을 연결해 주세요.'
      : authenticationFailed
        ? '로그인 인증을 확인하지 못했어요. 다시 시도해 주세요.'
        : '레포지토리 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.';
  const actionLabel = needsSignup ? '회원가입 계속하기'
    : needsGithub ? 'GitHub 연결하기'
    : isError || repo.length === 0 ? '다시 불러오기' : '생성하기';

  const toggleCheckbox = (id: number) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const handleCreateRepo = async () => {
    if (needsSignup) {
      await memberQuery.refetch();
      return;
    }
    if (needsGithub) {
      navigate('/my-info/setting');
      return;
    }
    if (isError || repo.length === 0) {
      await refetch();
      return;
    }
    if (!selectedId) return;
    navigate('/report/loading', { state: { gitRepoId: selectedId } });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 30 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <div className="flex min-h-full w-full items-center justify-center px-4 py-[8rem]">
      <div className="flex w-full max-w-[44rem] flex-col gap-[2.4rem]">

        {/* 헤더 */}
        <div className="flex flex-col gap-[0.5rem]">
          <h2
            className={cn(
              'text-[2.4rem] font-bold tracking-tight',
              isLight ? 'text-[var(--ui-900)]' : 'text-white/90',
            )}
          >
            깃허브 레포지토리 목록
          </h2>
          <p className={cn('text-[1.4rem]', isLight ? 'text-[var(--ui-500)]' : 'text-white/35')}>
            리포트를 생성할 레포지토리를 선택해 주세요
          </p>
        </div>

        {/* 목록 패널 */}
        <div
          className={cn(
            'flex flex-col gap-[0.5rem] h-[32rem] overflow-y-auto overflow-x-hidden rounded-[16px] border p-[0.8rem] scroll-smooth',
            isLight
              ? 'border-[var(--ui-200)] bg-[var(--ui-50)]'
              : 'border-white/[0.07] bg-white/[0.02]',
          )}
          onScroll={handleScroll}
        >
          {isLoading ? (
            <GithubRepoListSkeleton count={6} variant="report-create" />
          ) : isError ? (
            <div role="alert" className="flex h-full items-center justify-center p-6 text-center text-ui-600">
              {feedback}
            </div>
          ) : (
            <>
              {repo.map((item) => (
                <CheckBox
                  key={item.gitRepoId}
                  title={item.name}
                  description={item.description}
                  isExist={item.hasReport}
                  isActive={selectedId === item.gitRepoId}
                  onClick={() => toggleCheckbox(item.gitRepoId)}
                />
              ))}

              {repo.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center gap-[1rem]">
                  <p className={cn('text-center text-2xl', isLight ? 'text-[var(--ui-600)]' : 'text-white/35')}>
                    불러올 레포지토리가 없습니다.
                  </p>
                  <p className={cn('text-center text-xl', isLight ? 'text-[var(--ui-500)]' : 'text-white/25')}>
                    GitHub의 저장소와 접근 권한을 확인한 뒤 다시 불러와 주세요.
                  </p>
                </div>
              )}

              {isFetchingNextPage && (
                <div className="flex justify-center py-4">
                  <BeatLoader size={8} />
                </div>
              )}
            </>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex flex-col gap-[1rem]">
          <button
            type="button"
            onClick={() => void handleCreateRepo()}
            disabled={isFetching || (!isError && !selectedId && repo.length > 0)}
            className="w-full cursor-pointer rounded-[16px] bg-[#6654F5] py-[1.5rem] text-[1.6rem] font-semibold text-white transition-opacity duration-150 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isLoading ? '불러오는 중…' : actionLabel}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className={cn(
              'w-full cursor-pointer rounded-[16px] border py-[1.5rem] text-[1.6rem] font-medium transition-all duration-150',
              isLight
                ? 'border-[var(--ui-200)] bg-[var(--ui-50)] text-[var(--ui-600)] hover:border-[var(--ui-300)] hover:bg-[var(--ui-100)] hover:text-[var(--ui-800)]'
                : 'border-white/[0.07] bg-white/[0.02] text-white/40 hover:border-white/[0.12] hover:bg-white/[0.05] hover:text-white/60',
            )}
          >
            돌아가기
          </button>
        </div>

      </div>
    </div>
  );
};

export default ReportCreatePage;
