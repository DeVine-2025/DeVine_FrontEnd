import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {reportQueries} from '@apis/report/report-queries';
import {useQuery} from '@tanstack/react-query';

import CheckBox from '@components/report/CheckBox';
import { myInfoQueries } from '@apis/myInfo/myInfo-queries';

const CHECKBOX_ITEMS = [
  {
    id: 'dummy1',
    title: '더미데이터 1',
    description: '더미데이터 1',
  },
  {
    id: 'dummy2',
    title: '더미데이터 2',
    description: '더미데이터 2',
  },
  {
    id: 'dummy3',
    title: '더미데이터 3',
    description: '더미데이터 3',
  },
];

const ReportCreatePage = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const {data} = useQuery(myInfoQueries.repos());
  const repo = data?.result?.repos;

  console.log("마이레포", repo);

  const navigate = useNavigate();
  const toggleCheckbox = (id: string) => {
    setSelectedIds((prev) =>
      prev.indexOf(id) !== -1 ? prev.filter((itemId) => itemId !== id) : [...prev, id],
    );
  };

  return (
    <div className="mt-[8rem] flex w-full items-center justify-center">
      <div className="w-[41.5rem] flex-col gap-[2.4rem]">
        <p className="Heading2 font-bold text-[var(--ui-1000)]">깃허브 레포지토리 목록</p>
        <div className="flex-col gap-[0.8rem] h-[250px] overflow-hidden overflow-y-scroll">
          {repo?.map((item) => (
            <CheckBox
              key={item.id}
              title={item.name}
              description={item.description}
              isActive={selectedIds.indexOf(item.id) !== -1}
              onClick={() => toggleCheckbox(item.id)}
            />
          ))}
        </div>
        <div className="mt-[4.7rem] flex-col-center gap-[1.4rem]">
          <button
            type="button"
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
