import fs from "fs";
import path from "path";
import crypto from "crypto";
import { VERIFICATION_RULES, type VerificationRuleDef } from "@/types";

export { VERIFICATION_RULES, type VerificationRuleDef };

export interface SwarmExecutionEvent {
  timestamp: string;
  agent: string;
  level: "info" | "success" | "warn" | "step";
  message: string;
}

export interface VerificationCheck {
  name: string;
  pass: boolean;
  detail?: string;
}

export interface WorkerVerificationResult {
  passed: boolean;
  score: number;
  reason: string;
  charCount: number;
  checks: VerificationCheck[];
}

export interface SelectedAgentSnapshot {
  id: string;
  name: string;
  handle: string;
  bidPrice: string;
  bidNear: number;
  reputationAtSelection?: number;
  reputationAfter?: number;
  slashed?: boolean;
}

export interface SwarmTask {
  taskId: string;
  directivePrompt: string;
  outputHash: string;
  rulesHash?: string;
  createdAt: number;
  status: "verified" | "settling" | "settled";
  isLive: boolean;
  simulateBadWorker?: boolean;
  selectedAgent?: SelectedAgentSnapshot;
  verification: {
    worker1: WorkerVerificationResult;
    worker2: WorkerVerificationResult;
  };
  deliverables?: {
    worker1Title: string;
    worker1Summary: string;
    worker2Title: string;
    worker2Headline: string;
    worker2Body: string;
    worker2DesignPrompt: string;
  };
  settlingWorkers?: {
    worker1: boolean;
    worker2: boolean;
  };
  settledWorkers: {
    worker1: boolean;
    worker2: boolean;
  };
  executionEvents: SwarmExecutionEvent[];
  settlements?: Array<{
    worker: string;
    agentName?: string;
    agentHandle?: string;
    amount: string;
    txHash: string;
    explorerUrl: string;
    status?: "paid" | "rejected";
    reason?: string;
  }>;
}

const DATA_FILE_PATH = path.join(process.cwd(), "data", "tasks.json");

declare global {
  var __QUITTANCE_TASK_STORE__: Map<string, SwarmTask> | undefined;
}

function loadPersistedTasks(): Map<string, SwarmTask> {
  const store = new Map<string, SwarmTask>();
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const raw = fs.readFileSync(DATA_FILE_PATH, "utf-8");
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        for (const t of list) {
          if (t && t.taskId) {
            store.set(t.taskId, t);
          }
        }
      }
    }
  } catch (err) {
    console.warn("Could not read persisted tasks from disk:", err);
  }
  return store;
}

function persistTasks(store: Map<string, SwarmTask>): void {
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const list = Array.from(store.values());
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not persist tasks to disk:", err);
  }
}

export function getTaskStore(): Map<string, SwarmTask> {
  if (!globalThis.__QUITTANCE_TASK_STORE__) {
    globalThis.__QUITTANCE_TASK_STORE__ = loadPersistedTasks();
  }
  return globalThis.__QUITTANCE_TASK_STORE__;
}

export function saveTask(task: SwarmTask): void {
  const store = getTaskStore();
  store.set(task.taskId, task);
  persistTasks(store);
}

export function generateTaskId(): string {
  const rand = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `AB-${rand}`;
}

export function computeOutputHash(data: unknown): string {
  const jsonStr = typeof data === "string" ? data : JSON.stringify(data);
  const hash = crypto.createHash("sha256").update(jsonStr).digest("hex");
  return `0x${hash}`;
}

export function computeRulesHash(): string {
  const hash = crypto
    .createHash("sha256")
    .update(JSON.stringify(VERIFICATION_RULES))
    .digest("hex");
  return `0x${hash}`;
}

// ── Milestone 2: Deterministic Rule-Based Automated Verifier ─────────────────
export function evaluateDeliverable(
  text: string,
  prompt: string,
  role: "telemetry" | "copy",
): WorkerVerificationResult {
  const promptKeywords = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((k) => k.length > 3);

  const minLength = role === "copy" ? 120 : 80;

  const hasLength = text.length > minLength;
  const hasStructure =
    text.includes("\n") ||
    text.includes("#") ||
    text.includes(":") ||
    text.includes(".");
  const hasKeywords =
    promptKeywords.length === 0 ||
    promptKeywords.some((k) => text.toLowerCase().includes(k));

  const lower = text.toLowerCase();
  const badTokens = ["error:", "incomplete", "corrupted", "truncated"].filter(
    (t) => lower.includes(t),
  );
  const isComplete = badTokens.length === 0;

  const checks: VerificationCheck[] = [
    {
      name: `Minimum Length (> ${minLength} chars)`,
      pass: hasLength,
      detail: hasLength
        ? `${text.length} chars (required > ${minLength})`
        : `Failed: Output length (${text.length} chars) is below required ${minLength}`,
    },
    {
      name: "Prompt Keyword Match",
      pass: hasKeywords,
      detail: hasKeywords
        ? "Salient prompt keywords detected in deliverable"
        : "Failed: Missing salient keywords from user directive",
    },
    {
      name: "Structured Markdown / Sections",
      pass: hasStructure,
      detail: hasStructure
        ? "Structured sections, headings, or formatting detected"
        : "Failed: Missing structured markdown sections or formatting",
    },
    {
      name: "Complete Deliverable",
      pass: isComplete,
      detail: isComplete
        ? "Clean payload verified without error or crash tokens"
        : `Failed: Output truncated or contains error tokens: ${badTokens.join(", ")}`,
    },
  ];

  const passedCount = checks.filter((c) => c.pass).length;
  const score = Math.round((passedCount / checks.length) * 100);
  const passed = score >= 75;

  const failedNames = checks.filter((c) => !c.pass).map((c) => c.name);
  const reason = passed
    ? `Passed automated verification rules (${passedCount}/${checks.length} checks passed, score ${score}%)`
    : `Verification Failed: Failed ${failedNames.join("; ")} (score ${score}%)`;

  return {
    passed,
    score,
    reason,
    charCount: text.length,
    checks,
  };
}
