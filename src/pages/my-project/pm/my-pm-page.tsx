import MyPMTopSection, { type DevTab } from '@components/myProject/MyPMTopSection';
import { useState } from 'react';

const MyPMPage = () => {
  const [devTab, setDevTab] = useState<DevTab>('suggested');

  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-[1180px] pb-20">
        <MyPMTopSection devTab={devTab} onChangeDevTab={setDevTab} />
      </div>
    </div>
  );
};

export default MyPMPage;
