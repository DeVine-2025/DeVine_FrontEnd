import { Link } from 'react-router-dom';
import { AdminPageTitle } from '../../components/common/admin-page-title';

export default function PaymentDetailPage() {
  return (
    <section>
      <Link
        className="Body1 inline-flex cursor-pointer items-center font-medium text-[var(--ui-700)] no-underline transition-colors hover:text-[var(--ui-1000)]"
        to="/admin/payments"
      >
        결제 내역으로
      </Link>

      <AdminPageTitle className="mt-[8px]" title="결제 상세 / 환불" />
    </section>
  );
}
