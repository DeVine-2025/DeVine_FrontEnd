import { Navigate, type RouteObject } from 'react-router-dom';
import { AdminApp } from '../app/admin-app';
import { AdminLayout } from '../layouts/admin-layout';
import ContentListPage from '../pages/contents/content-list-page';
import NoticeDetailPage from '../pages/contents/notice-detail-page';
import CouponCreatePage from '../pages/coupons/coupon-create-page';
import CouponListPage from '../pages/coupons/coupon-list-page';
import AdminDashboardPage from '../pages/dashboard/admin-dashboard-page';
import PaymentDetailPage from '../pages/payments/payment-detail-page';
import PaymentListPage from '../pages/payments/payment-list-page';
import ReportDetailPage from '../pages/reports/report-detail-page';
import ReportListPage from '../pages/reports/report-list-page';
import SystemSettingPage from '../pages/settings/system-setting-page';
import UserDetailPage from '../pages/users/user-detail-page';
import UserListPage from '../pages/users/user-list-page';
import { AdminRouteGuard } from './admin-route-guard';

export const adminRoutes: RouteObject[] = [
  {
    path: 'admin',
    element: <AdminApp />,
    children: [
      { path: 'login', element: <Navigate to="/login" replace /> },
      {
        element: (
          <AdminRouteGuard>
            <AdminLayout />
          </AdminRouteGuard>
        ),
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <AdminDashboardPage /> },
          { path: 'reports', element: <ReportListPage /> },
          { path: 'reports/:reportId', element: <ReportDetailPage /> },
          { path: 'coupons', element: <CouponListPage /> },
          { path: 'coupons/new', element: <CouponCreatePage /> },
          { path: 'coupons/:couponId/edit', element: <CouponCreatePage /> },
          { path: 'users', element: <UserListPage /> },
          { path: 'users/:nickname', element: <UserDetailPage /> },
          { path: 'payments', element: <PaymentListPage /> },
          { path: 'payments/:paymentId', element: <PaymentDetailPage /> },
          { path: 'contents', element: <ContentListPage /> },
          { path: 'contents/notices/:noticeId', element: <NoticeDetailPage /> },
          { path: 'settings', element: <SystemSettingPage /> },
        ],
      },
    ],
  },
];
