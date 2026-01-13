import RootLayout from '@layouts/root-layout';
import ProtectedRoute from '@components/protected-route';
import MainPage from '@pages/main/main-page';
import SignupPage from '@pages/signup/signup-page';
import LoginPage from '@pages/login/login-page';
import SearchPage from '@pages/search/search-page';
import ProjectSearchPage from '@pages/search/project/project-search-page';
import DeveloperSearchPage from '@pages/search/developer/developer-search-page';
import RecommendPage from '@pages/recommend/recommend-page';
import RecommendProjectPage from '@pages/recommend/project/recommend-project-page';
import RecommendDeveloperPage from '@pages/recommend/developer/recommend-developer-page';
import MatchingPage from '@pages/matching/matching-page';
import AppliedPage from '@pages/matching/applied/applied-page';
import InProgressPage from '@pages/matching/in-progress/in-progress-page';
import CompletedPage from '@pages/matching/completed/completed-page';
import ProposedPage from '@pages/matching/proposed/proposed-page';
import PmPage from '@pages/matching/pm/pm-page';
import MyProjectPage from '@pages/my-project/my-project-page';
import MyInfoPage from '@pages/my-info/my-info-page';
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
        path: 'matching',
        element: (
          <ProtectedRoute>
            <MatchingPage />
          </ProtectedRoute>
        ),
        children: [
          {
            path: 'applied',
            element: (
              <ProtectedRoute>
                <AppliedPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'in-progress',
            element: (
              <ProtectedRoute>
                <InProgressPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'completed',
            element: (
              <ProtectedRoute>
                <CompletedPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'proposed',
            element: (
              <ProtectedRoute>
                <ProposedPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'pm',
            element: (
              <ProtectedRoute>
                <PmPage />
              </ProtectedRoute>
            ),
          },
        ],
      },
      {
        path: 'my-project',
        element: (
          <ProtectedRoute>
            <MyProjectPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'my-info',
        element: (
          <ProtectedRoute>
            <MyInfoPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
