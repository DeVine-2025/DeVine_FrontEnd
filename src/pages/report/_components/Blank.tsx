import ReportDark from '@assets/icons/report-dark.svg?react';
import ReportLight from '@assets/icons/report-light.svg?react';
import { useThemeStore } from '@store/theme.store';
import { useNavigate } from 'react-router-dom';

const Blank = () => {
  const { theme } = useThemeStore();
  const navigate = useNavigate();

  return (
    <div className="mt-30 h-full w-full flex-col-center gap-[2rem]">
      {theme === 'dark' ? <ReportDark /> : <ReportLight />}
      <p className="text-center font-semibold text-3xl text-[var(--ui-500)]">
        아직 생성된 리포트가 없어요
      </p>
      <p className="Heading2 text-center text-[var(--ui-500)]">
        리포트를 생성하면 프로젝트 핵심 내용을 요약해 드려요 <br /> 지금 바로 리포트를 만들어
        보세요!
      </p>
      <button
        type="button"
        className="cursor-pointer rounded-2xl bg-primary px-18 py-5 text-2xl text-white"
        onClick={() => navigate('/report/create')}
      >
        리포트 생성하기
      </button>
    </div>
  );
};

export default Blank;
