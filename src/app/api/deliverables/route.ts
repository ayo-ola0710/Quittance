import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import {
  saveTask,
  generateTaskId,
  computeOutputHash,
  computeRulesHash,
  evaluateDeliverable,
  type SelectedAgentSnapshot,
  type SwarmExecutionEvent,
  type WorkerVerificationResult,
} from "@/lib/taskStore";
import {
  getAgentById,
  getAgentsWithStats,
  selectPolicyWinner,
  slashAgentReputation,
} from "@/lib/agentStore";

export interface DeliverablesResponse {
  taskId: string;
  outputHash: string;
  rulesHash?: string;
  isLive: boolean;
  taskTitle: string;
  simulateBadWorker?: boolean;
  selectedAgent?: SelectedAgentSnapshot;
  verification: {
    worker1: WorkerVerificationResult;
    worker2: WorkerVerificationResult;
  };
  executionEvents: SwarmExecutionEvent[];
  worker1: {
    deliverableTitle: string;
    runtime: string;
    sha256: string;
    stats: {
      stat1Label: string;
      stat1Value: string;
      stat2Label: string;
      stat2Value: string;
      stat3Label: string;
      stat3Value: string;
    };
    topicClusters: Array<{ tag: string; count: number }>;
    summary: string;
  };
  worker2: {
    deliverableTitle: string;
    runtime: string;
    sha256: string;
    filename: string;
    copyHeadline: string;
    copyBody: string;
    wordCount: number;
    readingTime: string;
    designPrompt: string;
    designStyle: string;
  };
}

function cleanJsonString(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

async function generateWithGeminiModels(
  ai: GoogleGenAI,
  promptText: string,
): Promise<string> {
  const models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.5-flash"];
  let lastErr: unknown = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: promptText,
        config: { responseMimeType: "application/json" },
      });
      const text = response.text?.trim();
      if (text) {
        return text;
      }
    } catch (err: unknown) {
      lastErr = err;
      console.warn(`Model ${model} invocation failed, trying next model:`, err instanceof Error ? err.message : err);
    }
  }

  throw lastErr || new Error("All Gemini generation attempts failed");
}

function shortHandle(handle: string): string {
  return handle.replace(/\.testnet$/i, "");
}

