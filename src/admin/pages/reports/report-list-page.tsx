import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import Pagination from '@components/common/Pagination';
import {
  type AdminComplaintListItem,
  type ComplaintStatus,
  type ComplaintTargetType,
  getAdminComplaints,
} from '../../apis/complaint';
import { AdminFilterBar } from '../../components/common/admin-filter-bar';
import { AdminFilterButton } from '../../components/common/admin-filter-button';
import { AdminListLayout } from '../../components/common/admin-list-layout';
import { AdminStatusBadge } from '../../components/common/admin-status-badge';
import { AdminTable, type AdminTableColumn } from '../../components/common/admin-table';

type ReportStatusTone = 'positive' | 'negative' | 'neutral';

type ReportListRow = {
  id: number;
  type: string;
  reporter: string;
  reported: string;
  receivedAt: string;
  status: string;
  statusTone: ReportStatusTone;
  slaExceeded: boolean;
};

const PAGE_SIZE = 10;
const DATE_INPUT_CLASS =
  'Body1 h-[42px] w-full rounded-[8px] border border-[var(--ui-200)] bg-[var(--ui-bg)] px-[12px] text-[var(--ui-800)] outline-none focus:border-[#4e49ff]';

const TARGET_TYPE_LABELS: Record<ComplaintTargetType, string> = {
  CHAT: '채팅',
  PROJECT: '프로젝트',
  DEVELOPER: '개발자',
};

const STATUS_META: Record<ComplaintStatus, { label: string; tone: ReportStatusTone }> = {
  PENDING: { label: '대기', tone: 'negative' },
  IN_REVIEW: { label: '검토 중', tone: 'neutral' },
  COMPLETED: { label: '처리 완료', tone: 'positive' },
};

const toReportListRow = (complaint: AdminComplaintListItem): ReportListRow => {
  const statusMeta = STATUS_META[complaint.status];

  return {
    id: complaint.complaintId,
    type: TARGET_TYPE_LABELS[complaint.targetType],
    reporter: complaint.complainantNickname,
    reported: complaint.respondentNickname,
    receivedAt: dayjs(complaint.createdAt).format('YY-MM-DD HH:mm'),
    status: statusMeta.label,
    statusTone: statusMeta.tone,
    slaExceeded: complaint.slaExceeded,
  };
};

const REPORT_COLUMNS: AdminTableColumn<ReportListRow>[] = [
  {
    id: 'id',
    header: '신고 ID',
    width: '12%',
    cell: (report) => report.id,
  },
  {
    id: 'type',
    header: '유형',
    width: '11%',
    cell: (report) => report.type,
  },
  {
    id: 'reporter',
    header: '신고자',
    width: '15%',
    cell: (report) => report.reporter,
  },
  {
    id: 'reported',
    header: '피신고자',
    width: '15%',
    cell: (report) => report.reported,
  },
  {
    id: 'receivedAt',
    header: '접수 일시',
    width: '21%',
    cell: (report) => <time>{report.receivedAt}</time>,
  },
  {
    id: 'status',
    header: '상태',
    width: '14%',
    cell: (report) => <AdminStatusBadge status={report.status} tone={report.statusTone} />,
  },
  {
    id: 'sla',
    header: '처리 기한',
    width: '12%',
    cell: (report) =>
      report.slaExceeded ? (
        <AdminStatusBadge status="48시간 초과" tone="negative" />
      ) : (
        <span className="text-[var(--ui-500)]">-</span>
      ),
  },
];

type FilterOption<T extends string> = {
  value: T;
  label: string;
};

