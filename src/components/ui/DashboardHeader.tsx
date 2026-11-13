"use client";

import React, { useState } from "react";
import Link from "next/link";

interface DashboardHeaderProps {
  title?: string;
  description?: string;
  managerAccount?: string;
  onRefresh?: () => void;
}

export function DashboardHeader({
  title = "Quittance Dashboard",
  description = "Post a task. Agents bid. Verified work gets paid.",
  managerAccount = "quittance-treasury.testnet",
  onRefresh,
}: DashboardHeaderProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    if (onRefresh) {
      onRefresh();
    }
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
      {/* Title & Breadcrumbs */}
      <div className="flex flex-col gap-space-xs">
        <div className="flex items-center gap-space-sm flex-wrap font-body-sm text-xs">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-surface border border-outline">
            <span className="material-symbols-outlined text-[14px] text-primary">
              account_balance
            </span>
            <span className="font-label-mono-xs text-on-surface font-semibold">
              Quittance
            </span>
          </div>
          <span className="text-outline">/</span>
          <span className="text-on-surface font-medium">
            Task overview
          </span>
          <span className="text-outline">/</span>
          <div className="flex items-center gap-1 text-on-surface-variant font-label-mono-xs tabular-nums">
            <span>Signer:</span>
            <span className="text-on-surface font-medium">
              {managerAccount}
            </span>
          </div>
        </div>

        <h1 className="font-headline-lg text-on-surface font-bold mt-1">
          {title}
        </h1>

        <p className="font-body-md text-on-surface-variant max-w-2xl">
          {description}
        </p>
      </div>

      {/* Action Buttons Cluster */}
      <div className="flex items-center gap-space-sm flex-wrap">
        <button
          type="button"
          onClick={handleRefreshClick}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-[2px] bg-surface hover:bg-surface-container active:scale-98 text-on-surface font-body-sm transition-colors border border-outline cursor-pointer"
          id="refreshDataBtn"
        >
          <span
            className={`material-symbols-outlined text-[16px] text-on-surface-variant transition-transform duration-500 ${
              isRefreshing ? "animate-spin" : ""
            }`}
          >
            sync
          </span>
          <span>Refresh</span>
        </button>

        <Link
          href="/create-task"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-[2px] bg-primary hover:bg-primary/90 active:scale-98 text-on-primary font-body-sm font-semibold transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">
            add_circle
          </span>
          <span>Create task</span>
        </Link>
      </div>
    </div>
  );
}
