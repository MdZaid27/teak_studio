"use client";

import React, { useState, useMemo } from "react";

export interface AtelierCalendarProps {
  value: string; // ISO format: "YYYY-MM-DD"
  onChange: (dateStr: string) => void;
  minDate?: Date;
  className?: string;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function AtelierCalendar({
  value,
  onChange,
  minDate,
  className = "",
}: AtelierCalendarProps) {
  const effectiveMinDate = useMemo(() => {
    if (minDate) {
      return new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
    }
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [minDate]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Initialize view to selected date, or to effectiveMinDate
  const [viewYear, setViewYear] = useState(() => {
    if (value) {
      const parts = value.split("-").map(Number);
      if (parts[0]) return parts[0];
    }
    return effectiveMinDate.getFullYear();
  });

  const [viewMonth, setViewMonth] = useState(() => {
    if (value) {
      const parts = value.split("-").map(Number);
      if (parts[1] !== undefined) return parts[1] - 1;
    }
    return effectiveMinDate.getMonth();
  });

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
  const startDow = firstDayOfMonth.getDay(); // 0 = Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const minMonthStart = new Date(
    effectiveMinDate.getFullYear(),
    effectiveMinDate.getMonth(),
    1
  );

  const canGoPrev = useMemo(() => {
    const prevMonth = new Date(viewYear, viewMonth - 1, 1);
    return prevMonth >= minMonthStart;
  }, [viewYear, viewMonth, minMonthStart]);

  const cells: (number | null)[] = useMemo(() => {
    const arr: (number | null)[] = [
      ...Array(startDow).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    while (arr.length % 7 !== 0) {
      arr.push(null);
    }
    return arr;
  }, [startDow, daysInMonth]);

  const goToPrev = () => {
    if (!canGoPrev) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goToNext = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Formatted date string for footer
  const formattedSelected = useMemo(() => {
    if (!value) return null;
    try {
      const [y, m, d] = value.split("-").map(Number);
      return new Date(y, m - 1, d).toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return value;
    }
  }, [value]);

  return (
    <div
      className={`bg-[#0E0D0C] border border-[#2A2724] rounded-xl overflow-hidden select-none ${className}`}
    >
      {/* Month Navigation Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#1E1C1A]">
        <button
          type="button"
          onClick={goToPrev}
          disabled={!canGoPrev}
          aria-label="Previous month"
          className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
            canGoPrev
              ? "hover:bg-[#1E1C1A] text-[#A8A29E] hover:text-[#FAF9F6] cursor-pointer"
              : "text-[#3E3A34] cursor-not-allowed"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
        </button>

        <span className="font-serif text-sm text-[#FAF9F6] font-medium tracking-wide">
          {MONTHS[viewMonth]} {viewYear}
        </span>

        <button
          type="button"
          onClick={goToNext}
          aria-label="Next month"
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#1E1C1A] text-[#A8A29E] hover:text-[#FAF9F6] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 px-1 pt-2 pb-1">
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[9px] font-mono font-semibold text-[#5C554E] uppercase tracking-wider py-0.5"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Date Grid */}
      <div className="grid grid-cols-7 gap-y-0.5 px-1 pb-2">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;

          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(
            day
          ).padStart(2, "0")}`;
          const dateObj = new Date(viewYear, viewMonth, day);
          const isPast = dateObj < effectiveMinDate;
          const isToday = dateObj.getTime() === today.getTime();
          const isSelected = dateStr === value;

          return (
            <button
              key={dateStr}
              type="button"
              disabled={isPast}
              onClick={() => {
                if (!isPast) onChange(dateStr);
              }}
              className={`mx-auto w-7 h-7 flex items-center justify-center rounded-lg text-xs font-mono transition-all ${
                isSelected
                  ? "bg-[#D4A373] text-[#121110] font-semibold shadow-sm"
                  : isPast
                  ? "text-[#3E3A34] cursor-not-allowed"
                  : isToday
                  ? "border border-[#D4A373]/40 text-[#D4A373] hover:bg-[#D4A373]/10 cursor-pointer"
                  : "text-[#A8A29E] hover:bg-[#1E1C1A] hover:text-[#FAF9F6] cursor-pointer"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Selected Date Confirmation Footer */}
      {formattedSelected && (
        <div className="px-3.5 py-2 bg-[#121110] border-t border-[#1E1C1A] flex items-center justify-between text-[11px] font-mono">
          <span className="text-[#766E65]">Selected:</span>
          <span className="text-[#D4A373] font-medium">{formattedSelected}</span>
        </div>
      )}
    </div>
  );
}
