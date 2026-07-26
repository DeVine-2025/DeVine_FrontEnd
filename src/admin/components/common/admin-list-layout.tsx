import type { ReactNode } from 'react';
import { AdminPageTitle } from './admin-page-title';

type AdminListLayoutProps = {
  title: string;
  description?: string;
  /** 유형/상태/날짜 등 필터 영역. 없으면 렌더하지 않습니다. */
  filters?: ReactNode;
  /** 필터 오른쪽(쿠폰 생성 등) 액션. 없으면 렌더하지 않습니다. */
  actions?: ReactNode;
  /** 보통 `AdminTable`을 넣습니다. */
  children: ReactNode;
  /** 페이지네이션 등 하단 영역. 없으면 렌더하지 않습니다. */
  footer?: ReactNode;
};

/**
 * 관리자 목록 화면의 공통 틀입니다.
 *
 * 제목 / 필터 / 액션 / 본문(테이블) / 푸터를 각각 선택적으로 조합할 수 있습니다.
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
  const hasToolbar = Boolean(filters || actions);

  return (
    <section>
      <AdminPageTitle description={description} title={title} />

      {hasToolbar && (
        <div className="mt-[28px] flex flex-wrap items-center gap-[16px]">
          {filters}
          {actions && <div className="ml-auto flex flex-wrap items-center gap-[12px]">{actions}</div>}
        </div>
      )}

      <div className={hasToolbar ? 'mt-[20px]' : 'mt-[28px]'}>{children}</div>

      {footer && <div className="mt-[24px] flex justify-center">{footer}</div>}
    </section>
  );
}
