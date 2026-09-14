"use client";

import React, { useEffect } from "react";

export interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string;
  title?: string;
  maxWidth?: string; // e.g. "max-w-xl", "max-w-2xl"
  children: React.ReactNode;
  headerRight?: React.ReactNode;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  contentClassName?: string;
}

export default function ModalShell({
  isOpen,
  onClose,
  category,
  title,
  maxWidth = "max-w-xl",
  children,
  headerRight,
  closeOnBackdrop = true,
  closeOnEscape = true,
  className = "",
  contentClassName = "",
}: ModalShellProps) {
  // Body scroll locking
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`relative w-full ${maxWidth} bg-[#161514] border border-[#2A2724] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        {(category || title) && (
          <div className="p-6 border-b border-[#2A2724] bg-[#121110] flex items-center justify-between shrink-0">
            <div>
              {category && (
                <span className="text-[10px] font-mono tracking-[0.2em] text-[#D4A373] uppercase block mb-1">
                  {category}
                </span>
              )}
              {title && (
                <h2 className="font-serif text-xl sm:text-2xl text-[#FAF9F6] font-medium tracking-wide">
                  {title}
                </h2>
              )}
            </div>

            <div className="flex items-center gap-2">
              {headerRight}
              <button
                onClick={onClose}
                type="button"
                className="w-9 h-9 rounded-full bg-[#1F1D1A] hover:bg-[#2A2724] text-[#A8A29E] hover:text-[#FAF9F6] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Content */}
        <div
          className={`overflow-y-auto p-6 space-y-6 flex-1 text-[#FAF9F6] ${contentClassName}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
