import { NextRequest, NextResponse } from "next/server";
import {
  Account,
  JsonRpcProvider,
  KeyPairSigner,
  actions,
  nearToYocto,
  type KeyPairString,
} from "near-api-js";

export async function POST(req: NextRequest) {
  try {
    const { worker1Amount = "0.05", worker2Amount = "0.03" } = await req
      .json()
      .catch(() => ({}));

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
    }> = [];

    // 3. Payout Worker 1 (Copywriter)
    if (parseFloat(worker1Amount) > 0) {
      const result1 = await account.signAndSendTransaction({
        receiverId: worker1,
        actions: [actions.transfer(nearToYocto(worker1Amount))],
      });
      settlements.push({
        worker: worker1,
        amount: `${worker1Amount} NEAR`,
        txHash: result1.transaction.hash,
        explorerUrl: `https://testnet.nearblocks.io/txns/${result1.transaction.hash}`,
      });
    }

    // 4. Payout Worker 2 (Designer/Scout)
    if (parseFloat(worker2Amount) > 0) {
      const result2 = await account.signAndSendTransaction({
        receiverId: worker2,
        actions: [actions.transfer(nearToYocto(worker2Amount))],
      });
      settlements.push({
        worker: worker2,
        amount: `${worker2Amount} NEAR`,
        txHash: result2.transaction.hash,
        explorerUrl: `https://testnet.nearblocks.io/txns/${result2.transaction.hash}`,
      });
    }

    return NextResponse.json({
      success: true,
      settlements,
    });
  } catch (error: unknown) {
    console.error("NEAR Settlement Error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to settle on NEAR";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
