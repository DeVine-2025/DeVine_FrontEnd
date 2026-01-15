import RootLayout from '@layouts/root-layout';
import ProtectedRoute from '@components/protected-route';
import {
  MainPage,
  SignupPage,
  LoginPage,
  SearchPage,
  ProjectSearchPage,
  DeveloperSearchPage,
  RecommendPage,
  RecommendProjectPage,
  RecommendDeveloperPage,
  MatchingPage,
  AppliedPage,
  InProgressPage,
  CompletedPage,
  ProposedPage,
  PmPage,
  MyProjectPage,
  MyInfoPage,
} from '@pages';
import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <MainPage /> },
      { path: 'signup', element: <SignupPage /> },
      { path: 'login', element: <LoginPage /> },
      {
        path: 'search',
        element: <SearchPage />,
        children: [
          { path: 'project', element: <ProjectSearchPage /> },
          { path: 'developer', element: <DeveloperSearchPage /> },
        ],
      },
      {
        path: 'recommend',
        element: <RecommendPage />,
        children: [
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
          { path: 'my-project', element: <MyProjectPage /> },
          { path: 'my-info', element: <MyInfoPage /> },
        ],
      },
    ],
  },
]);
