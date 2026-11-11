import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import {
  getTaskStore,
  generateTaskId,
  computeOutputHash,
  type SwarmExecutionEvent,
} from "@/lib/taskStore";

export interface DeliverablesResponse {
  taskId: string;
  outputHash: string;
  isLive: boolean;
  taskTitle: string;
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

function getFallbackDeliverables(
  prompt: string,
  taskId: string,
): DeliverablesResponse {
  const isDeFi =
    prompt.toLowerCase().includes("arbitrage") ||
    prompt.toLowerCase().includes("defi") ||
    prompt.toLowerCase().includes("ref finance");

  const isCoffee =
    prompt.toLowerCase().includes("coffee") ||
    prompt.toLowerCase().includes("launch");

  const timestamp = new Date().toISOString().substring(11, 23);

  const fallbackEvents: SwarmExecutionEvent[] = [
    {
      timestamp,
      agent: "Orchestrator",
      level: "step",
      message: `Initialized DAG for ${taskId}. Swarm dispatching parallel tasks...`,
    },
    {
      timestamp,
      agent: "@scout-worker",
      level: "info",
      message: "Scout worker active. Extracted structured telemetry matrix.",
    },
    {
      timestamp,
      agent: "@copy-agent",
      level: "info",
      message: "Copy agent active. Synthesized marketing thread & 4K design prompt.",
    },
    {
      timestamp,
      agent: "Orchestrator",
      level: "success",
      message: "Fallback preset delivered. Awaiting cryptographic Treasury settlement.",
    },
  ];

  let res: Omit<DeliverablesResponse, "outputHash">;

  if (isDeFi) {
    res = {
      taskId,
      isLive: false,
      taskTitle: "Ref Finance / Burrow Yield Spread Scanner & Arbitrage DAG",
      executionEvents: fallbackEvents,
      worker1: {
        deliverableTitle: "Cross-DEX Liquidity & Spread Matrix",
        runtime: "1.12s",
        sha256: "0x3f9a77c4e12a88b029c91d84b233a1e9",
        stats: {
          stat1Label: "Pools Scanned",
          stat1Value: "34",
          stat2Label: "Avg Spread",
          stat2Value: "0.48bps",
          stat3Label: "Throughput",
          stat3Value: "28.4/s",
        },
        topicClusters: [
          { tag: "#RefFinance", count: 480 },
          { tag: "#BurrowLending", count: 312 },
          { tag: "#DeFiArb", count: 205 },
        ],
        summary:
          "Detected recurring triangular arbitrage cycles between NEAR/USDT on Ref Finance and supply collateral pools on Burrow.",
      },
      worker2: {
        deliverableTitle: "Arbitrage Execution Spec & Telemetry Log",
        runtime: "1.18s",
        sha256: "0x89ab41cf9822a104cc781d4e0955b210",
        filename: "arbitrage_execution_report.md",
        copyHeadline: "⚡ REF FINANCE × BURROW ARBITRAGE SIGNAL • #891",
        copyBody:
          "Automated mempool telemetry confirmed net positive yield spreads between Ref Finance v2 concentrated pools and Burrow supply positions. Cross-contract call latency clocked at 840ms with zero frontrunning slippage across NEAR Testnet shards.",
        wordCount: 168,
        readingTime: "50s",
        designPrompt:
          "Futuristic DeFi holographic terminal displaying real-time liquidity flow between Ref Finance and Burrow, neon cyan and purple fiber-optic cables, dark cyberpunk background, isometric 3D render, octane render 8k --ar 16:9",
        designStyle: "Isometric Holographic Cyberpunk",
      },
    };
  } else if (isCoffee) {
    res = {
      taskId,
      isLive: false,
      taskTitle: "Web3 Coffee Launch Campaign & Creative Brand Specs",
      executionEvents: fallbackEvents,
      worker1: {
        deliverableTitle: "Social Community Pulse & Demographic Audit",
        runtime: "1.08s",
        sha256: "0x55bc1209e884a210fec881023a19b841",
        stats: {
          stat1Label: "Audience Target",
          stat1Value: "18.5k",
          stat2Label: "Sentiment",
          stat2Value: "+91%",
          stat3Label: "Engagement",
          stat3Value: "12.4%",
        },
        topicClusters: [
          { tag: "#Web3Coffee", count: 520 },
          { tag: "#NEARBrews", count: 390 },
          { tag: "#SpecialtyRoast", count: 245 },
        ],
        summary:
          "Identified strong traction among remote crypto builders for single-origin specialty roast paid via NEAR micro-transactions.",
      },
      worker2: {
        deliverableTitle: "Viral Launch Thread & 4K Hero Banner Specs",
        runtime: "1.24s",
        sha256: "0xee7149a0129fbc88310c9215ef882190",
        filename: "web3_coffee_launch_thread.md",
        copyHeadline: "☕ PROOF OF ROAST: WEB3 SPECIALTY COFFEE ON NEAR",
        copyBody:
          "Coffee meets crypto. Every single-origin Ethiopian roast batch is verified on NEAR with zero-fee micro-transactions. Scan your cup, unlock your digital grower royalties, and savor decentralized specialty beans.",
        wordCount: 154,
        readingTime: "45s",
        designPrompt:
          "Cinematic commercial photography of a sleek minimalist ceramic coffee cup with glowing cyan steam forming NEAR Protocol logos, morning warm sunlight, rich crema, depth of field, Hasselblad 8k --ar 16:9",
        designStyle: "Minimalist Commercial Photography",
      },
    };
  } else {
    res = {
      taskId,
      isLive: false,
      taskTitle: "Real-Time Competitor Alpha Digest & Sentiment Ingestion",
      executionEvents: fallbackEvents,
      worker1: {
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
          { tag: "#autonomous_escrow", count: 188 },
        ],
        summary:
          "Sentiment scoring across decentralized agent deployments confirms accelerated adoption of autonomous DAG bounty architectures.",
      },
      worker2: {
        deliverableTitle: "Executive Alpha Digest & Thread",
        runtime: "1.16s",
        sha256: "0xfa7723ce51a84f3e981bb204cc1948",
        filename: "alpha_thread_output.md",
        copyHeadline: "⚡ NEAR AUTONOMOUS SWARM INTEL • #892",
        copyBody:
          "Live stream analysis indicates a major developer pivot toward dynamic on-chain swarm routing. Sentiment remains at +78% positive following NEAR Testnet launch. Smart contract escrow models show instantaneous sub-second verifications, outperforming legacy oracle pipelines.",
        wordCount: 142,
        readingTime: "45s",
        designPrompt:
          "Cybernetic swarm of glowing autonomous micro-agents trading tokens over a decentralized network graph, deep blue and electric cyan luminescence, futuristic UI HUD overlay, hyperdetailed 8k --ar 16:9",
        designStyle: "Cybernetic HUD Graph Visualization",
      },
    };
  }

