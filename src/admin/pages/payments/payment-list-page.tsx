import Pagination from '@components/common/Pagination';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ADMIN_PAYMENTS_QUERY_KEY,
  type AdminPayment,
  getAdminPayments,
  refundAdminPayment,
} from '../../apis/payment';
import { AdminListLayout } from '../../components/common/admin-list-layout';
import { AdminStatusBadge } from '../../components/common/admin-status-badge';
import { AdminTable, type AdminTableColumn } from '../../components/common/admin-table';

const PAGE_SIZE = 10;

function formatCurrency(amount: number) {
  return `${new Intl.NumberFormat('ko-KR').format(amount)}원`;
}

function formatPaidAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

function getPaymentStatus(status: string) {
  if (status === 'PAID') return { label: '결제 완료', tone: 'positive' as const };
  if (['CANCELLED', 'CANCELED', 'REFUNDED'].includes(status)) {
    return { label: '환불 완료', tone: 'neutral' as const };
  }

  return { label: status, tone: 'neutral' as const };
}

export default function PaymentListPage() {
  const queryClient = useQueryClient();
  const refundDialogTitleId = useId();
  const refundReasonId = useId();
  const [page, setPage] = useState(1);
  const [refundTarget, setRefundTarget] = useState<AdminPayment | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const {
    data: paymentPage,
    isError: isPaymentsError,
    isPending: isPaymentsPending,
    refetch: refetchPayments,
  } = useQuery({
    queryKey: [...ADMIN_PAYMENTS_QUERY_KEY, page, PAGE_SIZE],
    queryFn: () => getAdminPayments({ page, size: PAGE_SIZE }),
  });
  const {
    error: refundError,
    isPending: isRefundPending,
    mutate: refundPayment,
    reset: resetRefund,
  } = useMutation({
    mutationFn: ({ paymentId, reason }: { paymentId: number; reason: string }) =>
      refundAdminPayment(paymentId, reason),
    onSuccess: () => {
      setRefundTarget(null);
      setRefundReason('');
      queryClient.invalidateQueries({ queryKey: ADMIN_PAYMENTS_QUERY_KEY });
    },
  });

  const openRefundDialog = (payment: AdminPayment) => {
    resetRefund();
    setRefundReason('');
    setRefundTarget(payment);
  };

  const closeRefundDialog = () => {
    if (isRefundPending) return;
    setRefundTarget(null);
    setRefundReason('');
    resetRefund();
  };

  const handleRefundSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!refundTarget || !refundReason.trim()) return;

    refundPayment({ paymentId: refundTarget.paymentId, reason: refundReason.trim() });
  };

  const columns: AdminTableColumn<AdminPayment>[] = [
    {
      id: 'paymentId',
      header: '결제 ID',
      width: '9%',
      cell: (payment) => payment.paymentId,
    },
    {
      id: 'memberNickname',
      header: '유저',
      width: '12%',
      cell: (payment) => payment.memberNickname,
    },
    {
      id: 'orderName',
      header: '상품',
      width: '20%',
      cell: (payment) => payment.orderName,
    },
    {
      id: 'amount',
      header: '금액',
      width: '12%',
      cell: (payment) => formatCurrency(payment.amount),
    },
    {
      id: 'paidAt',
      header: '결제일시',
      width: '18%',
      cell: (payment) => <time dateTime={payment.paidAt}>{formatPaidAt(payment.paidAt)}</time>,
    },
    {
      id: 'status',
      header: '상태',
      width: '11%',
      cell: (payment) => {
        const status = getPaymentStatus(payment.status);

        return <AdminStatusBadge status={status.label} tone={status.tone} />;
      },
    },
    {
      id: 'detail',
      header: '상세',
      width: '9%',
      cell: (payment) => (
        <Link
          className="font-semibold text-[#4e49ff] no-underline hover:underline"
          to={`/admin/payments/${payment.paymentId}`}
        >
          보기
        </Link>
      ),
    },
    {
      id: 'refund',
      header: '환불',
      width: '9%',
      cell: (payment) =>
        payment.status === 'PAID' ? (
          <button
            className="cursor-pointer rounded-[8px] border border-[var(--negative-text)] px-[10px] py-[6px] font-semibold text-[var(--negative-text)] hover:bg-[var(--negative-bg)]"
            onClick={() => openRefundDialog(payment)}
            type="button"
          >
            환불
          </button>
        ) : (
          <span className="text-[var(--ui-400)]">환불 불가</span>
        ),
    },
  ];

  const payments = paymentPage?.content ?? [];
  const emptyMessage = isPaymentsPending
    ? '결제 내역을 불러오는 중입니다.'
    : isPaymentsError
      ? '결제 내역을 불러오지 못했습니다.'
      : undefined;

  return (
    <AdminListLayout
      footer={
        <Pagination
          maxButtons={5}
          onChange={setPage}
          page={page}
          totalPages={paymentPage?.totalPages ?? 0}
        />
      }
      title="결제 내역"
    >
      <AdminTable
        ariaLabel="결제 내역 목록"
        columns={columns}
        data={payments}
        emptyMessage={
          isPaymentsError ? (
            <button
              className="cursor-pointer font-semibold text-[#4e49ff] underline"
              onClick={() => void refetchPayments()}
              type="button"
            >
              {emptyMessage} 다시 시도
            </button>
          ) : (
            emptyMessage
          )
        }
        getRowKey={(payment) => payment.paymentId}
      />

      {refundTarget && (
        <div
          aria-labelledby={refundDialogTitleId}
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-[20px]"
          role="dialog"
        >
          <form
            className="w-full max-w-[480px] rounded-[12px] bg-[var(--ui-bg)] p-[28px] shadow-xl"
            onSubmit={handleRefundSubmit}
          >
            <h2 className="Heading3 text-[var(--ui-1000)]" id={refundDialogTitleId}>
              결제를 환불할까요?
            </h2>
            <p className="Body1 mt-[12px] text-[var(--ui-700)]">
              {refundTarget.memberNickname} · {refundTarget.orderName} ·{' '}
              {formatCurrency(refundTarget.amount)}
            </p>
            <label
              className="Body1 mt-[20px] block font-semibold text-[var(--ui-1000)]"
              htmlFor={refundReasonId}
            >
              환불 사유
            </label>
            <textarea
              className="Body1 mt-[8px] min-h-[120px] w-full resize-y rounded-[8px] border border-[var(--ui-300)] bg-transparent p-[12px] text-[var(--ui-1000)] outline-none focus:border-[#4e49ff]"
              id={refundReasonId}
              onChange={(event) => setRefundReason(event.target.value)}
              placeholder="예: 고객 요청"
              required
              value={refundReason}
            />
            {refundError && (
              <p className="Body2 mt-[8px] text-[var(--negative-text)]">
                환불 요청에 실패했습니다. 결제 상태를 확인한 뒤 다시 시도해주세요.
              </p>
            )}
            <div className="mt-[24px] flex justify-end gap-[12px]">
              <button
                className="cursor-pointer rounded-[8px] border border-[var(--ui-300)] px-[16px] py-[10px] font-semibold text-[var(--ui-800)] disabled:cursor-wait disabled:opacity-60"
                disabled={isRefundPending}
                onClick={closeRefundDialog}
                type="button"
              >
                취소
              </button>
              <button
                className="cursor-pointer rounded-[8px] bg-[var(--negative-text)] px-[16px] py-[10px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isRefundPending || !refundReason.trim()}
                type="submit"
              >
                {isRefundPending ? '환불 요청 중...' : '환불 요청'}
              </button>
            </div>
          </form>
        </div>
      )}
    </AdminListLayout>
  );
}
