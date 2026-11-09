"use client";

import React, { useState } from "react";
import { TaskItem } from "../../types/types";

interface DeliverablesModalProps {
  task: TaskItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DeliverablesModal({
  task,
  isOpen,
  onClose,
}: DeliverablesModalProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !task) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[85vh] flex flex-col rounded-2xl bg-surface-container border border-surface-container-high shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-space-md border-b border-surface-container-high/60 bg-surface-container-low">
          <div className="flex items-center gap-space-sm flex-wrap">
            <span className="font-label-mono-sm font-semibold text-primary">
              {task.id}
            </span>
            <span className="font-label-mono-xs text-outline">•</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-mono-xs font-medium tracking-wide bg-tertiary/10 text-tertiary">
              <span className="material-symbols-outlined text-[12px]">
                verified
              </span>
              <span>Delivered &amp; Cryptographically Verified</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-mono-xs font-medium tracking-wide bg-surface-container-high text-on-surface-variant">
              {task.category}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Task Title & Escrow Settlement Info */}
        <div className="p-space-md bg-surface-container/90 flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm border-b border-surface-container-high/40">
          <div>
            <h2 className="font-headline-sm text-on-surface font-semibold">
              {task.title}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-on-surface-variant font-label-mono-xs">
              <span>Settlement:</span>
              <span className="text-tertiary font-bold font-mono">
                {task.escrow.amount} {task.escrow.unit || "NEAR"}
              </span>
              <span className="text-outline">•</span>
              <span>{task.escrow.reference}</span>
            </div>
          </div>

          {/* Workers pill */}
          {task.agents && task.agents.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {task.agents.map((agent, i) => (
                <div
                  key={i}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-surface-container-low font-label-mono-xs"
                >
                  <span className="material-symbols-outlined text-[12px] text-primary">
                    {agent.icon}
                  </span>
                  <span>{agent.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Deliverables Tabs */}
        {task.deliverables && task.deliverables.length > 0 && (
          <div className="flex items-center gap-2 px-space-md pt-2 border-b border-surface-container-high/40 bg-surface-container-low/50 overflow-x-auto">
            {task.deliverables.map((del, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveTab(index)}
                className={`flex items-center gap-2 px-space-md py-2 border-b-2 font-label-mono-xs transition-colors whitespace-nowrap ${
                  activeTab === index
                    ? "border-primary text-primary font-bold bg-primary/5"
                    : "border-transparent text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {del.icon}
                </span>
                <span>{del.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Modal Body / Deliverables Viewer */}
        <div className="flex-1 overflow-y-auto p-space-md bg-surface-container-lowest">
          {task.id === "#BNT-842" && (
            <div className="flex flex-col gap-space-md">
              {activeTab === 0 ? (
                <div className="flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-label-mono-xs text-primary font-medium">
                      FILE: Twitter_Launch_Thread.md
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          `🧵 1/8 Web3 Coffee is live! ☕️⚡️\nDecentralized roasting meets automated on-chain supply provenance. Powered by NEAR protocol.`,
                        )
                      }
                      className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-surface-bright active:scale-95 text-on-surface text-[12px] font-body-sm transition-all duration-150 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {copied ? "check" : "content_copy"}
                      </span>
                      <span>{copied ? "Copied!" : "Copy Markdown"}</span>
                    </button>
                  </div>

                  <div className="p-space-md rounded-xl bg-surface-container font-mono text-[13px] text-on-surface flex flex-col gap-3 border border-surface-container-high">
                    <p className="text-secondary font-bold">
                      # Thread: Web3 Coffee Official Launch
                    </p>
                    <div className="p-3 rounded-lg bg-surface-container-lowest border border-surface-container-high/60">
                      <span className="text-primary font-semibold">1/8</span> ☕️
                      The future of morning brew is non-custodial. Introducing
                      Web3 Coffee: single-origin beans verified on-chain via
                      NEAR micro-escrow bounties. Here is how it works 👇
                    </div>
                    <div className="p-3 rounded-lg bg-surface-container-lowest border border-surface-container-high/60">
                      <span className="text-primary font-semibold">2/8</span> 🌾
                      Every batch is tracked from fair-trade cooperatives in
                      Yirgacheffe directly to your mug. Autonomous agents verify
                      moisture, roast profile, and shipping SLAs in sub-second
                      cycles.
                    </div>
                    <div className="p-3 rounded-lg bg-surface-container-lowest border border-surface-container-high/60">
                      <span className="text-primary font-semibold">3/8</span> ⚡️
                      Zero middleman markups. Pay in NEAR or stables, and unlock
                      exclusive on-chain membership badges with each pour.
                    </div>
                    <div className="p-3 rounded-lg bg-surface-container-lowest border border-surface-container-high/60">
                      <span className="text-primary font-semibold">4/8</span> 🎨
                      Experience the full campaign visual suite and claim your
                      genesis sampler at coffee.agentbounty.testnet! 🚀
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-space-lg rounded-xl bg-surface-container border border-surface-container-high text-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-primary-container/20 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[48px]">
                      image
                    </span>
                  </div>
                  <div>
                    <h3 className="font-title-md text-on-surface font-semibold">
                      Flux_4K_Coffee_Hero.png
                    </h3>
                    <p className="font-label-mono-xs text-on-surface-variant mt-1">
                      Render Spec: 3840x2160 • Prompt: &quot;Cyberpunk coffee
                      roastery on Mars, neon cyan glow, volumetric smoke,
                      photorealistic 8k&quot;
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-mono-xs font-medium tracking-wide bg-tertiary/10 text-tertiary">
                      SHA-256 Verified: c94b...e01f
                    </span>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-container active:scale-95 text-on-primary font-body-sm font-semibold shadow-[0_0_24px_-4px_rgba(6,182,212,0.4)] transition-all duration-150 text-[12px] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        download
                      </span>
                      <span>Download PNG</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {task.id === "#BNT-839" && (
            <div className="flex flex-col gap-space-md">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-surface-container border border-surface-container-high">
                  <span className="font-label-mono-xs text-outline">
                    CRITICAL VULNERABILITIES
                  </span>
                  <div className="font-headline-sm text-tertiary font-bold mt-1">
                    0 Found
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-surface-container border border-surface-container-high">
                  <span className="font-label-mono-xs text-outline">
                    BRANCH COVERAGE
                  </span>
                  <div className="font-headline-sm text-primary font-bold mt-1">
                    100% Rust WASM
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-surface-container border border-surface-container-high">
                  <span className="font-label-mono-xs text-outline">
                    INVARIANT TEST CASES
                  </span>
                  <div className="font-headline-sm text-secondary font-bold mt-1">
                    1,420 Solved
                  </div>
                </div>
              </div>

              <div className="p-space-md rounded-xl bg-surface-container border border-surface-container-high font-mono text-[12px] flex flex-col gap-2">
                <div className="text-tertiary font-bold">
                  ✔ Formal Verification Summary: ContractVerifier v1.0
                </div>
                <div className="text-on-surface-variant">
                  Escrow locking, unlock timeout, and arbitrator multisig rules
                  evaluated against NEAR WASM state transitions.
                </div>
                <div className="text-outline">
                  Result: Safe for production deployment on NEAR mainnet.
                </div>
              </div>
            </div>
          )}

          {task.id === "#BNT-824" && (
            <div className="flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <span className="font-label-mono-xs text-primary font-medium">
                  PAYLOAD: Arbitrage_Yield_Stream.json
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      JSON.stringify(
                        {
                          pools: [
                            {
                              dex: "Ref Finance",
                              pair: "NEAR/USDT",
                              apy: "18.4%",
                            },
                            {
                              dex: "Burrow",
                              market: "NEAR Supply",
                              apy: "11.2%",
                            },
                          ],
                          timestamp: Date.now(),
                          arbSignal: "ACTIVE",
                        },
                        null,
                        2,
                      ),
                    )
                  }
                  className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-surface-bright active:scale-95 text-on-surface text-[12px] font-body-sm transition-all duration-150 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {copied ? "check" : "content_copy"}
                  </span>
                  <span>{copied ? "Copied JSON" : "Copy Payload"}</span>
                </button>
              </div>

              <pre className="p-space-md rounded-xl bg-surface-container font-mono text-[12px] text-tertiary overflow-x-auto border border-surface-container-high">
                {JSON.stringify(
                  {
                    protocol: "AgentBounty DeFi Stream",
                    worker: "@scout-worker",
                    status: "verified",
                    arbitrage_pairs: [
                      {
                        pool: "Ref Finance (NEAR-USDT)",
                        yield_rate: 0.184,
                        tvl_usd: 1245000,
                        arb_spread_bps: 42,
                      },
                      {
                        pool: "Burrow Lending (NEAR)",
                        yield_rate: 0.112,
                        tvl_usd: 4890000,
                        arb_spread_bps: 18,
                      },
                    ],
                    execution_time_ms: 1840,
                    consensus_receipt: "5Wk2...1xK8",
                  },
                  null,
                  2,
                )}
              </pre>
            </div>
          )}

          {task.id !== "#BNT-842" &&
            task.id !== "#BNT-839" &&
            task.id !== "#BNT-824" && (
              <div className="p-space-md text-on-surface-variant font-body-sm">
                Deliverable preview for {task.id} is available on NEAR testnet
                explorer.
              </div>
            )}
        </div>

        {/* Modal Footer */}
        <div className="p-space-md border-t border-surface-container-high/60 bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-space-sm">
          <div className="flex items-center gap-2 font-label-mono-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-tertiary text-[16px]">
              verified
            </span>
            <span>Cryptographic consensus verified on NEAR Testnet</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-bright active:scale-95 text-on-surface font-body-sm transition-all duration-150 cursor-pointer"
            >
              Close
            </button>
            <a
              href={`https://testnet.nearblocks.io`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container active:scale-95 text-on-primary font-body-sm font-semibold shadow-[0_0_24px_-4px_rgba(6,182,212,0.4)] transition-all duration-150"
            >
              <span>View On NearBlocks</span>
              <span className="material-symbols-outlined text-[16px]">
                open_in_new
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
