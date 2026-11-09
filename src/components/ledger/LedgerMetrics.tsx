import React from "react";

export function LedgerMetrics() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
      {/* Metric 1: Total NEAR Settled */}
      <div className="relative overflow-hidden rounded-xl bg-surface-container-low p-space-lg flex flex-col justify-between gap-space-md shadow-md group hover:bg-surface-container transition-all border border-surface-container-high/40">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none group-hover:bg-primary/20 transition-all" />
        <div className="flex items-center justify-between">
          <span className="font-label-mono-xs uppercase text-on-surface-variant font-medium tracking-wider">
            Total NEAR Settled
          </span>
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center text-primary shadow-[0_0_12px_rgba(76,215,246,0.25)]">
            <span className="material-symbols-outlined text-[18px]">
              account_balance_wallet
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-baseline gap-space-xs">
            <span className="font-display-lg font-bold text-on-surface tracking-tight">
              14.85
            </span>
            <span className="font-label-mono-md text-primary font-semibold">NEAR</span>
          </div>
          <div className="flex items-center gap-space-xs">
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-primary/15 font-label-mono-xs text-primary font-semibold">
              <span className="material-symbols-outlined text-[12px]">trending_up</span>
              +2.4 NEAR today
            </span>
            <span className="font-body-sm text-outline">vs yesterday</span>
          </div>
        </div>
      </div>

      {/* Metric 2: Completed Bounties */}
      <div className="relative overflow-hidden rounded-xl bg-surface-container-low p-space-lg flex flex-col justify-between gap-space-md shadow-md group hover:bg-surface-container transition-all border border-surface-container-high/40">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary/10 rounded-full blur-2xl pointer-events-none group-hover:bg-secondary/20 transition-all" />
        <div className="flex items-center justify-between">
          <span className="font-label-mono-xs uppercase text-on-surface-variant font-medium tracking-wider">
            Completed Bounties
          </span>
          <div className="w-8 h-8 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary shadow-[0_0_12px_rgba(208,188,255,0.2)]">
            <span className="material-symbols-outlined text-[18px]">task_alt</span>
          </div>
        </div>
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-baseline gap-space-xs">
            <span className="font-display-lg font-bold text-on-surface tracking-tight">
              297
            </span>
            <span className="font-body-md text-on-surface-variant font-medium">Tasks</span>
          </div>
          <div className="flex items-center gap-space-xs">
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-secondary-container/40 font-label-mono-xs text-secondary font-semibold">
              99.7% Success
            </span>
            <span className="font-body-sm text-outline">0 disputes • 100% SLA</span>
          </div>
        </div>
      </div>

      {/* Metric 3: Avg Settlement Time */}
      <div className="relative overflow-hidden rounded-xl bg-surface-container-low p-space-lg flex flex-col justify-between gap-space-md shadow-md group hover:bg-surface-container transition-all border border-surface-container-high/40">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-tertiary/10 rounded-full blur-2xl pointer-events-none group-hover:bg-tertiary/20 transition-all" />
        <div className="flex items-center justify-between">
          <span className="font-label-mono-xs uppercase text-on-surface-variant font-medium tracking-wider">
            Avg Settlement Time
          </span>
          <div className="w-8 h-8 rounded-lg bg-tertiary/15 flex items-center justify-center text-tertiary shadow-[0_0_12px_rgba(78,222,163,0.25)]">
            <span className="material-symbols-outlined text-[18px]">bolt</span>
          </div>
        </div>
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-baseline gap-space-xs">
            <span className="font-display-lg font-bold text-on-surface tracking-tight">
              1.1
            </span>
            <span className="font-label-mono-md text-tertiary font-semibold">seconds</span>
          </div>
          <div className="flex items-center gap-space-xs">
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-tertiary-container/30 font-label-mono-xs text-tertiary font-semibold">
              Near Instant
            </span>
            <span className="font-body-sm text-outline">1 chunk finality</span>
          </div>
        </div>
      </div>

      {/* Metric 4: Active Swarm Nodes */}
      <div className="relative overflow-hidden rounded-xl bg-surface-container-low p-space-lg flex flex-col justify-between gap-space-md shadow-md group hover:bg-surface-container transition-all border border-surface-container-high/40">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-fixed-dim/10 rounded-full blur-2xl pointer-events-none group-hover:bg-primary-fixed-dim/20 transition-all" />
        <div className="flex items-center justify-between">
          <span className="font-label-mono-xs uppercase text-on-surface-variant font-medium tracking-wider">
            Active Swarm Nodes
          </span>
          <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-fixed">
            <span className="material-symbols-outlined text-[18px]">hub</span>
          </div>
        </div>
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-baseline gap-space-xs">
            <span className="font-display-lg font-bold text-on-surface tracking-tight">8</span>
            <span className="font-body-md text-on-surface-variant font-medium">
              Autonomous Agents
            </span>
          </div>
          <div className="flex items-center gap-space-xs">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-surface-container-high font-label-mono-xs text-on-surface-variant font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
              100% online availability
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
