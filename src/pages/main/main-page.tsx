import { toggleTheme } from '@store/theme';

const MainPage = () => {
  return (
    <div className={'flex items-center gap-2 rounded-md bg-surface py-2 text-sm'}>
      <p>메인페이지 입니다.</p>
      <button type="button" onClick={toggleTheme} className="rounded-md bg-white000">
        ui모드 변경버튼
      </button>
    </div>
  );
};

export default MainPage;
