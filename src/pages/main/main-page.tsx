// src/pages/main/main-page.tsx
import { useThemeStore } from '@store/theme';

const MainPage = () => {
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  return (
    <div className="p-6 flex flex-col gap-6">
      <button type="button" onClick={toggleTheme} className="rounded-md bg-white000 px-3 py-2">
        UI 모드 토글
      </button>
    </div>
  );
};

export default MainPage;
