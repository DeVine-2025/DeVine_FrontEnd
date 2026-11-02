import ArrowIcon from '@assets/icons/arrow-left-admin.svg?react';
import CloseIcon from '@assets/icons/close.svg?react';
import CheckIcon from '@assets/icons/check.svg?react';
import PersonIcon from '@assets/icons/person.svg?react';
import CalendarIcon from '@assets/icons/calendar-clock.svg?react';
import ProfileDefaultImage from '@assets/images/Profile.svg';
import ProfileDefaultDark from '@assets/images/Profile_dark.svg';
import BookmarkButton from '@components/common/BookmarkButton';
import DomainBadge from '@components/common/DomainBadge';
import ExploreProjectCard from '../search/project/explore-project-card';
import DeveloperCollaborationCard from '../search/developer/developer-collaboration-card';
import '../search/developer/developer-explore-page.css';
import { TechChips } from '@components/common/ProfileBase';
import { useAuthStore } from '@store/auth';
import { useThemeStore } from '@store/theme';
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {
  editorials,
  featuredProjects,
  type HomeDeveloper,
  type HomeProject,
  recentProjects,
  recommendedDevelopers,
  recommendedProjects,
} from './home-mock-data';
import './home-page.css';
import './home-cards.css';
import './home-colors.css';

type Preview = { kind: 'project'; item: HomeProject } | { kind: 'developer'; item: HomeDeveloper };

function Bookmark({
  name,
  selected,
  onToggle,
}: {
  name: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <BookmarkButton
      className="home-bookmark"
      aria-label={name}
      bookmarked={selected}
      onBookmarkChange={onToggle}
    />
  );
}

function SectionHeading({
  title,
  description,
  to,
  accent = false,
}: {
  title: string;
  description?: string;
  to: string;
  accent?: boolean;
}) {
  return (
    <div className={`home-section-heading${accent ? ' home-section-heading-accent' : ''}`}>
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      <Link to={to}>
        전체보기 <ArrowIcon aria-hidden="true" />
      </Link>
    </div>
  );
}