function getFallbackDeliverables(
  prompt: string,
  taskId: string,
  simulateBadWorker = false,
  selectedAgent?: SelectedAgentSnapshot,
): DeliverablesResponse {
  const timestamp = new Date().toISOString().substring(11, 23);
  const agentTag = selectedAgent ? shortHandle(selectedAgent.handle) : "@copy-agent";

  const fallbackEvents: SwarmExecutionEvent[] = [
    {
      timestamp,
      agent: "Orchestrator",
      level: "step",
      message: `Initialized Task ${taskId}. Bidding complete (${agentTag} at ${selectedAgent?.bidPrice || "0.05 NEAR"}), workers dispatched.`,
    },
    {
      timestamp,
      agent: "@scout-worker",
      level: "info",
      message: "Scanned telemetry, extracted sentiment vector in 1.14s.",
    },
    {
      timestamp,
      agent: agentTag,
      level: simulateBadWorker ? "warn" : "info",
      message: simulateBadWorker
        ? "Worker returned malformed draft ({ error: 'incomplete_draft' })."
        : "Generated executive marketing copy and 4K banner prompt in 1.16s.",
    },
    {
      timestamp,
      agent: "VerifierGate",
      level: simulateBadWorker ? "warn" : "success",
      message: simulateBadWorker
        ? "Automated Verifier Gate: Worker 2 REJECTED (< 80 chars specification). Payout blocked."
        : "Automated Verifier Gate: Both deliverables verified (> 80 chars, valid schema). Approved for settlement.",
    },
  ];

  const worker1Result = {
    deliverableTitle: "Real-time Social Sentiment Feed",
    runtime: "1.14s",
    sha256: "0x98f4c1e34b9d09a888c3f4e156d733b1e9",
    stats: {
      stat1Label: "Posts Parsed",
      stat1Value: "842",
      stat2Label: "Sentiment",
      stat2Value: "+78%",
      stat3Label: "Throughput",
      stat3Value: "14.2/s",
    },
    topicClusters: [
      { tag: "#AiAgents", count: 412 },
      { tag: "#NEARProtocol", count: 294 },
      { tag: "#Quittance", count: 188 },
    ],
    summary:
      "Sentiment scoring across decentralized agent deployments confirms accelerated adoption of autonomous DAG bounty architectures on NEAR Protocol.",
  };

  const badDraftBody =
    "Draft error: missing data. Pipeline interrupted before synthesis.";

  const worker2Result = simulateBadWorker
    ? {
        deliverableTitle: "Broken Draft (Failed Specifications)",
        runtime: "0.22s",
        sha256: computeOutputHash(badDraftBody),
        filename: "error_log.txt",
        copyHeadline: "⚠️ TRUNCATED DRAFT",
        copyBody: badDraftBody,
        wordCount: 8,
        readingTime: "1s",
        designPrompt: "error",
        designStyle: "None",
      }
    : {
        deliverableTitle: "Executive Alpha Digest & Thread",
        runtime: "1.16s",
        sha256: "0xfa7723ce51a84f3e981bb204cc1948",
        filename: "alpha_thread_output.md",
        copyHeadline: "⚡ NEAR QUITTANCE SETTLEMENT INTEL",
        copyBody:
          "Live stream analysis indicates a major developer pivot toward dynamic on-chain swarm routing. Sentiment remains at +78% positive following NEAR Testnet launch. Quittance treasury settlement models show instantaneous sub-second verifications.",
        wordCount: 142,
        readingTime: "45s",
        designPrompt:
          "Cybernetic swarm of glowing autonomous micro-agents trading tokens over a decentralized network graph, deep blue and electric cyan luminescence, futuristic UI HUD overlay, hyperdetailed 8k --ar 16:9",
        designStyle: "Cybernetic HUD Graph Visualization",
      };

  const outputHash = computeOutputHash({
    worker1: worker1Result,
    worker2: worker2Result,
  });

  const verification: { worker1: WorkerVerificationResult; worker2: WorkerVerificationResult } = {
    worker1: evaluateDeliverable(worker1Result.summary, prompt, "telemetry"),
    worker2: evaluateDeliverable(worker2Result.copyBody, prompt, "copy"),
  };

  const rulesHash = computeRulesHash();

  return {
    taskId,
    outputHash,
    rulesHash,
    isLive: false,
    taskTitle: simulateBadWorker ? "Simulated Malicious Worker Task" : "Quittance Task Directive",
    simulateBadWorker,
    verification,
    executionEvents: fallbackEvents,
    worker1: worker1Result,
    worker2: worker2Result,
  };
}

async function finalizeAndPersistDeliverable(params: {
  taskId: string;
  effectivePrompt: string;
  responsePayload: DeliverablesResponse;
  selectedAgent: SelectedAgentSnapshot;
  simulateBadWorker: boolean;
}): Promise<DeliverablesResponse> {
  const { taskId, effectivePrompt, responsePayload, simulateBadWorker } = params;
  let agentSnapshot: SelectedAgentSnapshot = { ...params.selectedAgent };

  if (!responsePayload.verification.worker2.passed) {
    try {
      const slashed = await slashAgentReputation(agentSnapshot.id, 5);
      if (slashed) {
        agentSnapshot = {
          ...agentSnapshot,
          reputationAfter: slashed.reputation,
          slashed: true,
        };
        responsePayload.executionEvents.push({
          timestamp: new Date().toISOString().substring(11, 23),
          agent: "ReputationEngine",
          level: "warn",
          message: `Reputation slashed for ${agentSnapshot.handle}: ${agentSnapshot.reputationAtSelection ?? "—"} → ${slashed.reputation} (-5 penalty).`,
        });
      }
    } catch (err) {
      console.warn("Failed to slash agent reputation:", err);
    }
  }

  responsePayload.selectedAgent = agentSnapshot;

  saveTask({
    taskId,
    directivePrompt: effectivePrompt,
    outputHash: responsePayload.outputHash,
    rulesHash: responsePayload.rulesHash,
    createdAt: Date.now(),
    status: "verified",
    isLive: responsePayload.isLive,
    simulateBadWorker,
    selectedAgent: agentSnapshot,
    verification: responsePayload.verification,
    deliverables: {
      worker1Title: responsePayload.worker1.deliverableTitle,
      worker1Summary: responsePayload.worker1.summary,
      worker2Title: responsePayload.worker2.deliverableTitle,
      worker2Headline: responsePayload.worker2.copyHeadline,
      worker2Body: responsePayload.worker2.copyBody,
      worker2DesignPrompt: responsePayload.worker2.designPrompt,
    },
    settledWorkers: { worker1: false, worker2: false },
    executionEvents: responsePayload.executionEvents,
  });

  return responsePayload;
}