  const outputHash = computeOutputHash({
    worker1: res.worker1,
    worker2: res.worker2,
  });

  return {
    ...res,
    outputHash,
  };
}

export async function POST(req: NextRequest) {
  let prompt = "";
  try {
    const body = await req.json().catch(() => ({}));
    prompt = body.prompt || "";
  } catch {
    prompt = "";
  }

  const taskId = generateTaskId();
  const startTime = Date.now();
  const getTimestamp = () => new Date().toISOString().substring(11, 23);

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || !prompt || prompt.trim().length === 0) {
    const fallback = getFallbackDeliverables(prompt || "Default Objective", taskId);
    // Register verified task in server store for Treasury gate
    getTaskStore().set(taskId, {
      taskId,
      directivePrompt: prompt || "Default Objective",
      outputHash: fallback.outputHash,
      createdAt: Date.now(),
      status: "verified",
      isLive: false,
      settledWorkers: { worker1: false, worker2: false },
      executionEvents: fallback.executionEvents,
    });
    return NextResponse.json(fallback);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const events: SwarmExecutionEvent[] = [];

    events.push({
      timestamp: getTimestamp(),
      agent: "Orchestrator",
      level: "step",
      message: `DAG Initialized for ${taskId}. Spawning parallel worker nodes.`,
    });

    events.push({
      timestamp: getTimestamp(),
      agent: "Orchestrator",
      level: "info",
      message: `Dispatched sub-tasks: Worker 1 (@scout-worker) and Worker 2 (@copy-agent).`,
    });

    // Milestone 3: Split into two separate Gemini calls with different specialized prompts!
    const worker1Promise = (async () => {
      const t0 = Date.now();
      events.push({
        timestamp: getTimestamp(),
        agent: "@scout-worker",
        level: "info",
        message: "Initiated data parsing & telemetry extraction via Gemini Flash 2.5...",
      });

      const worker1SystemPrompt = `You are @scout-worker.testnet, an autonomous data extraction and research agent in the SwarmPay network on NEAR.
Analyze this user bounty directive:
"${prompt}"

Produce structured research telemetry in valid JSON matching this schema:
{
  "deliverableTitle": "Specific deliverable name (e.g. 'Social Sentiment Matrix' or 'Cross-DEX Arbitrage Scan')",
  "stats": {
    "stat1Label": "Label like 'Records Scanned' or 'Posts Parsed'",
    "stat1Value": "Number string like '940'",
    "stat2Label": "Label like 'Confidence' or 'Sentiment'",
    "stat2Value": "Percentage string like '+84%'",
    "stat3Label": "Label like 'Throughput' or 'Latency'",
    "stat3Value": "Rate string like '18.4/s' or '45ms'"
  },
  "topicClusters": [
    { "tag": "#Keyword1", "count": 420 },
    { "tag": "#Keyword2", "count": 280 },
    { "tag": "#Keyword3", "count": 165 }
  ],
  "summary": "1-2 sentence executive technical findings summary."
}
Respond ONLY with valid JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: worker1SystemPrompt,
        config: { responseMimeType: "application/json" },
      });

      const elapsed = ((Date.now() - t0) / 1000).toFixed(2);
      const text = response.text?.trim() || "";
      const cleaned = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
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
          { tag: "#MicroBounty", count: 145 },
        ],
        summary: parsed.summary || "Data feed verified and signed.",
      };
    })();

    const worker2Promise = (async () => {
      const t0 = Date.now();
      events.push({
        timestamp: getTimestamp(),
        agent: "@copy-agent",
        level: "info",
        message: "Initiated synthesis, copywriting, and 4K prompt generation via Gemini Flash 2.5...",
      });

      const worker2SystemPrompt = `You are @copy-agent.testnet, an autonomous synthesis and creative agent in the SwarmPay network on NEAR.
Given this user directive:
"${prompt}"

Produce real marketing copy and a professional 4K visual generation prompt in valid JSON matching this schema:
{
  "taskTitle": "Short bounty headline (max 7 words)",
  "deliverableTitle": "Title of deliverable (e.g. 'Launch Campaign & 4K Hero Banner Specs')",
  "filename": "Filename string (e.g. 'launch_thread.md')",
  "copyHeadline": "Punchy headline with emoji (e.g. '⚡ NEAR SWARM ANNOUNCEMENT')",
  "copyBody": "High-quality, polished 2-3 paragraph marketing copy or thread fulfilling the directive.",
  "wordCount": 160,
  "readingTime": "45s",
  "designPrompt": "A detailed, professional Midjourney v6.1 / Flux 4K visual generation prompt with lighting, atmosphere, style and --ar 16:9 flag tailored specifically to this bounty.",
  "designStyle": "Art/visual style name (e.g. 'Cybernetic Futuristic Hologram 8K')"
}
Respond ONLY with valid JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: worker2SystemPrompt,
        config: { responseMimeType: "application/json" },
      });

      const elapsed = ((Date.now() - t0) / 1000).toFixed(2);
      const text = response.text?.trim() || "";
      const cleaned = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      const parsed = JSON.parse(cleaned);
      const sha256 = computeOutputHash(parsed);

      events.push({
        timestamp: getTimestamp(),
        agent: "@copy-agent",
        level: "success",
        message: `Synthesis complete in ${elapsed}s (${parsed.wordCount || 150} words). Design prompt ready.`,
      });

      return {
        taskTitle: parsed.taskTitle || "Autonomous Swarm Bounty",
        deliverableTitle: parsed.deliverableTitle || "Executive Synthesis & Brand Specs",
        runtime: `${elapsed}s`,
        sha256,
        filename: parsed.filename || "swarm_output.md",
        copyHeadline: parsed.copyHeadline || "⚡ SWARMPAY VERIFIED DELIVERABLE",
        copyBody: parsed.copyBody || "Synthesized deliverable generated by autonomous agent.",
        wordCount: parsed.wordCount || 140,
        readingTime: parsed.readingTime || "40s",
        designPrompt: parsed.designPrompt || "Minimalist high-tech holographic render 8k --ar 16:9",
        designStyle: parsed.designStyle || "Holographic Cyberpunk 8K",
      };
    })();

    // Run both worker agents in true parallel swarm execution
    const [worker1Result, worker2Result] = await Promise.all([
      worker1Promise,
      worker2Promise,
    ]);

    const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    // Cryptographic proof hash of the combined swarm outputs
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
      message: `DAG convergence achieved in ${totalElapsed}s. Root SHA-256 Proof: ${outputHash.slice(0, 16)}...`,
    });

    events.push({
      timestamp: getTimestamp(),
      agent: "Orchestrator",
      level: "success",
      message: `Task ${taskId} verified and locked in Agent Treasury Engine. Ready for payout release.`,
    });

    const responsePayload: DeliverablesResponse = {
      taskId,
      outputHash,
      isLive: true,
      taskTitle: worker2Result.taskTitle,
      executionEvents: events,
      worker1: worker1Result,
      worker2: worker2Result,
    };

    // Store verified task in server-side gate
    getTaskStore().set(taskId, {
      taskId,
      directivePrompt: prompt,
      outputHash,
      createdAt: Date.now(),
      status: "verified",
      isLive: true,
      settledWorkers: { worker1: false, worker2: false },
      executionEvents: events,
    });

    return NextResponse.json(responsePayload);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gemini call failed";
    console.warn("Gemini call failed, using fallback:", message);

    const fallback = getFallbackDeliverables(prompt, taskId);
    getTaskStore().set(taskId, {
      taskId,
      directivePrompt: prompt,
      outputHash: fallback.outputHash,
      createdAt: Date.now(),
      status: "verified",
      isLive: false,
      settledWorkers: { worker1: false, worker2: false },
      executionEvents: fallback.executionEvents,
    });

    return NextResponse.json(fallback);
  }
}
