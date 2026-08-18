import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Pagination from '@components/common/Pagination';
import {
  type AdminCoupon,
  type AdminCouponUsage,
  getAdminCoupons,
  getAdminCouponUsage,
} from '../../apis/coupon';
import { AdminListLayout } from '../../components/common/admin-list-layout';
import { AdminStatusBadge } from '../../components/common/admin-status-badge';
import { AdminTable, type AdminTableColumn } from '../../components/common/admin-table';

type CouponUsageTone = 'positive' | 'negative' | 'neutral';

type CouponListRow = {
  id: number;
  name: string;
  discount: string;
  product: string;
  expiresAt: string;
  isExpiringSoon: boolean;
  issuedUsed: string;
  usageRate: string;
  usageTone: CouponUsageTone;
};

const PAGE_SIZE = 10;

const formatDiscount = (coupon: AdminCoupon) => {
  if (coupon.discountType === 'FIXED_RATE') {
    return `${coupon.discountValue}%`;
  }

  return `${coupon.discountValue.toLocaleString('ko-KR')}원`;
};

const toCouponListRow = (coupon: AdminCoupon, usage?: AdminCouponUsage): CouponListRow => {
  const issuedCount = usage?.issuedCount ?? coupon.issuedCount;
  const usedCount = usage?.usedCount ?? coupon.usedCount;
  const usageRate = usage
    ? Math.round(usage.usageRate * 100)
    : issuedCount > 0
      ? Math.round((usedCount / issuedCount) * 100)
      : 0;
  const isAllUsed = issuedCount > 0 && usedCount >= issuedCount;

  return {
    id: coupon.couponId,
    name: coupon.name,
    discount: formatDiscount(coupon),
    product: coupon.applicableTicketProductName ?? '전체',
    expiresAt: `~${dayjs(usage?.validUntil ?? coupon.validUntil).format('MM-DD')}`,
    isExpiringSoon: usage?.isExpiringSoon ?? false,
    issuedUsed: `${issuedCount.toLocaleString('ko-KR')}/${usedCount.toLocaleString('ko-KR')}`,
    usageRate: isAllUsed ? '사용 완료' : `${usageRate}%`,
    usageTone: isAllUsed ? 'positive' : usageRate >= 80 ? 'negative' : 'neutral',
  };
};

const COUPON_COLUMNS: AdminTableColumn<CouponListRow>[] = [
  {
    id: 'name',
    header: '쿠폰명',
    width: '18%',
    cell: (coupon) => coupon.name,
  },
  {
    id: 'discount',
    header: '할인',
    width: '12%',
    cell: (coupon) => coupon.discount,
  },
  {
    id: 'product',
    header: '적용상품',
    width: '14%',
    cell: (coupon) => coupon.product,
  },
  {
    id: 'expiresAt',
    header: '유효기간',
    width: '14%',
    cell: (coupon) => (
      <span className="flex flex-col items-center gap-[2px]">
        <span>{coupon.expiresAt}</span>
        {coupon.isExpiringSoon && (
          <span className="Caption1 text-[var(--negative-text)]">만료 임박</span>
        )}
      </span>
    ),
  },
  {
    id: 'issuedUsed',
    header: '발급/사용',
    width: '16%',
    cell: (coupon) => coupon.issuedUsed,
  },
  {
    id: 'usageRate',
    header: '사용률',
    width: '16%',
    cell: (coupon) => <AdminStatusBadge status={coupon.usageRate} tone={coupon.usageTone} />,
  },
];

export default function CouponListPage() {
  const [page, setPage] = useState(1);
  const { data, isError, isPending } = useQuery({
    queryKey: ['admin', 'coupons', page, PAGE_SIZE],
    queryFn: () => getAdminCoupons({ page, size: PAGE_SIZE }),
  });
  const { data: usageData, isError: isUsageError } = useQuery({
    queryKey: ['admin', 'coupons', 'usage'],
    queryFn: () => getAdminCouponUsage(),
  });

  const usageByCouponId = new Map(usageData?.map((usage) => [usage.couponId, usage]));
  const coupons =
    data?.content.map((coupon) => toCouponListRow(coupon, usageByCouponId.get(coupon.couponId))) ??
    [];
  const totalPages = data?.totalPages ?? data?.page?.totalPages ?? 1;
  const emptyMessage = isPending
    ? '쿠폰 목록을 불러오는 중입니다.'
    : isError
      ? '쿠폰 목록을 불러오지 못했습니다.'
      : '등록된 쿠폰이 없습니다.';

  return (
    <AdminListLayout
      actions={
        <Link
          className="Body1 inline-flex items-center justify-center rounded-[8px] bg-[#4e49ff] px-[12px] py-[8px] font-normal text-white no-underline transition-opacity hover:opacity-90"
          to="/admin/coupons/new"
        >
          쿠폰 생성
        </Link>
      }
      footer={
        <Pagination page={page} totalPages={totalPages} onChange={setPage} maxButtons={5} />
      }
      title="쿠폰 목록 / 현황"
    >
      <>
        {isUsageError && (
          <p className="Body1 mb-[12px] text-center text-[var(--negative-text)]">
            사용 현황을 불러오지 못해 쿠폰 목록 기준으로 표시합니다.
          </p>
        )}
        <AdminTable
          ariaLabel="쿠폰 목록"
          columns={COUPON_COLUMNS}
          data={coupons}
          emptyMessage={emptyMessage}
          getRowHref={(coupon) => `/admin/coupons/${coupon.id}/edit`}
          getRowKey={(coupon) => coupon.id}
        />
      </>
    </AdminListLayout>
  );
}
