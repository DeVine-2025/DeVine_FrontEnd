type RoleOption = { key: string; label: string };

type ApplyModalProps = {
  isDark: boolean;
  projectTitle: string;
  hasApplied: boolean;
  selectedRole: string | null;
  selectedRoleLabel: string;
  isRoleMenuOpen: boolean;
  isApplying: boolean;
  roleOptions: RoleOption[];
  onSelectRole: (key: string) => void;
  onToggleRoleMenu: () => void;
  onApply: () => void;
  onClose: () => void;
};

export default function ApplyModal({
  isDark,
  projectTitle,
  hasApplied,
  selectedRole,
  selectedRoleLabel,
  isRoleMenuOpen,
  isApplying,
  roleOptions,
  onSelectRole,
  onToggleRoleMenu,
  onApply,
  onClose,
}: ApplyModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-6">
      <div
        className="relative w-full max-w-[360px] rounded-[24px] px-8 pt-10 pb-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.2)]"
        style={{ backgroundColor: isDark ? '#212328' : '#FFFFFF' }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 text-[var(--ui-400)]"
          aria-label="닫기"
        >
          ✕
        </button>
        <div className="flex flex-col gap-2">
          <h2
            className="font-semibold text-[18px] leading-[24px]"
            style={{ color: isDark ? '#F8F9FB' : 'var(--ui-900)' }}
          >
            [{projectTitle}]
            <br />
            {hasApplied ? '지원 역할을 변경하시겠어요?' : '에 지원하시겠어요?'}
          </h2>
          <p className="text-[13px]" style={{ color: isDark ? '#9EA6BA' : 'var(--ui-400)' }}>
            {hasApplied
              ? '변경할 포지션을 선택해 주세요.'
              : '지원 후 PM이 수락 시 팀원으로 합류하게 됩니다.'}
          </p>
        </div>

        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="relative w-[240px]">
            <button
              type="button"
              onClick={onToggleRoleMenu}
              className="flex h-[40px] w-full items-center justify-between rounded-[12px] px-4 text-[14px]"
              style={{
                backgroundColor: isDark ? '#191B1E' : '#FFFFFF',
                border: `1px solid ${isDark ? '#41444D' : 'var(--ui-200)'}`,
                color: isDark ? '#F8F9FB' : 'var(--ui-700)',
              }}
            >
              <span
                className={selectedRole ? '' : 'text-[var(--ui-400)]'}
                style={{
                  color: selectedRole ? (isDark ? '#F8F9FB' : 'var(--ui-900)') : undefined,
                }}
              >
                {selectedRoleLabel}
              </span>
              <svg
                className={`h-4 w-4 transition-transform ${isRoleMenuOpen ? 'rotate-180' : ''}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {isRoleMenuOpen && (
              <div
                className="absolute z-10 mt-2 w-full rounded-[12px] py-2 shadow-[0_12px_30px_rgba(0,0,0,0.12)]"
                style={{
                  backgroundColor: isDark ? '#191B1E' : '#FFFFFF',
                  border: `1px solid ${isDark ? '#41444D' : 'var(--ui-200)'}`,
                }}
              >
                {roleOptions.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => onSelectRole(option.key)}
                    className="w-full px-4 py-2 text-left text-[14px]"
                    style={{
                      color: isDark ? '#F8F9FB' : 'var(--ui-900)',
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={!selectedRole}
            onClick={onApply}
            className={`h-[48px] w-full rounded-[12px] font-semibold text-[16px] ${
              selectedRole && !isApplying
                ? 'bg-[#4E49FF] text-white'
                : 'bg-[var(--ui-100)] text-[var(--ui-400)]'
            }`}
          >
            {isApplying
              ? hasApplied
                ? '수정 중...'
                : '지원 중...'
              : hasApplied
                ? '수정하기'
                : '지원하기'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-[14px] text-[var(--ui-400)]"
          >
            나중에 하기
          </button>
        </div>
      </div>
    </div>
  );
}
