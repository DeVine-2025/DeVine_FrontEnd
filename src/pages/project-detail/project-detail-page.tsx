import { applyProject, getMyApplyStatus, updateMyApply } from '@apis/apply';
import { createBookmark, deleteBookmark, getBookmarks } from '@apis/bookmarks';
import { getMemberProfileByNickname } from '@apis/members';
import { getProjectDetail, type ProjectStatus, updateProjectStatus } from '@apis/project-detail';
import { getMyRecruitingProjects } from '@apis/projects';
import ChevronRightIcon from '@assets/icons/chevron-right.svg?react';
import PersonIcon from '@assets/icons/person.svg?react';
import ProfilePlaceholderIcon from '@assets/icons/profile-placeholder.svg?react';
import { useAuth, useUser } from '@clerk/clerk-react';
import BookmarkButton from '@components/common/BookmarkButton';
import LoadingSpinner from '@components/common/LoadingSpinner';
import { getTechBadgeByName } from '@constants/position-tech-stack';
import { useThemeStore } from '@store/theme';
import type { Position, ProjectItem, TechStack } from '@t/project/api';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
type FallbackProject = { id: string; title: string; categoryLabel?: string; deadlineLabel?: string; location?: string; durationRangeName?: string; mode?: string };
import { type BadgeTone, badgeToneToClass } from 'src/shared/types/badgeTone';

type ProjectDetailInfo = {
  id: string;
  categoryLabel?: string;
  deadlineLabel?: string;
  title: string;
  location?: string;
  period?: string;
  mode?: string;
  dueLabel?: string;
  summary?: string;
  creatorName?: string | null;
  creatorId?: number;
  isOwner?: boolean;
  creatorImage?: string | null;
  imageUrls?: string[];
  roles?: ProjectRoleInfo[];
  bookmarked?: boolean;
  bookmarkId?: number;
  status?: ProjectStatus;
};

type ProjectRoleInfo = {
  key: string;
  label: string;
  tone: BadgeTone;
  current: number;
  total: number;
  techStacks: string[];
};

type RecruitmentLike = {
  position?: Position | string;
  positionName?: string;
  currentCount?: number;
  count?: number;
  techStacks?: TechStack[] | null;
};

const toProjectDetailInfo = (project: FallbackProject): ProjectDetailInfo => ({
  id: project.id,
  categoryLabel: project.categoryLabel,
  deadlineLabel: project.deadlineLabel,
  title: project.title,
  location: project.location,
  period: project.deadlineLabel,
  mode: project.mode,
  dueLabel: 'dueLabel' in project ? (project.dueLabel as string | undefined) : undefined,
});

const API_BASE = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL ?? '');

