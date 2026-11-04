import { useLayoutEffect, useRef, type MouseEvent } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { animateElasticUnderline } from '@hooks/useElasticUnderline';
import { gsap } from 'gsap';
import './explore-tabs.css';

let pendingIndicator: { target: string; left: number; width: number } | null = null;

export default function ExploreTabs({ mode = 'search' }: { mode?: 'search' | 'recommend' }) {
  const navRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const transitionRef = useRef<typeof pendingIndicator>(null);
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    const nav = navRef.current;
    const indicator = indicatorRef.current;
    const active = nav?.querySelector<HTMLElement>('a.is-active');
    if (!nav || !indicator || !active) return;
    const positionIndicator = () => {
      gsap.set(indicator, { x: active.offsetLeft, width: active.offsetWidth });
    };
    positionIndicator();
    if (pendingIndicator?.target === pathname) {
      transitionRef.current = pendingIndicator;
      pendingIndicator = null;
    }
    const previous = transitionRef.current;
    let cardsObserver: MutationObserver | undefined;
    let observerTimeout: number | undefined;
    let timeline: gsap.core.Timeline | undefined;
    if (previous?.target === pathname && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      timeline = animateElasticUnderline(indicator,
        { left: previous.left, right: previous.left + previous.width },
        { left: active.offsetLeft, right: active.offsetLeft + active.offsetWidth },
      );
      active.animate([{ opacity: .7 }, { opacity: 1 }], { duration: 220, easing: 'ease-out' });
      const page = nav.closest('.project-explore');
      const content = [page?.querySelector<HTMLElement>('.explore-sidebar'), ...Array.from(nav.parentElement?.children ?? []).filter(element => element !== nav && !element.matches('.explore-projects, .developer-explore-list'))];
      content.forEach(element => element?.animate(
        [{ opacity: .82, transform: 'translateY(4px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 220, easing: 'cubic-bezier(.22, 1, .36, 1)' },
      ));
      const list = page?.querySelector<HTMLElement>('.explore-projects, .developer-explore-list');
      const animateCards = () => {
        const cards = list?.querySelectorAll<HTMLElement>('.explore-card, .developer-explore-card');
        if (!cards?.length) return false;
        cards.forEach((card, index) => card.animate(
          [{ opacity: .65, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 280, delay: Math.min(index, 7) * 30, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'backwards' },
        ));
        return true;
      };
      if (list && !animateCards()) {
        cardsObserver = new MutationObserver(() => {
          if (animateCards()) cardsObserver?.disconnect();
        });
        cardsObserver.observe(list, { childList: true, subtree: true });
        observerTimeout = window.setTimeout(() => cardsObserver?.disconnect(), 5000);
      }
    }
    let lastWidth = nav.getBoundingClientRect().width;
    let lastActiveWidth = active.getBoundingClientRect().width;
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => {
      const width = nav.getBoundingClientRect().width;
      const activeWidth = active.getBoundingClientRect().width;
      if (width === lastWidth && activeWidth === lastActiveWidth) return;
      lastWidth = width;
      lastActiveWidth = activeWidth;
      timeline?.kill();
      positionIndicator();
    });
    observer?.observe(nav);
    observer?.observe(active);
    return () => {
      observer?.disconnect();
      timeline?.kill();
      cardsObserver?.disconnect();
      window.clearTimeout(observerTimeout);
    };
  }, [pathname]);

  const rememberPosition = (event: MouseEvent<HTMLAnchorElement>, target: string) => {
    if (target === pathname || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const nav = navRef.current;
    const indicator = indicatorRef.current;
    if (!nav || !indicator) return;
    const rect = indicator.getBoundingClientRect();
    pendingIndicator = { target, left: rect.left - nav.getBoundingClientRect().left, width: rect.width };
  };

  const projectPath = mode === 'recommend' ? '/recommend/project' : '/search/projects';
  const developerPath = mode === 'recommend' ? '/recommend/developer' : '/search/developers';
  return <nav ref={navRef} className="explore-tabs" aria-label={mode === 'recommend' ? '추천 대상' : '탐색 대상'}>
    <NavLink to={projectPath} onClick={event => rememberPosition(event, projectPath)} className={({ isActive }) => isActive ? 'is-active' : undefined}>프로젝트</NavLink>
    <NavLink to={developerPath} onClick={event => rememberPosition(event, developerPath)} className={({ isActive }) => isActive ? 'is-active' : undefined}>개발자</NavLink>
    <span ref={indicatorRef} className="explore-tabs-indicator" aria-hidden="true" />
  </nav>;
}
