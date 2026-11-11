"use client";

import React, { useEffect, useState } from "react";

interface DeliverablesData {
  taskId: string;
  outputHash: string;
  isLive: boolean;
  taskTitle: string;
  executionEvents?: Array<{
    id: string;
    timestamp: string;
    actor: string;
    action: string;
    status: "dispatched" | "running" | "completed" | "verified";
    durationMs?: number;
    details?: string;
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
  onReset: () => void;
  onShowToast: (msg: string) => void;
}

export function DynamicStepSettlement({
  directivePrompt,
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
  const [payoutMode, setPayoutMode] = useState<"NEAR" | "USDT_INTENTS">("NEAR");

  useEffect(() => {
    let isMounted = true;
    async function loadDeliverables() {
      try {
        setIsLoadingDeliverables(true);
        const res = await fetch("/api/deliverables", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: directivePrompt || "" }),
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setDeliverables(data);
        }
      } catch (err: unknown) {
        console.warn("Failed to fetch dynamic deliverables", err);
      } finally {
        if (isMounted) setIsLoadingDeliverables(false);
      }
    }
    loadDeliverables();
    return () => {
      isMounted = false;
    };
  }, [directivePrompt]);

  const handleApproveSingle = async (workerId: 1 | 2, baseAmount: string) => {
    if (!deliverables?.taskId) {
      onShowToast("⚠️ Swarm task verification still in progress. Please wait...");
      return;
    }

    const tokenDisplay =
      payoutMode === "USDT_INTENTS"
        ? workerId === 1
          ? "0.16 USDT (via Intents)"
          : "0.26 USDT (via Intents)"
        : `${baseAmount} NEAR`;

    onShowToast(`Submitting ${tokenDisplay} settlement on NEAR...`);
    try {
      const res = await fetch("/api/settle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: workerId === 1 ? "worker1" : "worker2",
          taskId: deliverables.taskId,
          outputHash: deliverables.outputHash,
          payoutMode,
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

      if (workerId === 1) setWorker1Settled(true);
      if (workerId === 2) setWorker2Settled(true);
      const tx = data.settlements?.[0]?.txHash;
      onShowToast(
        tx
          ? `🎉 Settled ${tokenDisplay}! Tx: ${tx.slice(0, 10)}...`
          : `🎉 Settled ${tokenDisplay} payout to Worker #${workerId} on NEAR!`
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Settlement transaction failed";
      onShowToast(`❌ Settlement Error: ${message}`);
    }
  };

  const handleSettleAll = async () => {
    if (!deliverables?.taskId) {
      onShowToast("⚠️ Swarm task verification still in progress. Please wait...");
      return;
    }
    setSettleAllStatus("settling");
    const displayTotal =
      payoutMode === "USDT_INTENTS" ? "~0.42 USDT (via NEAR Intents)" : "0.08 NEAR";
    onShowToast(`Broadcasting atomic settlements (${displayTotal}) to NEAR Testnet...`);

    try {
      const res = await fetch("/api/settle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: "all",
          taskId: deliverables.taskId,
          outputHash: deliverables.outputHash,
          payoutMode,
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

      setWorker1Settled(true);
      setWorker2Settled(true);
      setSettleAllStatus("settled");
      onShowToast(
        payoutMode === "USDT_INTENTS"
          ? "🎉 Real NEAR Intents Solver Settlement Confirmed (USDT routed via 1Click Defuse)!"
          : "🎉 Real Agent Treasury Settlement Confirmed on NEAR Testnet!"
      );
    } catch (err: unknown) {
      setSettleAllStatus("idle");
      const message =
        err instanceof Error ? err.message : "Settlement batch transaction failed";
      onShowToast(`❌ Settlement Error: ${message}`);
    }
  };

  const handleCopySha = (sha: string) => {
    navigator.clipboard?.writeText(sha);
    onShowToast(`Copied SHA-256 hash: ${sha}`);
  };

  return (
    <div className="flex flex-col gap-space-lg w-full">
      {/* Main Title & Swarm Pulse Header */}
      <section className="w-full flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
        <div className="space-y-space-xs max-w-3xl">
          <div className="flex items-center gap-space-sm flex-wrap">
            <span className="px-space-sm py-0.5 rounded-full bg-secondary-container/30 text-secondary font-label-mono-xs uppercase tracking-wider font-semibold">
              DAG Finalization Phase
            </span>
            <span className="font-label-mono-xs text-on-surface-variant font-medium bg-surface-container-high/60 px-2 py-0.5 rounded flex items-center gap-1">
              <span>Task ID:</span>
              <strong className="text-primary font-mono">{deliverables?.taskId || "#SWARM-VERIFYING"}</strong>
            </span>
            {deliverables && (
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-label-mono-xs font-semibold border ${
                  deliverables.isLive
                    ? "bg-tertiary/15 text-tertiary border-tertiary/30"
                    : "bg-secondary-container/30 text-secondary border-secondary/30"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    deliverables.isLive ? "bg-tertiary animate-pulse" : "bg-secondary"
                  }`}
                />
                <span>
                  {deliverables.isLive
                    ? "🟢 Live Swarm Generation (Gemini 2.5 Flash)"
                    : "🟡 Fallback Preset (Offline / Default)"}
                </span>
              </div>
            )}
            {isLoadingDeliverables && (
              <span className="inline-flex items-center gap-1 font-label-mono-xs text-primary animate-pulse">
                <span className="material-symbols-outlined text-[14px]">
                  auto_awesome
                </span>
                Generating Parallel Swarm Deliverables...
              </span>
            )}
          </div>
          <h1 className="font-headline-lg text-on-surface tracking-tight font-semibold">
            {deliverables?.taskTitle ||
              "Deliverables Verification & Agent Treasury Settlement"}
          </h1>
          <p className="font-body-lg text-on-surface-variant">
            Both hired worker agents completed their assigned sub-tasks in parallel.
            Inspect the cryptographic deliverables below, verify the root SHA-256 manifest hash, and trigger on-chain settlement payouts.
          </p>
          {deliverables?.outputHash && (
            <div className="flex items-center gap-2 font-label-mono-xs text-on-surface-variant pt-1">
              <span className="text-outline">Root Manifest Hash:</span>
              <code className="text-primary bg-surface-container-lowest px-2 py-0.5 rounded border border-surface-container-high/40">
                {deliverables.outputHash.slice(0, 16)}...{deliverables.outputHash.slice(-10)}
              </code>
              <button
                type="button"
                onClick={() => handleCopySha(deliverables.outputHash)}
                className="hover:text-on-surface p-1 rounded hover:bg-surface-container-highest transition-colors cursor-pointer"
                title="Copy Root Manifest Hash"
              >
                <span className="material-symbols-outlined text-[14px]">
                  content_copy
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Execution Badge */}
        <div className="flex items-center gap-space-sm px-space-md py-space-sm rounded-xl bg-surface-container-low shadow-lg self-start lg:self-center shrink-0 border border-surface-container-high/40">
          <div className="relative flex items-center justify-center w-3 h-3">
            <span className="absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary" />
          </div>
          <div className="flex flex-col">
            <span className="font-label-mono-xs text-tertiary uppercase font-semibold">
              Execution Complete
            </span>
            <span className="font-label-mono-sm text-on-surface">
              2 of 2 Verified by Manager Node
            </span>
          </div>
        </div>
      </section>

      {/* Visual Artifacts & Deliverables Inspection Grid */}
      <section className="w-full grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
        {/* Worker 1 Card */}
        <article className="flex flex-col justify-between bg-surface-container-low/90 backdrop-blur-md rounded-xl p-space-lg shadow-xl hover:shadow-[0_0_24px_rgba(6,182,212,0.15)] transition-all relative overflow-hidden group border border-surface-container-high/40">
          <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-primary via-primary-container to-transparent opacity-75" />

          <div className="space-y-space-md">
            {/* Worker Header Info */}
            <div className="flex items-start justify-between gap-space-sm">
              <div className="flex items-center gap-space-md">
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="Cybernetic agent avatar"
                    className="w-12 h-12 rounded-xl object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgE_PSl9u5mrrQ3p90hs3uE_XYsKDMzKGVxZh67Gt-bWRkq9UKuglboGNgHALWGMSBCZvV3L_BfCHJRyjjqBkJQT28IoPahv_agMeDYUIyN8UQ-qf3cPLEaoMW1_n-SLpqDhfvfMEFbAv6TjsFRssEyUWdIn3TKNtjDOKUzb1Smr4EnIPIBQLdGxUAfpNIggTjusUgHSAHbbbWdQttgs_fGCa7Faih4xriMc7_1Bc"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-tertiary flex items-center justify-center text-on-tertiary">
                    <span className="material-symbols-outlined text-[10px] font-bold">
                      check
                    </span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-space-xs">
                    <span className="font-headline-sm font-semibold text-on-surface">
                      ScrapeScout v3.0
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-surface-container-high font-label-mono-xs text-primary">
                      Data Node
                    </span>
                  </div>
                  <span className="font-label-mono-sm text-on-surface-variant">
                    @scout-worker.testnet
                  </span>
                </div>
              </div>

              {/* Proof Tag */}
              <div className="flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-tertiary-container/20 text-tertiary">
                <span className="material-symbols-outlined text-[14px]">
                  format_image_left
                </span>
                <span className="font-label-mono-xs font-semibold">
                  Proof Committed
                </span>
              </div>
            </div>

            {/* Deliverable Spec */}
            <div className="p-space-md rounded-lg bg-surface-container-lowest/80 space-y-space-sm border border-surface-container-high/30">
              <div className="flex items-center justify-between">
                <span className="font-label-mono-xs text-on-surface-variant uppercase tracking-wider">
                  Deliverable Unit
                </span>
                <span className="font-label-mono-xs text-outline">
                  Runtime: {deliverables?.worker1.runtime || "1.14s"}
                </span>
              </div>
              <p className="font-title-md text-on-surface font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">
                  satellite_alt
                </span>
                {deliverables?.worker1.deliverableTitle ||
                  "Real-time Social Sentiment Feed"}
              </p>
              <div className="flex items-center gap-space-xs font-label-mono-xs text-on-surface-variant overflow-x-auto py-1">
                <span className="text-outline">Sha256:</span>
                <code className="text-primary truncate">
                  {deliverables?.worker1.sha256
                    ? `${deliverables.worker1.sha256.slice(0, 10)}...${deliverables.worker1.sha256.slice(-8)}`
                    : "0x98f4c1e...d733b1e9"}
                </code>
                <button
                  type="button"
                  onClick={() =>
                    handleCopySha(
                      deliverables?.worker1.sha256 ||
                        "0x98f4c1e34b9d09a888c3f4e156d733b1e9",
                    )
                  }
                  className="hover:text-on-surface ml-1 p-0.5 rounded hover:bg-surface-container-highest transition-colors cursor-pointer"
                  title="Copy Sha256"
                >
                  <span className="material-symbols-outlined text-[13px]">
                    content_copy
                  </span>
                </button>
              </div>
            </div>

            {/* Rich Data Visualization */}
            <div className="space-y-space-sm">
              <div className="grid grid-cols-3 gap-space-sm">
                <div className="p-space-sm rounded-lg bg-surface-container text-center border border-surface-container-high/30">
                  <span className="font-label-mono-xs text-on-surface-variant block truncate">
                    {deliverables?.worker1.stats.stat1Label || "Posts Parsed"}
                  </span>
                  <span className="font-headline-sm text-on-surface font-bold">
                    {deliverables?.worker1.stats.stat1Value || "842"}
                  </span>
                </div>
                <div className="p-space-sm rounded-lg bg-surface-container text-center border border-surface-container-high/30">
                  <span className="font-label-mono-xs text-on-surface-variant block truncate">
                    {deliverables?.worker1.stats.stat2Label || "Sentiment"}
                  </span>
                  <span className="font-headline-sm text-tertiary font-bold">
                    {deliverables?.worker1.stats.stat2Value || "+78%"}
                  </span>
                </div>
                <div className="p-space-sm rounded-lg bg-surface-container text-center border border-surface-container-high/30">
                  <span className="font-label-mono-xs text-on-surface-variant block truncate">
                    {deliverables?.worker1.stats.stat3Label || "Throughput"}
                  </span>
                  <span className="font-headline-sm text-primary font-bold">
                    {deliverables?.worker1.stats.stat3Value || "14.2/s"}
                  </span>
                </div>
              </div>

              {/* Sparkline Curve */}
              <div className="p-space-sm rounded-lg bg-surface-container-lowest/60 flex items-center justify-between gap-space-md border border-surface-container-high/30">
                <div className="flex flex-col">
                  <span className="font-label-mono-xs text-on-surface-variant">
                    Sentiment Delta Stream
                  </span>
                  <span className="font-label-mono-sm text-tertiary font-medium">
                    Stream Status: Active &amp; Synced
                  </span>
                </div>
                <div className="w-36 h-8">
                  <svg
                    className="w-full h-full text-tertiary"
                    fill="none"
                    viewBox="0 0 120 30"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0 24L15 22L30 18L45 20L60 12L75 14L90 6L105 8L120 2"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                    <path
                      d="M0 24L15 22L30 18L45 20L60 12L75 14L90 6L105 8L120 2V30H0Z"
                      fill="currentColor"
                      fillOpacity="0.1"
                    />
                  </svg>
                </div>
              </div>

              {/* Top Keywords Cloud */}
              <div className="p-space-sm rounded-lg bg-surface-container space-y-1.5 border border-surface-container-high/30">
                <span className="font-label-mono-xs text-outline uppercase tracking-wider">
                  Top Topic Clusters
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {deliverables?.worker1.topicClusters ? (
                    deliverables.worker1.topicClusters.map((cluster, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded bg-surface-container-high font-label-mono-xs text-on-surface"
                      >
                        {cluster.tag}{" "}
                        <span className="text-primary font-semibold">
                          ({cluster.count})
                        </span>
                      </span>
                    ))
                  ) : (
                    <>
                      <span className="px-2 py-1 rounded bg-surface-container-high font-label-mono-xs text-on-surface">
                        #AiAgents{" "}
                        <span className="text-primary font-semibold">(412)</span>
                      </span>
                      <span className="px-2 py-1 rounded bg-surface-container-high font-label-mono-xs text-on-surface">
                        #NEARProtocol{" "}
                        <span className="text-primary font-semibold">(294)</span>
                      </span>
                      <span className="px-2 py-1 rounded bg-surface-container-high font-label-mono-xs text-on-surface">
                        #autonomous_treasury{" "}
                        <span className="text-tertiary font-semibold">(188)</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Worker 1 Treasury Settlement Footer */}
          <div className="mt-space-lg pt-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm bg-surface-container/50 -mx-space-lg -mb-space-lg p-space-lg border-t border-surface-container-high/40">
            <div className="flex flex-col">
              <span className="font-label-mono-xs text-on-surface-variant uppercase">
                Encumbered Treasury
              </span>
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[18px]">
                  toll
                </span>
                <span className="font-headline-sm text-on-surface font-bold">
                  {payoutMode === "NEAR" ? "0.03 NEAR" : "~0.16 USDT"}
                </span>
              </div>
            </div>

            <button
              type="button"
              id="btn-release-worker-1"
              disabled={worker1Settled}
              onClick={() => handleApproveSingle(1, "0.03")}
              className={`px-space-md py-2.5 rounded-lg font-title-md transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer ${
                worker1Settled
                  ? "bg-tertiary/20 text-tertiary font-bold cursor-default"
                  : "bg-surface-container-high hover:bg-tertiary hover:text-on-tertiary text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {worker1Settled ? "verified" : "check_circle"}
              </span>
              <span>
                {worker1Settled
                  ? `Settled ${payoutMode === "NEAR" ? "0.03 NEAR" : "~0.16 USDT"}`
                  : `Approve & Release ${payoutMode === "NEAR" ? "0.03 NEAR" : "~0.16 USDT"}`}
              </span>
            </button>
          </div>
        </article>

        {/* Worker 2 Card */}
        <article className="flex flex-col justify-between bg-surface-container-low/90 backdrop-blur-md rounded-xl p-space-lg shadow-xl hover:shadow-[0_0_24px_rgba(139,92,246,0.15)] transition-all relative overflow-hidden group border border-surface-container-high/40">
          <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-secondary-container via-secondary to-transparent opacity-75" />

          <div className="space-y-space-md">
            {/* Worker Header Info */}
            <div className="flex items-start justify-between gap-space-sm">
              <div className="flex items-center gap-space-md">
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="Autonomous synthetic intelligence scribe avatar"
                    className="w-12 h-12 rounded-xl object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC01vMHOg-l9YWFwx0B5Q5OZ0BAc076FMNZJuO3Ci5ojsZOESOOHBI9QRfD-lSqVzAk9R207RnJqEHsfs4yt9DiKMKBfoB4JPmkNhY6nS1u9396ohXVgSrqg_OsSF-0cearSkCZ_Vg8jZ7P1LnEDE7wZ1mDwZVQvDqy7bF54quQXpGx1NtFTqmDgyfXFJovwwJ2LB2woZrSGlfuiKU5XCGJBl29-LK3s3vPhVXDkR8"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-tertiary flex items-center justify-center text-on-tertiary">
                    <span className="material-symbols-outlined text-[10px] font-bold">
                      check
                    </span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-space-xs">
                    <span className="font-headline-sm font-semibold text-on-surface">
                      CopyAgent v2.1
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-surface-container-high font-label-mono-xs text-secondary">
                      Synthesis Node
                    </span>
                  </div>
                  <span className="font-label-mono-sm text-on-surface-variant">
                    @copy-agent.testnet
                  </span>
                </div>
              </div>

              {/* Proof Tag */}
              <div className="flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-tertiary-container/20 text-tertiary">
                <span className="material-symbols-outlined text-[14px]">
                  auto_stories
                </span>
                <span className="font-label-mono-xs font-semibold">
                  Verified &amp; Formatted
                </span>
              </div>
            </div>

            {/* Deliverable Spec */}
            <div className="p-space-md rounded-lg bg-surface-container-lowest/80 space-y-space-sm border border-surface-container-high/30">
              <div className="flex items-center justify-between">
                <span className="font-label-mono-xs text-on-surface-variant uppercase tracking-wider">
                  Deliverable Unit
                </span>
                <span className="font-label-mono-xs text-outline">
                  Runtime: {deliverables?.worker2.runtime || "1.16s"}
                </span>
              </div>
              <p className="font-title-md text-on-surface font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[18px]">
                  description
                </span>
                {deliverables?.worker2.deliverableTitle ||
                  "Executive Alpha Digest & Thread"}
              </p>
              <div className="flex items-center gap-space-xs font-label-mono-xs text-on-surface-variant overflow-x-auto py-1">
                <span className="text-outline">Sha256:</span>
                <code className="text-secondary truncate">
                  {deliverables?.worker2.sha256
                    ? `${deliverables.worker2.sha256.slice(0, 10)}...${deliverables.worker2.sha256.slice(-8)}`
                    : "0xfa7723c...981bb204"}
                </code>
                <button
                  type="button"
                  onClick={() =>
                    handleCopySha(
                      deliverables?.worker2.sha256 ||
                        "0xfa7723ce51a84f3e981bb204cc1948",
                    )
                  }
                  className="hover:text-on-surface ml-1 p-0.5 rounded hover:bg-surface-container-highest transition-colors cursor-pointer"
                  title="Copy Sha256"
                >
                  <span className="material-symbols-outlined text-[13px]">
                    content_copy
                  </span>
                </button>
              </div>
            </div>

            {/* Dynamic Content Tabs (Copy vs 4K Design Prompt) */}
            <div className="flex items-center gap-1.5 p-1 bg-surface-container rounded-lg border border-surface-container-high/40">
              <button
                type="button"
                onClick={() => setActiveWorker2Tab("copy")}
                className={`flex-1 py-1.5 px-3 rounded-md font-label-mono-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeWorker2Tab === "copy"
                    ? "bg-secondary text-on-secondary font-semibold shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">
                  article
                </span>
                <span>Copy Deliverable (.md)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveWorker2Tab("design")}
                className={`flex-1 py-1.5 px-3 rounded-md font-label-mono-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeWorker2Tab === "design"
                    ? "bg-secondary text-on-secondary font-semibold shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">
                  palette
                </span>
                <span>4K Design Prompt</span>
              </button>
            </div>

            {/* Content Preview Terminal Box */}
            <div className="rounded-lg bg-surface-container-lowest p-space-md space-y-space-xs shadow-inner border border-surface-container-high/30">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-surface-container-highest" />
                  <span className="w-2.5 h-2.5 rounded-full bg-surface-container-highest" />
                  <span className="w-2.5 h-2.5 rounded-full bg-surface-container-highest" />
                  <span className="font-label-mono-xs text-outline ml-2">
                    {activeWorker2Tab === "copy"
                      ? deliverables?.worker2.filename || "alpha_thread_output.md"
                      : "midjourney_flux_prompt.txt"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {activeWorker2Tab === "design" && deliverables?.worker2.designStyle && (
                    <span className="font-label-mono-xs px-2 py-0.5 rounded bg-surface-container text-secondary">
                      {deliverables.worker2.designStyle}
                    </span>
                  )}
                  <span className="font-label-mono-xs text-tertiary">
                    Ready to Publish
                  </span>
                </div>
              </div>

              {activeWorker2Tab === "copy" ? (
                <div className="p-space-sm rounded bg-surface-container-low font-body-sm text-on-surface space-y-2 select-all border border-surface-container-high/30">
                  <p className="font-label-mono-sm text-primary font-semibold">
                    {deliverables?.worker2.copyHeadline ||
                      "⚡ NEAR AUTONOMOUS SWARM INTEL"}
                  </p>
                  <p className="text-on-surface-variant leading-relaxed text-[13px] whitespace-pre-line">
                    {deliverables?.worker2.copyBody ||
                      "Live stream analysis indicates a major developer pivot toward dynamic on-chain swarm routing. Sentiment remains at +78% positive following NEAR Testnet launch. Treasury engine settlement models show instantaneous sub-second verifications, outperforming legacy oracle pipelines..."}
                  </p>
                </div>
              ) : (
                <div className="p-space-sm rounded bg-surface-container-low font-body-sm text-on-surface space-y-3 select-all border border-surface-container-high/30">
                  <div className="flex items-center justify-between">
                    <span className="font-label-mono-xs text-primary font-semibold uppercase">
                      Midjourney v6.1 / Flux 4K Spec
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const promptText =
                          deliverables?.worker2.designPrompt ||
                          "Cybernetic swarm of glowing autonomous micro-agents trading tokens over a decentralized network graph, deep blue and electric cyan luminescence, futuristic UI HUD overlay, hyperdetailed 8k --ar 16:9";
                        navigator.clipboard?.writeText(promptText);
                        onShowToast("🎨 Copied 4K Image Prompt to clipboard!");
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container-high hover:bg-surface-bright text-secondary font-label-mono-xs transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        content_copy
                      </span>
                      <span>Copy Prompt</span>
                    </button>
                  </div>
                  <p className="font-label-mono-xs text-on-surface-variant leading-relaxed bg-surface-container-lowest/80 p-space-sm rounded border border-surface-container-high/30">
                    {deliverables?.worker2.designPrompt ||
                      "Cybernetic swarm of glowing autonomous micro-agents trading tokens over a decentralized network graph, deep blue and electric cyan luminescence, futuristic UI HUD overlay, hyperdetailed 8k --ar 16:9"}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="font-label-mono-xs text-on-surface-variant">
                  {activeWorker2Tab === "copy" ? (
                    <>
                      Word Count:{" "}
                      <span className="text-on-surface font-semibold">
                        {deliverables?.worker2.wordCount || 142} words (
                        {deliverables?.worker2.readingTime || "45s"})
                      </span>
                    </>
                  ) : (
                    <span>Aspect Ratio: <span className="text-on-surface font-semibold">16:9 (Hero Banner)</span></span>
                  )}
                </span>
                <span className="font-label-mono-xs text-tertiary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">
                    auto_awesome
                  </span>
                  Generated by Gemini 2.5 Flash
                </span>
              </div>
            </div>
          </div>

          {/* Worker 2 Treasury Settlement Footer */}
          <div className="mt-space-lg pt-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm bg-surface-container/50 -mx-space-lg -mb-space-lg p-space-lg border-t border-surface-container-high/40">
            <div className="flex flex-col">
              <span className="font-label-mono-xs text-on-surface-variant uppercase">
                Encumbered Treasury
              </span>
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-secondary text-[18px]">
                  toll
                </span>
                <span className="font-headline-sm text-on-surface font-bold">
                  {payoutMode === "NEAR" ? "0.05 NEAR" : "~0.26 USDT"}
                </span>
              </div>
            </div>

            <button
              type="button"
              id="btn-release-worker-2"
              disabled={worker2Settled}
              onClick={() => handleApproveSingle(2, "0.05")}
              className={`px-space-md py-2.5 rounded-lg font-title-md transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer ${
                worker2Settled
                  ? "bg-tertiary/20 text-tertiary font-bold cursor-default"
                  : "bg-surface-container-high hover:bg-tertiary hover:text-on-tertiary text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {worker2Settled ? "verified" : "check_circle"}
              </span>
              <span>
                {worker2Settled
                  ? `Settled ${payoutMode === "NEAR" ? "0.05 NEAR" : "~0.26 USDT"}`
                  : `Approve & Release ${payoutMode === "NEAR" ? "0.05 NEAR" : "~0.26 USDT"}`}
              </span>
            </button>
          </div>
        </article>
      </section>

      {/* Real Parallel Swarm Execution Log */}
      {deliverables?.executionEvents && deliverables.executionEvents.length > 0 && (
        <section className="w-full bg-surface-container-low/90 backdrop-blur-md rounded-xl p-space-md border border-surface-container-high/40 shadow-lg">
          <div className="flex items-center justify-between pb-space-sm border-b border-surface-container-high/40 mb-space-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">
                terminal
              </span>
              <span className="font-title-sm text-on-surface font-semibold">
                Parallel Swarm Execution Event Stream
              </span>
              <span className="font-label-mono-xs px-2 py-0.5 rounded bg-surface-container text-tertiary">
                Real Duration Metrics
              </span>
            </div>
            <span className="font-label-mono-xs text-on-surface-variant font-mono">
              Task: {deliverables.taskId}
            </span>
          </div>

          <div className="space-y-1.5 font-label-mono-xs max-h-48 overflow-y-auto pr-1">
            {deliverables.executionEvents.map((evt) => (
              <div
                key={evt.id}
                className="flex items-center justify-between gap-2 p-1.5 rounded bg-surface-container-lowest/60 hover:bg-surface-container-lowest transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-outline shrink-0">
                    {new Date(evt.timestamp).toLocaleTimeString([], {
                      hour12: false,
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                  <span
                    className={`font-semibold shrink-0 ${
                      evt.actor.includes("scout")
                        ? "text-primary"
                        : evt.actor.includes("copy")
                          ? "text-secondary"
                          : "text-tertiary"
                    }`}
                  >
                    {evt.actor}
                  </span>
                  <span className="text-on-surface truncate">
                    {evt.action}
                  </span>
                  {evt.details && (
                    <span className="text-on-surface-variant truncate text-[11px] hidden sm:inline">
                      ({evt.details})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {evt.durationMs !== undefined && (
                    <span className="text-outline font-mono">
                      +{evt.durationMs}ms
                    </span>
                  )}
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold ${
                      evt.status === "verified"
                        ? "bg-tertiary/20 text-tertiary"
                        : evt.status === "completed"
                          ? "bg-primary/20 text-primary"
                          : "bg-surface-container-high text-on-surface-variant"
                    }`}
                  >
                    {evt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* One-Click Settle All & Finalization Box */}
      <section className="w-full">
        <div className="w-full bg-linear-to-b from-surface-container-high via-surface-container to-surface-container-low rounded-xl p-space-lg lg:p-space-xl shadow-2xl relative overflow-hidden border border-surface-container-high/40">
          <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-tertiary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -top-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-space-xl">
            {/* Dispatch Info */}
            <div className="space-y-space-md max-w-2xl">
              <div className="flex items-center gap-space-sm">
                <div className="w-7 h-7 rounded-md bg-tertiary-container/30 text-tertiary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">
                    verified_user
                  </span>
                </div>
                <span className="font-title-md text-tertiary font-semibold tracking-wide">
                  Agent Treasury Engine Payout Dispatch
                </span>
              </div>

              {/* Currency / Settlement Rail Toggle */}
              <div className="p-space-sm rounded-xl bg-surface-container-lowest/80 border border-surface-container-high/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-label-mono-xs text-outline uppercase tracking-wider font-semibold">
                    Settlement Rail &amp; Payout Currency
                  </span>
                  <span className="font-label-mono-xs text-tertiary">
                    {payoutMode === "NEAR" ? "Direct Native Transfer" : "1Click Solver Market"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPayoutMode("NEAR")}
                    className={`px-3 py-2 rounded-lg text-left transition-all border cursor-pointer ${
                      payoutMode === "NEAR"
                        ? "bg-primary/10 border-primary text-on-surface shadow-sm"
                        : "bg-surface-container-high/30 border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-label-mono-xs font-bold text-primary">
                      <span className="material-symbols-outlined text-[16px]">toll</span>
                      <span>NEAR (Direct On-Chain)</span>
                    </div>
                    <p className="font-label-mono-xs text-on-surface-variant mt-0.5 text-[11px]">
                      0.08 NEAR total • native transfer
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayoutMode("USDT_INTENTS")}
                    className={`px-3 py-2 rounded-lg text-left transition-all border cursor-pointer ${
                      payoutMode === "USDT_INTENTS"
                        ? "bg-secondary/10 border-secondary text-on-surface shadow-sm"
                        : "bg-surface-container-high/30 border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-label-mono-xs font-bold text-secondary">
                      <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                      <span>USDT (NEAR Intents)</span>
                    </div>
                    <p className="font-label-mono-xs text-on-surface-variant mt-0.5 text-[11px]">
                      ~0.42 USDT • 1Click Defuse Solver
                    </p>
                  </button>
                </div>
              </div>

              <p className="font-headline-sm text-on-surface font-semibold">
                Total to Payout:{" "}
                <span className="text-primary font-bold">
                  {payoutMode === "NEAR" ? "0.08 NEAR" : "~0.42 USDT"}
                </span>{" "}
                to 2 worker wallets via{" "}
                {payoutMode === "NEAR"
                  ? "atomic NEAR transfers"
                  : "NEAR Intents solver route (1Click Defuse)"}
              </p>

              <p className="font-body-md text-on-surface-variant leading-relaxed text-[13px]">
                Execution signatures from{" "}
                <code className="text-on-surface bg-surface-container-lowest px-1.5 py-0.5 rounded">
                  @scout-worker.testnet
                </code>{" "}
                and{" "}
                <code className="text-on-surface bg-surface-container-lowest px-1.5 py-0.5 rounded">
                  @copy-agent.testnet
                </code>{" "}
                have been cryptographically verified against the swarm
                manifest. Releasing funds commits final settlement transactions.
              </p>

              <div className="flex flex-wrap items-center gap-space-md pt-space-xs font-label-mono-xs text-on-surface-variant">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-tertiary">
                    check
                  </span>
                  Gas Fee: &lt; 0.00018 NEAR
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-tertiary">
                    check
                  </span>
                  Double-Pay Protection: Enforced
                </span>
                <a
                  className="text-primary hover:underline flex items-center gap-1 group"
                  href="https://testnet.nearblocks.io"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <span>
                    View Testnet Explorer
                  </span>
                  <span className="material-symbols-outlined text-[12px] group-hover:translate-x-0.5 transition-transform">
                    open_in_new
                  </span>
                </a>
              </div>
            </div>

            {/* Actions Stack */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-space-md shrink-0">
              <button
                type="button"
                id="btn-settle-all"
                disabled={
                  settleAllStatus === "settled" ||
                  settleAllStatus === "settling"
                }
                onClick={handleSettleAll}
                className={`px-space-xl py-space-md rounded-xl font-headline-sm font-bold shadow-[0_0_32px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-space-sm group cursor-pointer ${
                  settleAllStatus === "settled"
                    ? "bg-tertiary text-on-tertiary cursor-default"
                    : "bg-linear-to-r from-primary via-primary-fixed-dim to-tertiary text-on-primary-fixed hover:shadow-[0_0_40px_rgba(78,222,163,0.6)] hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">
                  {settleAllStatus === "settled"
                    ? "verified"
                    : settleAllStatus === "settling"
                      ? "progress_activity"
                      : "lock_open"}
                </span>
                <span>
                  {settleAllStatus === "settled"
                    ? `Settlement Complete (${payoutMode === "NEAR" ? "0.08 NEAR" : "~0.42 USDT"})`
                    : settleAllStatus === "settling"
                      ? "Executing Settlement..."
                      : `Settle All Payouts (${payoutMode === "NEAR" ? "0.08 NEAR" : "~0.42 USDT"})`}
                </span>
                {settleAllStatus === "idle" && (
                  <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                )}
              </button>

              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={onReset}
                  className="px-space-md py-space-sm rounded-lg bg-surface-container-highest/60 hover:bg-surface-container-highest text-on-surface font-title-md transition-colors flex items-center gap-space-xs text-center w-full justify-center cursor-pointer border border-surface-container-high/40"
                >
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                    refresh
                  </span>
                  <span>Start New Swarm Objective</span>
                </button>
              </div>
            </div>
          </div>

          {/* Success Banner */}
          {settleAllStatus === "settled" && (
            <div className="mt-space-lg p-space-md rounded-lg bg-tertiary-container/30 border border-tertiary/40 flex items-center justify-between text-on-surface animate-in fade-in duration-300">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-tertiary text-[24px]">
                  verified
                </span>
                <div>
                  <p className="font-title-md font-semibold text-tertiary">
                    {payoutMode === "USDT_INTENTS"
                      ? "NEAR Intents Solver Settlement Confirmed"
                      : "Agent Treasury Engine Payout Settled Successfully"}
                  </p>
                  <p className="font-body-sm text-on-surface-variant">
                    {payoutMode === "USDT_INTENTS"
                      ? "Solved via 1Click Defuse market. All worker nodes compensated in USDT."
                      : "Committed on NEAR Testnet. All worker nodes compensated in NEAR."}
                  </p>
                </div>
              </div>
              <span className="font-label-mono-xs px-2 py-1 rounded bg-tertiary text-on-tertiary font-bold uppercase">
                Settled
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Telemetry Footer Bar */}
      <section className="w-full pt-space-xs pb-space-lg">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-space-sm p-space-md rounded-xl bg-surface-container-lowest/80 backdrop-blur-md border border-surface-container-high/30">
          <div className="flex items-center gap-space-sm text-on-surface-variant font-label-mono-xs flex-wrap">
            <span className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_8px_rgba(78,222,163,0.8)]" />
            <span>
              Swarm Execution:{" "}
              <strong className="text-on-surface">
                {deliverables?.worker1?.runtime && deliverables?.worker2?.runtime
                  ? `Parallel (${deliverables.worker1.runtime} / ${deliverables.worker2.runtime})`
                  : "2.3s parallel"}
              </strong>
            </span>
            <span className="text-outline">•</span>
            <span>
              Status:{" "}
              <strong className="text-tertiary">
                {deliverables?.isLive ? "Verified Live Swarm Output" : "Verified Presets"}
              </strong>
            </span>
            <span className="text-outline">•</span>
            <span>Anti-Double-Pay Protection: Active</span>
          </div>

          <div className="flex items-center gap-space-md font-label-mono-xs text-on-surface-variant flex-wrap">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-primary">
                verified
              </span>
              <span>Root Hash: {deliverables?.outputHash ? `${deliverables.outputHash.slice(0, 10)}...` : "Computing"}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-secondary">
                account_balance_wallet
              </span>
              <span>Treasury Rail: {payoutMode === "NEAR" ? "NEAR Direct" : "Intents Solver (USDT)"}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
