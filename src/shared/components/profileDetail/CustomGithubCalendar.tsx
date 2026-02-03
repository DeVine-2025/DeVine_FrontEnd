import { useEffect, useState } from 'react';
import { GitHubCalendar } from 'react-github-calendar';
import dayjs from 'dayjs';

const CustomGithubCalendar = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [isMobile, setIsMobile] = useState(false);

  /* ---------------- 모바일 대응 ---------------- */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const blockSize = isMobile ? 10 : 14;
  const blockMargin = isMobile ? 4 : 6;

  /* ---------------- 월 시작 주 계산 ---------------- */
  const getMonthStartWeekIndex = (month: number) => {
    const yearStart = dayjs(`${year}-01-01`).startOf('week');
    const monthStart = dayjs(
      `${year}-${String(month).padStart(2, '0')}-01`
    );

    return monthStart.diff(yearStart, 'week');
  };

  /* ---------------- 월 라벨 렌더 ---------------- */
  const renderMonthLabels = () => (
    <div className="relative h-6 mb-2">
      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
        const weekIndex = getMonthStartWeekIndex(month);
        const left = weekIndex * (blockSize + blockMargin);

        return (
          <span
            key={month}
            className="absolute text-sm text-gray-400 whitespace-nowrap"
            style={{ left }}
          >
            {month}월
          </span>
        );
      })}
    </div>
  );

  return (
    <div className="rounded-2xl bg-black p-6">
      {/* ---------- 연도 헤더 ---------- */}
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => setYear((y) => y - 1)}
          className="text-gray-400 hover:text-white"
        >
          ‹
        </button>

        <h2 className="text-xl font-bold text-white">{year}년</h2>

        <button
          onClick={() => setYear((y) => y + 1)}
          className="text-gray-400 hover:text-white"
        >
          ›
        </button>
      </div>

      {/* ---------- 캘린더 ---------- */}
      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          {renderMonthLabels()}

          <GitHubCalendar
            username="your-github-id"
            hideMonthLabels
            hideColorLegend
            blockSize={blockSize}
            blockMargin={blockMargin}
            transformData={(data) =>
              data.filter((activity) =>
                activity.date.startsWith(String(year))
              )
            }
          />
        </div>
      </div>
    </div>
  );
};

export default CustomGithubCalendar;
