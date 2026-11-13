"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import type { SelectedWriterAgent } from "@/components/creation/DynamicStepMatchmaking";

interface VerificationCheck {
  name: string;
  pass: boolean;
  detail?: string;
}

interface WorkerVerificationResult {
  passed: boolean;
  score: number;
  reason: string;
  charCount: number;
  checks?: VerificationCheck[];
}

interface DeliverablesData {
  taskId: string;
  outputHash: string;
  rulesHash?: string;
  isLive: boolean;
  taskTitle: string;
  simulateBadWorker?: boolean;
  selectedAgent?: {
    id: string;
    name: string;
    handle: string;
    bidPrice: string;
    bidNear: number;
    reputationAtSelection?: number;
    reputationAfter?: number;
    slashed?: boolean;
  };
  verification: {
    worker1: WorkerVerificationResult;
    worker2: WorkerVerificationResult;
  };
  executionEvents?: Array<{
    timestamp: string;
    agent: string;
    level: "info" | "success" | "warn" | "step";
    message: string;
  }>;
  worker1: {
    deliverableTitle: string;
    runtime: string;
    sha256: string;
    stats: {
      stat1Label: string;
      stat1Value: string;
      stat2Label: string;
      stat2Value: string;
      stat3Label: string;
      stat3Value: string;
    };
    topicClusters: Array<{ tag: string; count: number }>;
    summary: string;
  };
  worker2: {
    deliverableTitle: string;
    runtime: string;
    sha256: string;
    filename: string;
    copyHeadline: string;
    copyBody: string;
    wordCount: number;
    readingTime: string;
    designPrompt: string;
    designStyle: string;
  };
}

interface DynamicStepSettlementProps {
  directivePrompt?: string;
  selectedAgent?: SelectedWriterAgent;
  onReset: () => void;
  onShowToast: (msg: string) => void;
}

