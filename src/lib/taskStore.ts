import crypto from "crypto";

export interface SwarmExecutionEvent {
  timestamp: string;
  agent: string;
  level: "info" | "success" | "warn" | "step";
  message: string;
}

export interface SwarmTask {
  taskId: string;
  directivePrompt: string;
  outputHash: string;
  createdAt: number;
  status: "verified" | "settled";
  isLive: boolean; // Point 1 & 3: Honest flag indicating real Gemini vs fallback
  settledWorkers: {
    worker1: boolean;
    worker2: boolean;
  };
  executionEvents: SwarmExecutionEvent[];
  settlements?: Array<{
    worker: string;
    amount: string;
    txHash: string;
    explorerUrl: string;
  }>;
}

// Global store to survive hot module reload in Next.js development and API invocations
declare global {
  // eslint-disable-next-line no-var
  var __SWARMPAY_TASK_STORE__: Map<string, SwarmTask> | undefined;
}

export function getTaskStore(): Map<string, SwarmTask> {
  if (!globalThis.__SWARMPAY_TASK_STORE__) {
    globalThis.__SWARMPAY_TASK_STORE__ = new Map();
  }
  return globalThis.__SWARMPAY_TASK_STORE__;
}

export function generateTaskId(): string {
  const rand = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `SWARM-${rand}`;
}

export function computeOutputHash(data: unknown): string {
  const jsonStr = typeof data === "string" ? data : JSON.stringify(data);
  const hash = crypto.createHash("sha256").update(jsonStr).digest("hex");
  return `0x${hash}`;
}
