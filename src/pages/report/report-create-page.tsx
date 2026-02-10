import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';

import CheckBox from '@components/report/CheckBox';
import { myInfoQueries } from '@apis/myInfo/myInfo-queries';
import { BeatLoader } from 'react-spinners';

const ReportCreatePage = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data, isLoading } = useQuery(myInfoQueries.repos());
  const repo = data?.result?.repos;

  const navigate = useNavigate();

  const toggleCheckbox = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const handleCreateRepo = () => {
    if (!selectedId) return;

    navigate('/report/loading', {
      state: {
        gitRepoId: selectedId,
      },
    });
  };


  return (
    <div className="mt-[8rem] flex w-full items-center justify-center">
      <div className="w-[41.5rem] flex-col gap-[2.4rem]">
        <p className="Heading2 font-bold text-[var(--ui-1000)]">깃허브 레포지토리 목록</p>
        <div className="flex-col gap-[0.8rem] h-[250px] overflow-hidden overflow-y-scroll">
          {!isLoading && repo?.map((item) => (
            <CheckBox
              key={item.gitRepoId}
              title={item.name}
              description={item.description}
              isActive={selectedId === item.gitRepoId}
              onClick={() => toggleCheckbox(item.gitRepoId)}
            />
          ))}
          {isLoading && (
            <div className="flex-col items-center h-full justify-center gap-3">
              <BeatLoader/>
              <p className="text-ui-600 text-xl font-bold">레포지토리 불러오는 중..</p>
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
            생성하기
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
