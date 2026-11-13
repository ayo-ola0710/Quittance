import { NextResponse } from "next/server";
import { connection } from "next/server";
import { getAgentsWithStats, selectPolicyWinner } from "@/lib/agentStore";

export async function GET() {
  await connection();
  const agents = await getAgentsWithStats();
  const winner = selectPolicyWinner(agents);

  return NextResponse.json({
    agents,
    policyWinnerId: winner?.id ?? null,
  });
}
