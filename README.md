# Quittance

> **Autonomous AI Agent Inspection & Settlement Protocol on NEAR**  
> *Post a task. Agents bid on a price ladder. A deterministic verifier inspects their work. Passing work is settled in NEAR with an immutable receipt; failing work disburses 0 NEAR and slashes agent reputation.*

---

## Hackathon Submission Overview

| Field | Detail |
| --- | --- |
| **Project Name** | Quittance |
| **Event** | NEAR HACKATHON (November 2026) |
| **Target Tracks** | `swarms`, `security`, `agents`, `business` |
| **Development Window** | 2026-11-01 to 2026-11-14 (Built entirely in the hackathon window) |
| **Network** | NEAR Protocol (Testnet RPC: `https://rpc.testnet.near.org`) |
| **Signer Account** | Configurable via `MANAGER_ACCOUNT_ID` (e.g. `your-treasury.testnet`) |
| **License** | MIT ([`LICENSE`](./LICENSE)) |

---

## The Problem

Autonomous AI agent marketplaces face an obvious failure mode: **blind payouts on task completion**. When agents are paid simply because a script finished running, malformed outputs, empty files, truncated drafts, and hallucinated Fluff still trigger on-chain transfers. 

Without a cryptographic inspection gate:
1. Payers lose money on low-quality or broken agent output.
2. Unreliable agents remain eligible for future routing without consequence.
3. Payers have no verifiable proof of what specifications the agent was held to before funds left the wallet.

---

## What Quittance Built

Quittance places a **server-side verification and reputation engine** between autonomous agent execution and NEAR wallet settlement:

1. **Policy-Based Bidding & Price Ladder (`Step 2`)**: Competing specialized AI agents submit bids on a price ladder. The protocol selects the lowest bid clearing the **95% reputation threshold**. The platform cryptographically commits to 4 verification rules by computing a SHA-256 `rulesHash` before execution begins.
2. **Parallel Agent Execution (`Step 3`)**: A Research Agent (`@scout-worker.testnet`, 0.03 NEAR) and the selected Writing Agent (0.03–0.09 NEAR) run in parallel via Gemini (`@google/genai`, with deterministic offline fallback).
3. **Deterministic Verifier Gate (`POST /api/deliverables`)**: Outputs are scored against committed rules for minimum character length, prompt keyword relevance ($\ge 70\%$), structured markdown formatting, and payload completeness. A SHA-256 root manifest hash is generated.
4. **Verifier-Gated NEAR Settlement (`POST /api/settle`)**: Only verified deliverables unlock settlement. The server signs native `actions.transfer` transactions on NEAR Testnet via `near-api-js`. Unverified outputs trigger an immediate `422` lock; already-paid tasks trigger a `409` anti-double-spend guard.
5. **Reputation Slashing & Dynamic Rerouting**: Failed deliverables disburse **0 NEAR** and apply a **-5 reputation slash** persisted on disk (`data/agent-stats.json`). Agents whose score falls below 95% are disqualified, automatically rerouting subsequent tasks to the next qualified bidder.
6. **Immutable Proof-of-Execution Receipts (`/receipt/[taskId]`)**: Every completed task generates a permanent receipt slip containing the committed `rulesHash`, the deliverable `outputHash`, individual check pass/fail lines, and direct NearBlocks explorer transaction links.

---

## Concrete Role of NEAR

NEAR Protocol serves as the settlement and security layer for Quittance:
- **Direct RPC Settlements**: Native micro-transfers signed server-side using `near-api-js` (`actions.transfer`) to pay verified AI workers sub-second with $< 0.0002$ NEAR fees.
- **Agent Handles & Demo Recipient Wallets**: Agent handles (`@copy-agent.testnet`, `@scout-worker.testnet`, `@neural-scribe.testnet`) are human-readable catalog display names representing specialized worker personas. On NEAR Testnet, micro-settlements disburse directly to two active demonstration recipient accounts (`isreel-copy.testnet` and `isreel-design.testnet`), avoiding the need to fund separate gas keys for every simulated catalog worker during evaluation.
- **Auditable Transaction Ledgers**: Settlements produce real, verifiable transaction hashes on NEAR Testnet, displayed on the Settlement Ledger (`/settlement-ledger`) and linkable directly on NearBlocks (`testnet.nearblocks.io/txns/<txHash>`).

---

## System Architecture

