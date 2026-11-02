import { Link, useLocation } from 'react-router-dom';
import '../chat/floating-chat-widget.css';

const FloatingProjectCreateCta = () => {
  const { pathname } = useLocation();

  if (pathname.startsWith('/project/create')) return null;

  return (
    <Link
      to="/project/create"
      aria-label="프로젝트 등록하기"
      className="devine-floating-action devine-floating-action-primary fixed right-[2.4rem] bottom-[2.4rem] z-[44] flex h-[4.8rem] items-center gap-[0.8rem] rounded-full border border-[#b3a6ff55] bg-[#a69bff] px-[1.8rem] text-[1.4rem] font-semibold whitespace-nowrap text-[#171923] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b9afff] max-[743px]:right-[1.6rem] max-[743px]:bottom-[1.6rem]"
    >
      <svg aria-hidden="true" className="size-[2rem] shrink-0" viewBox="0 0 24 24" fill="none">
        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      프로젝트 등록
    </Link>
  );
};

export default FloatingProjectCreateCta;
