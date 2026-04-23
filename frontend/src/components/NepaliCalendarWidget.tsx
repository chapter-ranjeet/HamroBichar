"use client";

import { useMemo, useState } from "react";
import NepaliDate from "nepali-date-converter";

interface NepaliCalendarWidgetProps {
  className?: string;
  showAdDate?: boolean;
}

const WEEK_DAYS_NP = ["आइत", "सोम", "मंगल", "बुध", "बिहि", "शुक्र", "शनि"];
const MONTHS_NP = [
  "बैशाख",
  "जेठ",
  "असार",
  "साउन",
  "भदौ",
  "असोज",
  "कार्तिक",
  "मंसिर",
  "पुष",
  "माघ",
  "फागुन",
  "चैत"
];

const getMonthLength = (year: number, month: number): number => {
  const firstDayCurrentMonth = new NepaliDate(year, month, 1).toJsDate();
  const firstDayNextMonth = month === 11 ? new NepaliDate(year + 1, 0, 1).toJsDate() : new NepaliDate(year, month + 1, 1).toJsDate();
  const diffMs = firstDayNextMonth.getTime() - firstDayCurrentMonth.getTime();

  return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

export default function NepaliCalendarWidget({ className = "", showAdDate = true }: NepaliCalendarWidgetProps) {
  const today = useMemo(() => new NepaliDate(), []);
  const todayBS = today.getBS();

  const [viewYear, setViewYear] = useState<number>(todayBS.year);
  const [viewMonth, setViewMonth] = useState<number>(todayBS.month);

  const calendarMeta = useMemo(() => {
    const monthStart = new NepaliDate(viewYear, viewMonth, 1);
    const startDay = monthStart.getDay();
    const daysInMonth = getMonthLength(viewYear, viewMonth);
    const requiredCells = startDay + daysInMonth;
    const totalCells = requiredCells <= 35 ? 35 : 42;

    return {
      startDay,
      daysInMonth,
      totalCells,
      titleNp: `${MONTHS_NP[viewMonth]} ${viewYear}`,
      titleEn: monthStart.format("MMMM YYYY", "en")
    };
  }, [viewMonth, viewYear]);

  const goToPreviousMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
      return;
    }

    setViewMonth((prev) => prev - 1);
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
      return;
    }

    setViewMonth((prev) => prev + 1);
  };

  return (
    <section className={`rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-700">आजको मिति</p>
          <p className="mt-1 text-base font-black text-slate-900">{today.format("ddd, DD MMMM YYYY", "np")}</p>
          <p className="text-xs text-slate-500">{today.toJsDate().toLocaleDateString()}</p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={goToPreviousMonth}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-black text-slate-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
            aria-label="Previous Nepali month"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={goToNextMonth}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-black text-slate-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
            aria-label="Next Nepali month"
          >
            ›
          </button>
        </div>
      </div>

      <div className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
        <p className="text-sm font-extrabold text-slate-900">{calendarMeta.titleNp}</p>
        <p className="text-xs font-medium text-slate-500">{calendarMeta.titleEn}</p>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-black text-slate-500">
        {WEEK_DAYS_NP.map((day) => (
          <div key={day} className="rounded-md bg-slate-100 py-1.5">
            {day}
          </div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1.5">
        {Array.from({ length: calendarMeta.totalCells }).map((_, index) => {
          const dayNumber = index - calendarMeta.startDay + 1;
          const isInMonth = dayNumber >= 1 && dayNumber <= calendarMeta.daysInMonth;

          if (!isInMonth) {
            return <div key={`empty-${index}`} className="h-12 rounded-lg border border-transparent bg-transparent" aria-hidden="true" />;
          }

          const bsDate = new NepaliDate(viewYear, viewMonth, dayNumber);
          const isToday =
            viewYear === todayBS.year && viewMonth === todayBS.month && dayNumber === todayBS.date;

          return (
            <div
              key={`day-${dayNumber}`}
              className={`h-12 rounded-lg border p-1 text-right transition ${
                isToday
                  ? "border-rose-300 bg-rose-50 shadow-[inset_0_0_0_1px_rgba(225,29,72,0.15)]"
                  : "border-slate-200 bg-white hover:border-rose-200 hover:bg-rose-50/70"
              }`}
            >
              <p className={`text-xs font-black ${isToday ? "text-rose-700" : "text-slate-800"}`}>{dayNumber}</p>
              {showAdDate && <p className="text-[10px] font-medium text-slate-400">{bsDate.toJsDate().getDate()}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
