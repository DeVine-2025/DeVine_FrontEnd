import { applyProject, getMyApplyStatus, updateMyApply } from '@apis/apply';
import { createBookmark, deleteBookmark, getBookmarks } from '@apis/bookmarks';
import { getMemberProfileByNickname } from '@apis/members';
import {
  getMYProjectCompleted,
  getMYProjectInprogress,
  getMYProjectRecruiting,
} from '@apis/project/project-queries';
import { cancelMyApply, getProjectDetail, type ProjectStatus, updateProjectStatus } from '@apis/project-detail';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  type ProjectDetailInfo,
  toProjectDetailInfo,
  toProjectDetailInfoFromApi,
} from '../project-detail-types';
import { useAuthMe } from '@hooks/useAuthMe';
export type ApplyStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';

export function useProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();

  // ── State ──
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [appliedMatchingId, setAppliedMatchingId] = useState<number | undefined>(undefined);
  const [appliedPart, setAppliedPart] = useState<string | undefined>(undefined);
  const [appliedStatus, setAppliedStatus] = useState<ApplyStatus | null>(null);
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

  // ── Bookmark ──
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

  // ── Fetch project ──
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
            const applyStatus = await getMyApplyStatus(numericId, token); // 지원 상태 조회
            if (isActive) {
              setHasApplied(applyStatus.exists);
              setAppliedMatchingId(applyStatus.matchingId);
              setAppliedPart(applyStatus.part);
              setAppliedStatus((applyStatus.status as ApplyStatus) ?? null);
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

  // ── Fallback / session project (mock 제거로 폴백 없음) ──
  const fallbackProject = undefined;

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

  // ── Owner check ──
  const creatorId = project?.creatorId == null ? null : Number(project.creatorId);

  const { data: me } = useAuthMe();
  const myMemberId = me?.memberId ?? null;

  const isOwner =
    creatorId != null &&
    myMemberId != null &&
    creatorId === myMemberId;

  const creatorImage = project?.creatorImage ?? creatorProfileImage;

  // ── Creator profile image fallback ──
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

  // ── Owner check by recruiting projects ──
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !projectId) {
      setIsOwnerByList(false);
      return;
    }
    let isActive = true;
    const numericId = Number(projectId);
    if (!Number.isFinite(numericId)) {
      setIsOwnerByList(false);
      return;
    }

    const extractProjectIds = (data: unknown): number[] => {
      const content =
        (data as any)?.result?.projects?.content ??
        (data as any)?.projects?.content ??
        (data as any)?.result?.projectList ??
        (data as any)?.projectList ??
        [];
      if (!Array.isArray(content)) return [];
      return content
        .map((p) => (p as any)?.projectId ?? (p as any)?.id)
        .filter((id) => typeof id === 'number' && Number.isFinite(id));
    };

    Promise.allSettled([
      getMYProjectRecruiting(),
      getMYProjectInprogress(),
      getMYProjectCompleted(),
    ])
      .then((results) => {
        if (!isActive) return;
        const ids = results.flatMap((r) =>
          r.status === 'fulfilled' ? extractProjectIds(r.value) : [],
        );
        setIsOwnerByList(ids.includes(numericId));
      })
      .catch(() => {
        if (isActive) setIsOwnerByList(false);
      });

    return () => {
      isActive = false;
    };
  }, [getToken, isLoaded, isSignedIn, projectId]);

  // ── Status menu outside click ──
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

  // ── Role options ──
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

  // ── Apply handler ──
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
        await updateMyApply(Number(projectId), selectedRole, token);
        setAppliedPart(selectedRole);
      } else {
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

  // ── Status change ──
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

  const handleCancelApply = async () => {
  if (!projectId) return;

  try {
    const token = await getToken();
    if (!token) {
      setIsLoginModalOpen(true);
      return;
    }

    await cancelMyApply(Number(projectId), token);

    setHasApplied(false);
    setAppliedMatchingId(undefined);
    setAppliedPart(undefined);
    setAppliedStatus(null);
  } catch (error) {
    console.error(error);
  }
};


  const openApplyModal = () => {
    if (isLoaded && !isSignedIn) {
      setIsLoginModalOpen(true);
      return;
    }
    setIsApplyModalOpen(true);
    setIsRoleMenuOpen(false);
  };

  return {
    projectId,
    navigate,
    project,
    isLoading,
    isOwner,
    creatorImage,
    bookmarkState,
    handleBookmarkChange,
    handleCancelApply,
    openApplyModal,
    // Apply modal
    appliedStatus,
    isApplyModalOpen,
    setIsApplyModalOpen,
    isLoginModalOpen,
    setIsLoginModalOpen,
    selectedRole,
    setSelectedRole,
    isRoleMenuOpen,
    setIsRoleMenuOpen,
    hasApplied,
    appliedPart,
    isApplying,
    handleApply,
    roleOptions,
    selectedRoleLabel,
    // Image lightbox
    imageLightboxIndex,
    setImageLightboxIndex,
    // Status
    projectStatus,
    isStatusMenuOpen,
    setIsStatusMenuOpen,
    isStatusUpdating,
    statusMenuRef,
    STATUS_OPTIONS,
    currentStatusLabel,
    handleStatusChange,
  };
}
