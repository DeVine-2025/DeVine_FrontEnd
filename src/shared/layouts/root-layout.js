import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from 'react-router-dom';
import Header from '@layouts/header';
import Footer from '@layouts/footer';
const RootLayout = () => {
    return (_jsxs("div", { className: 'min-h-[100vh] flex flex-col', children: [_jsx(Header, {}), _jsx("main", { className: 'flex-1 px-6 py-8', children: _jsx(Outlet, {}) }), _jsx(Footer, {})] }));
};
export default RootLayout;
