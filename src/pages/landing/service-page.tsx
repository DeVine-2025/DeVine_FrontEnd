import { useEffect, type ReactNode } from 'react';
import { landingImages } from '@assets/images/landing';
import {cn} from '@libs/cn';

interface SectionLabelProps {
  index: string;
}

const SectionLabel = ({index}: SectionLabelProps) => {
  return (
    <p className="w-fit justify-start rounded-2xl border border-white/30 bg-blend-linear-dodge bg-indigo-800/30 px-[2rem] py-[1.2rem] text-center font-bold text-3xl text-badge-text-primary">{index}</p>
  )
}

interface RevealImageProps {
  src: string;
  alt: string;
  className?: string;
  delayMs?: number;
}

const RevealImage = ({ src, alt, className, delayMs = 0 }: RevealImageProps) => {
  return (
    <img
      src={src}
      alt={alt}
      data-scroll-reveal="image"
      style={{ transitionDelay: `${delayMs}ms` }}
      className={cn('scroll-reveal', className)}
    />
  );
};

interface RevealTextProps {
  children: ReactNode;
  direction?: 'left' | 'right';
  className?: string;
  delayMs?: number;
}

const RevealText = ({ children, direction = 'left', className, delayMs = 0 }: RevealTextProps) => {
  return (
    <div
      data-scroll-reveal="text"
      style={{ transitionDelay: `${delayMs}ms` }}
      className={cn('scroll-reveal-text', direction === 'left' ? 'from-left' : 'from-right', className)}
    >
      {children}
    </div>
  );
};

