import type { ReactNode } from 'react';
import { AdminPageTitle } from './admin-page-title';

type AdminListLayoutProps = {
  title: string;
  description?: string;
  /* 유형/상태/날짜 등 필터 영역. 없으면 렌더하지 않습니다. */
  filters?: ReactNode;
  /**
   * 쿠폰 생성 등 액션.
   * - 필터 있음 → 필터 오른쪽
   * - 필터 없음 → 제목 오른쪽
   * - 액션/필터 모두 없음 → 제목만 표시
   */
  actions?: ReactNode;
  /* 보통 `AdminTable`을 넣습니다. */
  children: ReactNode;
  /* 페이지네이션 등 하단 영역. 없으면 렌더하지 않습니다. */
  footer?: ReactNode;
};

/**
 * 관리자 목록 화면의 공통 틀입니다.
 *
 * 제목은 필수이고, 필터 / 액션 / 푸터는 모두 선택입니다.
 * 조각만 쓰고 싶으면 `AdminPageTitle`, `AdminFilterBar`, `AdminTable`을 페이지에서 직접 import 해도 됩니다.
 */
export function AdminListLayout({
  title,
  description,
  filters,
  actions,
  children,
  footer,
}: AdminListLayoutProps) {
  const hasFilters = Boolean(filters);
  const hasActions = Boolean(actions);
  const showTitleActions = hasActions && !hasFilters;
  const showToolbar = hasFilters;

  return (
    <section>
      {showTitleActions ? (
        <div className="flex flex-wrap items-center justify-between gap-[16px]">
          <AdminPageTitle description={description} title={title} />
          <div className="flex flex-wrap items-center gap-[12px]">{actions}</div>
        </div>
      ) : (
        <AdminPageTitle description={description} title={title} />
      )}

      {showToolbar && (
        <div className="mt-[28px] flex flex-wrap items-center gap-[16px]">
          {filters}
          {hasActions && (
            <div className="ml-auto flex flex-wrap items-center gap-[12px]">{actions}</div>
          )}
        </div>
      )}

      <div className={showToolbar ? 'mt-[20px]' : 'mt-[28px]'}>{children}</div>

      {footer && <div className="mt-[24px] flex justify-center">{footer}</div>}
    </section>
  );
}
