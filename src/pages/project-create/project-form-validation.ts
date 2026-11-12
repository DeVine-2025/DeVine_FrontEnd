import type { ProjectDraftState } from './project-draft.store';

export type ProjectFormFieldKey =
  | 'projectType'
  | 'domain'
  | 'progressType'
  | 'progressPeriod'
  | 'location'
  | 'deadline'
  | 'recruitments'
  | 'title'
  | 'content';

export const PROJECT_FORM_FIELD_ORDER: ProjectFormFieldKey[] = [
  'projectType',
  'domain',
  'progressType',
  'progressPeriod',
  'location',
  'deadline',
  'recruitments',
  'title',
  'content',
];

export function validateProjectForm({
  projectType,
  domain,
  progressType,
  progressPeriod,
  locationText,
  deadlineText,
  recruitments,
  projectTitle,
  contentEmpty,
}: Pick<ProjectDraftState,
  | 'projectType'
  | 'domain'
  | 'progressType'
  | 'progressPeriod'
  | 'locationText'
  | 'deadlineText'
  | 'recruitments'
  | 'projectTitle'
> & { contentEmpty: boolean }): Partial<Record<ProjectFormFieldKey, string>> {
  const nextErrors: Partial<Record<ProjectFormFieldKey, string>> = {};
  if (!projectType) nextErrors.projectType = '프로젝트 유형을 선택해주세요.';
  if (!domain) nextErrors.domain = '도메인을 선택해주세요.';
  if (!progressType) nextErrors.progressType = '진행 방식을 선택해주세요.';
  if (!progressPeriod) nextErrors.progressPeriod = '진행 기간을 선택해주세요.';
  if (!locationText.trim()) nextErrors.location = '진행 장소를 입력해주세요.';
  if (!deadlineText.trim()) nextErrors.deadline = '모집 마감일을 선택해주세요.';
  if (recruitments.length === 0)
    nextErrors.recruitments = '모집 분야를 1개 이상 등록해주세요.';
  if (!projectTitle.trim()) nextErrors.title = '프로젝트 제목을 입력해주세요.';
  if (contentEmpty) nextErrors.content = '프로젝트 내용을 입력해주세요.';
  return nextErrors;
}
