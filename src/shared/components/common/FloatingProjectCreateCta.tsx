import { Link, useLocation } from 'react-router-dom';

const FloatingProjectCreateCta = () => {
  const { pathname } = useLocation();

  if (pathname.startsWith('/project/create')) return null;

  return (
    <Link
      to="/project/create"
      aria-label="프로젝트 등록하기"
      className="fixed right-[2.4rem] bottom-[4.4rem] z-[44] flex h-[4.8rem] items-center gap-[0.8rem] rounded-full border border-white/10 bg-[linear-gradient(180deg,#7965F5_0%,#7055F5_58%,#684FEA_100%)] px-[2rem] text-[1.4rem] font-semibold whitespace-nowrap text-white shadow-[0_0.6rem_1.4rem_rgba(75,55,190,0.22),inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_0_rgba(53,37,147,0.14)] transition-[box-shadow,filter] duration-200 hover:brightness-105 hover:shadow-[0_0.7rem_1.6rem_rgba(75,55,190,0.3),inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(53,37,147,0.14)] active:brightness-95 active:shadow-[0_0.4rem_0.9rem_rgba(75,55,190,0.2),inset_0_1px_2px_rgba(53,37,147,0.16)] max-[743px]:right-[1.6rem] max-[743px]:bottom-[3.6rem] max-[389px]:right-[1.2rem]"
    >
      <svg aria-hidden="true" className="size-[2rem] shrink-0" viewBox="0 0 24 24" fill="none">
        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      프로젝트 등록
    </Link>
  );
};

export default FloatingProjectCreateCta;
