import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useThemeStore } from '@store/theme';
const LoginPage = () => {
    const { theme } = useThemeStore();
    const handleGitHubLogin = () => {
        // TODO: Implement GitHub OAuth
        console.log('GitHub login clicked');
    };
    const handleGoogleLogin = () => {
        // TODO: Implement Google OAuth
        console.log('Google login clicked');
    };
    return (_jsx("div", { className: "min-h-screen bg-[var(--ui-bg)] flex items-center justify-center px-[2rem]", children: _jsxs("div", { className: "max-w-[48rem] w-full text-center", children: [_jsx("div", { className: "mb-[4rem]", children: _jsx("h1", { className: "text-6xl font-bold text-[var(--ui-900)] mb-[1rem]", children: "Devine" }) }), _jsxs("div", { className: "bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-[4rem] shadow-lg", children: [_jsx("h2", { className: "text-3xl font-semibold text-[var(--ui-900)] mb-[2rem]", children: "Devine one-line introduction" }), _jsxs("p", { className: "text-lg text-[var(--ui-600)] mb-[4rem] leading-relaxed", children: ["\uAC1C\uBC1C\uC790\uC640 \uD504\uB85C\uC81D\uD2B8\uB97C \uC5F0\uACB0\uD558\uB294 \uD50C\uB7AB\uD3FC\uC785\uB2C8\uB2E4.", _jsx("br", {}), "\uB2F9\uC2E0\uC758 \uC544\uC774\uB514\uC5B4\uB97C \uC2E4\uD604\uD560 \uCD5C\uACE0\uC758 \uD300\uC744 \uB9CC\uB098\uBCF4\uC138\uC694."] }), _jsxs("div", { className: "space-y-[1.5rem]", children: [_jsx("button", { onClick: handleGitHubLogin, className: "w-full bg-[var(--ui-900)] text-[var(--ui-50)] py-[1.5rem] px-[2rem] rounded-xl font-semibold text-lg transition-all duration-200 hover:bg-[var(--ui-800)] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[var(--ui-500)] focus:ring-offset-2", children: "Continue with GitHub account" }), _jsx("button", { onClick: handleGoogleLogin, className: "w-full bg-[var(--ui-50)] text-[var(--ui-900)] border-2 border-[var(--ui-300)] py-[1.5rem] px-[2rem] rounded-xl font-semibold text-lg transition-all duration-200 hover:bg-[var(--ui-100)] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[var(--ui-500)] focus:ring-offset-2", children: "Continue with Google account" })] }), _jsx("p", { className: "mt-[3rem] text-sm text-[var(--ui-500)]", children: "\uACC4\uC815\uC744 \uB9CC\uB4E4\uAC70\uB098 \uB85C\uADF8\uC778\uD558\uBA74 \uC774\uC6A9\uC57D\uAD00\uACFC \uAC1C\uC778\uC815\uBCF4\uCC98\uB9AC\uBC29\uCE68\uC5D0 \uB3D9\uC758\uD558\uAC8C \uB429\uB2C8\uB2E4." })] })] }) }));
};
export default LoginPage;
