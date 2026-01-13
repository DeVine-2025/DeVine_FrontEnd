const Footer = () => {
  return (
    <footer className="bg-[var(--ui-bg)] w-screen py-[40px] relative left-1/2 -translate-x-1/2">
      <div className="flex flex-col items-center gap-[8px] max-w-[1440px] mx-auto px-[80px]">
        {/* 상단: 이용약관, 개인정보처리방침, 서비스 소개 */}
        <div className="flex items-center gap-[36px] mb-[12px]">
          <button
            type="button"
            className="Heading2 text-[var(--ui-600)] hover:text-[var(--ui-800)] transition-colors"
          >
            이용약관
          </button>
          <div className="h-[16px] w-[1px] bg-[var(--ui-600)] opacity-30" />
          <button
            type="button"
            className="Heading2 text-[var(--ui-600)] hover:text-[var(--ui-800)] transition-colors"
          >
            개인정보처리방침
          </button>
          <div className="h-[16px] w-[1px] bg-[var(--ui-600)] opacity-30" />
          <button
            type="button"
            className="Heading2 text-[var(--ui-600)] hover:text-[var(--ui-800)] transition-colors"
          >
            서비스 소개
          </button>
        </div>

        {/* 하단: Contact, Copyright */}
        <div className="flex flex-col items-center gap-[8px]">
          <p className="Body1 text-[var(--ui-600)] font-medium">Contact</p>
          <p className="Body1 text-[var(--ui-600)] font-medium text-center">
            Copyright Devine. All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
