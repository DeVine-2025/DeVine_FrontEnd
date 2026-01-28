import { useEffect, useMemo, useRef } from 'react';

type ProjectTypeDropdownProps = {
  open: boolean;
  value: string[];
  onChange: (next: string[]) => void;
  onApply?: () => void;
  onReset?: () => void;
  onClose: () => void;
};

const OPTIONS = ['전체', '웹', '모바일/앱', '게임', '블록체인', '기타'] as const;

function CheckIcon() {
  return (
    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true">
      <path
        d="M11 1L4.75 7L1 3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ProjectTypeDropdown({
  open,
  value,
  onChange,
  onApply,
  onReset,
  onClose,
}: ProjectTypeDropdownProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const realOptions = useMemo(
    () => OPTIONS.filter((o) => o !== '전체') as unknown as string[],
    [],
  );
  // value에 '전체'가 들어와도 내부에서는 실제 옵션만 관리
  const selected = useMemo(() => new Set(value.filter((v) => v !== '전체')), [value]);

  useEffect(() => {
    if (!open) return;

    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      // 드롭다운을 여는 트리거 버튼이 같은 래퍼(div.relative) 안에 있어서,
      // 래퍼 기준으로 "밖 클릭"을 판단해야 클릭 즉시 닫히는 이슈를 막을 수 있음.
      const root = ref.current?.parentElement ?? ref.current;
      if (root && !root.contains(target)) onClose();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const toggle = (opt: string) => {
    // '전체'를 누르면 모든 항목 체크/해제
    if (opt === '전체') {
      const allSelected = selected.size === realOptions.length;
      onChange(allSelected ? [] : [...realOptions]);
      return;
    }

    const next = new Set(selected);
    if (next.has(opt)) next.delete(opt);
    else next.add(opt);

    // 모든 항목이 선택되면 결과는 전체 선택 상태로(= 모든 옵션 배열)
    onChange(next.size === realOptions.length ? [...realOptions] : Array.from(next));
  };

  return (
    <div
      ref={ref}
      className="absolute left-0 top-[calc(100%+12px)] z-50 w-[220px] overflow-hidden rounded-[12px] border border-[var(--ui-100)] bg-[var(--ui-50)] shadow-[0px_12px_24px_0px_rgba(0,0,0,0.28)]"
    >
      <div className="px-[16px] pb-[8px] pt-[16px]">
        <p className="Label1 font-medium text-[var(--ui-500)]">프로젝트 유형</p>
      </div>

      <div className="flex flex-col pb-[8px]">
        {OPTIONS.map((opt) => {
          const isChecked = opt === '전체' ? selected.size === realOptions.length : selected.has(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className="group relative flex w-full items-center gap-[12px] px-[16px] py-[8px] text-left"
            >
              {/* hover 시 한 줄 전체(둥근 영역) 채우기 */}
              <span
                aria-hidden
                className="absolute inset-x-[8px] inset-y-[2px] rounded-[12px] bg-[var(--ui-100)] opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100"
              />
              <span
                aria-hidden
                className={`relative z-10 inline-flex h-[20px] w-[20px] items-center justify-center rounded-[4px] border ${
                  isChecked
                    ? 'border-[#4E49FF] bg-[#4E49FF] text-white'
                    : 'border-[var(--ui-300)] bg-[var(--ui-bg)] text-transparent'
                }`}
              >
                <CheckIcon />
              </span>
              <span className="Caption1 relative z-10 font-medium text-[var(--ui-1000)]">{opt}</span>
            </button>
          );
        })}

        <div className="mt-[8px] flex h-[52px] w-full items-center justify-end gap-[12px] px-[16px]">
          <button
            type="button"
            onClick={() => {
              onReset?.();
              onChange([]);
            }}
            className="Label1 flex h-[36px] w-[60px] items-center justify-center rounded-[8px] bg-transparent px-[10px] text-[var(--ui-500)] hover:text-[var(--ui-700)]"
          >
            초기화
          </button>
          <button
            type="button"
            onClick={() => {
              onApply?.();
              onClose();
            }}
            className="Label1 flex h-[36px] w-[60px] items-center justify-center rounded-[8px] bg-[#4E49FF] px-[10px] text-white"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

