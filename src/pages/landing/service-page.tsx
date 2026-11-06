import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Helmet } from 'react-helmet-async';
import Header from '@layouts/header';
import Hero from './launch-ui/components/sections/hero/default';
import baseCss from './launch-ui/launch-base.css?raw';
import accentCss from './launch-ui/launch-accent.css?raw';
import introUtilities from './launch-ui/intro-utilities.css?inline';
import './service-page.css';

function LandingContent() {
  const introRef = useRef<HTMLElement>(null);
  const reportRef = useRef<HTMLElement>(null);
  const [reportVisible, setReportVisible] = useState(false);
  const [introVisible, setIntroVisible] = useState(false);

  useEffect(() => {
    const section = introRef.current;
    if (!section) return;
    if (!('IntersectionObserver' in window)) {
      setIntroVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIntroVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.25 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const section = reportRef.current;
    if (!section) return;
    if (!('IntersectionObserver' in window)) {
      setReportVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setReportVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.2 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const reportRevealClass = reportVisible ? 'translate-y-0 opacity-100' : 'translate-y-[28px] opacity-0';
  const revealClass = introVisible ? 'translate-y-0 opacity-100' : 'translate-y-[28px] opacity-0';
  const revealMotion = 'transition-[opacity,transform] duration-[1200ms] ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none';

  return (
    <div className="launch-content dark">
      <main className="bg-background text-foreground min-h-screen w-full">
        <Hero />
        <section ref={introRef} className="flex min-h-[105svh] items-center border-t border-white/[0.06] bg-[#101116] px-[24px] py-[80px] text-[#f5f5f7] [font-family:Pretendard,sans-serif] min-[801px]:px-[32px] min-[801px]:pt-[120px] min-[801px]:pb-[128px]" aria-labelledby="service-intro-title">
          <div className="mx-auto w-full max-w-[1330px]">
            <p className={`${revealMotion} ${revealClass} flex items-center gap-[22px] text-[15px] tracking-[.16em] text-[#d7d6df] after:h-px after:w-[50px] after:bg-[#ada1fa] after:content-['']`}>INTRODUCTION</p>
            <h2 id="service-intro-title" className={`${revealMotion} ${revealClass} delay-[160ms] mt-[26px] text-[clamp(34px,3vw,50px)] leading-[1.3] font-bold tracking-[-.04em] [word-break:keep-all]`}>프로젝트를 찾기 전에,<br />먼저 <span className="text-[#ADA1FA]">프로젝트를 이해</span>할 수 있도록.</h2>
            <p className={`${revealMotion} ${revealClass} delay-[300ms] mt-[18px] text-[16px] leading-[1.6] text-[#a8a8b2] [word-break:keep-all] min-[801px]:text-[19px]`}>GitHub 코드를 분석해 프로젝트를 이해하고, 더 적합한 팀과 개발자를 연결합니다.</p>
            <div className="mt-[48px] grid grid-cols-1 gap-[44px] min-[801px]:mt-[84px] min-[801px]:grid-cols-3 min-[801px]:gap-0">
              <article className={`${revealMotion} ${revealClass} delay-[420ms] min-w-0 border-b border-white/[0.07] pb-[36px] last:border-b-0 min-[801px]:border-b-0 min-[801px]:border-l min-[801px]:px-[48px] min-[801px]:pb-0 min-[801px]:first:border-l-0 min-[801px]:first:pl-0 min-[801px]:last:pr-0`}>
                <img src="/launch-ui/intro-analysis.png" alt="" aria-hidden="true" className="mx-auto aspect-square w-full max-w-[300px] object-contain brightness-[1.12]" />
                <p className="mt-[10px] text-[15px] tracking-[.14em] text-[#d1cfda]">01 / ANALYSIS</p>
                <h3 className="mt-[14px] text-[27px] font-bold tracking-[-.035em]">코드 기반 분석</h3>
                <p className="mt-[12px] text-[17px] leading-[1.7] text-[#c1c0c9] [word-break:keep-all]">GitHub 코드를 분석해 기술 스택과<br className="hidden min-[1400px]:block" /> 핵심 구현 내용을 리포트로 정리합니다.</p>
              </article>
              <article className={`${revealMotion} ${revealClass} delay-[600ms] min-w-0 border-b border-white/[0.07] pb-[36px] last:border-b-0 min-[801px]:border-b-0 min-[801px]:border-l min-[801px]:px-[48px] min-[801px]:pb-0 min-[801px]:first:border-l-0 min-[801px]:first:pl-0 min-[801px]:last:pr-0`}>
                <img src="/launch-ui/intro-recommend.png" alt="" aria-hidden="true" className="mx-auto aspect-square w-full max-w-[300px] scale-[1.25] object-contain" />
                <p className="mt-[10px] text-[15px] tracking-[.14em] text-[#d1cfda]">02 / RECOMMEND</p>
                <h3 className="mt-[14px] text-[27px] font-bold tracking-[-.035em]">맥락 있는 추천</h3>
                <p className="mt-[12px] text-[17px] leading-[1.7] text-[#c1c0c9] [word-break:keep-all]">관심 분야와 프로젝트 리포트를 바탕으로<br className="hidden min-[1400px]:block" /> 적합한 프로젝트와 개발자를 추천합니다.</p>
              </article>
              <article className={`${revealMotion} ${revealClass} delay-[780ms] min-w-0 border-b border-white/[0.07] pb-[36px] last:border-b-0 min-[801px]:border-b-0 min-[801px]:border-l min-[801px]:px-[48px] min-[801px]:pb-0 min-[801px]:first:border-l-0 min-[801px]:first:pl-0 min-[801px]:last:pr-0`}>
                <img src="/launch-ui/intro-connect.png" alt="" aria-hidden="true" className="mx-auto aspect-square w-full max-w-[300px] scale-[1.4] object-contain brightness-[1.12]" />
                <p className="mt-[10px] text-[15px] tracking-[.14em] text-[#d1cfda]">03 / CONNECT</p>
                <h3 className="mt-[14px] text-[27px] font-bold tracking-[-.035em]">참여까지 연결</h3>
                <p className="mt-[12px] text-[17px] leading-[1.7] text-[#c1c0c9] [word-break:keep-all]">프로젝트 지원 현황을 확인하고,<br className="hidden min-[1400px]:block" /> 필요한 개발자에게 직접 참여를 제안합니다.</p>
              </article>
            </div>
          </div>
        </section>
        <section ref={reportRef} className="overflow-hidden border-t border-white/[0.06] bg-[#101116] px-[24px] pt-[90px] pb-[20px] text-[#f5f5f7] [font-family:Pretendard,sans-serif] min-[801px]:px-[32px] min-[801px]:pt-[120px] min-[801px]:pb-[20px]" aria-labelledby="service-report-title">
          <div className="mx-auto w-full max-w-[1330px]">
            <p className={`${revealMotion} ${reportRevealClass} flex items-center gap-[22px] text-[15px] tracking-[.16em] text-[#d7d6df] after:h-px after:w-[50px] after:bg-[#ada1fa] after:content-['']`}>PROJECT REPORT</p>
            <div className={`${revealMotion} ${reportRevealClass} delay-[180ms] mt-[26px] grid grid-cols-1 gap-[28px] min-[801px]:grid-cols-2 min-[801px]:gap-[56px]`}>
              <h2 id="service-report-title" className="text-[clamp(34px,3vw,50px)] leading-[1.3] font-bold tracking-[-.04em] [word-break:keep-all]">GitHub 저장소부터,<br /><span className="text-[#c4c4ce]">프로젝트 리포트까지.</span></h2>
              <div className="min-[801px]:border-l min-[801px]:border-white/[0.12] min-[801px]:pl-[56px]">
                <p className="max-w-[520px] text-[18px] leading-[1.6] text-[#d4d4dc] [word-break:keep-all]">GitHub 코드를 분석해 기술 스택과 핵심 구현 내용을 하나의 리포트로 정리합니다.</p>
                <a href="/report" target="_top" className="mt-[24px] inline-flex items-center gap-[10px] text-[17px] font-semibold text-[#ADA1FA] transition-colors hover:text-[#d0c8ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ADA1FA]">리포트 살펴보기 <span aria-hidden="true">→</span></a>
              </div>
            </div>
            <div className={`${revealMotion} ${reportRevealClass} delay-[420ms]`}>
              <div className="relative mt-[122px] min-[801px]:mt-[130px] min-[801px]:-translate-x-[35px] min-[801px]:scale-[1.23]">
              <img src="/launch-ui/report-detail-v2.png" alt="DeVine 상세 리포트의 프로젝트 정보와 핵심 기술 스택 미리보기" loading="lazy" className="block h-auto w-full [mask-image:linear-gradient(to_bottom,black_58%,rgba(0,0,0,0.85)_72%,rgba(0,0,0,0.35)_88%,transparent_100%),linear-gradient(to_right,black_75%,transparent_100%)] [mask-composite:intersect]" />
              <div aria-hidden="true" className="pointer-events-none absolute top-[2.7%] right-[9.3%] bottom-[2.9%] left-[9.4%] rounded-[20px] border border-white/[0.14] [mask-image:linear-gradient(to_bottom,black_58%,transparent_100%),linear-gradient(to_right,black_75%,transparent_100%)] [mask-composite:intersect]" />
              </div>
            </div>
          </div>
        </section>
        <section className="min-h-[100svh] overflow-hidden border-t border-white/[0.06] bg-[#101116] px-[24px] py-[90px] text-[#f5f5f7] [font-family:Pretendard,sans-serif] min-[801px]:px-[32px] min-[801px]:py-[120px]" aria-labelledby="service-recommend-title">
          <div className="mx-auto w-full max-w-[1800px]">
            <div className="mx-auto max-w-[1440px]"><p className="flex items-center gap-[16px] text-[15px] font-semibold tracking-[.08em] text-[#ADA1FA] before:h-px before:w-[40px] before:bg-[#ADA1FA] before:content-['']">RECOMMENDATION</p>
            <div className="mt-[26px] grid grid-cols-1 gap-[28px] min-[801px]:grid-cols-2 min-[801px]:gap-[56px]">
              <h2 id="service-recommend-title" className="text-[clamp(34px,3vw,50px)] leading-[1.3] font-bold tracking-[-.04em] [word-break:keep-all]">프로젝트도, 개발자도.<br />더 적합한 연결을 위해.</h2>
              <div>
                <p className="max-w-[520px] text-[18px] leading-[1.6] text-[#d4d4dc] [word-break:keep-all]">관심 분야에 맞는 프로젝트를, 프로젝트 리포트를 바탕으로 적합한 개발자를 추천합니다.</p>
                <a href="/recommend/project" target="_top" className="mt-[24px] inline-flex items-center gap-[10px] text-[17px] font-semibold text-[#ADA1FA] transition-colors hover:text-[#d0c8ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ADA1FA]">추천 살펴보기 <span aria-hidden="true">→</span></a>
              </div>
            </div>
            </div>
            <div className="mt-[56px] grid grid-cols-1 gap-x-[18px] gap-y-[38px] min-[600px]:grid-cols-2 min-[1100px]:grid-cols-[0.68fr_1.13fr_1.1fr_0.81fr]">
              <article className="min-w-0"><div className="flex h-[320px] items-end min-[1100px]:h-[clamp(320px,25vw,500px)]"><img src="/launch-ui/recommend-interest.png" alt="관심 도메인과 기술 스택 설정 화면" loading="lazy" className="h-full w-full object-contain object-bottom" /></div><h3 className="mt-[20px] text-[20px] font-bold">01. 관심 분야 설정</h3><p className="mt-[10px] text-[15px] leading-[1.6] text-[#c5c5ce] [word-break:keep-all]">프로젝트 추천의 기준이 되는 관심 도메인과 기술 스택</p></article>
              <article className="min-w-0"><div className="flex h-[320px] items-end min-[1100px]:h-[clamp(320px,25vw,500px)]"><img src="/launch-ui/recommend-projects.png" alt="추천 프로젝트 목록 화면" loading="lazy" className="h-full w-full object-contain object-bottom" /></div><h3 className="mt-[20px] text-[20px] font-bold">02. 추천 프로젝트</h3><p className="mt-[10px] text-[15px] leading-[1.6] text-[#c5c5ce] [word-break:keep-all]">관심 분야에 맞춰 추천된 프로젝트 목록</p></article>
              <article className="min-w-0"><div className="flex h-[320px] items-end min-[1100px]:h-[clamp(320px,25vw,500px)]"><img src="/launch-ui/recommend-developers.png" alt="프로젝트별 추천 개발자 목록 화면" loading="lazy" className="h-full w-full object-contain object-bottom" /></div><h3 className="mt-[20px] text-[20px] font-bold">03. 추천 개발자</h3><p className="mt-[10px] text-[15px] leading-[1.6] text-[#c5c5ce] [word-break:keep-all]">선택한 프로젝트를 기준으로 추천되는 개발자</p></article>
              <article className="min-w-0"><div className="flex h-[320px] items-end min-[1100px]:h-[clamp(320px,25vw,500px)]"><img src="/launch-ui/recommend-profile.png" alt="개발자의 기술 스택과 프로젝트 경험을 보여주는 프로필 화면" loading="lazy" className="h-full w-full object-contain object-bottom" /></div><h3 className="mt-[20px] text-[20px] font-bold">04. 개발자 상세 프로필</h3><p className="mt-[10px] text-[15px] leading-[1.6] text-[#c5c5ce] [word-break:keep-all]">추천 결과에서 이어지는 기술 역량과 프로젝트 경험</p></article>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
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
      </div>
      {root && createPortal(<><style>{baseCss}{'\n'}{introUtilities}{'\n'}{accentCss}{'\n'}{':host{display:block;min-height:100%;font-size:16px;font-family:Inter,system-ui,sans-serif}.launch-content{min-height:100%;background:var(--background);color:var(--foreground)}'}</style><LandingContent /></>, root)}
    </div>
  </>;
}