function ProjectCard({
  project,
  featured,
  recent,
  recommended,
  saved,
  onToggle,
  onOpen,
}: {
  project: HomeProject;
  featured?: boolean;
  recent?: boolean;
  recommended?: boolean;
  saved: boolean;
  onToggle: () => void;
  onOpen: () => void;
}) {
  if (recommended && project.recommendation) {
    const { score, reason } = project.recommendation;
    return (
      <article className="home-project-card home-project-recommended">
        <button type="button" className="home-card-open" onClick={onOpen} aria-label={`${project.title} 프로젝트 미리보기`}>
          <div className="home-project-art">
            <img src={project.thumbnail} alt="" loading="lazy" decoding="async" />
          </div>
          <div className="home-recommended-content">
            <div className="home-recommended-summary">
              <DomainBadge className="home-project-domain-badge" domain={project.domain} />
              <h3>{project.title}</h3>
              <p>{project.description}</p>
            </div>
            <p className="home-recommended-reason"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="m8 12 2.6 2.6L16 9.5" /></svg>{reason}</p>
            <div className="home-recommended-stats">
              <div className="home-recommended-stat home-recommended-score" aria-label={`추천 적합도 예시 ${score}점`}>
                <span className="home-recommended-label">추천 적합도</span>
                <div className="home-recommended-ring" aria-hidden="true">
                  <CircularProgressbarWithChildren value={score} strokeWidth={9} styles={buildStyles({ pathColor: '#a993ff', trailColor: '#343945', strokeLinecap: 'round' })}>
                    <strong>{score}</strong>
                  </CircularProgressbarWithChildren>
                </div>
              </div>
              <div className="home-recommended-stat home-recommended-members">
                <span className="home-recommended-label">모집 현황</span>
                <strong aria-label={`모집 인원 ${project.memberCount.total}명 중 ${project.memberCount.current}명`}>{project.memberCount.current} / {project.memberCount.total}명</strong>
                {project.memberCount.total > 0 && (
                  <span className="home-project-progress" aria-hidden="true">
                    {Array.from({ length: project.memberCount.total }, (_, index) => (
                      <span key={index} className={index < project.memberCount.current ? 'is-filled' : undefined} />
                    ))}
                  </span>
                )}
              </div>
              <div className="home-recommended-stat home-recommended-deadline">
                <strong>D-{project.deadline.remaining}</strong>
                <span className="home-recommended-date"><CalendarIcon aria-hidden="true" />{project.deadline.date}</span>
              </div>
            </div>
          </div>
        </button>
        <Bookmark name={project.title} selected={saved} onToggle={onToggle} />
      </article>
    );
  }

  return (
    <article
      style={{ backgroundImage: `url("${project.thumbnail}")` }}
      className={[
        'home-project-card',
        featured && 'home-project-featured',
        recent && 'home-project-recent',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <button
        type="button"
        className="home-card-open"
        onClick={onOpen}
        aria-label={`${project.title} 프로젝트 미리보기`}
      >
        <div className="home-project-art">
          {!recommended && (
            <span className={`home-project-status home-project-status-${project.status}`}>
              <span />{project.status === 'recruiting' ? '모집 중' : project.status === 'inProgress' ? '진행 중' : '완료'}
            </span>
          )}
          <img src={project.thumbnail} alt="" loading={featured ? 'eager' : 'lazy'} decoding="async" />
        </div>
        <div className="home-project-content">
          <div className="home-project-summary">
            <DomainBadge className="home-project-domain-badge" domain={project.domain} />
            <div className="home-project-title-row">
              <h3>{project.title}</h3>
              {recommended && project.recommendation && (
                <span className="home-project-match">
                  <strong>{project.recommendation.score}점</strong>
                  <span className="home-project-match-info" aria-label="점수 안내: 기술과 관심 분야를 바탕으로 만든 추천 예시 점수입니다" title="기술과 관심 분야를 바탕으로 만든 추천 예시 점수입니다">
                    ⓘ
                    <span className="home-project-match-tooltip" role="tooltip">기술과 관심 분야를 바탕으로 만든 추천 예시 점수입니다.</span>
                  </span>
                </span>
              )}
            </div>
            <p>{project.description}</p>
          </div>
          {recommended && project.recommendation && (
            <div className="home-project-fit">
              <progress aria-label="프로젝트 적합도 (샘플)" max={100} value={project.recommendation.score} />
              <p><CheckIcon className="home-project-fit-check" aria-hidden="true" />{project.recommendation.reason}</p>
            </div>
          )}
          <div className="home-project-details">
            <div className="home-project-bottom-line">
              <span className="home-project-members">
                <span className="home-project-member-count" aria-label={`모집 인원 ${project.memberCount.total}명 중 ${project.memberCount.current}명`}>
                  <PersonIcon aria-hidden="true" />{project.memberCount.current}/{project.memberCount.total}명 모집
                </span>
                {!recommended && project.memberCount.total > 0 && (
                  <span className="home-project-progress" aria-hidden="true">
                    {Array.from({ length: project.memberCount.total }, (_, index) => (
                      <span key={index} className={index < project.memberCount.current ? 'is-filled' : undefined} />
                    ))}
                  </span>
                )}
              </span>
              <span className="home-project-deadline" aria-label={`마감까지 D-${project.deadline.remaining}, ${project.deadline.date}`}>
                <strong>D-{project.deadline.remaining}</strong>
                <small><CalendarIcon aria-hidden="true" />{project.deadline.date}</small>
              </span>
            </div>
            <div className="home-project-meta">
              <span className="home-project-conditions">
                <span>{project.duration}</span>
                <span>{project.workMode}</span>
              </span>
              {project.posted && <span className="home-project-posted">{project.posted}</span>}
            </div>
          </div>
        </div>
      </button>
      <Bookmark name={project.title} selected={saved} onToggle={onToggle} />
    </article>
  );
}

function PreviewDialog({
  preview,
  onClose,
  defaultProfileImage,
}: {
  preview: Preview;
  onClose: () => void;
  defaultProfileImage: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const element = dialog.current;
    const previousOverflow = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);
  const isProject = preview.kind === 'project';
  const title = isProject ? preview.item.title : preview.item.name;
  return (
    <dialog
      ref={dialog}
      className="home-preview-dialog"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          onClose();
        }
      }}
    >
      <div className="home-preview-inner">
        <button
          type="button"
          className="home-preview-close"
          aria-label="미리보기 닫기"
          onClick={onClose}
        >
          <CloseIcon aria-hidden="true" />
        </button>
        <img
          className={isProject ? 'home-preview-photo' : 'home-preview-avatar'}
          src={isProject ? preview.item.thumbnail : defaultProfileImage}
          alt=""
        />
        <span className="home-preview-eyebrow">
          {isProject ? 'PROJECT PREVIEW' : 'DEVELOPER PREVIEW'}
        </span>
        <h2 id={titleId}>{title}</h2>
        <div className="home-tags">
          {(isProject ? preview.item.tags : preview.item.skills).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <p>{preview.item.introduction}</p>
        {isProject && (
          <div className="home-preview-tech-stacks" aria-label="전체 기술 스택">
            <TechChips
              techStack={preview.item.techStacks.map((name) => ({ id: name, name }))}
              max={preview.item.techStacks.length}
            />
          </div>
        )}
        {isProject ? (
          <div className="home-preview-info">
            <strong>함께할 동료를 찾고 있어요</strong>
            <p>{preview.item.recruiting}</p>
            <span>{preview.item.duration} · {preview.item.workMode}</span>
          </div>
        ) : (
          <div className="home-preview-info">
            <strong>{preview.item.role}</strong>
            <p>새로운 아이디어와 함께 성장할 팀을 찾고 있어요.</p>
          </div>
        )}
        <p className="home-preview-note">현재 화면은 샘플 데이터로 구성된 미리보기입니다.</p>
        <Link
          to={isProject ? '/search/projects' : '/search/developers'}
          className="home-primary-link"
        >
          {isProject ? '프로젝트 탐색하기' : '개발자 탐색하기'}
          <ArrowIcon aria-hidden="true" />
        </Link>
      </div>
    </dialog>
  );
}

