declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

function loadGtagScript() {
  if (!MEASUREMENT_ID || typeof document === 'undefined') return;

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };
  window.gtag('js', new Date());

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

function initGA() {
  if (!MEASUREMENT_ID) return;
  loadGtagScript();
  window.gtag('config', MEASUREMENT_ID);
}

export function trackPageView(path: string) {
  if (!MEASUREMENT_ID || typeof window.gtag !== 'function') return;
  window.gtag('config', MEASUREMENT_ID, { page_path: path });
}

export function initGoogleAnalytics() {
  initGA();
}
