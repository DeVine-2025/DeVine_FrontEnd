import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer className="-translate-x-1/2 relative left-1/2 w-screen bg-[var(--ui-bg)] py-[2rem]">
      <div className="mx-auto max-w-[144rem] flex-col-center gap-[0.5rem] px-[6rem]">
        {/* 상단: 이용약관, 개인정보처리방침, 서비스 소개 */}
        <div className="mb-[0.8rem] flex-items-center gap-[2.4rem]">
          <button
            type="button"
            onClick={() => navigate('/terms/service')}
            className="Label1 cursor-pointer text-[var(--ui-600)] transition-colors hover:text-[var(--ui-800)]"
          >
            이용약관
          </button>
          <div className="h-[1.2rem] w-[1px] bg-[var(--ui-600)] opacity-30" />
          <button
            type="button"
            onClick={() => navigate('/terms/privacy')}
            className="Label1 cursor-pointer text-[var(--ui-600)] transition-colors hover:text-[var(--ui-800)]"
          >
            개인정보처리방침
          </button>
          <div className="h-[1.2rem] w-[1px] bg-[var(--ui-600)] opacity-30" />
          <a
            href="/service"
            target="_blank"
            rel="noopener noreferrer"
            className="Label1 cursor-pointer text-[var(--ui-600)] transition-colors hover:text-[var(--ui-800)]"
          >
            서비스 소개
          </a>
        </div>

        {/* 하단: Contact, Copyright */}
        <div className="flex-col-center gap-[0.5rem]">
          <p className="Caption1 font-medium text-[11px] text-[var(--ui-600)]">Contact</p>
          <p className="Caption1 text-center font-medium text-[11px] text-[var(--ui-600)]">
            Copyright Devine. All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
