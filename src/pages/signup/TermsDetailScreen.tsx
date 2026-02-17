import ChevronLeftIcon from '@assets/icons/chevron-left.svg?react';
import LogoDark from '@assets/icons/logo-dark.svg?react';
import LogoLight from '@assets/icons/logo-light.svg?react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useThemeStore } from '@store/theme';
import { getProfileImageKey, getUserRoleKey } from '@utils/storage';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

type TermsDetailScreenProps = {
  open: boolean;
  title: string;
  content: string;
  onClose: () => void;
};

const SECTION_TITLES = new Set([
  'Devine 서비스 이용약관',
  'Devine 개인정보 처리방침',
  '부칙',
  '1. 개인정보의 처리 목적',
  '2. 처리하는 개인정보의 항목',
  '3. 개인정보의 처리 및 보유기간',
  '4. 개인정보의 제3자 제공',
  '5. 개인정보 처리업무의 위탁',
  '6. 개인정보의 국외 이전',
  '7. 개인정보의 파기 절차 및 방법',
  '8. 개인정보 자동 수집 장치의 설치·운영 및 거부',
  '9. 정보주체의 권리·의무 및 행사방법',
  '10. 개인정보의 안전성 확보조치',
  '11. 개인정보 보호책임자',
  '12. 정보주체의 권익침해에 대한 구제방법',
  '13. 개인정보 처리방침의 변경',
  '14. 서비스 특화 개인정보 처리사항',
  '1. 마케팅 정보 수신 동의 (선택)',
  '2. 맞춤형 광고 제공 동의 (선택)',
  '3. 서비스 분석 및 개선을 위한 정보 활용 동의 (선택)',
  '4. GitHub 추가 정보 수집 동의 (선택 - 개발자 회원만 해당)',
  '5. 개인정보 제3자 제공 동의 (선택)',
  '동의 철회 안내',
  '중요 안내사항',
  'Devine 개인정보 수집·이용 동의서 (선택)',
]);

const parseTermsContent = (content: string): ReactNode[] => {
  const sanitizedContent = content.replace(/[#*]/g, '');
  const contentLines = sanitizedContent.split('\n');
  const parsedContent: ReactNode[] = [];
  let i = 0;

  while (i < contentLines.length) {
    const rawLine = contentLines[i];
    const trimmedLine = rawLine.trim();

    if (!trimmedLine) {
      parsedContent.push(<div key={`spacer-${i}`} className="h-2" />);
      i += 1;
      continue;
    }

    const isTableLine = /^\|.*\|$/.test(trimmedLine);
    if (isTableLine) {
      const tableLines: string[] = [];
      while (i < contentLines.length && /^\|.*\|$/.test(contentLines[i].trim())) {
        tableLines.push(contentLines[i].trim());
        i += 1;
      }

      const rows = tableLines
        .map((line) =>
          line
            .slice(1, -1)
            .split('|')
            .map((cell) => cell.trim()),
        )
        .filter((cells) => !cells.every((cell) => /^-+$/.test(cell.replace(/:/g, ''))));

      if (rows.length > 0) {
        const [header, ...body] = rows;
        parsedContent.push(
          <div
            key={`table-${i}`}
            className="overflow-hidden rounded-xl border border-[var(--ui-100)]"
          >
            <div
              className="grid"
              style={{ gridTemplateColumns: `repeat(${header.length}, minmax(0, 1fr))` }}
            >
              {header.map((cell, idx) => (
                <div
                  key={`th-${idx}`}
                  className="bg-[var(--ui-50)] px-3 py-2 font-semibold text-[12px] text-[var(--ui-800)]"
                >
                  {cell}
                </div>
              ))}
              {body.flatMap((row, rowIndex) =>
                row.map((cell, cellIndex) => (
                  <div
                    key={`td-${rowIndex}-${cellIndex}`}
                    className="border-[var(--ui-100)] border-t px-3 py-2 text-[12px] text-[var(--ui-700)]"
                  >
                    {cell}
                  </div>
                )),
              )}
            </div>
          </div>,
        );
      }
      continue;
    }

    const isArticleTitle = /^제\s*\d+\s*조/.test(trimmedLine) || SECTION_TITLES.has(trimmedLine);
    const isSubsectionTitle = /^\d+\)\s/.test(trimmedLine);
    parsedContent.push(
      <p
        key={`line-${i}`}
        className={
          isArticleTitle
            ? 'font-semibold text-[22px] text-[var(--ui-1000)]'
            : isSubsectionTitle
              ? 'font-semibold text-[16px] text-[var(--ui-700)]'
              : 'text-[14px] text-[var(--ui-700)]'
        }
      >
        {rawLine}
      </p>,
    );
    i += 1;
  }

  return parsedContent;
};

const TermsDetailScreen = ({ open, title, content, onClose }: TermsDetailScreenProps) => {
  const { theme } = useThemeStore();
  const { signOut } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const backgroundStyle =
    theme === 'dark'
      ? {
          backgroundColor: 'var(--ui-bg)',
          backgroundImage:
            'radial-gradient(circle at top center, rgba(78,73,255,0.18) 0%, rgba(78,73,255,0.08) 25%, rgba(78,73,255,0) 70%)',
        }
      : {
          backgroundColor: 'var(--ui-bg)',
          backgroundImage:
            'radial-gradient(circle at top center, rgba(78,73,255,0.2) 0%, rgba(78,73,255,0.06) 25%, rgba(78,73,255,0) 70%)',
        };

  if (!open) return null;

  const parsedContent = parseTermsContent(content);

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto" style={backgroundStyle}>
      <div className="-translate-x-1/2 absolute top-0 left-1/2 h-[6rem] w-screen">
        <div className="mx-auto flex h-full max-w-[144rem] items-center px-[12rem]">
          <button
            type="button"
            onClick={() => {
              sessionStorage.setItem('show_onboarding_modal', 'true');
              localStorage.removeItem(getUserRoleKey(user?.id ?? null));
              localStorage.removeItem(getUserRoleKey());
              localStorage.removeItem(getProfileImageKey(user?.id ?? null));
              localStorage.removeItem(getProfileImageKey());
              sessionStorage.removeItem('login_provider');
              sessionStorage.removeItem('allow_main_once');
              void signOut().finally(() => navigate('/'));
            }}
            className="flex-items-center gap-[0.4rem]"
            aria-label="메인으로 이동"
          >
            {theme === 'dark' ? <LogoLight aria-hidden="true" /> : <LogoDark aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div className="mx-auto my-[100px] w-full max-w-[632px]">
        <header className="flex items-center gap-3 text-[var(--ui-1000)]">
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--ui-500)] hover:text-[var(--ui-900)]"
            aria-label="약관 닫기"
          >
            <ChevronLeftIcon className="h-8 w-8 cursor-pointer" aria-hidden="true" />
          </button>
          <h2 className="font-semibold text-[23px]">{title}</h2>
        </header>

        <div className="mt-6 flex max-h-[calc(70vh)] flex-col rounded-[32px] bg-[var(--ui-bg)] p-10 shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
          <div className="min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap rounded-3xl bg-[var(--ui-bg)] px-8 py-6 pb-12 text-[14px] text-[var(--ui-700)] leading-7">
            <div className="mx-auto flex max-w-[640px] flex-col gap-5">{parsedContent}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsDetailScreen;
