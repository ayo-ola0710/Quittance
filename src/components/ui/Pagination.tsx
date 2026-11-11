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
  startItem = 1,
  endItem = 5,
  totalItems = 34,
  onPageChange,
  contractAddress = "treasury.swarmpay.testnet",
}: PaginationProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md pt-space-md pb-space-xl text-on-surface-variant font-label-mono-xs">
      {/* Items Range Info */}
      <div className="flex items-center gap-space-xs">
        <span>
          Showing <strong className="text-on-surface">{startItem} - {endItem}</strong> of{" "}
          <strong className="text-on-surface">{totalItems}</strong> autonomous tasks
        </span>
      </div>

      {/* Pagination Page Selectors */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange?.(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-2.5 py-1.5 rounded-lg bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-bright transition-all disabled:opacity-40 disabled:pointer-events-none"
        >
          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
        </button>

        <button
          type="button"
          className="w-8 h-8 rounded-lg bg-primary-container text-on-primary font-bold flex items-center justify-center"
        >
          1
        </button>
        <button
          type="button"
          onClick={() => onPageChange?.(2)}
          className="w-8 h-8 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface flex items-center justify-center transition-all"
        >
          2
        </button>
        <button
          type="button"
          onClick={() => onPageChange?.(3)}
          className="w-8 h-8 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface flex items-center justify-center transition-all"
        >
          3
        </button>
        <span className="px-1 text-outline">...</span>
        <button
          type="button"
          onClick={() => onPageChange?.(7)}
          className="w-8 h-8 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface flex items-center justify-center transition-all"
        >
          7
        </button>

        <button
          type="button"
          onClick={() => onPageChange?.(currentPage + 1)}
          className="px-2.5 py-1.5 rounded-lg bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-bright transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>
      </div>

      {/* Agent Treasury Engine Link */}
      <div className="flex items-center gap-1.5 text-on-surface-variant">
        <span className="material-symbols-outlined text-tertiary text-[14px]">
          format_image_left
        </span>
        <span>
          Disbursements managed by Agent Treasury Engine:{" "}
          <code className="text-primary font-mono">{contractAddress}</code>
        </span>
      </div>
    </div>
  );
}
