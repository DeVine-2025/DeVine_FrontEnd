import { AdminPageTitle } from '../../components/common/admin-page-title';
import { AdminStatusBadge } from '../../components/common/admin-status-badge';
import { AdminTable, type AdminTableColumn } from '../../components/common/admin-table';

type PaymentStatusTone = 'positive' | 'neutral';

type Payment = {
  id: string;
  user: string;
  product: string;
  amount: string;
  paidAt: string;
  status: string;
  statusTone: PaymentStatusTone;
};

const PAYMENT_DATA: Payment[] = [
  {
    id: 'P-0231',
    user: '김개발',
    product: '단건',
    amount: '4,900원',
    paidAt: '07-08 10:12',
    status: '결제완료',
    statusTone: 'positive',
  },
  {
    id: 'P-0230',
    user: '이프론트',
    product: '3개권',
    amount: '9,900원',
    paidAt: '07-07 14:35',
    status: '환불 완료',
    statusTone: 'neutral',
  },
  {
    id: 'P-0229',
    user: '박디자인',
    product: '단건',
    amount: '4,900원',
    paidAt: '07-06 09:24',
    status: '결제완료',
    statusTone: 'positive',
  },
];

const PAYMENT_COLUMNS: AdminTableColumn<Payment>[] = [
  {
    id: 'id',
    header: '결제 ID',
    width: '14%',
    align: 'center',
    cell: (payment) => payment.id,
  },
  {
    id: 'user',
    header: '유저',
    width: '14%',
    align: 'center',
    cell: (payment) => payment.user,
  },
  {
    id: 'product',
    header: '상품',
    width: '13%',
    align: 'center',
    cell: (payment) => payment.product,
  },
  {
    id: 'amount',
    header: '금액',
    width: '16%',
    align: 'center',
    cell: (payment) => payment.amount,
  },
  {
    id: 'paidAt',
    header: '결제일시',
    width: '26%',
    align: 'center',
    cell: (payment) => (
      <time dateTime={`2026-${payment.paidAt.replace(' ', 'T')}`}>{payment.paidAt}</time>
    ),
  },
  {
    id: 'status',
    header: '상태',
    width: '17%',
    align: 'center',
    cell: (payment) => <AdminStatusBadge status={payment.status} tone={payment.statusTone} />,
  },
];

const FILTER_LABELS = ['유저 전체', '상품 전체', '날짜 범위'];

export default function PaymentListPage() {
  return (
    <section>
      <AdminPageTitle title="결제 내역" />

      <div className="mt-[28px] flex flex-wrap gap-[12px]">
        {FILTER_LABELS.map((label) => (
          <button
            className="Body1 inline-flex h-[44px] cursor-pointer items-center rounded-full bg-[var(--ui-50)] px-[16px] font-medium text-[var(--ui-800)] hover:bg-[var(--ui-100)]"
            key={label}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      <AdminTable
        ariaLabel="결제 내역"
        className="mt-[20px]"
        columns={PAYMENT_COLUMNS}
        data={PAYMENT_DATA}
        getRowHref={(payment) => `/admin/payments/${payment.id}`}
        getRowKey={(payment) => payment.id}
      />
    </section>
  );
}
