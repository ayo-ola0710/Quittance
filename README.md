# Quittance

> Post a task. Agents are listed at a price, and the cheapest qualified writer is picked. A rule-based verifier checks their work. We pay for verified work in NEAR, with a transaction link on the receipt. Failed work is paid 0 NEAR, and the agent loses reputation.

## Submission details

| Field              | Detail                               |
| ------------------ | ------------------------------------ |
| Project            | Quittance                            |
| Event              | NEAR HACKATHON, November 2026        |
| Tracks             | `agents`, `swarms`, `security`       |
| Development window | 2026-11-01 to 2026-11-14             |
| Network            | NEAR testnet (native transfers)      |
| Hosted preview     | https://quittance-pink.vercel.app/   |
| License            | MIT, see [`LICENSE`](./LICENSE)      |

## The problem

When an agent is paid just because its script finished, empty, truncated, or off-topic output still triggers a payment, and unreliable agents keep getting work. Quittance puts a verification step and a reputation record between the agent's output and the payment.

## What it does

1. **Define a task** (`/create-task`). The user writes a directive and a budget.
2. **Price ladder.** Four copywriter agents are listed at fixed prices (`src/data/agents.json`). The copywriter slot goes to the lowest-priced agent with a reputation above 95. If none clears that bar, the highest-reputation copywriter is used. A scout agent is fixed at 0.03 NEAR. The four verification rules are listed before any work runs.
3. **Agents run** (`POST /api/deliverables`). The scout and the selected writer run in parallel through Gemini (or a deterministic fallback when no key is set). Each output is checked against the four rules and hashed with SHA-256. A hash of the rule set (`rulesHash`) is stored with the task.
4. **Verifier-gated payment** (`POST /api/settle`). The server refuses to pay a worker whose output did not pass (HTTP 422) and refuses to pay the same worker twice (HTTP 409). For a passing worker, it signs a native NEAR `transfer` with `near-api-js`. If the transfer fails, the task is unlocked so it can be retried.
5. **Reputation.** A passing, paid worker gains 1 reputation point. A failed one is paid 0 NEAR and loses 5 points. Scores are stored in `data/agent-stats.json`. A writer that drops to 95 or below is no longer eligible, so the next task goes to the next qualified writer.
6. **Receipt** (`/receipt/[taskId]`). Each task has a stored receipt with the rules hash, the output hashes, the per-check results, the output source (Gemini or fallback), and links to the NearBlocks transactions.

## How NEAR is used

- Payments are native NEAR testnet transfers (`actions.transfer`) signed by the server with `near-api-js`.
- Each paid transaction hash is shown in the app and links to `testnet.nearblocks.io`.
- Payout accounts: each writer agent has a `payoutAccount` in `src/data/agents.json`, and the scout is paid to `WORKER_SCOUT_ACCOUNT_ID` when set. The catalog handles shown in the UI (for example, `@copy-agent.testnet`) are display names. By default, payouts go to two testnet accounts controlled by the team: `isreel-copy.testnet` and `isreel-design.testnet`.
- Not used: smart contracts, escrow, NEAR Intents.

## Flow

```text
Define task
   -> GET /api/agents          price ladder, lowest-priced writer with reputation > 95
   -> POST /api/deliverables   scout + writer run, 4 rules checked, SHA-256 hashes, rulesHash stored
        -> pass: eligible for payment
        -> fail: 0 NEAR, writer reputation -5
   -> POST /api/settle         422 if not verified, 409 if already paid
                               otherwise, near-api-js transfer on testnet
   -> /receipt/[taskId]        stores the receipt with hashes, check results, and NearBlocks links
```

## Try it: do X, see Y

### Test 1: verified work is paid

1. Open `/` and click **Create task** (or go to `/create-task`).
   You see the task form with a preset directive and a budget field.
2. Click **Inspect bids & assign agents**.
   You see the price ladder. BudgetWriter v1.0 (0.03 NEAR, reputation 88) is marked Eliminated. CopyAgent v2.1 (0.05 NEAR, reputation 98) is selected as the lowest-priced qualified writer.
3. Click **Run Agents Now (0.08 NEAR)**.
   You see a scout deliverable and a writer deliverable, each with four check results and a PASSED status.
4. Click **Pay Verified Agents (0.08 NEAR)**.
   You see a NEAR transaction hash for each paid worker, linking to NearBlocks.
5. Click **Open Receipt Page**.
   You see the rules hash, output hashes, per-check results, the output source, and the transaction links.

### Test 2: a bad worker is rejected, paid nothing, and slashed

1. On Stage 3, tick **Test Rejection (Simulate Bad Agent)** and run the agents.
   The writer returns the fixed draft: `Draft error: missing data. Pipeline interrupted before synthesis.`
2. Inspect the writer card.
   You see REJECTED and "Payout Blocked (0 NEAR Paid)". The draft fails the minimum-length rule (under 120 characters) and the completeness rule (it contains `error:`), so at most 2 of 4 checks pass and the score is 50% or lower. The scout, which passed, is not affected.
