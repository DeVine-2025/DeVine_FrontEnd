import type { ProjectStatus } from './card-types';
import StatusBadge from './StatusBadge';

const labels: Record<ProjectStatus, string> = { recruiting: '모집 중', inProgress: '진행 중', completed: '완료' };

export default function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return <StatusBadge className={`explore-status ${status}`} label={labels[status]} />;
}
