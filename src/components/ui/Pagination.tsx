import React from "react";

interface PaginationProps {
  currentPage?: number;
  totalPages?: number;
  startItem?: number;
  endItem?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  contractAddress?: string;
}

export function Pagination({
  currentPage = 1,
  totalPages = 1,
  startItem = 1,
  endItem = 1,
  totalItems = 0,
  onPageChange,
  contractAddress = "quittance-treasury.testnet",
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, idx) => idx + 1);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md pt-space-md pb-space-xl text-on-surface-variant font-body-sm text-xs tabular-nums">
      {/* Items Range Info */}
      <div className="flex items-center gap-1">
        <span>
          Showing{" "}
          <strong className="text-on-surface">
            {startItem} &ndash; {endItem}
          </strong>{" "}
          of <strong className="text-on-surface">{totalItems}</strong> tasks
        </span>
      </div>

      {/* Pagination Page Selectors */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange?.(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-2 py-1 rounded-[2px] bg-surface text-on-surface-variant hover:text-on-surface hover:bg-surface-container border border-outline transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
        </button>

        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange?.(page)}
            className={`w-7 h-7 rounded-[2px] flex items-center justify-center transition-colors border cursor-pointer ${
              page === currentPage
                ? "bg-primary text-on-primary border-primary font-semibold"
                : "bg-surface hover:bg-surface-container text-on-surface border-outline"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange?.(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-2 py-1 rounded-[2px] bg-surface text-on-surface-variant hover:text-on-surface hover:bg-surface-container border border-outline transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>
      </div>

      {/* Manager Wallet Footnote */}
      <div className="flex items-center gap-1.5 text-on-surface-variant">
        <span className="material-symbols-outlined text-tertiary text-[14px]">
          verified_user
        </span>
        <span>
          Payer wallet: <code className="text-on-surface font-mono">{contractAddress}</code>
        </span>
      </div>
    </div>
  );
}
