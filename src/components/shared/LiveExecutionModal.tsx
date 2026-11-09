"use client";

import React, { useEffect, useRef, useState } from "react";
import { TaskItem } from "../../types/types";

interface LogLine {
  timestamp: string;
  agent: string;
  level: "info" | "success" | "warn" | "step";
  message: string;
}

interface LiveExecutionModalProps {
  task: TaskItem | null;
  isOpen: boolean;
  onClose: () => void;
}

function generateLogs(task: TaskItem): LogLine[] {
  const id = task.id;
  if (id === "#BNT-892") {
    return [
      { timestamp: "14:22:01.012", agent: "Orchestrator", level: "step", message: "DAG initialized. 2 parallel sub-tasks dispatched." },
      { timestamp: "14:22:01.340", agent: "@scout-worker", level: "info", message: "Connecting to NEAR RPC endpoint rpc.testnet.near.org..." },
      { timestamp: "14:22:01.891", agent: "@scout-worker", level: "success", message: "Connected. Block height: 148,291,020." },
      { timestamp: "14:22:02.104", agent: "@scout-worker", level: "info", message: "Querying X/Twitter API for #AIagents sentiment (last 24h)..." },
      { timestamp: "14:22:03.667", agent: "@scout-worker", level: "info", message: "Fetched 1,204 posts. Running classifier pipeline..." },
      { timestamp: "14:22:04.221", agent: "@copy-agent", level: "info", message: "Received scrape stream. Beginning synthesis & clustering." },
      { timestamp: "14:22:05.098", agent: "@scout-worker", level: "success", message: "Sentiment scoring complete. Avg velocity: +0.42 (bullish)." },
      { timestamp: "14:22:05.780", agent: "@copy-agent", level: "step", message: "Step 2 complete. Beginning Step 3: Alpha Digest generation..." },
      { timestamp: "14:22:06.312", agent: "@copy-agent", level: "info", message: "Calling Gemini Flash: generating executive summary..." },
      { timestamp: "14:22:08.001", agent: "@copy-agent", level: "warn", message: "Rate limit hit on signal source #3. Retrying in 800ms..." },
      { timestamp: "14:22:08.823", agent: "@copy-agent", level: "info", message: "Retry success. Resuming synthesis." },
      { timestamp: "14:22:11.445", agent: "Orchestrator", level: "step", message: "Step 3/3 in progress. Awaiting final digest artifact..." },
    ];
  }
  if (id === "#BNT-891") {
    return [
      { timestamp: "13:50:01.000", agent: "Orchestrator", level: "step", message: "DAG initialized. DeFi arbitrage sub-tasks active." },
      { timestamp: "13:50:01.450", agent: "@defi-arb-node", level: "info", message: "Fetching Ref Finance pool states (NEAR/USDT, NEAR/USDC)..." },
      { timestamp: "13:50:02.110", agent: "@defi-arb-node", level: "success", message: "Pool data retrieved. NEAR/USDT spread: 0.42bps detected." },
      { timestamp: "13:50:02.890", agent: "@defi-arb-node", level: "info", message: "Cross-checking Burrow lending rates for supply APY delta..." },
      { timestamp: "13:50:03.541", agent: "@defi-arb-node", level: "step", message: "Arbitrage signal confirmed: net yield 1.8% per cycle." },
      { timestamp: "13:50:04.880", agent: "@defi-arb-node", level: "info", message: "Generating verified JSON payload with consensus receipt..." },
      { timestamp: "13:50:06.001", agent: "Orchestrator", level: "step", message: "Step 2/3: Payload encoding and SHA-256 hash preparation." },
    ];
  }
  return [
    { timestamp: "00:00:00.001", agent: "Orchestrator", level: "step", message: `DAG initialized for ${id}.` },
    { timestamp: "00:00:01.200", agent: "Worker Node", level: "info", message: "Connecting to NEAR testnet..." },
    { timestamp: "00:00:02.100", agent: "Worker Node", level: "step", message: "Execution in progress. Awaiting deliverable..." },
  ];
}

const levelStyles: Record<LogLine["level"], string> = {
  info: "text-on-surface-variant",
  success: "text-tertiary",
  warn: "text-error",
  step: "text-primary font-semibold",
};

const levelPrefixes: Record<LogLine["level"], string> = {
  info: "   ",
  success: "✔  ",
  warn: "⚠  ",
  step: "→  ",
};