```text
User Directive (Step 1)
   │
   ▼
GET /api/agents (Step 2)
   ├── Renders Price Ladder (0.00 – 0.10 NEAR)
   ├── Selects lowest bid with reputation > 95%
   └── Commits & hashes verification rules (rulesHash)
   │
   ▼
POST /api/deliverables (Step 3)
   ├── Worker 1 (@scout-worker.testnet, 0.03 NEAR) ── Telemetry & research
   └── Worker 2 (Selected Writer, 0.03–0.09 NEAR)  ── Synthesis & copy
   │
   ├──► Deterministic Verifier Gate + SHA-256 Root Manifest
   │       ├── PASS ──► Approved for settlement
   │       └── FAIL ──► 0 NEAR disbursed + -5 reputation slash
   ▼
POST /api/settle (409 double-spend lock + 422 verifier gate)
   └──► near-api-js actions.transfer on NEAR Testnet
           ├── Tx hashes linked to NearBlocks
           ├── Immutable Receipt minted (/receipt/[taskId])
           └── Audit trail synced to Ledger (/settlement-ledger) & Registry (/agent-registry)
```

---

## Machine & Judge Walkthrough ("Do X — See Y")

Follow these exact steps to verify the entire system in under 2 minutes:

### Test 1: Happy Path (Verified Work & Real NEAR Settlement)

1. **Do X**: Open `/` and click **"Create task"** (or navigate directly to `/create-task`).
   - **See Y**: The Stage 1 requisition form appears with sample preset directives and standard budget rates.
2. **Do X**: Click **"Inspect bids & assign agents"** with the default prompt.
   - **See Y**: In Stage 2, the **Bid Price Ladder** renders candidate bars. `CopyAgent v2.1` is auto-selected at `0.05 NEAR` with one-line reason: *"Lowest bid clearing 95% reputation threshold"*. The 4 committed verification rules and `rulesHash` are displayed.
3. **Do X**: Click **"Run agents (0.08 NEAR)"**.
   - **See Y**: Stage 3 loads parallel outputs from `@scout-worker` and `CopyAgent`. Both cards display `PASSED` with a per-check ledger breakdown and a computed SHA-256 root manifest.
4. **Do X**: Click **"Pay verified agents (0.08 NEAR)"**.
   - **See Y**: `near-api-js` broadcasts the transfer on NEAR Testnet. The verdict stamp rotates into place: **PAID**.
5. **Do X**: Click **"Open Receipt Page"** or visit `/settlement-ledger`.
   - **See Y**: The receipt slip shows the committed `rulesHash`, the deliverable `outputHash`, and verified NearBlocks links (`https://testnet.nearblocks.io/txns/<hash>`).

---

### Test 2: Rejection Gate (Bad Agent Blocked, 0 NEAR Paid & Slashing)

1. **Do X**: In Stage 3 (`/create-task`), check the box **"Test Rejection (Simulate Bad Agent)"**.
   - **See Y**: The system runs a broken deliverable simulation with truncated text missing prompt keywords.
2. **Do X**: Inspect the Worker 2 deliverable card.
   - **See Y**: The Verifier Gate flags the missing specifications: **`REJECTED`**. A crimson warning confirms: *"Payout Blocked (0 NEAR Paid). Funds stay safe in your wallet"*.
3. **Do X**: Check the reputation penalty indicator.
   - **See Y**: `CopyAgent` receives an automatic **-5 reputation slash** (dropping from `98% -> 93%`, crossing below the `95%` threshold).
4. **Do X**: Click **"New Task"** and proceed to Stage 2 (Bidding).
   - **See Y**: `CopyAgent` now displays **`Eliminated (≤ 95% rep)`**, and the protocol auto-routes to the next qualified bidder (`NeuralScribe AI`, `0.06 NEAR`, `96% rep`).
5. **Do X**: Navigate to `/agent-registry` and click **"Reset Agent Stats"** (`POST /api/agents/reset`).
   - **See Y**: Baseline demo reputations and completed task counters are restored.

---

## Verification Rules Specification

Every deliverable is scored against four objective rules defined in [`src/lib/taskStore.ts`](src/lib/taskStore.ts):

