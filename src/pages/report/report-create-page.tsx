import Checkbox from '@pages/report/components/checkbox';
import { useState } from 'react';
import {useNavigate} from 'react-router-dom';

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

  const navigate = useNavigate();
  const toggleCheckbox = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="flex w-full justify-center items-center mt-[8rem]">
      <div className="w-[41.5rem] flex-col gap-[2.4rem]">
        <p className="text-[var(--ui-1000)] Title3 font-bold">깃허브 레포지토리 목록</p>
        <div className="flex-col gap-[0.8rem]">
          {CHECKBOX_ITEMS.map(item => (
            <Checkbox
              key={item.id}
              title={item.title}
              description={item.description}
              isActive={selectedIds.includes(item.id)}
              onClick={() => toggleCheckbox(item.id)}
            />
          ))}
        </div>
        <div className="mt-[4.7rem] flex-col-center gap-[1.4rem]">
          <button type="button"
                  className="bg-primary Title3 text-white py-[1.6rem] w-full rounded-2xl cursor-pointer">생성하기
          </button>
          <button type="button" className="text-[var(--ui-500)] Title3 py-[1.6rem] cursor-pointer" onClick={() => navigate(-1)}>돌아가기</button>
        </div>

      </div>


    </div>
  );
};

export default ReportCreatePage;