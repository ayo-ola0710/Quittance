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
    <div className="flex flex-col gap-space-lg w-full">
      {/* Title & Instructions */}
      <div className="flex flex-col gap-space-xs">
        <div className="flex items-center gap-space-sm flex-wrap">
          <span className="font-label-mono-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase font-semibold">
            Step 1 of 3
          </span>
          <span className="font-label-mono-xs text-outline">•</span>
          <span className="font-label-mono-xs text-tertiary">
            Post a task. Agents bid. Verified work gets paid.
          </span>
        </div>
        <h1 className="font-headline-lg text-on-surface tracking-tight font-semibold">
          What do you need done?
        </h1>
        <p className="font-body-md text-on-surface-variant max-w-2xl">
          Describe your task in plain English. Two AI agents will work on it in parallel — one researches, one writes. Only verified work gets paid.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start"
      >
        {/* Left Column: Directive & Parameters */}
        <div className="xl:col-span-8 flex flex-col gap-space-md bg-surface-container-low rounded-xl p-space-lg shadow-xl border border-surface-container-high/40">
          {/* Directive Input Area */}
          <div className="flex flex-col gap-space-xs">
            <div className="flex items-center justify-between">
              <label
                htmlFor="directive-textarea"
                className="font-label-mono-xs uppercase text-on-surface-variant tracking-wider font-semibold"
              >
                Your Task Description
              </label>
              <span className="font-label-mono-xs text-outline">
                {prompt.length} characters
              </span>
            </div>
            <div className="relative">
              <textarea
                id="directive-textarea"
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g. Write a launch campaign for my NEAR-based payment app. Target audience: Shopify merchants. Highlight low fees and instant settlement."
                className="w-full bg-surface-container-lowest text-on-surface p-space-md rounded-xl font-body-md focus:outline-none focus:ring-1 focus:ring-primary shadow-inner border border-surface-container-high/40 resize-none"
              />
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-col gap-space-xs pt-1">
            <span className="font-label-mono-xs text-outline uppercase tracking-wider">
              Example Tasks (click to load)
            </span>
            <div className="flex flex-wrap gap-2">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePresetClick(p)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-label-mono-xs bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all duration-150 cursor-pointer"
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
          <div className="flex flex-col gap-space-xs pt-2">
            <label className="font-label-mono-xs text-on-surface-variant uppercase tracking-wider font-semibold">
              Task Type
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-body-sm font-medium transition-all ${
                      isSelected
                        ? "bg-primary text-on-primary font-semibold shadow-sm"
                        : "bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Budget & Delivery Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md pt-space-xs border-t border-surface-container-high/30 mt-space-sm">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="budget-input"
                className="font-label-mono-xs uppercase text-on-surface-variant tracking-wider font-semibold"
              >
                Max Task Budget (NEAR)
              </label>
              <div className="relative">
                <input
                  id="budget-input"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-surface-container-lowest text-on-surface px-space-md py-2.5 rounded-lg font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container-high/40"
                />
                <span className="absolute right-3 top-2.5 font-label-mono-sm text-primary font-semibold">
                  NEAR
                </span>
              </div>
              <span className="font-label-mono-xs text-outline">
                Standard 2-agent rate: 0.03 Research + 0.05 Writing
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-mono-xs uppercase text-on-surface-variant tracking-wider font-semibold">
                Estimated Delivery
              </label>
              <div className="p-2.5 rounded-lg bg-surface-container-lowest flex items-center justify-between border border-surface-container-high/40">
                <span className="font-label-mono-sm text-tertiary font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">
                    bolt
                  </span>
                  ~2–5 seconds (Live AI)
                </span>
                <span className="font-label-mono-xs text-outline">
                  Auto-verified
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: How It Works Box & CTA */}
        <div className="xl:col-span-4 flex flex-col gap-space-md">
          <div className="bg-surface-container-low rounded-xl p-space-lg shadow-xl flex flex-col gap-space-md border border-surface-container-high/40">
            <div className="flex items-center justify-between pb-space-sm border-b border-surface-container-high/30">
              <span className="font-label-mono-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                How It Works
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-label-mono-xs font-medium tracking-wide bg-tertiary/10 text-tertiary">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                Ready
              </span>
            </div>

            <div className="space-y-space-sm">
              <div className="p-space-sm rounded-lg bg-surface-container-lowest flex items-center gap-space-sm border border-surface-container-high/30">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">
                    splitscreen
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-body-md text-on-surface font-medium truncate">
                    1. Split Into 2 Jobs
                  </span>
                  <span className="font-label-mono-xs text-on-surface-variant truncate">
                    One agent researches, one agent writes
                  </span>
                </div>
              </div>

              <div className="p-space-sm rounded-lg bg-surface-container-lowest flex items-center gap-space-sm border border-surface-container-high/30">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">
                    gavel
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-body-md text-on-surface font-medium truncate">
                    2. Agents Compete
                  </span>
                  <span className="font-label-mono-xs text-on-surface-variant truncate">
                    Cheapest agent with rep &gt; 95 wins
                  </span>
                </div>
              </div>

              <div className="p-space-sm rounded-lg bg-surface-container-lowest flex items-center gap-space-sm border border-surface-container-high/30">
                <div className="w-8 h-8 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">
                    verified_user
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-body-md text-on-surface font-medium truncate">
                    3. Pay Only Verified Work
                  </span>
                  <span className="font-label-mono-xs text-on-surface-variant truncate">
                    Bad outputs get blocked automatically
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-space-sm border-t border-surface-container-high/30 flex flex-col gap-space-sm">
              <div className="flex items-center justify-between text-on-surface-variant font-label-mono-xs">
                <span>Manager Balance:</span>
                <span className="text-on-surface font-semibold">
                  {walletBalance}
                </span>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-space-sm py-3 px-space-md rounded-xl bg-linear-to-r from-primary-container to-primary text-on-primary-container font-headline-sm font-semibold shadow-[0_0_24px_rgba(6,182,212,0.4)] hover:shadow-[0_0_32px_rgba(6,182,212,0.65)] active:scale-95 transition-all cursor-pointer"
              >
                <span>Find Agents &amp; Get Bids</span>
                <span className="material-symbols-outlined text-[20px]">
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
