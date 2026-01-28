import MyPMDeveloperSection, { type DevTab } from '@components/myProject/MyPMTopSection';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MyPMDevelopersPage = () => {
  const [devTab, setDevTab] = useState<DevTab>('suggested');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-[1180px]">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-3xl text-card-muted hover:opacity-80"
        >
          <span aria-hidden="true">←</span>
        </button>
        <MyPMDeveloperSection devTab={devTab} onChangeDevTab={setDevTab} showMore={false} />
      </div>
    </div>
  );
};

export default MyPMDevelopersPage;
