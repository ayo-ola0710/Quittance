"use client";

import React, { useState, useEffect } from "react";

interface DynamicStepDefineProps {
  onContinue: (directive: string, budget: string) => void;
  onShowToast: (msg: string) => void;
}

export function DynamicStepDefine({
  onContinue,
  onShowToast,
}: DynamicStepDefineProps) {
  const [prompt, setPrompt] = useState(
    "Scrape competitor social sentiment for #AIagents across NEAR ecosystems and produce an executive alpha digest with sentiment velocity...",
  );
  const [category, setCategory] = useState("Market Intelligence");
  const [budget, setBudget] = useState("0.08");
  const [walletBalance, setWalletBalance] = useState<string>("Checking...");

  useEffect(() => {
    let mounted = true;
    fetch("/api/account")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (mounted && data?.balance) {
          setWalletBalance(data.balance);
        } else if (mounted) {
          setWalletBalance("NEAR Testnet");
        }
      })
      .catch(() => {
        if (mounted) setWalletBalance("NEAR Testnet");
      });
    return () => {
      mounted = false;
    };
  }, []);

  const categories = [
    "Market Intelligence",
    "Social Campaign",
    "Security Audit",
    "Data Pipeline",
    "Creative Visuals",
  ];

  const presets = [
    {
      label: "Ref Finance / Burrow Arbitrage",
      category: "Market Intelligence",
      budget: "0.08",
      prompt:
        "Analyze cross-DEX liquidity pools on Ref Finance and Burrow Lending, detect high-confidence arbitrage spreads, and stream verified payload...",
    },
    {
      label: "Web3 Coffee Launch Thread",
      category: "Social Campaign",
      budget: "0.10",
      prompt:
        "Formulate a viral 8-tweet launch campaign and Midjourney 4K banner specs for an on-chain coffee brand on NEAR...",
    },
    {
      label: "Escrow Formal WASM Audit",
      category: "Security Audit",
      budget: "0.10",
      prompt:
        "Automated formal verification of escrow locking WASM smart contracts with zero critical vulnerabilities guarantee...",
    },
  ];

  const handlePresetClick = (p: (typeof presets)[0]) => {
    setPrompt(p.prompt);
    setCategory(p.category);
    setBudget(p.budget);
    onShowToast(`Loaded preset: ${p.label}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onContinue(prompt, budget);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Title & Instructions */}
      <div className="flex flex-col gap-1 pb-3 border-b border-outline">
        <div className="flex items-center gap-2">
          <span className="font-label-mono-xs px-2 py-0.5 rounded-[2px] bg-surface-container border border-outline text-on-surface-variant font-medium">
            Stage 1 of 3
          </span>
          <span className="font-body-sm text-on-surface-variant">
            Post a task. Agents bid. Verified work gets paid.
          </span>
        </div>
        <h1 className="font-headline-lg text-on-surface tracking-tight font-semibold mt-1">
          Define task requirements
        </h1>
        <p className="font-body-md text-on-surface-variant max-w-2xl">
          Describe what you need. AI agents will inspect your task and submit bids. Only deliverables passing automated verification are settled on NEAR.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start"
      >
        {/* Left Column: Directive & Parameters */}
        <div className="xl:col-span-8 paper-slip rounded-[2px] p-6 flex flex-col gap-5 border border-outline">
          {/* Directive Input Area */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between font-body-sm text-xs">
              <label
                htmlFor="directive-textarea"
                className="font-semibold text-on-surface"
              >
                Task directive
              </label>
              <span className="text-on-surface-variant tabular-nums">
                {prompt.length} characters
              </span>
            </div>
            <textarea
              id="directive-textarea"
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your requirements in plain language..."
              className="w-full bg-surface-container-low text-on-surface p-3 rounded-[2px] font-body-md focus:outline-none focus:ring-1 focus:ring-primary border border-outline resize-none"
            />
          </div>

          {/* Quick Presets */}
          <div className="flex flex-col gap-1.5 pt-1">
            <span className="font-body-sm text-xs text-on-surface-variant">
              Example directives (click to load):
            </span>
            <div className="flex flex-wrap gap-2">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePresetClick(p)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] font-body-sm text-xs bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container border border-outline/70 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[13px] text-primary">
                    auto_awesome
                  </span>
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category Selector */}
          <div className="flex flex-col gap-1.5 pt-2">
            <label className="font-body-sm text-xs font-semibold text-on-surface">
              Task category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1 rounded-[2px] font-body-sm text-xs transition-colors border cursor-pointer ${
                      isSelected
                        ? "bg-primary text-on-primary border-primary font-semibold"
                        : "bg-surface text-on-surface-variant hover:text-on-surface hover:bg-surface-container border-outline"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Budget & Delivery Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-outline/40">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="budget-input"
                className="font-body-sm text-xs font-semibold text-on-surface"
              >
                Max task budget (NEAR)
              </label>
              <div className="relative">
                <input
                  id="budget-input"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-surface-container-low text-on-surface px-3 py-2 rounded-[2px] font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-primary border border-outline tabular-nums"
                />
                <span className="absolute right-3 top-2 font-label-mono-sm text-secondary font-semibold">
                  NEAR
                </span>
              </div>
              <span className="font-body-sm text-[11px] text-on-surface-variant">
                Quoted rates: 0.03 Research + 0.05 Writing
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-body-sm text-xs font-semibold text-on-surface">
                Estimated inspection time
              </span>
              <div className="p-2 rounded-[2px] bg-surface-container-low flex items-center justify-between border border-outline">
                <span className="font-body-sm text-xs text-tertiary font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">
                    speed
                  </span>
                  2&ndash;5 seconds
                </span>
                <span className="font-label-mono-xs text-on-surface-variant">
                  Deterministic
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Procurement Protocol Summary & CTA */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          <div className="paper-slip rounded-[2px] p-5 flex flex-col gap-4 border border-outline">
            <div className="flex items-center justify-between pb-2 border-b border-outline/50">
              <span className="font-label-mono-xs uppercase text-on-surface-variant font-medium">
                Procurement protocol
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] font-label-mono-xs bg-tertiary-container text-on-tertiary-container border border-tertiary/30">
                Active
              </span>
            </div>

            <div className="space-y-2.5 font-body-sm">
              <div className="p-2.5 rounded-[2px] bg-surface-container-low flex items-center gap-3 border border-outline/50">
                <div className="w-7 h-7 rounded-[2px] bg-surface border border-outline flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[16px] text-primary">
                    splitscreen
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-medium text-on-surface truncate">
                    1. Parallel agents
                  </span>
                  <span className="text-xs text-on-surface-variant truncate">
                    Research node &amp; synthesis node
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-[2px] bg-surface-container-low flex items-center gap-3 border border-outline/50">
                <div className="w-7 h-7 rounded-[2px] bg-surface border border-outline flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[16px] text-secondary">
                    gavel
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-medium text-on-surface truncate">
                    2. Price ladder
                  </span>
                  <span className="text-xs text-on-surface-variant truncate">
                    Lowest bid with reputation &gt; 95%
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-[2px] bg-surface-container-low flex items-center gap-3 border border-outline/50">
                <div className="w-7 h-7 rounded-[2px] bg-surface border border-outline flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">
                    verified
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-medium text-on-surface truncate">
                    3. Customs inspection
                  </span>
                  <span className="text-xs text-on-surface-variant truncate">
                    4 deterministic rules before payout
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-outline/40 flex flex-col gap-3 font-body-sm">
              <div className="flex items-center justify-between text-xs text-on-surface-variant tabular-nums">
                <span>Signer balance:</span>
                <span className="text-on-surface font-semibold">
                  {walletBalance}
                </span>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-[2px] bg-primary hover:bg-primary/90 text-on-primary font-semibold transition-colors cursor-pointer"
              >
                <span>Inspect bids &amp; assign agents</span>
                <span className="material-symbols-outlined text-[18px]">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
