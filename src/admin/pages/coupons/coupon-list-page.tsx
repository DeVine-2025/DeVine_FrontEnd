import { useState } from 'react';
import { Link } from 'react-router-dom';
import Pagination from '@components/common/Pagination';
import { AdminListLayout } from '../../components/common/admin-list-layout';
import { AdminStatusBadge } from '../../components/common/admin-status-badge';
import { AdminTable, type AdminTableColumn } from '../../components/common/admin-table';

type CouponUsageTone = 'positive' | 'negative' | 'neutral';

type Coupon = {
  id: string;
  name: string;
  discount: string;
  product: string;
  expiresAt: string;
  issuedUsed: string;
  usageRate: string;
  usageTone: CouponUsageTone;
};

const COUPON_DATA: Coupon[] = [
  {
    id: 'C-1001',
    name: '첫결제 20%',
    discount: '20%',
    product: '단건',
    expiresAt: '~07-31',
    issuedUsed: '120/74',
    usageRate: '94%',
    usageTone: 'negative',
  },
  {
    id: 'C-1002',
    name: '여름 프로모션',
    discount: '1,000원',
    product: '3개 묶음',
    expiresAt: '~08-15',
    issuedUsed: '300/12',
    usageRate: '4%',
    usageTone: 'neutral',
  },
  {
    id: 'C-1003',
    name: '재가입 환영',
    discount: '30%',
    product: '전체',
    expiresAt: '~07-20',
    issuedUsed: '50/50',
    usageRate: '사용 완료',
    usageTone: 'positive',
  },
];

const COUPON_COLUMNS: AdminTableColumn<Coupon>[] = [
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
      footer={<Pagination page={page} totalPages={68} onChange={setPage} maxButtons={5} />}
      title="쿠폰 목록 / 현황"
    >
      <AdminTable
        ariaLabel="쿠폰 목록"
        columns={COUPON_COLUMNS}
        data={COUPON_DATA}
        getRowHref={(coupon) => `/admin/coupons/${coupon.id}/edit`}
        getRowKey={(coupon) => coupon.id}
      />
    </AdminListLayout>
  );
}
