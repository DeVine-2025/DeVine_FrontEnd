import MyBottomSection, { type ProjectTab } from '@components/myProject/MyBottomSection';
import MyDevTopSection, { type DevTab } from '@components/myProject/MyDevTopSection';
import { useState } from 'react';

const MyDeveloperPage = () => {
  const [devTab, setDevTab] = useState<DevTab>('suggested');
  const [projectTab, setProjectTab] = useState<ProjectTab>('ongoing');

  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-[1180px] pb-20">
        <h1 className="Heading2 pt-5 font-semibold text-card-title">내 프로젝트</h1>

        {/* ===== 상단 ===== */}
        <MyDevTopSection devTab={devTab} onChangeDevTab={setDevTab} />

        {/* 구분선 */}
        <div className="-translate-x-1/2 relative right-1/2 left-1/2 my-15 h-[15px] w-screen bg-profile-card-bg" />

        {/* ===== 하단 ===== */}
        <MyBottomSection projectTab={projectTab} onChangeProjectTab={setProjectTab} />
      </div>
    </div>
  );
};

export default MyDeveloperPage;
