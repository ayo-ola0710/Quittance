import { NextRequest, NextResponse } from "next/server";
import { Account, JsonRpcProvider, formatNearAmount } from "near-api-js";

export async function GET(req: NextRequest) {
  // Accessing searchParams marks the route dynamic under Next.js 16 cacheComponents
  const url = req.nextUrl;
  const accountId =
    url.searchParams.get("accountId") ||
    process.env.MANAGER_ACCOUNT_ID ||
    "quittance-treasury.testnet";
  const nodeUrl = process.env.NEAR_NODE_URL || "https://rpc.testnet.near.org";

  try {
    const provider = new JsonRpcProvider({ url: nodeUrl });
    const account = new Account(accountId, provider);
    const state = await account.getState();
    const availableNear = formatNearAmount(state.balance.available.toString(), 2);
    const totalNear = formatNearAmount(state.balance.total.toString(), 2);

    return NextResponse.json({
      accountId,
      balance: `${availableNear} NEAR`,
      totalBalance: `${totalNear} NEAR`,
      rawYocto: state.balance.available.toString(),
      storageUsage: state.storageUsage,
      isLive: true,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to query NEAR account";
    console.warn("Could not fetch live NEAR balance:", message);
    return NextResponse.json({
      accountId,
      balance: "unavailable",
      totalBalance: "unavailable",
      isLive: false,
    });
  }
}
