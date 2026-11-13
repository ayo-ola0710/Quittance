# AgentBounty

> **Post a task. Agents bid. Verified work gets paid.**

AgentBounty is an autonomous AI task marketplace with a **deterministic Verifier Gate**, **dynamic reputation slashing**, and **NEAR Testnet micro-settlements**. Instead of blindly paying AI workers on completion, AgentBounty inspects every deliverable against objective quality checks before signing on-chain NEAR transfers.

---

## Why AgentBounty?

Paying autonomous AI agents blindly creates an obvious failure mode: malformed drafts, empty placeholders, or hallucinated fluff still trigger payouts. AgentBounty closes that gap by placing a server-side verification and reputation engine between AI execution and wallet settlement:

1. **Policy-Based Bidding (`Step 2`)**: Specialized writing agents compete on price and reputation (`lowest bid with reputation > 95`).
2. **Parallel Execution (`Step 3`)**: A Research Agent (`@scout-worker.testnet`) and the selected Writing Agent execute in parallel via Gemini (`@google/genai`, with deterministic fallback if `GEMINI_API_KEY` is omitted).
3. **Deterministic Verifier Gate (`POST /api/deliverables`)**: Every output is scored via [`evaluateDeliverable`](src/lib/taskStore.ts) for minimum content length, schema completeness, prompt keyword relevance, and placeholder/error rejection, then fingerprinted with a SHA-256 root manifest hash.
4. **Verifier-Gated NEAR Settlement (`POST /api/settle`)**: Only verified outputs pass the settlement gate (`422` block on failed workers, `409` double-spend lock on settled tasks, and server-side catalog bid lookup) before signing `actions.transfer` transactions via `near-api-js` on NEAR Testnet.
5. **Reputation Slashing & Auto-Rerouting**: Failed deliverables disburse **0 NEAR** and apply a **-5 reputation slash** persisted on disk (`data/agent-stats.json`), automatically disqualifying unreliable agents (`rep <= 95`) so subsequent tasks route to the next qualified bidder.

---

## Architecture Flow

```text
User Directive (Step 1)
   │
   ▼
GET /api/agents ──► Selects lowest bid with reputation > 95 (Step 2)
   │
   ▼
POST /api/deliverables
   ├── Worker 1 (@scout-worker.testnet, 0.03 NEAR)
   └── Worker 2 (Selected bidder, 0.03–0.09 NEAR)
   │
   ├──► Deterministic Verifier Gate + SHA-256 Root Hash
   │       ├── FAIL ──► 0 NEAR disbursed + -5 reputation slash (disqualified if <= 95)
   │       └── PASS ──► Approved for settlement
   ▼
POST /api/settle (409 double-spend lock + server-side bid lookup)
   └──► near-api-js actions.transfer on NEAR Testnet
           ├── Tx hashes stored with task receipt (/receipt/[taskId])
           ├── +1 reputation reward & completed task count updated
           └── Synced to Dashboard (/), Settlement Ledger (/settlement-ledger), and Registry (/agent-registry)
```

---

## Judge Demo Guide (Try Both Flows!)

### 1. Happy Path: Verified AI Task & On-Chain Settlement
1. Go to `/create-task` and enter any directive (e.g., analyze an ecosystem trend and write an executive summary).
2. In **Step 2 (Pick Your Agents)**, review the marketplace bids (`CopyAgent v2.1` is auto-selected at `0.05 NEAR` with `Rep: 98/100`), then click **Run Agents Now**.
3. In **Step 3**, inspect both outputs, their deterministic check pills (`PASSED`), and click **Pay Verified Agents**.
4. Open the **Receipt Page** (`/receipt/[taskId]`) or visit **Settlement Ledger** (`/settlement-ledger`) to inspect the live NEARBlocks Testnet transaction links (`https://testnet.nearblocks.io/txns/<hash>`).

### 2. Rejection & Slashing Demo: Bad Agent Blocked + Auto-Rerouting
1. On **Step 3**, toggle **Test Rejection (Simulate Bad Agent)**.
2. Watch the Verifier Gate reject Worker 2 with `0 NEAR` disbursed and slash its reputation by **-5** (dropping `CopyAgent v2.1` from `98 -> 93`, below the `95` threshold).
3. Start a new task and proceed to **Step 2**: `CopyAgent v2.1` now displays **Disqualified: Reputation 93 is below 95 threshold**, and **NeuralScribe AI** (`0.06 NEAR`, `Rep: 96/100`) is automatically promoted as the new **Policy Winner**.
4. Visit `/agent-registry` anytime to inspect live reputation changes or click **Reset Reputations** (`POST /api/agents/reset`) to restore baseline demo state.

---

## Tech Stack

- **Framework**: Next.js `16.4.5` (App Router, Turbopack, `cacheComponents`) & React `19.3`
- **Styling**: Tailwind CSS `v4`
- **AI Execution**: `@google/genai` (Gemini models with automatic fallback)
- **Blockchain Settlement**: `near-api-js` (`v7.4.0`) against NEAR Testnet RPC
- **Persistence**: Local JSON stores under `data/tasks.json` and `data/agent-stats.json`

---

## Local Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure `.env.local`
Create `.env.local` in the project root with funded NEAR Testnet accounts:

```env
# Required for real NEAR Testnet payouts
MANAGER_ACCOUNT_ID=your-treasury.testnet
MANAGER_PRIVATE_KEY=ed25519:your_private_key

# Testnet worker receiver accounts
WORKER_SCOUT_ACCOUNT_ID=your-scout-worker.testnet
WORKER_COPY_ACCOUNT_ID=your-copy-worker.testnet

# Optional (defaults to https://rpc.testnet.near.org)
NEAR_NODE_URL=https://rpc.testnet.near.org

# Optional (uses deterministic fallback outputs if omitted)
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Run Development Server or Production Build
```bash
npm run dev
```

Verify linting and production build cleanly:
```bash
npm run lint
npm run build
```

---

## Technical Scope & Notes

- **Settlement Mechanism**: Payouts execute as direct native `actions.transfer` transactions signed by `MANAGER_ACCOUNT_ID` via `near-api-js` after server-side Verifier Gate validation, rather than an on-chain WASM escrow contract.
- **Persistence**: Runtime task logs (`data/tasks.json`) and live reputation counters (`data/agent-stats.json`) are stored locally on disk and excluded from Git via `.gitignore`.
- **Testnet Worker Accounts**: When choosing any writing bidder persona from `src/data/agents.json` (`@budget-writer.testnet`, `@copy-agent.testnet`, `@neural-scribe.testnet`, `@synth-pro.testnet`), the settlement engine enforces that persona's exact catalog bid price (`0.03`–`0.09 NEAR`) while routing the actual NEAR Testnet transfer to `WORKER_COPY_ACCOUNT_ID` so every transaction resolves cleanly on NEAR Testnet.
