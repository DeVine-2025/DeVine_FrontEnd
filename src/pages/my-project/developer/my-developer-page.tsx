import MyDevTopSection, { type DevTab } from '@components/myProject/MyDevTopSection';
import { useState } from 'react';

const MyDeveloperPage = () => {
  const [devTab, setDevTab] = useState<DevTab>('suggested');

  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-[1180px] pb-20">
        <MyDevTopSection devTab={devTab} onChangeDevTab={setDevTab} />
      </div>
    </div>
  );
};

export default MyDeveloperPage;
