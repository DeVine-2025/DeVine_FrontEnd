import { deleteBookmark, getBookmarks } from '@apis/bookmarks';
import { getMemberProfileByNickname } from '@apis/members';
import { getMemberTechStacks } from '@apis/myInfo/myInfo-queries';
import { getProjectDetail } from '@apis/project-detail';
import BackIcon from '@assets/icons/back.svg?react';
import profileDefaultIconUrl from '@assets/icons/profile-default.svg?url';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ProjectLg from '@components/common/ProjectLg';
import RecommendDeveloperCard from '@components/common/RecommendDeveloperCard';
import { useAuth } from '@clerk/clerk-react';
import { mapProjectItemToCard } from '@mappers/project';
import type { ProjectItem } from '@t/project/api';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL ?? '');

function resolveThumbnailUrl(url: string | undefined): string | undefined {
  if (!url?.trim()) return undefined;
  const u = url.trim();
  if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('//')) return u;
  if (u.startsWith('/') && API_BASE) return `${API_BASE.replace(/\/$/, '')}${u}`;
  return u;
}

type TabKind = 'project' | 'developer';

type BookmarkedProject = {
  bookmarkId: number;
  targetId: number;
  project: ProjectItem | null;
};

type BookmarkedDeveloper = {
  bookmarkId: number;
  targetId?: number;
  targetNickname?: string;
};

type DeveloperProfile = {
  imageUrl: string | null;
  body?: string | null;
  techstacks?: string[];
  domains?: string[];
};

