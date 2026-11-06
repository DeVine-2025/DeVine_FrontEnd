import { ArrowRightIcon } from "lucide-react";
import { ReactNode } from "react";

import { siteConfig } from "@pages/landing/launch-ui/config/site";
import { cn } from "@libs/cn";

import { Badge } from "../../ui/badge";
import HorizonBackground from "../../ui/horizon-background";
import { LinkButton, type LinkButtonProps } from "../../ui/link-button";
import { Mockup, MockupFrame } from "../../ui/mockup";
import Screenshot from "../../ui/screenshot";
import { Section } from "../../ui/section";

interface HeroButtonProps extends Omit<LinkButtonProps, "children"> {
  text: string;
}

interface HeroProps {
  title?: ReactNode;
  description?: ReactNode;
  mockup?: ReactNode | false;
  badge?: ReactNode | false;
  buttons?: HeroButtonProps[] | false;
  className?: string;
}

const DEFAULT_HERO_BUTTONS: HeroButtonProps[] = [
  {
    href: "/",
    text: "DeVine 시작하기",
    variant: "default",
  },
  {
    href: "/search/projects",
    text: "프로젝트 둘러보기",
    variant: "glow",
    iconRight: <ArrowRightIcon className="size-4" />,
  },
];

const DEFAULT_HERO_BADGE = (
  <Badge variant="outline" className="animate-appear">
    <span className="text-muted-foreground">
      New version of Launch UI is out!
    </span>
    <a href={siteConfig.getStartedUrl} className="flex items-center gap-1">
      Get started
      <ArrowRightIcon className="size-3" />
    </a>
  </Badge>
);

const DEFAULT_HERO_MOCKUP = (
  <Screenshot
    srcLight="/launch-ui/devine-explore.png"
    srcDark="/launch-ui/devine-explore.png"
    alt="DeVine 프로젝트 탐색 화면 미리보기"
    width={1440}
    height={900}
    loading="eager"
    className="w-full"
  />
);

export default function Hero({
  title = <>코드로 증명하고,<br /><span className="service-hero-accent">데이터로 연결하다.</span></>,
  description = <>GitHub 코드 분석 기반<br />사이드 프로젝트 매칭 플랫폼</>,
  mockup = DEFAULT_HERO_MOCKUP,
  badge = false,
  buttons = DEFAULT_HERO_BUTTONS,
  className,
}: HeroProps) {
  return (
    <Section
      className={cn(
        "fade-bottom overflow-hidden pb-0 sm:pb-0 md:pb-0",
        className,
      )}
    >
      <HorizonBackground />
      <div className="max-w-container mx-auto flex flex-col gap-12 pt-16 sm:gap-24">
        <div className="flex flex-col items-center gap-6 text-center sm:gap-12">
          {badge !== false && badge}
          <h1 className="service-hero-title hero-enter hero-enter-title relative z-10 inline-block">
            {title}
          </h1>
          <p className="text-md hero-enter hero-enter-description text-muted-foreground relative z-10 max-w-[740px] font-medium text-balance sm:text-xl">
            {description}
          </p>
          {buttons !== false && buttons.length > 0 && (
            <div className="hero-enter hero-enter-actions relative z-10 flex justify-center gap-4">
              {buttons.map((button) => (
                <LinkButton
                  key={`${button.href}-${button.text}`}
                  variant={button.variant || "default"}
                  size="lg"
                  href={button.href}
                  icon={button.icon}
                  iconRight={button.iconRight}
                >
                  {button.text}
                </LinkButton>
              ))}
            </div>
          )}
          {mockup !== false && (
            <div className="relative w-full pt-12">
              <MockupFrame
                className="hero-enter hero-enter-preview"
                size="small"
              >
                <Mockup
                  type="responsive"
                  className="bg-background/90 w-full rounded-xl border-0"
                >
                  {mockup}
                </Mockup>
              </MockupFrame>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}

