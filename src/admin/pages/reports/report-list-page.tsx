import { useState } from 'react';
import Pagination from '@components/common/Pagination';
import { AdminFilterBar } from '../../components/common/admin-filter-bar';
import { AdminFilterButton } from '../../components/common/admin-filter-button';
import { AdminListLayout } from '../../components/common/admin-list-layout';
import { AdminStatusBadge } from '../../components/common/admin-status-badge';
import { AdminTable, type AdminTableColumn } from '../../components/common/admin-table';

type ReportStatusTone = 'positive' | 'negative' | 'neutral';

type Report = {
  id: string;
  type: string;
  reporter: string;
  reported: string;
  receivedAt: string;
  status: string;
  statusTone: ReportStatusTone;
};

const REPORT_DATA: Report[] = [
  {
    id: 'R-1042',
    type: '채팅',
    reporter: 'user_12',
    reported: 'user_88',
    receivedAt: '26-07-15 16:02',
    status: '대기',
    statusTone: 'negative',
  },
  {
    id: 'R-1041',
    type: '채팅',
    reporter: 'user_12',
    reported: 'user_88',
    receivedAt: '26-07-15 16:02',
    status: '대기',
    statusTone: 'negative',
  },
  {
    id: 'R-1040',
    type: '채팅',
    reporter: 'user_12',
    reported: 'user_88',
    receivedAt: '26-07-15 16:02',
    status: '검토중',
    statusTone: 'neutral',
  },
  {
    id: 'R-1039',
    type: '채팅',
    reporter: 'user_12',
    reported: 'user_88',
    receivedAt: '26-07-15 16:02',
    status: '처리 완료',
    statusTone: 'positive',
  },
  {
    id: 'R-1038',
    type: '채팅',
    reporter: 'user_12',
    reported: 'user_88',
    receivedAt: '26-07-15 16:02',
    status: '대기',
    statusTone: 'negative',
  },
  {
    id: 'R-1037',
    type: '채팅',
    reporter: 'user_12',
    reported: 'user_88',
    receivedAt: '26-07-15 16:02',
    status: '대기',
    statusTone: 'negative',
  },
  {
    id: 'R-1036',
    type: '채팅',
    reporter: 'user_12',
    reported: 'user_88',
    receivedAt: '26-07-15 16:02',
    status: '대기',
    statusTone: 'negative',
  },
];

const REPORT_COLUMNS: AdminTableColumn<Report>[] = [
  {
    id: 'id',
    header: '신고 ID',
    width: '14%',
    align: 'center',
    cell: (report) => report.id,
  },
  {
    id: 'type',
    header: '유형',
    width: '12%',
    align: 'center',
    cell: (report) => report.type,
  },
  {
    id: 'reporter',
    header: '신고자',
    width: '16%',
    align: 'center',
    cell: (report) => report.reporter,
  },
  {
    id: 'reported',
    header: '피신고자',
    width: '16%',
    align: 'center',
    cell: (report) => report.reported,
  },
  {
    id: 'receivedAt',
    header: '접수 일시',
    width: '22%',
    align: 'center',
    cell: (report) => <time dateTime={`20${report.receivedAt.replace(' ', 'T')}`}>{report.receivedAt}</time>,
  },
  {
    id: 'status',
    header: '상태',
    width: '20%',
    align: 'center',
    cell: (report) => <AdminStatusBadge status={report.status} tone={report.statusTone} />,
  },
];

const FILTER_LABELS = ['유형전체', '상태전체', '날짜범위'] as const;

export default function ReportListPage() {
  const [page, setPage] = useState(1);

  return (
    <AdminListLayout
      filters={
        <AdminFilterBar>
          {FILTER_LABELS.map((label) => (
            <AdminFilterButton key={label}>{label}</AdminFilterButton>
          ))}
        </AdminFilterBar>
      }
      footer={<Pagination page={page} totalPages={68} onChange={setPage} maxButtons={5} />}
      title="신고 목록"
    >
      <AdminTable
        ariaLabel="신고 목록"
        columns={REPORT_COLUMNS}
        data={REPORT_DATA}
        getRowHref={(report) => `/admin/reports/${report.id}`}
        getRowKey={(report) => report.id}
      />
    </AdminListLayout>
  );
}
