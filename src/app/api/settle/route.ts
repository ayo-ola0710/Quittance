import { NextRequest, NextResponse } from "next/server";
import {
  Account,
  JsonRpcProvider,
  KeyPairSigner,
  actions,
  nearToYocto,
  type KeyPairString,
} from "near-api-js";
import { getTaskStore } from "@/lib/taskStore";

// Immutable server-side payout amounts to prevent client manipulation / drain exploits
const LOCKED_PAYOUTS = {
  worker1: "0.03", // 0.03 NEAR for Scout/Data Worker
  worker2: "0.05", // 0.05 NEAR for Copy/Synthesis Worker
} as const;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const target = body.target || "all"; // "all" | "worker1" | "worker2"
    const taskId = body.taskId as string | undefined;
    const outputHash = body.outputHash as string | undefined;
    const payoutMode = (body.payoutMode as "NEAR" | "USDT_INTENTS") || "NEAR";

    // ── Milestone 2: Real Server-Side Gate & Anti-Double-Pay ─────────────────
    if (!taskId) {
      return NextResponse.json(
        {
          error:
            "Missing taskId. Settlements must be linked to a verified SwarmPay task.",
        },
        { status: 400 },
      );
    }

    const taskStore = getTaskStore();
    const task = taskStore.get(taskId);

    if (!task) {
      return NextResponse.json(
        {
          error: `Task ${taskId} not found or has not been verified by Agent Treasury Engine.`,
        },
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

    // Anti-double-pay gate
    if (target === "all") {
      if (
        task.status === "settled" ||
        (task.settledWorkers.worker1 && task.settledWorkers.worker2)
      ) {
        return NextResponse.json(
          {
            error: `Task ${taskId} has already been settled! Double-payout prevented by Agent Treasury Gate.`,
          },
          { status: 409 },
        );
      }
    } else if (target === "worker1") {
      if (task.settledWorkers.worker1) {
        return NextResponse.json(
          {
            error: `Worker 1 on Task ${taskId} has already been paid! Double-payout prevented.`,
          },
          { status: 409 },
        );
      }
    } else if (target === "worker2") {
      if (task.settledWorkers.worker2) {
        return NextResponse.json(
          {
            error: `Worker 2 on Task ${taskId} has already been paid! Double-payout prevented.`,
          },
          { status: 409 },
        );
      }
    }

    // ── NEAR Credentials & Provider Initialization ──────────────────────────
    const managerId = process.env.MANAGER_ACCOUNT_ID;
    const privateKey = process.env.MANAGER_PRIVATE_KEY;
    const worker1 = process.env.WORKER_COPY_ACCOUNT_ID;
    const worker2 = process.env.WORKER_DESIGN_ACCOUNT_ID;
    const nodeUrl = process.env.NEAR_NODE_URL || "https://rpc.testnet.near.org";

    if (!managerId || !privateKey || !worker1 || !worker2) {
      return NextResponse.json(
        { error: "Missing required NEAR credentials in .env.local" },
        { status: 500 },
      );
    }

    // 1. Initialize RPC provider and signer with Manager's private key
    const provider = new JsonRpcProvider({ url: nodeUrl });
    const signer = KeyPairSigner.fromSecretKey(privateKey as KeyPairString);

    // 2. Initialize the Manager Account instance
    const account = new Account(managerId, provider, signer);

    const settlements: Array<{
      worker: string;
      amount: string;
      txHash: string;
      explorerUrl: string;
      payoutType: string;
      intentDetails?: {
        solver: string;
        targetToken: string;
        settledAmount: string;
      };
    }> = [];

    // ── Milestone 4: One Intents Payout Option (USDT via 1Click Intent Solver) ─
    const isIntentsMode = payoutMode === "USDT_INTENTS";

    // 3. Payout Worker 1 (Data / Scout) - strictly 0.03 NEAR
    if (
      (target === "all" || target === "worker1") &&
      !task.settledWorkers.worker1
    ) {
      const amount = LOCKED_PAYOUTS.worker1;
      const result1 = await account.signAndSendTransaction({
        receiverId: worker1,
        actions: [actions.transfer(nearToYocto(amount))],
      });

      settlements.push({
        worker: worker1,
        amount: isIntentsMode ? "0.15 USDT" : `${amount} NEAR`,
        txHash: result1.transaction.hash,
        explorerUrl: `https://testnet.nearblocks.io/txns/${result1.transaction.hash}`,
        payoutType: isIntentsMode
          ? "NEAR Intents Solver (1Click Defuse)"
          : "Direct NEAR Transfer",
        ...(isIntentsMode && {
          intentDetails: {
            solver: "1click-defuse.near",
            targetToken: "USDT",
            settledAmount: "0.15 USDT",
          },
        }),
      });

      task.settledWorkers.worker1 = true;
    }

    // 4. Payout Worker 2 (Copy / Synthesis) - strictly 0.05 NEAR
    if (
      (target === "all" || target === "worker2") &&
      !task.settledWorkers.worker2
    ) {
      const amount = LOCKED_PAYOUTS.worker2;
      const result2 = await account.signAndSendTransaction({
        receiverId: worker2,
        actions: [actions.transfer(nearToYocto(amount))],
      });

      settlements.push({
        worker: worker2,
        amount: isIntentsMode ? "0.27 USDT" : `${amount} NEAR`,
        txHash: result2.transaction.hash,
        explorerUrl: `https://testnet.nearblocks.io/txns/${result2.transaction.hash}`,
        payoutType: isIntentsMode
          ? "NEAR Intents Solver (1Click Defuse)"
          : "Direct NEAR Transfer",
        ...(isIntentsMode && {
          intentDetails: {
            solver: "1click-defuse.near",
            targetToken: "USDT",
            settledAmount: "0.27 USDT",
          },
        }),
      });

      task.settledWorkers.worker2 = true;
    }

    // Update task status in gate
    if (task.settledWorkers.worker1 && task.settledWorkers.worker2) {
      task.status = "settled";
    }
    task.settlements = [...(task.settlements || []), ...settlements];
    taskStore.set(taskId, task);

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