function FilterDropdown<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T | '';
  options: Array<FilterOption<T>>;
  onChange: (value: T | '') => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedLabel = options.find((option) => option.value === value)?.label;

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <AdminFilterButton aria-expanded={isOpen} onClick={() => setIsOpen((current) => !current)}>
        {selectedLabel ?? label}
      </AdminFilterButton>
      {isOpen && (
        <div className="absolute top-full left-0 z-40 mt-[8px] min-w-[150px] overflow-hidden rounded-[10px] border border-[var(--ui-200)] bg-[var(--ui-bg)] py-[6px] shadow-lg">
          <button
            className="Body1 w-full cursor-pointer px-[16px] py-[10px] text-left text-[var(--ui-700)] hover:bg-[var(--ui-50)]"
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
            type="button"
          >
            전체
          </button>
          {options.map((option) => (
            <button
              className="Body1 w-full cursor-pointer px-[16px] py-[10px] text-left text-[var(--ui-700)] hover:bg-[var(--ui-50)]"
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DateRangeFilter({
  fromDate,
  toDate,
  hasInvalidDateRange,
  onFromDateChange,
  onToDateChange,
}: {
  fromDate: string;
  toDate: string;
  hasInvalidDateRange: boolean;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <AdminFilterButton aria-expanded={isOpen} onClick={() => setIsOpen((current) => !current)}>
        날짜범위
      </AdminFilterButton>
      {isOpen && (
        <div className="absolute top-full left-0 z-40 mt-[8px] w-[320px] rounded-[10px] border border-[var(--ui-200)] bg-[var(--ui-bg)] p-[16px] shadow-lg">
          <div className="grid grid-cols-2 gap-[10px]">
            <label className="flex flex-col gap-[6px]">
              <span className="Caption1 font-medium text-[var(--ui-600)]">시작일</span>
              <input
                className={DATE_INPUT_CLASS}
                onChange={(event) => onFromDateChange(event.target.value)}
                type="date"
                value={fromDate}
              />
            </label>
            <label className="flex flex-col gap-[6px]">
              <span className="Caption1 font-medium text-[var(--ui-600)]">종료일</span>
              <input
                className={`${DATE_INPUT_CLASS} ${
                  hasInvalidDateRange ? 'border-[var(--negative-text)]' : ''
                }`}
                min={fromDate || undefined}
                onChange={(event) => onToDateChange(event.target.value)}
                type="date"
                value={toDate}
              />
            </label>
          </div>
          {hasInvalidDateRange && (
            <p className="Caption1 mt-[8px] text-[var(--negative-text)]">
              종료일은 시작일보다 빠를 수 없습니다.
            </p>
          )}
          <div className="mt-[14px] flex gap-[8px]">
            <button
              className="Body1 h-[40px] flex-1 cursor-pointer rounded-[8px] border border-[var(--ui-200)] text-[var(--ui-700)]"
              onClick={() => {
                onFromDateChange('');
                onToDateChange('');
              }}
              type="button"
            >
              초기화
            </button>
            <button
              className="Body1 h-[40px] flex-1 cursor-pointer rounded-[8px] bg-[#4e49ff] text-white disabled:opacity-50"
              disabled={hasInvalidDateRange}
              onClick={() => setIsOpen(false)}
              type="button"
            >
              적용
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReportListPage() {
  const [page, setPage] = useState(1);
  const [targetType, setTargetType] = useState<ComplaintTargetType | ''>('');
  const [status, setStatus] = useState<ComplaintStatus | ''>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const hasInvalidDateRange = Boolean(fromDate && toDate && fromDate > toDate);
  const { data, isError, isPending } = useQuery({
    queryKey: ['admin', 'complaints', targetType, status, fromDate, toDate, page, PAGE_SIZE],
    queryFn: () =>
      getAdminComplaints({
        targetType: targetType || undefined,
        status: status || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        page,
        size: PAGE_SIZE,
      }),
    enabled: !hasInvalidDateRange,
  });

  const reports = data?.content.map(toReportListRow) ?? [];
  const totalPages = data?.totalPages ?? 1;
  const hasFilters = Boolean(targetType || status || fromDate || toDate);
  const emptyMessage = hasInvalidDateRange
    ? '종료일은 시작일보다 빠를 수 없습니다.'
    : isPending
      ? '신고 목록을 불러오는 중입니다.'
      : isError
        ? '신고 목록을 불러오지 못했습니다.'
        : hasFilters
          ? '필터 조건에 맞는 신고가 없습니다.'
          : '접수된 신고가 없습니다.';

  const resetPage = () => setPage(1);

  return (
    <AdminListLayout
      filters={
        <AdminFilterBar className="w-full">
          <FilterDropdown
            label="유형전체"
            onChange={(value) => {
              setTargetType(value);
              resetPage();
            }}
            options={[
              { value: 'CHAT', label: '채팅' },
              { value: 'PROJECT', label: '프로젝트' },
              { value: 'DEVELOPER', label: '개발자' },
            ]}
            value={targetType}
          />
          <FilterDropdown
            label="상태전체"
            onChange={(value) => {
              setStatus(value);
              resetPage();
            }}
            options={[
              { value: 'PENDING', label: '대기' },
              { value: 'IN_REVIEW', label: '검토 중' },
              { value: 'COMPLETED', label: '처리 완료' },
            ]}
            value={status}
          />
          <DateRangeFilter
            fromDate={fromDate}
            hasInvalidDateRange={hasInvalidDateRange}
            onFromDateChange={(value) => {
              setFromDate(value);
              resetPage();
            }}
            onToDateChange={(value) => {
              setToDate(value);
              resetPage();
            }}
            toDate={toDate}
          />
        </AdminFilterBar>
      }
      footer={
        <Pagination page={page} totalPages={totalPages} onChange={setPage} maxButtons={5} />
      }
      title="신고 목록"
    >
      <AdminTable
        ariaLabel="신고 목록"
        columns={REPORT_COLUMNS}
        data={reports}
        emptyMessage={emptyMessage}
        getRowHref={(report) => `/admin/reports/${report.id}`}
        getRowKey={(report) => report.id}
      />
    </AdminListLayout>
  );
}
