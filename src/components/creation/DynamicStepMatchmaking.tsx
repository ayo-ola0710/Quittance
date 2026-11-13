"use client";

import React, { useState, useEffect } from "react";
import agentsData from "@/data/agents.json";
import { VERIFICATION_RULES } from "@/types";

export interface SelectedWriterAgent {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bidPrice: string;
  bidNear: number;
  reputation: number;
}

interface DynamicStepMatchmakingProps {
  directivePrompt: string;
  onBack: () => void;
  onConfirmLock: (agent: SelectedWriterAgent) => void;
  onShowToast: (msg: string) => void;
}

interface LiveAgentItem {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bidPrice: string;
  bidNear: number;
  reputation: number;
  sla: string;
  latency: string;
  role?: string;
  completedTasks?: number;
  slashedCount?: number;
}

interface CandidateBid extends LiveAgentItem {
  statusBadge: "SELECTED" | "Eliminated" | "Outbid";
  policyNote: string;
  isPolicyWinner: boolean;
}

export function DynamicStepMatchmaking({
  directivePrompt,
  onBack,
  onConfirmLock,
  onShowToast,
}: DynamicStepMatchmakingProps) {
  const [liveAgents, setLiveAgents] = useState<LiveAgentItem[]>(() =>
    agentsData.map((a) => ({ ...a, completedTasks: 0, slashedCount: 0 })),
  );
  const [selectedWriterId, setSelectedWriterId] = useState("copy-agent");
  const [policyWinnerId, setPolicyWinnerId] = useState<string>("copy-agent");
  const [isLocking, setIsLocking] = useState(false);
  const [managerAccount, setManagerAccount] = useState("quittance-treasury.testnet");

  useEffect(() => {
    fetch("/api/account")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.accountId) setManagerAccount(data.accountId);
      })
      .catch(() => {});

    fetch("/api/agents")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data?.agents) && data.agents.length > 0) {
          setLiveAgents(data.agents);
        }
        if (typeof data?.policyWinnerId === "string" && data.policyWinnerId) {
          setPolicyWinnerId(data.policyWinnerId);
          setSelectedWriterId(data.policyWinnerId);
        }
      })
      .catch(() => {});
  }, []);

  const scoutAgent = liveAgents.find((a) => a.id === "scrape-scout");
  const copywriterAgents = liveAgents.filter((a) => a.role !== "scout");

  // Determine active policy winner: lowest bid clearing 95 reputation
  const winnerAgent =
    copywriterAgents.find((a) => a.id === policyWinnerId) ||
    copywriterAgents
      .filter((a) => a.reputation > 95)
      .sort((a, b) => a.bidNear - b.bidNear)[0] ||
    copywriterAgents[0];

  // Dynamic candidate bidding computed from live /api/agents reputations
  const writerCandidates: CandidateBid[] = copywriterAgents.map((agent) => {
    const isPolicyWinner = agent.id === winnerAgent?.id;
    const meetsReputation = agent.reputation > 95;

    let statusBadge: "SELECTED" | "Eliminated" | "Outbid" = "Outbid";
    let policyNote = "";

    if (isPolicyWinner) {
      statusBadge = "SELECTED";
      policyNote = "SELECTED (Lowest bid clearing 95% Rep threshold)";
    } else if (!meetsReputation) {
      statusBadge = "Eliminated";
      policyNote = `Eliminated (Reputation ${agent.reputation}/100 is below 95% threshold)`;
    } else {
      statusBadge = "Outbid";
      const diffNear = (agent.bidNear - (winnerAgent?.bidNear ?? 0.05)).toFixed(2);
      const diffSign = agent.bidNear >= (winnerAgent?.bidNear ?? 0.05) ? `+${diffNear}` : `${diffNear}`;
      policyNote = `Outbid (Higher cost than ${winnerAgent?.name ?? "winner"} by ${diffSign} NEAR)`;
    }

    return {
      ...agent,
      statusBadge,
      policyNote,
      isPolicyWinner,
    };
  });

  const selectedCandidate =
    writerCandidates.find((c) => c.id === selectedWriterId) || writerCandidates[0];

  const task1Cost = 0.03;
  const totalNear = (task1Cost + selectedCandidate.bidNear).toFixed(2);

  const handleLockClick = () => {
    setIsLocking(true);
    onShowToast(
      `Allocating ${totalNear} NEAR (${selectedCandidate.name} selected)...`,
    );
    setTimeout(() => {
      setIsLocking(false);
      onConfirmLock({
        id: selectedCandidate.id,
        name: selectedCandidate.name,
        handle: selectedCandidate.handle,
        avatar: selectedCandidate.avatar,
        bidPrice: selectedCandidate.bidPrice,
        bidNear: selectedCandidate.bidNear,
        reputation: selectedCandidate.reputation,
      });
    }, 900);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      {/* ── 1. Hero Line & Title ────────────────────────────────────────────── */}
      <section className="flex flex-col gap-2 pb-4 border-b border-surface-container-high/40">
        <div className="flex items-center gap-2">
          <span className="font-label-mono-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold tracking-wider">
            STEP 2 OF 3
          </span>
          <span className="text-xs font-mono text-outline">•</span>
          <span className="text-xs font-mono text-tertiary font-medium">
            Post a task. Agents bid. Verified work gets paid.
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
              Pick Your Agents
            </h1>
            <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed mt-0.5">
              Agents inspected your task and submitted bids. The platform automatically picks the cheapest bid with reputation &gt; 95.
            </p>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="px-3.5 py-1.5 rounded-lg text-xs font-mono bg-surface-container-high hover:bg-surface-container-highest text-on-surface transition-colors flex items-center gap-1 self-start sm:self-center cursor-pointer border border-surface-container-high/40 shrink-0"
          >
            <span className="material-symbols-outlined text-[14px]">edit</span>
            <span>Edit Task</span>
          </button>
        </div>

        {/* Active Directive Bar */}
        <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-high/40 flex items-center gap-3 text-xs font-mono">
          <span className="material-symbols-outlined text-primary text-[16px] shrink-0">assignment</span>
          <span className="text-outline shrink-0">Your Task:</span>
          <span className="text-on-surface truncate">
            &quot;{directivePrompt}&quot;
          </span>
        </div>
      </section>

      {/* ── 2. Auto-Selection Rule Banner ─────────────────────────────── */}
      <section className="p-4 rounded-xl bg-surface-container-low border border-primary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">policy</span>
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-on-surface uppercase tracking-wide block">
              Auto-Selection Rule
            </span>
            <p className="text-xs text-on-surface-variant font-mono">
              Rule: <strong className="text-primary font-semibold">Pick lowest price with reputation &gt; 95</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-xs font-mono text-outline">Winner:</span>
          <span className="px-2.5 py-1 rounded-md bg-tertiary/15 text-tertiary border border-tertiary/30 text-xs font-mono font-bold">
            {selectedCandidate.name} ({selectedCandidate.bidPrice})
          </span>
        </div>
      </section>

      {/* ── 3. Sub-Tasks & Candidate Marketplace Grid ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: The Tasks */}
        <div className="lg:col-span-8 space-y-6">
          {/* Sub-Task 1: Data Worker */}
          <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container-high/50 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-outline uppercase tracking-wider block">
                  Job #1 • Research &amp; Background Data
                </span>
                <h3 className="text-base font-bold text-on-surface">
                  Research Agent
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-tertiary/15 text-tertiary border border-tertiary/30">
                Auto-Assigned
              </span>
            </div>

            {/* Selected Data Agent Card */}
            <div className="p-3.5 rounded-xl bg-surface-container border border-surface-container-high/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="ScrapeScout avatar"
                  className="w-10 h-10 rounded-lg object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgE_PSl9u5mrrQ3p90hs3uE_XYsKDMzKGVxZh67Gt-bWRkq9UKuglboGNgHALWGMSBCZvV3L_BfCHJRyjjqBkJQT28IoPahv_agMeDYUIyN8UQ-qf3cPLEaoMW1_n-SLpqDhfvfMEFbAv6TjsFRssEyUWdIn3TKNtjDOKUzb1Smr4EnIPIBQLdGxUAfpNIggTjusUgHSAHbbbWdQttgs_fGCa7Faih4xriMc7_1Bc"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm text-on-surface">ScrapeScout v3.0</span>
                    <span className="text-xs font-mono text-primary font-bold">0.03 NEAR</span>
                  </div>
                  <span className="text-xs text-on-surface-variant font-mono">
                    @scout-worker.testnet • Rep: {scoutAgent?.reputation ?? 99}/100
                  </span>
                </div>
              </div>

              <div className="text-right text-xs font-mono">
                <span className="text-outline block">SLA: 100% (64 tasks)</span>
                <span className="text-tertiary font-semibold">Ready to execute</span>
              </div>
            </div>
          </div>

          {/* Sub-Task 2: Synthesis & Bidding Marketplace */}
          <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container-high/50 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <span className="text-[11px] font-mono text-outline uppercase tracking-wider block">
                  Job #2 • Final Copy &amp; Visual Prompt (Choose a Bidder)
                </span>
                <h3 className="text-base font-bold text-on-surface">
                  Writing &amp; Design Agent
                </h3>
              </div>
              <span className="text-xs font-mono text-outline">
                {writerCandidates.length} Bids Submitted
              </span>
            </div>

            {/* Candidates List */}
            <div className="space-y-2.5">
              {writerCandidates.map((c) => {
                const isSelected = selectedWriterId === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedWriterId(c.id);
                      onShowToast(`Selected ${c.name} (${c.bidPrice})`);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-secondary/10 border-secondary shadow-xs"
                        : "bg-surface-container hover:bg-surface-container-high border-surface-container-high/40 opacity-80 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Radio button indicator */}
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? "border-secondary bg-secondary" : "border-outline"
                        }`}
                      >
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>

                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt={c.name}
                        className="w-10 h-10 rounded-lg object-cover"
                        src={c.avatar}
                      />

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-on-surface">{c.name}</span>
                          <span className="text-xs font-mono font-bold text-secondary">{c.bidPrice}</span>
                          {c.statusBadge === "SELECTED" && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-tertiary/20 text-tertiary border border-tertiary/30">
                              SELECTED
                            </span>
                          )}
                          {c.statusBadge === "Eliminated" && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                              Eliminated (&le; 95% Rep)
                            </span>
                          )}
                          {c.statusBadge === "Outbid" && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-surface-container-highest text-on-surface-variant border border-surface-container-high/60">
                              Outbid
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-on-surface-variant font-mono">{c.handle}</span>
                        <p
                          className={`text-[11px] font-mono mt-0.5 ${
                            c.statusBadge === "SELECTED"
                              ? "text-tertiary font-semibold"
                              : c.statusBadge === "Eliminated"
                                ? "text-red-400"
                                : "text-outline"
                          }`}
                        >
                          &rarr; {c.policyNote}
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center text-xs font-mono shrink-0 pl-7 sm:pl-0 gap-0.5">
                      <span
                        className={`font-semibold ${
                          c.reputation <= 95 ? "text-amber-400" : "text-on-surface"
                        }`}
                      >
                        Rep: {c.reputation}/100
                      </span>
                      {(c.slashedCount ?? 0) > 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/15 text-red-400 border border-red-500/30">
                          Slashed {c.slashedCount}x
                        </span>
                      )}
                      <span className="text-outline text-[11px]">{c.sla}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sub-Task 3: Committed Verification Checks */}
          <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container-high/50 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-surface-container-high/40">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary text-[20px]">
                  verified_user
                </span>
                <div>
                  <h3 className="text-base font-bold text-on-surface">
                    Committed Verification Checks
                  </h3>
                  <p className="text-[11px] font-mono text-outline">
                    Must pass to unlock payout • Rules hash recorded before execution
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-tertiary/15 text-tertiary border border-tertiary/25 self-start sm:self-auto">
                4 Automated Rules
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {VERIFICATION_RULES.map((rule, idx) => (
                <div
                  key={rule.id || idx}
                  className="p-3 rounded-xl bg-surface-container border border-surface-container-high/30 flex items-start gap-2.5 font-mono text-xs"
                >
                  <span className="w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-on-surface text-xs">{rule.name}</span>
                      <span className="text-[10px] text-tertiary bg-tertiary/10 px-1.5 py-0.2 rounded border border-tertiary/20">
                        {rule.threshold}
                      </span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant leading-relaxed">
                      {rule.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Treasury Dispatch Summary */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-surface-container-low border border-surface-container-high/50 space-y-5 sticky top-20 shadow-md">
          <div className="space-y-1 pb-3 border-b border-surface-container-high/40">
            <span className="text-[11px] font-mono uppercase tracking-wider text-outline font-semibold">
              Cost Summary
            </span>
            <h3 className="text-base font-bold text-on-surface">Ready to Run</h3>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-outline">Research Agent:</span>
              <span className="text-on-surface font-semibold">0.03 NEAR</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-outline">Writing Agent ({selectedCandidate.name}):</span>
              <span className="text-on-surface font-semibold">{selectedCandidate.bidPrice}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-outline">Verification Gate:</span>
              <span className="text-tertiary font-semibold">4 Rules Committed</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-surface-container-high/30">
              <span className="text-outline">NEAR Network Fee:</span>
              <span className="text-tertiary">&lt; 0.0002 NEAR</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-surface-container-high/40 text-sm">
              <span className="font-bold text-on-surface">Max Payout:</span>
              <strong className="text-primary text-base font-bold">{totalNear} NEAR</strong>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-surface-container text-xs font-mono text-outline space-y-1">
            <span className="text-on-surface font-semibold block">Payer Wallet:</span>
            <code className="text-primary block truncate">{managerAccount}</code>
            <span className="text-[11px] text-outline block pt-1">
              Money stays in your wallet until the work passes automated verification in Step 3.
            </span>
          </div>

          <button
            type="button"
            id="btn-confirm-matchmaking"
            disabled={isLocking}
            onClick={handleLockClick}
            className="w-full py-3.5 rounded-xl font-mono text-xs font-bold text-on-primary-fixed bg-linear-to-r from-primary via-primary-fixed-dim to-tertiary hover:opacity-95 active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isLocking ? "progress_activity" : "play_arrow"}
            </span>
            <span>
              {isLocking ? "Starting Agents..." : `Run Agents Now (${totalNear} NEAR)`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
