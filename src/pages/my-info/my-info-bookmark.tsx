import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

import BackIcon from '@assets/icons/back.svg?react';
import RecommendDeveloperCard from '@components/common/RecommendDeveloperCard';
import RecommendProjectCard from '@components/common/RecommendProjectCard';
import { getBookmarks, deleteBookmark } from '@apis/bookmarks';
import { getProjectDetail } from '@apis/project-detail';
import { mapProjectItemToCard } from '@mappers/project';
import type { ProjectItem } from '@t/project/api';

type TabKind = 'project' | 'developer';

type BookmarkedProject = {
  bookmarkId: number;
  targetId: number;
  project: ProjectItem | null;
};

type BookmarkedDeveloper = {
  bookmarkId: number;
  targetId: number;
};

const MyInfoBookmark = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKind>('project');
  const [projects, setProjects] = useState<BookmarkedProject[]>([]);
  const [developers, setDevelopers] = useState<BookmarkedDeveloper[]>([]);
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
      const projectBookmarks = list.filter((b) => b.targetType === 'PROJECT');
      const devBookmarks = list.filter((b) => b.targetType === 'DEVELOPER');

      setDevelopers(
        devBookmarks.map((b) => ({ bookmarkId: b.bookmarkId, targetId: b.targetId })),
      );

      setProjects(
        projectBookmarks.map((b) => ({ bookmarkId: b.bookmarkId, targetId: b.targetId, project: null })),
      );

      const details = await Promise.all(
        projectBookmarks.map((b) =>
          getProjectDetail(b.targetId, token).catch(() => null),
        ),
      );
      setProjects((prev) =>
        prev.map((p, i) => ({ ...p, project: details[i] ?? null })),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : '북마크를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const handleRemoveProjectBookmark = useCallback(
    async (bookmarkId: number) => {
      const token = await getToken();
      if (!token) return;
      try {
        await deleteBookmark(bookmarkId, token);
        setProjects((prev) => prev.filter((p) => p.bookmarkId !== bookmarkId));
      } catch (e) {
        console.error(e);
      }
    },
    [getToken],
  );

  const handleRemoveDeveloperBookmark = useCallback(
    async (bookmarkId: number) => {
      const token = await getToken();
      if (!token) return;
      try {
        await deleteBookmark(bookmarkId, token);
        setDevelopers((prev) => prev.filter((d) => d.bookmarkId !== bookmarkId));
      } catch (e) {
        console.error(e);
      }
    },
    [getToken],
  );

  const baseTabClass =
    'rounded-xl py-3 text-2xl text-center font-semibold transition-colors';
  const activeClass = 'bg-tab-bg-active text-tab-text-active';
  const inactiveClass = 'text-tab-text-inactive hover:text-tab-text-active';

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-[2rem]">
      <div className="flex flex-col gap-[2.4rem]">
        <BackIcon
          className="h-12 w-12 cursor-pointer text-ui-700"
          onClick={() => navigate(-1)}
        />
        <p className="text-4xl font-bold text-ui-900">저장한 프로젝트/개발자</p>
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
        <p className="text-ui-600">불러오는 중...</p>
      )}
      {error && (
        <p className="text-red-500">{error}</p>
      )}

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
                    className="rounded-2xl border border-card-border bg-card-bg p-6 text-ui-600"
                  >
                    프로젝트 정보를 불러오는 중… (ID: {targetId})
                  </div>
                );
              }
              const card = mapProjectItemToCard(project);
              return (
                <RecommendProjectCard
                  key={bookmarkId}
                  categoryLabel={card.categoryLabel}
                  deadlineLabel={card.deadlineLabel}
                  title={card.title}
                  thumbnailUrl={card.thumbnailUrl}
                  location={card.location}
                  period={card.period}
                  mode={card.mode}
                  roles={card.roles.map((r) => ({
                    ...r,
                    techStack: [],
                  }))}
                  dueLabel={card.dueLabel}
                  bookmarked
                  onBookmarkChange={() => handleRemoveProjectBookmark(bookmarkId)}
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
            developers.map(({ bookmarkId, targetId }) => (
              <RecommendDeveloperCard
                key={bookmarkId}
                role="개발자"
                roleTone="blue"
                nickname={`회원 #${targetId}`}
                introduction="저장한 개발자입니다."
                domains={[]}
                techStack={[]}
                bookmarked
                onBookmarkChange={() => handleRemoveDeveloperBookmark(bookmarkId)}
                onClick={() => {}}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MyInfoBookmark;
