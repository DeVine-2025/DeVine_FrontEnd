import ArrowLeftAdminIcon from '@assets/icons/arrow-left-admin.svg?react';
import { Link } from 'react-router-dom';
import { AdminPageTitle } from '../../components/common/admin-page-title';

export default function PaymentDetailPage() {
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

      <AdminPageTitle className="mt-[8px]" title="결제 상세 / 환불" />
    </section>
  );
}
