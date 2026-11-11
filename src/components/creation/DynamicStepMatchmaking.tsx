"use client";

import React, { useState } from "react";

interface DynamicStepMatchmakingProps {
  directivePrompt: string;
  onBack: () => void;
  onConfirmLock: () => void;
  onShowToast: (msg: string) => void;
}

export function DynamicStepMatchmaking({
  directivePrompt,
  onBack,
  onConfirmLock,
  onShowToast,
}: DynamicStepMatchmakingProps) {
  const [worker1, setWorker1] = useState("ScrapeScout v3.0");
  const [worker2, setCopyAgent] = useState("CopyAgent v2.1");
  const [isLocking, setIsLocking] = useState(false);

  const handleLockClick = () => {
    setIsLocking(true);
    onShowToast("Allocating 0.08 NEAR in Agent Treasury Engine...");
    setTimeout(() => {
      setIsLocking(false);
      onConfirmLock();
    }, 1000);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard?.writeText(id);
    onShowToast(`Copied ${id}`);
  };

  return (
    <div className="flex flex-col gap-space-lg w-full">
      {/* HEADER & INTENT BANNER */}
      <div className="flex flex-col gap-space-sm">
        <div className="flex flex-wrap items-center justify-between gap-space-md">
          <div>
            <div className="flex items-center gap-space-sm mb-1">
              <span className="font-label-mono-xs px-2 py-0.5 rounded-full bg-secondary-container/40 text-secondary uppercase font-semibold">
                Decentralized Matchmaker Engine
              </span>
              <span className="font-label-mono-xs text-outline">•</span>
              <span className="font-label-mono-xs text-tertiary flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">
                  bolt
                </span>
                8 Candidate Nodes Evaluated in 0.34s
              </span>
            </div>
            <h1 className="font-headline-lg text-on-surface tracking-tight font-semibold">
              Swarm Matchmaking &amp; Escrow Authorization
            </h1>
            <p className="font-body-md text-on-surface-variant mt-0.5">
              The Orchestrator parsed your intent DAG into 2 deterministic
              sub-tasks. Authorize on-chain testnet escrow to trigger parallel
              execution.
            </p>
          </div>

          {/* Quick Metrics Pill Pack */}
          <div className="flex items-center gap-space-sm bg-surface-container-low p-1.5 rounded-full shadow-md border border-surface-container-high/40">
            <div className="flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container">
              <span className="material-symbols-outlined text-primary text-[16px]">
                device_hub
              </span>
              <span className="font-label-mono-sm text-on-surface">
                2 Sub-tasks
              </span>
            </div>
            <div className="flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container">
              <span className="material-symbols-outlined text-tertiary text-[16px]">
                savings
              </span>
              <span className="font-label-mono-sm text-tertiary">
                Saves 0.02 NEAR
              </span>
            </div>
            <div className="flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container">
              <span className="material-symbols-outlined text-secondary text-[16px]">
                verified
              </span>
              <span className="font-label-mono-sm text-secondary">
                Non-Custodial
              </span>
            </div>
          </div>
        </div>

        {/* Evaluated Directive Accordion / Banner */}
        <div className="w-full bg-surface-container-low rounded-xl p-space-md shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md border border-surface-container-high/40">
          <div className="flex items-start md:items-center gap-space-md min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 md:mt-0">
              <span className="material-symbols-outlined text-primary text-[18px]">
                terminal
              </span>
            </div>
            <div className="min-w-0 flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-label-mono-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                  Active Decomposition Prompt
                </span>
                <span className="px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface font-label-mono-xs">
                  SHA256: 9b2d...f401
                </span>
              </div>
              <p className="font-label-mono-md text-on-surface truncate mt-0.5 max-w-3xl">
                &quot;{directivePrompt}&quot;
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="shrink-0 flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-body-sm transition-all shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-primary">
              edit
            </span>
            <span>Edit Directive</span>
          </button>
        </div>
      </div>

      {/* MAIN TWO-COLUMN SPLIT */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
        {/* LEFT 8 COLS: CANDIDATE SELECTION GRID */}
        <div className="xl:col-span-8 flex flex-col gap-space-lg">
          {/* Optimal Swarm Selected Overview Bar */}
          <div className="p-space-md rounded-xl bg-linear-to-r from-primary/10 via-secondary/15 to-transparent bg-surface-container-low flex items-center justify-between shadow-lg border border-surface-container-high/40">
            <div className="flex items-center gap-space-md">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-on-secondary shadow-[0_0_16px_rgba(208,188,255,0.4)] shrink-0">
                <span className="material-symbols-outlined text-[22px]">
                  smart_toy
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-headline-sm text-on-surface">
                    Selected Optimal Pair: {worker1} + {worker2}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-tertiary/20 text-tertiary font-label-mono-xs font-semibold">
                    Rank #1 by DAG Score
                  </span>
                </div>
                <p className="font-body-sm text-on-surface-variant">
                  Combined Cost:{" "}
                  <strong className="text-on-surface font-label-mono-sm">
                    0.08 NEAR
                  </strong>{" "}
                  • Estimated Parallel Pipeline Latency:{" "}
                  <strong className="text-primary font-label-mono-sm">
                    1.82s total
                  </strong>
                </p>
              </div>
            </div>
            <span className="hidden md:flex items-center gap-1 font-label-mono-xs text-primary bg-primary/10 px-space-sm py-1 rounded-full">
              <span className="material-symbols-outlined text-[14px]">
                format_image_left
              </span>
              Deterministic Pair
            </span>
          </div>

          {/* Sub-Task Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-md">
            {/* SUB-TASK 1 */}
            <div className="bg-surface-container-low rounded-xl p-space-lg flex flex-col justify-between shadow-xl relative overflow-hidden group hover:shadow-[0_0_24px_-4px_rgba(6,182,212,0.2)] transition-all border border-surface-container-high/40">
              <div className="absolute top-0 right-0 w-36 h-36 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

              <div className="flex flex-col gap-space-md">
                <div className="flex items-start justify-between gap-space-sm">
                  <div>
                    <div className="flex items-center gap-space-xs mb-1">
                      <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                      <span className="font-label-mono-xs text-primary uppercase font-semibold">
                        Sub-task #1 • Data Ingestion
                      </span>
                    </div>
                    <h3 className="font-headline-sm text-on-surface">
                      Social Sentiment &amp; Scraping
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 px-space-sm py-1 rounded-full bg-primary/10 text-primary font-label-mono-xs font-semibold">
                    <span className="material-symbols-outlined text-[14px]">
                      lock
                    </span>
                    Auto-Selected
                  </div>
                </div>

                {/* Worker Profile Card */}
                <div className="p-space-md rounded-xl bg-surface-container flex flex-col gap-space-sm border border-surface-container-high/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-sm">
                      <div className="relative w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center shadow-inner overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          alt="Autonomous robotic data miner avatar"
                          className="w-full h-full object-cover"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYWadW5MpDch1FaelWjwyh8T7fAtCOLXnvOxvePyvPu_xBESNtGZ90pbbvCBV7dahvoiirB4PiLoDnJ5a14QRm281keVHEHZgQV8Z-9BzFwBtEo_-sS8uIlsOz1A0mzm91Ji6jBby_b91i5XFpf3RVSdVGMymc-dnrRGgn9Dt-vkY7MT-cS8GTgbiLCfsZ196-hB9IzMxPtmamxchXTqyYJGAGw5_mj9NGO2lJDUQ"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-title-md text-on-surface font-semibold">
                            {worker1}
                          </span>
                          <span
                            className="material-symbols-outlined text-primary text-[16px]"
                            title="NEAR On-Chain Verified Agent"
                          >
                            verified
                          </span>
                        </div>
                        <span className="font-label-mono-xs text-on-surface-variant flex items-center gap-1">
                          @scout-worker.testnet
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyId("@scout-worker.testnet")
                            }
                            className="hover:text-primary transition-colors cursor-pointer"
                            title="Copy Agent ID"
                          >
                            <span className="material-symbols-outlined text-[12px]">
                              content_copy
                            </span>
                          </button>
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="font-label-mono-xs text-on-surface-variant">
                        Intent Relevance
                      </span>
                      <span className="font-label-mono-md text-primary font-semibold px-2 py-0.5 rounded-full bg-primary/10 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                        99.2%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-space-xs pt-space-xs mt-space-xs">
                    <div className="bg-surface-container-low p-2 rounded-lg flex flex-col">
                      <span className="font-label-mono-xs text-on-surface-variant">
                        Success SLA
                      </span>
                      <span className="font-label-mono-sm text-tertiary font-semibold flex items-center gap-0.5 mt-0.5">
                        <span className="material-symbols-outlined text-[13px]">
                          check
                        </span>
                        100% (64/64)
                      </span>
                    </div>
                    <div className="bg-surface-container-low p-2 rounded-lg flex flex-col">
                      <span className="font-label-mono-xs text-on-surface-variant">
                        Turnaround
                      </span>
                      <span className="font-label-mono-sm text-on-surface font-semibold flex items-center gap-0.5 mt-0.5">
                        <span className="material-symbols-outlined text-[13px] text-primary">
                          speed
                        </span>
                        &lt; 0.8s
                      </span>
                    </div>
                    <div className="bg-surface-container-low p-2 rounded-lg flex flex-col">
                      <span className="font-label-mono-xs text-on-surface-variant">
                        Sub-bounty
                      </span>
                      <span className="font-label-mono-sm text-primary font-semibold flex items-center gap-0.5 mt-0.5">
                        0.03 NEAR
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-mono-xs">
                      Twitter/X API v2
                    </span>
                    <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-mono-xs">
                      NEAR Social Indexer
                    </span>
                    <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-mono-xs">
                      Sentiment NLP
                    </span>
                  </div>
                </div>

                <div className="bg-surface-container-lowest p-space-sm rounded-lg flex items-center justify-between border border-surface-container-high/30">
                  <div className="flex items-center gap-space-xs text-on-surface-variant font-label-mono-xs">
                    <span className="material-symbols-outlined text-[16px] text-outline">
                      data_object
                    </span>
                    <span>
                      Returns JSON Stream:{" "}
                      <code className="text-primary">
                        &#123; raw_posts, sentiment_vector &#125;
                      </code>
                    </span>
                  </div>
                  <span className="font-label-mono-xs text-tertiary">
                    Verified Hash Contract
                  </span>
                </div>
              </div>

              <div className="pt-space-md mt-space-md border-t border-surface-container-high/30">
                <label className="font-label-mono-xs text-on-surface-variant uppercase tracking-wider mb-1 block">
                  Alternative Node Assignment
                </label>
                <div className="relative">
                  <select
                    value={worker1}
                    onChange={(e) => {
                      setWorker1(
                        e.target.value.split(" ")[0] +
                          " " +
                          e.target.value.split(" ")[1],
                      );
                      onShowToast(`Selected ${e.target.value}`);
                    }}
                    className="w-full bg-surface-container-highest text-on-surface font-label-mono-sm rounded-lg px-space-md py-2 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container-high/40"
                  >
                    <option value="ScrapeScout v3.0">
                      Active: ScrapeScout v3.0 (0.03 NEAR • 99.2% match)
                    </option>
                    <option value="RSSFeedScout v1.4">
                      Switch to: RSSFeedScout v1.4 (0.04 NEAR • 94.1% match)
                    </option>
                    <option value="HyperFeed Worker">
                      Switch to: HyperFeed Worker (0.05 NEAR • 91.8% match)
                    </option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-2.5 text-on-surface-variant pointer-events-none text-[18px]">
                    expand_more
                  </span>
                </div>
              </div>
            </div>

            {/* SUB-TASK 2 */}
            <div className="bg-surface-container-low rounded-xl p-space-lg flex flex-col justify-between shadow-xl relative overflow-hidden group hover:shadow-[0_0_24px_-4px_rgba(139,92,246,0.2)] transition-all border border-surface-container-high/40">
              <div className="absolute top-0 right-0 w-36 h-36 bg-secondary/5 rounded-full blur-2xl pointer-events-none" />

              <div className="flex flex-col gap-space-md">
                <div className="flex items-start justify-between gap-space-sm">
                  <div>
                    <div className="flex items-center gap-space-xs mb-1">
                      <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
                      <span className="font-label-mono-xs text-secondary uppercase font-semibold">
                        Sub-task #2 • Analytical Synthesis
                      </span>
                    </div>
                    <h3 className="font-headline-sm text-on-surface">
                      Copy Synthesis &amp; Brief
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 px-space-sm py-1 rounded-full bg-secondary/15 text-secondary font-label-mono-xs font-semibold">
                    <span className="material-symbols-outlined text-[14px]">
                      lock
                    </span>
                    Auto-Selected
                  </div>
                </div>

                <div className="p-space-md rounded-xl bg-surface-container flex flex-col gap-space-sm border border-surface-container-high/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-sm">
                      <div className="relative w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center shadow-inner overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          alt="Holographic intelligence synthesizer agent avatar"
                          className="w-full h-full object-cover"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkF6rnHzmHbW7CnxV7erqNBzapLeuK1yjgXtGi_KYS7XBhqAuEgX75Uhf48ofTbHN8lfHXbTG_ynBBFw56e7tZzaFQeBiZWKsM3XYDjRW3pjpgzW7Mzit_wwekuB8Y6OKq40I_4g-U4_R-5-YfMb0i8r_WfxVn96cwWSNk2_8F4R-TFb36vKdea9FUJBTLgDChaLnhDe3WGDjYP1oQwdaMK_4e4MLAXlQyr_c_lcg"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-title-md text-on-surface font-semibold">
                            {worker2}
                          </span>
                          <span
                            className="material-symbols-outlined text-secondary text-[16px]"
                            title="NEAR On-Chain Verified Agent"
                          >
                            verified
                          </span>
                        </div>
                        <span className="font-label-mono-xs text-on-surface-variant flex items-center gap-1">
                          @copy-agent.testnet
                          <button
                            type="button"
                            onClick={() => handleCopyId("@copy-agent.testnet")}
                            className="hover:text-secondary transition-colors cursor-pointer"
                            title="Copy Agent ID"
                          >
                            <span className="material-symbols-outlined text-[12px]">
                              content_copy
                            </span>
                          </button>
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="font-label-mono-xs text-on-surface-variant">
                        Intent Relevance
                      </span>
                      <span className="font-label-mono-md text-secondary font-semibold px-2 py-0.5 rounded-full bg-secondary/15 shadow-[0_0_12px_rgba(139,92,246,0.3)]">
                        98.6%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-space-xs pt-space-xs mt-space-xs">
                    <div className="bg-surface-container-low p-2 rounded-lg flex flex-col">
                      <span className="font-label-mono-xs text-on-surface-variant">
                        Success SLA
                      </span>
                      <span className="font-label-mono-sm text-tertiary font-semibold flex items-center gap-0.5 mt-0.5">
                        <span className="material-symbols-outlined text-[13px]">
                          check
                        </span>
                        99.4% (142/144)
                      </span>
                    </div>
                    <div className="bg-surface-container-low p-2 rounded-lg flex flex-col">
                      <span className="font-label-mono-xs text-on-surface-variant">
                        Turnaround
                      </span>
                      <span className="font-label-mono-sm text-on-surface font-semibold flex items-center gap-0.5 mt-0.5">
                        <span className="material-symbols-outlined text-[13px] text-secondary">
                          speed
                        </span>
                        &lt; 1.5s
                      </span>
                    </div>
                    <div className="bg-surface-container-low p-2 rounded-lg flex flex-col">
                      <span className="font-label-mono-xs text-on-surface-variant">
                        Sub-bounty
                      </span>
                      <span className="font-label-mono-sm text-secondary font-semibold flex items-center gap-0.5 mt-0.5">
                        0.05 NEAR
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-mono-xs">
                      Executive Markdown
                    </span>
                    <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-mono-xs">
                      Alpha Radar Matrix
                    </span>
                    <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-mono-xs">
                      IPFS Snapshot
                    </span>
                  </div>
                </div>

                <div className="bg-surface-container-lowest p-space-sm rounded-lg flex items-center justify-between border border-surface-container-high/30">
                  <div className="flex items-center gap-space-xs text-on-surface-variant font-label-mono-xs">
                    <span className="material-symbols-outlined text-[16px] text-outline">
                      description
                    </span>
                    <span>
                      Returns Formatted:{" "}
                      <code className="text-secondary">
                        alpha_brief.md + digest.json
                      </code>
                    </span>
                  </div>
                  <span className="font-label-mono-xs text-tertiary">
                    Cryptographic Sign-off
                  </span>
                </div>
              </div>

              <div className="pt-space-md mt-space-md border-t border-surface-container-high/30">
                <label className="font-label-mono-xs text-on-surface-variant uppercase tracking-wider mb-1 block">
                  Alternative Node Assignment
                </label>
                <div className="relative">
                  <select
                    value={worker2}
                    onChange={(e) => {
                      setCopyAgent(
                        e.target.value.split(" ")[0] +
                          " " +
                          e.target.value.split(" ")[1],
                      );
                      onShowToast(`Selected ${e.target.value}`);
                    }}
                    className="w-full bg-surface-container-highest text-on-surface font-label-mono-sm rounded-lg px-space-md py-2 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-secondary border border-surface-container-high/40"
                  >
                    <option value="CopyAgent v2.1">
                      Active: CopyAgent v2.1 (0.05 NEAR • 98.6% match)
                    </option>
                    <option value="PromptArtisan v3">
                      Switch to: PromptArtisan v3 (0.05 NEAR • 92.4% match)
                    </option>
                    <option value="ClaudeAlpha Digest">
                      Switch to: ClaudeAlpha Digest (0.08 NEAR • 95.0% match)
                    </option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-2.5 text-on-surface-variant pointer-events-none text-[18px]">
                    expand_more
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* DAG Flow Execution Vector Visualizer */}
          <div className="bg-surface-container-low rounded-xl p-space-md shadow-md flex flex-col gap-space-sm border border-surface-container-high/40">
            <div className="flex items-center justify-between">
              <span className="font-label-mono-xs uppercase text-on-surface-variant tracking-wider font-semibold">
                Autonomous Orchestration Graph (DAG Dependency)
              </span>
              <span className="font-label-mono-xs text-primary flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">
                  schema
                </span>
                Serialized Pipelined Topology
              </span>
            </div>

            <div className="w-full bg-surface-container-lowest rounded-lg p-space-md flex flex-col md:flex-row items-center justify-between gap-space-md border border-surface-container-high/30">
              <div className="flex items-center gap-space-sm">
                <div className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center font-label-mono-xs text-on-surface-variant">
                  0
                </div>
                <div className="flex flex-col">
                  <span className="font-label-mono-sm text-on-surface">
                    Manager Input
                  </span>
                  <span className="font-label-mono-xs text-outline">
                    Directive Parsed
                  </span>
                </div>
              </div>

              <div className="flex-1 w-full md:w-auto h-6 flex items-center justify-center">
                <svg
                  className="w-full h-2 text-primary/40"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 2"
                >
                  <line
                    stroke="currentColor"
                    strokeDasharray="3 3"
                    x1="0"
                    x2="100"
                    y1="1"
                    y2="1"
                  />
                </svg>
              </div>

              <div className="flex items-center gap-space-sm px-space-sm py-1 rounded bg-primary/10">
                <div className="w-7 h-7 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-label-mono-xs font-semibold">
                  1
                </div>
                <div className="flex flex-col">
                  <span className="font-label-mono-sm text-primary font-semibold">
                    {worker1}
                  </span>
                  <span className="font-label-mono-xs text-on-surface-variant">
                    Extract Data
                  </span>
                </div>
              </div>

              <div className="flex-1 w-full md:w-auto h-6 flex items-center justify-center">
                <svg
                  className="w-full h-2 text-secondary/40"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 2"
                >
                  <line
                    stroke="currentColor"
                    strokeDasharray="3 3"
                    x1="0"
                    x2="100"
                    y1="1"
                    y2="1"
                  />
                </svg>
              </div>

              <div className="flex items-center gap-space-sm px-space-sm py-1 rounded bg-secondary/15">
                <div className="w-7 h-7 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-label-mono-xs font-semibold">
                  2
                </div>
                <div className="flex flex-col">
                  <span className="font-label-mono-sm text-secondary font-semibold">
                    {worker2}
                  </span>
                  <span className="font-label-mono-xs text-on-surface-variant">
                    Synthesize Brief
                  </span>
                </div>
              </div>

              <div className="flex-1 w-full md:w-auto h-6 flex items-center justify-center">
                <svg
                  className="w-full h-2 text-tertiary/40"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 2"
                >
                  <line
                    stroke="currentColor"
                    strokeDasharray="3 3"
                    x1="0"
                    x2="100"
                    y1="1"
                    y2="1"
                  />
                </svg>
              </div>

              <div className="flex items-center gap-space-sm">
                <div className="w-7 h-7 rounded-full bg-tertiary-container/30 flex items-center justify-center text-tertiary font-label-mono-xs">
                  <span className="material-symbols-outlined text-[16px]">
                    account_balance_wallet
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-mono-sm text-tertiary font-semibold">
                    Escrow Release
                  </span>
                  <span className="font-label-mono-xs text-outline">
                    Deterministic Settlement
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT 4 COLS: ESCROW AUTHORIZATION */}
        <div className="xl:col-span-4 flex flex-col gap-space-md">
          <div className="bg-surface-container-low rounded-xl p-space-lg shadow-2xl relative overflow-hidden flex flex-col gap-space-lg border border-surface-container-high/40">
            <div className="absolute -right-16 -bottom-16 w-52 h-52 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            {/* Escrow Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="material-symbols-outlined text-primary text-[18px]">
                    verified_user
                  </span>
                  <span className="font-label-mono-xs uppercase text-primary tracking-wider font-semibold">
                    Smart Escrow Lock
                  </span>
                </div>
                <h2 className="font-headline-sm text-on-surface">
                  Escrow Authorization
                </h2>
                <span className="font-label-mono-xs text-on-surface-variant font-mono">
                  deposit_and_hire()
                </span>
              </div>
              <span className="px-2 py-1 rounded bg-surface-container-high text-on-surface-variant font-label-mono-xs">
                NEAR Testnet
              </span>
            </div>

            {/* Target Contract Metadata */}
            <div className="bg-surface-container p-space-sm rounded-lg flex flex-col gap-1 border border-surface-container-high/30">
              <span className="font-label-mono-xs text-on-surface-variant uppercase">
                Agent Treasury Engine
              </span>
              <div className="flex items-center justify-between">
                <span className="font-label-mono-sm text-on-surface font-semibold">
                  treasury.swarmpay.testnet
                </span>
                <span className="material-symbols-outlined text-tertiary text-[16px]">
                  lock
                </span>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="flex flex-col gap-space-sm">
              <span className="font-label-mono-xs uppercase tracking-wider text-on-surface-variant font-semibold">
                Bounty &amp; Fee Breakdown
              </span>
              <div className="flex flex-col gap-space-xs bg-surface-container-lowest p-space-md rounded-xl border border-surface-container-high/30">
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-space-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="font-body-sm text-on-surface">
                      ScrapeScout Task #1 Bounty
                    </span>
                  </div>
                  <span className="font-label-mono-sm text-on-surface font-semibold">
                    0.0300 NEAR
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-space-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    <span className="font-body-sm text-on-surface">
                      CopyAgent Task #2 Bounty
                    </span>
                  </div>
                  <span className="font-label-mono-sm text-on-surface font-semibold">
                    0.0500 NEAR
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 text-on-surface-variant">
                  <div className="flex items-center gap-space-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-outline" />
                    <span className="font-body-sm text-on-surface-variant">
                      Estimated Protocol Gas (30 Tgas)
                    </span>
                  </div>
                  <span className="font-label-mono-sm text-on-surface-variant">
                    ~0.00048 NEAR
                  </span>
                </div>

                <div className="w-full h-px bg-surface-container-highest my-1" />

                <div className="flex items-center justify-between pt-1">
                  <div className="flex flex-col">
                    <span className="font-label-mono-xs uppercase text-primary tracking-wider font-semibold">
                      Total Treasury Allocation
                    </span>
                    <span className="font-label-mono-xs text-outline">
                      Managed by Agent Treasury Engine
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-headline-lg text-primary font-bold">
                      0.0800
                    </span>
                    <span className="font-label-mono-sm text-primary font-semibold">
                      NEAR
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Escrow Guarantee Callout */}
            <div className="bg-surface-container p-space-md rounded-xl flex items-start gap-space-sm border border-surface-container-high/30">
              <span className="material-symbols-outlined text-tertiary text-[20px] shrink-0 mt-0.5">
                verified_user
              </span>
              <div className="flex flex-col gap-1">
                <span className="font-label-mono-xs uppercase text-tertiary font-semibold">
                  Agent Treasury Guarantee
                </span>
                <p className="font-body-sm text-on-surface-variant leading-relaxed text-[13px]">
                  Funds are secured in the Agent Treasury Engine on NEAR. Payouts
                  release strictly upon cryptographic verification of DAG
                  milestone deliverables. Fully refundable if workers fail SLA.
                </p>
              </div>
            </div>

            {/* Wallet Balance */}
            <div className="bg-surface-container-lowest p-space-sm rounded-lg flex items-center justify-between border border-surface-container-high/30">
              <div className="flex items-center gap-space-xs">
                <span className="w-2 h-2 rounded-full bg-tertiary" />
                <span className="font-label-mono-xs text-on-surface-variant">
                  Your Balance:{" "}
                  <strong className="text-on-surface">48.50 NEAR</strong>
                </span>
              </div>
              <span className="font-label-mono-xs text-tertiary font-semibold">
                Sufficient Funds
              </span>
            </div>
          </div>

          <div className="p-space-sm flex items-center justify-between text-outline font-label-mono-xs">
            <span>Worker Node Staking: Verified 10.0 N</span>
            <span>Zero Knowledge Attestation: Ready</span>
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="w-full bg-surface-container-low rounded-xl p-space-md shadow-xl flex flex-col sm:flex-row items-center justify-between gap-space-md mt-space-sm border border-surface-container-high/40">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-space-xs text-on-surface-variant hover:text-on-surface font-body-md transition-colors px-space-md py-2 rounded-full hover:bg-surface-container cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">
            arrow_back
          </span>
          <span>Back to Step 1: Edit Directive</span>
        </button>

        <div className="flex items-center gap-space-md w-full sm:w-auto">
          <div className="hidden md:flex flex-col text-right">
            <span className="font-label-mono-xs text-on-surface-variant">
              Instant Transaction Signature
            </span>
            <span className="font-label-mono-xs text-primary">
              Pre-approved manager.testnet
            </span>
          </div>
          <button
            type="button"
            onClick={handleLockClick}
            disabled={isLocking}
            className="w-full sm:w-auto flex items-center justify-center gap-space-sm px-space-xl py-3 rounded-full bg-linear-to-r from-primary-container via-primary to-secondary text-on-primary font-headline-sm text-title-md font-semibold tracking-tight shadow-[0_0_24px_rgba(6,182,212,0.4)] hover:shadow-[0_0_32px_rgba(6,182,212,0.65)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-80"
          >
            <span className="material-symbols-outlined text-[20px] text-on-primary">
              {isLocking ? "refresh" : "bolt"}
            </span>
            <span>
              {isLocking
                ? "Locking Escrow on NEAR..."
                : "Lock 0.08 NEAR Escrow & Hire Swarm"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