3. Check the writer's reputation.
   CopyAgent goes from 98 to 93.
4. Click **New Task** and go to Stage 2.
   CopyAgent is now eliminated, and NeuralScribe AI (0.06 NEAR, reputation 96) is selected.
5. Open `/agent-registry` and click **Reset Reputations**.
   Reputations and counters return to the starting values.

## Verification rules

Rule definitions are in `src/types/types.ts` (`VERIFICATION_RULES`). Scoring is in `src/lib/taskStore.ts` (`evaluateDeliverable`).

| Rule id                | What is checked                                                                     |
| ---------------------- | ----------------------------------------------------------------------------------- |
| `min-length`           | More than 120 characters for the writer, more than 80 for the scout.                |
| `prompt-keywords`      | At least one word from the directive (longer than 3 letters) appears in the output. |
| `structured-sections`  | The output contains a line break, `#`, `:,` or `.`.                                  |
| `complete-deliverable` | The output does not contain `error:`, `incomplete`, `corrupted` or `truncated`.     |

A deliverable passes when its score is 75% or higher, that is, at least 3 of the 4 checks. This verifier is deliberately simple. It checks length, keyword presence, basic structure, and error markers. It does not judge whether the content is accurate or good.

## API

| Method | Endpoint                   | Purpose                                                                                       |
| ------ | -------------------------- | --------------------------------------------------------------------------------------------- |
| GET    | `/api/account`             | Manages account balance from the NEAR RPC, or "unavailable".                                  |
| GET    | `/api/agents`              | Catalog agents with prices, reputation, completed and slashed counts, and the current winner. |
| POST   | `/api/agents/reset`        | Restore starting reputations and counters.                                                    |
| POST   | `/api/deliverables`        | Run the scout and writer, check the rules, hash the outputs, create the task.                 |
| POST   | `/api/settle`              | Pay verified workers (422 if not verified, 409 if already paid).                              |
| GET    | `/api/receipt?taskId={id}` | The stored receipt. Returns 404 for an unknown task.                                          |
| GET    | `/api/tasks`               | Task history, used by the ledger page.                                                        |

## Disclosures and known limits

- **Funds and custody.** Payments come from a manager wallet and are released when the verifier passes. There is no escrow contract.
- **Receipts and reputation are not on-chain.** They are JSON files under `data/` (`tasks.json`, `agent-stats.json`). Only the payment transaction is on-chain.
- **Run it locally.** The JSON files need a writable disk, so serverless hosts such as Vercel will not persist them. Any hosted link is a preview. A VPS or container with a disk works.
- **Fixtures.** Agent prices, starting reputations, and the displayed latency or SLA text are demo fixtures in `src/data/agents.json`. The Sample log modal is a labelled playback fixture.
- **Worker outputs.** With `GEMINI_API_KEY` set, outputs come from Gemini. Figures in the scout's output, such as keyword counts, are generated by the model and are not measured from real data. Without a key, a fixed fallback output is used, and the receipt says `Output source: fallback`.
- **Simulated bad worker.** The rejection test uses a fixed bad draft. It is rejected by the verifier rules above.
- **No auth or rate limiting** on the API endpoints. Demo only.
- **Team accounts.** `isreel-copy.testnet` and `isreel-design.testnet` are testnet accounts controlled by the team. No code originates from prior projects; all project code was created during the hackathon window (2026-11-01 to 2026-11-14).
- **Libraries.** Next.js 16, React 19, `near-api-js`, `@google/genai`, Tailwind CSS, `lucide-react`, `canvas-confetti`.
- **AI tools used in development.** Google Antigravity (DeepMind agentic coding assistant) for pair programming, architectural implementation, verifier gate testing, and NEAR testnet RPC micro-settlement integration.

## Setup

Requires Node.js 20 or newer and npm.

```bash
git clone https://github.com/ayo-ola0710/Quittance.git
cd Quittance
npm install
```

Create `.env.local` (see `.env.example`):

```env
# Required: a NEAR testnet account with some testnet NEAR (a faucet works) that signs payments.
MANAGER_ACCOUNT_ID="your-account.testnet"
MANAGER_PRIVATE_KEY="ed25519:..."

# Optional
WORKER_SCOUT_ACCOUNT_ID=""   # testnet account that receives the scout payout
NEAR_NODE_URL=""             # defaults to https://rpc.testnet.near.org
GEMINI_API_KEY=""            # without it, the deterministic fallback output is used
```

Then run:

```bash
npm run build
npm run dev
```

Open http://localhost:3000. Each task costs about 0.08 NEAR, so fund the manager account with a few testnet NEAR. The payout accounts in `src/data/agents.json` must exist on testnet. To see funds arrive in your own wallets, replace the `payoutAccount` values with accounts you control.

Or view the live URL

```bash
https://quittance-pink.vercel.app/
```

## License

MIT, see [`LICENSE`](./LICENSE).
