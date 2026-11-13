import fs from "node:fs";
import path from "node:path";
import agentsData from "@/data/agents.json";

export interface MarketplaceAgent {
  id: string;
  name: string;
  handle: string;
  payoutAccount?: string;
  avatar: string;
  bidPrice: string;
  bidNear: number;
  baseReputation: number;
  reputation: number;
  sla: string;
  latency: string;
  specialty: string;
  role: "scout" | "copywriter";
  completedTasks: number;
  slashedCount: number;
  lastUpdatedAt?: number;
}

export interface AgentDynamicStat {
  reputation: number;
  completedTasks: number;
  slashedCount: number;
  lastUpdatedAt: number;
}

type AgentStatsMap = Record<string, AgentDynamicStat>;

const AGENT_STATS_PATH = path.join(
  process.cwd(),
  "data",
  "agent-stats.json",
);

const scoutHandle = process.env.WORKER_SCOUT_ACCOUNT_ID
  ? (process.env.WORKER_SCOUT_ACCOUNT_ID.startsWith("@")
      ? process.env.WORKER_SCOUT_ACCOUNT_ID
      : `@${process.env.WORKER_SCOUT_ACCOUNT_ID}`)
  : "@isreel-design.testnet";

const SCRAPE_SCOUT_AGENT: Omit<
  MarketplaceAgent,
  "baseReputation" | "completedTasks" | "slashedCount"
> = {
  id: "scrape-scout",
  name: "ScrapeScout v3.0",
  handle: scoutHandle,
  payoutAccount: process.env.WORKER_SCOUT_ACCOUNT_ID || "isreel-design.testnet",
  avatar: "/avatars/scrape-scout.svg",
  bidPrice: "0.03 NEAR",
  bidNear: 0.03,
  reputation: 99,
  sla: "Starting fixture (248 tasks)",
  latency: "0.84s",
  specialty: "Web Intelligence & Sentiment Extraction",
  role: "scout",
};

const BASE_AGENTS: Omit<
  MarketplaceAgent,
  "baseReputation" | "completedTasks" | "slashedCount"
>[] = [
  SCRAPE_SCOUT_AGENT,
  ...agentsData.map((a) => ({
    ...a,
    role: (a.role === "scout" ? "scout" : "copywriter") as "scout" | "copywriter",
  })),
];

let writeMutex: Promise<void> = Promise.resolve();

async function ensureStatsFileExists(): Promise<void> {
  const dir = path.dirname(AGENT_STATS_PATH);
  await fs.promises.mkdir(dir, { recursive: true });
}

async function readStatsMap(): Promise<AgentStatsMap> {
  try {
    const raw = await fs.promises.readFile(AGENT_STATS_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as AgentStatsMap;
    }
    return {};
  } catch {
    return {};
  }
}

async function writeStatsMap(stats: AgentStatsMap): Promise<void> {
  try {
    await ensureStatsFileExists();
    const tmpPath = `${AGENT_STATS_PATH}.tmp`;
    await fs.promises.writeFile(
      tmpPath,
      JSON.stringify(stats, null, 2),
      "utf-8",
    );
    await fs.promises.rename(tmpPath, AGENT_STATS_PATH);
  } catch (err) {
    console.warn("Could not write agent stats to disk:", err);
  }
}

/**
 * Returns all marketplace agents overlaid with persistent reputation,
 * completed task count, and slash count from disk.
 */
export async function getAgentsWithStats(): Promise<MarketplaceAgent[]> {
  const statsMap = await readStatsMap();

  return BASE_AGENTS.map((base) => {
    const dynamic = statsMap[base.id];
    const reputation =
      typeof dynamic?.reputation === "number"
        ? Math.max(0, Math.min(100, dynamic.reputation))
        : base.reputation;

    return {
      ...base,
      baseReputation: base.reputation,
      reputation,
      completedTasks: dynamic?.completedTasks ?? 0,
      slashedCount: dynamic?.slashedCount ?? 0,
      lastUpdatedAt: dynamic?.lastUpdatedAt,
    };
  });
}

/**
 * Looks up a specific agent (scout or copywriter) by id, falling back to null
 * if no matching catalog entry exists.
 */
export async function getAgentById(
  id: string,
): Promise<MarketplaceAgent | null> {
  const agents = await getAgentsWithStats();
  return agents.find((a) => a.id === id) ?? null;
}

/**
 * Applies the marketplace policy: pick the lowest-priced qualified copywriter
 * with reputation strictly above 95. Falls back to highest reputation if none qualify.
 */
export function selectPolicyWinner(
  agents: MarketplaceAgent[],
): MarketplaceAgent | null {
  const copywriters = agents.filter((a) => a.role === "copywriter");
  if (copywriters.length === 0) return null;

  const qualified = copywriters
    .filter((a) => a.reputation > 95)
    .sort((a, b) => a.bidNear - b.bidNear);

  if (qualified.length > 0) {
    return qualified[0];
  }

  return [...copywriters].sort((a, b) => b.reputation - a.reputation)[0];
}

function withWriteLock<T>(fn: () => Promise<T>): Promise<T> {
  const result = writeMutex.then(fn, fn);
  writeMutex = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

/**
 * Slashes an agent's reputation after failing the deterministic Verifier Gate.
 */
export async function slashAgentReputation(
  agentId: string,
  penalty = 5,
): Promise<MarketplaceAgent | null> {
  return withWriteLock(async () => {
    const base = BASE_AGENTS.find((a) => a.id === agentId);
    if (!base) return null;

    const statsMap = await readStatsMap();
    const prev = statsMap[agentId] ?? {
      reputation: base.reputation,
      completedTasks: 0,
      slashedCount: 0,
      lastUpdatedAt: Date.now(),
    };

    const nextStat: AgentDynamicStat = {
      reputation: Math.max(0, prev.reputation - penalty),
      completedTasks: prev.completedTasks,
      slashedCount: prev.slashedCount + 1,
      lastUpdatedAt: Date.now(),
    };

    statsMap[agentId] = nextStat;
    await writeStatsMap(statsMap);

    return {
      ...base,
      baseReputation: base.reputation,
      ...nextStat,
    };
  });
}

/**
 * Rewards an agent with +1 reputation (capped at 100) and increments completedTasks
 * upon verified NEAR settlement.
 */
export async function rewardAgentReputation(
  agentId: string,
  bonus = 1,
): Promise<MarketplaceAgent | null> {
  return withWriteLock(async () => {
    const base = BASE_AGENTS.find((a) => a.id === agentId);
    if (!base) return null;

    const statsMap = await readStatsMap();
    const prev = statsMap[agentId] ?? {
      reputation: base.reputation,
      completedTasks: 0,
      slashedCount: 0,
      lastUpdatedAt: Date.now(),
    };

    const nextStat: AgentDynamicStat = {
      reputation: Math.min(100, prev.reputation + bonus),
      completedTasks: prev.completedTasks + 1,
      slashedCount: prev.slashedCount,
      lastUpdatedAt: Date.now(),
    };

    statsMap[agentId] = nextStat;
    await writeStatsMap(statsMap);

    return {
      ...base,
      baseReputation: base.reputation,
      ...nextStat,
    };
  });
}

/**
 * Restores all agent reputations and counters back to baseline agents.json values.
 */
export async function resetAgentStats(): Promise<MarketplaceAgent[]> {
  return withWriteLock(async () => {
    await writeStatsMap({});
    return getAgentsWithStats();
  });
}
