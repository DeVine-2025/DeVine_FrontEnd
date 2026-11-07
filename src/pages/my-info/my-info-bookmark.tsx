import { deleteBookmark, getBookmarks } from '@apis/bookmarks';
import { getMemberProfileByNickname } from '@apis/members';
import { getMemberTechStacks } from '@apis/myInfo/myInfo-queries';
import { getProjectDetail } from '@apis/project-detail';
import { Search } from 'lucide-react';
import UnderlineTabs from '@components/tab/UnderlineTabs';
import SortMenu from '@components/common/SortMenu';
import { useAuth } from '@clerk/clerk-react';
import DeveloperCard from '@components/cards/DeveloperCard';
import type { DeveloperSearchContentDto } from '@t/profileCard.types';
import ProjectCard from '@components/cards/ProjectCard';
import { featuredProjects, recommendedDevelopers, type HomeDeveloper, type HomeProject } from '../home/home-mock-data';
import type { ProjectCardData } from '@components/cards/card-types';
import { DOMAIN_OPTIONS, DOMAIN_REVERSE_MAP, type Domain } from '@constants/domain';
import defaultProjectImage from '@assets/images/devine-symbol.png';
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

function toDeveloperCard(
  nickname: string,
  body: string | null,
  skills: string[],
  imageUrl: string | null = null,
  domains: string[] = [],
): DeveloperSearchContentDto {
  return {
    member: { nickname, body, imageUrl, address: null, disclosure: true, mainType: 'DEVELOPER', used: '', createdAt: '' },
    domains,
    techstacks: skills.map((name, techstackId) => ({ techstackId, name, genre: 'skill', source: 'MANUAL' })),
  };
}

type TabKind = 'project' | 'developer';

type BookmarkedProject = {
  bookmarkId: number;
  createdAt: string;
  targetId: number;
  project: ProjectItem | null;
};

