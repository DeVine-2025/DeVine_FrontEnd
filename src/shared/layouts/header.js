import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useLocation } from 'react-router-dom';
import { useThemeStore } from '@store/theme';
import DarkLogo from '@assets/icons/logo-dark.svg?react';
import LightLogo from '@assets/icons/logo-light.svg?react';
import AlarmIcon from '@assets/icons/alarm.svg?react';
import ModeSettingIcon from '@assets/icons/mode-setting.svg?react';
const Header = () => {
    const { theme, toggleTheme } = useThemeStore();
    const location = useLocation();
    const navItems = [
        { path: '/search', label: '프로젝트/개발자 보기' },
        { path: '/recommend', label: '추천 프로젝트/개발자' },
        { path: '/matching', label: '리포트' },
        { path: '/my-project', label: '내 프로젝트' },
    ];
    const isActive = (path) => {
        return location.pathname.startsWith(path);
    };
    return (_jsx("header", { className: "bg-[var(--ui-bg)] w-screen h-[6rem] relative left-1/2 -translate-x-1/2", children: _jsxs("div", { className: "max-w-[144rem] mx-auto px-[12rem] h-full flex-row-between", children: [_jsxs("div", { className: "flex-items-center gap-[4.8rem]", children: [_jsx(Link, { to: "/", className: "flex-items-center gap-[0.4rem]", children: theme === 'dark' ? _jsx(LightLogo, {}) : _jsx(DarkLogo, {}) }), _jsx("nav", { className: "flex-items-center gap-[5rem]", children: navItems.map((item) => (_jsx(Link, { to: item.path, className: `Label1 px-[0.6rem] py-[0.4rem] ${isActive(item.path)
                                    ? 'text-[var(--ui-800)]'
                                    : 'text-[var(--ui-400)]'}`, children: item.label }, item.path))) })] }), _jsxs("div", { className: "flex-items-center gap-[1.2rem]", children: [_jsx("button", { type: "button", onClick: toggleTheme, className: "bg-[var(--ui-bg)] flex-row-center p-[0.4rem] rounded-[8px] size-[3.6rem] transition-transform duration-200 hover:scale-110 hover:bg-[var(--ui-100)]", children: _jsx(ModeSettingIcon, { className: "size-[2.4rem] transition-colors duration-200" }) }), _jsx("button", { type: "button", className: "bg-[var(--ui-bg)] flex-row-center p-[0.4rem] rounded-[8px] size-[3.6rem]", children: _jsx(AlarmIcon, { className: "size-[2.4rem]" }) }), _jsx(Link, { to: "/login", className: "border border-[var(--badge-text-primary)] flex-row-center h-[2.8rem] px-[1rem] py-[0.6rem] rounded-[8px]", children: _jsx("span", { className: "Caption1 text-[var(--ui-900)]", children: "\uD68C\uC6D0\uAC00\uC785/\uB85C\uADF8\uC778" }) })] })] }) }));
};
export default Header;
