import { useQuery } from '@tanstack/react-query';
import { getAdminCouponUsage } from '../../apis/coupon';
import { AdminHighlightCard } from '../../components/common/admin-highlight-card';
import { AdminPageTitle } from '../../components/common/admin-page-title';

export default function AdminDashboardPage() {
  const { data: couponUsage, isError, isPending } = useQuery({
    queryKey: ['admin', 'coupons', 'usage'],
    queryFn: () => getAdminCouponUsage(),
  });

  const couponTotals = (couponUsage ?? []).reduce(
    (totals, coupon) => ({
      issuedCount: totals.issuedCount + coupon.issuedCount,
      usedCount: totals.usedCount + coupon.usedCount,
    }),
    { issuedCount: 0, usedCount: 0 },
  );
  const couponUsageRate =
    couponTotals.issuedCount > 0
      ? Math.round((couponTotals.usedCount / couponTotals.issuedCount) * 100)
      : 0;
  const couponUsageValue = isPending ? '계산 중...' : isError ? '-' : `${couponUsageRate}%`;
  const dashboardCards = [
    { label: '신고 대기 건수', value: '8건' },
    { label: '쿠폰 사용률', value: couponUsageValue },
    { label: '오늘 결제 건수', value: '14건' },
  ];

  return (
    <section>
      <AdminPageTitle description="운영 현황을 확인해보세요" title="대시보드" />
      <div className="mt-[40px] grid grid-cols-1 gap-[20px] lg:grid-cols-3">
        {dashboardCards.map((card) => (
          <AdminHighlightCard className="h-[155px] px-[24px] py-[28px]" key={card.label}>
            <h2 className="Headline1 font-semibold text-[var(--ui-1000)]">{card.label}</h2>
            <p className="Title1 mt-[17px] font-medium text-[var(--ui-1000)]">{card.value}</p>
          </AdminHighlightCard>
        ))}
      </div>
    </section>
  );
}
