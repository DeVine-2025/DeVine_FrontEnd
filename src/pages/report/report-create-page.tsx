import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';

import CheckBox from './_components/CheckBox';
import GithubRepoListSkeleton from './_components/GithubRepoListSkeleton';
import { cn } from '@libs/cn';
import { useThemeStore } from '@store/theme';
import { myInfoQueries } from '@apis/myInfo/myInfo-queries';
import { BeatLoader } from 'react-spinners';

const ReportCreatePage = () => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { theme } = useThemeStore();
  const isLight = theme === 'light';

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(myInfoQueries.reposInfinite());

  const repo =
    data?.pages.flatMap((page) => page.result?.content ?? []) ?? [];

  const navigate = useNavigate();

  const toggleCheckbox = (id: number) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const handleCreateRepo = () => {
    if (!isLoading && repo.length === 0) {
      navigate('/my-info/setting');
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
                    연동된 레포지토리가 없습니다.
                  </p>
                  <p className={cn('text-center text-xl', isLight ? 'text-[var(--ui-500)]' : 'text-white/25')}>
                    아래 버튼을 누르면 깃허브 연동 페이지로 이동합니다.
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
            onClick={handleCreateRepo}
            disabled={isLoading || (!selectedId && repo.length > 0)}
            className="w-full cursor-pointer rounded-[16px] bg-[#4E49FF] py-[1.5rem] text-[1.6rem] font-semibold text-white transition-opacity duration-150 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {!isLoading && repo.length === 0 ? '깃허브 연동하러 가기' : '생성하기'}
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
