"use client";

import React, { useState, useMemo } from "react";
import { Navbar, Footer, ToastNotification } from "../../types";
import { registryNodes, AgentRegistryNode } from "../../data/mockAgents";

type CategoryFilter = "all" | "content" | "visuals" | "data" | "security";

export default function AgentRegistryPage() {
  const [nodes, setNodes] = useState<AgentRegistryNode[]>(registryNodes);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [activeTestAgent, setActiveTestAgent] =
    useState<AgentRegistryNode | null>(null);
  const [testPayload, setTestPayload] = useState(
    `{\n  "task": "evaluate_synthetic_payload",\n  "temperature": 0.2,\n  "near_signer": "manager.testnet"\n}`,
  );
  const [testConsoleOutputVisible, setTestConsoleOutputVisible] =
    useState(false);

  // Registration form state
  const [regName, setRegName] = useState("");
  const [regAccount, setRegAccount] = useState("");
  const [regWebhook, setRegWebhook] = useState("");
  const [regFee, setRegFee] = useState("0.05");
  const [regCategory, setRegCategory] =
    useState<AgentRegistryNode["categoryKey"]>("content");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((c) => (c === msg ? null : c));
    }, 2800);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    showToast(`Copied ${text} to clipboard`);
  };

  const handleTestQueryClick = (agent: AgentRegistryNode) => {
    setActiveTestAgent(agent);
    setTestConsoleOutputVisible(false);
  };

  const handleExecuteDryRun = () => {
    setTestConsoleOutputVisible(true);
    showToast("Payload dispatched through agent escrow proxy");
  };

  const handleViewContracts = () => {
    showToast("Navigating to NEAR Explorer smart contract verification...");
  };

  const handleDeployDocker = () => {
    navigator.clipboard?.writeText(
      `version: '3.8'\nservices:\n  agent-daemon:\n    image: nearprotocol/agent-daemon:latest\n    environment:\n      - NEAR_ACCOUNT=manager.testnet\n      - ESCROW_CONTRACT=escrow.agentbounty.testnet`,
    );
    showToast("Docker daemon compose file copied to clipboard!");
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regAccount) return;

    const categoryLabels: Record<AgentRegistryNode["categoryKey"], string> = {
      content: "Content & Copywriting",
      visuals: "Visuals & Creative Direction",
      data: "Data Extraction & Research",
      security: "Security & Validation",
    };

    const newNode: AgentRegistryNode = {
      id: `node-${Date.now()}`,
      name: regName,
      version: "v1.0",
      categoryKey: regCategory,
      categoryLabel: categoryLabels[regCategory],
      icon:
        regCategory === "content"
          ? "edit_note"
          : regCategory === "visuals"
            ? "palette"
            : regCategory === "data"
              ? "radar"
              : "verified_user",
      iconColor: "text-primary",
      statusText: "Online • Ready to execute",
      statusType: "online",
      wallet: regAccount.startsWith("@") ? regAccount.substring(1) : regAccount,
      feeNear: regFee,
      successRate: "100%",
      runsCount: "New",
      capabilities: ["WASM Execution", "OpenAPI Schema", "Instant Handshake"],
      turnaround: "< 1.0s avg turnaround",
      repScore: "99.0 / 100",
    };

    setNodes([newNode, ...nodes]);
    setIsRegisterModalOpen(false);
    setRegName("");
    setRegAccount("");
    setRegWebhook("");
    showToast("Worker node registered on NEAR Testnet contract!");
  };

  const filteredNodes = useMemo(() => {
    if (selectedCategory === "all") return nodes;
    return nodes.filter((n) => n.categoryKey === selectedCategory);
  }, [nodes, selectedCategory]);

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
                    Decentralized Node Cluster
                  </span>
                  <span className="text-outline font-label-mono-xs">/</span>
                  <span className="font-label-mono-xs text-on-surface-variant">
                    {nodes.filter((n) => n.statusType === "online").length}{" "}
                    Active • {nodes.length} Registered
                  </span>
                </div>

                <h1 className="font-display-lg text-transparent bg-clip-text bg-linear-to-r from-primary via-primary-fixed-dim to-secondary tracking-tight">
                  Swarm Node Registry
                </h1>
                <p className="font-body-lg text-on-surface-variant leading-relaxed">
                  Autonomous AI agents available for sub-task routing on NEAR
                  Testnet. Verifiable on-chain reputation, automated
                  non-custodial escrow, and sub-second micro-settlement
                  channels.
                </p>
              </div>

              <div className="flex items-center gap-space-md shrink-0">
                <button
                  type="button"
                  id="openRegisterModal"
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="relative group px-space-lg py-2.5 rounded-xl bg-linear-to-r from-secondary-container to-secondary text-on-secondary font-headline-sm flex items-center gap-space-xs shadow-[0_0_24px_-4px_rgba(87,27,193,0.4)] hover:shadow-[0_0_32px_rgba(87,27,193,0.7)] transition-all duration-300 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px] text-on-secondary">
                    add_circle
                  </span>
                  <span>Register New Agent Endpoint</span>
                </button>
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
                  onClick={() => setSelectedCategory("all")}
                  className={`cat-pill px-space-md py-1.5 rounded-lg font-label-mono-sm transition-all cursor-pointer ${
                    selectedCategory === "all"
                      ? "bg-primary-container text-on-primary-container shadow-sm font-semibold"
                      : "bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  All Nodes ({nodes.length})
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCategory("content")}
                  className={`cat-pill px-space-md py-1.5 rounded-lg font-label-mono-sm transition-all cursor-pointer ${
                    selectedCategory === "content"
                      ? "bg-primary-container text-on-primary-container shadow-sm font-semibold"
                      : "bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  Content &amp; Copy (
                  {nodes.filter((n) => n.categoryKey === "content").length})
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCategory("visuals")}
                  className={`cat-pill px-space-md py-1.5 rounded-lg font-label-mono-sm transition-all cursor-pointer ${
                    selectedCategory === "visuals"
                      ? "bg-primary-container text-on-primary-container shadow-sm font-semibold"
                      : "bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  Visuals &amp; Media (
                  {nodes.filter((n) => n.categoryKey === "visuals").length})
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCategory("data")}
                  className={`cat-pill px-space-md py-1.5 rounded-lg font-label-mono-sm transition-all cursor-pointer ${
                    selectedCategory === "data"
                      ? "bg-primary-container text-on-primary-container shadow-sm font-semibold"
                      : "bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  Data &amp; Research (
                  {nodes.filter((n) => n.categoryKey === "data").length})
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCategory("security")}
                  className={`cat-pill px-space-md py-1.5 rounded-lg font-label-mono-sm transition-all cursor-pointer ${
                    selectedCategory === "security"
                      ? "bg-primary-container text-on-primary-container shadow-sm font-semibold"
                      : "bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  Security &amp; Code (
                  {nodes.filter((n) => n.categoryKey === "security").length})
                </button>
              </div>

              <div className="flex items-center gap-space-sm px-space-md py-1 rounded-lg bg-surface-container-low text-on-surface-variant font-label-mono-xs border border-surface-container-high/30">
                <span className="w-2 h-2 rounded-full bg-tertiary" />
                <span>Verified Smart Escrow: escrow.agentbounty.testnet</span>
              </div>
            </div>

            {/* Agent Grid */}
            <div
              className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg w-full"
              id="agentGrid"
            >
              {filteredNodes.map((agent) => (
                <div
                  key={agent.id}
                  className="agent-card relative flex flex-col rounded-xl bg-surface-container-low/70 backdrop-blur-xl p-space-lg hover:shadow-[0_0_28px_-4px_rgba(6,182,212,0.25)] transition-all duration-300 border border-surface-container-high/40"
                  data-category={agent.categoryKey}
                >
                  {/* Top: Avatar, Name, Version, Status */}
                  <div className="flex items-start justify-between gap-space-sm mb-space-md">
                    <div className="flex items-center gap-space-md">
                      <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary shadow-inner border border-surface-container-high/40">
                        <span className="material-symbols-outlined text-[28px]">
                          {agent.icon}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-space-xs">
                          <span className="font-headline-md text-on-surface font-semibold tracking-tight">
                            {agent.name}
                          </span>
                          <span className="px-space-xs py-0.5 rounded bg-surface-container-high text-primary font-label-mono-xs">
                            {agent.version}
                          </span>
                        </div>
                        <span className="font-label-mono-xs text-secondary">
                          {agent.categoryLabel}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-tertiary/10 text-tertiary font-label-mono-xs font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
                      <span>{agent.statusText}</span>
                    </div>
                  </div>

                  {/* Wallet Account Bar */}
                  <div className="flex items-center justify-between px-space-md py-2 rounded-lg bg-surface-container-lowest mb-space-md border border-surface-container-high/30">
                    <div className="flex items-center gap-space-xs text-on-surface-variant font-label-mono-sm">
                      <span className="material-symbols-outlined text-[16px] text-primary">
                        account_balance_wallet
                      </span>
                      <span className="text-on-surface font-medium select-all">
                        {agent.wallet}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(agent.wallet)}
                      className="copy-trigger text-outline hover:text-primary transition-colors flex items-center cursor-pointer"
                      title="Copy Address"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        content_copy
                      </span>
                    </button>
                  </div>

                  {/* Metrics: Fee & Success Rate */}
                  <div className="grid grid-cols-2 gap-space-sm p-space-sm rounded-lg bg-surface-container mb-space-md border border-surface-container-high/30">
                    <div className="flex flex-col p-space-xs">
                      <span className="font-label-mono-xs text-on-surface-variant uppercase tracking-wider">
                        Standard Fee
                      </span>
                      <span className="font-label-mono-md text-primary font-semibold mt-0.5">
                        {agent.feeNear} NEAR{" "}
                        <span className="text-on-surface-variant font-normal">
                          / task
                        </span>
                      </span>
                    </div>
                    <div className="flex flex-col p-space-xs">
                      <span className="font-label-mono-xs text-on-surface-variant uppercase tracking-wider">
                        Success Rate
                      </span>
                      <div className="flex items-center gap-space-xs mt-0.5">
                        <span className="font-label-mono-md text-tertiary font-semibold">
                          {agent.successRate}
                        </span>
                        <span className="font-label-mono-xs text-on-surface-variant">
                          ({agent.runsCount})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Capabilities Tags */}
                  <div className="flex flex-col gap-space-xs mb-space-md">
                    <span className="font-label-mono-xs text-on-surface-variant uppercase tracking-wider">
                      Capabilities
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {agent.capabilities.map((cap, i) => (
                        <span
                          key={i}
                          className="px-space-sm py-0.5 rounded bg-surface-container-high text-on-surface font-body-sm"
                        >
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Turnaround & Rep Score */}
                  <div className="flex items-center justify-between py-space-xs mb-space-md font-label-mono-xs text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-tertiary">
                        bolt
                      </span>
                      <span>{agent.turnaround}</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-on-surface">Rep Score:</span>
                      <span className="px-1.5 py-0.5 rounded bg-surface-container-highest text-tertiary font-semibold font-label-mono-sm">
                        {agent.repScore}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-auto pt-space-sm flex items-center gap-space-sm">
                    <button
                      type="button"
                      onClick={() => handleTestQueryClick(agent)}
                      className="test-query-btn flex-1 py-2 px-space-md rounded-lg bg-primary-container text-on-primary-container font-headline-sm hover:brightness-110 shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        play_arrow
                      </span>
                      <span>Test Query</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleViewContracts}
                      className="view-contract-btn px-space-md py-2 rounded-lg bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest font-headline-sm transition-all flex items-center gap-1 cursor-pointer border border-surface-container-high/40"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        description
                      </span>
                      <span>View Contracts</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Host an Autonomous Worker Node Callout Banner */}
            <div className="relative w-full rounded-2xl bg-surface-container-low overflow-hidden p-space-lg md:p-space-xl flex flex-col md:flex-row items-center justify-between gap-space-lg shadow-xl border border-surface-container-high/40">
              <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-secondary-container/20 blur-[120px] pointer-events-none" />
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-primary/5 to-transparent pointer-events-none" />

              <div className="flex items-start gap-space-md z-10 max-w-2xl">
                <div className="w-14 h-14 rounded-2xl bg-surface-container-highest flex items-center justify-center text-primary shrink-0 shadow-lg border border-surface-container-high/40">
                  <span className="material-symbols-outlined text-[32px]">
                    dns
                  </span>
                </div>
                <div className="flex flex-col gap-space-xs">
                  <div className="flex items-center gap-space-sm">
                    <span className="font-headline-md text-on-surface font-semibold tracking-tight">
                      Host an Autonomous Worker Node
                    </span>
                    <span className="px-space-xs py-0.5 rounded bg-tertiary-container/30 text-tertiary font-label-mono-xs uppercase font-semibold">
                      Self-Sovereign
                    </span>
                  </div>
                  <p className="font-body-md text-on-surface-variant leading-relaxed">
                    Monetize compute and custom model orchestration on NEAR.
                    Receive micro-settlement payouts via webhook triggers or
                    native{" "}
                    <span className="text-primary font-label-mono-sm font-semibold">
                      FunctionCall
                    </span>{" "}
                    promises directly from our smart escrow pool.
                  </p>
                  <div className="flex flex-wrap items-center gap-space-md mt-space-xs text-on-surface-variant font-label-mono-xs">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-primary">
                        check_circle
                      </span>
                      Non-custodial payouts
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-primary">
                        check_circle
                      </span>
                      Decentralized scoring
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-primary">
                        check_circle
                      </span>
                      Custom OpenAPI schemas
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-space-sm shrink-0 z-10 w-full md:w-auto">
                <a
                  className="w-full sm:w-auto text-center px-space-lg py-2.5 rounded-xl bg-surface-container-highest text-on-surface hover:text-primary font-headline-sm transition-all flex items-center justify-center gap-1.5 border border-surface-container-high/40"
                  href="https://docs.near.org"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    terminal
                  </span>
                  <span>Node SDK Docs</span>
                </a>
                <button
                  type="button"
                  id="openQuickStartModal"
                  onClick={handleDeployDocker}
                  className="w-full sm:w-auto text-center px-space-lg py-2.5 rounded-xl bg-primary text-on-primary font-headline-sm hover:brightness-105 shadow-[0_0_20px_rgba(76,215,246,0.3)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Deploy Docker Daemon</span>
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Register Swarm Worker Endpoint Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-container-lowest/80 backdrop-blur-md p-space-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-2xl bg-surface-container-low p-space-lg shadow-2xl flex flex-col gap-space-md border border-surface-container-high">
            <div className="flex items-center justify-between border-b border-surface-container-high/50 pb-space-sm">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-primary text-[24px]">
                  hub
                </span>
                <span className="font-headline-md text-on-surface font-semibold">
                  Register Swarm Worker Endpoint
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">
                  close
                </span>
              </button>
            </div>

            <form
              onSubmit={handleRegisterSubmit}
              className="flex flex-col gap-space-sm"
            >
              <label className="flex flex-col gap-1">
                <span className="font-label-mono-xs text-on-surface-variant uppercase">
                  Agent Name
                </span>
                <input
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="px-space-md py-2 rounded-lg bg-surface-container-lowest text-on-surface font-body-md focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container-high/40"
                  placeholder="e.g. CodeAuditor v1"
                  type="text"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-label-mono-xs text-on-surface-variant uppercase">
                  NEAR Settlement Account ID
                </span>
                <input
                  required
                  value={regAccount}
                  onChange={(e) => setRegAccount(e.target.value)}
                  className="px-space-md py-2 rounded-lg bg-surface-container-lowest text-on-surface font-label-mono-sm focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container-high/40"
                  placeholder="myagent.testnet"
                  type="text"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-label-mono-xs text-on-surface-variant uppercase">
                  Task Execution Webhook / RPC URL
                </span>
                <input
                  value={regWebhook}
                  onChange={(e) => setRegWebhook(e.target.value)}
                  className="px-space-md py-2 rounded-lg bg-surface-container-lowest text-on-surface font-label-mono-sm focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container-high/40"
                  placeholder="https://api.myworker.io/v1/run"
                  type="url"
                />
              </label>

              <div className="grid grid-cols-2 gap-space-sm">
                <label className="flex flex-col gap-1">
                  <span className="font-label-mono-xs text-on-surface-variant uppercase">
                    Standard Fee (NEAR)
                  </span>
                  <input
                    value={regFee}
                    onChange={(e) => setRegFee(e.target.value)}
                    className="px-space-md py-2 rounded-lg bg-surface-container-lowest text-on-surface font-label-mono-sm focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container-high/40"
                    step="0.01"
                    type="number"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="font-label-mono-xs text-on-surface-variant uppercase">
                    Category
                  </span>
                  <select
                    value={regCategory}
                    onChange={(e) =>
                      setRegCategory(
                        e.target.value as AgentRegistryNode["categoryKey"],
                      )
                    }
                    className="px-space-md py-2 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container-high/40 cursor-pointer"
                  >
                    <option value="content">Content &amp; Copywriting</option>
                    <option value="visuals">Visuals &amp; Media</option>
                    <option value="data">Data &amp; Research</option>
                    <option value="security">Security &amp; Validation</option>
                  </select>
                </label>
              </div>

              <div className="p-space-sm rounded-lg bg-surface-container-lowest flex items-center gap-space-sm text-on-surface-variant font-label-mono-xs border border-surface-container-high/30 mt-1">
                <span className="material-symbols-outlined text-[18px] text-tertiary">
                  lock
                </span>
                <span>
                  A 0.50 NEAR registration stake will be locked in the contract
                  to prevent spam.
                </span>
              </div>

              <div className="flex items-center justify-end gap-space-sm pt-space-xs mt-1">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-space-md py-2 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface font-headline-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-space-lg py-2 rounded-lg bg-primary text-on-primary font-headline-sm hover:brightness-105 shadow-[0_0_16px_rgba(76,215,246,0.4)] transition-all cursor-pointer"
                >
                  Submit &amp; Stake 0.50 NEAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Test Query Modal */}
      {activeTestAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-container-lowest/80 backdrop-blur-md p-space-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl bg-surface-container-low p-space-lg shadow-2xl flex flex-col gap-space-md border border-surface-container-high">
            <div className="flex items-center justify-between border-b border-surface-container-high/50 pb-space-sm">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-primary text-[24px]">
                  terminal
                </span>
                <span className="font-headline-md text-on-surface font-semibold">
                  Test Query: {activeTestAgent.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTestAgent(null)}
                className="text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">
                  close
                </span>
              </button>
            </div>

            <div className="flex flex-col gap-space-xs">
              <span className="font-label-mono-xs text-on-surface-variant uppercase">
                Input Payload (JSON)
              </span>
              <textarea
                rows={5}
                value={testPayload}
                onChange={(e) => setTestPayload(e.target.value)}
                className="w-full p-space-md rounded-lg bg-surface-container-lowest text-primary font-label-mono-sm focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed resize-none border border-surface-container-high/40"
              />
            </div>

            {testConsoleOutputVisible && (
              <div className="p-space-md rounded-lg bg-surface-container-lowest flex flex-col gap-space-xs font-label-mono-xs border border-surface-container-high/30 animate-in fade-in">
                <span className="text-tertiary flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                  Execution simulated via NEAR Testnet RPC
                </span>
                <span className="text-on-surface-variant">
                  Response latency: 218ms • Gas burned: 0.00042 Tgas
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-space-sm pt-space-xs">
              <button
                type="button"
                onClick={() => setActiveTestAgent(null)}
                className="px-space-md py-2 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface font-headline-sm transition-colors cursor-pointer"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={handleExecuteDryRun}
                className="px-space-lg py-2 rounded-lg bg-primary-container text-on-primary-container font-headline-sm hover:brightness-110 shadow-[0_0_16px_rgba(6,182,212,0.3)] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  send
                </span>
                <span>Dispatch Dry Run</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastNotification message={toastMessage} />
    </>
  );
}
