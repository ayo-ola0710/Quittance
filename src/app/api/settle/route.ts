import { NextRequest, NextResponse } from "next/server";
import {
  Account,
  JsonRpcProvider,
  KeyPairSigner,
  actions,
  nearToYocto,
  type KeyPairString,
} from "near-api-js";
import { getTaskStore, saveTask } from "@/lib/taskStore";
import { getAgentById, rewardAgentReputation } from "@/lib/agentStore";

// ── Milestone 1: Pure Native NEAR Micro-Settlements ─────────────────────────
const SCOUT_LOCKED_PAYOUT = "0.03";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const target = (body.target as "all" | "worker1" | "worker2") || "all";
    const taskId = body.taskId as string | undefined;
    const outputHash = body.outputHash as string | undefined;

    // ── Milestone 2: Server-Side Cryptographic Gate ─────────────────────────
    if (!taskId) {
      return NextResponse.json(
        { error: "Missing taskId. Settlements must be linked to a verified AgentBounty task." },
        { status: 400 },
      );
    }

    const taskStore = getTaskStore();
    const task = taskStore.get(taskId);

    if (!task) {
      return NextResponse.json(
        { error: `Task ${taskId} not found or has not been verified by AgentBounty.` },
        { status: 404 },
      );
    }

    // Cryptographic output hash verification gate
    if (outputHash && task.outputHash && outputHash !== task.outputHash) {
      return NextResponse.json(
        {
          error: `Cryptographic hash mismatch. Deliverable output does not match root hash ${task.outputHash.slice(0, 12)}...`,
        },
        { status: 400 },
      );
    }

    // ── Milestone 4 Fix: Double-Spend & Pending Lock Guard ───────────────────
    if (target === "all") {
      if (
        task.status === "settling" ||
        task.status === "settled" ||
        (task.settledWorkers.worker1 && task.settledWorkers.worker2)
      ) {
        return NextResponse.json(
          {
            error: `Task ${taskId} is currently settling or already settled! Concurrent settlement blocked.`,
          },
          { status: 409 },
        );
      }
    } else if (target === "worker1") {
      if (task.settledWorkers.worker1 || task.settlingWorkers?.worker1) {
        return NextResponse.json(
          { error: `Worker 1 on Task ${taskId} is currently settling or already paid! Concurrent settlement blocked.` },
          { status: 409 },
        );
      }
    } else if (target === "worker2") {
      if (task.settledWorkers.worker2 || task.settlingWorkers?.worker2) {
        return NextResponse.json(
          { error: `Worker 2 on Task ${taskId} is currently settling or already paid! Concurrent settlement blocked.` },
          { status: 409 },
        );
      }
    }

    // ── Milestone 3: Automated Verifier Gate Enforcement ────────────────────
    if (target === "worker1" && task.verification && !task.verification.worker1.passed) {
      return NextResponse.json(
        {
          error: `Automated Verifier Gate Rejection: Worker 1 failed specification (${task.verification.worker1.reason}). Payout blocked. Funds remain in manager account.`,
        },
        { status: 422 },
      );
    }

    if (target === "worker2" && task.verification && !task.verification.worker2.passed) {
      return NextResponse.json(
        {
          error: `Automated Verifier Gate Rejection: Worker 2 failed specification (${task.verification.worker2.reason}). Payout blocked. Funds remain in manager account.`,
        },
        { status: 422 },
      );
    }

    // Lock task status immediately to prevent rapid double-click race conditions
    task.status = "settling";
    task.settlingWorkers = {
      worker1: target === "all" || target === "worker1",
      worker2: target === "all" || target === "worker2",
    };
    saveTask(task);

    // ── Milestone 4 Fix: Correct Role-to-Wallet Assignment & Clean Defaults ─
    const managerId = process.env.MANAGER_ACCOUNT_ID || "agentbounty-manager.testnet";
    const privateKey = process.env.MANAGER_PRIVATE_KEY;

    // Scout data node maps strictly to scout account
    const scoutWorkerAccount =
      process.env.WORKER_SCOUT_ACCOUNT_ID ||
      process.env.WORKER_DESIGN_ACCOUNT_ID ||
      "scout-worker.testnet";

    // Copywriter synthesis node maps strictly to copy account
    const copyWorkerAccount =
      process.env.WORKER_COPY_ACCOUNT_ID ||
      "copy-agent.testnet";

    const nodeUrl = process.env.NEAR_NODE_URL || "https://rpc.testnet.near.org";

    if (!privateKey) {
      task.status = "verified";
      task.settlingWorkers = { worker1: false, worker2: false };
      saveTask(task);
      return NextResponse.json(
        { error: "Missing required MANAGER_PRIVATE_KEY in environment configuration." },
        { status: 500 },
      );
    }

    const provider = new JsonRpcProvider({ url: nodeUrl });
    const signer = KeyPairSigner.fromSecretKey(privateKey as KeyPairString);
    const account = new Account(managerId, provider, signer);

    // Validate server-side bid rate for selected copywriter from agents.json catalog
    const catalogWorker2 = task.selectedAgent?.id
      ? await getAgentById(task.selectedAgent.id)
      : null;
    const worker2AmountNum =
      catalogWorker2?.role === "copywriter" ? catalogWorker2.bidNear : 0.05;
    const worker2Amount = worker2AmountNum.toFixed(2);
    const worker2AgentName =
      catalogWorker2?.name || task.selectedAgent?.name || "CopyAgent v2.1";
    const worker2AgentHandle =
      catalogWorker2?.handle || task.selectedAgent?.handle || "@copy-agent.testnet";
    const worker2AgentId = catalogWorker2?.id || task.selectedAgent?.id || "copy-agent";

    const settlements: Array<{
      worker: string;
      agentName: string;
      agentHandle: string;
      amount: string;
      txHash: string;
      explorerUrl: string;
      payoutType: string;
      status: "paid" | "rejected";
      reason?: string;
    }> = [];

    // 1. Payout Worker 1 (Data / Scout) - strictly 0.03 NEAR if passed
    if (
      (target === "all" || target === "worker1") &&
      !task.settledWorkers.worker1
    ) {
      if (task.verification?.worker1 && !task.verification.worker1.passed) {
        settlements.push({
          worker: scoutWorkerAccount,
          agentName: "ScrapeScout v3.0",
          agentHandle: "@scout-worker.testnet",
          amount: "0 NEAR",
          txHash: "BLOCKED_BY_VERIFIER_GATE",
          explorerUrl: "",
          payoutType: "Rejected (Failed Spec)",
          status: "rejected",
          reason: task.verification.worker1.reason,
        });
      } else {
        const amount = SCOUT_LOCKED_PAYOUT;
        const result1 = await account.signAndSendTransaction({
          receiverId: scoutWorkerAccount,
          actions: [actions.transfer(nearToYocto(amount))],
        });

        settlements.push({
          worker: scoutWorkerAccount,
          agentName: "ScrapeScout v3.0",
          agentHandle: "@scout-worker.testnet",
          amount: `${amount} NEAR`,
          txHash: result1.transaction.hash,
          explorerUrl: `https://testnet.nearblocks.io/txns/${result1.transaction.hash}`,
          payoutType: "Native NEAR Transfer",
          status: "paid",
        });

        task.settledWorkers.worker1 = true;
        await rewardAgentReputation("scrape-scout", 1);
      }
    }

    // 2. Payout Worker 2 (Copy / Synthesis) - strictly catalog bid price if passed
    if (
      (target === "all" || target === "worker2") &&
      !task.settledWorkers.worker2
    ) {
      if (task.verification?.worker2 && !task.verification.worker2.passed) {
        settlements.push({
          worker: copyWorkerAccount,
          agentName: worker2AgentName,
          agentHandle: worker2AgentHandle,
          amount: "0 NEAR",
          txHash: "BLOCKED_BY_VERIFIER_GATE",
          explorerUrl: "",
          payoutType: "Rejected (Failed Spec)",
          status: "rejected",
          reason: task.verification.worker2.reason,
        });
      } else {
        const amount = worker2Amount;
        const result2 = await account.signAndSendTransaction({
          receiverId: copyWorkerAccount,
          actions: [actions.transfer(nearToYocto(worker2AmountNum))],
        });

        settlements.push({
          worker: copyWorkerAccount,
          agentName: worker2AgentName,
          agentHandle: worker2AgentHandle,
          amount: `${amount} NEAR`,
          txHash: result2.transaction.hash,
          explorerUrl: `https://testnet.nearblocks.io/txns/${result2.transaction.hash}`,
          payoutType: "Native NEAR Transfer",
          status: "paid",
        });

        task.settledWorkers.worker2 = true;
        await rewardAgentReputation(worker2AgentId, 1);
      }
    }

    const existingSettlements = task.settlements || [];
    const newRecordsToPersist = settlements.filter(
      (s) =>
        s.status === "paid" ||
        !existingSettlements.some(
          (e) =>
            e.status === "rejected" &&
            e.agentHandle === s.agentHandle &&
            e.txHash === s.txHash,
        ),
    );

    // Check if any payment succeeded
    const paidSettlements = settlements.filter((s) => s.status === "paid");
    if (paidSettlements.length === 0 && settlements.some((s) => s.status === "rejected")) {
      task.status = "verified";
      task.settlingWorkers = { worker1: false, worker2: false };
      task.settlements = [...existingSettlements, ...newRecordsToPersist];
      saveTask(task);
      return NextResponse.json(
        {
          success: false,
          error: "Automated Verifier Gate Rejection: Deliverable failed specification. Settlement blocked; 0 NEAR disbursed.",
          settlements,
        },
        { status: 422 },
      );
    }

    // Update final task status
    if (task.settledWorkers.worker1 || task.settledWorkers.worker2) {
      task.status = "settled";
    } else {
      task.status = "verified";
    }
    task.settlingWorkers = { worker1: false, worker2: false };
    task.settlements = [...existingSettlements, ...newRecordsToPersist];
    saveTask(task);

    return NextResponse.json({
      success: true,
      taskId,
      outputHash: task.outputHash,
      settlements,
    });
  } catch (error: unknown) {
    console.error("NEAR Settlement Error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to settle on NEAR";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
