import {useState} from 'react';
import TabMenu from '@pages/report/components/tab-menu';
import ReportCard from '@pages/report/components/report-card';
import Blank from '@pages/report/components/blank';

const ReportPage = () => {
  const [activeTab, setActiveTab] = useState('전체');


  const tabs = ["전체", "메인 리포트", "상세 리포트"];

  return (
    <div>
      <div className="w-full">
        <div className="max-w-[144rem] px-[8rem]">
          <div className="flex gap-[1.2rem]">
            {tabs.map(tab => (
              <TabMenu
                key={tab}
                text={tab}
                isActive={activeTab === tab}
                onClick={() => setActiveTab(tab)}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-[1.6rem] mt-[3.3rem]">
            <Blank/>
            {/*<ReportCard type="create"/>*/}
            {/*<ReportCard type="main"/>*/}
            {/*<ReportCard type="main"/>*/}
            {/*<ReportCard type="main"/>*/}
          </div>
        </div>

      </div>

    </div>
  );
};

      export default ReportPage;