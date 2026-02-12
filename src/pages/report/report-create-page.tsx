import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';

import LoadingSpinner from '@components/common/LoadingSpinner';
import CheckBox from '@components/report/CheckBox';
import { myInfoQueries } from '@apis/myInfo/myInfo-queries';
import { BeatLoader } from 'react-spinners';

const ReportCreatePage = () => {
  const [selectedId, setSelectedId] = useState<number | null>(null);

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

    navigate('/report/loading', {
      state: {
        gitRepoId: selectedId,
      },
    });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    const isBottom = scrollTop + clientHeight >= scrollHeight - 30;

    if (isBottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <div className="mt-[8rem] flex w-full items-center justify-center">
      <div className="w-[41.5rem] flex-col gap-[2.4rem]">
        <p className="Heading2 font-bold text-[var(--ui-1000)]">
          깃허브 레포지토리 목록
        </p>

        <div
          className="flex-col gap-[0.8rem] h-[320px] overflow-hidden overflow-y-scroll"
          onScroll={handleScroll}
        >
          {/* 레포 리스트 */}
          {!isLoading &&
            repo.map((item) => (
              <CheckBox
                key={item.gitRepoId}
                title={item.name}
                description={item.description}
                isActive={selectedId === item.gitRepoId}
                onClick={() => toggleCheckbox(item.gitRepoId)}
              />
            ))}

          {!isLoading && repo.length === 0 && (
            <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-[1.2rem] rounded-2xl bg-[var(--ui-50)] py-[3rem]">
              <p className="text-center text-2xl text-[var(--ui-600)]">
                연동된 레포지토리가 없습니다.
              </p>
              <p className="text-center text-xl text-[var(--ui-500)]">
                아래 버튼을 누르면 깃허브 연동 페이지로 이동합니다.
              </p>
            </div>
          )}

          {/* 최초 로딩 */}
          {isLoading && (
            <div className="flex h-full items-center justify-center gap-3">
              <LoadingSpinner size="lg" />
            </div>
          )}

          {/* 다음 페이지 로딩 */}
          {isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <BeatLoader size={8} />
            </div>
          )}
        </div>
        <div className="mt-[4.7rem] flex-col-center gap-[1.4rem]">
          <button
            type="button"
            onClick={handleCreateRepo}
            disabled={isLoading}
            className="w-full cursor-pointer rounded-2xl bg-primary py-[1.6rem] text-2xl text-white"
          >
            {!isLoading && repo.length === 0 ? '깃허브 연동하러 가기' : '생성하기'}
          </button>
          <button
            type="button"
            className="w-full cursor-pointer rounded-2xl bg-surface-tab py-[1.6rem] text-2xl text-[var(--ui-500)]"
            onClick={() => navigate(-1)}
          >
            돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportCreatePage;
