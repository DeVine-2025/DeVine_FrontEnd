import MatchingDesignPreview from '@components/myProject/MatchingDesignPreview';
import MyDevTopSection, { type DevTab } from '@components/myProject/MyDevTopSection';
import { useState } from 'react';

const MyDeveloperPage = () => {
  const [preview, setPreview] = useState(import.meta.env.DEV);
  const [devTab, setDevTab] = useState<DevTab>('suggested');

  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-[1180px] pb-20">
        {import.meta.env.DEV && <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ui-200 bg-surface-tab px-5 py-4"><div><strong className="text-sm text-ui-900">{preview ? '디자인 미리보기' : '실제 지원 현황'}</strong><p className="mt-1 text-xs text-ui-600">{preview ? '예시 데이터입니다. 수락·거절은 이 화면에서만 반영됩니다.' : '계정에 연결된 지원 현황을 표시합니다.'}</p></div><button type="button" className="cursor-pointer rounded-lg border border-ui-300 px-3 py-2 text-sm text-ui-800" onClick={() => setPreview(!preview)}>{preview ? '실제 데이터 보기' : '디자인 미리보기'}</button></div>}
        {preview ? <MatchingDesignPreview role="developer" /> : <MyDevTopSection devTab={devTab} onChangeDevTab={setDevTab} />}
      </div>
    </div>
  );
};

export default MyDeveloperPage;
