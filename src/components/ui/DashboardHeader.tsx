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
  title = "My Tasks Dashboard",
  description = "Supervise active swarm orchestrations, inspect cryptographic receipts & deliverables, and deploy multi-agent bounties on NEAR.",
  managerAccount = "manager.testnet",
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
        <div className="flex items-center gap-space-sm flex-wrap">
          <div className="flex items-center gap-space-xs px-space-sm py-0.5 rounded-full bg-surface-container-high">
            <span className="material-symbols-outlined text-[14px] text-primary">
              terminal
            </span>
            <span className="font-label-mono-xs text-on-surface-variant uppercase tracking-wider">
              Mission Control
            </span>
          </div>
          <span className="font-label-mono-xs text-outline">/</span>
          <span className="font-label-mono-xs text-primary font-medium tracking-wide">
            MY TASKS OVERVIEW
          </span>
          <span className="font-label-mono-xs text-outline">•</span>
          <div className="flex items-center gap-1 text-on-surface-variant font-label-mono-xs">
            <span>MANAGER:</span>
            <span className="text-on-surface font-semibold">
              {managerAccount}
            </span>
          </div>
        </div>

        <h1 className="font-headline-lg tracking-tight text-on-surface font-bold mt-1">
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
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-bright active:scale-95 text-on-surface font-body-sm transition-all duration-150 group cursor-pointer"
          id="refreshDataBtn"
        >
          <span
            className={`material-symbols-outlined text-[18px] text-on-surface-variant transition-transform duration-500 ${
              isRefreshing
                ? "animate-spin"
                : "group-hover:rotate-180"
            }`}
          >
            sync
          </span>
          <span>Sync Swarm</span>
        </button>

        <Link
          href="/create-task"
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container active:scale-95 text-on-primary font-body-sm font-semibold shadow-[0_0_24px_-4px_rgba(6,182,212,0.4)] transition-all duration-150"
        >
          <span
            className="material-symbols-outlined text-[18px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            bolt
          </span>
          <span>Dispatch Swarm</span>
        </Link>
      </div>
    </div>
  );
}