export async function POST(req: NextRequest) {
  let prompt = "";
  let simulateBadWorker = false;
  let requestedAgentId = "";
  try {
    const body = await req.json().catch(() => ({}));
    prompt = body.prompt || "";
    simulateBadWorker = Boolean(body.simulateBadWorker);
    requestedAgentId = typeof body.selectedAgentId === "string" ? body.selectedAgentId : "";
  } catch {
    prompt = "";
    simulateBadWorker = false;
    requestedAgentId = "";
  }

  const allAgents = await getAgentsWithStats();
  const requestedAgent = requestedAgentId ? await getAgentById(requestedAgentId) : null;
  const resolvedAgent =
    (requestedAgent && requestedAgent.role === "copywriter" ? requestedAgent : null) ??
    selectPolicyWinner(allAgents) ??
    allAgents.find((a) => a.role === "copywriter")!;

  const selectedAgentSnapshot: SelectedAgentSnapshot = {
    id: resolvedAgent.id,
    name: resolvedAgent.name,
    handle: resolvedAgent.handle,
    bidPrice: resolvedAgent.bidPrice,
    bidNear: resolvedAgent.bidNear,
    reputationAtSelection: resolvedAgent.reputation,
  };
  const worker2Tag = shortHandle(resolvedAgent.handle);

  const taskId = generateTaskId();
  const startTime = Date.now();
  const getTimestamp = () => new Date().toISOString().substring(11, 23);

  const apiKey = process.env.GEMINI_API_KEY;

  const effectivePrompt =
    prompt && prompt.trim().length > 0
      ? prompt.trim()
      : "Autonomous AI Agent Swarm coordinating decentralized intelligence, market sentiment analysis, and NEAR Testnet micro-settlements";

  if (!apiKey) {
    const fallback = getFallbackDeliverables(
      effectivePrompt,
      taskId,
      simulateBadWorker,
      selectedAgentSnapshot,
    );
    const finalized = await finalizeAndPersistDeliverable({
      taskId,
      effectivePrompt,
      responsePayload: fallback,
      selectedAgent: selectedAgentSnapshot,
      simulateBadWorker,
    });
    return NextResponse.json(finalized);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const events: SwarmExecutionEvent[] = [];

    events.push({
      timestamp: getTimestamp(),
      agent: "Orchestrator",
      level: "step",
      message: `DAG Initialized for Task ${taskId}. Bidding closed: @scout-worker (0.03 NEAR) and ${worker2Tag} (${resolvedAgent.bidPrice}) assigned.`,
    });

    events.push({
      timestamp: getTimestamp(),
      agent: "Orchestrator",
      level: "info",
      message: `Dispatched parallel sub-tasks to worker nodes.`,
    });

    // Worker 1: Scout
    const worker1Promise = (async () => {
      const t0 = Date.now();
      events.push({
        timestamp: getTimestamp(),
        agent: "@scout-worker",
        level: "info",
        message: "Initiated telemetry extraction via Gemini Flash...",
      });

      const worker1SystemPrompt = `You are @scout-worker.testnet, an autonomous data extraction and telemetry research agent in the Quittance network on NEAR.
Analyze this user bounty directive:
"${effectivePrompt}"

Generate dynamically synthesized research data, metrics, and topic clusters tailored directly to this directive.
Return valid JSON matching this schema:
{
  "deliverableTitle": "Specific deliverable title (e.g. 'Social Sentiment Matrix' or 'Cross-Market Arbitrage Feed')",
  "stats": {
    "stat1Label": "Relevant metric label (e.g. 'Posts Analyzed', 'Contracts Scanned', 'Orders Parsed')",
    "stat1Value": "Number or percentage string (e.g. '1,420', '842', '98.4%')",
    "stat2Label": "Relevant metric label (e.g. 'Sentiment Index', 'Confidence Score', 'Spread Delta')",
    "stat2Value": "Value string (e.g. '+82%', '99.1%', '4.2 bps')",
    "stat3Label": "Throughput or latency label (e.g. 'Throughput', 'Processing Rate', 'Latency')",
    "stat3Value": "Value string (e.g. '18.4/s', '45ms', '12.8 TGas')"
  },
  "topicClusters": [
    { "tag": "#RelevantTag1", "count": 420 },
    { "tag": "#RelevantTag2", "count": 280 },
    { "tag": "#RelevantTag3", "count": 165 }
  ],
  "summary": "1-2 sentence executive technical findings summary tailored specifically to this directive."
}
Respond ONLY with valid JSON.`;

      const rawJson = await generateWithGeminiModels(ai, worker1SystemPrompt);
      const elapsed = ((Date.now() - t0) / 1000).toFixed(2);
      const cleaned = cleanJsonString(rawJson);
      const parsed = JSON.parse(cleaned);
      const sha256 = computeOutputHash(parsed);

      events.push({
        timestamp: getTimestamp(),
        agent: "@scout-worker",
        level: "success",
        message: `Extraction completed in ${elapsed}s. Deliverable SHA-256: ${sha256.slice(0, 14)}...`,
      });

      return {
        deliverableTitle: parsed.deliverableTitle || "Verified Telemetry Matrix",
        runtime: `${elapsed}s`,
        sha256,
        stats: parsed.stats || {
          stat1Label: "Records Processed",
          stat1Value: "840",
          stat2Label: "Confidence",
          stat2Value: "99.1%",
          stat3Label: "Throughput",
          stat3Value: "18.2/s",
        },
        topicClusters: parsed.topicClusters || [
          { tag: "#NearSwarm", count: 320 },
          { tag: "#AutonomousAI", count: 210 },
          { tag: "#Quittance", count: 145 },
        ],
        summary: parsed.summary || "Data feed verified and signed.",
      };
    })();

    // Worker 2: Copy & Creative Spec (or bad worker simulation)
    const worker2Promise = (async () => {
      const t0 = Date.now();

      if (simulateBadWorker) {
        events.push({
          timestamp: getTimestamp(),
          agent: worker2Tag,
          level: "warn",
          message: "Simulation mode active: Worker deliverable broken/truncated without required length or prompt keywords...",
        });

        const badDraftBody =
          "Draft error: missing data. Pipeline interrupted before synthesis.";
        const sha256 = computeOutputHash(badDraftBody);
        return {
          taskTitle: "Truncated Output Demo",
          deliverableTitle: "Broken Draft (Failed Specifications)",
          runtime: "0.24s",
          sha256,
          filename: "malformed_output.txt",
          copyHeadline: "⚠️ RUNTIME ERROR / TRUNCATED DRAFT",
          copyBody: badDraftBody,
          wordCount: 8,
          readingTime: "1s",
          designPrompt: "error",
          designStyle: "Undefined",
        };
      }

      events.push({
        timestamp: getTimestamp(),
        agent: worker2Tag,
        level: "info",
        message: "Initiated synthesis, copywriting, and 4K prompt generation via Gemini Flash...",
      });

      const worker2SystemPrompt = `You are ${resolvedAgent.handle}, an autonomous synthesis and creative agent (${resolvedAgent.specialty}) in the Quittance network on NEAR.
Given this user directive:
"${effectivePrompt}"

Generate marketing/synthesis copy and an image generation prompt directly based on this directive.
Return valid JSON matching this schema:
{
  "taskTitle": "Punchy task headline (max 7 words)",
  "deliverableTitle": "Title of deliverable (e.g. 'Launch Campaign & 4K Hero Banner Specs')",
  "filename": "Filename string (e.g. 'launch_announcement.md')",
  "copyHeadline": "Punchy headline with emoji (e.g. '⚡ QUITTANCE INTEL')",
  "copyBody": "High-quality, polished 2-3 paragraph markdown copy or announcement fulfilling this directive with specific domain references.",
  "wordCount": 160,
  "readingTime": "45s",
  "designPrompt": "A detailed, professional Midjourney v6.1 / Flux 4K visual generation prompt with cinematic lighting, style, composition and --ar 16:9 flag tailored specifically to this directive.",
  "designStyle": "Art/visual style name (e.g. 'Cybernetic Holographic HUD 8K')"
}
Respond ONLY with valid JSON.`;

      const rawJson = await generateWithGeminiModels(ai, worker2SystemPrompt);
      const elapsed = ((Date.now() - t0) / 1000).toFixed(2);
      const cleaned = cleanJsonString(rawJson);
      const parsed = JSON.parse(cleaned);
      const sha256 = computeOutputHash(parsed);

      events.push({
        timestamp: getTimestamp(),
        agent: worker2Tag,
        level: "success",
        message: `Synthesis complete in ${elapsed}s (${parsed.wordCount || 150} words). Design prompt ready.`,
      });

      return {
        taskTitle: parsed.taskTitle || "Quittance Task",
        deliverableTitle: parsed.deliverableTitle || "Executive Synthesis & Brand Specs",
        runtime: `${elapsed}s`,
        sha256,
        filename: parsed.filename || "swarm_output.md",
        copyHeadline: parsed.copyHeadline || "⚡ QUITTANCE DELIVERABLE",
        copyBody: parsed.copyBody || "Synthesized deliverable generated by autonomous agent.",
        wordCount: parsed.wordCount || 140,
        readingTime: parsed.readingTime || "40s",
        designPrompt: parsed.designPrompt || "Minimalist high-tech holographic render 8k --ar 16:9",
        designStyle: parsed.designStyle || "Holographic Cyberpunk 8K",
      };
    })();

    const [worker1Result, worker2Result] = await Promise.all([
      worker1Promise,
      worker2Promise,
    ]);

    const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    // ── Milestone 3: Deterministic Rule-Based Automated Verifier Gate ───────
    const worker1Verification = evaluateDeliverable(
      worker1Result.summary,
      effectivePrompt,
      "telemetry",
    );

    const worker2Verification = evaluateDeliverable(
      worker2Result.copyBody,
      effectivePrompt,
      "copy",
    );

    const verification: { worker1: WorkerVerificationResult; worker2: WorkerVerificationResult } = {
      worker1: worker1Verification,
      worker2: worker2Verification,
    };

    if (worker2Verification.passed) {
      events.push({
        timestamp: getTimestamp(),
        agent: "VerifierGate",
        level: "success",
        message: `Automated Verifier Gate: Both deliverables PASSED specifications. Worker 1 Score: ${worker1Verification.score}%, Worker 2 Score: ${worker2Verification.score}%. Approved for settlement.`,
      });
    } else {
      events.push({
        timestamp: getTimestamp(),
        agent: "VerifierGate",
        level: "warn",
        message: `Automated Verifier Gate: Worker 2 REJECTED (${worker2Verification.reason}). Settlement BLOCKED. Funds kept in manager treasury.`,
      });
    }

    const outputHash = computeOutputHash({
      worker1: worker1Result,
      worker2: {
        copyBody: worker2Result.copyBody,
        designPrompt: worker2Result.designPrompt,
      },
    });

    events.push({
      timestamp: getTimestamp(),
      agent: "Orchestrator",
      level: "step",
      message: `Convergence achieved in ${totalElapsed}s. Root SHA-256 Proof: ${outputHash.slice(0, 16)}...`,
    });

    const responsePayload: DeliverablesResponse = {
      taskId,
      outputHash,
      rulesHash: computeRulesHash(),
      isLive: true,
      taskTitle: worker2Result.taskTitle,
      simulateBadWorker,
      selectedAgent: selectedAgentSnapshot,
      verification,
      executionEvents: events,
      worker1: worker1Result,
      worker2: worker2Result,
    };

    const finalized = await finalizeAndPersistDeliverable({
      taskId,
      effectivePrompt,
      responsePayload,
      selectedAgent: selectedAgentSnapshot,
      simulateBadWorker,
    });

    return NextResponse.json(finalized);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gemini call failed";
    console.warn("Gemini call failed, using fallback:", message);

    const fallback = getFallbackDeliverables(
      effectivePrompt,
      taskId,
      simulateBadWorker,
      selectedAgentSnapshot,
    );
    const finalized = await finalizeAndPersistDeliverable({
      taskId,
      effectivePrompt,
      responsePayload: fallback,
      selectedAgent: selectedAgentSnapshot,
      simulateBadWorker,
    });

    return NextResponse.json(finalized);
  }
}
