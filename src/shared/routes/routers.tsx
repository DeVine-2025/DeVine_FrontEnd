import RootLayout from '@layouts/root-layout';
import MainPage from '@pages/main/main-page';
import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [{ index: true, element: <MainPage /> }],
  },
]);
