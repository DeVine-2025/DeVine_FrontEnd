import React, { useState, useMemo, useCallback } from 'react';
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
      count: count,
      level: calculateLevel(count),
    });
  }
  return fullData;
};

const CustomGithubCalendar = ({
                                data = [],
                                initialYear = new Date().getFullYear(),
                                onYearChange
                              }: CustomGithubCalendarProps) => {

  const [year, setYear] = useState(initialYear);

  const calendarData = useMemo(() => {
    return generateFullYearData(data, year);
  }, [data, year]);

  const moveYear = useCallback((diff: number) => {
    const newYear = year + diff;
    setYear(newYear);
    if (onYearChange) {
      onYearChange(newYear);
    }
  }, [year, onYearChange]);

  const chevronStyle = 'w-7 h-7 text-ui-500';
  const chevronButtonStyle = 'cursor-pointer p-[0.4rem] bg-ui-100 rounded-full';

  return (
    <div className="p-[2rem] border border-ui-200 rounded-xl  inline-block ">
      <style>{`
        .calendar-container > * > :not(:first-child) {
          display: none !important;
        }
        
        .calendar-container text {
          fill: var(--color-ui-700) !important; 
          font-size: 12px;
          font-weight: 600;
        }
      `}</style>

      {/* 헤더 */}
      <div className="flex items-center gap-[1.6rem] mb-[2rem]">
        <button
          onClick={() => moveYear(-1)}
          className={chevronButtonStyle}
        >
          <ChevronLeftIcon className={chevronStyle}/>
        </button>

        <span className="font-bold text-ui-1000 text-2xl select-none">
          {year}년
        </span>

        <button
          onClick={() => moveYear(1)}
          className={chevronButtonStyle}
          disabled={year >= new Date().getFullYear()}
        >
          <ChevronRightIcon className={chevronStyle}/>
        </button>
      </div>

      {/* 캘린더 컨테이너 */}
      <div className="calendar-container">
        <ActivityCalendar
          data={calendarData}
          theme={GITHUB_THEME}
          blockSize={12}
          blockRadius={2}
          blockMargin={3}
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
    </div>
  );
};

export default CustomGithubCalendar;