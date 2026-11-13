"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Navbar, Footer, ToastNotification } from "../../types";
import { LedgerMetrics } from "../../components/ledger/LedgerMetrics";
import type { SwarmTask } from "@/lib/taskStore";

interface LiveLedgerRow {
  id: string;
  rawTaskId: string;
  bountyId: string;
  createdAt: number;
  timeAgo: string;
  utcTime: string;
  taskTitle: string;
  taskSubtitle: string;
  workerAccount: string;
  workerLabel: string;
  workerColor: string;
  workerIconBg: string;
  workerIcon: string;
  amount: string;
  status: "Confirmed" | "Blocked";
  txHash: string;
  explorerUrl: string;
}

const PAGE_SIZE = 10;

function formatRelativeTime(timestamp: number, nowMs: number): string {
  const diffSec = Math.max(1, Math.floor((nowMs - timestamp) / 1000));
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

function downloadLedgerJson(rowsToExport: LiveLedgerRow[]) {
  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(rowsToExport, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute(
    "download",
    `settlement-ledger-${Date.now()}.json`,
  );
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function buildRowsFromTasks(tasks: SwarmTask[], nowMs: number): LiveLedgerRow[] {
  const result: LiveLedgerRow[] = [];

  for (const task of tasks) {
    const timeAgo = formatRelativeTime(task.createdAt, nowMs || task.createdAt);
    const utcTime = new Date(task.createdAt).toISOString().replace("T", " ").slice(0, 19) + " UTC";
    const taskTitle = task.deliverables?.worker2Title || task.directivePrompt;
    const settlements = task.settlements || [];

    settlements.forEach((st, idx) => {
      const isBlocked =
        st.status === "rejected" ||
        st.txHash === "BLOCKED_BY_VERIFIER_GATE" ||
        st.amount === "0 NEAR";
      const numericAmount = parseFloat(st.amount.replace(/[^0-9.]/g, "")) || 0;
      const agentHandle = st.agentHandle
        ? st.agentHandle.replace(/^@/, "")
        : st.worker;
      const isScout =
        agentHandle.includes("scout") || st.agentName?.includes("ScrapeScout");

      result.push({
        id: `${task.taskId}-${idx}-${st.txHash}`,
        rawTaskId: task.taskId,
        bountyId: `#${task.taskId}`,
        createdAt: task.createdAt,
        timeAgo,
        utcTime,
        taskTitle,
        taskSubtitle: isBlocked
          ? `Blocked: ${st.reason || "Failed verifier specification"}`
          : `Wallet: ${st.worker} • ${task.isLive ? "Live AI" : "Demo"}`,
        workerAccount: agentHandle,
        workerLabel: st.agentName || agentHandle,
        workerColor: isScout ? "text-primary" : "text-secondary",
        workerIconBg: isScout
          ? "bg-primary/15 text-primary"
          : "bg-secondary/15 text-secondary",
        workerIcon: isBlocked
          ? "gavel"
          : isScout
            ? "travel_explore"
            : "edit_note",
        amount: numericAmount.toFixed(2),
        status: isBlocked ? "Blocked" : "Confirmed",
        txHash: st.txHash,
        explorerUrl:
          !isBlocked && st.txHash
            ? st.explorerUrl || `https://testnet.nearblocks.io/txns/${st.txHash}`
            : "",
      });
    });

    // Also include tasks whose worker2 failed verification even before/without a settle click
    const w2Failed = task.verification?.worker2 && !task.verification.worker2.passed;
    const hasRejectedRow = settlements.some(
      (s) => s.status === "rejected" || s.txHash === "BLOCKED_BY_VERIFIER_GATE",
    );

    if (w2Failed && !hasRejectedRow) {
      const selectedHandle = (task.selectedAgent?.handle || "@copy-agent.testnet").replace(
        /^@/,
        "",
      );
      result.push({
        id: `${task.taskId}-blocked-w2`,
        rawTaskId: task.taskId,
        bountyId: `#${task.taskId}`,
        createdAt: task.createdAt,
        timeAgo,
        utcTime,
        taskTitle,
        taskSubtitle: `Blocked: ${task.verification.worker2.reason}`,
        workerAccount: selectedHandle,
        workerLabel: task.selectedAgent?.name || "CopyAgent v2.1",
        workerColor: "text-amber-400",
        workerIconBg: "bg-red-500/15 text-red-400",
        workerIcon: "gavel",
        amount: "0.00",
        status: "Blocked",
        txHash: "BLOCKED_BY_VERIFIER_GATE",
        explorerUrl: "",
      });
    }
  }

  return result;
}

export default function SettlementLedgerPage() {
  const [tasks, setTasks] = useState<SwarmTask[]>([]);
  const [referenceNow, setReferenceNow] = useState(0);
  const [activeAgentsCount, setActiveAgentsCount] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorker, setSelectedWorker] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedTimeRange, setSelectedTimeRange] = useState("All Time");
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [managerAccount, setManagerAccount] = useState<string>(
    "agentbounty-treasury.testnet",
  );

  useEffect(() => {
    let active = true;
    Promise.all([fetch("/api/tasks"), fetch("/api/agents"), fetch("/api/account")])
      .then(async ([tasksRes, agentsRes, accountRes]) => {
        if (!active) return;
        if (tasksRes.ok) {
          const data = await tasksRes.json();
          if (active && Array.isArray(data?.tasks)) setTasks(data.tasks);
        }
        if (agentsRes.ok) {
          const data = await agentsRes.json();
          if (active && Array.isArray(data?.agents)) {
            setActiveAgentsCount(data.agents.length);
          }
        }
        if (accountRes.ok) {
          const data = await accountRes.json();
          if (active && data?.accountId) setManagerAccount(data.accountId);
        }
        if (active) setReferenceNow(Date.now());
      })
      .catch(() => {})
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const rows = useMemo(
    () => buildRowsFromTasks(tasks, referenceNow),
    [tasks, referenceNow],
  );

  const metricsSummary = useMemo(() => {
    const confirmed = rows.filter((r) => r.status === "Confirmed");
    const blocked = rows.filter((r) => r.status === "Blocked");
    const totalNearSettled = confirmed.reduce(
      (sum, r) => sum + (parseFloat(r.amount) || 0),
      0,
    );
    return {
      totalNearSettled,
      totalTasksCount: tasks.length,
      confirmedCount: confirmed.length,
      blockedCount: blocked.length,
    };
  }, [rows, tasks.length]);

  const workerOptions = useMemo(() => {
    const unique = new Set(rows.map((r) => r.workerAccount));
    return Array.from(unique).sort();
  }, [rows]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((c) => (c === msg ? null : c));
    }, 2800);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        document.getElementById("ledger-search-input")?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const [tasksRes, agentsRes] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/agents"),
      ]);
      if (tasksRes.ok) {
        const data = await tasksRes.json();
        if (Array.isArray(data?.tasks)) setTasks(data.tasks);
      }
      if (agentsRes.ok) {
        const data = await agentsRes.json();
        if (Array.isArray(data?.agents)) setActiveAgentsCount(data.agents.length);
      }
      setReferenceNow(Date.now());
      showToast("Settlement ledger synced from store");
    } catch {
      showToast("Failed to refresh ledger");
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredRows = useMemo(() => {
    const maxAgeMs =
      selectedTimeRange === "Last 24 Hours"
        ? 24 * 60 * 60 * 1000
        : selectedTimeRange === "Last 7 Days"
          ? 7 * 24 * 60 * 60 * 1000
          : selectedTimeRange === "Last 30 Days"
            ? 30 * 24 * 60 * 60 * 1000
            : Infinity;

    return rows.filter((row) => {
      if (
        referenceNow > 0 &&
        maxAgeMs !== Infinity &&
        referenceNow - row.createdAt > maxAgeMs
      ) {
        return false;
      }
      if (selectedWorker !== "all" && row.workerAccount !== selectedWorker) {
        return false;
      }
      if (
        selectedStatus !== "all" &&
        row.status.toLowerCase() !== selectedStatus.toLowerCase()
      ) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          row.txHash.toLowerCase().includes(q) ||
          row.bountyId.toLowerCase().includes(q) ||
          row.taskTitle.toLowerCase().includes(q) ||
          row.taskSubtitle.toLowerCase().includes(q) ||
          row.workerAccount.toLowerCase().includes(q) ||
          row.workerLabel.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [rows, referenceNow, selectedWorker, selectedStatus, selectedTimeRange, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, safePage]);

  const handleExport = () => {
    showToast("Exporting JSON settlement audit logs...");
    downloadLedgerJson(filteredRows);
  };

  const handleCopyContract = () => {
    navigator.clipboard?.writeText(managerAccount);
    showToast(`Copied ${managerAccount} to clipboard`);
  };

  return (
    <>
      <Navbar activePath="settlement-ledger" />

      <main className="w-full pt-16 bg-background min-h-screen">
        <div className="flex flex-col w-full">
          <div className="w-full px-gutter-desktop py-space-xl flex flex-col gap-space-xl">
            {/* Top Ledger Header & Subtitle */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center gap-space-xs">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="font-label-mono-xs uppercase tracking-widest text-primary font-semibold">
                    Live Audit Stream
                  </span>
                  <span className="font-label-mono-xs text-outline">•</span>
                  <span className="font-label-mono-xs text-on-surface-variant font-medium">
                    Network: NEAR Testnet RPC
                  </span>
                </div>
                <h1 className="font-headline-lg text-on-surface tracking-tight font-bold">
                  Settlement Ledger
                </h1>
                <p className="font-body-md text-on-surface-variant max-w-2xl">
                  Real-time audit log of every verified NEAR Testnet transfer and
                  Verifier-Gate block dispatched by the AgentBounty treasury.
                </p>
              </div>

              {/* Live Treasury Account Badge */}
              <div className="flex items-center gap-space-sm bg-surface-container-low px-space-md py-space-sm rounded-xl shadow-sm self-start lg:self-auto border border-surface-container-high/40">
                <div className="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[18px]">
                    verified_user
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-mono-xs text-on-surface-variant">
                    Treasury Wallet
                  </span>
                  <span className="font-label-mono-sm text-on-surface font-semibold">
                    {managerAccount}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyContract}
                  className="ml-space-xs p-1 rounded hover:bg-surface-container-highest transition-colors text-on-surface-variant hover:text-primary cursor-pointer"
                  title="Copy Treasury Account ID"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    content_copy
                  </span>
                </button>
              </div>
            </div>

            {/* Summary Metrics Grid */}
            <LedgerMetrics
              totalNearSettled={metricsSummary.totalNearSettled}
              totalTasksCount={metricsSummary.totalTasksCount}
              confirmedCount={metricsSummary.confirmedCount}
              blockedCount={metricsSummary.blockedCount}
              activeAgentsCount={activeAgentsCount}
            />

            {/* Filter & Search Controls Bar */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md p-space-md rounded-xl bg-surface-container-low shadow-sm border border-surface-container-high/40">
              {/* Search Input with ⌘K indicator */}
              <div className="relative flex-1 max-w-xl">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                  search
                </span>
                <input
                  id="ledger-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by Tx Hash, Agent Handle, or Task ID..."
                  className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline text-body-md font-body-md pl-10 pr-16 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary shadow-inner border border-surface-container-high/40"
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-surface-container-high font-label-mono-xs text-on-surface-variant pointer-events-none">
                  <span>⌘</span>
                  <span>K</span>
                </div>
              </div>

              {/* Filters & Actions */}
              <div className="flex flex-wrap items-center gap-space-sm">
                {/* Worker Filter Dropdown */}
                <div className="relative">
                  <select
                    value={selectedWorker}
                    onChange={(e) => {
                      setSelectedWorker(e.target.value);
                      setCurrentPage(1);
                    }}
                    aria-label="Filter by worker"
                    className="appearance-none bg-surface-container-lowest text-on-surface font-body-sm pl-3 pr-8 py-2.5 rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary hover:bg-surface-container-high transition-colors border border-surface-container-high/40"
                  >
                    <option value="all">All Agents</option>
                    {workerOptions.map((handle) => (
                      <option key={handle} value={handle}>
                        {handle}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-outline text-[18px]">
                    expand_more
                  </span>
                </div>

                {/* Status Filter Dropdown */}
                <div className="relative">
                  <select
                    value={selectedStatus}
                    onChange={(e) => {
                      setSelectedStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                    aria-label="Filter by status"
                    className="appearance-none bg-surface-container-lowest text-on-surface font-body-sm pl-3 pr-8 py-2.5 rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary hover:bg-surface-container-high transition-colors border border-surface-container-high/40"
                  >
                    <option value="all">Status: All</option>
                    <option value="confirmed">Status: Confirmed</option>
                    <option value="blocked">Status: Blocked</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-outline text-[18px]">
                    expand_more
                  </span>
                </div>

                {/* Time Range Dropdown */}
                <div className="relative">
                  <select
                    value={selectedTimeRange}
                    onChange={(e) => {
                      setSelectedTimeRange(e.target.value);
                      setCurrentPage(1);
                    }}
                    aria-label="Filter by time range"
                    className="appearance-none bg-surface-container-lowest text-on-surface font-body-sm pl-3 pr-8 py-2.5 rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary hover:bg-surface-container-high transition-colors border border-surface-container-high/40"
                  >
                    <option value="All Time">All Time</option>
                    <option value="Last 24 Hours">Last 24 Hours</option>
                    <option value="Last 7 Days">Last 7 Days</option>
                    <option value="Last 30 Days">Last 30 Days</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-outline text-[18px]">
                    schedule
                  </span>
                </div>

                <span className="hidden sm:block w-px h-6 bg-surface-container-highest" />

                {/* Export Action */}
                <button
                  type="button"
                  onClick={handleExport}
                  className="flex items-center gap-space-xs px-3 py-2 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors font-body-sm cursor-pointer border border-surface-container-high/40"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    file_download
                  </span>
                  <span>Export JSON</span>
                </button>

                {/* Refresh Button */}
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="flex items-center justify-center p-2 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors cursor-pointer border border-surface-container-high/40"
                  title="Refresh Live Ledger"
                >
                  <span
                    className={`material-symbols-outlined text-[18px] ${
                      isRefreshing ? "animate-spin" : ""
                    }`}
                  >
                    sync
                  </span>
                </button>
              </div>
            </div>

            {/* Settlement Data Table Container */}
            <div className="flex flex-col rounded-xl bg-surface-container-low overflow-hidden shadow-lg border border-surface-container-high/40">
              {/* Table Header Bar */}
              <div className="px-space-lg py-space-md bg-surface-container flex items-center justify-between border-b border-surface-container-high/40">
                <div className="flex items-center gap-space-sm">
                  <span className="font-title-md text-on-surface font-semibold tracking-tight">
                    On-Chain Settlement Stream
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-highest font-label-mono-xs text-on-surface-variant font-medium">
                    Real-Time
                  </span>
                </div>
                <div className="flex items-center gap-space-xs font-label-mono-xs text-tertiary">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-ping" />
                  <span>{rows.length} Total Settlement Records</span>
                </div>
              </div>

              {/* Table */}
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-lowest text-on-surface-variant font-label-mono-xs uppercase tracking-wider border-b border-surface-container-high/30">
                      <th className="py-3 px-space-lg font-medium">Timestamp</th>
                      <th className="py-3 px-space-md font-medium">Task ID</th>
                      <th className="py-3 px-space-lg font-medium">
                        Task Description
                      </th>
                      <th className="py-3 px-space-md font-medium">
                        Agent Recipient
                      </th>
                      <th className="py-3 px-space-md font-medium">Amount</th>
                      <th className="py-3 px-space-md font-medium">Status</th>
                      <th className="py-3 px-space-lg text-right font-medium">
                        Proof / Tx Hash
                      </th>
                    </tr>
                  </thead>
                  <tbody className="font-body-sm text-on-surface divide-y divide-surface-container-high/30">
                    {isLoading ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-10 px-space-lg text-center font-mono text-xs text-outline"
                        >
                          Loading settlement records...
                        </td>
                      </tr>
                    ) : paginatedRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-10 px-space-lg text-center space-y-3"
                        >
                          <p className="font-body-md text-on-surface-variant">
                            {rows.length === 0
                              ? "No Testnet settlements recorded yet. Run a task to generate real on-chain proofs."
                              : "No settlement records match your current filters."}
                          </p>
                          {rows.length === 0 && (
                            <Link
                              href="/create-task"
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary-fixed font-mono text-xs font-bold hover:opacity-95"
                            >
                              <span>Create Your First Task</span>
                              <span className="material-symbols-outlined text-[15px]">
                                arrow_forward
                              </span>
                            </Link>
                          )}
                        </td>
                      </tr>
                    ) : (
                      paginatedRows.map((row) => (
                        <tr
                          key={row.id}
                          className="hover:bg-surface-container-high/60 transition-colors group"
                        >
                          <td className="py-4 px-space-lg whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="font-body-md text-on-surface font-medium">
                                {row.timeAgo}
                              </span>
                              <span className="font-label-mono-xs text-outline">
                                {row.utcTime}
                              </span>
                            </div>
                          </td>

                          <td className="py-4 px-space-md whitespace-nowrap">
                            <Link
                              href={`/receipt/${row.rawTaskId}`}
                              className="px-2 py-1 rounded bg-surface-container-highest font-label-mono-sm font-semibold text-primary hover:underline"
                            >
                              {row.bountyId}
                            </Link>
                          </td>

                          <td className="py-4 px-space-lg">
                            <div className="flex flex-col min-w-55 max-w-sm">
                              <span className="font-body-md text-on-surface font-medium truncate">
                                {row.taskTitle}
                              </span>
                              <span className="font-body-sm text-on-surface-variant truncate">
                                {row.taskSubtitle}
                              </span>
                            </div>
                          </td>

                          <td className="py-4 px-space-md whitespace-nowrap">
                            <div className="flex items-center gap-space-xs">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center ${row.workerIconBg}`}
                              >
                                <span className="material-symbols-outlined text-[13px]">
                                  {row.workerIcon}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span
                                  className={`font-label-mono-sm font-medium ${row.workerColor}`}
                                >
                                  {row.workerLabel}
                                </span>
                                <span className="font-label-mono-xs text-outline">
                                  @{row.workerAccount}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-space-md whitespace-nowrap">
                            <div
                              className={`flex items-center gap-1 font-label-mono-md font-bold ${
                                row.status === "Blocked"
                                  ? "text-red-400"
                                  : "text-primary"
                              }`}
                            >
                              <span>{row.amount}</span>
                              <span className="text-[10px] opacity-70 font-semibold">
                                NEAR
                              </span>
                            </div>
                          </td>

                          <td className="py-4 px-space-md whitespace-nowrap">
                            {row.status === "Confirmed" ? (
                              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-tertiary/15 text-tertiary font-label-mono-xs font-semibold shadow-[0_0_8px_rgba(78,222,163,0.2)]">
                                <span className="material-symbols-outlined text-[13px]">
                                  check_circle
                                </span>
                                <span>Confirmed</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 font-label-mono-xs font-semibold">
                                <span className="material-symbols-outlined text-[13px]">
                                  block
                                </span>
                                <span>Blocked</span>
                              </div>
                            )}
                          </td>

                          <td className="py-4 px-space-lg text-right whitespace-nowrap">
                            {row.explorerUrl ? (
                              <a
                                href={row.explorerUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 font-label-mono-sm text-primary hover:text-primary-fixed underline-offset-2 hover:underline transition-colors"
                                title="View Transaction on NEARBlocks Explorer"
                              >
                                <span>
                                  {row.txHash.slice(0, 8)}...{row.txHash.slice(-6)}
                                </span>
                                <span className="material-symbols-outlined text-[14px]">
                                  open_in_new
                                </span>
                              </a>
                            ) : (
                              <Link
                                href={`/receipt/${row.rawTaskId}`}
                                className="inline-flex items-center gap-1 font-label-mono-xs text-red-400 hover:underline"
                              >
                                <span>Verifier Guard Proof</span>
                                <span className="material-symbols-outlined text-[14px]">
                                  receipt_long
                                </span>
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Dynamic Status & Conditional Pagination Footer */}
              <div className="px-space-lg py-space-md bg-surface-container-lowest flex flex-col sm:flex-row items-center justify-between gap-space-md border-t border-surface-container-high/40">
                <div className="flex items-center gap-space-sm font-label-mono-sm text-on-surface-variant">
                  <span>Showing</span>
                  <span className="text-on-surface font-semibold">
                    {filteredRows.length}
                  </span>
                  <span>of</span>
                  <span className="text-on-surface font-semibold">
                    {rows.length}
                  </span>
                  <span>settlement records</span>
                </div>

                {filteredRows.length > PAGE_SIZE && (
                  <div className="flex items-center gap-space-xs">
                    <button
                      type="button"
                      disabled={safePage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface font-label-mono-sm flex items-center gap-1 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        chevron_left
                      </span>
                      <span>Previous</span>
                    </button>
                    <span className="font-label-mono-sm text-on-surface-variant px-2">
                      Page {safePage} / {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={safePage >= totalPages}
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      className="px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface font-label-mono-sm flex items-center gap-1 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <span>Next</span>
                      <span className="material-symbols-outlined text-[16px]">
                        chevron_right
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Honest Architecture Verification Callout Banner */}
            <div className="p-space-lg rounded-xl bg-surface-container-lowest relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-space-lg shadow-sm border border-surface-container-high/40">
              <div className="flex items-center gap-space-md">
                <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary shrink-0 shadow-inner">
                  <span className="material-symbols-outlined text-[24px]">
                    verified_user
                  </span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-space-xs">
                    <span className="font-title-md text-on-surface font-semibold">
                      Verifier-Gated NEAR Settlement Engine
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-tertiary-container/20 text-tertiary font-label-mono-xs">
                      Testnet RPC
                    </span>
                  </div>
                  <p className="font-body-sm text-on-surface-variant">
                    Every payout is gated by AgentBounty&apos;s deterministic quality
                    checks before signing a direct NEAR Testnet transfer via{" "}
                    <code className="text-primary">near-api-js</code>. Rejected outputs
                    disburse 0 NEAR and trigger automatic reputation slashing.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-space-sm shrink-0">
                <a
                  className="px-space-md py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-fixed-dim transition-colors font-body-sm font-semibold flex items-center gap-1.5 shadow-[0_0_16px_rgba(76,215,246,0.3)]"
                  href="https://testnet.nearblocks.io"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    open_in_browser
                  </span>
                  <span>NearBlocks Explorer</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <ToastNotification message={toastMessage} />
    </>
  );
}
