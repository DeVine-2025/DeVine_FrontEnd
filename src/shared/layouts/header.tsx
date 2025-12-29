import DarkLogo from "@assets/icons/logo-dark.svg?react";
import LightLogo from "@assets/icons/logo-light.svg?react";
import { useThemeStore } from '@store/theme';

const Header = () => {
  const theme = useThemeStore((state) => state.theme);
  return (
    <header>
      {theme === 'dark' ? <LightLogo /> : <DarkLogo />}
      <div className="text-menu-text">
        메뉴 테스트
      </div>
    </header>
  );
};

export default Header;