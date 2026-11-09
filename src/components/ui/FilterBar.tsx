"use client";

import React, { useRef, useEffect } from "react";

export type FilterCategory = "all" | "active" | "completed" | "drafts";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedFilter: FilterCategory;
  onFilterChange: (filter: FilterCategory) => void;
  selectedSort?: string;
  onSortChange?: (sort: string) => void;
  counts?: {
    all: number;
    active: number;
    completed: number;
    drafts: number;
  };
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  selectedFilter,
  onFilterChange,
  selectedSort = "Sort: Most Recent",
  onSortChange,
  counts = { all: 34, active: 2, completed: 28, drafts: 4 },
}: FilterBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filterTabs: { id: FilterCategory; label: string; count: number; hasPulse?: boolean }[] = [
    { id: "all", label: "All", count: counts.all },
    { id: "active", label: "Active", count: counts.active, hasPulse: true },
    { id: "completed", label: "Completed", count: counts.completed },
    { id: "drafts", label: "Drafts", count: counts.drafts },
  ];

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-sm pt-space-xs">
      {/* Search Input with ⌘K Badge */}
      <div className="relative flex-1 max-w-xl">
        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant pointer-events-none">
          search
        </span>
        <input
          ref={inputRef}
          type="text"
          id="taskSearchInput"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by Task Title, ID (#BNT-...), or Assigned Agent..."
          className="w-full bg-surface-container-lowest text-on-surface font-label-mono-md pl-10 pr-16 py-2.5 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 font-label-mono-xs text-on-surface-variant bg-surface-container-high px-1.5 py-0.5 rounded pointer-events-none">
          ⌘K
        </span>
      </div>

      {/* Filter Tabs & Sort Selector */}
      <div className="flex items-center gap-space-xs flex-wrap">
        <div className="p-1 rounded-xl bg-surface-container-lowest flex items-center gap-1 overflow-x-auto">
          {filterTabs.map((tab) => {
            const isActive = selectedFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onFilterChange(tab.id)}
                className={`px-4 py-1.5 rounded-lg font-body-sm transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? "bg-primary-container text-on-primary font-semibold shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {tab.hasPulse && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                )}
                <span>
                  {tab.label} ({tab.count})
                </span>
              </button>
            );
          })}
        </div>

        <select
          value={selectedSort}
          onChange={(e) => onSortChange?.(e.target.value)}
          aria-label="Sort tasks"
          className="bg-surface-container-lowest text-on-surface font-body-sm px-space-md py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer border-0"
        >
          <option>Sort: Most Recent</option>
          <option>Sort: Escrow Value (High to Low)</option>
          <option>Sort: Fastest Execution</option>
        </select>
      </div>
    </div>
  );
}
