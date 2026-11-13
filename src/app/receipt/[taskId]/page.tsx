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
  rulesHash?: string;
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
    worker1: { passed: boolean; score: number; reason: string; charCount: number; checks?: Array<{ name: string; pass: boolean; detail?: string }> };
    worker2: { passed: boolean; score: number; reason: string; charCount: number; checks?: Array<{ name: string; pass: boolean; detail?: string }> };
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
      showToast("Shareable receipt link copied to clipboard");
    }
  };

  if (loading && !receipt && !notFound) {
    return (
      <>
        <Navbar />
        <main className="w-full pt-32 pb-16 bg-background min-h-screen flex items-center justify-center font-body-sm text-on-surface-variant">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary animate-spin">
              progress_activity
            </span>
            <span>Loading receipt for task #{taskId}...</span>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (notFound || (!receipt && !loading)) {
    return (
      <>
        <Navbar />
        <main className="w-full pt-28 pb-16 bg-background min-h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-md mx-auto p-6 rounded-[2px] paper-slip text-center space-y-4">
            <div className="w-12 h-12 rounded-[2px] bg-error-container text-on-error-container mx-auto flex items-center justify-center border border-error/30">
              <span className="material-symbols-outlined text-[24px]">search_off</span>
            </div>
            <div>
              <h2 className="font-headline-sm font-bold text-on-surface">Receipt not found for task #{taskId}</h2>
              <p className="font-body-sm text-on-surface-variant mt-1">
                No execution receipt exists for task <strong>#{taskId}</strong>.
              </p>
            </div>
            <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
              Quittance receipts are minted only when a task passes verification and executes on NEAR Testnet.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <Link
                href="/"
                className="px-4 py-2 rounded-[2px] bg-surface hover:bg-surface-container text-on-surface font-body-sm text-xs border border-outline transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/create-task"
                className="px-4 py-2 rounded-[2px] bg-primary text-on-primary font-body-sm text-xs font-semibold hover:bg-primary/90 transition-colors inline-flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[15px]">add_circle</span>
                <span>Create task</span>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const hasRejected = receipt?.verification?.worker2?.passed === false;
  const isSettled = receipt?.settlements && receipt.settlements.some((s) => s.status === "paid" || (s.txHash && !s.txHash.includes("BLOCKED")));

  return (
    <>
      <Navbar />

      <main className="w-full pt-24 pb-16 bg-background min-h-screen">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-5">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 font-body-sm text-xs text-on-surface-variant">
            <Link href="/" className="hover:text-primary transition-colors">
              Quittance
            </Link>
            <span>/</span>
            <Link
              href="/settlement-ledger"
              className="hover:text-primary transition-colors"
            >
              Ledger
            </Link>
            <span>/</span>
            <span className="text-on-surface font-semibold">
              Receipt #{taskId}
            </span>
          </div>

          {/* Main Paper Receipt Slip */}
          <div className="paper-slip rounded-[2px] border border-outline perforated-border-top perforated-border-bottom relative overflow-hidden shadow-xs">
            {/* Verdict Stamp */}
            <div className="absolute top-5 right-6 z-20 pointer-events-none hidden sm:block">
              {hasRejected ? (
                <div className="flex flex-col items-end gap-1">
                  <span className="stamp-rejected animate-stamp-rejected">REJECTED</span>
                  <span className="font-label-mono-xs text-error font-medium">-5 rep penalty</span>
                </div>
              ) : isSettled ? (
                <div className="flex flex-col items-end gap-1">
                  <span className="stamp-paid animate-stamp-paid">PAID</span>
                  <span className="font-label-mono-xs text-tertiary font-medium">On-chain verified</span>
                </div>
              ) : null}
            </div>

            {/* Slip Header */}
            <div className="px-6 py-4 border-b border-outline/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  receipt_long
                </span>
                <div>
                  <span className="font-headline-sm font-semibold text-on-surface block">
                    Quittance settlement receipt
                  </span>
                  <span className="font-label-mono-xs text-on-surface-variant">
                    Task #{taskId} &bull; Deterministic audit trail
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-[2px] font-body-sm text-xs bg-surface hover:bg-surface-container text-on-surface transition-colors flex items-center gap-1 cursor-pointer border border-outline"
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
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pb-5 border-b border-outline/40 font-body-sm text-xs tabular-nums">
                <div>
                  <span className="text-on-surface-variant block mb-0.5">Task ID</span>
                  <strong className="text-on-surface text-sm font-bold font-mono">
                    {taskId}
                  </strong>
                </div>
                <div>
                  <span className="text-on-surface-variant block mb-0.5">
                    Payer account
                  </span>
                  <strong className="text-on-surface truncate block font-mono text-xs">
                    {receipt?.managerAccount || "quittance-manager.testnet"}
                  </strong>
                </div>
                <div>
                  <span className="text-on-surface-variant block mb-0.5">Timestamp</span>
                  <span className="text-on-surface">
                    {receipt?.createdAt
                      ? new Date(receipt.createdAt).toLocaleString()
                      : "Verified"}
                  </span>
                </div>
                <div>
                  <span className="text-on-surface-variant block mb-0.5">Output source</span>
                  <span className="inline-block font-mono text-xs text-on-surface font-medium">
                    Output source: {receipt?.isLive ? "Gemini AI" : "fallback"}
                  </span>
                </div>
                <div>
                  <span className="text-on-surface-variant block mb-0.5">
                    Settlement total
                  </span>
                  <strong className="text-secondary text-sm font-bold">
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
                        ).toFixed(2)} NEAR`}
                  </strong>
                </div>
              </div>

              {/* 1. Directive */}
              <div className="space-y-1.5">
                <span className="font-label-mono-xs uppercase text-on-surface-variant font-medium">
                  Original directive
                </span>
                <div className="p-3.5 rounded-[2px] bg-surface-container-low border border-outline/60 font-body-sm text-on-surface leading-relaxed">
                  &ldquo;
                  {receipt?.directivePrompt ||
                    "Autonomous AI Agent Swarm coordinating cross-market intelligence and on-chain micro-settlements on NEAR Protocol"}
                  &rdquo;
                </div>
              </div>

              {/* 2. Automated Verifier Gate Status & Ledger Tape */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-label-mono-xs uppercase text-on-surface-variant font-medium">
                    Inspection ledger tape
                  </span>
                  <span className="font-label-mono-xs text-on-surface-variant">
                    4 deterministic rules
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Worker 1 Tape */}
                  <div className="p-3.5 rounded-[2px] bg-surface-container-low border border-outline/60 space-y-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-outline/30">
                      <strong className="text-on-surface font-body-sm font-semibold">
                        Research agent (@scout-worker)
                      </strong>
                      <span className="font-label-mono-xs text-tertiary font-bold tabular-nums">
                        Score {receipt?.verification?.worker1?.score ?? 98}%
                      </span>
                    </div>

                    <div className="space-y-1 pt-0.5">
                      {(receipt?.verification?.worker1?.checks || []).map((chk, idx) => (
                        <div
                          key={idx}
                          className={`p-1.5 rounded-[2px] border text-xs font-mono flex items-start gap-1.5 ${
                            chk.pass
                              ? "bg-surface border-tertiary/30 text-on-surface"
                              : "bg-error-container/30 border-error/40 text-on-error-container"
                          }`}
                        >
                          <span
                            className={`font-bold shrink-0 ${
                              chk.pass ? "text-tertiary" : "text-error"
                            }`}
                          >
                            {chk.pass ? "[✓]" : "[✗]"}
                          </span>
                          <div className="min-w-0">
                            <span className="font-medium block">{chk.name}</span>
                            {chk.detail && (
                              <span className="text-[10px] text-on-surface-variant block">
                                {chk.detail}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed pt-1">
                      {receipt?.verification?.worker1?.reason ||
                        "Telemetry schema valid, verified topic clusters, summary > 80 characters."}
                    </p>
                  </div>

                  {/* Worker 2 Tape */}
                  <div className="p-3.5 rounded-[2px] bg-surface-container-low border border-outline/60 space-y-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-outline/30">
                      <strong className="text-on-surface font-body-sm font-semibold">
                        Writing agent ({receipt?.selectedAgent?.handle?.replace(/\.testnet$/i, "") || "@copy-agent"})
                      </strong>
                      <span
                        className={`font-label-mono-xs font-bold tabular-nums ${
                          receipt?.verification?.worker2?.passed === false
                            ? "text-error"
                            : "text-tertiary"
                        }`}
                      >
                        Score {receipt?.verification?.worker2?.score ?? 96}%
                      </span>
                    </div>

                    <div className="space-y-1 pt-0.5">
                      {(receipt?.verification?.worker2?.checks || []).map((chk, idx) => (
                        <div
                          key={idx}
                          className={`p-1.5 rounded-[2px] border text-xs font-mono flex items-start gap-1.5 ${
                            chk.pass
                              ? "bg-surface border-tertiary/30 text-on-surface"
                              : "bg-error-container/40 border-error/50 text-on-error-container"
                          }`}
                        >
                          <span
                            className={`font-bold shrink-0 ${
                              chk.pass ? "text-tertiary" : "text-error"
                            }`}
                          >
                            {chk.pass ? "[✓]" : "[✗]"}
                          </span>
                          <div className="min-w-0">
                            <span className="font-medium block">{chk.name}</span>
                            {chk.detail && (
                              <span className="text-[10px] text-on-surface-variant block">
                                {chk.detail}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed pt-1">
                      {receipt?.verification?.worker2?.reason ||
                        "Passed automated schema, markdown structure, word count (> 80 chars), and 4K design prompt checks."}
                    </p>
                    {receipt?.selectedAgent?.slashed &&
                      typeof receipt.selectedAgent.reputationAfter === "number" && (
                        <p className="text-xs text-error font-medium pt-0.5">
                          Reputation slashed: {receipt.selectedAgent.reputationAtSelection} &rarr;{" "}
                          {receipt.selectedAgent.reputationAfter} (-5 penalty)
                        </p>
                      )}
                  </div>
                </div>

                {receipt?.rulesHash && (
                  <div className="flex items-center justify-between pt-1 font-body-sm text-xs text-on-surface-variant">
                    <span className="flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined text-[14px] text-tertiary">
                        lock
                      </span>
                      <span>Committed rules hash:</span>
                    </span>
                    <code className="text-tertiary font-mono truncate max-w-[280px] tabular-nums" title={receipt.rulesHash}>
                      {receipt.rulesHash}
                    </code>
                  </div>
                )}

                {receipt?.outputHash && (
                  <div className="flex items-center justify-between pt-1 font-body-sm text-xs text-on-surface-variant">
                    <span>Root manifest SHA-256:</span>
                    <code className="text-on-surface font-mono truncate max-w-[280px] tabular-nums">
                      {receipt.outputHash}
                    </code>
                  </div>
                )}
              </div>

              {/* 3. Delivered Outputs */}
              <div className="space-y-2">
                <span className="font-label-mono-xs uppercase text-on-surface-variant font-medium">
                  Inspected deliverables
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-[2px] bg-surface-container-low border border-outline/60 space-y-1.5">
                    <div className="flex items-center justify-between font-label-mono-xs text-on-surface-variant">
                      <span className="text-on-surface font-semibold">
                        Research intelligence
                      </span>
                      <span>{receipt?.settlements?.find((s) => s.agentName?.includes("ScrapeScout"))?.agentHandle || "@isreel-design.testnet"}</span>
                    </div>
                    <p className="font-semibold font-body-sm text-on-surface">
                      {receipt?.deliverables?.worker1Title ||
                        "Real-time Social Sentiment Feed"}
                    </p>
                    <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                      {receipt?.deliverables?.worker1Summary ||
                        "Sentiment scoring across decentralized agent deployments confirms accelerated adoption of autonomous bounty architectures on NEAR Protocol."}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-[2px] bg-surface-container-low border border-outline/60 space-y-1.5">
                    <div className="flex items-center justify-between font-label-mono-xs text-on-surface-variant">
                      <span className="text-secondary font-semibold">
                        {receipt?.selectedAgent?.name || "Writing Agent"}
                      </span>
                      <span>{receipt?.selectedAgent?.handle || "@copy-agent.testnet"}</span>
                    </div>
                    <p className="font-semibold font-body-sm text-on-surface">
                      {receipt?.deliverables?.worker2Title ||
                        "Executive Alpha Digest & Thread"}
                    </p>
                    <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed line-clamp-3">
                      {receipt?.deliverables?.worker2Body ||
                        "Live stream analysis indicates a major developer pivot toward dynamic on-chain swarm routing."}
                    </p>
                    {receipt?.deliverables?.worker2DesignPrompt && (
                      <div className="pt-1 border-t border-outline/30">
                        <span className="font-label-mono-xs text-on-surface-variant block">
                          Visual specification:
                        </span>
                        <p className="font-body-sm text-xs text-on-surface-variant truncate font-mono">
                          {receipt.deliverables.worker2DesignPrompt}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 4. On-Chain NEAR Settlements */}
              <div className="space-y-2">
                <span className="font-label-mono-xs uppercase text-on-surface-variant font-medium">
                  On-chain NEAR transfers
                </span>
                <div className="p-3.5 rounded-[2px] bg-surface-container-low border border-outline/60 space-y-2 font-body-sm text-xs">
                  {receipt?.settlements && receipt.settlements.length > 0 ? (
                    receipt.settlements.map((st, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-[2px] bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-outline/50 tabular-nums"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-on-surface">
                              {st.agentName || "Agent"}
                            </span>
                            {st.agentHandle && (
                              <span className="text-on-surface-variant text-xs">
                                ({st.agentHandle})
                              </span>
                            )}
                            <span
                              className={`font-bold ${
                                st.status === "rejected" || st.txHash?.includes("BLOCKED")
                                  ? "text-error"
                                  : "text-tertiary"
                              }`}
                            >
                              {st.amount}
                            </span>
                          </div>
                          <div className="text-xs text-on-surface-variant flex items-center gap-1 font-mono">
                            <span>{st.status === "rejected" ? "Gate:" : "Tx:"}</span>
                            <span className="text-on-surface truncate max-w-[260px]">
                              {st.txHash}
                            </span>
                          </div>
                          {st.reason && (
                            <p className="text-xs text-error">{st.reason}</p>
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
                            className="px-2.5 py-1 rounded-[2px] bg-surface-container hover:bg-surface text-on-surface text-xs font-medium transition-colors flex items-center gap-1 self-start sm:self-center shrink-0 border border-outline cursor-pointer"
                          >
                            <span>NearBlocks</span>
                            <span className="material-symbols-outlined text-[13px]">
                              open_in_new
                            </span>
                          </a>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-on-surface-variant py-2 text-center">
                      Settlement pending verification release.
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom CTAs */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-outline/50">
                <Link
                  href="/"
                  className="px-4 py-2 rounded-[2px] bg-surface hover:bg-surface-container text-on-surface font-body-sm text-xs transition-colors flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center border border-outline"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    arrow_back
                  </span>
                  <span>Dashboard</span>
                </Link>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-4 py-2 rounded-[2px] bg-surface hover:bg-surface-container text-on-surface font-body-sm text-xs transition-colors flex items-center gap-1.5 cursor-pointer flex-1 sm:flex-initial justify-center border border-outline"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      content_copy
                    </span>
                    <span>Copy link</span>
                  </button>

                  <Link
                    href="/create-task"
                    className="px-4 py-2 rounded-[2px] bg-primary text-on-primary font-body-sm text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center gap-1.5 cursor-pointer flex-1 sm:flex-initial justify-center"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      add_circle
                    </span>
                    <span>Create task</span>
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
        <div className="min-h-screen bg-background flex items-center justify-center font-body-sm text-xs text-on-surface-variant">
          Loading receipt...
        </div>
      }
    >
      <ReceiptContent />
    </React.Suspense>
  );
}
