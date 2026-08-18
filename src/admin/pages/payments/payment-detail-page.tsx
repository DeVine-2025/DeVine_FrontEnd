import ArrowLeftAdminIcon from '@assets/icons/arrow-left-admin.svg?react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import {
  ADMIN_PAYMENTS_QUERY_KEY,
  type AdminPaymentDetail,
  getAdminPaymentDetail,
} from '../../apis/payment';
import { AdminPageTitle } from '../../components/common/admin-page-title';
import { AdminStatusBadge } from '../../components/common/admin-status-badge';

function formatCurrency(amount: number, currency = 'KRW') {
  if (currency === 'KRW') return `${new Intl.NumberFormat('ko-KR').format(amount)}원`;

  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency }).format(amount);
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
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

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="border-[var(--ui-200)] border-b py-[14px] last:border-b-0">
      <dt className="Body2 text-[var(--ui-500)]">{label}</dt>
      <dd className="Body1 mt-[4px] break-all font-medium text-[var(--ui-1000)]">{value ?? '-'}</dd>
    </div>
  );
}

function PaymentDetailContent({ payment }: { payment: AdminPaymentDetail }) {
  const status = getPaymentStatus(payment.status);
  const method = payment.method;

  return (
    <div className="mt-[28px] space-y-[24px]">
      <section className="rounded-[10px] border border-[var(--ui-200)] bg-[var(--ui-bg)] p-[24px]">
        <div className="flex flex-wrap items-center justify-between gap-[12px]">
          <h2 className="Heading3 text-[var(--ui-1000)]">결제 정보</h2>
          <AdminStatusBadge status={status.label} tone={status.tone} />
        </div>
        <dl className="mt-[16px] grid gap-x-[32px] md:grid-cols-2">
          <DetailItem label="결제 ID" value={payment.paymentId} />
          <DetailItem label="PortOne 결제 ID" value={payment.portonePaymentId} />
          <DetailItem label="유저" value={payment.memberNickname} />
          <DetailItem label="주문명" value={payment.orderName} />
          <DetailItem label="결제 금액" value={formatCurrency(payment.amount, payment.currency)} />
          <DetailItem label="결제 일시" value={formatDateTime(payment.paidAt)} />
          <DetailItem label="PG사" value={payment.pgProvider} />
          <DetailItem label="통화" value={payment.currency} />
        </dl>
      </section>

      <section className="rounded-[10px] border border-[var(--ui-200)] bg-[var(--ui-bg)] p-[24px]">
        <h2 className="Heading3 text-[var(--ui-1000)]">결제 수단</h2>
        <dl className="mt-[16px] grid gap-x-[32px] md:grid-cols-2">
          <DetailItem label="수단" value={method?.method} />
          <DetailItem label="제공사" value={method?.provider} />
          <DetailItem label="카드사" value={method?.cardName} />
          <DetailItem label="카드 번호" value={method?.cardNumber} />
          <DetailItem label="카드 브랜드" value={method?.cardBrand} />
          <DetailItem label="승인 번호" value={method?.approvalNumber} />
          <DetailItem
            label="할부 개월"
            value={method?.installmentMonth === 0 ? '일시불' : method?.installmentMonth}
          />
        </dl>
      </section>

      <section className="rounded-[10px] border border-[var(--ui-200)] bg-[var(--ui-bg)] p-[24px]">
        <h2 className="Heading3 text-[var(--ui-1000)]">구매 상품 및 크레딧</h2>
        {payment.tickets.length > 0 ? (
          <div className="mt-[16px] overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-center">
              <thead className="bg-[var(--ui-100)] text-[var(--ui-1000)]">
                <tr className="h-[52px]">
                  <th className="px-[16px]">상품</th>
                  <th className="px-[16px]">수량</th>
                  <th className="px-[16px]">단가</th>
                  <th className="px-[16px]">개당 크레딧</th>
                  <th className="px-[16px]">총 크레딧</th>
                </tr>
              </thead>
              <tbody>
                {payment.tickets.map((ticket) => (
                  <tr
                    className="h-[56px] border-[var(--ui-200)] border-t"
                    key={ticket.ticketProductId}
                  >
                    <td className="px-[16px]">{ticket.productName}</td>
                    <td className="px-[16px]">{ticket.quantity}</td>
                    <td className="px-[16px]">
                      {formatCurrency(ticket.unitPrice, payment.currency)}
                    </td>
                    <td className="px-[16px]">{ticket.unitCreditAmount}</td>
                    <td className="px-[16px]">{ticket.totalCredits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="Body1 mt-[16px] text-[var(--ui-500)]">구매 상품 정보가 없습니다.</p>
        )}
        <dl className="mt-[16px] max-w-[480px]">
          <DetailItem label="현재 남은 리포트 크레딧" value={payment.remainingReportCredits} />
        </dl>
      </section>

      <section className="rounded-[10px] border border-[var(--ui-200)] bg-[var(--ui-bg)] p-[24px]">
        <h2 className="Heading3 text-[var(--ui-1000)]">환불 정보</h2>
        <dl className="mt-[16px] max-w-[480px]">
          <DetailItem label="환불 사유" value={payment.refund?.reason ?? '환불 내역 없음'} />
        </dl>
      </section>
    </div>
  );
}

export default function PaymentDetailPage() {
  const { paymentId } = useParams();
  const parsedPaymentId = Number(paymentId);
  const isValidPaymentId = Number.isSafeInteger(parsedPaymentId) && parsedPaymentId > 0;
  const {
    data: payment,
    isError,
    isPending,
    refetch,
  } = useQuery({
    enabled: isValidPaymentId,
    queryKey: [...ADMIN_PAYMENTS_QUERY_KEY, 'detail', parsedPaymentId],
    queryFn: () => getAdminPaymentDetail(parsedPaymentId),
  });

  return (
    <section>
      <Link
        className="Body1 inline-flex cursor-pointer items-center gap-[6px] font-medium text-[1.5rem] text-[var(--ui-700)] no-underline hover:text-[var(--ui-1000)]"
        to="/admin/payments"
      >
        <ArrowLeftAdminIcon
          aria-hidden="true"
          className="[&_path]:!fill-current h-[18px] w-[18px] shrink-0"
        />
        결제 내역으로
      </Link>

      <AdminPageTitle className="mt-[8px]" title="결제 상세" />

      {!isValidPaymentId ? (
        <p className="Body1 mt-[28px] text-[var(--negative-text)]">올바른 결제 ID가 아닙니다.</p>
      ) : isPending ? (
        <p className="Body1 mt-[28px] text-[var(--ui-500)]">결제 상세를 불러오는 중입니다.</p>
      ) : isError ? (
        <button
          className="Body1 mt-[28px] cursor-pointer font-semibold text-[#4e49ff] underline"
          onClick={() => void refetch()}
          type="button"
        >
          결제 상세를 불러오지 못했습니다. 다시 시도
        </button>
      ) : payment ? (
        <PaymentDetailContent payment={payment} />
      ) : null}
    </section>
  );
}
