import { NextRequest, NextResponse } from "next/server";
import { getTaskStore } from "@/lib/taskStore";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get("taskId") || "";

  if (!taskId) {
    return NextResponse.json({ error: "Missing taskId parameter" }, { status: 400 });
  }

  const taskStore = getTaskStore();
  const task = taskStore.get(taskId);

  // Milestone 1 Fix: Strict 404 on non-existent tasks. Absolutely no fake spoofed receipts!
  if (!task) {
    return NextResponse.json(
      { error: `Receipt not found for task #${taskId}.` },
      { status: 404 },
    );
  }

  const managerAccount =
    process.env.MANAGER_ACCOUNT_ID || "quittance-manager.testnet";

  return NextResponse.json({
    taskId: task.taskId,
    directivePrompt: task.directivePrompt,
    outputHash: task.outputHash,
    rulesHash: task.rulesHash,
    createdAt: task.createdAt,
    status: task.status,
    isLive: task.isLive,
    simulateBadWorker: task.simulateBadWorker,
    selectedAgent: task.selectedAgent,
    verification: task.verification,
    deliverables: task.deliverables,
    settlements: task.settlements || [],
    managerAccount,
  });
}
