import React from "react";
import { MetricItem, TaskItem } from "../types/types";

export const initialMetrics: MetricItem[] = [
  {
    title: "Completed Tasks",
    value: "3",
    unit: "Tasks",
    breakdown: "All executed tasks verified",
    icon: "layers",
    accent: "primary",
  },
  {
    title: "Total Settled",
    value: "0.230",
    unit: "NEAR",
    breakdown: "Direct NEAR Testnet transfers",
    icon: "payments",
    accent: "tertiary",
  },
  {
    title: "Treasury Wallet",
    value: "...",
    unit: "Available",
    breakdown: "NEAR Testnet account",
    icon: "account_balance_wallet",
    accent: "primary",
    isLive: true,
  },
  {
    title: "Verifier Gate",
    value: "4-Rule",
    unit: "Check",
    breakdown: (
      <span className="text-tertiary flex items-center gap-1">
        <span className="material-symbols-outlined text-[12px]">verified</span>
        <span>Min score 75% required for payout</span>
      </span>
    ),
    icon: "verified_user",
    accent: "secondary",
  },
];

export const initialTasks: TaskItem[] = [
  {
    id: "#BNT-842",
    title: "Social Media Launch Campaign & Banner Specs for Web3 Coffee",
    category: "Social Campaign",
    status: "completed",
    statusLabel: "Delivered & Verified",
    timeAgo: "Completed 2 hours ago",
    turnaround: "Turnaround: 2.3s",
    agents: [
      {
        name: "CopyAgent v2.1",
        icon: "edit_note",
        color: "secondary",
      },
      {
        name: "PromptArtisan",
        handle: "@design-agent",
        icon: "draw",
        color: "primary",
      },
    ],
    deliverables: [
      {
        icon: "description",
        name: "Twitter_Launch_Thread.md (8 Tweets)",
        color: "tertiary",
      },
      {
        icon: "image",
        name: "Flux_4K_Coffee_Hero.png (Render Ready)",
        color: "tertiary",
      },
    ],
    escrow: {
      amount: "0.100",
      unit: "NEAR",
      reference: "Sample Showcase Task",
    },
    actionLabel: "Inspect Deliverables",
    secondaryActionType: "none",
  },
  {
    id: "#BNT-839",
    title: "Automated Formal Verification of Escrow Locking Logic",
    category: "Security Audit",
    status: "completed",
    statusLabel: "Delivered & Verified",
    timeAgo: "Completed Yesterday",
    turnaround: "Turnaround: 1.8s",
    agents: [
      {
        name: "ContractVerifier v1.0",
        handle: "@verify-node",
        icon: "policy",
        color: "tertiary",
      },
    ],
    deliverables: [
      {
        icon: "shield",
        name: "0 Critical Vulnerabilities Found",
        color: "tertiary",
      },
      {
        icon: "code",
        name: "100% Rust WASM Branch Coverage",
        color: "primary",
      },
    ],
    escrow: {
      amount: "0.100",
      unit: "NEAR",
      reference: "Sample Showcase Task",
    },
    actionLabel: "View Audit Report",
    secondaryActionType: "none",
  },
  {
    id: "#BNT-824",
    title: "NEAR DeFi Liquidity Pool Yield Arbitrage Alert Stream",
    category: "Data Pipeline",
    status: "completed",
    statusLabel: "Delivered & Verified",
    timeAgo: "Completed 3 days ago",
    agents: [
      {
        name: "ScrapeScout v3.0",
        handle: "@scout-worker",
        icon: "travel_explore",
        color: "primary",
      },
    ],
    deliverables: [
      {
        icon: "dataset",
        name: "Ref Finance & Burrow Pool Feed",
        color: "primary",
      },
    ],
    escrow: {
      amount: "0.030",
      unit: "NEAR",
      reference: "Sample Showcase Task",
    },
    actionLabel: "Download JSON Payload",
    secondaryActionType: "none",
  },
];
