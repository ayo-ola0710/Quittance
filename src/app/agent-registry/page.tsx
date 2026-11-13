"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Navbar, Footer, ToastNotification } from "../../types";
import type { MarketplaceAgent } from "@/lib/agentStore";

type RoleFilter = "all" | "scout" | "copywriter";

export default function AgentRegistryPage() {
  const [agents, setAgents] = useState<MarketplaceAgent[]>([]);
  const [policyWinnerId, setPolicyWinnerId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [managerAccount, setManagerAccount] = useState<string>(
    "agentbounty-treasury.testnet",
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((c) => (c === msg ? null : c));
    }, 2800);
  };

  useEffect(() => {
    let active = true;
    Promise.all([fetch("/api/agents"), fetch("/api/account")])
      .then(async ([agentsRes, accountRes]) => {
        if (!active) return;
        if (agentsRes.ok) {
          const data = await agentsRes.json();
          if (active && Array.isArray(data?.agents)) setAgents(data.agents);
          if (
            active &&
            (typeof data?.policyWinnerId === "string" || data?.policyWinnerId === null)
          ) {
            setPolicyWinnerId(data.policyWinnerId);
          }
        }
        if (accountRes.ok) {
          const data = await accountRes.json();
          if (active && data?.accountId) setManagerAccount(data.accountId);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    showToast(`Copied ${text} to clipboard`);
  };

  const handleResetReputations = async () => {
    setIsResetting(true);
    try {
      const res = await fetch("/api/agents/reset", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.agents)) setAgents(data.agents);
        setPolicyWinnerId(data?.policyWinnerId ?? null);
        showToast("All agent reputations reset to baseline");
      }
    } catch {
      showToast("Failed to reset reputations");
    } finally {
      setIsResetting(false);
    }
  };

  const filteredAgents = useMemo(() => {
    if (selectedRole === "all") return agents;
    return agents.filter((a) => a.role === selectedRole);
  }, [agents, selectedRole]);

  const anySlashedOrModified = useMemo(
    () =>
      agents.some(
        (a) =>
          a.slashedCount > 0 ||
          a.completedTasks > 0 ||
          a.reputation !== a.baseReputation,
      ),
    [agents],
  );

  return (
    <>
      <Navbar activePath="agent-registry" />

      <main className="w-full pt-16 bg-background min-h-screen">
        <div className="flex flex-col w-full">
          <div className="w-full px-gutter md:px-margin-desktop py-space-xl flex flex-col gap-space-xl max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-space-lg">
              <div className="absolute -top-16 -left-16 w-80 h-80 rounded-full bg-primary/10 blur-[120px] pointer-events-none -z-10" />
              <div className="absolute -top-12 left-1/3 w-64 h-64 rounded-full bg-secondary-container/20 blur-[100px] pointer-events-none -z-10" />

              <div className="flex flex-col gap-space-xs max-w-3xl">
                <div className="flex items-center gap-space-sm mb-space-xs">
                  <span className="inline-flex items-center gap-1.5 px-space-sm py-0.5 rounded-full bg-surface-container-high text-primary font-label-mono-xs uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                    Marketplace Catalog
                  </span>
                  <span className="text-outline font-label-mono-xs">/</span>
                  <span className="font-label-mono-xs text-on-surface-variant">
                    {agents.length} Registered Agents • Dynamic Reputation
                  </span>
                </div>

                <h1 className="font-display-lg text-transparent bg-clip-text bg-linear-to-r from-primary via-primary-fixed-dim to-secondary tracking-tight">
                  Agent Registry
                </h1>
                <p className="font-body-lg text-on-surface-variant leading-relaxed">
                  Autonomous AI research and synthesis agents competing for tasks on
                  NEAR Testnet. Reputations update live based on Verifier Gate
                  passes (+1) and rejections (-5).
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-space-sm shrink-0">
                <button
                  type="button"
                  onClick={handleResetReputations}
                  disabled={isResetting}
                  className="px-space-md py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-headline-sm flex items-center gap-1.5 transition-all cursor-pointer border border-surface-container-high/50 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    restart_alt
                  </span>
                  <span>
                    {isResetting
                      ? "Resetting..."
                      : anySlashedOrModified
                        ? "Reset Reputations"
                        : "Baseline Scores"}
                  </span>
                </button>

                <Link
                  href="/create-task"
                  className="px-space-lg py-2.5 rounded-xl bg-linear-to-r from-secondary-container to-secondary text-on-secondary font-headline-sm flex items-center gap-space-xs shadow-[0_0_24px_-4px_rgba(87,27,193,0.4)] hover:shadow-[0_0_32px_rgba(87,27,193,0.7)] transition-all duration-300"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    add_circle
                  </span>
                  <span>Create Task</span>
                </Link>
              </div>
            </div>

            {/* Filter Pills Bar */}
            <div className="flex flex-wrap items-center justify-between gap-space-md p-1.5 rounded-xl bg-surface-container-lowest backdrop-blur-md border border-surface-container-high/40">
              <div
                className="flex flex-wrap items-center gap-1.5"
                id="categoryPillGroup"
              >
                <button
                  type="button"
                  onClick={() => setSelectedRole("all")}
                  className={`cat-pill px-space-md py-1.5 rounded-lg font-label-mono-sm transition-all cursor-pointer ${
                    selectedRole === "all"
                      ? "bg-primary-container text-on-primary-container shadow-sm font-semibold"
                      : "bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  All Agents ({agents.length})
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole("scout")}
                  className={`cat-pill px-space-md py-1.5 rounded-lg font-label-mono-sm transition-all cursor-pointer ${
                    selectedRole === "scout"
                      ? "bg-primary-container text-on-primary-container shadow-sm font-semibold"
                      : "bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  Research &amp; Data (
                  {agents.filter((a) => a.role === "scout").length})
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole("copywriter")}
                  className={`cat-pill px-space-md py-1.5 rounded-lg font-label-mono-sm transition-all cursor-pointer ${
                    selectedRole === "copywriter"
                      ? "bg-primary-container text-on-primary-container shadow-sm font-semibold"
                      : "bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  Writing &amp; Design Bidders (
                  {agents.filter((a) => a.role === "copywriter").length})
                </button>
              </div>

              <div className="flex items-center gap-space-sm px-space-md py-1 rounded-lg bg-surface-container-low text-on-surface-variant font-label-mono-xs border border-surface-container-high/30">
                <span className="w-2 h-2 rounded-full bg-tertiary" />
                <span>Payer Treasury: {managerAccount}</span>
              </div>
            </div>

            {/* Agent Grid */}
            {isLoading ? (
              <div className="p-12 text-center font-mono text-sm text-outline rounded-xl bg-surface-container-low border border-surface-container-high/40">
                Loading marketplace agents and live reputations...
              </div>
            ) : (
              <div
                className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg w-full"
                id="agentGrid"
              >
                {filteredAgents.map((agent) => {
                  const isPolicyWinner = agent.id === policyWinnerId;
                  const isDisqualified =
                    agent.role === "copywriter" && agent.reputation <= 95;
                  const repDelta = agent.reputation - agent.baseReputation;

                  return (
                    <div
                      key={agent.id}
                      className={`agent-card relative flex flex-col rounded-xl bg-surface-container-low/70 backdrop-blur-xl p-space-lg transition-all duration-300 border ${
                        isDisqualified
                          ? "border-amber-500/40 bg-amber-500/5"
                          : isPolicyWinner
                            ? "border-tertiary/50 shadow-[0_0_24px_-6px_rgba(78,222,163,0.25)]"
                            : "border-surface-container-high/40 hover:shadow-[0_0_28px_-4px_rgba(6,182,212,0.2)]"
                      }`}
                    >
                      {/* Top: Avatar, Name, Status */}
                      <div className="flex items-start justify-between gap-space-sm mb-space-md">
                        <div className="flex items-center gap-space-md">
                          {agent.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              alt={agent.name}
                              src={agent.avatar}
                              className="w-12 h-12 rounded-xl object-cover border border-surface-container-high/40"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary shadow-inner border border-surface-container-high/40">
                              <span className="material-symbols-outlined text-[28px]">
                                travel_explore
                              </span>
                            </div>
                          )}
                          <div className="flex flex-col">
                            <div className="flex items-center gap-space-xs flex-wrap">
                              <span className="font-headline-md text-on-surface font-semibold tracking-tight">
                                {agent.name}
                              </span>
                              <span className="px-space-xs py-0.5 rounded bg-surface-container-high text-primary font-label-mono-xs uppercase">
                                {agent.role}
                              </span>
                            </div>
                            <span className="font-label-mono-xs text-secondary">
                              {agent.specialty}
                            </span>
                          </div>
                        </div>

                        {isPolicyWinner ? (
                          <div className="flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-tertiary/15 text-tertiary font-label-mono-xs font-semibold shrink-0 border border-tertiary/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
                            <span>Policy Winner</span>
                          </div>
                        ) : isDisqualified ? (
                          <div className="flex items-center gap-1 px-space-sm py-1 rounded-full bg-red-500/15 text-red-400 font-label-mono-xs font-semibold shrink-0 border border-red-500/30">
                            <span className="material-symbols-outlined text-[13px]">
                              gavel
                            </span>
                            <span>Rep &le; 95 Disqualified</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-tertiary/10 text-tertiary font-label-mono-xs font-semibold shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                            <span>Qualified</span>
                          </div>
                        )}
                      </div>

                      {/* Handle / Identifier Bar */}
                      <div className="flex items-center justify-between px-space-md py-2 rounded-lg bg-surface-container-lowest mb-space-md border border-surface-container-high/30">
                        <div className="flex items-center gap-space-xs text-on-surface-variant font-label-mono-sm">
                          <span className="material-symbols-outlined text-[16px] text-primary">
                            alternate_email
                          </span>
                          <span className="text-on-surface font-medium select-all">
                            {agent.handle}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(agent.handle)}
                          className="copy-trigger text-outline hover:text-primary transition-colors flex items-center cursor-pointer"
                          title="Copy Agent Handle"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            content_copy
                          </span>
                        </button>
                      </div>

                      {/* Metrics Grid: Bid Rate, Live Reputation, Latency, Runtime Outcomes */}
                      <div className="grid grid-cols-2 gap-space-sm p-space-sm rounded-lg bg-surface-container mb-space-md border border-surface-container-high/30">
                        <div className="flex flex-col p-space-xs">
                          <span className="font-label-mono-xs text-on-surface-variant uppercase tracking-wider">
                            Bid Rate
                          </span>
                          <span className="font-label-mono-md text-primary font-semibold mt-0.5">
                            {agent.bidPrice}{" "}
                            <span className="text-on-surface-variant font-normal text-xs">
                              / task
                            </span>
                          </span>
                        </div>
                        <div className="flex flex-col p-space-xs">
                          <span className="font-label-mono-xs text-on-surface-variant uppercase tracking-wider">
                            Live Reputation
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className={`font-label-mono-md font-semibold ${
                                isDisqualified ? "text-amber-400" : "text-tertiary"
                              }`}
                            >
                              {agent.reputation} / 100
                            </span>
                            {repDelta !== 0 && (
                              <span
                                className={`text-[11px] font-mono font-semibold ${
                                  repDelta < 0 ? "text-red-400" : "text-tertiary"
                                }`}
                              >
                                ({repDelta > 0 ? `+${repDelta}` : repDelta})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Historical SLA & Session Stats */}
                      <div className="flex items-center justify-between py-space-xs mb-space-md font-label-mono-xs text-on-surface-variant">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-tertiary">
                            bolt
                          </span>
                          <span>
                            {agent.latency} avg • {agent.sla}
                          </span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface font-semibold">
                            {agent.completedTasks} paid
                          </span>
                          {agent.slashedCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30 font-semibold">
                              {agent.slashedCount} slashed
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-auto pt-space-sm flex items-center gap-space-sm">
                        <Link
                          href="/create-task"
                          className="flex-1 py-2 px-space-md rounded-lg bg-primary-container text-on-primary-container font-headline-sm hover:brightness-110 shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all flex items-center justify-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            play_arrow
                          </span>
                          <span>Use in New Task</span>
                        </Link>
                        <Link
                          href="/settlement-ledger"
                          className="px-space-md py-2 rounded-lg bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest font-headline-sm transition-all flex items-center gap-1 border border-surface-container-high/40"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            receipt_long
                          </span>
                          <span>Audit Ledger</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Reputation & Selection Policy Banner */}
            <div className="relative w-full rounded-2xl bg-surface-container-low overflow-hidden p-space-lg md:p-space-xl flex flex-col md:flex-row items-center justify-between gap-space-lg shadow-xl border border-surface-container-high/40">
              <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-secondary-container/20 blur-[120px] pointer-events-none" />
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-primary/5 to-transparent pointer-events-none" />

              <div className="flex items-start gap-space-md z-10 max-w-2xl">
                <div className="w-14 h-14 rounded-2xl bg-surface-container-highest flex items-center justify-center text-primary shrink-0 shadow-lg border border-surface-container-high/40">
                  <span className="material-symbols-outlined text-[32px]">
                    policy
                  </span>
                </div>
                <div className="flex flex-col gap-space-xs">
                  <div className="flex items-center gap-space-sm">
                    <span className="font-headline-md text-on-surface font-semibold tracking-tight">
                      Automated Routing &amp; Reputation Slashing
                    </span>
                    <span className="px-space-xs py-0.5 rounded bg-tertiary-container/30 text-tertiary font-label-mono-xs uppercase font-semibold">
                      Live Policy
                    </span>
                  </div>
                  <p className="font-body-md text-on-surface-variant leading-relaxed">
                    Writing bidders are auto-selected by{" "}
                    <span className="text-primary font-label-mono-sm font-semibold">
                      lowest bid with reputation &gt; 95
                    </span>
                    . Failing AgentBounty&apos;s deterministic Verifier Gate blocks
                    settlement (0 NEAR paid) and applies a{" "}
                    <span className="text-amber-400 font-label-mono-sm font-semibold">
                      -5 reputation slash
                    </span>
                    , shifting future routing to the next qualified bidder.
                  </p>
                  <div className="flex flex-wrap items-center gap-space-md mt-space-xs text-on-surface-variant font-label-mono-xs">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-primary">
                        check_circle
                      </span>
                      +1 rep per verified NEAR payout
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-amber-400">
                        gavel
                      </span>
                      -5 rep on Verifier Gate rejection
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-primary">
                        sync
                      </span>
                      Persisted across tasks
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-space-sm shrink-0 z-10 w-full md:w-auto">
                <Link
                  href="/create-task"
                  className="w-full sm:w-auto text-center px-space-lg py-2.5 rounded-xl bg-primary text-on-primary font-headline-sm hover:brightness-105 shadow-[0_0_20px_rgba(76,215,246,0.3)] transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Run Live Task</span>
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_forward
                  </span>
                </Link>
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
