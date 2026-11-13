"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Navbar,
  Footer,
  DashboardHeader,
  MetricCard,
  MissionLaunchpad,
  FilterBar,
  TaskCard,
  Pagination,
  DeliverablesModal,
  LiveExecutionModal,
  FilterCategory,
  TaskItem,
  MetricItem,
} from "../types";
import { initialTasks } from "../data/mockData";
import type { SwarmTask } from "@/lib/taskStore";

const PAGE_SIZE = 10;

function formatRelativeTime(timestamp: number): string {
  const diffSec = Math.max(1, Math.floor((Date.now() - timestamp) / 1000));
  if (diffSec < 60) return `Completed ${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `Completed ${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `Completed ${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `Completed ${diffDay}d ago`;
}

function mapSwarmTaskToTaskItem(task: SwarmTask): TaskItem {
  const paidSettlements = (task.settlements || []).filter(
    (s) => s.txHash && s.txHash !== "BLOCKED_BY_VERIFIER_GATE" && s.amount !== "0 NEAR",
  );
  const totalPaid = paidSettlements.reduce((acc, s) => {
    const val = parseFloat(s.amount.replace(/[^0-9.]/g, ""));
    return acc + (Number.isFinite(val) ? val : 0);
  }, 0);

  const worker2Passed = task.verification?.worker2?.passed ?? true;
  const worker1Passed = task.verification?.worker1?.passed ?? true;
  const score1 = task.verification?.worker1?.score ?? 100;
  const score2 = task.verification?.worker2?.score ?? 100;
  const worker2Bid = task.selectedAgent?.bidNear ?? 0.05;
  const quotedTotal = (
    (worker1Passed ? 0.03 : 0) + (worker2Passed ? worker2Bid : 0)
  ).toFixed(3);
  const firstPaid = paidSettlements[0];

  const statusLabel =
    task.status === "settled"
      ? worker2Passed
        ? "Paid on NEAR Testnet"
        : "Partial Payout (Worker 2 Blocked)"
      : worker2Passed
        ? `Verified (${score2}/100)`
        : `Blocked (${score2}/100)`;

  return {
    id: `#${task.taskId}`,
    title: task.deliverables?.worker2Title || task.directivePrompt,
    category: task.isLive ? "Live AI Task" : "Demo Task",
    status: "completed",
    statusLabel,
    timeAgo: formatRelativeTime(task.createdAt),
    agents: [
      {
        name: "ScrapeScout v3.0",
        handle: `Score: ${score1}%`,
        icon: "travel_explore",
        color: "primary",
      },
      {
        name: task.selectedAgent?.name || "CopyAgent v2.1",
        handle: `Score: ${score2}%`,
        icon: "edit_note",
        color: "secondary",
      },
    ],
    deliverables: [
      ...(task.deliverables?.worker1Title
        ? [
            {
              icon: "analytics",
              name: task.deliverables.worker1Title,
              color: "primary" as const,
            },
          ]
        : []),
      ...(task.deliverables?.worker2Title
        ? [
            {
              icon: worker2Passed ? "description" : "gavel",
              name: worker2Passed
                ? task.deliverables.worker2Title
                : `Blocked: ${task.verification?.worker2?.reason || "Failed Spec"}`,
              color: "tertiary" as const,
            },
          ]
        : []),
    ],
    escrow: {
      amount: totalPaid > 0 ? totalPaid.toFixed(3) : quotedTotal,
      unit: "NEAR",
      reference: firstPaid
        ? `Tx: ${firstPaid.txHash.slice(0, 6)}...${firstPaid.txHash.slice(-4)}`
        : task.status === "settled"
          ? "Settled on NEAR"
          : "Pending Settlement",
    },
    actionLabel: "View Receipt",
    actionHref: `/receipt/${task.taskId}`,
    secondaryActionType: firstPaid?.explorerUrl ? "explorer" : "none",
    explorerHref: firstPaid?.explorerUrl || "#",
  };
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>("all");
  const [selectedSort, setSelectedSort] = useState("Sort: Most Recent");
  const [currentPage, setCurrentPage] = useState(1);
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [walletBalance, setWalletBalance] = useState<string>("Checking...");
  const [managerAccount, setManagerAccount] = useState<string>("quittance-treasury.testnet");
  const [selectedTaskForModal, setSelectedTaskForModal] =
    useState<TaskItem | null>(null);
  const [liveExecutionTask, setLiveExecutionTask] =
    useState<TaskItem | null>(null);

  const loadDashboardData = () => {
    fetch("/api/tasks")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.tasks)) {
          const persisted = (data.tasks as SwarmTask[]).map(mapSwarmTaskToTaskItem);
          setTasks([...persisted, ...initialTasks]);
        }
      })
      .catch(() => {});

    fetch("/api/account")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.balance) setWalletBalance(data.balance);
        if (data?.accountId) setManagerAccount(data.accountId);
      })
      .catch(() => {});
  };

  useEffect(() => {
    let mounted = true;

    fetch("/api/tasks")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (mounted && data && Array.isArray(data.tasks)) {
          const persisted = (data.tasks as SwarmTask[]).map(mapSwarmTaskToTaskItem);
          setTasks([...persisted, ...initialTasks]);
        }
      })
      .catch(() => {});

    fetch("/api/account")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (mounted) {
          if (data?.balance) setWalletBalance(data.balance);
          if (data?.accountId) setManagerAccount(data.accountId);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  // Real counts computed directly from the task list
  const counts = useMemo(() => {
    return {
      all: tasks.length,
      active: tasks.filter((t) => t.status === "active").length,
      completed: tasks.filter((t) => t.status === "completed").length,
      drafts: tasks.filter((t) => t.status === "draft").length,
    };
  }, [tasks]);

  // Real metrics computed directly from displayed tasks + live wallet balance
  const metrics = useMemo<MetricItem[]>(() => {
    const totalNear = tasks.reduce((sum, t) => {
      const val = parseFloat(t.escrow.amount.replace(/[^0-9.]/g, ""));
      return sum + (Number.isFinite(val) ? val : 0);
    }, 0);

    return [
      {
        title: "Completed Tasks",
        value: String(counts.completed),
        unit: counts.completed === 1 ? "Task" : "Tasks",
        breakdown: "Verified runs & showcase examples",
        icon: "check_circle",
        accent: "primary",
      },
      {
        title: "Total Value",
        value: totalNear.toFixed(3),
        unit: "NEAR",
        breakdown: "Native NEAR micro-settlements",
        icon: "payments",
        accent: "tertiary",
      },
      {
        title: "Treasury Wallet",
        value: walletBalance,
        unit: "",
        breakdown: managerAccount,
        icon: "account_balance_wallet",
        accent: "primary",
        isLive: true,
      },
      {
        title: "Verifier Gate",
        value: "4-Rule",
        unit: "Check",
        breakdown: (
          <span className="text-tertiary flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">verified</span>
            <span>Min score 75% required for payout</span>
          </span>
        ),
        icon: "verified_user",
        accent: "secondary",
      },
    ];
  }, [tasks, counts.completed, walletBalance, managerAccount]);

  // Filter & sort tasks
  const filteredTasks = useMemo(() => {
    const matching = tasks.filter((task) => {
      if (selectedFilter === "active" && task.status !== "active") return false;
      if (selectedFilter === "completed" && task.status !== "completed") return false;
      if (selectedFilter === "drafts" && task.status !== "draft") return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesId = task.id.toLowerCase().includes(query);
        const matchesCategory = task.category.toLowerCase().includes(query);
        const matchesAgent = task.agents?.some(
          (agent) =>
            agent.name.toLowerCase().includes(query) ||
            (agent.handle && agent.handle.toLowerCase().includes(query)),
        );
        return matchesTitle || matchesId || matchesCategory || matchesAgent;
      }

      return true;
    });

    if (selectedSort === "Sort: Escrow Value (High to Low)") {
      return [...matching].sort((a, b) => {
        const valA = parseFloat(a.escrow.amount.replace(/[^0-9.]/g, "")) || 0;
        const valB = parseFloat(b.escrow.amount.replace(/[^0-9.]/g, "")) || 0;
        return valB - valA;
      });
    }

    return matching;
  }, [tasks, selectedFilter, searchQuery, selectedSort]);

  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const paginatedTasks = filteredTasks.slice(startIdx, startIdx + PAGE_SIZE);

  return (
    <>
      <Navbar />

      <main className="w-full pt-16 bg-background min-h-screen">
        <div className="flex flex-col w-full">
          <div className="w-full px-gutter-desktop py-space-lg flex flex-col gap-space-lg max-w-[1600px] mx-auto">
            {/* Header Section */}
            <DashboardHeader
              managerAccount={managerAccount}
              onRefresh={loadDashboardData}
            />

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
              {metrics.map((metric, idx) => (
                <MetricCard key={idx} item={metric} />
              ))}
            </div>

            {/* Quick Navigation Launchpad */}
            <MissionLaunchpad />

            {/* Search & Filters Toolbar */}
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={(q) => {
                setSearchQuery(q);
                setCurrentPage(1);
              }}
              selectedFilter={selectedFilter}
              onFilterChange={(f) => {
                setSelectedFilter(f);
                setCurrentPage(1);
              }}
              selectedSort={selectedSort}
              onSortChange={(s) => {
                setSelectedSort(s);
                setCurrentPage(1);
              }}
              counts={counts}
            />

            {/* Tasks List Container */}
            <div className="flex flex-col gap-space-md">
              {paginatedTasks.length > 0 ? (
                paginatedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onInspect={(t) => setSelectedTaskForModal(t)}
                    onViewLive={(t) => setLiveExecutionTask(t)}
                  />
                ))
              ) : (
                <div className="rounded-xl bg-surface-container/40 p-space-xl text-center flex flex-col items-center justify-center gap-space-sm border border-surface-container-high/40">
                  <span className="material-symbols-outlined text-[32px] text-outline">
                    search_off
                  </span>
                  <p className="font-headline-sm text-on-surface">
                    No tasks found
                  </p>
                  <p className="font-body-sm text-on-surface-variant">
                    Try adjusting your search query or filter settings.
                  </p>
                </div>
              )}
            </div>

            {/* Only show pagination when items exceed PAGE_SIZE */}
            {filteredTasks.length > PAGE_SIZE && (
              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                startItem={startIdx + 1}
                endItem={Math.min(startIdx + PAGE_SIZE, filteredTasks.length)}
                totalItems={filteredTasks.length}
                onPageChange={(page) => setCurrentPage(page)}
                contractAddress={managerAccount}
              />
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Deliverables Inspector Modal */}
      <DeliverablesModal
        task={selectedTaskForModal}
        isOpen={Boolean(selectedTaskForModal)}
        onClose={() => setSelectedTaskForModal(null)}
      />

      {/* Live Execution Log Modal */}
      <LiveExecutionModal
        task={liveExecutionTask}
        isOpen={Boolean(liveExecutionTask)}
        onClose={() => setLiveExecutionTask(null)}
      />
    </>
  );
}
