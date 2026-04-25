import ChevronLeftIcon from '@assets/icons/chevron-left.svg?react';
import ChevronRightIcon from '@assets/icons/chevron-right.svg?react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityCalendar, type Activity, type ThemeInput } from 'react-activity-calendar';

export interface Contribution {
  date: string;
  count: number;
}

interface CustomGithubCalendarProps {
  data?: Contribution[];
  initialYear?: number;
  year?: number;
  onYearChange?: (year: number) => void;
}

const GITHUB_THEME: ThemeInput = {
  light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
  dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
};

const calculateLevel = (count: number): 0 | 1 | 2 | 3 | 4 => {
  if (count === 0) return 0;
  if (count < 3) return 1;
  if (count < 6) return 2;
  if (count < 9) return 3;
  return 4;
};

const generateFullYearData = (apiData: Contribution[] | undefined, year: number): Activity[] => {
  const fullData: Activity[] = [];
  const startDate = new Date(`${year}-01-01`);
  const endDate = new Date(`${year}-12-31`);
  const safeData = apiData || [];
  const dataMap = new Map(safeData.map((item) => [item.date, item.count]));

  for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const count = dataMap.get(dateStr) || 0;
    fullData.push({
      date: dateStr,
      count,
      level: calculateLevel(count),
    });
  }
  return fullData;
};

const CustomGithubCalendar = ({
  data = [],
  initialYear = new Date().getFullYear(),
  year: yearProp,
  onYearChange,
}: CustomGithubCalendarProps) => {
  const [internalYear, setInternalYear] = useState(initialYear);
  const year = yearProp !== undefined ? yearProp : internalYear;

  useEffect(() => {
    if (yearProp !== undefined) {
      setInternalYear(yearProp);
    }
  }, [yearProp]);

  const calendarData = useMemo(() => {
    return generateFullYearData(data, year);
  }, [data, year]);

  const moveYear = useCallback(
    (diff: number) => {
      const newYear = year + diff;
      if (yearProp === undefined) {
        setInternalYear(newYear);
      }
      if (onYearChange) {
        onYearChange(newYear);
      }
    },
    [year, yearProp, onYearChange],
  );

  const chevronStyle = 'w-7 h-7 text-ui-500';
  const chevronButtonStyle = 'cursor-pointer p-[0.4rem] bg-ui-100 rounded-full';

  return (
    <div className="w-full rounded-xl border border-ui-200 p-[2rem]">
      <style>{`
        .calendar-container > * > :not(:first-child) {
          display: none !important;
        }

        .calendar-container text {
          fill: var(--color-ui-700) !important;
          font-size: 12px;
          font-weight: 600;
        }

        .calendar-container svg {
          width: 100% !important;
          height: auto !important;
        }
      `}</style>

      <div className="mb-[2rem] flex items-center gap-[1.6rem]">
        <button type="button" onClick={() => moveYear(-1)} className={chevronButtonStyle}>
          <ChevronLeftIcon className={chevronStyle} />
        </button>

        <span className="select-none font-bold text-2xl text-ui-1000">{year}년</span>

        <button
          type="button"
          onClick={() => moveYear(1)}
          className={chevronButtonStyle}
          disabled={year >= new Date().getFullYear()}
        >
          <ChevronRightIcon className={chevronStyle} />
        </button>
      </div>

      <div className="calendar-container">
        <ActivityCalendar
          data={calendarData}
          theme={GITHUB_THEME}
          blockSize={12}
          blockRadius={2}
          blockMargin={4}
          labels={{
            months: [
              '1월',
              '2월',
              '3월',
              '4월',
              '5월',
              '6월',
              '7월',
              '8월',
              '9월',
              '10월',
              '11월',
              '12월',
            ],
            weekdays: ['일', '월', '화', '수', '목', '금', '토'],
          }}
        />
      </div>
    </div>
  );
};

export default CustomGithubCalendar;
