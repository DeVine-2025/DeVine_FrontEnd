import ArrowIcon from '@assets/icons/arrow-left-admin.svg?react';
import CloseIcon from '@assets/icons/close.svg?react';
import BrandSymbol from '@assets/images/devine-symbol.png';
import BookmarkButton from '@components/common/BookmarkButton';
import { useEffect, useId, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import EditorialArt from './assets/editorial-glass-panels.webp';
import {
  editorials,
  featuredProjects,
  type HomeDeveloper,
  type HomeProject,
  recentProjects,
  recommendedDevelopers,
} from './home-mock-data';
import './home-page.css';

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
}: {
  title: string;
  description: string;
  to: string;
}) {
  return (
    <div className="home-section-heading">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
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
  saved,
  onToggle,
  onOpen,
}: {
  project: HomeProject;
  featured?: boolean;
  recent?: boolean;
  saved: boolean;
  onToggle: () => void;
  onOpen: () => void;
}) {
  return (
    <article
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
          <img src={BrandSymbol} alt="" />
        </div>
        <div className="home-project-content">
          <div className="home-tags">
            {project.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <h3>{project.title}</h3>
          <p>{project.description}</p>
        </div>
        {project.posted && <span className="home-project-posted">{project.posted}</span>}
      </button>
      <Bookmark name={project.title} selected={saved} onToggle={onToggle} />
    </article>
  );
}

function PreviewDialog({ preview, onClose }: { preview: Preview; onClose: () => void }) {
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
        <img className="home-preview-symbol" src={BrandSymbol} alt="" />
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
        {isProject ? (
          <div className="home-preview-info">
            <strong>함께할 동료를 찾고 있어요</strong>
            <p>{preview.item.recruiting}</p>
            <span>3~6개월 · 온라인 중심</span>
          </div>
        ) : (
          <div className="home-preview-info">
            <strong>{preview.item.role}</strong>
            <p>새로운 아이디어와 함께 성장할 팀을 찾고 있어요.</p>
          </div>
        )}
        <p className="home-preview-note">현재 화면은 샘플 데이터로 구성된 미리보기입니다.</p>
        <Link
          to={isProject ? '/search/project' : '/search/developer'}
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
  const projectCard = (project: HomeProject, featured = false, recent = false) => (
    <ProjectCard
      key={project.id}
      project={project}
      featured={featured}
      recent={recent}
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
          aria-label="Devine 에디토리얼"
          aria-roledescription="슬라이드 쇼"
          onMouseEnter={() => setHoveringBanner(true)}
          onMouseLeave={() => setHoveringBanner(false)}
          onFocusCapture={() => setFocusingBanner(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setFocusingBanner(false);
          }}
        >
          <div className="home-editorial-copy" key={slide}>
            <div className="home-editorial-meta">
              <span>{editorial.label}</span>
              <span>
                0{slide + 1}
                <i> / 03</i>
              </span>
            </div>
            <h1>
              {editorial.title.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h1>
            <p>
              {editorial.description.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </p>
            <Link className="home-editorial-cta" to={editorial.to}>
              {editorial.action}
              <ArrowIcon aria-hidden="true" />
            </Link>
          </div>
          <img
            key={`art-${slide}`}
            className="home-editorial-art"
            src={EditorialArt}
            alt="Devine 로고가 담긴 겹쳐진 반투명 유리 패널"
          />
          <div className="home-editorial-words" aria-hidden="true">
            IDEA
            <br />
            <span>/</span>
            <br />
            PROJECT
            <br />
            <span>/</span>
            <br />
            PEOPLE
            <br />
            <span>/</span>
            <br />
            OPPORTUNITY
          </div>
          <Link to={editorial.to} className="home-editorial-corner" aria-label={editorial.action}>
            <ArrowIcon aria-hidden="true" />
          </Link>
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
              {reduceMotion ? '자동 넘김 꺼짐' : paused ? '자동 재생' : '일시정지'}
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

        <section className="home-section" aria-label="주목받는 프로젝트">
          <SectionHeading
            title="지금 주목받는 프로젝트"
            description="지금 많은 개발자들의 관심을 받고 있는 프로젝트를 만나보세요."
            to="/search/project"
          />
          <div className="home-featured-grid">
            <div>{projectCard(featuredProjects[0], true)}</div>
            <div className="home-featured-list">
              {featuredProjects.slice(1).map((project) => projectCard(project))}
            </div>
          </div>
        </section>

        <section className="home-section" aria-label="추천 개발자">
          <SectionHeading
            title="나에게 딱 맞는 추천 개발자"
            description="관심 분야와 기술 스택을 기반으로 추천하는 개발자예요."
            to="/search/developer"
          />
          <div className="home-developers-grid">
            {recommendedDevelopers.map((developer) => (
              <article className="home-developer-card" key={developer.id}>
                <button
                  className="home-card-open"
                  type="button"
                  aria-label={`${developer.name} 개발자 미리보기`}
                  onClick={() => setPreview({ kind: 'developer', item: developer })}
                >
                  <div className="home-developer-avatar">
                    <img src={BrandSymbol} alt="" />
                  </div>
                  <h3>{developer.name}</h3>
                  <span className="home-developer-role">{developer.role}</span>
                  <div className="home-skills">
                    {developer.skills.map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>
                  {developer.recommendation?.reasons.length ? (
                    <div className="home-recommendation">
                      <span className="home-recommendation-label">
                        추천 이유
                        {developer.recommendation.source === 'mock' && <small>예시</small>}
                      </span>
                      <ul>
                        {developer.recommendation.reasons.map((reason) => (
                          <li key={reason}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p>{developer.introduction}</p>
                  )}
                </button>
                <Bookmark
                  name={developer.name}
                  selected={bookmarks.has(developer.id)}
                  onToggle={() => toggleBookmark(developer.id)}
                />
              </article>
            ))}
          </div>
        </section>

        <section className="home-section" aria-label="새 프로젝트">
          <SectionHeading
            title="새롭게 올라온 프로젝트"
            description="최근 등록된 프로젝트들을 빠르게 살펴보세요."
            to="/search/project"
          />
          <div className="home-recent-grid">
            {recentProjects.map((project) => projectCard(project, false, true))}
          </div>
        </section>
      </div>
      {preview && <PreviewDialog preview={preview} onClose={() => setPreview(null)} />}
    </>
  );
}
