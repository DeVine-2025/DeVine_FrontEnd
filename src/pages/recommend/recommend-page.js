import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import ProjectCard from '@components/common/ProjectCard';
import ProfileCard from '@components/common/ProfileCard';
const RecommendPage = () => {
    // Mock data for demonstration
    const recommendedProjects = [
        {
            id: '1',
            title: 'AI 기반 스마트 홈 시스템',
            subtitle: 'IoT 플랫폼 개발',
            location: '서울',
            period: '3개월',
            mode: '원격',
            categoryLabel: '웹 개발',
            deadlineLabel: '마감 임박',
            roles: [
                {
                    key: 'frontend',
                    label: '프론트엔드 개발자',
                    tone: 'blue',
                    current: 2,
                    total: 3,
                    techStack: [
                        { id: 'react', name: 'React' },
                        { id: 'typescript', name: 'TypeScript' },
                    ],
                },
            ],
            bookmarked: false,
        },
        {
            id: '2',
            title: '모바일 앱 UI/UX 디자인',
            location: '부산',
            period: '2개월',
            mode: '상주',
            categoryLabel: '디자인',
            roles: [
                {
                    key: 'designer',
                    label: 'UI/UX 디자이너',
                    tone: 'pink',
                    current: 1,
                    total: 2,
                },
            ],
            bookmarked: true,
        },
    ];
    const recommendedDevelopers = [
        {
            id: '1',
            name: '김개발',
            role: '프론트엔드 개발자',
            skills: ['React', 'TypeScript', 'Next.js'],
            experience: '3년',
            location: '서울',
            available: true,
        },
        {
            id: '2',
            name: '이디자인',
            role: 'UI/UX 디자이너',
            skills: ['Figma', 'Sketch', 'Adobe XD'],
            experience: '4년',
            location: '부산',
            available: false,
        },
    ];
    const handleBookmarkChange = (bookmarked, id) => {
        console.log('Bookmark changed:', bookmarked, id);
    };
    return (_jsx("div", { className: "min-h-screen bg-[var(--ui-bg)]", children: _jsxs("div", { className: "max-w-[144rem] mx-auto px-[2rem] py-[4rem]", children: [_jsxs("div", { className: "mb-[4rem] text-center", children: [_jsx("h1", { className: "text-4xl font-bold text-[var(--ui-900)] mb-[1rem]", children: "\uCD94\uCC9C \uD504\uB85C\uC81D\uD2B8/\uAC1C\uBC1C\uC790" }), _jsx("p", { className: "text-lg text-[var(--ui-600)]", children: "\uB2F9\uC2E0\uC758 \uAD00\uC2EC\uC0AC\uC5D0 \uB9DE\uB294 \uD504\uB85C\uC81D\uD2B8\uC640 \uAC1C\uBC1C\uC790\uB97C \uCD94\uCC9C\uD574\uB4DC\uB9BD\uB2C8\uB2E4" })] }), _jsxs("section", { className: "mb-[6rem]", children: [_jsx("h2", { className: "text-2xl font-semibold text-[var(--ui-900)] mb-[2rem]", children: "\uCD94\uCC9C \uD504\uB85C\uC81D\uD2B8" }), _jsx("div", { className: "grid gap-[2rem] md:grid-cols-2 lg:grid-cols-1", children: recommendedProjects.map((project) => (_jsx(ProjectCard, Object.assign({}, project, { onBookmarkChange: handleBookmarkChange, size: "medium" }), project.id))) })] }), _jsxs("section", { children: [_jsx("h2", { className: "text-2xl font-semibold text-[var(--ui-900)] mb-[2rem]", children: "\uCD94\uCC9C \uAC1C\uBC1C\uC790" }), _jsx("div", { className: "grid gap-[2rem] md:grid-cols-2 lg:grid-cols-3", children: recommendedDevelopers.map((developer) => (_jsx(ProfileCard, Object.assign({}, developer), developer.id))) })] })] }) }));
};
export default RecommendPage;
