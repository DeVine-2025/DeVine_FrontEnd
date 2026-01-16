import { jsx as _jsx } from "react/jsx-runtime";
import RootLayout from '@layouts/root-layout';
import ProtectedRoute from '@components/protected-route';
import { MainPage, SignupPage, LoginPage, SearchPage, ProjectSearchPage, DeveloperSearchPage, RecommendPage, RecommendProjectPage, RecommendDeveloperPage, MatchingPage, AppliedPage, InProgressPage, CompletedPage, ProposedPage, PmPage, MyProjectPage, MyInfoPage, } from '@pages';
import { createBrowserRouter } from 'react-router-dom';
export const router = createBrowserRouter([
    {
        element: _jsx(RootLayout, {}),
        children: [
            { index: true, element: _jsx(MainPage, {}) },
            { path: 'signup', element: _jsx(SignupPage, {}) },
            { path: 'login', element: _jsx(LoginPage, {}) },
            {
                path: 'search',
                element: _jsx(SearchPage, {}),
                children: [
                    { path: 'project', element: _jsx(ProjectSearchPage, {}) },
                    { path: 'developer', element: _jsx(DeveloperSearchPage, {}) },
                ],
            },
            {
                path: 'recommend',
                element: _jsx(RecommendPage, {}),
                children: [
                    { path: 'project', element: _jsx(RecommendProjectPage, {}) },
                    { path: 'developer', element: _jsx(RecommendDeveloperPage, {}) },
                ],
            },
            {
                element: _jsx(ProtectedRoute, {}),
                children: [
                    {
                        path: 'matching',
                        element: _jsx(MatchingPage, {}),
                        children: [
                            { path: 'applied', element: _jsx(AppliedPage, {}) },
                            { path: 'in-progress', element: _jsx(InProgressPage, {}) },
                            { path: 'completed', element: _jsx(CompletedPage, {}) },
                            { path: 'proposed', element: _jsx(ProposedPage, {}) },
                            { path: 'pm', element: _jsx(PmPage, {}) },
                        ],
                    },
                    { path: 'my-project', element: _jsx(MyProjectPage, {}) },
                    { path: 'my-info', element: _jsx(MyInfoPage, {}) },
                ],
            },
        ],
    },
]);