function resolveImageUrl(url: string): string {
  if (!url || url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//'))
    return url;
  if (url.startsWith('/') && API_BASE) return `${API_BASE.replace(/\/$/, '')}${url}`;
  return url;
}

function getProjectImageUrls(project: ProjectItem): string[] {
  let raw: string[] = [];
  if (Array.isArray(project.imageUrls) && project.imageUrls.length > 0) {
    raw = project.imageUrls.filter((u): u is string => typeof u === 'string' && u.length > 0);
  } else if (Array.isArray(project.images) && project.images.length > 0) {
    raw = project.images
      .map((img) => img?.imageUrl ?? img?.url)
      .filter((u): u is string => typeof u === 'string' && u.length > 0);
  } else if (project.thumbnailUrl && typeof project.thumbnailUrl === 'string') {
    raw = [project.thumbnailUrl];
  }
  return raw.map(resolveImageUrl);
}

const toProjectDetailInfoFromApi = (project: ProjectItem): ProjectDetailInfo => {
  const summary =
    'content' in project && typeof project.content === 'string' ? project.content : undefined;
  const imageUrls = getProjectImageUrls(project);
  const recruitments =
    'recruitments' in project && Array.isArray(project.recruitments)
      ? (project.recruitments as RecruitmentLike[])
      : (project.positions ?? []);
  const isOwner =
    'isOwner' in project
      ? Boolean((project as ProjectItem & { isOwner?: boolean }).isOwner)
      : undefined;

  // eslint-disable-next-line no-console
  console.log(
    '[프로젝트 상세] API raw creatorImage:',
    project.creatorImage,
    '| creatorNickname:',
    project.creatorNickname,
    '| creatorName:',
    project.creatorName,
  );

  return {
    id: String(project.projectId),
    categoryLabel: project.projectFieldName,
    deadlineLabel: project.categoryName,
    title: project.title,
    location: project.location,
    period: project.durationRangeName ?? undefined,
    mode: project.modeName,
    dueLabel: project.recruitmentDeadline,
    bookmarked: project.bookmarked,
    bookmarkId: project.bookmarkId,
    status: (project.status as ProjectStatus) ?? undefined,
    summary,
    creatorName: project.creatorNickname ?? project.creatorName,
    creatorId: project.creatorId,
    isOwner,
    creatorImage: project.creatorImage ?? null,
    imageUrls,
    roles: recruitments.map((recruitment) => {
      const positionKey = recruitment.position as Position;
      const label =
        (typeof recruitment.positionName === 'string' && recruitment.positionName) ||
        positionLabelByKey[positionKey] ||
        (typeof recruitment.position === 'string' ? recruitment.position : '포지션');
      return {
        key: typeof recruitment.position === 'string' ? recruitment.position : String(positionKey),
        label,
        tone: badgeToneByPosition[positionKey] ?? 'blue',
        current: recruitment.currentCount ?? 0,
        total: recruitment.count ?? 0,
        techStacks: Array.isArray(recruitment.techStacks)
          ? recruitment.techStacks
              .map(
                (stack) =>
                  stack.techStackName ?? (stack as TechStack & { techStack?: string }).techStack,
              )
              .filter((name): name is string => typeof name === 'string' && name.trim().length > 0)
          : [],
      };
    }),
  };
};

const badgeToneByPosition: Partial<Record<Position, BadgeTone>> = {
  BACKEND: 'green',
  FRONTEND: 'blue',
  INFRA: 'pink',
  DESIGN: 'pink',
  PM: 'blue',
  IOS: 'orange',
  ANDROID: 'orange',
};

const positionLabelByKey: Partial<Record<Position, string>> = {
  BACKEND: '백엔드',
  FRONTEND: '프론트엔드',
  INFRA: '인프라',
  DESIGN: '디자인',
  PM: 'PM',
  IOS: 'iOS',
  ANDROID: '안드로이드',
};

type RoleBadgeProps = {
  label: string;
  tone: BadgeTone;
};

const RoleBadge = ({ label, tone }: RoleBadgeProps) => (
  <span
    className={`inline-flex items-center whitespace-nowrap rounded-lg px-3 py-1 font-semibold text-[12px] ${badgeToneToClass[tone]}`}
  >
    {label}
  </span>
);

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [appliedMatchingId, setAppliedMatchingId] = useState<number | undefined>(undefined);
  const [appliedPart, setAppliedPart] = useState<string | undefined>(undefined);
  const [isApplying, setIsApplying] = useState(false);
  const [apiProject, setApiProject] = useState<ProjectDetailInfo | null>(null);
  const [isOwnerByList, setIsOwnerByList] = useState(false);
  const [creatorProfileImage, setCreatorProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLightboxIndex, setImageLightboxIndex] = useState<number | null>(null);
  const [bookmarkState, setBookmarkState] = useState<{
    bookmarked: boolean;
    bookmarkId?: number;
  }>({ bookmarked: false });
  const [projectStatus, setProjectStatus] = useState<ProjectStatus | null>(null);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const statusMenuRef = useRef<HTMLDivElement>(null);

  /** 사용자가 북마크 버튼을 눌렀으면, fetch 결과로 덮어쓰지 않음 (색 유지) */
  const userDidChangeBookmarkRef = useRef(false);
  const prevProjectIdRef = useRef<string | undefined>(undefined);

  const handleBookmarkChange = useCallback(
    async (next: boolean) => {
      if (!projectId) return;
      if (isLoaded && !isSignedIn) {
        setIsLoginModalOpen(true);
        return;
      }
      const token = await getToken();
      if (!token) {
        setIsLoginModalOpen(true);
        return;
      }
      const targetId = Number(projectId);
      if (Number.isNaN(targetId)) return;
      const prevBookmarked = bookmarkState.bookmarked;
      const prevBookmarkId = bookmarkState.bookmarkId;
      userDidChangeBookmarkRef.current = true;
      if (next) {
        setBookmarkState({ bookmarked: true, bookmarkId: undefined });
        setApiProject((prev) =>
          prev ? { ...prev, bookmarked: true, bookmarkId: undefined } : null,
        );
      } else {
        if (prevBookmarkId == null) return;
        setBookmarkState({ bookmarked: false, bookmarkId: undefined });
        setApiProject((prev) =>
          prev ? { ...prev, bookmarked: false, bookmarkId: undefined } : null,
        );
      }
      try {
        if (next) {
          const { bookmarkId } = await createBookmark({ targetType: 'PROJECT', targetId }, token);
          setBookmarkState({ bookmarked: true, bookmarkId });
          setApiProject((prev) => (prev ? { ...prev, bookmarked: true, bookmarkId } : null));
        } else {
          if (prevBookmarkId == null) return;
          await deleteBookmark(prevBookmarkId, token);
        }
      } catch (e) {
        console.error('[북마크]', e);
        setBookmarkState({ bookmarked: prevBookmarked, bookmarkId: prevBookmarkId });
        setApiProject((prev) =>
          prev ? { ...prev, bookmarked: prevBookmarked, bookmarkId: prevBookmarkId } : null,
        );
        alert(e instanceof Error ? e.message : '북마크 처리에 실패했습니다.');
      }
    },
    [projectId, bookmarkState.bookmarked, bookmarkState.bookmarkId, getToken, isLoaded, isSignedIn],
  );

  useEffect(() => {
    if (!projectId) return;
    if (prevProjectIdRef.current !== projectId) {
      prevProjectIdRef.current = projectId;
      userDidChangeBookmarkRef.current = false;
    }
    let isActive = true;

    const fetchProject = async () => {
      setIsLoading(true);
      try {
        const numericId = Number(projectId);
        if (Number.isNaN(numericId)) {
          if (isActive) setApiProject(null);
          return;
        }
        const token = await getToken();
        const result = await getProjectDetail(numericId, token);
        if (!isActive) return;
        let mapped = result ? toProjectDetailInfoFromApi(result) : null;

        // 상세 API가 bookmarked/bookmarkId를 내려주지 않는 경우가 있어, 북마크 목록으로 보정
        if (mapped && token) {
          try {
            const bookmarks = await getBookmarks(token);
            const hit = bookmarks.find(
              (b) => b.targetType === 'PROJECT' && b.targetId === numericId,
            );
            if (hit) {
              mapped = { ...mapped, bookmarked: true, bookmarkId: hit.bookmarkId };
            }
          } catch (e) {
            console.error('[북마크] 목록 기반 보정 실패', e);
          }
        }

        if (token) {
          try {
            const applyStatus = await getMyApplyStatus(numericId, token);
            if (isActive) {
              setHasApplied(applyStatus.exists);
              setAppliedMatchingId(applyStatus.matchingId);
              setAppliedPart(applyStatus.part);
            }
          } catch (e) {
            console.error('[지원 상태] 조회 실패', e);
            if (isActive) {
              setHasApplied(false);
              setAppliedMatchingId(undefined);
              setAppliedPart(undefined);
            }
          }
        } else if (isActive) {
          setHasApplied(false);
          setAppliedMatchingId(undefined);
          setAppliedPart(undefined);
        }

        setApiProject(mapped);
        if (mapped?.status) {
          setProjectStatus(mapped.status);
        }
        if (mapped && !userDidChangeBookmarkRef.current) {
          setBookmarkState({
            bookmarked: mapped.bookmarked ?? false,
            bookmarkId: mapped.bookmarkId,
          });
        }
      } catch {
        if (isActive) {
          setApiProject(null);
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void fetchProject();
    return () => {
      isActive = false;
    };
  }, [projectId]);

  const fallbackProject: FallbackProject | undefined = undefined;
  const sessionProject = useMemo(() => {
    if (!projectId) return undefined;
    try {
      const raw = sessionStorage.getItem(`project_detail_${projectId}`);
      if (!raw) return undefined;
      return JSON.parse(raw) as ProjectDetailInfo;
    } catch {
      return undefined;
    }
  }, [projectId]);

  const project =
    apiProject ??
    sessionProject ??
    (fallbackProject ? toProjectDetailInfo(fallbackProject) : undefined);
  const currentMemberId = useMemo(() => {
    const unsafe = user?.unsafeMetadata as { memberId?: number } | undefined;
    const publicMeta = user?.publicMetadata as { memberId?: number } | undefined;
    return unsafe?.memberId ?? publicMeta?.memberId ?? null;
  }, [user?.publicMetadata, user?.unsafeMetadata]);
  const isOwner =
    Boolean(project?.isOwner) ||
    (project?.creatorId != null &&
      currentMemberId != null &&
      project.creatorId === currentMemberId) ||
    isOwnerByList;
  const creatorImage = project?.creatorImage ?? creatorProfileImage;

  // eslint-disable-next-line no-console
  console.log(
    '[프로젝트 상세] 렌더링 creatorImage:',
    creatorImage,
    '| project.creatorImage:',
    project?.creatorImage,
    '| creatorProfileImage:',
    creatorProfileImage,
  );

  useEffect(() => {
    if (!project || project.creatorImage) {
      setCreatorProfileImage(null);
      return;
    }
    if (!project.creatorName) return;
    const controller = new AbortController();
    getMemberProfileByNickname(project.creatorName, controller.signal)
      .then((profile) => {
        setCreatorProfileImage(profile?.image ?? null);
      })
      .catch(() => {
        setCreatorProfileImage(null);
      });
    return () => controller.abort();
  }, [project, project?.creatorImage, project?.creatorName]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !projectId) {
      setIsOwnerByList(false);
      return;
    }
    const controller = new AbortController();
    getToken()
      .then((token) => {
        if (!token) return null;
        return getMyRecruitingProjects(token, controller.signal);
      })
      .then((projects) => {
        if (!projects) return;
        const numericId = Number(projectId);
        if (!Number.isFinite(numericId)) return;
        const hit = projects.some((p) => p.projectId === numericId);
        setIsOwnerByList(hit);
      })
      .catch(() => {
        // ignore lookup errors
      });
    return () => controller.abort();
  }, [getToken, isLoaded, isSignedIn, projectId]);

  useEffect(() => {
    if (!isStatusMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(e.target as Node)) {
        setIsStatusMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isStatusMenuOpen]);

  const roleOptions = useMemo(() => {
    if (project?.roles && project.roles.length > 0) {
      return project.roles.map((role) => ({ key: role.key, label: role.label }));
    }
    return [
      { key: 'frontend', label: '프론트엔드' },
      { key: 'backend', label: '백엔드' },
      { key: 'infra', label: '인프라' },
    ];
  }, [project?.roles]);
  const selectedRoleLabel =
    roleOptions.find((option) => option.key === selectedRole)?.label ?? '포지션';
  const isDark = theme === 'dark';
  const renderTechBadge = (tech: string, key: string) => {
    const badge = getTechBadgeByName(tech);
    if (!badge) {
      return (
        <span
          key={key}
          className="inline-flex items-center rounded-full border border-[var(--ui-200)] bg-[var(--ui-100)] px-3 py-1 text-[var(--ui-800)] text-sm"
        >
          {tech}
        </span>
      );
    }

    const src = isDark ? (badge.offDark ?? badge.off) : badge.off;
    return <img key={key} src={src} alt={`${tech} 배지`} className="h-12 w-auto" loading="lazy" />;
  };

  if (!projectId || (!project && !isLoading)) {
    return <div>프로젝트 정보를 찾을 수 없습니다.</div>;
  }
  if (!project) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const handleApply = async () => {
    if (!projectId || !selectedRole) return;
    if (isLoaded && !isSignedIn) {
      setIsLoginModalOpen(true);
      return;
    }
    try {
      setIsApplying(true);
      const token = await getToken();
      if (!token) {
        setIsLoginModalOpen(true);
        return;
      }

      if (hasApplied) {
        // 이미 지원한 상태 → 역할 수정
        await updateMyApply(Number(projectId), selectedRole, token);
        setAppliedPart(selectedRole);
      } else {
        // 새 지원
        await applyProject(Number(projectId), selectedRole, token);
        setHasApplied(true);
      }

      setIsApplyModalOpen(false);
    } catch (error) {
      console.error(error);
      alert(
        hasApplied
          ? '지원 역할 수정에 실패했어요. 잠시 후 다시 시도해 주세요.'
          : '프로젝트 지원에 실패했어요. 잠시 후 다시 시도해 주세요.',
      );
    } finally {
      setIsApplying(false);
    }
  };

  const STATUS_OPTIONS: { key: ProjectStatus; label: string }[] = [
    { key: 'RECRUITING', label: '프로젝트 모집 중' },
    { key: 'IN_PROGRESS', label: '프로젝트 진행 중' },
    { key: 'COMPLETED', label: '프로젝트 완료' },
  ];

  const currentStatusLabel =
    STATUS_OPTIONS.find((o) => o.key === projectStatus)?.label ?? '상태 변경';

  const handleStatusChange = async (status: ProjectStatus) => {
    if (!projectId || isStatusUpdating) return;
    try {
      setIsStatusUpdating(true);
      const token = await getToken();
      if (!token) {
        setIsLoginModalOpen(true);
        return;
      }
      await updateProjectStatus(Number(projectId), status, token);
      setProjectStatus(status);
      setIsStatusMenuOpen(false);
    } catch (error) {
      console.error('[상태 변경]', error);
      alert(error instanceof Error ? error.message : '프로젝트 상태 변경에 실패했습니다.');
    } finally {
      setIsStatusUpdating(false);
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-[1180px] flex-col gap-10 pb-20">
      <header className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-card-bg text-[var(--ui-700)] hover:opacity-80"
          aria-label="뒤로가기"
        >
          <svg
            className="h-12 w-12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </header>

      <section className="flex flex-col gap-8 rounded-3xl bg-card-bg p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-start">
          <div className="flex min-w-0 flex-col gap-6">
            {(project.imageUrls?.length ?? 0) > 0 && (
              <div
                className={`-mt-10 grid grid-cols-1 gap-4 ${
                  project.imageUrls!.length === 1
                    ? 'place-items-center'
                    : project.imageUrls!.length >= 3
                      ? 'lg:grid-cols-3'
                      : 'lg:grid-cols-2'
                }`}
              >
                {project.imageUrls!.map((imageUrl, index) => (
                  <button
                    type="button"
                    key={`project-image-${index}`}
                    onClick={() => setImageLightboxIndex(index)}
                    className={`group relative aspect-[4/3] max-h-[220px] min-h-[140px] w-full overflow-hidden rounded-2xl border border-[var(--ui-200)] bg-card-section-bg text-left shadow-md transition-all duration-200 hover:border-[var(--ui-300)] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--ui-400)] focus:ring-offset-2 focus:ring-offset-[var(--card-bg)] ${
                      project.imageUrls!.length === 1 ? 'max-h-[250px] max-w-[600px]' : ''
                    }`}
                  >
                    <img
                      src={imageUrl}
                      alt={
                        project.imageUrls!.length === 1
                          ? `${project.title} 대표 이미지`
                          : `${project.title} 이미지 ${index + 1}`
                      }
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                {/* 카테고리 배지 숨김 */}
                <div className="flex items-start gap-3">
                  <h1 className="max-w-[800px] font-semibold text-[24px] text-card-title lg:text-[28px]">
                    {project.title}
                  </h1>
                  <BookmarkButton
                    bookmarked={bookmarkState.bookmarked}
                    onBookmarkChange={handleBookmarkChange}
                    className="mt-2 ml-auto h-[48px] w-[48px] shrink-0"
                    iconClassName="h-[40px] w-[40px]"
                    colorIconClassName="h-[48px] w-[48px]"
                    aria-label="북마크"
                  />
                </div>
                <div className="flex items-center gap-3 text-card-muted">
                  {creatorImage ? (
                    <img
                      src={creatorImage}
                      alt={project.creatorName ?? '프로필 이미지'}
                      className="h-12 w-12 rounded-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-card-section-bg">
                      <ProfilePlaceholderIcon className="h-12 w-12 text-card-muted" aria-hidden />
                    </div>
                  )}
                  <span className="font-semibold text-[var(--ui-1000)] text-xl">
                    {project.creatorName ?? '닉네임'}
                  </span>
                </div>
                {hasApplied && !isOwner && (
                  <button
                    type="button"
                    onClick={() => {
                      if (appliedPart) setSelectedRole(appliedPart);
                      setIsApplyModalOpen(true);
                      setIsRoleMenuOpen(false);
                    }}
                    className="mt-2 inline-flex h-[36px] w-full items-center justify-center gap-2 rounded-[10px] border border-[var(--ui-200)] bg-[var(--ui-100)] font-medium text-[14px] text-[var(--ui-500)]"
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                    </svg>
                    수정하기
                  </button>
                )}
                {isOwner && (
                  <div className="mt-2 flex w-full items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        navigate('/project/create', {
                          state: { projectId: Number(project.id), mode: 'edit' },
                        })
                      }
                      className="inline-flex h-[36px] flex-[3] items-center justify-center gap-2 rounded-[10px] border border-[var(--ui-200)] bg-[var(--ui-100)] font-medium text-[14px] text-[var(--ui-500)]"
                    >
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                      </svg>
                      수정하기
                    </button>
                    <div ref={statusMenuRef} className="relative flex-[2]">
                      <button
                        type="button"
                        onClick={() => setIsStatusMenuOpen((prev) => !prev)}
                        disabled={isStatusUpdating}
                        className={`inline-flex h-[36px] w-full items-center justify-center gap-2 rounded-[10px] font-medium text-[14px] text-white ${
                          projectStatus === 'COMPLETED'
                            ? 'bg-[var(--ui-400)]'
                            : projectStatus === 'IN_PROGRESS'
                              ? 'bg-[#22C55E]'
                              : 'bg-[#4E49FF]'
                        }`}
                      >
                        {isStatusUpdating ? '변경 중...' : currentStatusLabel}
                        <svg
                          className={`h-3.5 w-3.5 transition-transform ${isStatusMenuOpen ? 'rotate-180' : ''}`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </button>
                      {isStatusMenuOpen && (
                        <div
                          className="absolute z-20 mt-2 w-full rounded-[12px] py-2 shadow-[0_12px_30px_rgba(0,0,0,0.15)]"
                          style={{
                            backgroundColor: isDark ? '#212328' : '#FFFFFF',
                            border: `1px solid ${isDark ? '#41444D' : 'var(--ui-200)'}`,
                          }}
                        >
                          {STATUS_OPTIONS.map((option) => (
                            <button
                              key={option.key}
                              type="button"
                              onClick={() => handleStatusChange(option.key)}
                              className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-[14px] transition-colors ${
                                projectStatus === option.key
                                  ? 'font-semibold'
                                  : 'hover:bg-[var(--ui-100)]'
                              }`}
                              style={{
                                color:
                                  projectStatus === option.key
                                    ? '#4E49FF'
                                    : isDark
                                      ? '#F8F9FB'
                                      : 'var(--ui-700)',
                              }}
                            >
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  option.key === 'RECRUITING'
                                    ? 'bg-[#4E49FF]'
                                    : option.key === 'IN_PROGRESS'
                                      ? 'bg-[#22C55E]'
                                      : 'bg-[var(--ui-400)]'
                                }`}
                              />
                              {option.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="h-px w-full bg-card-border" />
          </div>

          <div
            className={`flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end lg:gap-6 ${
              (project.imageUrls?.length ?? 0) > 0 ? 'mt-[20rem] lg:mt-[30rem]' : 'mt-20 lg:mt-24'
            }`}
          >
            {!isOwner && !hasApplied && (
              <button
                type="button"
                onClick={() => {
                  if (isLoaded && !isSignedIn) {
                    setIsLoginModalOpen(true);
                    return;
                  }
                  setIsApplyModalOpen(true);
                  setIsRoleMenuOpen(false);
                }}
                className="h-[36px] w-[200px] rounded-[10px] bg-[#4E49FF] px-4 font-medium text-[14px] text-white hover:opacity-80"
              >
                지원하기
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
          <div className="flex min-w-0 flex-col gap-6">
            <div className="grid gap-x-12 gap-y-8 text-card-muted lg:grid-cols-2">
              <div className="grid grid-cols-[96px_1fr] items-center gap-x-10">
                <span className="text-[15px]">프로젝트 유형</span>
                <span className="font-semibold text-[15px] text-card-title">
                  {project.categoryLabel ?? '모바일/앱'}
                </span>
              </div>
              <div className="grid grid-cols-[96px_1fr] items-center gap-x-10">
                <span className="text-[15px]">도메인</span>
                <span className="font-semibold text-[15px] text-card-title">
                  {project.deadlineLabel ?? '추후 결정 예정'}
                </span>
              </div>
              <div className="grid grid-cols-[96px_1fr] items-center gap-x-10">
                <span className="text-[15px]">진행 장소</span>
                <span className="font-semibold text-[15px] text-card-title">
                  {project.location ?? '추후 결정 예정'}
                </span>
              </div>
              <div className="grid grid-cols-[96px_1fr] items-center gap-x-10">
                <span className="text-[15px]">진행 방식</span>
                <span className="font-semibold text-[15px] text-card-title">
                  {project.mode ?? '온라인/오프라인'}
                </span>
              </div>
              <div className="grid grid-cols-[96px_1fr] items-center gap-x-10">
                <span className="text-[15px]">진행 기간</span>
                <span className="font-semibold text-[15px] text-card-title">
                  {project.period ?? '추후 결정 예정'}
                </span>
              </div>
              <div className="grid grid-cols-[96px_1fr] items-center gap-x-10">
                <span className="text-[15px]">모집 마감일</span>
                <span className="font-semibold text-[15px] text-card-title">
                  {project.dueLabel ?? '추후 결정 예정'}
                </span>
              </div>
            </div>

            <section className="mt-4 flex flex-col gap-4">
              <h2
                className="font-medium text-[15px]"
                style={{ color: isDark ? '#7F8596' : '#939AAE' }}
              >
                모집 분야
              </h2>
              {project.roles?.length ? (
                project.roles.map((role) => (
                  <div key={role.key} className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <RoleBadge label={role.label} tone={role.tone} />
                      <span className="flex items-center gap-2 font-semibold text-[14px]">
                        <PersonIcon
                          className="h-6 w-6"
                          style={{ color: isDark ? '#D4DAE7' : '#41444D' }}
                          aria-hidden
                        />
                        <span className="flex items-center">
                          <span style={{ color: isDark ? '#D4DAE7' : '#41444D' }}>
                            {role.current}
                          </span>
                          <span style={{ color: isDark ? '#7F8596' : '#939AAE' }}>
                            /{role.total}명
                          </span>
                        </span>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(role.techStacks) && role.techStacks.length > 0 ? (
                        role.techStacks.map((tech) => renderTechBadge(tech, `${role.key}-${tech}`))
                      ) : (
                        <span className="text-card-muted text-sm">기술 스택 정보 없음</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <span className="text-card-muted text-sm">모집 정보가 없습니다.</span>
              )}
            </section>
          </div>
          <div className="hidden lg:block" />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="flex min-w-0 flex-col gap-6">
          <div className="font-semibold text-2xl text-card-title">프로젝트 소개</div>
          <div className="flex items-center">
            <span className="h-[2px] w-35 bg-[var(--color-card-title)]" />
            <span className="h-[1.5px] flex-1 bg-[var(--color-card-border)]" />
          </div>
          <div
            className="max-w-[880px] text-white/85 text-xl leading-relaxed [&_a]:text-badge-text-primary [&_a]:underline [&_em]:italic [&_h1]:my-2 [&_h1]:font-bold [&_h1]:text-2xl [&_h2]:my-2 [&_h2]:font-bold [&_h2]:text-xl [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_p]:text-xl [&_s]:line-through [&_ul]:list-disc [&_ul]:pl-5"
            dangerouslySetInnerHTML={{
              __html: project.summary?.trim() || '<p>프로젝트 소개 정보가 없습니다.</p>',
            }}
          />
        </div>
        <div className="hidden lg:block" />
      </section>

      {imageLightboxIndex !== null && project.imageUrls?.[imageLightboxIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="대표 사진 확대"
        >
          <button
            type="button"
            onClick={() => setImageLightboxIndex(null)}
            className="absolute top-4 right-4 z-10 flex items-center justify-center rounded-none border-none bg-transparent p-0 text-white/80 shadow-none outline-none ring-0 transition-colors hover:text-white focus:outline-none focus:ring-0"
            aria-label="닫기"
          >
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {project.imageUrls.filter(Boolean).length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setImageLightboxIndex((i) => {
                    if (i === null) return null;
                    for (let k = 1; k <= 3; k++) {
                      const prev = (i - k + 3) % 3;
                      if (project.imageUrls?.[prev]) return prev;
                    }
                    return i;
                  });
                }}
                className="-translate-y-1/2 absolute top-1/2 left-4 z-10 flex h-14 w-14 items-center justify-center rounded-full text-white/90 transition-all hover:bg-white/10 hover:text-white focus:outline-none active:scale-95"
                aria-label="이전 이미지"
              >
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setImageLightboxIndex((i) => {
                    if (i === null) return null;
                    for (let k = 1; k <= 3; k++) {
                      const next = (i + k) % 3;
                      if (project.imageUrls?.[next]) return next;
                    }
                    return i;
                  });
                }}
                className="-translate-y-1/2 absolute top-1/2 right-4 z-10 flex h-14 w-14 items-center justify-center rounded-full text-white/90 transition-all hover:bg-white/10 hover:text-white focus:outline-none active:scale-95"
                aria-label="다음 이미지"
              >
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setImageLightboxIndex(null)}
            className="absolute inset-0"
            aria-label="배경 클릭 시 닫기"
          />
          <div className="relative z-10 max-h-[90vh] max-w-[90vw] drop-shadow-2xl">
            <img
              src={project.imageUrls[imageLightboxIndex]}
              alt={`${project.title} 이미지 ${imageLightboxIndex + 1}`}
              className="max-h-[90vh] max-w-full rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-6">
          <div
            className="relative w-full max-w-[360px] rounded-[24px] px-8 pt-10 pb-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.2)]"
            style={{ backgroundColor: isDark ? '#212328' : '#FFFFFF' }}
          >
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(false)}
              className="absolute top-6 right-6 text-[var(--ui-400)]"
              aria-label="닫기"
            >
              ✕
            </button>
            <div className="flex flex-col gap-2">
              <h2
                className="font-semibold text-[18px] leading-[24px]"
                style={{ color: isDark ? '#F8F9FB' : 'var(--ui-900)' }}
              >
                [{project.title}]
                <br />
                {hasApplied ? '지원 역할을 변경하시겠어요?' : '에 지원하시겠어요?'}
              </h2>
              <p className="text-[13px]" style={{ color: isDark ? '#9EA6BA' : 'var(--ui-400)' }}>
                {hasApplied
                  ? '변경할 포지션을 선택해 주세요.'
                  : '지원 후 PM이 수락 시 팀원으로 합류하게 됩니다.'}
              </p>
            </div>

            <div className="mt-6 flex flex-col items-center gap-4">
              <div className="relative w-[240px]">
                <button
                  type="button"
                  onClick={() => setIsRoleMenuOpen((prev) => !prev)}
                  className="flex h-[40px] w-full items-center justify-between rounded-[12px] px-4 text-[14px]"
                  style={{
                    backgroundColor: isDark ? '#191B1E' : '#FFFFFF',
                    border: `1px solid ${isDark ? '#41444D' : 'var(--ui-200)'}`,
                    color: isDark ? '#F8F9FB' : 'var(--ui-700)',
                  }}
                >
                  <span
                    className={selectedRole ? '' : 'text-[var(--ui-400)]'}
                    style={{
                      color: selectedRole ? (isDark ? '#F8F9FB' : 'var(--ui-900)') : undefined,
                    }}
                  >
                    {selectedRoleLabel}
                  </span>
                  <svg
                    className={`h-4 w-4 transition-transform ${isRoleMenuOpen ? 'rotate-180' : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {isRoleMenuOpen && (
                  <div
                    className="absolute z-10 mt-2 w-full rounded-[12px] py-2 shadow-[0_12px_30px_rgba(0,0,0,0.12)]"
                    style={{
                      backgroundColor: isDark ? '#191B1E' : '#FFFFFF',
                      border: `1px solid ${isDark ? '#41444D' : 'var(--ui-200)'}`,
                    }}
                  >
                    {roleOptions.map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => {
                          setSelectedRole(option.key);
                          setIsRoleMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-[14px]"
                        style={{
                          color: isDark ? '#F8F9FB' : 'var(--ui-900)',
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                disabled={!selectedRole}
                onClick={handleApply}
                className={`h-[48px] w-full rounded-[12px] font-semibold text-[16px] ${
                  selectedRole && !isApplying
                    ? 'bg-[#4E49FF] text-white'
                    : 'bg-[var(--ui-100)] text-[var(--ui-400)]'
                }`}
              >
                {isApplying
                  ? hasApplied
                    ? '수정 중...'
                    : '지원 중...'
                  : hasApplied
                    ? '수정하기'
                    : '지원하기'}
              </button>
              <button
                type="button"
                onClick={() => setIsApplyModalOpen(false)}
                className="text-[14px] text-[var(--ui-400)]"
              >
                나중에 하기
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-6">
          <div
            className="relative w-full max-w-[360px] rounded-[24px] px-8 pt-10 pb-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.2)]"
            style={{ backgroundColor: isDark ? '#212328' : '#FFFFFF' }}
          >
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-6 right-6 text-[var(--ui-400)]"
              aria-label="닫기"
            >
              ✕
            </button>
            <div className="flex flex-col gap-2">
              <h2
                className="font-semibold text-[18px] leading-[24px]"
                style={{ color: isDark ? '#F8F9FB' : 'var(--ui-900)' }}
              >
                로그인 후 이용할 수 있어요
              </h2>
              <p className="text-[13px]" style={{ color: isDark ? '#9EA6BA' : 'var(--ui-400)' }}>
                해당 기능을 이용하려면 먼저 로그인해 주세요.
              </p>
            </div>

            <div className="mt-6 flex flex-col items-center gap-4">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="h-[48px] w-full rounded-[12px] bg-[#4E49FF] font-semibold text-[16px] text-white"
              >
                로그인 하러가기
              </button>
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(false)}
                className="text-[14px] text-[var(--ui-400)]"
              >
                나중에 하기
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProjectDetailPage;