const MyInfoBookmark = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKind>('project');
  const [projects, setProjects] = useState<BookmarkedProject[]>([]);
  const [developers, setDevelopers] = useState<BookmarkedDeveloper[]>([]);
  const [developerProfiles, setDeveloperProfiles] = useState<Record<string, DeveloperProfile>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBookmarks = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      setError('로그인이 필요합니다.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await getBookmarks(token);
      const sorted = [...list].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      const projectBookmarks = sorted.filter((b) => b.targetType === 'PROJECT');
      const devBookmarks = sorted.filter((b) => b.targetType === 'DEVELOPER');

      setDevelopers(
        devBookmarks.map((b) => ({
          bookmarkId: b.bookmarkId,
          targetId: b.targetId,
          targetNickname: b.targetNickname,
        })),
      );

      const projectWithId = projectBookmarks.filter(
        (b): b is typeof b & { targetId: number } => b.targetId != null,
      );
      setProjects(
        projectWithId.map((b) => ({
          bookmarkId: b.bookmarkId,
          targetId: b.targetId,
          project: null,
        })),
      );

      const details = await Promise.all(
        projectWithId.map((b) => getProjectDetail(b.targetId, token).catch(() => null)),
      );
      setProjects((prev) => prev.map((p, i) => ({ ...p, project: details[i] ?? null })));
    } catch (e) {
      setError(e instanceof Error ? e.message : '북마크를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  useEffect(() => {
    const nicknames = developers
      .map((d) => d.targetNickname)
      .filter((n): n is string => Boolean(n?.trim()));
    if (nicknames.length === 0) {
      setDeveloperProfiles({});
      return;
    }
    let cancelled = false;
    getToken().then((token) => {
      Promise.all(
        nicknames.map(async (nickname) => {
          const [profileRes, techRes] = await Promise.all([
            getMemberProfileByNickname(nickname, undefined, token),
            getMemberTechStacks(nickname).catch(() => null),
          ]);
          return { nickname, profile: profileRes, techRes };
        }),
      ).then((rows) => {
        if (cancelled) return;
        const next: Record<string, DeveloperProfile> = {};
        rows.forEach(({ nickname, profile, techRes }) => {
          if (!nickname) return;
          const techList = techRes?.result?.techstacks;
          const techNames = Array.isArray(techList)
            ? techList.map((item: { name?: string }) => item?.name ?? '').filter(Boolean)
            : [];
          next[nickname] = {
            imageUrl: profile?.image ?? null,
            body: profile?.body ?? null,
            techstacks: techNames.length > 0 ? techNames : (profile?.techstacks ?? []),
            domains: profile?.domains ?? [],
          };
        });
        setDeveloperProfiles(next);
      });
    });
    return () => {
      cancelled = true;
    };
  }, [developers, getToken]);

  const handleRemoveProjectBookmark = useCallback(
    async (bookmarkId: number) => {
      const token = await getToken();
      if (!token) return;
      const removed = projects.find((p) => p.bookmarkId === bookmarkId);
      setProjects((prev) => prev.filter((p) => p.bookmarkId !== bookmarkId));
      try {
        await deleteBookmark(bookmarkId, token);
      } catch (e) {
        console.error(e);
        if (removed)
          setProjects((prev) => [...prev, removed].sort((a, b) => a.bookmarkId - b.bookmarkId));
      }
    },
    [getToken, projects],
  );

  const handleRemoveDeveloperBookmark = useCallback(
    async (bookmarkId: number) => {
      const token = await getToken();
      if (!token) return;
      const removed = developers.find((d) => d.bookmarkId === bookmarkId);
      setDevelopers((prev) => prev.filter((d) => d.bookmarkId !== bookmarkId));
      try {
        await deleteBookmark(bookmarkId, token);
      } catch (e) {
        console.error(e);
        if (removed)
          setDevelopers((prev) => [...prev, removed].sort((a, b) => a.bookmarkId - b.bookmarkId));
      }
    },
    [getToken, developers],
  );

  const baseTabClass = 'rounded-xl py-3 text-2xl text-center font-semibold transition-colors';
  const activeClass = 'bg-tab-bg-active text-tab-text-active';
  const inactiveClass = 'text-tab-text-inactive hover:text-tab-text-active';

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-[2rem]">
      <div className="flex flex-col gap-[2.4rem]">
        <BackIcon className="h-12 w-12 cursor-pointer text-ui-700" onClick={() => navigate(-1)} />
        <p className="font-bold text-4xl text-ui-900">저장한 프로젝트/개발자</p>
      </div>

      <div className="mb-5 w-[280px] rounded-2xl bg-surface-tab p-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('project')}
            className={`${baseTabClass} ${activeTab === 'project' ? activeClass : inactiveClass}`}
          >
            프로젝트
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('developer')}
            className={`${baseTabClass} ${activeTab === 'developer' ? activeClass : inactiveClass}`}
          >
            개발자
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && activeTab === 'project' && (
        <div className="flex flex-col gap-[2rem]">
          {projects.length === 0 ? (
            <p className="text-ui-600">저장한 프로젝트가 없습니다.</p>
          ) : (
            projects.map(({ bookmarkId, targetId, project }) => {
              if (!project) {
                return (
                  <div
                    key={bookmarkId}
                    className="flex min-h-[120px] items-center justify-center rounded-2xl border border-card-border bg-card-bg p-6"
                  >
                    <LoadingSpinner size="md" />
                  </div>
                );
              }
              const card = mapProjectItemToCard(project);
              const firstImage =
                card.thumbnailUrl ??
                project.imageUrls?.[0] ??
                project.images?.[0]?.imageUrl ??
                project.images?.[0]?.url;
              const thumbnailUrl = resolveThumbnailUrl(firstImage);
              return (
                <ProjectLg
                  key={bookmarkId}
                  categoryLabel={card.categoryLabel}
                  deadlineLabel={card.deadlineLabel}
                  title={card.title}
                  thumbnailUrl={thumbnailUrl}
                  location={card.location}
                  durationRangeName={card.durationRangeName}
                  mode={card.mode}
                  roles={card.roles}
                  dueLabel={card.dueLabel}
                  bookmarked
                  onBookmarkChange={(next) => !next && handleRemoveProjectBookmark(bookmarkId)}
                  onClick={() => navigate(`/project/${targetId}`)}
                />
              );
            })
          )}
        </div>
      )}

      {!loading && !error && activeTab === 'developer' && (
        <div className="flex flex-col gap-[2rem]">
          {developers.length === 0 ? (
            <p className="text-ui-600">저장한 개발자가 없습니다.</p>
          ) : (
            developers.map(({ bookmarkId, targetId, targetNickname }) => {
              const nickname = targetNickname ?? (targetId != null ? `회원 #${targetId}` : '알 수 없음');
              const profile = targetNickname ? developerProfiles[targetNickname] : undefined;
              const profileImageUrl =
                resolveThumbnailUrl(profile?.imageUrl ?? undefined) ?? profileDefaultIconUrl;
              const handleDeveloperClick = () => {
                if (!targetNickname) return;
                navigate(`/developer-detail/${targetNickname}`);
              };
              return (
                <RecommendDeveloperCard
                  key={bookmarkId}
                  borderStyle="gray"
                  role="개발자"
                  roleTone="blue"
                  nickname={nickname}
                  profileImageUrl={profileImageUrl}
                  introduction={profile?.body ?? '저장한 개발자입니다.'}
                  domains={
                    profile?.domains?.map((label) => ({ label })) ?? []
                  }
                  techStack={
                    profile?.techstacks?.map((name, i) => ({ id: `tech-${bookmarkId}-${i}`, name })) ?? []
                  }
                  showMatchedReason={false}
                  bookmarked
                  onBookmarkChange={(next) => !next && handleRemoveDeveloperBookmark(bookmarkId)}
                  onClick={handleDeveloperClick}
                />
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default MyInfoBookmark;
