"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Navbar, Footer } from "@/components/shared";
import { ToastNotification } from "@/components/creation";

interface ReceiptData {
  taskId: string;
  directivePrompt: string;
  outputHash: string;
  createdAt: number;
  status: string;
  isLive: boolean;
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
    worker1: { passed: boolean; score: number; reason: string; charCount: number; checks?: Array<{ name: string; pass: boolean }> };
    worker2: { passed: boolean; score: number; reason: string; charCount: number; checks?: Array<{ name: string; pass: boolean }> };
  };
  deliverables?: {
    worker1Title: string;
    worker1Summary: string;
    worker2Title: string;
    worker2Headline: string;
    worker2Body: string;
    worker2DesignPrompt: string;
  };
  settlements?: Array<{
    worker: string;
    agentName?: string;
    agentHandle?: string;
    amount: string;
    txHash: string;
    explorerUrl: string;
    status?: "paid" | "rejected";
    reason?: string;
  }>;
  managerAccount: string;
}

function ReceiptContent() {
  const params = useParams();
  const taskId = (params?.taskId as string) || "UNKNOWN-TASK";
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((c) => (c === msg ? null : c));
    }, 2500);
  };

  useEffect(() => {
    async function fetchReceipt() {
      try {
        setLoading(true);
        setNotFound(false);
        const res = await fetch(
          `/api/receipt?taskId=${encodeURIComponent(taskId)}`,
        );
        if (res.ok) {
          const data = await res.json();
          setReceipt(data);
        } else if (res.status === 404) {
          setNotFound(true);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.warn("Failed to load receipt:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchReceipt();
  }, [taskId]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      showToast("📋 Shareable receipt link copied to clipboard!");
    }
  };

  if (loading && !receipt && !notFound) {
    return (
      <>
        <Navbar />
        <main className="w-full pt-32 pb-16 bg-background min-h-screen flex items-center justify-center font-mono text-sm text-outline">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary animate-spin">
              progress_activity
            </span>
            <span>Loading verified on-chain receipt for #{taskId}...</span>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Milestone 1 Fix: Honest 404 State for non-existent or unexecuted tasks
  if (notFound || (!receipt && !loading)) {
    return (
      <>
        <Navbar />
        <main className="w-full pt-28 pb-16 bg-background min-h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-md mx-auto p-6 rounded-2xl bg-surface-container-low border border-surface-container-high/60 text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">search_off</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-surface">Receipt Not Found (404)</h2>
              <p className="text-xs text-on-surface-variant font-mono mt-1">
                No verified execution receipt exists for task <strong>#{taskId}</strong>.
              </p>
            </div>
            <p className="text-[11px] text-outline font-mono leading-relaxed">
              AgentBounty receipts are minted only when a task successfully passes the Automated Verifier Gate and executes on NEAR Testnet.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <Link
                href="/"
                className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-mono transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/create-task"
                className="px-4 py-2 rounded-xl bg-primary text-on-primary-fixed text-xs font-mono font-bold hover:opacity-90 inline-flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-[15px]">add_circle</span>
                <span>Create New Task</span>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="w-full pt-20 pb-16 bg-background min-h-screen">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs font-mono text-outline">
            <Link href="/" className="hover:text-primary transition-colors">
              AgentBounty
            </Link>
            <span>/</span>
            <Link
              href="/create-task"
              className="hover:text-primary transition-colors"
            >
              Tasks
            </Link>
            <span>/</span>
            <span className="text-on-surface font-semibold">
              Receipt #{taskId}
            </span>
          </div>

          {/* Main Receipt Paper Card */}
          <div className="bg-surface-container-low rounded-2xl border border-surface-container-high/60 shadow-xl overflow-hidden">
            {/* Top Security Banner */}
            <div className="px-6 py-4 bg-surface-container border-b border-surface-container-high/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  verified_user
                </span>
                <span className="text-sm font-bold text-on-surface">
                  AgentBounty Proof-of-Execution Receipt
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-tertiary/15 text-tertiary border border-tertiary/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                  VERIFIED &amp; SETTLED
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1 rounded-lg text-xs font-mono bg-surface-container-high hover:bg-surface-container-highest text-on-surface transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    share
                  </span>
                  <span>Share</span>
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Receipt Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b border-surface-container-high/40 text-xs font-mono">
                <div>
                  <span className="text-outline block mb-0.5">Task ID</span>
                  <strong className="text-primary text-sm font-bold">
                    {taskId}
                  </strong>
                </div>
                <div>
                  <span className="text-outline block mb-0.5">
                    Manager Account
                  </span>
                  <strong className="text-on-surface truncate block">
                    {receipt?.managerAccount || "agentbounty-manager.testnet"}
                  </strong>
                </div>
                <div>
                  <span className="text-outline block mb-0.5">Date / Time</span>
                  <span className="text-on-surface-variant">
                    {receipt?.createdAt
                      ? new Date(receipt.createdAt).toLocaleString()
                      : "Verified"}
                  </span>
                </div>
                <div>
                  <span className="text-outline block mb-0.5">
                    Settlement Total
                  </span>
                  <strong className="text-tertiary text-sm font-bold">
                    {receipt?.settlements && receipt.settlements.length > 0
                      ? `${receipt.settlements
                          .filter((s) => s.status !== "rejected" && !s.txHash.includes("BLOCKED"))
                          .reduce((acc, s) => acc + (parseFloat(s.amount) || 0), 0)
                          .toFixed(2)} NEAR`
                      : `${(
                          (receipt?.verification?.worker1?.passed !== false ? 0.03 : 0) +
                          (receipt?.verification?.worker2?.passed !== false
                            ? (receipt?.selectedAgent?.bidNear ?? 0.05)
                            : 0)
                        ).toFixed(2)} NEAR (Quoted)`}
                  </strong>
                </div>
              </div>

              {/* 1. Original User Directive */}
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-outline font-semibold">
                  Original Bounty Directive
                </span>
                <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 text-sm text-on-surface leading-relaxed">
                  &quot;
                  {receipt?.directivePrompt ||
                    "Autonomous AI Agent Swarm coordinating cross-market intelligence and on-chain micro-settlements on NEAR Protocol"}
                  &quot;
                </div>
              </div>

              {/* 2. Automated Verifier Gate Status */}
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-outline font-semibold">
                  Automated Verifier Gate Results
                </span>
                <div className="p-4 rounded-xl bg-surface-container border border-surface-container-high/40 space-y-3 font-mono text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-surface-container-high/40">
                    <span className="text-on-surface font-semibold flex items-center gap-1.5">
                      <span
                        className={`material-symbols-outlined text-[16px] ${
                          receipt?.verification?.worker2?.passed === false
                            ? "text-amber-400"
                            : "text-tertiary"
                        }`}
                      >
                        {receipt?.verification?.worker2?.passed === false
                          ? "gavel"
                          : "check_circle"}
                      </span>
                      Automated Verification Gate Status:{" "}
                      {receipt?.verification?.worker2?.passed === false
                        ? "PARTIAL / BLOCKED"
                        : "PASSED"}
                    </span>
                    <span className="text-outline text-[11px]">
                      Deterministic Policy: Length &gt; 80/120 chars, schema valid, keyword relevance, clean payload
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-lg bg-surface-container-lowest/80 border border-surface-container-high/30 space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-primary font-semibold">
                          Worker 1 (@scout-worker)
                        </strong>
                        <span className="text-tertiary font-bold">
                          Score {receipt?.verification?.worker1?.score ?? 98}%
                        </span>
                      </div>
                      <p className="text-on-surface-variant text-[11px] leading-relaxed">
                        {receipt?.verification?.worker1?.reason ||
                          "Telemetry schema valid, verified topic clusters, summary > 80 characters."}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-surface-container-lowest/80 border border-surface-container-high/30 space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-secondary font-semibold">
                          Worker 2 ({receipt?.selectedAgent?.handle?.replace(/\.testnet$/i, "") || "@copy-agent"})
                        </strong>
                        <span
                          className={`font-bold ${
                            receipt?.verification?.worker2?.passed === false
                              ? "text-red-400"
                              : "text-tertiary"
                          }`}
                        >
                          Score {receipt?.verification?.worker2?.score ?? 96}%
                        </span>
                      </div>
                      <p className="text-on-surface-variant text-[11px] leading-relaxed">
                        {receipt?.verification?.worker2?.reason ||
                          "Passed automated schema, markdown structure, word count (> 80 chars), and 4K design prompt checks."}
                      </p>
                      {receipt?.selectedAgent?.slashed &&
                        typeof receipt.selectedAgent.reputationAfter === "number" && (
                          <p className="text-[10px] text-amber-400 font-semibold pt-0.5">
                            Reputation Slashed: {receipt.selectedAgent.reputationAtSelection} →{" "}
                            {receipt.selectedAgent.reputationAfter} (-5 penalty)
                          </p>
                        )}
                    </div>
                  </div>

                  {receipt?.outputHash && (
                    <div className="flex items-center justify-between pt-1 text-[11px] text-outline">
                      <span>Root Manifest SHA-256:</span>
                      <code className="text-primary font-mono truncate max-w-[280px]">
                        {receipt.outputHash}
                      </code>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Delivered Outputs */}
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-outline font-semibold">
                  Delivered Work Outputs
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Worker 1 Deliverable */}
                  <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-outline">
                      <span className="text-primary font-semibold">
                        Data Intelligence Node
                      </span>
                      <span>@scout-worker.testnet</span>
                    </div>
                    <p className="font-semibold text-sm text-on-surface">
                      {receipt?.deliverables?.worker1Title ||
                        "Real-time Social Sentiment Feed"}
                    </p>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {receipt?.deliverables?.worker1Summary ||
                        "Sentiment scoring across decentralized agent deployments confirms accelerated adoption of autonomous DAG bounty architectures on NEAR Protocol."}
                    </p>
                  </div>

                  {/* Worker 2 Deliverable */}
                  <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-outline">
                      <span className="text-secondary font-semibold">
                        {receipt?.selectedAgent?.name || "Creative Synthesis Node"}
                      </span>
                      <span>{receipt?.selectedAgent?.handle || "@copy-agent.testnet"}</span>
                    </div>
                    <p className="font-semibold text-sm text-on-surface">
                      {receipt?.deliverables?.worker2Title ||
                        "Executive Alpha Digest & Thread"}
                    </p>
                    <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-3">
                      {receipt?.deliverables?.worker2Body ||
                        "Live stream analysis indicates a major developer pivot toward dynamic on-chain swarm routing. Sentiment remains at +78% positive following NEAR Testnet launch."}
                    </p>
                    {receipt?.deliverables?.worker2DesignPrompt && (
                      <div className="pt-1 border-t border-surface-container-high/30">
                        <span className="text-[10px] font-mono text-outline block">
                          4K Design Prompt:
                        </span>
                        <p className="text-[11px] text-outline font-mono truncate">
                          {receipt.deliverables.worker2DesignPrompt}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 4. On-Chain NEAR Settlements */}
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-outline font-semibold">
                  On-Chain NEAR Testnet Settlements
                </span>
                <div className="p-4 rounded-xl bg-surface-container border border-surface-container-high/40 space-y-3 font-mono text-xs">
                  {receipt?.settlements && receipt.settlements.length > 0 ? (
                    receipt.settlements.map((st, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg bg-surface-container-lowest flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-surface-container-high/30"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-on-surface">
                              {st.agentName || "Agent"}
                            </span>
                            {st.agentHandle && (
                              <span className="text-outline text-[11px]">
                                ({st.agentHandle} → {st.worker})
                              </span>
                            )}
                            {!st.agentHandle && (
                              <span className="text-primary">{st.worker}</span>
                            )}
                            <span
                              className={`font-bold ${
                                st.status === "rejected" || st.txHash?.includes("BLOCKED")
                                  ? "text-red-400"
                                  : "text-tertiary"
                              }`}
                            >
                              ({st.amount})
                            </span>
                          </div>
                          <div className="text-[11px] text-outline flex items-center gap-1">
                            <span>{st.status === "rejected" ? "Gate:" : "Tx Hash:"}</span>
                            <code className="text-on-surface-variant truncate max-w-[260px]">
                              {st.txHash}
                            </code>
                          </div>
                          {st.reason && (
                            <p className="text-[11px] text-red-400">{st.reason}</p>
                          )}
                        </div>

                        {st.txHash && !st.txHash.includes("BLOCKED") && (
                          <a
                            href={
                              st.explorerUrl ||
                              `https://testnet.nearblocks.io/txns/${st.txHash}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-primary/20 hover:text-primary text-on-surface text-xs font-semibold transition-colors flex items-center gap-1 self-start sm:self-center shrink-0 cursor-pointer"
                          >
                            <span>View on NearBlocks</span>
                            <span className="material-symbols-outlined text-[14px]">
                              open_in_new
                            </span>
                          </a>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-outline py-2 text-center">
                      Settlement pending verification release.
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom CTAs */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-surface-container-high/40">
                <Link
                  href="/"
                  className="px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    arrow_back
                  </span>
                  <span>Dashboard</span>
                </Link>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer flex-1 sm:flex-initial justify-center"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      content_copy
                    </span>
                    <span>Copy Link</span>
                  </button>

                  <Link
                    href="/create-task"
                    className="px-5 py-2.5 rounded-xl bg-primary text-on-primary-fixed text-xs font-mono font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer flex-1 sm:flex-initial justify-center shadow-md"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      add_circle
                    </span>
                    <span>Create New Bounty</span>
                  </Link>
                </div>
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

export default function ReceiptPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center font-mono text-xs text-outline">
          Loading receipt...
        </div>
      }
    >
      <ReceiptContent />
    </React.Suspense>
  );
}
