"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Navbar, Footer, ToastNotification } from "../../types";
import { LedgerMetrics } from "../../components/ledger/LedgerMetrics";
import { initialSettlementRows, SettlementRow } from "../../data/mockLedger";

export default function SettlementLedgerPage() {
  const [rows] = useState<SettlementRow[]>(initialSettlementRows);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorker, setSelectedWorker] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedTimeRange, setSelectedTimeRange] = useState("Last 24 Hours");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const handleRefresh = () => {
    setIsRefreshing(true);
    showToast("Ledger consensus stream updated");
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleExport = () => {
    showToast("Exporting CSV / JSON settlement audit logs...");
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(rows, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `settlement-ledger-${Date.now()}.json`,
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyContract = () => {
    navigator.clipboard?.writeText("treasury.swarmpay.testnet");
    showToast("Copied treasury.swarmpay.testnet to clipboard");
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
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
          row.workerAccount.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [rows, selectedWorker, selectedStatus, searchQuery]);

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
                    Consensus Stream Active
                  </span>
                  <span className="font-label-mono-xs text-outline">•</span>
                  <span className="font-label-mono-xs text-on-surface-variant font-medium">
                    Chain ID: testnet-104
                  </span>
                </div>
                <h1 className="font-headline-lg text-on-surface tracking-tight font-bold">
                  Settlement Ledger
                </h1>
                <p className="font-body-md text-on-surface-variant max-w-2xl">
                  Verifiable cryptographic settlement logs executing atomic
                  micro-payouts via NEAR Protocol Agent Treasury Engine. Zero
                  slippage, sub-second finality.
                </p>
              </div>

              {/* Live Contract State Badge */}
              <div className="flex items-center gap-space-sm bg-surface-container-low px-space-md py-space-sm rounded-xl shadow-sm self-start lg:self-auto border border-surface-container-high/40">
                <div className="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[18px]">
                    verified_user
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-mono-xs text-on-surface-variant">
                    Agent Treasury Engine
                  </span>
                  <span className="font-label-mono-sm text-on-surface font-semibold">
                    treasury.swarmpay.testnet
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyContract}
                  className="ml-space-xs p-1 rounded hover:bg-surface-container-highest transition-colors text-on-surface-variant hover:text-primary cursor-pointer"
                  title="Copy Contract Address"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    content_copy
                  </span>
                </button>
              </div>
            </div>

            {/* Summary Metrics Grid */}
            <LedgerMetrics />

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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Tx Hash, Worker Account, or Task ID..."
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
                    onChange={(e) => setSelectedWorker(e.target.value)}
                    aria-label="Filter by worker"
                    className="appearance-none bg-surface-container-lowest text-on-surface font-body-sm pl-3 pr-8 py-2.5 rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary hover:bg-surface-container-high transition-colors border border-surface-container-high/40"
                  >
                    <option value="all">All Workers</option>
                    <option value="copy-agent.testnet">
                      copy-agent.testnet
                    </option>
                    <option value="design-agent.testnet">
                      design-agent.testnet
                    </option>
                    <option value="data-scout.testnet">
                      data-scout.testnet
                    </option>
                    <option value="verify-node.testnet">
                      verify-node.testnet
                    </option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-outline text-[18px]">
                    expand_more
                  </span>
                </div>

                {/* Status Filter Dropdown */}
                <div className="relative">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    aria-label="Filter by status"
                    className="appearance-none bg-surface-container-lowest text-on-surface font-body-sm pl-3 pr-8 py-2.5 rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary hover:bg-surface-container-high transition-colors border border-surface-container-high/40"
                  >
                    <option value="all">Status: All</option>
                    <option value="confirmed">Status: Confirmed</option>
                    <option value="failed">Status: Failed</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-outline text-[18px]">
                    expand_more
                  </span>
                </div>

                {/* Time Range Dropdown */}
                <div className="relative">
                  <select
                    value={selectedTimeRange}
                    onChange={(e) => setSelectedTimeRange(e.target.value)}
                    aria-label="Filter by time range"
                    className="appearance-none bg-surface-container-lowest text-on-surface font-body-sm pl-3 pr-8 py-2.5 rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary hover:bg-surface-container-high transition-colors border border-surface-container-high/40"
                  >
                    <option value="Last 24 Hours">Last 24 Hours</option>
                    <option value="Last 7 Days">Last 7 Days</option>
                    <option value="Last 30 Days">Last 30 Days</option>
                    <option value="All-Time Epoch">All-Time Epoch</option>
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
                  <span>Export CSV / JSON</span>
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
              {/* Table Header Bar with Live Stream Status */}
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
                  <span>Block Height: #142,883,912</span>
                </div>
              </div>

              {/* Table */}
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-lowest text-on-surface-variant font-label-mono-xs uppercase tracking-wider border-b border-surface-container-high/30">
                      <th className="py-3 px-space-lg font-medium">
                        Timestamp
                      </th>
                      <th className="py-3 px-space-md font-medium">
                        Bounty ID
                      </th>
                      <th className="py-3 px-space-lg font-medium">
                        Task Description
                      </th>
                      <th className="py-3 px-space-md font-medium">
                        Worker Recipient
                      </th>
                      <th className="py-3 px-space-md font-medium">Amount</th>
                      <th className="py-3 px-space-md font-medium">Status</th>
                      <th className="py-3 px-space-lg text-right font-medium">
                        Tx Hash
                      </th>
                    </tr>
                  </thead>
                  <tbody className="font-body-sm text-on-surface divide-y divide-surface-container-high/30">
                    {filteredRows.map((row) => (
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
                          <span className="px-2 py-1 rounded bg-surface-container-highest font-label-mono-sm font-semibold text-primary">
                            {row.bountyId}
                          </span>
                        </td>

                        <td className="py-4 px-space-lg">
                          <div className="flex flex-col min-w-55">
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
                            <span
                              className={`font-label-mono-sm font-medium ${row.workerColor}`}
                            >
                              {row.workerAccount}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-space-md whitespace-nowrap">
                          <div className="flex items-center gap-1 font-label-mono-md text-primary font-bold">
                            <span>{row.amount}</span>
                            <span className="text-[10px] text-primary/70 font-semibold">
                              NEAR
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-space-md whitespace-nowrap">
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-tertiary/15 text-tertiary font-label-mono-xs font-semibold shadow-[0_0_8px_rgba(78,222,163,0.2)]">
                            <span className="material-symbols-outlined text-[13px]">
                              check_circle
                            </span>
                            <span>{row.status}</span>
                          </div>
                        </td>

                        <td className="py-4 px-space-lg text-right whitespace-nowrap">
                          <a
                            href="https://testnet.nearblocks.io"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-label-mono-sm text-primary hover:text-primary-fixed underline-offset-2 hover:underline transition-colors"
                            title="View NEAR Block Explorer"
                          >
                            <span>{row.txHash}</span>
                            <span className="material-symbols-outlined text-[14px]">
                              open_in_new
                            </span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination & Status Footer */}
              <div className="px-space-lg py-space-md bg-surface-container-lowest flex flex-col sm:flex-row items-center justify-between gap-space-md border-t border-surface-container-high/40">
                <div className="flex items-center gap-space-sm font-label-mono-sm text-on-surface-variant">
                  <span>Showing</span>
                  <span className="text-on-surface font-semibold">1-5</span>
                  <span>of</span>
                  <span className="text-on-surface font-semibold">297</span>
                  <span>settlements</span>
                </div>

                <div className="flex items-center gap-space-xs">
                  <button
                    type="button"
                    disabled
                    className="px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant font-label-mono-sm flex items-center gap-1 opacity-50 cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      chevron_left
                    </span>
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center gap-1 px-1">
                    <button
                      type="button"
                      className="w-8 h-8 rounded-lg bg-primary-container text-on-primary-container font-label-mono-sm font-bold flex items-center justify-center"
                    >
                      1
                    </button>
                    <button
                      type="button"
                      className="w-8 h-8 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low font-label-mono-sm flex items-center justify-center transition-colors"
                    >
                      2
                    </button>
                    <button
                      type="button"
                      className="w-8 h-8 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low font-label-mono-sm flex items-center justify-center transition-colors"
                    >
                      3
                    </button>
                    <span className="font-label-mono-xs text-outline px-1">
                      ...
                    </span>
                    <button
                      type="button"
                      className="w-8 h-8 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low font-label-mono-sm flex items-center justify-center transition-colors"
                    >
                      60
                    </button>
                  </div>

                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface hover:text-primary hover:bg-surface-container-high transition-colors font-label-mono-sm flex items-center gap-1 cursor-pointer"
                  >
                    <span>Next</span>
                    <span className="material-symbols-outlined text-[16px]">
                      chevron_right
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Escrow Execution Verification Stream Callout Banner */}
            <div className="p-space-lg rounded-xl bg-surface-container-lowest relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-space-lg shadow-sm border border-surface-container-high/40">
              <div className="flex items-center gap-space-md">
                <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary shrink-0 shadow-inner">
                  <span className="material-symbols-outlined text-[24px]">
                    terminal
                  </span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-space-xs">
                    <span className="font-title-md text-on-surface font-semibold">
                      Decentralized Escrow Daemon
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-tertiary-container/20 text-tertiary font-label-mono-xs">
                      Live Relay
                    </span>
                  </div>
                  <p className="font-body-sm text-on-surface-variant">
                    All agent micropayments leverage native NEAR FunctionCall
                    promises. Finalized receipts are validated across validator
                    shards with automated cryptographic refund if DAG
                    requirements fail.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-space-sm shrink-0">
                <a
                  className="px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors font-body-sm font-medium flex items-center gap-1.5"
                  href="https://docs.near.org"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="material-symbols-outlined text-[16px] text-primary">
                    description
                  </span>
                  <span>Escrow ABI Specs</span>
                </a>
                <a
                  className="px-space-md py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-fixed-dim transition-colors font-body-sm font-semibold flex items-center gap-1.5 shadow-[0_0_16px_rgba(76,215,246,0.3)]"
                  href="https://testnet.nearblocks.io"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    open_in_browser
                  </span>
                  <span>Explorer RPC</span>
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
