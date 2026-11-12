import ArrowIcon from '@assets/icons/arrow-left-admin.svg?react';
import HomeLiveSections from './home-live-sections';
import { useMockData } from '../../shared/config/data-mode';
import ProjectCard from '@components/cards/ProjectCard';
import RecommendedProjectCard from '@components/cards/RecommendedProjectCard';
import DeveloperCard from '@components/cards/DeveloperCard';
import { useAuthStore } from '@store/auth';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import {
  editorials,
  featuredProjects,
  type HomeProject,
  recentProjects,
  recommendedDevelopers,
  recommendedProjects,
} from './home-mock-data';
import './home-page.css';
import './home-cards.css';
import '@components/cards/home-recommended-project-card.css';
import './home-colors.css';


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
    <div className={`home-section-heading mb-[var(--home-space-heading)] flex items-start justify-between gap-[16px] ${accent ? ' home-section-heading-accent' : ''}`}>
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

export default function HomePage() {
  const navigate = useNavigate();
  const homeRef = useRef<HTMLDivElement>(null);
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
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hoveringBanner, setHoveringBanner] = useState(false);
  const [focusingBanner, setFocusingBanner] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [bookmarks, setBookmarks] = useState<Set<string>>(() => new Set());

  useLayoutEffect(() => {
    const home = homeRef.current;
    if (!home || reduceMotion || typeof IntersectionObserver === 'undefined') return;

    const observed = new WeakSet<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const card = entry.target as HTMLElement;
        const grid = card.parentElement;
        const columns = grid ? getComputedStyle(grid).gridTemplateColumns.split(' ').length : 1;
        const position = grid ? Array.from(grid.children).indexOf(card) : 0;
        card.style.setProperty('--home-card-delay', `${(position % Math.max(columns, 1)) * 80}ms`);
        card.classList.replace('home-card-reveal-pending', 'home-card-reveal-active');
        card.addEventListener('animationend', () => {
          card.classList.remove('home-card-reveal-active');
          card.style.removeProperty('--home-card-delay');
        }, { once: true });
        observer.unobserve(card);
      }
    }, { threshold: 0.08 });

    const observeCards = () => {
      home.querySelectorAll<HTMLElement>('.home-featured-grid > article, .home-developers-grid > article, .home-recent-grid > article').forEach((card) => {
        if (observed.has(card)) return;
        observed.add(card);
        card.classList.add('home-card-reveal-pending');
        observer.observe(card);
      });
    };
    observeCards();
    const mutations = new MutationObserver(observeCards);
    mutations.observe(home, { childList: true, subtree: true });
    return () => {
      mutations.disconnect();
      observer.disconnect();
      home.querySelectorAll<HTMLElement>('.home-card-reveal-pending, .home-card-reveal-active').forEach((card) => {
        card.classList.remove('home-card-reveal-pending', 'home-card-reveal-active');
        card.style.removeProperty('--home-card-delay');
      });
    };
  }, [reduceMotion]);

  const editorial = editorials[slide];

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReduceMotion(preference.matches);
    preference.addEventListener('change', updatePreference);
    return () => preference.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    if (paused || hoveringBanner || focusingBanner || reduceMotion) return;
    const timer = window.setTimeout(() => setSlide((slide + 1) % editorials.length), 3000);
    return () => window.clearTimeout(timer);
  }, [slide, paused, hoveringBanner, focusingBanner, reduceMotion]);
  const toggleBookmark = (id: string) =>
    setBookmarks((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const projectCard = (project: HomeProject, featured = false, recent = false, recommended = false) => (
    <RecommendedProjectCard
      key={project.id}
      project={project}
      featured={featured}
      recent={recent}
      recommended={recommended}
      saved={bookmarks.has(project.id)}
      onToggle={() => toggleBookmark(project.id)}
      onOpen={() => navigate(`/project/sample-${project.id}`)}
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
      <div ref={homeRef} className="devine-home desktop-content [--home-banner-min-height:clamp(252px,calc(36svh-16px),320px)] [--home-banner-padding-y:clamp(20px,3svh,32px)] [--home-section-gap:clamp(64px,calc(12svh-26px),104px)] lg:max-2xl:[--home-banner-min-height:clamp(228px,calc(34svh-16px),308px)] lg:max-2xl:[--home-banner-padding-y:clamp(14px,2.4svh,26px)] lg:max-2xl:[--home-section-gap:clamp(42px,calc(10svh-24px),84px)] lg:max-2xl:[--home-featured-image-height:clamp(124px,calc(25svh-52px),188px)]">
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

        {useMockData ? <><section className="home-section home-section-featured" aria-label="주목받는 프로젝트">
          <SectionHeading
            title="지금 주목받는 프로젝트"
            accent
            description="지금 많은 개발자들의 관심을 받고 있는 프로젝트를 만나보세요."
            to="/search/projects"
          />
          <div className="home-featured-grid explore-projects-grid">
            {featuredProjects.slice(0, 3).map((project) => <ProjectCard key={project.id} project={project} saved={bookmarks.has(project.id)} variant="grid" showProfiles showTechStacks={false} onOpen={() => navigate(`/project/sample-${project.id}`)} onBookmarkChange={() => toggleBookmark(project.id)} />)}
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
          <div className="home-developers-grid home-developer-card-grid">
            {recommendedDevelopers.map((developer) => (
              <DeveloperCard key={developer.id}
                developer={{ member: { nickname: developer.name, address: null, disclosure: true, mainType: 'DEVELOPER', imageUrl: null, body: developer.introduction, used: '', createdAt: '' }, domains: [], techstacks: developer.skills.map((name, index) => ({ techstackId: index, name, genre: 'skill', source: 'MANUAL' })) }}
                roleLabel={developer.role} bookmarked={bookmarks.has(developer.id)} pending={false} variant="grid" showTechStacks={false}
                onBookmarkChange={() => toggleBookmark(developer.id)} onOpen={() => navigate(`/developer-detail/${encodeURIComponent(developer.name)}?preview=sample`)} />
            ))}
          </div>
          )}
        </section>

        <section className="home-section home-section-recent" aria-label="새 프로젝트">
          <SectionHeading
            title="새롭게 올라온 프로젝트"
            accent
            to="/search/projects"
          />
          <div className="home-recent-grid explore-projects-list">
            {recentProjects.map((project) => <ProjectCard key={project.id} project={project} saved={bookmarks.has(project.id)} variant="list" wideImage showTechStacks={false} onOpen={() => navigate(`/project/sample-${project.id}`)} onBookmarkChange={() => toggleBookmark(project.id)} />)}
          </div>
        </section></> : <HomeLiveSections isDeveloper={isDeveloper} />}
      </div>
    </>
  );
}
