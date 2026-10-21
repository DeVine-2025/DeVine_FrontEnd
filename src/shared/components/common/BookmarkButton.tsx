import { useCompanionStore } from '@store/companion';
import { useCallback, useContext, useEffect, useId, useRef, useState } from 'react';
import { BookmarkAnimationContext } from './bookmark-animation-context';
import { BOOKMARK_PATHS, createBookmarkMotion } from './bookmark-motion';
import LegacyBookmarkButton from './LegacyBookmarkButton';
import './bookmark-button.css';

type BookmarkButtonProps = {
  bookmarked: boolean;
  onBookmarkChange?: (next: boolean) => unknown;
  stopPropagation?: boolean;
  className?: string;
  /** Compatibility with existing cards; the ribbon has a consistent 24px visual size. */
  iconClassName?: string;
  colorIconClassName?: string;
  disabled?: boolean;
  pending?: boolean;
  'aria-label'?: string;
};

export default function BookmarkButton(props: BookmarkButtonProps) {
  const animate = useContext(BookmarkAnimationContext);
  return animate ? <MorphingBookmarkButton {...props} /> : <LegacyBookmarkButton {...props} />;
}

function MorphingBookmarkButton({
  bookmarked,
  onBookmarkChange,
  className = '',
  disabled = false,
  pending = false,
  'aria-label': label,
}: BookmarkButtonProps) {
  const maskId = `bookmark-mask-${useId().replace(/:/g, '')}`;
  const stage = useRef<HTMLSpanElement>(null);
  const defaultPath = useRef<SVGPathElement>(null);
  const filledPath = useRef<SVGPathElement>(null);
  const cornerPath = useRef<SVGPathElement>(null);
  const maskPath = useRef<SVGPathElement>(null);
  const motion = useRef<ReturnType<typeof createBookmarkMotion> | null>(null);
  const initialSaved = useRef(bookmarked);
  const latestSaved = useRef(bookmarked);
  latestSaved.current = bookmarked;
  const visualTarget = useRef(bookmarked);
  const mounted = useRef(false);
  const requestLock = useRef(false);
  const animationLock = useRef(false);
  const releaseFrame = useRef<number | null>(null);
  const [requestPending, setRequestPending] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [reduceMotion, setReduceMotion] = useState(() =>
    typeof window === 'undefined'
      ? false
      : window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    mounted.current = true;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduceMotion(preference.matches);
    preference.addEventListener('change', update);
    if (
      stage.current &&
      defaultPath.current &&
      filledPath.current &&
      cornerPath.current &&
      maskPath.current
    ) {
      motion.current = createBookmarkMotion({
        stage: stage.current,
        defaultPath: defaultPath.current,
        filledPath: filledPath.current,
        cornerPath: cornerPath.current,
        maskPath: maskPath.current,
      });
      motion.current.snap(latestSaved.current);
    }
    return () => {
      mounted.current = false;
      preference.removeEventListener('change', update);
      if (releaseFrame.current !== null) cancelAnimationFrame(releaseFrame.current);
      motion.current?.destroy();
      motion.current = null;
    };
  }, []);

  const animateTo = useCallback(
    (next: boolean) => {
      visualTarget.current = next;
      animationLock.current = !reduceMotion;
      setAnimating(!reduceMotion);
      if (reduceMotion) motion.current?.snap(next);
      else
        motion.current?.play(next, () => {
          animationLock.current = false;
          if (mounted.current) setAnimating(false);
        });
    },
    [reduceMotion],
  );

  useEffect(() => {
    if (!requestPending && visualTarget.current !== bookmarked) animateTo(bookmarked);
    if (reduceMotion && animationLock.current) {
      motion.current?.snap(visualTarget.current);
      animationLock.current = false;
      setAnimating(false);
    }
  }, [bookmarked, requestPending, reduceMotion, animateTo]);

  const blocked = disabled || pending || requestPending || animating;
  const actionLabel = `${label ? `${label} ` : ''}북마크 ${bookmarked ? '해제' : '저장'}`;
  return (
    <button
      type="button"
      className={`devine-bookmark-button ${className}`}
      aria-pressed={bookmarked}
      aria-label={actionLabel}
      aria-busy={requestPending || pending}
      aria-disabled={blocked || !onBookmarkChange}
      onKeyDown={(event) => event.stopPropagation()}
      onPointerDown={(event) => {
        event.stopPropagation();
        if (
          event.button === 0 &&
          bookmarked &&
          !blocked &&
          !requestLock.current &&
          !reduceMotion &&
          onBookmarkChange
        )
          motion.current?.press();
      }}
      onPointerUp={() => {
        releaseFrame.current = requestAnimationFrame(() => {
          if (!animationLock.current) motion.current?.release();
        });
      }}
      onPointerCancel={() => motion.current?.release()}
      onPointerLeave={() => {
        if (!animationLock.current) motion.current?.release();
      }}
      onBlur={() => {
        if (!animationLock.current) motion.current?.release();
      }}
      onClick={async (event) => {
        event.stopPropagation();
        event.preventDefault();
        if (blocked || requestLock.current || animationLock.current || !onBookmarkChange) return;
        requestLock.current = true;
        setRequestPending(true);
        setErrorMessage('');
        const next = !bookmarked;
        animateTo(next);
        try {
          await onBookmarkChange(next);
          if (next && mounted.current) useCompanionStore.getState().reactTo('bookmark');
        } catch {
          if (mounted.current) setErrorMessage('북마크 변경에 실패했습니다. 다시 시도해 주세요.');
        } finally {
          requestLock.current = false;
          if (mounted.current) setRequestPending(false);
        }
      }}
    >
      <span
        ref={stage}
        className="bookmark-ribbon"
        data-saved={initialSaved.current}
        aria-hidden="true"
      >
        <svg
          className="bookmark-ribbon-svg"
          viewBox="0 0 36 36"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <mask
              id={maskId}
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="36"
              height="36"
              style={{ maskType: 'luminance' }}
            >
              <rect width="36" height="36" fill="white" />
              <path ref={maskPath} className="bookmark-ribbon-mask" d={BOOKMARK_PATHS.ribbon} />
            </mask>
          </defs>
          <g mask={`url(#${maskId})`}>
            <path ref={filledPath} className="filled" d={BOOKMARK_PATHS.ribbon} />
          </g>
          <path ref={defaultPath} className="default" d={BOOKMARK_PATHS.ribbon} />
          <path ref={cornerPath} className="corner" d={BOOKMARK_PATHS.corner} />
        </svg>
      </span>
      <output className="bookmark-status" aria-live="polite">
        {errorMessage}
      </output>
    </button>
  );
}
