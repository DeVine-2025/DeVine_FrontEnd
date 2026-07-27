import { useState } from 'react';
import Pagination from '@components/common/Pagination';
import { AdminListLayout } from '../../components/common/admin-list-layout';
import { AdminStatusBadge } from '../../components/common/admin-status-badge';
import { AdminTable, type AdminTableColumn } from '../../components/common/admin-table';

type ContentVisibility = '노출' | '비노출';

type Content = {
  id: string;
  title: string;
  author: string;
  createdAt: string;
  visibility: ContentVisibility;
};

const CONTENT_DATA: Content[] = [
  {
    id: 'PJ-201',
    title: 'AI 코드 리뷰봇',
    author: 'user_11',
    createdAt: '06-20',
    visibility: '비노출',
  },
  {
    id: 'PJ-200',
    title: 'AI 코드 리뷰봇',
    author: 'user_11',
    createdAt: '06-20',
    visibility: '노출',
  },
  {
    id: 'PJ-199',
    title: 'AI 코드 리뷰봇',
    author: 'user_11',
    createdAt: '06-20',
    visibility: '노출',
  },
];

const CONTENT_COLUMNS: AdminTableColumn<Content>[] = [
  {
    id: 'id',
    header: '프로젝트 ID',
    width: '16%',
    cell: (content) => content.id,
  },
  {
    id: 'title',
    header: '제목',
    width: '28%',
    cell: (content) => content.title,
  },
  {
    id: 'author',
    header: '작성자',
    width: '18%',
    cell: (content) => content.author,
  },
  {
    id: 'createdAt',
    header: '등록일',
    width: '18%',
    cell: (content) => content.createdAt,
  },
  {
    id: 'visibility',
    header: '노출 상태',
    width: '20%',
    cell: (content) => (
      <AdminStatusBadge
        status={content.visibility}
        tone={content.visibility === '노출' ? 'positive' : 'neutral'}
      />
    ),
  },
];

export default function ContentListPage() {
  const [page, setPage] = useState(1);

  return (
    <AdminListLayout
      footer={<Pagination page={page} totalPages={68} onChange={setPage} maxButtons={5} />}
      title="프로젝트 게시글 관리"
    >
      <AdminTable
        ariaLabel="프로젝트 게시글 목록"
        columns={CONTENT_COLUMNS}
        data={CONTENT_DATA}
        getRowKey={(content) => content.id}
      />
    </AdminListLayout>
  );
}
