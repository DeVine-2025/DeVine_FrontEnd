import { jsx as _jsx } from "react/jsx-runtime";
// src/pages/main/main-page.tsx
import { useThemeStore } from '@store/theme';
const MainPage = () => {
    const toggleTheme = useThemeStore((s) => s.toggleTheme);
    return (_jsx("div", { className: "p-6 flex flex-col gap-6", children: _jsx("button", { type: "button", onClick: toggleTheme, className: "rounded-md bg-white000 px-3 py-2", children: "UI \uBAA8\uB4DC \uD1A0\uAE00" }) }));
};
export default MainPage;
