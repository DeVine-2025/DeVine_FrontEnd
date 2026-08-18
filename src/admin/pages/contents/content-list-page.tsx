import Pagination from '@components/common/Pagination';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  ADMIN_PROJECTS_QUERY_KEY,
  type AdminProject,
  type AdminProjectPage,
  getAdminProjects,
  updateProjectVisibility,
} from '../../apis/project';
import { AdminListLayout } from '../../components/common/admin-list-layout';
import { AdminStatusBadge } from '../../components/common/admin-status-badge';
import { AdminTable, type AdminTableColumn } from '../../components/common/admin-table';

const PAGE_SIZE = 10;

function formatCreatedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export default function ContentListPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const {
    data: projectPage,
    isError: isProjectsError,
    isPending: isProjectsPending,
    refetch: refetchProjects,
  } = useQuery({
    queryKey: [...ADMIN_PROJECTS_QUERY_KEY, page, PAGE_SIZE],
    queryFn: () => getAdminProjects({ page, size: PAGE_SIZE }),
  });
  const {
    isError: isVisibilityUpdateError,
    isPending: isVisibilityUpdating,
    mutate: updateVisibility,
  } = useMutation({
    mutationFn: ({ projectId, visible }: { projectId: number; visible: boolean }) =>
      updateProjectVisibility(projectId, visible),
    onSuccess: (updatedProject, variables) => {
      queryClient.setQueriesData<AdminProjectPage>(
        { queryKey: ADMIN_PROJECTS_QUERY_KEY },
        (currentProjectPage) => {
          if (!currentProjectPage) return currentProjectPage;

          return {
            ...currentProjectPage,
            content: currentProjectPage.content.map((project) =>
              project.projectId === variables.projectId
                ? { ...project, visible: updatedProject.visibility === 'PUBLIC' }
                : project,
            ),
          };
        },
      );
    },
  });

  const handleVisibilityChange = (project: AdminProject) => {
    const nextVisible = !project.visible;
    const nextStatus = nextVisible ? '노출' : '비노출';

    if (!window.confirm(`“${project.title}” 프로젝트를 ${nextStatus} 상태로 전환할까요?`)) return;

    updateVisibility({ projectId: project.projectId, visible: nextVisible });
  };

  const columns: AdminTableColumn<AdminProject>[] = [
    {
      id: 'id',
      header: '프로젝트 ID',
      width: '16%',
      cell: (project) => project.projectId,
    },
    {
      id: 'title',
      header: '제목',
      width: '28%',
      cell: (project) => project.title,
    },
    {
      id: 'author',
      header: '작성자',
      width: '18%',
      cell: (project) => project.authorNickname,
    },
    {
      id: 'createdAt',
      header: '등록일',
      width: '18%',
      cell: (project) => (
        <time dateTime={project.createdAt}>{formatCreatedAt(project.createdAt)}</time>
      ),
    },
    {
      id: 'visibility',
      header: '노출 상태',
      width: '20%',
      cell: (project) => {
        const nextStatus = project.visible ? '비노출' : '노출';

        return (
          <button
            aria-label={`${project.title} ${nextStatus}으로 전환`}
            className="cursor-pointer rounded-[8px] disabled:cursor-wait disabled:opacity-60"
            disabled={isVisibilityUpdating}
            onClick={() => handleVisibilityChange(project)}
            title={`클릭하여 ${nextStatus}으로 전환`}
            type="button"
          >
            <AdminStatusBadge
              status={project.visible ? '노출' : '비노출'}
              tone={project.visible ? 'positive' : 'neutral'}
            />
          </button>
        );
      },
    },
  ];

  const projects = projectPage?.content ?? [];
  const emptyMessage = isProjectsPending
    ? '프로젝트 목록을 불러오는 중입니다.'
    : isProjectsError
      ? '프로젝트 목록을 불러오지 못했습니다.'
      : undefined;

  return (
    <AdminListLayout
      footer={
        <Pagination
          maxButtons={5}
          onChange={setPage}
          page={page}
          totalPages={projectPage?.totalPages ?? 0}
        />
      }
      title="프로젝트 게시글 관리"
    >
      <AdminTable
        ariaLabel="프로젝트 게시글 목록"
        columns={columns}
        data={projects}
        emptyMessage={
          isProjectsError ? (
            <button
              className="cursor-pointer font-semibold text-[#4e49ff] underline"
              onClick={() => void refetchProjects()}
              type="button"
            >
              {emptyMessage} 다시 시도
            </button>
          ) : (
            emptyMessage
          )
        }
        getRowKey={(project) => project.projectId}
      />

      {isVisibilityUpdateError && (
        <p className="Body1 mt-[12px] text-[var(--negative-text)]">
          프로젝트 노출 상태 변경에 실패했습니다. 다시 시도해주세요.
        </p>
      )}
    </AdminListLayout>
  );
}