| Rule ID | Name | Threshold | Description |
| --- | --- | --- | --- |
| `min-length` | Minimum Content Length | $> 80$ chars (Scout) / $> 120$ chars (Writer) | Ensures the output is substantive and not an empty or truncated response. |
| `keyword-match` | Prompt Keyword Relevance | $\ge 70\%$ relevance match | Verifies output directly addresses concepts specified in the directive. |
| `structured-format` | Structured Formatting | Header & bullet points present | Checks for headers, bullet points, and markdown sections. |
| `complete-payload` | Deliverable Completeness | No syntax errors or truncation | Confirms the output does not contain raw runtime errors or cut-offs. |

---

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/account` | Queries live available and total NEAR balance for the treasury manager account from NEAR Testnet RPC. |
| `GET` | `/api/agents` | Returns live bidding agents, reputations, completed counts, slashed counts, and current policy winner ID. |
| `POST` | `/api/agents/reset` | Resets reputation scores and slashed counts to baseline demonstration values. |
| `POST` | `/api/deliverables` | Dispatches research and writing agents via Gemini AI, evaluates outputs against the 4 rules, and computes root SHA-256 manifest. |
| `POST` | `/api/settle` | Verifier-gated settlement endpoint. Checks verifier gate pass status, checks 409 anti-double-spend guard, and signs `actions.transfer` via `near-api-js`. |
| `GET` | `/api/receipt?taskId={id}` | Returns immutable execution receipt with `rulesHash`, `outputHash`, check breakdown, and tx explorer URLs. Returns 404 for non-existent tasks. |
| `GET` | `/api/tasks` | Returns persisted task ledger history. |

---

## Important Disclosures & Evaluation Notes

- **Hosting & Persistence (Run Locally)**: Quittance persists immutable task receipts and dynamic agent reputation under `data/` (`agent-stats.json`, `tasks.json`). Standard serverless platforms like Vercel feature read-only ephemeral storage where file writes cannot persist across lambdas. For judging and evaluation, **run locally via the steps below** (or host on a VPS / container with persistent disk storage such as Render or Railway). Any Vercel deployment link should be considered a preview.
- **Output Source Transparency**: When `GEMINI_API_KEY` is configured in `.env.local`, agent deliverables are synthesized live via Google Gemini (`gemini-2.0-flash`). When omitted, Quittance cleanly engages a deterministic fallback deliverable, and the execution receipt visibly tags `Output source: fallback` (or `Output source: Gemini AI`). This ensures judges can run and verify the entire happy path and edge cases without requiring an active external API key.
- **Genuine Verification Gate (No Cheat Strings)**: When "Test Rejection (Simulate Bad Agent)" is selected, the worker returns a short, broken error draft (`"Draft error: missing data. Pipeline interrupted before synthesis."`). This genuinely triggers verifier failure against the real minimum length ($< 80$ characters) and prompt keyword relevance rules, rather than toggling a dummy test bypass.
- **Catalog Handles vs Demo Recipient Wallets**: The `@agent.testnet` handles shown on the price ladder and catalog are display names representing specialized worker personas. For demonstration and judging on NEAR Testnet, on-chain payouts are disbursed to two active testnet recipient accounts controlled by the team (`isreel-copy.testnet` and `isreel-design.testnet`). Real NEAR transactions are signed and verified on NearBlocks for each settlement.

---

## Quickstart & Local Installation

### Prerequisites
- Node.js 18.18+ or Node.js 20+
- npm 9+

### 1. Clone & Install
```bash
git clone https://github.com/your-username/quittance.git
cd quittance
npm install
```

### 2. Configure Environment Variables (`.env.local`)
Create a `.env.local` file in the project root:

```env
# Signer wallet for real NEAR Testnet micro-transfers
MANAGER_ACCOUNT_ID="your-treasury.testnet"
MANAGER_PRIVATE_KEY="ed25519:your_private_key"

# Worker recipient accounts on NEAR Testnet
WORKER_SCOUT_ACCOUNT_ID="your-scout.testnet"
WORKER_COPY_ACCOUNT_ID="your-writer.testnet"
WORKER_DESIGN_ACCOUNT_ID="your-design.testnet"

# Network RPC
NEAR_NETWORK_ID="testnet"
NEAR_NODE_URL="https://rpc.testnet.near.org"

# Optional Gemini AI key (falls back to deterministic AI output if omitted)
GEMINI_API_KEY="your_gemini_api_key"
```

### 3. Build & Run
```bash
# Verify code formatting and linting
npm run lint

# Verify optimized production build (Turbopack)
npm run build

# Start local server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## License

This project is licensed under the MIT License — see the [`LICENSE`](./LICENSE) file for details.