type BookmarkedDeveloper = {
  bookmarkId: number;
  createdAt: string;
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
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('newest');
  const [sampleProjects, setSampleProjects] = useState(() => featuredProjects.slice(0, 3));
  const [sampleDevelopers, setSampleDevelopers] = useState(() => recommendedDevelopers.slice(0, 3));
  const [samplePreview, setSamplePreview] = useState<HomeProject | HomeDeveloper | null>(null);
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
          createdAt: b.createdAt,
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
          createdAt: b.createdAt,
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

  const searchTerm = query.trim().toLocaleLowerCase('ko-KR');
  const matchesSearch = (value?: string | null) =>
    !searchTerm || Boolean(value?.toLocaleLowerCase('ko-KR').includes(searchTerm));
  const compareSavedAt = (a: { createdAt: string }, b: { createdAt: string }) => {
    const difference = (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0);
    return sort === 'oldest' ? -difference : difference;
  };
  const visibleProjects = projects.filter(({ project }) =>
    matchesSearch(project?.title) || matchesSearch(project?.content),
  ).sort(compareSavedAt);
  const visibleDevelopers = developers.filter(({ targetNickname }) => matchesSearch(targetNickname)).sort(compareSavedAt);
  const visibleSamples = sampleProjects.filter(project =>
    matchesSearch(project.title) || matchesSearch(project.description),
  );
  const visibleSampleDevelopers = sampleDevelopers.filter(developer => matchesSearch(developer.name));
  const changeTab = (next: TabKind) => {
    if (next === activeTab) return;
    setActiveTab(next);
    setQuery('');
  };
  const projectPreview = samplePreview && 'title' in samplePreview ? samplePreview : null;
  const developerPreview = samplePreview && 'name' in samplePreview ? samplePreview : null;
  const previewTitle = projectPreview?.title ?? developerPreview?.name;
  const searchLabel = activeTab === 'project' ? '저장한 프로젝트 검색' : '저장한 개발자 검색';

  return (
    <div className="bookmark-workspace">
      <div className="bookmark-toolbar">
        <UnderlineTabs
          label="북마크 분류"
          className="bookmark-filters"
          value={activeTab}
          items={[{ value: 'project', label: '프로젝트' }, { value: 'developer', label: '개발자' }]}
          onChange={changeTab}
        />
        <div className="bookmark-tools">
          <label className="bookmark-search">
            <Search size={16} aria-hidden="true" />
            <input type="search" aria-label={searchLabel} placeholder={searchLabel} value={query} onChange={event => setQuery(event.target.value)} />
          </label>
          <SortMenu label="북마크 정렬" value={sort} onChange={setSort} options={[
            { value: 'newest', label: '최근 저장순' },
            { value: 'oldest', label: '오래된 저장순' },
          ]} />
        </div>
      </div>

      {import.meta.env.DEV && activeTab === 'project' && visibleSamples.length > 0 && (
        <section className="bookmark-samples" aria-label="프로젝트 카드 예시">
          <div className="bookmark-sample-list">
            {visibleSamples.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                saved
                variant="list"
                showTechStacks={false}
                onOpen={() => setSamplePreview(project)}
                onBookmarkChange={next => {
                  if (!next) setSampleProjects(current => current.filter(item => item.id !== project.id));
                }}
              />
            ))}
          </div>
        </section>
      )}

      {import.meta.env.DEV && activeTab === 'developer' && visibleSampleDevelopers.length > 0 && (
        <div className="bookmark-sample-list">
          {visibleSampleDevelopers.map(developer => (
            <DeveloperCard
              key={developer.id}
              developer={toDeveloperCard(developer.name, developer.introduction, developer.skills)}
              roleLabel={developer.role}
              bookmarked
              pending={false}
              variant="list"
              onOpen={() => setSamplePreview(developer)}
              onBookmarkChange={next => {
                if (!next) setSampleDevelopers(current => current.filter(item => item.id !== developer.id));
              }}
            />
          ))}
        </div>
      )}

      {samplePreview && (
        <div className="bookmark-preview-backdrop" onClick={() => setSamplePreview(null)}>
          <section className="bookmark-preview" role="dialog" aria-modal="true" aria-label={previewTitle} onClick={event => event.stopPropagation()}>
            <button type="button" className="bookmark-preview-close" aria-label="닫기" onClick={() => setSamplePreview(null)}>×</button>
            <span>{projectPreview?.domain ?? developerPreview?.role}</span>
            <h2>{previewTitle}</h2>
            <p>{samplePreview.introduction}</p>
            {projectPreview && <p>모집 직군 · {projectPreview.recruiting}</p>}
            {projectPreview && <p>진행 방식 · {projectPreview.workMode}　예상 기간 · {projectPreview.duration}</p>}
          </section>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <span role="status" className="text-sm text-[var(--text-secondary)]">불러오는 중...</span>
        </div>
      )}
      {error && <div role="alert" className="bookmark-load-error">실제 북마크를 불러오지 못했어요. <button type="button" onClick={() => void loadBookmarks()}>다시 시도</button></div>}

      {!loading && !error && activeTab === 'project' && (
        <div className="bookmark-sample-list">
          {visibleProjects.length === 0 ? (
            (!import.meta.env.DEV || visibleSamples.length === 0) && <p className="text-[18px] text-ui-600">{searchTerm ? '검색 결과가 없습니다.' : '저장한 프로젝트가 없습니다.'}</p>
          ) : (
            visibleProjects.map(({ bookmarkId, targetId, project }) => {
              if (!project) {
                return (
                  <div
                    key={bookmarkId}
                    className="flex min-h-[120px] items-center justify-center rounded-2xl border border-card-border bg-card-bg p-6"
                  >
                    <span className="text-sm text-[var(--text-secondary)]">프로젝트 정보를 불러오지 못했어요.</span>
                  </div>
                );
              }
              const image = project.thumbnailUrl ?? project.imageUrls?.[0] ??
                project.images?.[0]?.imageUrl ?? project.images?.[0]?.url;
              const category = project.category
                ? DOMAIN_REVERSE_MAP[project.category] ?? project.categoryName
                : project.categoryName;
              const domain = DOMAIN_OPTIONS.find(option => option === category) ?? null;
              const positions = project.positions ?? project.recruitments ?? [];
              const card: ProjectCardData = {
                id: String(targetId),
                title: project.title,
                thumbnail: resolveThumbnailUrl(image ?? undefined) ?? defaultProjectImage,
                domain: domain as Domain | null,
                memberCount: {
                  current: positions.reduce((sum, position) => sum + (position.currentCount ?? 0), 0),
                  total: positions.reduce((sum, position) => sum + (position.count ?? 0), 0),
                },
                deadline: {
                  remaining: typeof project.daysUntilDeadline === 'number' ? project.daysUntilDeadline : null,
                  date: project.recruitmentDeadline ?? '',
                },
                status: project.status === 'RECRUITING' ? 'recruiting' : null,
                description: project.content?.replace(/<[^>]*>/g, '').trim() ?? '',
                techStacks: [...new Set(positions.flatMap(position =>
                  (position.techStacks ?? []).map(stack => stack.techStackName ?? stack.techStack ?? '').filter(Boolean),
                ))],
                duration: project.durationRangeName ?? '',
                workMode: project.modeName ?? '',
              };
              return (
                <ProjectCard
                  key={bookmarkId}
                  project={card}
                  saved
                  variant="list"
                  onBookmarkChange={(next) => { if (!next) void handleRemoveProjectBookmark(bookmarkId); }}
                  onOpen={() => navigate('/project/' + targetId)}
                />
              );
            })
          )}
        </div>
      )}

      {!loading && !error && activeTab === 'developer' && (
        <div className="bookmark-sample-list">
          {visibleDevelopers.length === 0 ? (
            (!import.meta.env.DEV || visibleSampleDevelopers.length === 0) && <p className="text-[18px] text-ui-600">{searchTerm ? '검색 결과가 없습니다.' : '저장한 개발자가 없습니다.'}</p>
          ) : (
            visibleDevelopers.map(({ bookmarkId, targetId, targetNickname }) => {
              const nickname =
                targetNickname ?? (targetId != null ? `회원 #${targetId}` : '알 수 없음');
              const profile = targetNickname ? developerProfiles[targetNickname] : undefined;
              return (
                <DeveloperCard
                  key={bookmarkId}
                  developer={toDeveloperCard(
                    nickname,
                    profile?.body ?? null,
                    profile?.techstacks ?? [],
                    resolveThumbnailUrl(profile?.imageUrl ?? undefined) ?? null,
                    profile?.domains ?? [],
                  )}
                  bookmarked
                  pending={false}
                  variant="list"
                  showProfileLink={Boolean(targetNickname?.trim())}
                  onBookmarkChange={next => { if (!next) void handleRemoveDeveloperBookmark(bookmarkId); }}
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
