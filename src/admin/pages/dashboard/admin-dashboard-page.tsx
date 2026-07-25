import { AdminHighlightCard } from '../../components/common/admin-highlight-card';
import { AdminPageTitle } from '../../components/common/admin-page-title';

const DASHBOARD_CARDS = [
  { label: '신고 대기 건수', value: '8건' },
  { label: '쿠폰 사용률', value: '43%' },
  { label: '오늘 결제 건수', value: '14건' },
] as const;

export default function AdminDashboardPage() {
  return (
    <section>
      <AdminPageTitle description="운영 현황을 확인해보세요" title="대시보드" />
      <div className="mt-[40px] grid grid-cols-1 gap-[20px] lg:grid-cols-3">
        {DASHBOARD_CARDS.map((card) => (
          <AdminHighlightCard className="h-[155px] px-[24px] py-[28px]" key={card.label}>
            <h2 className="Headline1 font-semibold text-[var(--ui-1000)]">{card.label}</h2>
            <p className="Title1 mt-[17px] font-medium text-[var(--ui-1000)]">{card.value}</p>
          </AdminHighlightCard>
        ))}
      </div>
    </section>
  );
}
