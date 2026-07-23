import LightLogo from '@assets/icons/logo-light.svg?react';
import DarkLogo from '@assets/icons/logo-dark.svg?react';
import { useThemeStore } from '@store/theme';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const Logo = isDark ? LightLogo : DarkLogo;

  return (
    <footer className="relative left-1/2 w-screen -translate-x-1/2">

      {/* ── 메인 푸터 영역 ── */}
      <div
        className="w-full border-t"
        style={{
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
          background: isDark
            ? 'linear-gradient(180deg, #0d0d12 0%, #0b0b0f 100%)'
            : 'linear-gradient(180deg, #f4f4f6 0%, #efefef 100%)',
        }}
      >
        <div className="mx-auto w-full max-w-[1180px] py-[4.5rem] pl-24 pr-4 md:pl-36 md:pr-6">

          {/* 3컬럼 그리드 */}
          <div className="grid grid-cols-1 gap-[3.25rem] md:grid-cols-2 lg:grid-cols-3">

            {/* 좌: 로고 + 설명 */}
            <div className="flex flex-col gap-[1.25rem]">
              <Logo className="h-[2.85rem] w-auto" style={{ maxWidth: '120px' }} />
              <p className="text-[13px] leading-[1.8] text-[var(--ui-500)]">
                GitHub 분석 기반 개발자 · PM 매칭 플랫폼<br />나에게 맞는 팀원을 만나보세요.
              </p>
            </div>

            {/* 가운데: 서비스 링크 */}
            <div className="flex flex-col gap-[1.25rem]">
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.12em]"
                style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'var(--ui-400)' }}
              >
                서비스
              </p>
              <ul className="flex flex-col gap-[0.9rem]">
                {[
                  { label: '프로젝트/개발자 보기', path: '/search' },
                  { label: '추천 프로젝트/개발자', path: '/recommend' },
                  { label: '리포트', path: '/report' },
                  { label: '서비스 소개', path: '/service' },
                ].map(({ label, path }) => (
                  <li key={path}>
                    <button
                      type="button"
                      onClick={() => navigate(path)}
                      className="group text-[13px] transition-colors duration-200"
                      style={{ color: isDark ? 'rgba(255,255,255,0.55)' : 'var(--ui-600)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'rgba(140,136,255,0.85)')}
                      onMouseLeave={e => (e.currentTarget.style.color = isDark ? 'rgba(255,255,255,0.55)' : 'var(--ui-600)')}
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* 우: 정책 및 정보 */}
            <div className="flex flex-col gap-[1.25rem]">
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.12em]"
                style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'var(--ui-400)' }}
              >
                정책
              </p>
              <ul className="flex flex-col gap-[0.9rem]">
                {[
                  { label: '이용약관', path: '/terms/1' },
                  { label: '개인정보처리방침', path: '/terms/2' },
                ].map(({ label, path }) => (
                  <li key={path}>
                    <button
                      type="button"
                      onClick={() => navigate(path)}
                      className="text-[13px] transition-colors duration-200"
                      style={{ color: isDark ? 'rgba(255,255,255,0.55)' : 'var(--ui-600)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'rgba(140,136,255,0.85)')}
                      onMouseLeave={e => (e.currentTarget.style.color = isDark ? 'rgba(255,255,255,0.55)' : 'var(--ui-600)')}
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 하단 구분선 + 사업자 정보 */}
          <div
            className="mt-[3.5rem] border-t pt-[2.5rem]"
            style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}
          >
            <div className="flex flex-col gap-[0.55rem]">
              <p
                className="text-[11px] leading-[1.85]"
                style={{ color: isDark ? 'rgba(255,255,255,0.25)' : 'var(--ui-400)' }}
              >
                사업체명 : 디바인(DeVine) &nbsp;|&nbsp; 대표자명 : 정우주 &nbsp;|&nbsp; 대표전화 : 010-5349-7050 &nbsp;|&nbsp; 사업자 등록번호 : 743-57-01003 &nbsp;|&nbsp; 통신판매업신고번호: 2026-서울마포-1689
              </p>
              <p
                className="text-[11px] leading-[1.85]"
                style={{ color: isDark ? 'rgba(255,255,255,0.25)' : 'var(--ui-400)' }}
              >
                이메일 : projectdevine2025@gmail.com &nbsp;|&nbsp; 주소 : 서울특별시 마포구 와우산로 105, 5층-J433호 &nbsp;|&nbsp; 도메인: devine.kr
              </p>
              <p
                className="mt-[0.4rem] text-[11px]"
                style={{ color: isDark ? 'rgba(255,255,255,0.2)' : 'var(--ui-300)' }}
              >
                © 2025 DeVine. All rights reserved.
              </p>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