export default function HomePage() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const previous = root.getAttribute('data-home-colors');
    root.setAttribute('data-home-colors', 'charcoal');
    return () => {
      if (previous === null) root.removeAttribute('data-home-colors');
      else root.setAttribute('data-home-colors', previous);
    };
  }, []);
  const isDeveloper = useAuthStore((state) => state.role === 'dev');
  const theme = useThemeStore((state) => state.theme);
  const defaultProfileImage = theme === 'dark' ? ProfileDefaultDark : ProfileDefaultImage;
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hoveringBanner, setHoveringBanner] = useState(false);
  const [focusingBanner, setFocusingBanner] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [bookmarks, setBookmarks] = useState<Set<string>>(() => new Set());
  const [preview, setPreview] = useState<Preview | null>(null);
  const editorial = editorials[slide];

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReduceMotion(preference.matches);
    preference.addEventListener('change', updatePreference);
    return () => preference.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    if (paused || hoveringBanner || focusingBanner || reduceMotion || preview) return;
    const timer = window.setTimeout(() => setSlide((slide + 1) % editorials.length), 3000);
    return () => window.clearTimeout(timer);
  }, [slide, paused, hoveringBanner, focusingBanner, reduceMotion, preview]);
  const toggleBookmark = (id: string) =>
    setBookmarks((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const projectCard = (project: HomeProject, featured = false, recent = false, recommended = false) => (
    <ProjectCard
      key={project.id}
      project={project}
      featured={featured}
      recent={recent}
      recommended={recommended}
      saved={bookmarks.has(project.id)}
      onToggle={() => toggleBookmark(project.id)}
      onOpen={() => setPreview({ kind: 'project', item: project })}
    />
  );

  return (
    <>
      <Helmet>
        <title>Devine | 함께 만드는 더 나은 개발 문화</title>
        <meta
          name="description"
          content="함께 성장할 개발자와 새로운 사이드 프로젝트를 만나보세요. Devine에서 다음 기회를 발견하세요."
        />
      </Helmet>
      <div className="devine-home">
        <section
          className="home-editorial"
          data-editorial={editorial.label.toLowerCase()}
          aria-label="Devine 에디토리얼"
          aria-roledescription="슬라이드 쇼"
          onMouseEnter={() => setHoveringBanner(true)}
          onMouseLeave={() => setHoveringBanner(false)}
          onFocusCapture={() => setFocusingBanner(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setFocusingBanner(false);
          }}
        >
          <div className="home-editorial-copy" key={editorial.label}>
            <div className="home-banner-eyebrow">{editorial.sceneTag}</div>
            <h1>
              {editorial.title.map((line) => <span key={line}>{line}</span>)}
            </h1>
            <p>
              {editorial.description.map((line) => <span key={line}>{line}</span>)}
            </p>
            <Link className="home-editorial-cta" to={editorial.to}>
              {editorial.action}
              <ArrowIcon aria-hidden="true" />
            </Link>
          </div>
          <div className="home-editorial-controls">
            <button
              type="button"
              className="home-editorial-pause"
              disabled={reduceMotion}
              aria-label={
                paused || reduceMotion ? '배너 자동 넘김 시작' : '배너 자동 넘김 일시정지'
              }
              aria-pressed={paused || reduceMotion}
              onClick={() => setPaused((previous) => !previous)}
            >
              <span aria-hidden="true">{paused || reduceMotion ? '▶' : 'Ⅱ'}</span>
            </button>
            <fieldset className="home-editorial-pagination" aria-label="배너 선택">
              {editorials.map((item, index) => (
                <button
                  key={item.label}
                  type="button"
                  aria-label={`${index + 1}번 배너: ${item.label}`}
                  aria-pressed={slide === index}
                  onClick={() => setSlide(index)}
                />
              ))}
            </fieldset>
          </div>
        </section>

        <section className="home-section home-section-featured" aria-label="주목받는 프로젝트">
          <SectionHeading
            title="지금 주목받는 프로젝트"
            description="지금 많은 개발자들의 관심을 받고 있는 프로젝트를 만나보세요."
            to="/search/projects"
          />
          <div className="home-featured-grid explore-projects-grid">
            {featuredProjects.slice(0, 3).map((project) => <ExploreProjectCard key={project.id} project={project} saved={bookmarks.has(project.id)} onOpen={() => setPreview({ kind: 'project', item: project })} onBookmarkChange={() => toggleBookmark(project.id)} />)}
          </div>
        </section>

        <section className="home-section home-section-personalized" aria-label={isDeveloper ? '추천 프로젝트' : '추천 개발자'}>
          <SectionHeading
            title={isDeveloper ? '나에게 딱 맞는 추천 프로젝트' : '나에게 딱 맞는 추천 개발자'}
            accent
            description={isDeveloper
              ? '함께 성장할 팀과 나에게 맞는 프로젝트를 만나보세요.'
              : '관심 분야와 기술 스택을 기반으로 추천하는 개발자예요.'}
            to={isDeveloper ? '/search/projects' : '/search/developers'}
          />
          {isDeveloper ? (
            <div className="home-developers-grid home-recommended-projects">
              {recommendedProjects.map((project) => projectCard(project, false, false, true))}
            </div>
          ) : (
          <div className="home-developers-grid developer-explore-grid">
            {recommendedDevelopers.map((developer) => (
              <DeveloperCollaborationCard key={developer.id}
                developer={{ member: { nickname: developer.name, address: null, disclosure: true, mainType: 'DEVELOPER', imageUrl: null, body: developer.introduction, used: '', createdAt: '' }, domains: [], techstacks: developer.skills.map((name, index) => ({ techstackId: index, name, genre: 'skill', source: 'MANUAL' })) }}
                roleLabel={developer.role} bookmarked={bookmarks.has(developer.id)} pending={false}
                onBookmarkChange={() => toggleBookmark(developer.id)} onOpen={() => setPreview({ kind: 'developer', item: developer })} />
            ))}
          </div>
          )}
        </section>

        <section className="home-section home-section-recent" aria-label="새 프로젝트">
          <SectionHeading
            title="새롭게 올라온 프로젝트"
            to="/search/projects"
          />
          <div className="home-recent-grid explore-projects-list">
            {recentProjects.map((project) => <ExploreProjectCard key={project.id} project={project} saved={bookmarks.has(project.id)} onOpen={() => setPreview({ kind: 'project', item: project })} onBookmarkChange={() => toggleBookmark(project.id)} />)}
          </div>
        </section>
      </div>
      {preview && (
        <PreviewDialog
          preview={preview}
          onClose={() => setPreview(null)}
          defaultProfileImage={defaultProfileImage}
        />
      )}
    </>
  );
}
