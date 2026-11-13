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
  contractAddress = "agentbounty-treasury.testnet",
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, idx) => idx + 1);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md pt-space-md pb-space-xl text-on-surface-variant font-label-mono-xs">
      {/* Items Range Info */}
      <div className="flex items-center gap-space-xs">
        <span>
          Showing{" "}
          <strong className="text-on-surface">
            {startItem} - {endItem}
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
          className="px-2.5 py-1.5 rounded-lg bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-bright transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
        </button>

        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange?.(page)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              page === currentPage
                ? "bg-primary-container text-on-primary font-bold"
                : "bg-surface-container-high hover:bg-surface-bright text-on-surface"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange?.(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-2.5 py-1.5 rounded-lg bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-bright transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
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
          Payer wallet: <code className="text-primary font-mono">{contractAddress}</code>
        </span>
      </div>
    </div>
  );
}
