import ReportCard from '@components/report/ReportCard';
import Blank from '@components/report/Blank';
// import { useNavigate } from 'react-router-dom';
import TabMenu from '@components/report/TabMenu';
import { useState } from 'react';

const ReportPage = () => {
  const [activeTab, setActiveTab] = useState('전체');

  // const navigate = useNavigate();
  const tabs = ['전체', '메인 리포트', '상세 리포트'];

  return (
    <div className="flex h-full flex-col">
      {/* 상단 탭 */}
      <div className="flex gap-[1.2rem]">
        {tabs.map((tab) => (
          <TabMenu
            key={tab}
            text={tab}
            isActive={activeTab === tab}
            onClick={() => setActiveTab(tab)}
          />
        ))}
      </div>

      {/* 하단 컨텐츠 영역 */}
      <div className="flex flex-1 items-center justify-center gap-[1.6rem]">
        <Blank />
         {/*<ReportCard type="create" />*/}
         {/*<ReportCard type="main" />*/}
      </div>
    </div>
  );
};

export default ReportPage;
