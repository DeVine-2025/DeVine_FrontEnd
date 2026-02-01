import ProtectedRoute from '@components/protected-route';
import RootLayout from '@layouts/root-layout';
import {
  AppliedPage,
  CompletedPage,
  DeveloperSearchPage,
  InProgressPage,
  LoginPage,
  MainPage,
  MatchingPage,
  MyDeveloperPage,
  MyInfoPage,
  MyPMDevelopersPage,
  MyPMPage,
  MyProjectPage,
  PmPage,
<<<<<<< HEAD
  ProjectCreatePage,
=======
>>>>>>> 711b7b1663b80db7a896f40b4aa486bd5f3b2e0b
  ProjectDetailPage,
  ProjectSearchPage,
  ProposedPage,
  RecommendDeveloperPage,
  RecommendPage,
  RecommendProjectPage,
  ReportCreatePage,
  ReportMainPage,
  ReportPage,
  SearchPage,
  SsoCallbackPage,
  SignupPage,
} from '@pages';
import { createBrowserRouter, Navigate } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <MainPage /> },
      { path: 'signup', element: <SignupPage /> },
      { path: 'login', element: <LoginPage /> },
<<<<<<< HEAD
      { path: 'sso-callback', element: <SsoCallbackPage /> },
=======
>>>>>>> 711b7b1663b80db7a896f40b4aa486bd5f3b2e0b
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

          {
            path: 'report',
            element: <ReportMainPage />,
            children: [
              { index: true, element: <ReportPage /> },
              { path: 'create', element: <ReportCreatePage /> },
            ],
          },

          {
            path: 'my-project',
            element: <MyProjectPage />,
            children: [
              { index: true, element: <Navigate to="pm" replace /> },
              { path: 'pm', element: <MyPMPage /> },
              { path: 'pm/developers', element: <MyPMDevelopersPage /> },
              { path: 'dev', element: <MyDeveloperPage /> },
            ],
          },

          { path: 'project/create', element: <ProjectCreatePage /> },

          { path: 'my-info', element: <MyInfoPage /> },
        ],
      },
    ],
  },
]);
