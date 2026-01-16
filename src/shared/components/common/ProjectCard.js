import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@libs/cn';
import BookmarkIcon from '@assets/icons/bookmark.svg?react';
import BookmarkFilled from '@assets/icons/bookmark-filled.svg?react';
const badgeToneToClass = {
    blue: 'bg-badge-bg-blue text-badge-text-blue',
    green: 'bg-badge-bg-green text-badge-text-green',
    pink: 'bg-badge-bg-pink text-badge-text-pink',
    orange: 'bg-badge-bg-orange text-badge-text-orange',
};
export default function ProjectCard({ id, categoryLabel, deadlineLabel, thumbnailUrl, thumbnailAlt, title, subtitle, location, period, mode, roles, bookmarked = false, onBookmarkChange, size = 'medium', className, }) {
    const meta = [location, period, mode].filter(Boolean).join(' | ');
    const sizeClasses = {
        small: 'min-h-[150px] gap-6 p-4',
        medium: 'min-h-[200px] gap-10 p-6',
        large: 'min-h-[250px] gap-12 p-8',
    };
    const thumbnailSizeClasses = {
        small: 'h-[100px] w-[100px]',
        medium: 'h-[140px] w-[140px]',
        large: 'h-[180px] w-[180px]',
    };
    const titleSizeClasses = {
        small: 'text-xl',
        medium: 'text-2xl',
        large: 'text-3xl',
    };
    return (_jsxs("article", { className: cn('max-w-[980px] w-full', 'flex items-center', 
        // border/bg 토큰 적용
        'rounded-2xl border border-card-border bg-card-bg', sizeClasses[size], className), children: [_jsx("div", { className: "shrink-0", children: thumbnailUrl ? (_jsx("img", { src: thumbnailUrl, alt: thumbnailAlt !== null && thumbnailAlt !== void 0 ? thumbnailAlt : title, className: cn('rounded-2xl object-cover bg-card-section-bg', thumbnailSizeClasses[size]), loading: "lazy" })) : (_jsx("div", { className: cn('rounded-2xl bg-card-section-bg', thumbnailSizeClasses[size]) })) }), _jsxs("div", { className: "min-w-0 flex flex-1 flex-col justify-center gap-4", children: [_jsxs("div", { className: "flex items-center", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-4", children: [categoryLabel && (_jsx("span", { className: "inline-flex rounded-full bg-badge-bg-gray px-4 py-1 text-md font-medium text-badge-text-gray", children: categoryLabel })), deadlineLabel && (_jsx("span", { className: "inline-flex rounded-full bg-badge-bg-gray px-4 py-1 text-md font-medium text-badge-text-gray", children: deadlineLabel }))] }), _jsx("button", { type: "button", "aria-pressed": bookmarked, onClick: () => onBookmarkChange === null || onBookmarkChange === void 0 ? void 0 : onBookmarkChange(!bookmarked, id), className: "ml-auto rounded-lg p-2 text-card-muted hover:opacity-80", children: bookmarked ? (_jsx(BookmarkFilled, { "aria-hidden": "true", className: "h-8 w-8 text-card-title" })) : (_jsx(BookmarkIcon, { "aria-hidden": "true", className: "h-8 w-8 text-card-muted" })) })] }), _jsxs("div", { className: "min-w-0", children: [_jsx("h3", { className: "line-clamp-2 text-2xl font-semibold leading-snug text-card-title pl-1", children: title }), subtitle && (_jsx("h3", { className: "line-clamp-2 text-xl font-semibold leading-snug text-card-title pl-1", children: subtitle })), meta && _jsx("div", { className: "mt-2 truncate text-base text-card-muted pl-1", children: meta })] }), roles && roles.length > 0 && (_jsx("div", { className: "mt-1 flex items-center gap-10", children: roles.slice(0, 2).map((r) => (_jsx("div", { className: "flex min-w-0 flex-1 items-center", children: _jsxs("div", { className: "min-w-0", children: [_jsx("span", { className: cn('inline-flex rounded-full px-4 py-2 text-base font-semibold', badgeToneToClass[r.tone]), children: r.label }), _jsxs("div", { className: "mt-2 ml-2 flex items-center gap-4 text-md text-card-muted", children: [_jsxs("span", { className: "inline-flex items-center gap-3", children: [_jsx("span", { "aria-hidden": "true", children: "\uD83D\uDC64" }), _jsxs("span", { className: "font-medium", children: [r.current, "/", r.total] })] }), _jsx("span", { className: "h-4 w-px bg-card-divider", "aria-hidden": "true" }), r.techStack && r.techStack.length > 0 && (_jsx("div", { className: "flex items-center gap-2", children: r.techStack.map((t) => (_jsx("span", { className: "inline-flex items-center", children: t.icon }, t.id))) }))] })] }) }, r.key))) }))] })] }));
}
