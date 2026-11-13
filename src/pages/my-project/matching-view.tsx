import MatchingDesignPreview from '@components/myProject/MatchingDesignPreview';
import { useState, type ReactNode } from 'react';
import { useMockData } from '../../shared/config/data-mode';

export default function MatchingView({
  role,
  children,
}: {
  role: 'pm' | 'developer';
  children: ReactNode;
}) {
  const [preview, setPreview] = useState(useMockData);

  return (
    <div className="pb-16">
      {(import.meta.env.DEV || useMockData) && (
        <div className="mb-[8px] flex flex-wrap items-center justify-end gap-x-[12px] text-[12px] text-[var(--text-secondary)]">
          <button
            type="button"
            className="min-h-[44px] rounded-md px-2 font-medium focus-visible:outline-2 focus-visible:outline-[var(--project-accent)] hover:bg-[var(--surface-card)] hover:text-[var(--text-main)]"
            onClick={() => setPreview((current) => !current)}
          >
            {preview ? '실제 데이터 보기' : '예시 보기'}
          </button>
        </div>
      )}
      {preview ? <MatchingDesignPreview role={role} /> : children}
    </div>
  );
}
