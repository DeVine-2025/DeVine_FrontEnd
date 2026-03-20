import { createPortal } from 'react-dom';

type LoginModalProps = {
  isDark: boolean;
  onLogin: () => void;
  onClose: () => void;
};

export default function LoginModal({ isDark, onLogin, onClose }: LoginModalProps) {
  return createPortal(
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
            로그인 후 이용할 수 있어요
          </h2>
          <p className="text-[13px]" style={{ color: isDark ? '#9EA6BA' : 'var(--ui-400)' }}>
            해당 기능을 이용하려면 먼저 로그인해 주세요.
          </p>
        </div>

        <div className="mt-6 flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={onLogin}
            className="h-[48px] w-full cursor-pointer rounded-[12px] bg-[#4E49FF] font-semibold text-[16px] text-white"
          >
            로그인 하러가기
          </button>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer text-[14px] text-[var(--ui-400)]"
          >
            나중에 하기
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
