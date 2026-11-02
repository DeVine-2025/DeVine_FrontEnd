import { gsap } from 'gsap';
import { useLayoutEffect, useRef } from 'react';

type Edges = { left: number; right: number };

export function animateElasticUnderline(indicator: HTMLElement, from: Edges, target: Edges) {
  const edges = { ...from };
  const render = () => gsap.set(indicator, { x: edges.left, width: Math.max(0, edges.right - edges.left), visibility: 'visible' });
  const goingRight = target.left + target.right > edges.left + edges.right;
  const front = goingRight ? 'right' : 'left';
  const back = goingRight ? 'left' : 'right';
  render();
  return gsap.timeline({ onUpdate: render })
    .to(edges, { [front]: target[front], duration: .16, ease: 'power2.out' }, 0)
    .to(edges, { [back]: target[back], duration: .28, ease: 'back.out(1.15)' }, .08);
}

/** Animates one shared underline between the active links in a navigation group. */
export function useElasticUnderline(activeKey: string) {
  const navRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const targetRef = useRef<{ left: number; right: number } | null>(null);

  useLayoutEffect(() => {
    const nav = navRef.current;
    const indicator = indicatorRef.current;
    if (!nav || !indicator) return;
    const active = nav.querySelector<HTMLElement>('[aria-current="page"]');
    if (!active) {
      timelineRef.current?.kill();
      targetRef.current = null;
      gsap.set(indicator, { visibility: 'hidden' });
      return;
    }

    const navRect = nav.getBoundingClientRect();
    const rect = active.getBoundingClientRect();
    const target = { left: rect.left - navRect.left - nav.clientLeft, right: rect.right - navRect.left - nav.clientLeft };
    const previous = targetRef.current;
    if (previous && Math.abs(previous.left - target.left) < .1 && Math.abs(previous.right - target.right) < .1) return;
    const current = indicator.getBoundingClientRect();
    timelineRef.current?.kill();
    targetRef.current = target;
    if (!previous || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(indicator, { x: target.left, width: target.right - target.left, visibility: 'visible' });
      return;
    }

    timelineRef.current = animateElasticUnderline(indicator, { left: current.left - navRect.left - nav.clientLeft, right: current.right - navRect.left - nav.clientLeft }, target);
  }, [activeKey]);

  useLayoutEffect(() => {
    const nav = navRef.current;
    const indicator = indicatorRef.current;
    if (!nav || !indicator) return;
    const resize = () => {
      const active = nav.querySelector<HTMLElement>('[aria-current="page"]');
      if (!active) return;
      const navRect = nav.getBoundingClientRect();
      const rect = active.getBoundingClientRect();
      const target = { left: rect.left - navRect.left - nav.clientLeft, right: rect.right - navRect.left - nav.clientLeft };
      if (targetRef.current && Math.abs(target.left - targetRef.current.left) < .1 && Math.abs(target.right - targetRef.current.right) < .1) return;
      timelineRef.current?.kill();
      targetRef.current = target;
      gsap.set(indicator, { x: target.left, width: target.right - target.left, visibility: 'visible' });
    };
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize);
    observer?.observe(nav);
    nav.querySelectorAll('a').forEach(link => observer?.observe(link));
    window.addEventListener('resize', resize);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', resize);
      timelineRef.current?.kill();
    };
  }, []);

  return { navRef, indicatorRef };
}
