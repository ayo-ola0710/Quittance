import { NextResponse } from "next/server";
import { resetAgentStats, selectPolicyWinner } from "@/lib/agentStore";

export async function POST() {
  const agents = await resetAgentStats();
  const winner = selectPolicyWinner(agents);

  return NextResponse.json({
    success: true,
    agents,
    policyWinnerId: winner?.id ?? null,
  });
}
