import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Helmet } from 'react-helmet-async';
import Header from '@layouts/header';
import Footer from '@layouts/footer';
import Hero from './launch-ui/components/sections/hero/default';
import Logos from './launch-ui/components/sections/logos/default';
import Items from './launch-ui/components/sections/items/default';
import Stats from './launch-ui/components/sections/stats/default';
import Pricing from './launch-ui/components/sections/pricing/default';
import FAQ from './launch-ui/components/sections/faq/default';
import CTA from './launch-ui/components/sections/cta/default';
import { LaunchThemeContext, type LaunchTheme } from './launch-ui/theme';
import baseCss from './launch-ui/launch-base.css?raw';
import accentCss from './launch-ui/launch-accent.css?raw';
import './service-page.css';

function LandingContent() {
  const [theme, setTheme] = useState<LaunchTheme>('dark');
  const [systemDark, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => setSystemDark(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  const isDark = theme === 'dark' || (theme === 'system' && systemDark);
  return <LaunchThemeContext.Provider value={{ theme, setTheme }}>
    <div className={`launch-content ${isDark ? 'dark' : ''}`}>
      <main className="bg-background text-foreground min-h-screen w-full">
        <Hero /><Logos /><Items /><Stats /><Pricing /><FAQ /><CTA />
      </main>
    </div>
  </LaunchThemeContext.Provider>;
}

export default function ServicePage() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [root, setRoot] = useState<ShadowRoot | null>(null);
  useLayoutEffect(() => {
    const host = hostRef.current;
    if (host) setRoot(host.shadowRoot ?? host.attachShadow({ mode: 'open' }));
  }, []);
  return <>
    <Helmet><title>Launch UI</title></Helmet>
    <div className="launch-ui-shell">
      <div className="launch-ui-header"><Header /></div>
      <div className="launch-ui-page">
        <div id="launch-ui-content-host" ref={hostRef} />
        <Footer />
      </div>
      {root && createPortal(<><style>{baseCss}{'\n'}{accentCss}{'\n'}{':host{display:block;min-height:100%;font-size:16px;font-family:Inter,system-ui,sans-serif}.launch-content{min-height:100%;background:var(--background);color:var(--foreground)}'}</style><LandingContent /></>, root)}
    </div>
  </>;
}