function LiveExecutionModalInner({
  task,
  onClose,
}: {
  task: TaskItem;
  onClose: () => void;
}) {
  const [visibleCount, setVisibleCount] = useState(0);
  const logEndRef = useRef<HTMLDivElement>(null);

  const logs = generateLogs(task);

  // Stream logs one-by-one on open
  useEffect(() => {
    let count = 0;
    const interval = setInterval(() => {
      count += 1;
      setVisibleCount(count);
      if (count >= logs.length) clearInterval(interval);
    }, 320);
    return () => clearInterval(interval);
  }, [logs.length]);

  // Auto-scroll to bottom as logs stream in
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleCount]);

  const progress = task.progress;
  const agents = task.agents ?? [];
  const isStreaming = visibleCount < logs.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-3xl mx-4 mb-0 sm:mb-0 rounded-t-2xl sm:rounded-2xl bg-surface-container-lowest border border-surface-container-high/60 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">

        {/* Header */}
        <div className="flex items-start justify-between p-space-md border-b border-surface-container-high/40 bg-surface-container/80 shrink-0">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Live pulse indicator */}
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="font-label-mono-xs text-primary uppercase tracking-wider font-semibold">
                LIVE · Agent Swarm Execution
              </span>
              <span className="font-label-mono-xs text-outline">•</span>
              <span className="font-label-mono-sm text-on-surface font-medium">{task.id}</span>
            </div>
            <h2 className="font-title-md text-on-surface font-semibold line-clamp-1">
              {task.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors shrink-0 ml-2"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Progress + agents bar */}
        <div className="shrink-0 px-space-md py-3 bg-surface-container/60 border-b border-surface-container-high/30 flex flex-col gap-2">
          {progress && (
            <div className="flex items-center gap-3">
              <span className="font-label-mono-xs text-primary flex items-center gap-1 shrink-0">
                <span className="material-symbols-outlined text-[14px] animate-spin">
                  rotate_right
                </span>
                {progress.currentStepText}
              </span>
              <div className="flex-1 h-1.5 bg-surface-container-lowest rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)] transition-all duration-700"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <span className="font-label-mono-xs text-primary font-bold shrink-0">
                {progress.percentage}%
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-label-mono-xs text-on-surface-variant">Active Workers:</span>
            {agents.map((a, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-low font-label-mono-xs text-on-surface border border-surface-container-high/40">
                <span className="material-symbols-outlined text-[11px] text-primary">{a.icon}</span>
                {a.handle ?? a.name}
              </span>
            ))}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-low font-label-mono-xs text-outline border border-surface-container-high/40">
              <span className="material-symbols-outlined text-[11px] text-tertiary">lock</span>
              {task.escrow.amount} {task.escrow.unit} · {task.escrow.reference}
            </span>
          </div>
        </div>

        {/* Log stream */}
        <div className="flex-1 overflow-y-auto bg-surface-container-lowest p-space-md font-jetbrains text-[12px] flex flex-col gap-0.5">
          {logs.slice(0, visibleCount).map((line, i) => (
            <div key={i} className="flex items-start gap-2 leading-relaxed">
              <span className="text-outline shrink-0 select-none">[{line.timestamp}]</span>
              <span className="shrink-0 font-semibold" style={{ color: "var(--color-secondary)", minWidth: "9rem" }}>
                {line.agent}
              </span>
              <span className={levelStyles[line.level]}>
                {levelPrefixes[line.level]}{line.message}
              </span>
            </div>
          ))}

          {/* Blinking cursor while streaming */}
          {isStreaming && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-outline select-none">[{logs[visibleCount]?.timestamp ?? "..."}]</span>
              <span className="text-primary animate-pulse">█</span>
            </div>
          )}
          <div ref={logEndRef} />
        </div>

        {/* Footer */}
        <div className="shrink-0 p-space-md border-t border-surface-container-high/40 bg-surface-container-low flex items-center justify-between gap-space-sm flex-wrap">
          <div className="flex items-center gap-2 font-label-mono-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-tertiary">verified</span>
            <span>NEAR Testnet · <span className="text-primary">rpc.testnet.near.org</span></span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://testnet.nearblocks.io"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface-variant hover:text-on-surface font-body-sm transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">open_in_new</span>
              <span>Explorer</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-body-sm font-medium transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LiveExecutionModal({
  task,
  isOpen,
  onClose,
}: LiveExecutionModalProps) {
  if (!isOpen || !task) return null;
  return <LiveExecutionModalInner key={task.id} task={task} onClose={onClose} />;
}
