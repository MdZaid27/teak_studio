"use client";

import React, { useState, useRef, useEffect } from "react";

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<string | SelectOption>;
  label?: string;
  placeholder?: string;
  variant?: "light" | "dark";
  align?: "left" | "right";
  fullWidth?: boolean;
  className?: string;
  buttonClassName?: string;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  label,
  placeholder = "Select an option",
  variant = "light",
  align = "left",
  fullWidth = false,
  className = "",
  buttonClassName = "",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize options into SelectOption objects
  const normalizedOptions: SelectOption[] = options.map((opt) => {
    if (typeof opt === "string") {
      return { value: opt, label: opt };
    }
    return opt;
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value) || {
    value,
    label: value || placeholder,
  };

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const isDark = variant === "dark";

  return (
    <div
      ref={containerRef}
      className={`relative ${fullWidth ? "w-full block" : "inline-block"} ${className}`}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex items-center justify-between gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer select-none ${
          fullWidth ? "w-full" : ""
        } ${
          isDark
            ? "bg-[#121110] border border-[#2A2724] text-[#FAF9F6] hover:border-[#D4A373] focus:border-[#D4A373]"
            : "bg-white border border-[#d3c3bd] text-[#0e0300] hover:border-[#895029] focus:border-[#895029] shadow-xs"
        } ${buttonClassName}`}
      >
        <span className="truncate">{selectedOption.label}</span>
        <span
          className={`material-symbols-outlined text-[18px] transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180" : ""
          } ${isDark ? "text-[#D4A373]" : "text-[#895029]"}`}
        >
          expand_more
        </span>
      </button>

      {/* Luxury Atelier Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute z-50 mt-1.5 min-w-[190px] w-full max-h-64 overflow-y-auto rounded-xl p-1.5 shadow-2xl border transition-all animate-in fade-in zoom-in-95 duration-150 ${
            align === "right" ? "right-0" : "left-0"
          } ${
            isDark
              ? "bg-[#181614] border-[#2A2724] text-[#FAF9F6] shadow-black/80"
              : "bg-white border-[#e5e2dd] text-[#0e0300] shadow-xl shadow-[#0e0300]/10"
          }`}
        >
          {normalizedOptions.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between gap-2 cursor-pointer group ${
                  isSelected
                    ? isDark
                      ? "bg-[#25221F] text-[#D4A373] font-semibold"
                      : "bg-[#f5eee8] text-[#895029] font-semibold"
                    : isDark
                    ? "text-[#A8A29E] hover:text-[#FAF9F6] hover:bg-[#221F1C]"
                    : "text-[#4f4540] hover:text-[#0e0300] hover:bg-[#fcf8f5]"
                }`}
              >
                <div className="flex flex-col min-w-0">
                  <span className="truncate">{option.label}</span>
                  {option.description && (
                    <span
                      className={`text-[10px] truncate ${
                        isDark ? "text-[#766E65]" : "text-[#81746f]"
                      }`}
                    >
                      {option.description}
                    </span>
                  )}
                </div>

                {isSelected && (
                  <span
                    className={`material-symbols-outlined text-[16px] shrink-0 ${
                      isDark ? "text-[#D4A373]" : "text-[#895029]"
                    }`}
                  >
                    check
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
