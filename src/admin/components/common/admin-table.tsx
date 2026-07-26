import { cn } from '@libs/cn';
import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router-dom';

export type AdminTableAlign = 'left' | 'center' | 'right';

export type AdminTableColumn<T> = {
  /** 테이블 안에서 고유해야 하는 컬럼 키입니다. */
  id: string;
  /** 컬럼 헤더에 표시할 내용입니다. */
  header: ReactNode;
  /** 고정 폭 또는 비율 폭을 지정할 수 있습니다. */
  width?: CSSProperties['width'];
  /** 내용 정렬 방향입니다. 기본값은 왼쪽입니다. */
  align?: AdminTableAlign;
  /** 헤더 셀에만 추가할 클래스입니다. */
  headerClassName?: string;
  /** 행 데이터로 셀을 그립니다. 상태 배지·버튼 등도 이 함수에서 주입합니다. */
  cell: (row: T, rowIndex: number) => ReactNode;
  /** 데이터 셀에만 추가할 클래스입니다. */
  cellClassName?: string | ((row: T, rowIndex: number) => string | undefined);
};

type AdminTableProps<T> = {
  columns: AdminTableColumn<T>[];
  data: T[];
  getRowKey: (row: T, rowIndex: number) => string | number;
  /** 전달하면 각 셀을 같은 상세 페이지 링크로 감싸 행 전체를 클릭할 수 있습니다. */
  getRowHref?: (row: T, rowIndex: number) => string;
  ariaLabel?: string;
  className?: string;
  emptyMessage?: ReactNode;
  rowClassName?: string | ((row: T, rowIndex: number) => string | undefined);
};

const ALIGNMENT_CLASS: Record<AdminTableAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const FLEX_ALIGNMENT_CLASS: Record<AdminTableAlign, string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
};

/**
 * 신고, 쿠폰, 사용자, 결제, 콘텐츠 목록에서 공유하는 관리자용 데이터 테이블입니다.
 *
 * 페이지마다 다른 컬럼과 셀 UI는 `columns`의 `cell` 함수로 전달합니다.
 */
export function AdminTable<T>({
  columns,
  data,
  getRowKey,
  getRowHref,
  ariaLabel = '관리자 목록',
  className,
  emptyMessage = '표시할 데이터가 없습니다.',
  rowClassName,
}: AdminTableProps<T>) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-[10px] border border-[var(--ui-200)] bg-[var(--ui-bg)]',
        className,
      )}
    >
      <div className="overflow-x-auto">
        <table aria-label={ariaLabel} className="w-full min-w-[720px] border-collapse">
          <colgroup>
            {columns.map((column) => (
              <col key={column.id} style={column.width ? { width: column.width } : undefined} />
            ))}
          </colgroup>
          <thead className="bg-[var(--ui-100)]">
            <tr className="h-[64px]">
              {columns.map((column) => (
                <th
                  className={cn(
                    'Body1 px-[40px] align-middle font-semibold text-[var(--ui-1000)]',
                    ALIGNMENT_CLASS[column.align ?? 'left'],
                    column.headerClassName,
                  )}
                  key={column.id}
                  scope="col"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, rowIndex) => {
                const additionalRowClass =
                  typeof rowClassName === 'function' ? rowClassName(row, rowIndex) : rowClassName;
                const rowHref = getRowHref?.(row, rowIndex);

                return (
                  <tr
                    className={cn(
                      'h-[64px] border-[var(--ui-200)] border-t hover:bg-[var(--ui-50)]',
                      additionalRowClass,
                    )}
                    key={getRowKey(row, rowIndex)}
                  >
                    {columns.map((column) => {
                      const additionalCellClass =
                        typeof column.cellClassName === 'function'
                          ? column.cellClassName(row, rowIndex)
                          : column.cellClassName;

                      return (
                        <td
                          className={cn(
                            'Body1 align-middle font-normal text-[var(--ui-1000)]',
                            rowHref ? 'p-0' : 'px-[40px]',
                            ALIGNMENT_CLASS[column.align ?? 'left'],
                            additionalCellClass,
                          )}
                          key={column.id}
                        >
                          {rowHref ? (
                            <Link
                              className={cn(
                                'flex h-[64px] w-full items-center px-[40px] no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] focus-visible:outline-offset-[-2px]',
                                FLEX_ALIGNMENT_CLASS[column.align ?? 'left'],
                              )}
                              to={rowHref}
                            >
                              {column.cell(row, rowIndex)}
                            </Link>
                          ) : (
                            column.cell(row, rowIndex)
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            ) : (
              <tr className="h-[160px] border-[var(--ui-200)] border-t">
                <td
                  className="Body1 px-[40px] text-center text-[var(--ui-500)]"
                  colSpan={columns.length}
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
