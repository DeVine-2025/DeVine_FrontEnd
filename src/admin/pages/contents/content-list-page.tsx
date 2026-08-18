import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useState } from 'react';
import Pagination from '@components/common/Pagination';
import { getAdminNotices, type AdminNoticeListItem } from '../../apis/notice';
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
  visible: boolean;
};

type NoticeListRow = {
  id: number;
  title: string;
  displayPeriod: string;
  displayStatus: string;
  statusTone: 'positive' | 'neutral';
};

const PAGE_SIZE = 10;

const toContent = (project: AdminProjectListItem): Content => ({
  id: project.projectId,
  title: project.title,
  author: project.authorNickname,
  createdAt: dayjs(project.createdAt).format('YY-MM-DD HH:mm'),
  visibility: project.visible ? '노출' : '비노출',
  visible: project.visible,
});

const NOTICE_STATUS_META: Record<string, { label: string; tone: 'positive' | 'neutral' }> = {
  HIDDEN: { label: '비노출', tone: 'neutral' },
  SCHEDULED: { label: '게시 예정', tone: 'neutral' },
  EXPOSED: { label: '노출', tone: 'positive' },
  VISIBLE: { label: '노출', tone: 'positive' },
  ENDED: { label: '게시 종료', tone: 'neutral' },
  EXPIRED: { label: '게시 종료', tone: 'neutral' },
};

const formatDisplayPeriod = (startAt: string | null, endAt: string | null) => {
  const start = startAt ? dayjs(startAt).format('YY-MM-DD HH:mm') : null;
  const end = endAt ? dayjs(endAt).format('YY-MM-DD HH:mm') : null;

  if (start && end) return `${start} ~ ${end}`;
  if (start) return `${start}부터`;
  if (end) return `${end}까지`;
  return '-';
};

const toNoticeListRow = (notice: AdminNoticeListItem): NoticeListRow => {
  const statusMeta = NOTICE_STATUS_META[notice.displayStatus] ?? {
    label: notice.displayStatus,
    tone: notice.isExposed ? ('positive' as const) : ('neutral' as const),
  };

  return {
    id: notice.noticeId,
    title: notice.title,
    displayPeriod: formatDisplayPeriod(notice.displayStartAt, notice.displayEndAt),
    displayStatus: statusMeta.label,
    statusTone: statusMeta.tone,
  };
};

const createContentColumns = (
  onVisibilityClick: (content: Content) => void,
): AdminTableColumn<Content>[] => [
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
      <button
        aria-checked={content.visible}
        aria-label={`${content.title} ${content.visible ? '비노출' : '노출'}로 변경`}
        className={`relative inline-flex h-[34px] w-[88px] cursor-pointer items-center rounded-full border transition-colors ${
          content.visible
            ? 'border-[var(--positive-text)] bg-[var(--positive-bg)]'
            : 'border-[var(--ui-200)] bg-[var(--ui-100)]'
        }`}
        onClick={() => onVisibilityClick(content)}
        role="switch"
        type="button"
      >
        <span
          className={`absolute top-[4px] size-[24px] rounded-full bg-white shadow-sm transition-[left] ${
            content.visible ? 'left-[59px]' : 'left-[4px]'
          }`}
        />
        <span
          className={`Caption1 absolute font-semibold ${
            content.visible
              ? 'left-[13px] text-[var(--positive-text)]'
              : 'right-[9px] text-[var(--ui-500)]'
          }`}
        >
          {content.visibility}
        </span>
      </button>
    ),
  },
];

const NOTICE_COLUMNS: AdminTableColumn<NoticeListRow>[] = [
  {
    id: 'title',
    header: '제목',
    width: '30%',
    align: 'left',
    cell: (notice) => notice.title,
  },
  {
    id: 'displayPeriod',
    header: '게시 기간',
    width: '40%',
    align: 'center',
    cell: (notice) => notice.displayPeriod,
  },
  {
    id: 'displayStatus',
    header: '노출 상태',
    width: '30%',
    cell: (notice) => (
      <AdminStatusBadge status={notice.displayStatus} tone={notice.statusTone} />
    ),
  },
];

