"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";

export interface CustomDateInputProps {
  value: string; // ISO date format YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  size?: "sm" | "md" | "lg";
  error?: boolean;
  id?: string;
  name?: string;
  required?: boolean;
  align?: "left" | "right";
  ariaLabel?: string;
  showPresets?: boolean;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function CustomDateInput({
  value,
  onChange,
  placeholder = "Select date...",
  min,
  max,
  disabled = false,
  className = "",
  buttonClassName = "",
  size = "sm",
  error = false,
  id,
  name,
  required = false,
  align = "left",
  ariaLabel,
  showPresets = true,
}: CustomDateInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const inputId = id || generatedId;

  // Timezone-safe parsing of "YYYY-MM-DD"
  const parseIso = (val: string) => {
    if (!val || typeof val !== "string") return null;
    const parts = val.split("-");
    if (parts.length !== 3) return null;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
    return { year: y, month: m, day: d };
  };

  const parsedValue = parseIso(value);

  // Calendar view year and month
  const today = new Date();
  const [viewYear, setViewYear] = useState<number>(() => parsedValue?.year ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(() => parsedValue?.month ?? today.getMonth());

  // Sync view when value changes from outside
  useEffect(() => {
    if (parsedValue) {
      setViewYear(parsedValue.year);
      setViewMonth(parsedValue.month);
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("touchstart", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const prevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const formatIsoString = (year: number, monthIndex: number, day: number) => {
    const mm = String(monthIndex + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
  };

  const handleSelectDay = (day: number) => {
    const iso = formatIsoString(viewYear, viewMonth, day);
    onChange(iso);
    setIsOpen(false);
  };

  // Quick preset helper
  const applyPreset = (preset: "today" | "plus30" | "plus90" | "plusYear" | "endOfYear") => {
    const d = new Date();
    if (preset === "today") {
      // today
    } else if (preset === "plus30") {
      d.setDate(d.getDate() + 30);
    } else if (preset === "plus90") {
      d.setDate(d.getDate() + 90);
    } else if (preset === "plusYear") {
      d.setFullYear(d.getFullYear() + 1);
    } else if (preset === "endOfYear") {
      d.setMonth(11);
      d.setDate(31);
    }
    const iso = formatIsoString(d.getFullYear(), d.getMonth(), d.getDate());
    onChange(iso);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    setIsOpen(false);
  };

  // Calendar calculations
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  // Check if day is disabled by min/max
  const isDayDisabled = (day: number) => {
    const iso = formatIsoString(viewYear, viewMonth, day);
    if (min && iso < min) return true;
    if (max && iso > max) return true;
    return false;
  };

  // Size styling
  const sizeStyles = {
    sm: "py-1.5 px-2.5 text-xs rounded-lg min-h-[32px]",
    md: "py-2 px-3 text-xs sm:text-sm rounded-lg min-h-[38px]",
    lg: "py-2.5 px-3.5 text-sm rounded-xl min-h-[44px]",
  }[size];

  // Friendly formatted date string (e.g., "Oct 24, 2027")
  const displayFormatted = parsedValue
    ? `${MONTH_NAMES[parsedValue.month].slice(0, 3)} ${parsedValue.day}, ${parsedValue.year}`
    : null;

  return (
    <div
      ref={containerRef}
      className={`relative inline-block w-full text-left font-sans ${className}`}
    >
      {/* Hidden input for HTML form submission */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={value}
          required={required}
          disabled={disabled}
        />
      )}

      {/* Trigger Button */}
      <button
        id={inputId}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={ariaLabel || "Choose date"}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2 text-left bg-bg border transition-all select-none cursor-pointer ${
          error
            ? "border-red focus:ring-2 focus:ring-red/20"
            : isOpen
            ? "border-blue ring-2 ring-blue/20 bg-panel"
            : "border-line hover:border-muted/50 focus:border-blue focus:ring-2 focus:ring-blue/20"
        } ${
          disabled
            ? "opacity-50 cursor-not-allowed bg-line/20"
            : "hover:bg-panel"
        } ${sizeStyles} ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 truncate flex-1 min-w-0">
          <Calendar className="w-3.5 h-3.5 shrink-0 text-muted" />
          <span
            className={`truncate font-mono ${
              value ? "text-ink font-medium" : "text-muted"
            }`}
          >
            {value ? (
              <span className="flex items-center gap-1.5">
                <span>{value}</span>
                <span className="text-[10px] text-muted hidden sm:inline font-sans">
                  ({displayFormatted})
                </span>
              </span>
            ) : (
              placeholder
            )}
          </span>
        </div>

        {value && !disabled && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="p-0.5 text-muted hover:text-ink rounded transition-colors"
            title="Clear date"
          >
            <X className="w-3 h-3" />
          </span>
        )}
      </button>

      {/* Calendar Dropdown Popup */}
      {isOpen && (
        <div
          className={`absolute z-50 mt-1.5 w-72 bg-panel border border-line rounded-xl shadow-xl p-3 text-ink select-none ${
            align === "right" ? "right-0" : "left-0"
          }`}
          role="dialog"
          aria-label="Calendar date picker"
        >
          {/* Quick Presets */}
          {showPresets && (
            <div className="flex items-center gap-1 pb-2.5 mb-2.5 border-b border-line text-[10px] font-medium overflow-x-auto">
              <button
                type="button"
                onClick={() => applyPreset("today")}
                className="px-2 py-0.5 rounded bg-bg hover:bg-line border border-line text-muted hover:text-ink transition-colors whitespace-nowrap cursor-pointer"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => applyPreset("plus30")}
                className="px-2 py-0.5 rounded bg-bg hover:bg-line border border-line text-muted hover:text-ink transition-colors whitespace-nowrap cursor-pointer"
              >
                +30d
              </button>
              <button
                type="button"
                onClick={() => applyPreset("plus90")}
                className="px-2 py-0.5 rounded bg-bg hover:bg-line border border-line text-muted hover:text-ink transition-colors whitespace-nowrap cursor-pointer"
              >
                +90d
              </button>
              <button
                type="button"
                onClick={() => applyPreset("endOfYear")}
                className="px-2 py-0.5 rounded bg-bg hover:bg-line border border-line text-muted hover:text-ink transition-colors whitespace-nowrap cursor-pointer"
              >
                Dec 31
              </button>
              <button
                type="button"
                onClick={() => applyPreset("plusYear")}
                className="px-2 py-0.5 rounded bg-blue/10 hover:bg-blue/20 text-blue font-semibold border border-blue/20 transition-colors whitespace-nowrap cursor-pointer"
              >
                +1 Year
              </button>
            </div>
          )}

          {/* Month / Year Navigator */}
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 rounded-lg hover:bg-line text-muted hover:text-ink transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="text-xs font-bold text-ink">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </div>

            <button
              type="button"
              onClick={nextMonth}
              className="p-1 rounded-lg hover:bg-line text-muted hover:text-ink transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {DAY_NAMES.map((d) => (
              <span
                key={d}
                className="text-[10px] font-semibold text-muted tracking-wider"
              >
                {d}
              </span>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Empty slots before first day */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-7 w-7" />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const iso = formatIsoString(viewYear, viewMonth, day);
              const isSelected = value === iso;
              const isToday =
                today.getFullYear() === viewYear &&
                today.getMonth() === viewMonth &&
                today.getDate() === day;
              const disabledDay = isDayDisabled(day);

              return (
                <button
                  key={day}
                  type="button"
                  disabled={disabledDay}
                  onClick={() => handleSelectDay(day)}
                  className={`h-7 w-7 rounded-lg text-xs font-mono transition-all flex items-center justify-center cursor-pointer ${
                    isSelected
                      ? "bg-blue text-white font-bold shadow-xs scale-105"
                      : isToday
                      ? "border border-blue text-blue font-semibold hover:bg-blue/10"
                      : disabledDay
                      ? "text-muted/30 cursor-not-allowed"
                      : "hover:bg-line text-ink"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Manual input fallback footer */}
          <div className="mt-2.5 pt-2 border-t border-line flex items-center justify-between text-[11px]">
            <span className="text-muted text-[10px]">ISO Date:</span>
            <input
              type="text"
              placeholder="YYYY-MM-DD"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="py-0.5 px-1.5 bg-bg border border-line rounded text-ink font-mono text-[11px] w-24 text-center focus:outline-none focus:border-blue"
            />
          </div>
        </div>
      )}
    </div>
  );
}
