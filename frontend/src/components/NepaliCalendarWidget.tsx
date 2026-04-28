"use client";

import { useMemo, useState } from "react";
import NepaliDate from "nepali-date-converter";

import { NEPALI_EVENTS } from "@/data/nepaliEvents";

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

const toNepaliNumber = (value: number): string => {
  const digits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
  return String(value)
    .split("")
    .map((char) => (char >= "0" && char <= "9" ? digits[Number(char)] : char))
    .join("");
};

const normalizeDate = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate());

type EventStatus = "upcoming" | "today" | "completed";
type EventFilter = "all" | EventStatus;

interface EventWithMeta {
  id: string;
  name: string;
  bsDate: NepaliDate;
  status: EventStatus;
  remainingDays: number;
}

const getMonthLength = (year: number, month: number): number => {
  const firstDayCurrentMonth = new NepaliDate(year, month, 1).toJsDate();
  const firstDayNextMonth = month === 11 ? new NepaliDate(year + 1, 0, 1).toJsDate() : new NepaliDate(year, month + 1, 1).toJsDate();
  const diffMs = firstDayNextMonth.getTime() - firstDayCurrentMonth.getTime();

  return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

export default function NepaliCalendarWidget({ className = "", showAdDate = true }: NepaliCalendarWidgetProps) {
  const today = useMemo(() => new NepaliDate(), []);
  const todayAd = useMemo(() => normalizeDate(today.toJsDate()), [today]);
  const todayBS = today.getBS();

  const [viewYear, setViewYear] = useState<number>(todayBS.year);
  const [viewMonth, setViewMonth] = useState<number>(todayBS.month);
  const [eventFilter, setEventFilter] = useState<EventFilter>("all");

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

  const monthEvents = useMemo(() => {
    const mapped = NEPALI_EVENTS.map((event): EventWithMeta => {
      const bsDate = new NepaliDate(event.date);
      const eventAd = normalizeDate(bsDate.toJsDate());
      const diffDays = Math.round((eventAd.getTime() - todayAd.getTime()) / (1000 * 60 * 60 * 24));

      let status: EventStatus = "upcoming";
      if (diffDays === 0) {
        status = "today";
      } else if (diffDays < 0) {
        status = "completed";
      }

      return {
        id: `${event.name}-${event.date}`,
        name: event.name,
        bsDate,
        status,
        remainingDays: diffDays
      };
    })
      .filter((event) => {
        const bs = event.bsDate.getBS();
        return bs.year === viewYear && bs.month === viewMonth;
      })
      .sort((a, b) => {
        const rank = (value: EventStatus): number => {
          if (value === "today") {
            return 0;
          }

          if (value === "upcoming") {
            return 1;
          }

          return 2;
        };

        const rankDiff = rank(a.status) - rank(b.status);
        if (rankDiff !== 0) {
          return rankDiff;
        }

        if (a.status === "completed" && b.status === "completed") {
          return b.remainingDays - a.remainingDays;
        }

        return a.remainingDays - b.remainingDays;
      });

    return mapped;
  }, [todayAd, viewMonth, viewYear]);

  const [showOnlyUpcoming, setShowOnlyUpcoming] = useState(false);

  const visibleEvents = useMemo(() => {
    const filteredEvents = showOnlyUpcoming ? monthEvents.filter((event) => event.status !== "completed") : monthEvents;

    if (eventFilter === "all") {
      return filteredEvents;
    }

    return filteredEvents.filter((event) => event.status === eventFilter);
  }, [eventFilter, monthEvents, showOnlyUpcoming]);

  const nearestUpcomingEventId = useMemo(() => {
    const nearest = monthEvents.find((event) => event.status === "today" || event.status === "upcoming");
    return nearest?.id ?? null;
  }, [monthEvents]);

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
    <section className={`grid gap-4 md:grid-cols-[1.2fr,0.8fr] ${className}`}>
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
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
      </div>

      <aside className="rounded-3xl border border-rose-200 bg-linear-to-b from-rose-50 to-white p-3.5 shadow-sm sm:p-4 md:p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-700">Calendar, Events & Festivals</p>
            <p className="text-xs text-slate-500">{calendarMeta.titleNp}</p>
          </div>
          <button
            type="button"
            onClick={() => setShowOnlyUpcoming((prev) => !prev)}
            className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50"
          >
            {showOnlyUpcoming ? "सबै" : "Upcoming"}
          </button>
        </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { key: "all" as const, label: "All" },
              { key: "today" as const, label: "Today" },
              { key: "upcoming" as const, label: "Upcoming" },
              { key: "completed" as const, label: "Festivals" }
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setEventFilter(item.key)}
                className={`rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] transition ${
                  eventFilter === item.key
                    ? "bg-rose-700 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-rose-200 hover:bg-rose-50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

        <div className="space-y-2.5">
          {visibleEvents.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-center text-xs text-slate-500">
              यो महिनामा कुनै चाडपर्व सूची छैन।
            </div>
          )}

          {visibleEvents.map((event) => {
            const isNearestUpcoming = event.id === nearestUpcomingEventId;
            const bs = event.bsDate.getBS();

            let statusText = "सम्पन्न";
            if (event.status === "today") {
              statusText = "आज";
            } else if (event.status === "upcoming") {
              statusText = `${toNepaliNumber(event.remainingDays)} दिन बाँकी`;
            }

            return (
              <article
                key={event.id}
                className={`rounded-xl border bg-white p-3 transition hover:-translate-y-0.5 hover:shadow-sm ${
                  isNearestUpcoming
                    ? "border-rose-300 shadow-[inset_0_0_0_1px_rgba(225,29,72,0.15)]"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-black text-slate-900">{event.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {MONTHS_NP[bs.month]} {toNepaliNumber(bs.date)}, {toNepaliNumber(bs.year)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${
                      event.status === "today"
                        ? "bg-rose-100 text-rose-700"
                        : event.status === "upcoming"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {statusText}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </aside>
    </section>
  );
}
