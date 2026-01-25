import ReportLight  from "@assets/icons/report-light.svg?react";
import ReportDark  from "@assets/icons/report-dark.svg?react";
import { useThemeStore } from '@store/theme';

const Blank = () => {
  const {theme} = useThemeStore();
  return (
    <div className="flex-col-center gap-[2rem] w-full mt-[8.6rem]">
      {theme === "dark" ? <ReportDark /> : <ReportLight />}
      <p className="Title3 font-semibold text-center text-[var(--ui-500)]">아직 생성된 리포트가 없어요</p>
      <p className="Heading1 text-center text-[var(--ui-500)]">리포트를 생성하면 프로젝트 핵심 내용을 요약해 드려요 <br/> 지금 바로 리포트를 만들어 보세요!</p>
      <button className="bg-primary Title3 text-white py-[1.6rem] px-[8rem] rounded-2xl cursor-pointer">리포트 생성하기</button>
    </div>
  );
};

export default Blank;