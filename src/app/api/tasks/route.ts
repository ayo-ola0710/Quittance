import { connection, NextResponse } from "next/server";
import { getTaskStore } from "@/lib/taskStore";

export async function GET() {
  await connection();
  const store = getTaskStore();
  const tasks = Array.from(store.values()).sort((a, b) => b.createdAt - a.createdAt);

  return NextResponse.json({
    tasks,
  });
}
