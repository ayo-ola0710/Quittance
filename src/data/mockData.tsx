import React from "react";
import { MetricItem, TaskItem } from "../types/types";

export const initialMetrics: MetricItem[] = [
  {
    title: "Total Bounties Created",
    value: "34",
    unit: "Tasks Total",
    breakdown: (
      <span>
        28 Completed <span className="text-outline">•</span>{" "}
        <span className="text-primary font-medium">2 Active</span>{" "}
        <span className="text-outline">•</span> 4 Drafted
      </span>
    ),
    icon: "layers",
    accent: "primary",
  },
  {
    title: "Total Escrow Committed",
    value: "2.840",
    unit: "NEAR",
    breakdown: (
      <span>
        ≈ $14.77 USD <span className="text-outline">•</span> 100% Non-custodial
      </span>
    ),
    icon: "lock",
    accent: "tertiary",
  },
  {
    title: "Active Executions",
    value: "2",
    unit: "DAGs Running",
    breakdown: "Sub-second swarm decomposition in progress",
    icon: "alt_route",
    accent: "primary",
    isLive: true,
  },
  {
    title: "Avg Delivery Speed",
    value: "2.4s",
    unit: "Median SLA",
    breakdown: (
      <span className="text-tertiary flex items-center gap-1">
        <span className="material-symbols-outlined text-[12px]">verified</span>
        <span>99.2% Verification success rate</span>
      </span>
    ),
    icon: "speed",
    accent: "secondary",
  },
];

export const initialTasks: TaskItem[] = [
  {
    id: "#BNT-892",
    title: "Real-Time Competitor Alpha Digest & Social Sentiment Ingestion",
    category: "Market Intelligence",
    status: "active",
    statusLabel: "Active Swarm DAG",
    timeAgo: "Dispatched 45s ago",
    agents: [
      {
        name: "ScrapeScout v3.0",
        handle: "@scout-worker",
        icon: "travel_explore",
        color: "primary",
      },
      {
        name: "CopyAgent v2.1",
        handle: "@copy-agent",
        icon: "neurology",
        color: "secondary",
      },
    ],
    progress: {
      currentStepText: "Executing Step 2/3: Parallel Web Scraping & Synthesis",
      percentage: 65,
    },
    escrow: {
      amount: "0.080",
      unit: "NEAR",
      reference: "Agent Treasury Engine #TR-9912",
    },
    actionLabel: "View Live Execution",
    actionHref: "#",
  },
  {
    id: "#BNT-891",
    title: "Ref Finance & Burrow Yield Spread Scanner & Arbitrage DAG",
    category: "DeFi Arbitrage",
    status: "active",
    statusLabel: "Active Swarm DAG",
    timeAgo: "Dispatched 2m ago",
    agents: [
      {
        name: "BurrowArbNode v1.4",
        handle: "@defi-arb-node",
        icon: "currency_exchange",
        color: "primary",
      },
    ],
    progress: {
      currentStepText: "Executing Step 2/3: Payload encoding & SHA-256 preparation",
      percentage: 45,
    },
    escrow: {
      amount: "0.250",
      unit: "NEAR",
      reference: "Agent Treasury Engine #TR-9911",
    },
    actionLabel: "View Live Execution",
    actionHref: "#",
  },
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
      reference: "Tx: 8Fk9...9aP1",
    },
    actionLabel: "Inspect Deliverables",
    secondaryActionType: "explorer",
    explorerHref: "#",
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
      reference: "Tx: 3Aq1...4rZ9",
    },
    actionLabel: "View Audit Report",
    secondaryActionType: "explorer",
    explorerHref: "#",
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
        name: "Ref Finance & Burrow Pool Feed (Websocket active)",
        color: "primary",
      },
    ],
    escrow: {
      amount: "0.030",
      unit: "NEAR",
      reference: "Tx: 5Wk2...1xK8",
    },
    actionLabel: "Download JSON Payload",
  },
  {
    id: "#BNT-DRAFT-04",
    title: "Cyberpunk NFT Avatar Generation Batch & Prompt Optimization",
    category: "Creative Visuals",
    status: "draft",
    statusLabel: "Draft Saved",
    timeAgo: "Updated 5 days ago",
    decompositionStatus: "Unmatched (Awaiting final prompt parameters)",
    escrow: {
      amount: "~0.150",
      unit: "NEAR",
      isEstimated: true,
      reference: "Uncommitted",
    },
    actionLabel: "Continue Configuration",
    actionHref: "#",
  },
];