const ServicePage = () => {
  const landingImage: string[] = Object.values(landingImages);
  const textColor = "text-[#F8F9FB]"

  useEffect(() => {
    const rootEl = document.getElementById('root') as HTMLElement | null;
    let prevMaxWidth: string | undefined;

    if (rootEl) {
      prevMaxWidth = rootEl.style.maxWidth;
      rootEl.style.maxWidth = 'none';
    }

    const revealEls = Array.from(
      document.querySelectorAll<HTMLElement>('[data-scroll-reveal="image"], [data-scroll-reveal="text"]'),
    );

    let observer: IntersectionObserver | null = null;
    if (revealEls.length > 0) {
      observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          });
        },
        {
          threshold: 0.1,
          rootMargin: '0px 0px -5% 0px',
        },
      );

      revealEls.forEach((el) => observer?.observe(el));
    }

    return () => {
      observer?.disconnect();
      if (rootEl && typeof prevMaxWidth === 'string') {
        rootEl.style.maxWidth = prevMaxWidth;
      }
    };
  }, []);

  return (
    <div
      className="min-h-screen w-full bg-[#121212]"
      style={{
        backgroundImage:
          'linear-gradient(180deg, rgba(78, 73, 255, 0.2) 0%, rgba(0, 0, 0, 0) 100%)',
      }}
    >
      <div className="mx-auto w-full max-w-[1080px] flex-col gap-[20rem] px-[8rem]">

        <section className="flex-col gap-[4rem] pt-[12rem]">
          <RevealImage className="w-[30rem]" src={landingImage[0]} alt="랜딩페이지 아이콘" delayMs={0} />
          <div>
            <RevealText direction="left" className="flex-col gap-[2rem]" delayMs={0}>
              <p
                className="w-fit bg-gradient-to-r from-[#D4DAE7] to-[#4E49FF] bg-clip-text font-normal text-3xl text-transparent">
                코드로 증명하고, 데이터로 연결하다.
              </p>
              <p className={cn('font-[\'Pretendard\'] font-bold text-6xl leading-[60px]', textColor)}>GitHub 코드 분석
                기반<br />
                사이드 프로젝트 매칭 플랫폼</p>
            </RevealText>
            <RevealImage src={landingImage[1]} alt="노트북 이미지" delayMs={60} />
          </div>
        </section>

        <section className="relative flex-col gap-[14rem]">
          <RevealText direction="left" className="relative z-10 flex-col gap-[3.8rem]" delayMs={0}>
            <p className={cn('font-bold text-4xl', textColor)}>"사이드 프로젝트 매칭, 왜 이렇게 어려울까요?”</p>
            <p className={cn('text-3xl', textColor)}>개발자는 수많은 프로젝트 게시글 속에서 자신의 실력과 관심사에 맞는 프로젝트를 찾기 어렵고, PM은 지원자의
              GitHub를 봐도
              실력을 판단할 수 없어 자신의 프로젝트에 적합한 개발자를 찾기 힘듭니다. 그 결과 오랜 시간 탐색하고 매칭되더라도 미스 매치가 반복되고 있었어요.</p>
          </RevealText>
          <RevealText direction="right" className="relative z-10 flex-col gap-[3.8rem] pb-[10rem]" delayMs={80}>
            <p className={cn('font-bold text-4xl', textColor)}>"Devine은 이 문제를 데이터로 해결합니다”</p>
            <p className={cn('text-3xl', textColor)}>Devine은 GitHub의 실제 코드를 AI가 분석하여 리포트를 제공합니다.
              그리고 이 리포트를 바탕으로 개발자와 프로젝트를 추천합니다.</p>
          </RevealText>
        </section>

        <section>
          <div className="flex-col items-center gap-[4rem]">
            <RevealText direction="left" className="flex-col items-center gap-[4rem]" delayMs={0}>
              <SectionLabel index={'리포트'} />
              <p className={cn('text-center font-bold text-4xl leading-[35px]', textColor)}>
                GitHub 로그인 후<br />
                원하는 내 프로젝트를 선택하고,<br />
                AI가 분석한 리포트를 받아보세요<br />
              </p>
            </RevealText>
            <div className="relative">
              <RevealImage src={landingImage[2]} className="absolute top-20 z-0 w-220" alt="프로젝트 분석 리포트" delayMs={120} />
              <RevealImage src={landingImage[3]} className="absolute right-0 z-0 w-220" alt="프로젝트 분석 리포트" delayMs={180} />
              <RevealImage src={landingImage[4]} className="relative z-10 pt-60" alt="프로젝트 분석 리포트" delayMs={240} />
            </div>
          </div>
        </section>

        <section>
          <div className="flex-col items-center gap-[4rem]">
            <RevealText direction="right" className="flex-col items-center gap-[4rem]" delayMs={0}>
              <SectionLabel index={'추천 프로젝트/개발자'} />
              <p className={cn('text-center font-bold text-4xl leading-[35px]', textColor)}>
                나에게 딱 맞는 프로젝트와 개발자를 <br />
                추천 받아보세요
              </p>
            </RevealText>
            <div className="relative">
              <RevealImage src={landingImage[5]} className="absolute top-0 left-0 w-300" alt="프로젝트 분석 리포트" delayMs={300} />
              <RevealImage src={landingImage[6]} className="absolute top-70 right-0 w-300" alt="프로젝트 분석 리포트" delayMs={360} />
              <RevealImage src={landingImage[7]} className="relative mx-auto mt-140" alt="프로젝트 분석 리포트" delayMs={420} />
            </div>
          </div>
        </section>

        <section>
          <div className="flex-col items-center gap-[4rem]">
            <RevealText direction="left" className="flex-col items-center gap-[4rem]" delayMs={0}>
              <SectionLabel index={'프로젝트 참여 제안'} />
              <p className={cn('text-center font-bold text-4xl leading-[35px]', textColor)}>
                더 이상 개발자의 지원을 기다리기만 하지 마세요! <br />
                DeVine에서는 PM이 먼저 개발자에게<br />
                프로젝트 참여를 제안할 수 있습니다<br />
              </p>
            </RevealText>
            <div className="relative">
              <RevealImage src={landingImage[8]} alt="프로젝트 분석 리포트" delayMs={480} />
              <RevealImage src={landingImage[11]} className="absolute top-160 right-5 w-30" alt="프로젝트 분석 리포트" delayMs={540} />
            </div>
          </div>
        </section>

        <section className="flex-col items-start gap-[4rem]">
          <RevealText direction="right" className="flex-col gap-[4rem]" delayMs={0}>
            <p className={cn('text-3xl leading-[30px]', textColor)}>
              <span className="font-bold">DeVine</span>은<br />
              "어떤 프로젝트가 나한테 맞을까?" 고민하는 개발자와<br />
              "이 개발자가 우리 프로젝트에 적합할까?" 궁금한 PM을 연결합니다.<br />
            </p>
            <p className={cn('text-3xl leading-[30px]', textColor)}>
              작성한 코드를 AI가 분석해 메인 리포트와 상세 리포트를 여러분께<br />
              제공합니다. 개발자는 기술 스택과 성장 방향성을, PM은 개발자의<br />
              핵심 역량을 객관적으로 확인할 수 있습니다.
            </p>
            <p className={cn('text-3xl leading-[30px]', textColor)}>
              더 이상 불완전한 정보로 시간 낭비하지 마세요.<br />
              DeVine이 제공하는 리포트로 최적의 매칭을 찾아보세요.<br />
              코드로 증명하는 사이드 프로젝트 매칭, <span className="font-bold">DeVine</span>입니다.
            </p>
          </RevealText>
          <div className="relative h-290 w-full">
            <RevealImage src={landingImage[9]} className="w-56" alt="프로젝트 분석 리포트" delayMs={600} />
            <RevealImage src={landingImage[10]} className="absolute top-10 right-0" alt="프로젝트 분석 리포트" delayMs={660} />
          </div>
        </section>
      </div>
    </div>
  );
};

export default ServicePage;