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
  onLogoClick?: () => void;
};

const getMarkdownHeading = (line: string) => {
  const match = /^(#{1,6})\s+(.+)$/.exec(line.trim());
  if (!match) return null;

  return {
    level: match[1].length,
    text: match[2],
  };
};

const removeMarkdownTextMarkers = (text: string) =>
  text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');

const parseTermsContent = (content: string): ReactNode[] => {
  const contentLines = content.split('\n');
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
      const tableLines: { lineNumber: number; text: string }[] = [];
      while (i < contentLines.length && /^\|.*\|$/.test(contentLines[i].trim())) {
        tableLines.push({ lineNumber: i, text: contentLines[i].trim() });
        i += 1;
      }

      const rows = tableLines
        .map(({ lineNumber, text }) => ({
          lineNumber,
          cells: text
            .slice(1, -1)
            .split('|')
            .map((cell) => removeMarkdownTextMarkers(cell.trim())),
        }))
        .filter(({ cells }) => !cells.every((cell) => /^-+$/.test(cell.replace(/:/g, ''))));

      if (rows.length > 0) {
        const [header, ...body] = rows;
        const headerCells: ReactNode[] = [];
        const bodyCells: ReactNode[] = [];

        for (let cellIndex = 0; cellIndex < header.cells.length; cellIndex += 1) {
          const cell = header.cells[cellIndex];
          headerCells.push(
            <div
              key={`th-${header.lineNumber}-${cellIndex}`}
              className="bg-[var(--ui-50)] px-3 py-2 font-semibold text-[12px] text-[var(--ui-800)]"
            >
              {cell}
            </div>,
          );
        }

        for (const row of body) {
          for (let cellIndex = 0; cellIndex < row.cells.length; cellIndex += 1) {
            const cell = row.cells[cellIndex];
            bodyCells.push(
              <div
                key={`td-${row.lineNumber}-${cellIndex}`}
                className="border-[var(--ui-100)] border-t px-3 py-2 text-[12px] text-[var(--ui-700)]"
              >
                {cell}
              </div>,
            );
          }
        }

        parsedContent.push(
          <div
            key={`table-${i}`}
            className="overflow-hidden rounded-xl border border-[var(--ui-100)]"
          >
            <div
              className="grid"
              style={{ gridTemplateColumns: `repeat(${header.cells.length}, minmax(0, 1fr))` }}
            >
              {headerCells}
              {bodyCells}
            </div>
          </div>,
        );
      }
      continue;
    }

    const heading = getMarkdownHeading(rawLine);
    const displayText = removeMarkdownTextMarkers(heading?.text ?? rawLine);
    const isArticleTitle = heading !== null && heading.level <= 2;
    const isSubsectionTitle = heading !== null && heading.level >= 3;
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
        {displayText}
      </p>,
    );
    i += 1;
  }

  return parsedContent;
};

const TermsDetailScreen = ({
  open,
  title,
  content,
  onClose,
  onLogoClick,
}: TermsDetailScreenProps) => {
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
              if (onLogoClick) {
                onLogoClick();
                return;
              }
              sessionStorage.setItem('show_onboarding_modal', 'true');
              localStorage.removeItem(getUserRoleKey(user?.id ?? null));
              localStorage.removeItem(getUserRoleKey());
              localStorage.removeItem(getProfileImageKey(user?.id ?? null));
              localStorage.removeItem(getProfileImageKey());
              sessionStorage.removeItem('login_provider');
              sessionStorage.removeItem('allow_main_once');
              void signOut().finally(() => navigate('/'));
            }}
            className="flex-items-center cursor-pointer gap-[0.4rem]"
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
