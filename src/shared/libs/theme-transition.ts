import { flushSync } from 'react-dom';

export const PULLCORD_MASK_PATH = '/animations/devine_pullcord_animated.gif';
let maskBytes: Promise<Blob> | undefined;

// Cache bytes, not an Image: decoding an Image here would start its GIF clock early.
export function preloadThemeMask(): Promise<Blob> {
  maskBytes ??= fetch(PULLCORD_MASK_PATH)
    .then((response) => {
      if (!response.ok) throw new Error('Theme mask unavailable');
      return response.blob();
    })
    .catch((error: unknown) => {
      maskBytes = undefined;
      throw error;
    });
  return maskBytes;
}

export async function revealTheme(applyTheme: () => void): Promise<void> {
  const root = document.documentElement;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let applied = false;
  const applyOnce = () => {
    if (applied) return;
    applied = true;
    flushSync(applyTheme);
  };
  if (motion.matches || !document.startViewTransition) {
    applyOnce();
    return;
  }

  let maskUrl: string | undefined;
  let watchdog: ReturnType<typeof setTimeout> | undefined;
  let transition: ViewTransition | undefined;
  let silhouette: HTMLDivElement | undefined;
  const skip = () => transition?.skipTransition();
  const onVisibility = () => { if (document.hidden) skip(); };
  try {
    const blob = await preloadThemeMask();
    if (motion.matches) { applyOnce(); return; }
    // A fresh resource identity gives each CSS mask a new decoder/playback clock.
    maskUrl = URL.createObjectURL(blob);
    root.style.setProperty('--theme-pullcord-mask', `url("${maskUrl}")`);
    root.dataset.themeReveal = 'pullcord';
    transition = document.startViewTransition(() => {
      applyOnce();
      // Capture a separate theme-colored surface above the page snapshot. The
      // GIF alpha clips it so unchanged photos cannot visually cut up the pose.
      silhouette = document.createElement('div');
      silhouette.setAttribute('aria-hidden', 'true');
      silhouette.style.cssText = 'position:fixed;inset:0;pointer-events:none;background:var(--ui-bg);view-transition-name:theme-pullcord-silhouette';
      document.body.append(silhouette);
    });
    // Keep the capture source mounted until completion; removing a named source
    // during playback can cause browsers to finish its transition early.
    void transition.ready.catch(() => undefined);
    motion.addEventListener('change', skip);
    document.addEventListener('visibilitychange', onVisibility);
    watchdog = setTimeout(skip, 5000);
    await transition.finished;
  } catch {
    applyOnce();
  } finally {
    silhouette?.remove();
    clearTimeout(watchdog);
    motion.removeEventListener('change', skip);
    document.removeEventListener('visibilitychange', onVisibility);
    delete root.dataset.themeReveal;
    root.style.removeProperty('--theme-pullcord-mask');
    if (maskUrl) URL.revokeObjectURL(maskUrl);
  }
}
