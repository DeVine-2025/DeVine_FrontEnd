import { adminRoutes } from '@admin/routes/admin-router';
import { BookmarkAnimationContext } from '@components/common/bookmark-animation-context';
import ProtectedRoute from '@components/protected-route';
import RootLayout from '@layouts/root-layout';
import {
  AppliedPage,
  CompletedPage,
  DeveloperDetailPage,
  DeveloperSearchPage,
  DeveloperSuggestPage,
  InProgressPage,
  LoginPage,
  MainPage,
  MatchingPage,
  MyDeveloperPage,
  MyInfoBookMarkPage,
  MyInfoPage,
  MyInfoProfileEdit,
  MyInfoProfilePage,
  MyInfoSettingPage,
  MyPMPage,
  MyProjectPage,
  PayPage,
  PmPage,
  ProjectCreateCompletePage,
  ProjectCreatePage,
  ProjectDetailPage,
  ProjectSearchPage,
  ProposedPage,
  RecommendDeveloperPage,
  RecommendPage,
  RecommendProjectPage,
  ReportCreatePage,
  ReportDetailPage,
  ReportLoadingPage,
  ReportMainPage,
  ReportPage,
  ReportResultPage,
  SearchPage,
  ServicePage,
  SignupPage,
  SsoCallbackPage,
  TermsPage,
} from '@pages';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import HomePage from '../../pages/home/home-page';

export const router = createBrowserRouter([
  ...adminRoutes,
  {
    path: '/service',
    element: <ServicePage />,
  },
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'home-original',
        element: (
          <BookmarkAnimationContext.Provider value={false}>
            <MainPage />
          </BookmarkAnimationContext.Provider>
        ),
      },
      { path: 'signup', element: <SignupPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'sso-callback', element: <SsoCallbackPage /> },
      { path: 'terms/:termsId', element: <TermsPage /> },
      { path: 'pay', element: <PayPage /> },
      { path: 'project/:projectId', element: <ProjectDetailPage /> },
      {
        path: 'search',
        element: <SearchPage />,
        children: [
          { index: true, element: <Navigate to="project" replace /> },
          { path: 'project', element: <ProjectSearchPage /> },
          { path: 'developer', element: <DeveloperSearchPage /> },
        ],
      },

      {
        path: 'recommend',
        element: <RecommendPage />,
        children: [
          { index: true, element: <Navigate to="project" replace /> },
          { path: 'project', element: <RecommendProjectPage /> },
          { path: 'developer', element: <RecommendDeveloperPage /> },
        ],
      },

      {
        path: 'my-project',
        element: <MyProjectPage />,
        children: [
          { index: true, element: <Navigate to="pm" replace /> },
          { path: 'pm', element: <MyPMPage /> },
          { path: 'dev', element: <MyDeveloperPage /> },
        ],
      },

      {
        path: 'report',
        element: <ReportMainPage />,
        children: [
          { index: true, element: <ReportPage /> },
          {
            path: 'create',
            element: (
              <ProtectedRoute>
                <ReportCreatePage />
              </ProtectedRoute>
            ),
          },
          { path: 'loading', element: <ReportLoadingPage /> },
          { path: 'result', element: <ReportResultPage /> },
          { path: 'detail/:reportId', element: <ReportDetailPage /> },
        ],
      },

      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'matching',
            element: <MatchingPage />,
            children: [
              { path: 'applied', element: <AppliedPage /> },
              { path: 'in-progress', element: <InProgressPage /> },
              { path: 'completed', element: <CompletedPage /> },
              { path: 'proposed', element: <ProposedPage /> },
              { path: 'pm', element: <PmPage /> },
            ],
          },

          { path: 'project/create', element: <ProjectCreatePage /> },
          { path: 'project/create/complete', element: <ProjectCreateCompletePage /> },

          { path: 'developer-detail/:memberNick', element: <DeveloperDetailPage /> },
          { path: 'developer-detail/:memberNick/suggest', element: <DeveloperSuggestPage /> },
          {
            path: 'my-info',
            element: <MyInfoPage />,
            children: [
              { index: true, element: <MyInfoProfilePage /> },
              { path: 'setting', element: <MyInfoSettingPage /> },
            ],
          },
          { path: 'profile-edit', element: <MyInfoProfileEdit /> },
          { path: 'bookmark', element: <MyInfoBookMarkPage /> },
        ],
      },
    ],
  },
]);
