import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Pagination from '@components/common/Pagination';
import { getAdminCoupons, type AdminCoupon } from '../../apis/coupon';
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

const toCouponListRow = (coupon: AdminCoupon): CouponListRow => {
  const usageRate =
    coupon.issuedCount > 0 ? Math.round((coupon.usedCount / coupon.issuedCount) * 100) : 0;
  const isAllUsed = coupon.issuedCount > 0 && coupon.usedCount >= coupon.issuedCount;

  return {
    id: coupon.couponId,
    name: coupon.name,
    discount: formatDiscount(coupon),
    product: coupon.applicableTicketProductName ?? '전체',
    expiresAt: `~${dayjs(coupon.validUntil).format('MM-DD')}`,
    issuedUsed: `${coupon.issuedCount.toLocaleString('ko-KR')}/${coupon.usedCount.toLocaleString('ko-KR')}`,
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
    cell: (coupon) => coupon.expiresAt,
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

  const coupons = data?.content.map(toCouponListRow) ?? [];
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
      <AdminTable
        ariaLabel="쿠폰 목록"
        columns={COUPON_COLUMNS}
        data={coupons}
        emptyMessage={emptyMessage}
        getRowHref={(coupon) => `/admin/coupons/${coupon.id}/edit`}
        getRowKey={(coupon) => coupon.id}
      />
    </AdminListLayout>
  );
}
