import {useState} from 'react';
import TabMenu from '@pages/report/components/tab-menu';

const ReportPage = () => {
  const [activeTab, setActiveTab] = useState('전체');

  const tabs = ["전체", "메인 리포트", "상세 리포트"];

  return (
    <div>
      <div className="h-full">
        <div className="flex max-w-[144rem] gap-[1.2rem] pl-[10rem]">
          {tabs.map(tab => (
            <TabMenu
              key={tab}
              text={tab}
              isActive={activeTab === tab}
              onClick={() => setActiveTab(tab)}
            />
          ))}
        </div>
        </div>

      </div>
      );
      };

      export default ReportPage;