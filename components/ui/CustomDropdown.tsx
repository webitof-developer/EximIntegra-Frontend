"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check, Search, X } from "lucide-react";

export interface DropdownOption<T extends string = string> {
  value: T;
  label: React.ReactNode;
  secondaryLabel?: React.ReactNode;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface CustomDropdownProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: (DropdownOption<T> | string)[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  icon?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  maxHeight?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  error?: boolean;
  id?: string;
  name?: string;
  align?: "left" | "right";
  ariaLabel?: string;
  usePortal?: boolean;
  placement?: "auto" | "bottom" | "top";
}

export function CustomDropdown<T extends string = string>({
  value,
  onChange,
  options,
  placeholder = "Select an option...",
  disabled = false,
  className = "",
  buttonClassName = "",
  menuClassName = "",
  icon,
  size = "md",
  maxHeight = "max-h-60",
  searchable = false,
  searchPlaceholder = "Search...",
  error = false,
  id,
  name,
  align = "left",
  ariaLabel,
  usePortal = false,
  placement = "auto",
}: CustomDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [mounted, setMounted] = useState(false);
  const [menuCoords, setMenuCoords] = useState<{
    top: number;
    left: number;
    width: number;
    placeAbove: boolean;
  }>({
    top: 0,
    left: 0,
    width: 0,
    placeAbove: false,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const generatedId = useId();
  const dropdownId = id || generatedId;

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateMenuPosition = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const placeAbove =
      placement === "top" ||
      (placement === "auto" && spaceBelow < 200 && rect.top > 200);

    setMenuCoords({
      top: placeAbove ? rect.top - 6 : rect.bottom + 6,
      left: align === "right" ? rect.right : rect.left,
      width: Math.max(160, rect.width),
      placeAbove: Boolean(placeAbove),
    });
  };

  useEffect(() => {
    if (isOpen && usePortal) {
      updateMenuPosition();
      const handleReposition = () => updateMenuPosition();
      window.addEventListener("scroll", handleReposition, true);
      window.addEventListener("resize", handleReposition);
      return () => {
        window.removeEventListener("scroll", handleReposition, true);
        window.removeEventListener("resize", handleReposition);
      };
    }
  }, [isOpen, usePortal, placement, align]);

  // Normalize options to DropdownOption format
  const normalizedOptions: DropdownOption<T>[] = React.useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === "string") {
        return { value: opt as T, label: opt };
      }
      return opt;
    });
  }, [options]);

  // Selected Option
  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Filtered options if search is enabled
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) return normalizedOptions;
    const query = searchQuery.toLowerCase().trim();
    return normalizedOptions.filter((opt) => {
      const labelText =
        typeof opt.label === "string"
          ? opt.label
          : String(opt.value);
      const descText = opt.description || "";
      return (
        labelText.toLowerCase().includes(query) ||
        descText.toLowerCase().includes(query)
      );
    });
  }, [normalizedOptions, searchQuery]);

  // Handle outside click to close
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        (!menuRef.current || !menuRef.current.contains(target))
      ) {
        setIsOpen(false);
        setSearchQuery("");
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

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    if (isOpen) {
      const initialIdx = filteredOptions.findIndex((opt) => opt.value === value);
      setHighlightedIndex(initialIdx >= 0 ? initialIdx : 0);
    }
  }, [isOpen, searchable, value, filteredOptions]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.children[highlightedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery("");
        break;
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => {
          let next = prev + 1;
          while (
            next < filteredOptions.length &&
            filteredOptions[next]?.disabled
          ) {
            next++;
          }
          return next < filteredOptions.length ? next : prev;
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => {
          let next = prev - 1;
          while (next >= 0 && filteredOptions[next]?.disabled) {
            next--;
          }
          return next >= 0 ? next : prev;
        });
        break;
      case "Enter":
        e.preventDefault();
        if (
          highlightedIndex >= 0 &&
          highlightedIndex < filteredOptions.length
        ) {
          const item = filteredOptions[highlightedIndex];
          if (!item.disabled) {
            onChange(item.value);
            setIsOpen(false);
            setSearchQuery("");
          }
        }
        break;
      case "Tab":
        setIsOpen(false);
        setSearchQuery("");
        break;
    }
  };

  const handleSelect = (item: DropdownOption<T>) => {
    if (item.disabled) return;
    onChange(item.value);
    setIsOpen(false);
    setSearchQuery("");
  };

  // Size variations
  const sizeStyles = {
    sm: "py-1.5 px-2.5 text-xs rounded-lg min-h-[32px]",
    md: "py-2 px-3 text-xs sm:text-sm rounded-xl min-h-[38px]",
    lg: "py-2.5 px-3.5 text-sm rounded-xl min-h-[44px]",
  }[size];

  return (
    <div
      ref={containerRef}
      className={`relative inline-block w-full text-left font-sans ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Hidden input for standard form submission if name provided */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={String(value)}
          disabled={disabled}
        />
      )}

      {/* Trigger Button */}
      <button
        id={dropdownId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2 text-left bg-[#F8FAFC] border transition-all select-none cursor-pointer ${
          error
            ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
            : isOpen
            ? "border-[#1D68F2] ring-2 ring-[#1D68F2]/20 bg-white"
            : "border-[#CBD5E1]/80 hover:border-slate-400 focus:border-[#1D68F2] focus:ring-2 focus:ring-[#1D68F2]/20"
        } ${
          disabled
            ? "opacity-50 cursor-not-allowed bg-slate-100 hover:border-[#CBD5E1]"
            : "hover:bg-white"
        } ${sizeStyles} ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 truncate flex-1 min-w-0">
          {/* Leading Icon (prop or selected option icon) */}
          {icon ? (
            <span className="shrink-0 text-[#64748B] flex items-center">{icon}</span>
          ) : selectedOption?.icon ? (
            <span className="shrink-0 text-[#64748B] flex items-center">
              {selectedOption.icon}
            </span>
          ) : null}

          {/* Option Label or Placeholder */}
          <span
            className={`truncate block ${
              selectedOption
                ? "text-[#0F172A] font-medium"
                : "text-[#94A3B8]"
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>

          {selectedOption?.secondaryLabel && (
            <span className="text-xs text-[#64748B] truncate ml-1 font-normal hidden sm:inline">
              {selectedOption.secondaryLabel}
            </span>
          )}
        </div>

        {/* Chevron Icon with animated rotation */}
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-[#64748B] transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#1D68F2]" : ""
          }`}
        />
      </button>

      {/* Dropdown Floating Menu */}
      {isOpen &&
        (() => {
          const menuEl = (
            <div
              ref={menuRef}
              role="listbox"
              tabIndex={-1}
              style={
                usePortal
                  ? {
                      position: "fixed",
                      top: menuCoords.placeAbove ? undefined : `${menuCoords.top}px`,
                      bottom: menuCoords.placeAbove
                        ? `${window.innerHeight - menuCoords.top}px`
                        : undefined,
                      left: align === "right" ? undefined : `${menuCoords.left}px`,
                      right:
                        align === "right"
                          ? `${window.innerWidth - menuCoords.left}px`
                          : undefined,
                      width: `${menuCoords.width}px`,
                      zIndex: 99999,
                    }
                  : undefined
              }
              className={`${
                usePortal ? "" : "absolute z-50 mt-1.5 min-w-full"
              } bg-panel border border-line rounded-xl shadow-2xl py-1.5 animate-in fade-in zoom-in-95 duration-150 ${
                !usePortal && (align === "right" ? "right-0" : "left-0")
              } ${menuClassName}`}
            >
              {/* Optional Search Input */}
              {searchable && (
                <div className="px-2 pb-1.5 pt-0.5 border-b border-line">
                  <div className="relative flex items-center">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 text-muted pointer-events-none" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setHighlightedIndex(0);
                      }}
                      placeholder={searchPlaceholder}
                      className="w-full pl-8 pr-7 py-1.5 text-xs bg-bg border border-line rounded-lg text-ink placeholder:text-muted focus:outline-hidden focus:border-blue"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          searchInputRef.current?.focus();
                        }}
                        className="absolute right-2 text-muted hover:text-ink p-0.5 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Options Scrollable List */}
              <ul
                ref={listRef}
                className={`overflow-y-auto px-1 py-0.5 divide-y divide-transparent ${maxHeight} focus:outline-hidden`}
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#CBD5E1 transparent",
                }}
              >
                {filteredOptions.length === 0 ? (
                  <li className="px-3 py-3 text-xs text-center text-muted">
                    No matching options found
                  </li>
                ) : (
                  filteredOptions.map((opt, idx) => {
                    const isSelected = opt.value === value;
                    const isHighlighted = idx === highlightedIndex;

                    return (
                      <li
                        key={String(opt.value)}
                        role="option"
                        aria-selected={isSelected}
                        aria-disabled={opt.disabled}
                        onClick={() => handleSelect(opt)}
                        onMouseEnter={() => !opt.disabled && setHighlightedIndex(idx)}
                        className={`group relative flex items-center justify-between gap-2 px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer select-none my-0.5 ${
                          opt.disabled
                            ? "opacity-40 cursor-not-allowed text-muted"
                            : isSelected
                            ? "bg-blue/10 text-blue font-semibold"
                            : isHighlighted
                            ? "bg-bg text-ink"
                            : "text-ink hover:bg-bg"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate min-w-0 flex-1">
                          {opt.icon && (
                            <span
                              className={`shrink-0 ${
                                isSelected ? "text-blue" : "text-muted"
                              }`}
                            >
                              {opt.icon}
                            </span>
                          )}
                          <div className="truncate flex flex-col">
                            <span className="truncate leading-snug">{opt.label}</span>
                            {opt.description && (
                              <span className="text-[11px] text-muted font-normal truncate mt-0.5">
                                {opt.description}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          {opt.secondaryLabel && (
                            <span className="text-[11px] text-muted font-normal">
                              {opt.secondaryLabel}
                            </span>
                          )}
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-blue shrink-0" />
                          )}
                        </div>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          );

          if (usePortal && mounted && typeof document !== "undefined") {
            return createPortal(menuEl, document.body);
          }
          return menuEl;
        })()}
    </div>
  );
}

// Re-export alias as ScrollableDropdown
export const ScrollableDropdown = CustomDropdown;
