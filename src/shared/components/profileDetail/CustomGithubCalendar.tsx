import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ActivityCalendar, type Activity, type ThemeInput } from 'react-activity-calendar';
import ChevronRightIcon from "@assets/icons/chevron-right.svg?react";
import ChevronLeftIcon from "@assets/icons/chevron-left.svg?react";

export interface Contribution {
  date: string;
  count: number;
}

interface CustomGithubCalendarProps {
  data?: Contribution[];
  initialYear?: number;
  year?: number;
  onYearChange?: (year: number) => void;
  heading?: string;
  beforeCalendar?: React.ReactNode;
  afterCalendar?: React.ReactNode;
}

const DEVINE_ACTIVITY_THEME: ThemeInput = {
  light: ['#eeedf3', '#dfd9ff', '#b8adff', '#8272fa', '#6654f5'],
  dark: ['#1c1e27', '#39305f', '#57469a', '#7b68e2', '#a69bff'],
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
      count: count,
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
  heading,
  beforeCalendar,
  afterCalendar,
}: CustomGithubCalendarProps) => {
  const [internalYear, setInternalYear] = useState(initialYear);
  // year prop이 있으면 prop을 사용하고, 없으면 내부 상태 사용
  const year = yearProp !== undefined ? yearProp : internalYear;

  // year prop이 변경되면 내부 상태도 동기화
  useEffect(() => {
    if (yearProp !== undefined) {
      setInternalYear(yearProp);
    }
  }, [yearProp]);

  const calendarData = useMemo(() => {
    return generateFullYearData(data, year);
  }, [data, year]);

  const moveYear = useCallback((diff: number) => {
    const newYear = year + diff;
    // year prop이 없으면 내부 상태 업데이트
    if (yearProp === undefined) {
      setInternalYear(newYear);
    }
    if (onYearChange) {
      onYearChange(newYear);
    }
  }, [year, yearProp, onYearChange]);

  const chevronStyle = 'w-7 h-7 text-ui-500';
  const chevronButtonStyle = 'cursor-pointer p-[0.4rem] bg-ui-100 rounded-full';

  return (
    <div className="p-[2rem] border border-ui-200 rounded-xl w-full">
      <style>{`
        .calendar-container text {
          fill: var(--color-ui-700) !important;
          font-size: 12px;
          font-weight: 600;
        }

        .calendar-container .react-activity-calendar__calendar {
          width: 100% !important;
          height: auto !important;
        }
      `}</style>

      {/* 헤더 */}
      <div className="github-calendar-header">
        {heading && <h2>{heading}</h2>}
        <div className="github-calendar-year flex items-center gap-[1.6rem] mb-[2rem]">
          <button
            type="button"
            aria-label="이전 연도"
            onClick={() => moveYear(-1)}
            className={chevronButtonStyle}
          >
            <ChevronLeftIcon className={chevronStyle} />
          </button>

          <span className="font-bold text-ui-1000 text-2xl select-none">
            {year}년
          </span>

          <button
            type="button"
            aria-label="다음 연도"
            onClick={() => moveYear(1)}
            className={chevronButtonStyle}
            disabled={year >= new Date().getFullYear()}
          >
            <ChevronRightIcon className={chevronStyle} />
          </button>
        </div>
      </div>

      {beforeCalendar}
      {/* 캘린더 컨테이너 */}
      <div className={afterCalendar ? 'rounded-xl border border-white/[0.08] bg-white/[0.015] p-4 sm:p-5' : undefined}>
      <div key={heading ? year : undefined} className={heading ? 'calendar-container calendar-container-animated' : 'calendar-container'}>
        <ActivityCalendar
          data={calendarData}
          theme={DEVINE_ACTIVITY_THEME}
          colorScheme="dark"
          showWeekdayLabels={heading ? ['mon', 'wed', 'fri'] : false}
          showTotalCount={false}
          showColorLegend={Boolean(heading)}
          blockSize={12}
          blockRadius={2}
          blockMargin={4}
          labels={{
            months: [
              '1월', '2월', '3월', '4월', '5월', '6월',
              '7월', '8월', '9월', '10월', '11월', '12월'
            ],
            weekdays: [
              '일', '월', '화', '수', '목', '금', '토'
            ],
          }}
        />
      </div>
      {afterCalendar}
      </div>
    </div>
  );
};

export default CustomGithubCalendar;
