import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useState } from 'react';
import Pagination from '@components/common/Pagination';
import { getAdminProjects, type AdminProjectListItem } from '../../apis/project';
import { AdminListLayout } from '../../components/common/admin-list-layout';
import { AdminStatusBadge } from '../../components/common/admin-status-badge';
import { AdminTable, type AdminTableColumn } from '../../components/common/admin-table';

type ContentVisibility = '노출' | '비노출';
type ContentType = 'PROJECT' | 'NOTICE';

type Content = {
  id: number;
  title: string;
  author: string;
  createdAt: string;
  visibility: ContentVisibility;
};

const PAGE_SIZE = 10;

const toContent = (project: AdminProjectListItem): Content => ({
  id: project.projectId,
  title: project.title,
  author: project.authorNickname,
  createdAt: dayjs(project.createdAt).format('YY-MM-DD HH:mm'),
  visibility: project.visible ? '노출' : '비노출',
});

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
  const [contentType, setContentType] = useState<ContentType>('PROJECT');
  const isProject = contentType === 'PROJECT';
  const { data, isError, isPending } = useQuery({
    queryKey: ['admin', 'projects', page, PAGE_SIZE],
    queryFn: () => getAdminProjects({ page, size: PAGE_SIZE }),
    enabled: isProject,
  });

  const projects = data?.content.map(toContent) ?? [];
  const totalPages = data?.totalPages ?? 1;
  const projectEmptyMessage = isPending
    ? '게시글 목록을 불러오는 중입니다.'
    : isError
      ? '게시글 목록을 불러오지 못했습니다.'
      : '등록된 게시글이 없습니다.';

  return (
    <AdminListLayout
      filters={
        <div
          aria-label="콘텐츠 유형"
          className="flex flex-wrap items-center gap-[8px]"
          role="tablist"
        >
          {[
            { value: 'PROJECT' as const, label: '게시글' },
            { value: 'NOTICE' as const, label: '공지사항' },
          ].map((tab) => {
            const isSelected = tab.value === contentType;

            return (
              <button
                aria-selected={isSelected}
                className={`Body1 h-[48px] cursor-pointer rounded-full border px-[18px] font-medium transition-colors ${
                  isSelected
                    ? 'border-[var(--ui-1000)] bg-[var(--ui-1000)] text-[var(--ui-bg)]'
                    : 'border-[var(--ui-200)] bg-[var(--ui-bg)] text-[var(--ui-600)] hover:bg-[var(--ui-50)]'
                }`}
                key={tab.value}
                onClick={() => {
                  setContentType(tab.value);
                  setPage(1);
                }}
                role="tab"
                type="button"
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      }
      footer={
        isProject ? (
          <Pagination page={page} totalPages={totalPages} onChange={setPage} maxButtons={5} />
        ) : undefined
      }
      title={isProject ? '게시글 관리' : '공지사항 관리'}
    >
      <AdminTable
        ariaLabel={isProject ? '게시글 목록' : '공지사항 목록'}
        columns={CONTENT_COLUMNS}
        data={isProject ? projects : []}
        emptyMessage={isProject ? projectEmptyMessage : '등록된 공지사항이 없습니다.'}
        getRowKey={(content) => content.id}
      />
    </AdminListLayout>
  );
}
