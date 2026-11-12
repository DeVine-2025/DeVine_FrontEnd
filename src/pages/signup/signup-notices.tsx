type Props = {
  isStayModalOpen: boolean;
  isWaitModalOpen: boolean;
  onCloseStay: () => void;
  onCloseWait: () => void;
};
export default function SignupNotices({
  isStayModalOpen,
  isWaitModalOpen,
  onCloseStay,
  onCloseWait,
}: Props) {
  return (
    <>
      {' '}
      {isStayModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-6">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="signup-stay-title"
            aria-describedby="signup-stay-description"
            className="w-full max-w-[400px] rounded-2xl border border-white/[0.1] bg-[#191a23] px-7 pb-7 pt-8 text-center shadow-[0_24px_70px_rgba(0,0,0,0.35)]"
          >
            <h2
              id="signup-stay-title"
              className="text-[20px] font-semibold tracking-[-.03em] text-[#f5f5f7]"
            >
              회원정보 입력이 필요해요
            </h2>
            <p id="signup-stay-description" className="mt-3 text-[14px] leading-6 text-[#b5b7c2]">
              계속 사용하려면 회원가입 정보를 입력해 주세요.
            </p>
            <button
              type="button"
              onClick={onCloseStay}
              className="mt-7 h-[50px] w-full cursor-pointer rounded-[10px] bg-[var(--project-accent)] text-[15px] font-semibold text-[#191824] transition-colors hover:bg-[color-mix(in_srgb,var(--project-accent)_85%,white)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--project-accent)]"
            >
              회원가입 계속하기
            </button>
          </div>
        </div>
      )}
      {isWaitModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-6">
          <div className="w-full max-w-[360px] rounded-[24px] bg-[var(--ui-bg)] px-8 pb-8 pt-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
            <h2 className="text-[18px] font-semibold text-[var(--ui-900)]">리포트 제작 중이에요</h2>
            <p className="mt-2 text-[13px] text-[var(--ui-400)]">
              제작이 끝날 때까지 잠시만 기다려 주세요.
            </p>
            <button
              type="button"
              onClick={onCloseWait}
              className="mt-6 h-[48px] w-full rounded-[12px] bg-[#6654F5] text-[16px] font-semibold text-white"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </>
  );
}