export function DynamicStepSettlement({
  directivePrompt,
  selectedAgent,
  onReset,
  onShowToast,
}: DynamicStepSettlementProps) {
  const [worker1Settled, setWorker1Settled] = useState(false);
  const [worker2Settled, setWorker2Settled] = useState(false);
  const [settleAllStatus, setSettleAllStatus] = useState<
    "idle" | "settling" | "settled"
  >("idle");
  const [deliverables, setDeliverables] = useState<DeliverablesData | null>(null);
  const [isLoadingDeliverables, setIsLoadingDeliverables] = useState(true);
  const [activeWorker2Tab, setActiveWorker2Tab] = useState<"copy" | "design">("copy");
  const [simulateCheatMode, setSimulateCheatMode] = useState(false);
  const [showTechDrawer, setShowTechDrawer] = useState(false);
  const [managerAccount, setManagerAccount] = useState("quittance-treasury.testnet");

  useEffect(() => {
    fetch("/api/account")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.accountId) setManagerAccount(data.accountId);
      })
      .catch(() => {});
  }, []);

  const handleToggleCheat = (checked: boolean) => {
    setSimulateCheatMode(checked);
    setIsLoadingDeliverables(true);
    setWorker1Settled(false);
    setWorker2Settled(false);
    setSettleAllStatus("idle");
    onShowToast(
      checked
        ? "⚠️ Test Rejection ON: Simulating a broken deliverable..."
        : "✅ Normal Mode: Re-running real agent deliverables..."
    );
  };

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    fetch("/api/deliverables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: directivePrompt || "",
        simulateBadWorker: simulateCheatMode,
        selectedAgentId: selectedAgent?.id || "copy-agent",
      }),
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data) {
          setDeliverables(data);
          setIsLoadingDeliverables(false);
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.warn("Failed to fetch deliverables", err);
          if (isMounted) setIsLoadingDeliverables(false);
        }
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [directivePrompt, simulateCheatMode, selectedAgent?.id]);

  const handleApproveSingle = async (workerId: 1 | 2, baseAmount: string) => {
    if (!deliverables?.taskId) {
      onShowToast("⚠️ Swarm task verification still in progress. Please wait...");
      return;
    }

    // Check verifier gate before dispatching
    if (workerId === 1 && deliverables.verification?.worker1 && !deliverables.verification.worker1.passed) {
      onShowToast("❌ Verifier Gate: Agent 1 failed checks. Payout blocked!");
      return;
    }
    if (workerId === 2 && deliverables.verification?.worker2 && !deliverables.verification.worker2.passed) {
      onShowToast("❌ Verifier Gate: Agent 2 failed checks. Payout blocked!");
      return;
    }

    onShowToast(`Sending ${baseAmount} NEAR on NEAR Testnet...`);
    try {
      const res = await fetch("/api/settle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: workerId === 1 ? "worker1" : "worker2",
          taskId: deliverables.taskId,
          outputHash: deliverables.outputHash,
        }),
      });
      const data = await res.json();

      if (res.status === 409) {
        onShowToast(`❌ Anti-Double-Spend Guard: ${data.error || "Task already settled!"}`);
        if (workerId === 1) setWorker1Settled(true);
        if (workerId === 2) setWorker2Settled(true);
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to settle payout on NEAR");
      }

      const tx = data.settlements?.[0]?.txHash;
      if (!tx || typeof tx !== "string" || tx.trim().length === 0) {
        throw new Error("Settlement rejected: No verified transaction hash returned from NEAR RPC.");
      }

      if (workerId === 1) setWorker1Settled(true);
      if (workerId === 2) setWorker2Settled(true);

      const isOtherSettledOrBlocked =
        workerId === 1
          ? worker2Settled || (deliverables.verification?.worker2 && !deliverables.verification.worker2.passed)
          : worker1Settled || (deliverables.verification?.worker1 && !deliverables.verification.worker1.passed);

      if (isOtherSettledOrBlocked) {
        setSettleAllStatus("settled");
      }

      onShowToast(`🎉 Settled ${baseAmount} NEAR! Tx: ${tx.slice(0, 10)}...`);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Settlement transaction failed";
      onShowToast(`❌ Settlement Error: ${message}`);
    }
  };

  const activeAgentName =
    deliverables?.selectedAgent?.name || selectedAgent?.name || "CopyAgent v2.1";
  const activeAgentHandle =
    deliverables?.selectedAgent?.handle || selectedAgent?.handle || "@copy-agent.testnet";
  const activeAgentAvatar =
    selectedAgent?.avatar ||
    "https://lh3.googleusercontent.com/aida-public/AB6AXuC01vMHOg-l9YWFwx0B5Q5OZ0BAc076FMNZJuO3Ci5ojsZOESOOHBI9QRfD-lSqVzAk9R207RnJqEHsfs4yt9DiKMKBfoB4JPmkNhY6nS1u9396ohXVgSrqg_OsSF-0cearSkCZ_Vg8jZ7P1LnEDE7wZ1mDwZVQvDqy7bF54quQXpGx1NtFTqmDgyfXFJovwwJ2LB2woZrSGlfuiKU5XCGJBl29-LK3s3vPhVXDkR8";
  const worker2BidNum =
    deliverables?.selectedAgent?.bidNear ?? selectedAgent?.bidNear ?? 0.05;
  const worker2BidStr = worker2BidNum.toFixed(2);
  const bothTotalStr = (0.03 + worker2BidNum).toFixed(2);

  const handleSettleAll = async () => {
    if (!deliverables?.taskId) {
      onShowToast("⚠️ Swarm task verification still in progress. Please wait...");
      return;
    }

    setSettleAllStatus("settling");
    const w1Ok = deliverables.verification?.worker1?.passed ?? true;
    const w2Ok = deliverables.verification?.worker2?.passed ?? true;
    const totalAmount =
      w1Ok && w2Ok
        ? `${bothTotalStr} NEAR`
        : w1Ok
          ? "0.03 NEAR (Agent 2 Blocked)"
          : `${worker2BidStr} NEAR (Agent 1 Blocked)`;

    onShowToast(`Sending payment on NEAR Testnet (${totalAmount})...`);

    try {
      const res = await fetch("/api/settle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: "all",
          taskId: deliverables.taskId,
          outputHash: deliverables.outputHash,
        }),
      });
      const data = await res.json();

      if (res.status === 409) {
        setWorker1Settled(true);
        setWorker2Settled(true);
        setSettleAllStatus("settled");
        onShowToast(`❌ Anti-Double-Spend Guard: ${data.error || "Task already settled!"}`);
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to settle payouts on NEAR");
      }

      const settlements = Array.isArray(data.settlements) ? data.settlements : [];
      const paidList = settlements.filter((s: { status?: string }) => s.status === "paid");

      if (paidList.length === 0) {
        throw new Error("Settlement rejected: No verified transaction hash returned from NEAR RPC.");
      }

      if (deliverables.verification?.worker1?.passed) {
        setWorker1Settled(true);
      }
      if (deliverables.verification?.worker2?.passed) {
        setWorker2Settled(true);
      }
      setSettleAllStatus("settled");
      onShowToast("🎉 Payment confirmed on NEAR Testnet!");
    } catch (err: unknown) {
      setSettleAllStatus("idle");
      const message =
        err instanceof Error ? err.message : "Settlement transaction failed";
      onShowToast(`❌ Settlement Error: ${message}`);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    onShowToast(`Copied ${label} to clipboard`);
  };

  const worker1Passed = deliverables?.verification?.worker1?.passed ?? true;
  const worker1Score = deliverables?.verification?.worker1?.score ?? 100;
  const worker2Passed = deliverables?.verification?.worker2?.passed ?? true;
  const worker2Score = deliverables?.verification?.worker2?.score ?? 100;

  const totalPayoutLabel =
    !worker1Passed && !worker2Passed
      ? "0 NEAR (All Blocked)"
      : worker1Passed && worker2Passed
        ? `${bothTotalStr} NEAR`
        : worker1Passed
          ? "0.03 NEAR (Agent 2 Blocked)"
          : `${worker2BidStr} NEAR (Agent 1 Blocked)`;

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      {/* ── 1. Clean Linear-Style Header ────────────────────────────────────── */}
      <section className="flex flex-col gap-3 pb-4 border-b border-surface-container-high/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-label-mono-xs px-2.5 py-0.5 rounded-md bg-surface-container-high text-on-surface font-semibold tracking-wider">
                {deliverables?.taskId || "AB-TASK"}
              </span>
              {deliverables?.isLive ? (
                <span className="inline-flex items-center gap-1.5 font-label-mono-xs px-2.5 py-0.5 rounded-full bg-tertiary/15 text-tertiary border border-tertiary/25 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
                  Live Gemini AI Output
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 font-label-mono-xs px-2.5 py-0.5 rounded-full bg-surface-container-high/80 text-on-surface-variant">
                  <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant" />
                  Demo Fallback Output
                </span>
              )}
              {isLoadingDeliverables && (
                <span className="inline-flex items-center gap-1 font-label-mono-xs text-primary animate-pulse text-[12px]">
                  <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
                  Agents working...
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
              {deliverables?.taskTitle || "Review & Pay Verified Work"}
            </h1>
            <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
              Check the agents&apos; deliverables below. Our Automated Verifier scores each output — only passing work gets paid in NEAR.
            </p>
          </div>

          {/* Test Rejection Simulation Toggle Pill */}
          <div className="flex items-center gap-3 self-start sm:self-center shrink-0 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container-high/60 border border-amber-500/30">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-mono">
                <input
                  type="checkbox"
                  id="toggle-cheat-mode"
                  checked={simulateCheatMode}
                  onChange={(e) => handleToggleCheat(e.target.checked)}
                  className="w-4 h-4 rounded border-amber-500 text-amber-500 accent-amber-500 cursor-pointer"
                />
                <span className="font-semibold text-amber-400">
                  Test Rejection (Simulate Bad Agent)
                </span>
              </label>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container-high/50">
              <span className="w-2 h-2 rounded-full bg-tertiary" />
              <span className="text-xs font-mono text-on-surface font-semibold">
                Wallet: {managerAccount}
              </span>
            </div>
          </div>
        </div>

        {/* Rejection Simulation Warning Alert Banner */}
        {simulateCheatMode && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-between text-xs font-mono text-amber-300">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-amber-400">warning</span>
              <span>
                <strong>Test Mode Active:</strong> {activeAgentName} is returning broken output. Watch the Verifier reject it, slash reputation (-5), and keep your {worker2BidStr} NEAR safe!
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 uppercase font-bold text-[10px]">
              Payment Guard Demo
            </span>
          </div>
        )}
      </section>

      {/* ── 2. Two Minimalist Deliverable Cards ──────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Worker 1: Research Findings */}
        <article
          className={`flex flex-col justify-between bg-surface-container-low/90 rounded-2xl p-5 border transition-colors shadow-sm ${
            !worker1Passed
              ? "border-red-500/50 bg-red-500/5"
              : "border-surface-container-high/50 hover:border-primary/40"
          }`}
        >
          <div className="space-y-4">
            {/* Worker Header */}
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high/30">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Research agent avatar"
                  className="w-9 h-9 rounded-lg object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgE_PSl9u5mrrQ3p90hs3uE_XYsKDMzKGVxZh67Gt-bWRkq9UKuglboGNgHALWGMSBCZvV3L_BfCHJRyjjqBkJQT28IoPahv_agMeDYUIyN8UQ-qf3cPLEaoMW1_n-SLpqDhfvfMEFbAv6TjsFRssEyUWdIn3TKNtjDOKUzb1Smr4EnIPIBQLdGxUAfpNIggTjusUgHSAHbbbWdQttgs_fGCa7Faih4xriMc7_1Bc"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm text-on-surface">ScrapeScout v3.0</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-primary/10 text-primary font-mono font-medium">Research Agent</span>
                  </div>
                  <span className="text-xs text-on-surface-variant font-mono">@scout-worker.testnet</span>
                </div>
              </div>
              {isLoadingDeliverables ? (
                <span className="px-2 py-0.5 rounded-[2px] font-label-mono-xs bg-surface-container text-on-surface-variant">
                  Inspecting...
                </span>
              ) : worker1Settled ? (
                <span className="stamp-paid animate-stamp-paid">PAID</span>
              ) : worker1Passed ? (
                <span className="px-2 py-0.5 rounded-[2px] font-label-mono-xs font-semibold bg-tertiary-container text-on-tertiary-container border border-tertiary/40">
                  PASSED ({worker1Score}%)
                </span>
              ) : (
                <span className="stamp-rejected animate-stamp-rejected">REJECTED</span>
              )}
            </div>

            {/* Verifier Checklist Pills for Worker 1 */}
            {!isLoadingDeliverables && deliverables?.verification?.worker1?.checks && (
              <div className="flex flex-wrap gap-1.5">
                {deliverables.verification.worker1.checks.map((chk, idx) => (
                  <span
                    key={idx}
                    title={chk.detail}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 border ${
                      chk.pass
                        ? "bg-tertiary/10 text-tertiary border-tertiary/20"
                        : "bg-red-500/10 text-red-400 border-red-500/25"
                    }`}
                  >
                    <span>{chk.pass ? "✓" : "✗"}</span>
                    <span>{chk.name.replace(/ \(> \d+ chars\)/, "")}</span>
                  </span>
                ))}
              </div>
            )}

            {/* Deliverable Title */}
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-outline block mb-1">
                Part 1: Research Findings
              </span>
              <p className="font-semibold text-base text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">satellite_alt</span>
                {deliverables?.worker1.deliverableTitle || "Real-time Intelligence Feed"}
              </p>
            </div>

            {/* Key Metrics Row */}
            <div className="grid grid-cols-3 gap-2.5 py-1">
              <div className="p-2.5 rounded-xl bg-surface-container text-center">
                <span className="text-xs text-on-surface-variant block truncate">
                  {deliverables?.worker1.stats.stat1Label || "Parsed"}
                </span>
                <span className="text-lg font-bold text-on-surface font-mono">
                  {deliverables?.worker1.stats.stat1Value || "842"}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-container text-center">
                <span className="text-xs text-on-surface-variant block truncate">
                  {deliverables?.worker1.stats.stat2Label || "Confidence"}
                </span>
                <span className="text-lg font-bold text-tertiary font-mono">
                  {deliverables?.worker1.stats.stat2Value || "+78%"}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-container text-center">
                <span className="text-xs text-on-surface-variant block truncate">
                  {deliverables?.worker1.stats.stat3Label || "Throughput"}
                </span>
                <span className="text-lg font-bold text-primary font-mono">
                  {deliverables?.worker1.stats.stat3Value || "14.2/s"}
                </span>
              </div>
            </div>

            {/* Topic Clusters Chips */}
            <div className="space-y-1.5">
              <span className="text-xs font-mono text-outline uppercase tracking-wider block">
                Top Keywords
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(deliverables?.worker1.topicClusters || [
                  { tag: "#AiAgents", count: 412 },
                  { tag: "#NEARProtocol", count: 294 },
                  { tag: "#Quittance", count: 188 },
                ]).map((cluster, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-surface-container-high text-xs font-mono text-on-surface"
                  >
                    {cluster.tag}{" "}
                    <span className="text-primary font-semibold">({cluster.count})</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Executive Summary */}
            {deliverables?.worker1.summary && (
              <div className="p-3 rounded-xl bg-surface-container-lowest/80 border border-surface-container-high/30 text-xs text-on-surface-variant leading-relaxed">
                <strong className="text-on-surface block mb-0.5 font-medium">Summary:</strong>
                {deliverables.worker1.summary}
              </div>
            )}
          </div>

          {/* Card Footer */}
          <div className="mt-5 pt-4 border-t border-surface-container-high/40 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs text-outline font-mono block">Agent Fee</span>
              <span className="text-base font-bold text-on-surface font-mono">
                0.03 NEAR
              </span>
            </div>
            {worker1Passed ? (
              <button
                type="button"
                disabled={worker1Settled}
                onClick={() => handleApproveSingle(1, "0.03")}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                  worker1Settled
                    ? "bg-tertiary/20 text-tertiary cursor-default"
                    : "bg-surface-container-high hover:bg-tertiary hover:text-on-tertiary text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">
                  {worker1Settled ? "verified" : "check"}
                </span>
                <span>{worker1Settled ? "Paid 0.03 NEAR" : "Pay 0.03 NEAR"}</span>
              </button>
            ) : (
              <span className="px-3.5 py-2 rounded-lg text-xs font-bold font-mono bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">block</span>
                <span>Payout Blocked (0 NEAR Paid)</span>
              </span>
            )}
          </div>
        </article>

        {/* Worker 2: Creative Synthesis (Pass or Fail in Rejection Test) */}
        <article
          className={`flex flex-col justify-between bg-surface-container-low/90 rounded-2xl p-5 border transition-colors shadow-sm ${
            !worker2Passed
              ? "border-red-500/50 bg-red-500/5"
              : "border-surface-container-high/50 hover:border-secondary/40"
          }`}
        >
          <div className="space-y-4">
            {/* Worker Header */}
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high/30">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Writing agent avatar"
                  className="w-9 h-9 rounded-lg object-cover"
                  src={activeAgentAvatar}
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm text-on-surface">{activeAgentName}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-secondary/15 text-secondary font-mono font-medium">Writing Agent</span>
                  </div>
                  <span className="text-xs text-on-surface-variant font-mono">{activeAgentHandle}</span>
                </div>
              </div>

              {/* Verifier Badge */}
              {isLoadingDeliverables ? (
                <span className="px-2 py-0.5 rounded-[2px] font-label-mono-xs bg-surface-container text-on-surface-variant">
                  Inspecting...
                </span>
              ) : worker2Settled ? (
                <div className="flex items-center gap-1.5">
                  <span className="stamp-paid animate-stamp-paid">PAID</span>
                  <span className="font-label-mono-xs text-tertiary font-semibold">+1 rep</span>
                </div>
              ) : worker2Passed ? (
                <span className="px-2 py-0.5 rounded-[2px] font-label-mono-xs font-semibold bg-tertiary-container text-on-tertiary-container border border-tertiary/40">
                  PASSED ({worker2Score}%)
                </span>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="stamp-rejected animate-stamp-rejected">REJECTED</span>
                  <span className="font-label-mono-xs text-error font-semibold">-5 rep</span>
                </div>
              )}
            </div>

            {/* Verifier Checklist Pills for Worker 2 */}
            {!isLoadingDeliverables && deliverables?.verification?.worker2?.checks && (
              <div className="flex flex-wrap gap-1.5">
                {deliverables.verification.worker2.checks.map((chk, idx) => (
                  <span
                    key={idx}
                    title={chk.detail}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 border ${
                      chk.pass
                        ? "bg-tertiary/10 text-tertiary border-tertiary/20"
                        : "bg-red-500/10 text-red-400 border-red-500/25"
                    }`}
                  >
                    <span>{chk.pass ? "✓" : "✗"}</span>
                    <span>{chk.name.replace(/ \(> \d+ chars\)/, "")}</span>
                  </span>
                ))}
              </div>
            )}

            {/* Verifier Rejection Callout Box (Secret Weapon Proof) */}
            {!worker2Passed && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-xs font-mono space-y-1">
                <div className="flex items-center gap-1.5 text-red-400 font-bold">
                  <span className="material-symbols-outlined text-[16px]">gavel</span>
                  <span>Payment Blocked by Verifier</span>
                </div>
                <p className="text-red-300 text-[11px] leading-relaxed">
                  {deliverables?.verification?.worker2?.reason ||
                    "Deliverable failed automated specification checks."}
                </p>
                <span className="text-outline text-[10px] block pt-0.5">
                  {worker2BidStr} NEAR payout blocked. Funds stay safe in your wallet.
                  {deliverables?.selectedAgent?.slashed &&
                    typeof deliverables.selectedAgent.reputationAfter === "number" && (
                      <strong className="text-amber-400 ml-1">
                        Reputation slashed: {deliverables.selectedAgent.reputationAtSelection} →{" "}
                        {deliverables.selectedAgent.reputationAfter} (-5 penalty)
                      </strong>
                    )}
                </span>
              </div>
            )}

            {/* Segment Tab Toggle */}
            <div className="flex items-center p-1 bg-surface-container rounded-lg border border-surface-container-high/40">
              <button
                type="button"
                onClick={() => setActiveWorker2Tab("copy")}
                className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeWorker2Tab === "copy"
                    ? "bg-secondary text-on-secondary font-semibold shadow-xs"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">description</span>
                <span>Copy (.md)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveWorker2Tab("design")}
                className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeWorker2Tab === "design"
                    ? "bg-secondary text-on-secondary font-semibold shadow-xs"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">palette</span>
                <span>Image Prompt</span>
              </button>
            </div>

            {/* Content Output */}
            {activeWorker2Tab === "copy" ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-outline font-mono">
                  <span>{deliverables?.worker2.filename || "alpha_output.md"}</span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        `${deliverables?.worker2.copyHeadline || ""}\n\n${deliverables?.worker2.copyBody || ""}`,
                        "copy text"
                      )
                    }
                    className="hover:text-on-surface flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[13px]">content_copy</span>
                    <span>Copy</span>
                  </button>
                </div>
                <div
                  className={`p-3.5 rounded-xl border text-xs space-y-1.5 max-h-48 overflow-y-auto ${
                    !worker2Passed
                      ? "bg-red-500/10 border-red-500/30 text-red-200 font-mono"
                      : "bg-surface-container-lowest/90 border-surface-container-high/40 text-on-surface"
                  }`}
                >
                  <p className="font-semibold text-primary font-mono">
                    {deliverables?.worker2.copyHeadline || "⚡ NEAR SWARM INTEL"}
                  </p>
                  <p className="text-on-surface-variant leading-relaxed whitespace-pre-line text-[12px]">
                    {deliverables?.worker2.copyBody ||
                      "Live stream analysis indicates a major developer pivot toward dynamic on-chain swarm routing."}
                  </p>
                </div>
                <span className="text-[11px] text-outline font-mono block text-right">
                  {deliverables?.worker2.wordCount || 140} words • {deliverables?.worker2.readingTime || "40s"} read
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-outline font-mono">
                  <span>Midjourney v6.1 / Flux Spec</span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        deliverables?.worker2.designPrompt || "Cybernetic swarm 8k --ar 16:9",
                        "image prompt"
                      )
                    }
                    className="hover:text-on-surface flex items-center gap-1 cursor-pointer text-secondary font-semibold"
                  >
                    <span className="material-symbols-outlined text-[13px]">content_copy</span>
                    <span>Copy Prompt</span>
                  </button>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-container-lowest/90 border border-surface-container-high/40 text-xs font-mono text-on-surface-variant leading-relaxed max-h-48 overflow-y-auto">
                  {deliverables?.worker2.designPrompt ||
                    "Cybernetic swarm of glowing autonomous micro-agents trading tokens over a decentralized network graph, deep blue and electric cyan luminescence, futuristic UI HUD overlay, hyperdetailed 8k --ar 16:9"}
                </div>
                <div className="flex items-center justify-between text-[11px] text-outline font-mono">
                  <span>Style: <strong className="text-on-surface">{deliverables?.worker2.designStyle || "Cybernetic HUD 8K"}</strong></span>
                  <span>Aspect Ratio: 16:9 Hero</span>
                </div>
              </div>
            )}
          </div>

          {/* Card Footer */}
          <div className="mt-5 pt-4 border-t border-surface-container-high/40 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs text-outline font-mono block">Agent Fee</span>
              <span className="text-base font-bold text-on-surface font-mono">
                {worker2BidStr} NEAR
              </span>
            </div>

            {worker2Passed ? (
              <button
                type="button"
                disabled={worker2Settled}
                onClick={() => handleApproveSingle(2, worker2BidStr)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                  worker2Settled
                    ? "bg-tertiary/20 text-tertiary cursor-default"
                    : "bg-surface-container-high hover:bg-tertiary hover:text-on-tertiary text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">
                  {worker2Settled ? "verified" : "check"}
                </span>
                <span>{worker2Settled ? `Paid ${worker2BidStr} NEAR` : `Pay ${worker2BidStr} NEAR`}</span>
              </button>
            ) : (
              <span className="px-3.5 py-2 rounded-lg text-xs font-bold font-mono bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">block</span>
                <span>Payout Blocked (0 NEAR Paid)</span>
              </span>
            )}
          </div>
        </article>
      </section>

      {/* ── 3. High-Contrast, Unified Settlement Bar ────────────────────────── */}
      <section className="w-full bg-linear-to-r from-surface-container-high via-surface-container to-surface-container-low rounded-2xl p-5 sm:p-6 border border-surface-container-high/50 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-tertiary flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
                Pay Verified Agents
              </span>
              <span className="text-outline text-xs">•</span>
              <span className="text-xs font-mono text-on-surface-variant">
                NEAR Testnet Direct Transfer
              </span>
            </div>
            <p className="text-base sm:text-lg font-bold text-on-surface">
              Total Payout:{" "}
              <span className="text-primary font-mono">
                {totalPayoutLabel}
              </span>{" "}
              to verified agents
            </p>
            <p className="text-xs text-on-surface-variant font-mono">
              From wallet: <code className="text-primary font-semibold">{managerAccount}</code>
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              type="button"
              id="btn-settle-all"
              disabled={
                settleAllStatus === "settled" ||
                settleAllStatus === "settling" ||
                (!worker1Passed && !worker2Passed)
              }
              onClick={handleSettleAll}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold font-mono transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                settleAllStatus === "settled"
                  ? "bg-tertiary text-on-tertiary cursor-default"
                  : !worker1Passed && !worker2Passed
                    ? "bg-red-500/20 text-red-400 border border-red-500/30 cursor-not-allowed"
                    : "bg-linear-to-r from-primary via-primary-fixed-dim to-tertiary text-on-primary-fixed hover:opacity-95 active:scale-[0.99]"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {settleAllStatus === "settled"
                  ? "verified"
                  : settleAllStatus === "settling"
                    ? "progress_activity"
                    : !worker1Passed && !worker2Passed
                      ? "block"
                      : "send"}
              </span>
              <span>
                {settleAllStatus === "settled"
                  ? "Payment Sent!"
                  : settleAllStatus === "settling"
                    ? "Sending on NEAR..."
                    : !worker1Passed && !worker2Passed
                      ? "All Payouts Blocked"
                      : `Pay Verified Agents (${
                          worker1Passed && worker2Passed
                            ? `${bothTotalStr} NEAR`
                            : worker1Passed
                              ? "0.03 NEAR"
                              : `${worker2BidStr} NEAR`
                        })`}
              </span>
            </button>

            <button
              type="button"
              onClick={onReset}
              className="w-full sm:w-auto px-4 py-3 rounded-xl bg-surface-container-highest/60 hover:bg-surface-container-highest text-on-surface text-xs font-mono transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-surface-container-high/40"
            >
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">refresh</span>
              <span>New Task</span>
            </button>
          </div>
        </div>

        {/* Shareable Receipt Link Banner */}
        {deliverables?.taskId && (
          <div className="mt-4 pt-4 border-t border-surface-container-high/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant">
              <span className="material-symbols-outlined text-primary text-[18px]">receipt_long</span>
              <span>Receipt ready for <strong>#{deliverables.taskId}</strong> (includes verifier score &amp; NEAR links)</span>
            </div>

            <Link
              href={`/receipt/${deliverables.taskId}`}
              className="px-4 py-1.5 rounded-lg bg-primary/15 hover:bg-primary/25 text-primary text-xs font-mono font-bold transition-colors flex items-center gap-1 self-start sm:self-center cursor-pointer border border-primary/30"
            >
              <span>Open Receipt Page</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
        )}
      </section>

      {/* ── 4. Collapsible Technical Proofs & Event Log Drawer ────────────────── */}
      <section className="w-full">
        <button
          type="button"
          onClick={() => setShowTechDrawer((prev) => !prev)}
          className="w-full py-2.5 px-4 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs font-mono text-on-surface-variant flex items-center justify-between transition-colors border border-surface-container-high/40 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-primary">terminal</span>
            <span>Technical Details &amp; Activity Log</span>
            {deliverables?.outputHash && (
              <span className="text-[11px] text-outline font-mono hidden sm:inline">
                ({deliverables.outputHash.slice(0, 12)}...)
              </span>
            )}
          </div>
          <span className="material-symbols-outlined text-[18px]">
            {showTechDrawer ? "expand_less" : "expand_more"}
          </span>
        </button>

        {showTechDrawer && (
          <div className="mt-2.5 p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 space-y-3 font-mono text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pb-2 border-b border-surface-container-high/30">
              <div className="flex items-center justify-between p-2 rounded bg-surface-container-low">
                <span className="text-outline">Root Manifest Hash:</span>
                <div className="flex items-center gap-1 text-primary">
                  <span>{deliverables?.outputHash ? `${deliverables.outputHash.slice(0, 14)}...` : "N/A"}</span>
                  {deliverables?.outputHash && (
                    <button
                      type="button"
                      onClick={() => handleCopy(deliverables.outputHash, "root hash")}
                      className="hover:text-on-surface p-0.5"
                    >
                      <span className="material-symbols-outlined text-[13px]">content_copy</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-surface-container-low">
                <span className="text-outline">Committed Rules Hash:</span>
                <div className="flex items-center gap-1 text-tertiary">
                  <span>{deliverables?.rulesHash ? `${deliverables.rulesHash.slice(0, 14)}...` : "0xLocked"}</span>
                  {deliverables?.rulesHash && (
                    <button
                      type="button"
                      onClick={() => handleCopy(deliverables.rulesHash!, "rules hash")}
                      className="hover:text-on-surface p-0.5"
                    >
                      <span className="material-symbols-outlined text-[13px]">content_copy</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-surface-container-low md:col-span-2">
                <span className="text-outline">Anti-Double-Pay Guard:</span>
                <span className="text-tertiary font-semibold">Active &amp; Enforced</span>
              </div>
            </div>

            {/* Event Log Stream */}
            <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
              {(deliverables?.executionEvents || []).map((evt, idx) => (
                <div
                  key={`${evt?.timestamp || idx}-${idx}`}
                  className="flex items-center justify-between gap-2 p-1.5 rounded bg-surface-container-low/60 text-[11px]"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-outline shrink-0">{evt?.timestamp || "--:--:--"}</span>
                    <span className="text-primary font-semibold shrink-0">{evt?.agent}</span>
                    <span className="text-on-surface truncate">{evt?.message}</span>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-semibold shrink-0 ${
                      evt?.level === "warn"
                        ? "text-red-400"
                        : evt?.level === "success"
                          ? "text-tertiary"
                          : "text-outline"
                    }`}
                  >
                    {evt?.level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
