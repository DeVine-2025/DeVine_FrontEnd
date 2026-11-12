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
  LegacyHomePage,
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
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import HomePage from '../../pages/home/home-page';
import ProjectExplorePage from '../../pages/search/project/project-explore-page';
import DeveloperExplorePage from '../../pages/search/developer/developer-explore-page';
import RecommendationLayout from '../../pages/recommend/recommendation-layout';
import RecommendationProjects from '../../pages/recommend/recommendation-projects';
import RecommendationDevelopers from '../../pages/recommend/recommendation-developers';
import AgreementList from '../../pages/signup/AgreementList';
import AuthLoadingScreen from '@components/common/AuthLoadingScreen';

function HomeEntry() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return null;
  return isSignedIn ? <HomePage /> : <Navigate to="/service" replace />;
}

export const router = createBrowserRouter([
  ...adminRoutes,
  ...(import.meta.env.DEV ? [{ path: '/auth-loading-preview', element: <AuthLoadingScreen message="로그인하고 있어요." /> }] : []),
  ...(import.meta.env.DEV ? [{
    path: '/signup-preview',
    element: <Outlet context={{ setNavLocked: () => {}, setLogoClickHandler: () => {}, onboardingIncomplete: false, openOnboardingModal: () => {} }} />,
    children: [{ index: true, element: <AgreementList preview loginProvider="github" onConfirm={() => {}} /> }],
  }] : []),
  {
    path: '/service',
    element: <ServicePage />,
  },
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <HomeEntry /> },
      { path: 'home', element: <HomePage /> },
      {
        path: 'home-original',
        element: (
          <BookmarkAnimationContext.Provider value={false}>
            <LegacyHomePage />
          </BookmarkAnimationContext.Provider>
        ),
      },
      { path: 'signup', element: <SignupPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'sso-callback', element: <SsoCallbackPage /> },
      { path: 'terms/:termsId', element: <TermsPage /> },
      { path: 'pay', element: <PayPage /> },
      { path: 'project/:projectId', element: <ProjectDetailPage /> },
      { path: 'search/projects', element: <ProjectExplorePage /> },
      { path: 'search/developers', element: <DeveloperExplorePage /> },
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
      element: <RecommendationLayout />,
        children: [
          { index: true, element: <Navigate to="project" replace /> },
        { path: 'project', element: <RecommendationProjects /> },
        { path: 'developer', element: <RecommendationDevelopers /> },
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
              { path: 'bookmark', element: <MyInfoBookMarkPage embedded /> },
            ],
          },
          { path: 'profile-edit', element: <MyInfoProfileEdit /> },
          { path: 'bookmark', element: <MyInfoBookMarkPage /> },
        ],
      },
    ],
  },
]);
