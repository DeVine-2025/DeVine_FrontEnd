import { useSectionReveal } from './use-section-reveal';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Helmet } from 'react-helmet-async';
import Footer from '@layouts/footer';
import BrandLogo from '@assets/images/devine-wordmark.png';
import { Link } from 'react-router-dom';
import Hero from './launch-ui/components/sections/hero/default';
import baseCss from './launch-ui/launch-base.css?raw';
import accentCss from './launch-ui/launch-accent.css?raw';
import introUtilities from './launch-ui/intro-utilities.css?inline';
import './service-page.css';

function LandingContent() {
  const [introRef, introVisible] = useSectionReveal(0.25);
  const [reportRef, reportVisible] = useSectionReveal(0.2);
  const [recommendRef, recommendVisible] = useSectionReveal(0.2);
  const [connectionRef, connectionVisible] = useSectionReveal(0.2);
  const [ctaRef, ctaVisible] = useSectionReveal(0.2);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setHeroVisible(true), 400);
    return () => window.clearTimeout(timer);
  }, []);











  const reportRevealClass = reportVisible ? 'translate-y-0 opacity-100' : 'translate-y-[28px] opacity-0';
  const revealClass = introVisible ? 'translate-y-0 opacity-100' : 'translate-y-[28px] opacity-0';
  const revealMotion = 'transition-[opacity,transform] duration-[1200ms] ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none';
  const textReveal = (visible: boolean) => `transition-[opacity,transform] duration-[900ms] ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${visible ? 'translate-y-0 opacity-100' : 'translate-y-[12px] opacity-0'}`;

  return (
    <div className="launch-content dark">
      <main className="bg-background text-foreground min-h-screen w-full lg:max-2xl:[&>section]:px-[clamp(40px,5.2vw,80px)] lg:max-2xl:[&>section:not(:first-child)]:min-h-0 lg:max-2xl:[&>section:not(:first-child)]:py-[clamp(56px,9svh,88px)] lg:max-2xl:[&>section>div]:max-w-[min(1180px,100%)] lg:max-2xl:[&_h2]:text-[clamp(34px,3vw,46px)] lg:max-2xl:[&_h3]:text-[clamp(21px,1.8vw,26px)] lg:max-2xl:[&_article]:px-[clamp(20px,2.5vw,38px)] lg:max-2xl:[&_article:first-child]:pl-0 lg:max-2xl:[&_article:last-child]:pr-0 lg:max-2xl:[&_article>img]:max-w-[clamp(200px,20vw,280px)] lg:max-2xl:[&_article>p]:text-[15px]">
        <Hero title={<><span className={`${textReveal(heroVisible)} block`}>코드로 증명하고,</span><span className={`${textReveal(heroVisible)} delay-[150ms] block text-[#ADA1FA] [-webkit-text-fill-color:#ADA1FA]`}>데이터로 연결하다.</span></>} />
        <section ref={introRef} className="flex min-h-[105svh] items-center border-t border-white/[0.06] bg-[#101116] px-[24px] py-[80px] text-[#f5f5f7] [font-family:Pretendard,sans-serif] min-[801px]:px-[32px] min-[801px]:pt-[120px] min-[801px]:pb-[128px]" aria-labelledby="service-intro-title">
          <div className="mx-auto w-full max-w-[1330px]">
            <p className={`${textReveal(introVisible)} flex items-center gap-[12px] text-[15px] tracking-[.16em] text-[#d7d6df] before:h-[16px] before:w-[3px] before:rounded-full before:bg-[#ada1fa] before:content-['']`}>INTRODUCTION</p>
            <h2 id="service-intro-title" className="mt-[26px] text-[clamp(34px,3vw,50px)] leading-[1.3] font-bold tracking-[-.04em] [word-break:keep-all]"><span className={`${textReveal(introVisible)} delay-[160ms] block`}>프로젝트를 찾기 전에,</span><span className={`${textReveal(introVisible)} delay-[310ms] block`}>먼저 <span className="text-[#ADA1FA]">프로젝트를 이해</span>할 수 있도록.</span></h2>
            <p className={`${textReveal(introVisible)} delay-[360ms] mt-[18px] text-[16px] leading-[1.6] text-[#a8a8b2] [word-break:keep-all] min-[801px]:text-[19px]`}>GitHub 코드를 분석해 프로젝트를 이해하고, 더 적합한 팀과 개발자를 연결합니다.</p>
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
            <p className={`${textReveal(reportVisible)} flex items-center gap-[12px] text-[15px] tracking-[.16em] text-[#d7d6df] before:h-[16px] before:w-[3px] before:rounded-full before:bg-[#ada1fa] before:content-['']`}>PROJECT REPORT</p>
            <div className="mt-[26px]">
              <h2 id="service-report-title" className="text-[clamp(34px,3vw,50px)] leading-[1.3] font-bold tracking-[-.04em] [word-break:keep-all]"><span className={`${textReveal(reportVisible)} delay-[160ms] block`}>GitHub 저장소부터,</span><span className={`${textReveal(reportVisible)} delay-[310ms] block text-[#c4c4ce]`}><span className="text-[#ADA1FA]">프로젝트 리포트</span>까지.</span></h2>
              <p className={`${textReveal(reportVisible)} delay-[360ms] mt-[18px] text-[16px] leading-[1.6] text-[#a8a8b2] [word-break:keep-all] min-[801px]:text-[19px]`}>GitHub 코드를 분석해 기술 스택과 핵심 구현 내용을 하나의 리포트로 정리합니다.</p>
            </div>
            <div className={`${revealMotion} ${reportRevealClass} delay-[420ms]`}>
              <div className="relative mt-[122px] min-[801px]:mt-[130px] min-[801px]:-translate-x-[35px] min-[801px]:scale-[1.23]">
              <img src="/launch-ui/report-detail-v2.png" alt="DeVine 상세 리포트의 프로젝트 정보와 핵심 기술 스택 미리보기" loading="lazy" className="block h-auto w-full [mask-image:linear-gradient(to_bottom,black_58%,rgba(0,0,0,0.85)_72%,rgba(0,0,0,0.35)_88%,transparent_100%),linear-gradient(to_right,black_75%,transparent_100%)] [mask-composite:intersect]" />
              <div aria-hidden="true" className="pointer-events-none absolute top-[2.7%] right-[9.3%] bottom-[2.9%] left-[9.4%] rounded-[20px] border border-white/[0.14] [mask-image:linear-gradient(to_bottom,black_58%,transparent_100%),linear-gradient(to_right,black_75%,transparent_100%)] [mask-composite:intersect]" />
              </div>
            </div>
          </div>
        </section>
        <section ref={recommendRef} className="min-h-[100svh] overflow-hidden border-t border-white/[0.06] bg-[#101116] px-[24px] py-[90px] text-[#f5f5f7] [font-family:Pretendard,sans-serif] min-[801px]:px-[32px] min-[801px]:py-[120px]" aria-labelledby="service-recommend-title">
          <div className="mx-auto w-full max-w-[1800px]">
            <div className="mx-auto max-w-[1440px]"><p className={`${textReveal(recommendVisible)} flex items-center gap-[12px] text-[15px] font-semibold tracking-[.08em] text-[#d7d6df] before:h-[16px] before:w-[3px] before:rounded-full before:bg-[#ADA1FA] before:content-['']`}>RECOMMENDATION</p>
            <div className="mt-[26px]">
              <h2 id="service-recommend-title" className="text-[clamp(34px,3vw,50px)] leading-[1.3] font-bold tracking-[-.04em] [word-break:keep-all]"><span className={`${textReveal(recommendVisible)} delay-[160ms] block`}>프로젝트도, 개발자도.</span><span className={`${textReveal(recommendVisible)} delay-[310ms] block`}>더 <span className="text-[#ADA1FA]">적합한 연결</span>을 위해.</span></h2>
              <p className={`${textReveal(recommendVisible)} delay-[360ms] mt-[18px] text-[16px] leading-[1.6] text-[#a8a8b2] [word-break:keep-all] min-[801px]:text-[19px]`}>관심 분야에 맞는 프로젝트를, 프로젝트 리포트를 바탕으로 적합한 개발자를 추천합니다.</p>
            </div>
            </div>
            <div className={`${revealMotion} ${recommendVisible ? 'translate-y-0 opacity-100' : 'translate-y-[20px] opacity-0'} delay-[300ms] mx-auto mt-[32px] w-full max-w-[1440px] min-[801px]:mt-[40px]`}>
              <img src="/launch-ui/recommendation-cluster.png" alt="관심 분야 설정과 추천 프로젝트 화면 미리보기" loading="lazy" className="block h-auto w-full [mask-image:linear-gradient(to_bottom,black_54%,rgba(0,0,0,0.9)_65%,transparent_84%)]" />
            </div>
            <div className="relative mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-y-[28px] pt-[30px] min-[600px]:grid-cols-2 min-[1100px]:grid-cols-4">
              <span aria-hidden="true" className={`pointer-events-none absolute inset-x-0 top-0 h-px origin-left bg-white/[0.08] transition-transform duration-[1200ms] ease-out motion-reduce:scale-x-100 motion-reduce:transition-none ${recommendVisible ? 'scale-x-100' : 'scale-x-0'}`} />
              <article className="min-w-0 min-[600px]:px-[24px] min-[600px]:first:pl-0 min-[1100px]:border-l min-[1100px]:border-white/[0.08] min-[1100px]:first:border-l-0"><h3 className="text-[18px] font-bold">01&nbsp;&nbsp; 관심 분야 설정</h3><p className="mt-[9px] text-[14px] leading-[1.6] text-[#b9bac5] [word-break:keep-all]">프로젝트 추천의 기준이 되는 관심 도메인과 기술 스택</p></article>
              <article className="min-w-0 min-[600px]:px-[24px] min-[1100px]:border-l min-[1100px]:border-white/[0.08]"><h3 className="text-[18px] font-bold">02&nbsp;&nbsp; 추천 프로젝트</h3><p className="mt-[9px] text-[14px] leading-[1.6] text-[#b9bac5] [word-break:keep-all]">관심 분야에 맞춰 추천된 프로젝트 목록</p></article>
              <article className="min-w-0 min-[600px]:px-[24px] min-[1100px]:border-l min-[1100px]:border-white/[0.08]"><h3 className="text-[18px] font-bold">03&nbsp;&nbsp; 추천 개발자</h3><p className="mt-[9px] text-[14px] leading-[1.6] text-[#b9bac5] [word-break:keep-all]">선택한 프로젝트를 기준으로 추천되는 개발자</p></article>
              <article className="min-w-0 min-[600px]:px-[24px] min-[1100px]:border-l min-[1100px]:border-white/[0.08]"><h3 className="text-[18px] font-bold">04&nbsp;&nbsp; 개발자 상세 프로필</h3><p className="mt-[9px] text-[14px] leading-[1.6] text-[#b9bac5] [word-break:keep-all]">추천 결과에서 이어지는 기술 역량과 프로젝트 경험</p></article>
            </div>
          </div>
        </section>
        <section ref={connectionRef} className="min-h-[100svh] overflow-hidden border-t border-white/[0.06] bg-[#101116] px-[24px] py-[90px] text-[#f5f5f7] [font-family:Pretendard,sans-serif] min-[801px]:px-[32px] min-[801px]:py-[120px]" aria-labelledby="service-connection-title">
          <div className="mx-auto w-full max-w-[1440px]">
            <p className={`${textReveal(connectionVisible)} flex items-center gap-[12px] text-[15px] font-semibold tracking-[.08em] text-[#d7d6df] before:h-[16px] before:w-[3px] before:rounded-full before:bg-[#ADA1FA] before:content-['']`}>CONNECTION</p>
            <h2 id="service-connection-title" className="mt-[26px] text-[clamp(34px,3vw,50px)] leading-[1.3] font-bold tracking-[-.04em] [word-break:keep-all]"><span className={`${textReveal(connectionVisible)} delay-[160ms] block`}>지원부터 연결까지.</span><span className={`${textReveal(connectionVisible)} delay-[310ms] block`}><span className="text-[#ADA1FA]">하나의 흐름</span>으로.</span></h2>
            <p className={`${textReveal(connectionVisible)} delay-[360ms] mt-[18px] text-[16px] leading-[1.6] text-[#a8a8b2] [word-break:keep-all] min-[801px]:text-[19px]`}>프로젝트 지원과 개발자 제안, 진행 현황까지.<br className="hidden min-[801px]:block" /> 협업을 위한 모든 연결을 한곳에서 관리하세요.</p>
            <div className={`${revealMotion} ${connectionVisible ? 'translate-y-0 opacity-100' : 'translate-y-[20px] opacity-0'} delay-[420ms] mt-[48px] min-[801px]:mt-[64px]`}>
              <img src="/launch-ui/connection-dashboard-v2.png" alt="프로젝트 지원 현황과 지원 상세 화면 미리보기" loading="lazy" className="block h-auto w-full [mask-image:linear-gradient(to_bottom,black_48%,rgba(0,0,0,0.95)_58%,rgba(0,0,0,0.65)_72%,transparent_92%)]" />
            </div>
          </div>
        </section>
        <section ref={ctaRef} className="flex min-h-[460px] items-center justify-center border-t border-white/[0.06] bg-[#101116] px-[24px] py-[110px] text-center text-[#f5f5f7] [font-family:Pretendard,sans-serif] min-[801px]:min-h-[520px] min-[801px]:py-[140px]" aria-labelledby="service-cta-title">
          <div className="mx-auto max-w-[800px]">
            <h2 id="service-cta-title" className={`${textReveal(ctaVisible)} text-[clamp(32px,3.4vw,52px)] font-bold leading-[1.2] tracking-[-.045em] [word-break:keep-all]`}>함께 만들 다음 프로젝트,<br />지금 찾아보세요.</h2>
            <div className={`${textReveal(ctaVisible)} delay-[200ms] mt-[36px] flex flex-wrap items-center justify-center gap-[12px]`}>
              <a href="/login" target="_top" className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#f5f5f7] px-[24px] text-[14px] font-semibold text-[#191820] transition-colors duration-200 hover:bg-[#e3dfff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ada1fa]">DeVine 시작하기</a>
              <a href="/home" target="_top" className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.06] px-[24px] text-[14px] font-semibold text-[#f5f5f7] transition-colors duration-200 hover:bg-white/[0.12] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ada1fa]">프로젝트 둘러보기</a>
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
      <header className="launch-ui-header px-[24px] min-[801px]:px-[32px]"><Link to="/" aria-label="DeVine 홈" className="inline-flex items-center py-[16px]"><img src={BrandLogo} alt="DeVine" className="h-auto w-[112px]" /></Link></header>
      <div className="launch-ui-page">
        <div id="launch-ui-content-host" ref={hostRef} />
        <Footer />
      </div>
      {root && createPortal(<><style>{baseCss}{'\n'}{introUtilities}{'\n'}{accentCss}{'\n'}{':host{display:block;min-height:100%;font-size:16px;font-family:Inter,system-ui,sans-serif}.launch-content{min-height:100%;background:var(--background);color:var(--foreground)}'}</style><LandingContent /></>, root)}
    </div>
  </>;
}
