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
export default function ProfileCard({ role, roleTone, nickname, profileImageUrl, profileImageAlt, id, location, experience, introduction, recommendationReason, badges, techStack, bookmarked = false, onBookmarkChange, size = 'md', className, }) {
    const normalize = (s) => (s !== null && s !== void 0 ? s : '').replace(/\s+/g, '').toLowerCase();
    const rootSizeClass = size === 'sm' ? 'card-size-sm' : 'card-container-md card-size-md';
    const avatarClass = size === 'sm' ? 'card-avatar-sm' : 'card-avatar-md';
    const meta = location && experience
        ? `${location} | ${experience}`
        : location || experience || '';
    // 역할 배지와 중복되는 항목은 배지 리스트에서 제거
    const filteredBadges = badges === null || badges === void 0 ? void 0 : badges.filter(({ label }) => normalize(label) !== normalize(role));
    return (_jsxs("article", { className: cn('bg-profile-card-bg rounded-2xl flex flex-col border border-transparent', rootSizeClass, className), children: [_jsxs("div", { className: "flex items-start gap-4", children: [_jsx("img", { src: profileImageUrl, alt: profileImageAlt !== null && profileImageAlt !== void 0 ? profileImageAlt : nickname, className: cn(avatarClass, 'rounded-full object-cover flex-shrink-0'), loading: "lazy" }), _jsxs("div", { className: "flex-1 min-w-0", children: [role && roleTone && (_jsx("span", { className: cn('inline-flex rounded-full px-3 py-1 Label1', 
                                // 역할 배지 톤은 서버 값(roleTone) 사용, 없으면 배지 미표시
                                badgeToneToClass[roleTone]), children: role })), _jsx("div", { className: "mt-2 Title2 text-card-title truncate", children: nickname }), meta && _jsx("div", { className: "Label1 text-card-muted mt-1 truncate", children: meta })] }), _jsx("button", { type: "button", "aria-pressed": bookmarked, onClick: () => onBookmarkChange === null || onBookmarkChange === void 0 ? void 0 : onBookmarkChange(!bookmarked, id), className: "ml-auto p-1 rounded-md hover:opacity-80", children: bookmarked ? (_jsx(BookmarkFilled, { "aria-hidden": "true", className: "w-13 h-10 text-card-title" })) : (_jsx(BookmarkIcon, { "aria-hidden": "true", className: "w-13 h-10 text-card-muted" })) })] }), introduction && (_jsx("p", { className: "Body1 text-card-text line-clamp-2", children: introduction })), filteredBadges && filteredBadges.length > 0 && (_jsx("div", { className: "flex flex-wrap items-center gap-2", children: filteredBadges.map(({ label, tone }, idx) => (_jsx("span", { className: cn('rounded-full px-3 py-1 Label1', badgeToneToClass[tone]), children: label }, `${label}-${idx}`))) })), techStack && techStack.length > 0 && (_jsx("div", { className: "flex flex-wrap items-center gap-2", children: techStack.map((s) => (_jsxs("div", { className: "flex items-center gap-1", children: [s.icon, _jsx("span", { className: "Label1 text-card-text", children: s.name })] }, s.id))) })), (recommendationReason !== null && recommendationReason !== void 0 ? recommendationReason : '') !== '' && (_jsx("div", { className: "border-t border-divider" })), recommendationReason && (_jsx("div", { className: "bg-card-profile-reason-bg rounded-xl p-10", children: _jsx("p", { className: "Body1 text-card-title", children: recommendationReason }) }))] }));
}