export default function ContentListPage() {
  const [page, setPage] = useState(1);
  const [contentType, setContentType] = useState<ContentType>('PROJECT');
  const [visibilityTarget, setVisibilityTarget] = useState<Content | null>(null);
  const isProject = contentType === 'PROJECT';
  const {
    data: projectData,
    isError: isProjectError,
    isPending: isProjectPending,
  } = useQuery({
    queryKey: ['admin', 'projects', page, PAGE_SIZE],
    queryFn: () => getAdminProjects({ page, size: PAGE_SIZE }),
    enabled: isProject,
  });
  const {
    data: noticeData,
    isError: isNoticeError,
    isPending: isNoticePending,
  } = useQuery({
    queryKey: ['admin', 'notices', page, PAGE_SIZE],
    queryFn: () => getAdminNotices({ page, size: PAGE_SIZE }),
    enabled: !isProject,
  });

  const projects = projectData?.content.map(toContent) ?? [];
  const notices = noticeData?.content.map(toNoticeListRow) ?? [];
  const totalPages = isProject
    ? (projectData?.totalPages ?? 1)
    : (noticeData?.totalPages ?? 1);
  const projectEmptyMessage = isProjectPending
    ? '게시글 목록을 불러오는 중입니다.'
    : isProjectError
      ? '게시글 목록을 불러오지 못했습니다.'
      : '등록된 게시글이 없습니다.';
  const noticeEmptyMessage = isNoticePending
    ? '공지사항 목록을 불러오는 중입니다.'
    : isNoticeError
      ? '공지사항 목록을 불러오지 못했습니다.'
      : '등록된 공지사항이 없습니다.';
  const contentColumns = createContentColumns(setVisibilityTarget);

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
      footer={<Pagination page={page} totalPages={totalPages} onChange={setPage} maxButtons={5} />}
      title={isProject ? '게시글 관리' : '공지사항 관리'}
    >
      {isProject ? (
        <AdminTable
          ariaLabel="게시글 목록"
          columns={contentColumns}
          data={projects}
          emptyMessage={projectEmptyMessage}
          getRowKey={(content) => content.id}
        />
      ) : (
        <AdminTable
          ariaLabel="공지사항 목록"
          columns={NOTICE_COLUMNS}
          data={notices}
          emptyMessage={noticeEmptyMessage}
          getRowKey={(notice) => notice.id}
        />
      )}

      {visibilityTarget && (
        <div
          aria-label="프로젝트 노출 상태 변경"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-[20px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setVisibilityTarget(null);
          }}
          role="dialog"
        >
          <div className="w-full max-w-[440px] rounded-[16px] bg-[var(--ui-bg)] p-[28px] shadow-xl">
            <h2 className="Title3 font-bold text-[var(--ui-1000)]">노출 상태 변경</h2>
            <p className="Body1 mt-[12px] text-[var(--ui-700)]">
              <strong>{visibilityTarget.title}</strong> 게시글을{' '}
              <strong>{visibilityTarget.visible ? '비노출' : '노출'}</strong> 상태로 변경합니다.
            </p>
            <p className="Body1 mt-[6px] text-[var(--ui-500)]">
              {visibilityTarget.visible
                ? '변경 후 유저 화면에서 해당 게시글이 숨겨집니다.'
                : '변경 후 유저 화면에 해당 게시글이 다시 표시됩니다.'}
            </p>

            <div className="mt-[24px] flex gap-[10px]">
              <button
                className="Heading2 h-[48px] flex-1 cursor-pointer rounded-[10px] border border-[var(--ui-200)] text-[var(--ui-700)]"
                onClick={() => setVisibilityTarget(null)}
                type="button"
              >
                취소
              </button>
              <button
                className="Heading2 h-[48px] flex-1 cursor-not-allowed rounded-[10px] bg-[#4e49ff] text-white opacity-50"
                disabled
                title="API 응답 명세 확인 후 연결 예정"
                type="button"
              >
                변경
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminListLayout>
  );
}
