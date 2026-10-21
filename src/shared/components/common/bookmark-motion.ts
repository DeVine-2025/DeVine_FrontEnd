import { gsap } from '@libs/gsap';

// Paths and timing adapted from Aaron Iker / https://codepen.io/aaroniker/pen/oNbdyNb (MIT).
export const BOOKMARK_PATHS = {
  ribbon: 'M26 6H10V18V30C10 30 17.9746 23.5 18 23.5C18.0254 23.5 26 30 26 30V18V6Z',
  pressed:
    'M26 6H10V18C10 22.6863 11 28 11 28C11 28 17.5273 19.5 18 19.5C18.4727 19.5 25 28 25 28C25 28 26 22.6863 26 18V6Z',
  released:
    'M26 6H10V18C10 22.6863 8 31 8 31C8 31 15.9746 26.5 18 23.5C20.0254 26.5 28 31 28 31C28 31 26 22.6863 26 18V6Z',
  corner: 'M10 6C10 6 14.8758 6 18 6C21.1242 6 26 6 26 6C26 6 26 6 26 6H10C10 6 10 6 10 6Z',
  folds: [
    'M10 6C10 6 14.8758 6 18 6C21.1242 6 26 6 26 6C26 6 28 8.5 28 10H8C8 8.5 10 6 10 6Z',
    'M9.99999 6C9.99999 6 14.8758 6 18 6C21.1242 6 26 6 26 6C26 6 31 10.5 26 14H9.99999C4.99999 10.5 9.99999 6 9.99999 6Z',
    'M7.99998 16.5C7.99998 16.5 9.87579 22.5 18 22.5C26.1242 22.5 28 16.5 28 16.5C28 16.5 31 20 26 23.5H9.99998C4.99998 20 7.99998 16.5 7.99998 16.5Z',
    'M8 28C8 28 12.8758 28.5 18 25.5C23.1242 28.5 28 27.5 28 27.5C28 27.5 26 24 26 23.5H10C10 25 8 28 8 28Z',
    'M10 30C10 30 17.8758 23.5 18 23.5C18.1242 23.5 26 30 26 30C26 30 26 23.5 26 23H10C10 24.5 10 30 10 30Z',
  ],
} as const;

export type BookmarkMotionElements = {
  stage: HTMLSpanElement;
  defaultPath: SVGPathElement;
  filledPath: SVGPathElement;
  cornerPath: SVGPathElement;
  maskPath: SVGPathElement;
};

export function createBookmarkMotion({
  stage,
  defaultPath,
  filledPath,
  cornerPath,
  maskPath,
}: BookmarkMotionElements) {
  const body = [defaultPath, filledPath, maskPath];
  const paths = [...body, cornerPath];
  let timeline: gsap.core.Timeline | undefined;
  let pressTween: gsap.core.Tween | undefined;
  let target = stage.dataset.saved === 'true';
  let timelineEndState = target;
  function snap(saved: boolean) {
    timeline?.kill();
    pressTween?.kill();
    timeline = undefined;
    pressTween = undefined;
    gsap.killTweensOf([stage, ...paths]);
    stage.dataset.saved = String(saved);
    stage.removeAttribute('style');
    for (const path of body) {
      path.removeAttribute('style');
      path.setAttribute('d', BOOKMARK_PATHS.ribbon);
    }
    cornerPath.removeAttribute('style');
    cornerPath.setAttribute('d', BOOKMARK_PATHS.corner);
    target = saved;
  }
  function play(saved: boolean, onComplete: () => void) {
    // An optimistic rollback retraces the current frame rather than jumping to the endpoint.
    if (timeline && saved !== target) {
      target = saved;
      timeline.eventCallback('onComplete', null);
      timeline.eventCallback('onReverseComplete', null);
      const finish = () => {
        snap(saved);
        onComplete();
      };
      if (saved === timelineEndState) {
        timeline.eventCallback('onComplete', finish);
        timeline.play();
      } else if (timeline.time() === 0) {
        finish();
      } else {
        timeline.eventCallback('onReverseComplete', finish);
        timeline.reverse();
      }
      return;
    }
    snap(!saved);
    target = saved;
    timelineEndState = saved;
    gsap.set(stage, {
      '--default-position': saved ? '32px' : '0px',
      '--default-y': '0px',
      '--background-height': saved ? '17px' : '19px',
      '--ribbon-color': saved ? '#9EA6BA' : '#4E49FF',
    });
    timeline = gsap.timeline({
      onComplete: () => {
        snap(saved);
        onComplete();
      },
    });
    timeline.to(stage, { '--ribbon-color': saved ? '#4E49FF' : '#9EA6BA', duration: 0.2 }, 0);
    if (saved) {
      timeline
        .to(stage, { '--default-y': '-28px', duration: 0.4 }, 0)
        .to(stage, { '--background-height': '0px', duration: 0.125 }, 0.3)
        .to(cornerPath, { morphSVG: BOOKMARK_PATHS.folds[0], duration: 0.125, ease: 'none' }, 0)
        .to(cornerPath, { morphSVG: BOOKMARK_PATHS.folds[1], duration: 0.15, ease: 'none' }, 0.125)
        .to(
          cornerPath,
          { morphSVG: BOOKMARK_PATHS.folds[2], duration: 0.125, ease: 'power1.in' },
          0.275,
        )
        .set(cornerPath, { fill: 'var(--ribbon-color)' }, 0.45)
        .to(cornerPath, { morphSVG: BOOKMARK_PATHS.folds[3], duration: 0.125, ease: 'none' }, 0.4)
        .to(
          cornerPath,
          { morphSVG: BOOKMARK_PATHS.folds[4], duration: 0.5, ease: 'elastic.out(1, .7)' },
          0.525,
        );
    } else {
      timeline
        .set(body, { morphSVG: BOOKMARK_PATHS.pressed }, 0)
        .to(body, { morphSVG: BOOKMARK_PATHS.released, duration: 0.15 }, 0)
        .to(
          body,
          { morphSVG: BOOKMARK_PATHS.ribbon, duration: 0.6, ease: 'elastic.out(1, .7)' },
          0.15,
        )
        .to(stage, { '--default-position': '24px', duration: 0.2 }, 0)
        .set(stage, { '--default-position': '32px' }, 0.2);
    }
  }
  return {
    snap,
    play,
    press() {
      pressTween?.kill();
      pressTween = gsap.to(body, { morphSVG: BOOKMARK_PATHS.pressed, duration: 0.15 });
    },
    release() {
      if (!timeline?.isActive()) {
        pressTween?.kill();
        pressTween = gsap.to(body, { morphSVG: BOOKMARK_PATHS.ribbon, duration: 0.2 });
      }
    },
    destroy() {
      snap(target);
      timeline = undefined;
      pressTween = undefined;
    },
  };
}
