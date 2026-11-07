import MatchingDesignPreview from '@components/myProject/MatchingDesignPreview';
import MyPMTopSection from '@components/myProject/MyPMTopSection';
import { useState } from 'react';

export default function MyPMPage() {
  const [preview, setPreview] = useState(import.meta.env.DEV);

  return <div className="pb-16">
    {import.meta.env.DEV && <div className="mb-[8px] flex flex-wrap items-center justify-between gap-x-[12px] text-[12px] text-[var(--text-secondary)]">
      <span>{preview ? '예시 내역 · 응답은 실제로 전송되지 않아요' : '내 계정의 내역'}</span>
      <button type="button" className="min-h-[44px] rounded-md px-2 font-medium focus-visible:outline-2 focus-visible:outline-[var(--project-accent)] hover:bg-[var(--surface-card)] hover:text-[var(--text-main)]" onClick={() => setPreview((current) => !current)}>
        {preview ? '실제 데이터 보기' : '예시 보기'}
      </button>
    </div>}
    {preview ? <MatchingDesignPreview role="pm" /> : <MyPMTopSection />}
  </div>;
}
