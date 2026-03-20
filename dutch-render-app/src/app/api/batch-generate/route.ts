import { NextResponse } from "next/server";
import { getBatchState, startBatchGeneration, cancelBatch, resumeBatchPolling } from "@/lib/batch-processor";

// GET — return current batch status, and resume polling if needed
export async function GET() {
  const state = await getBatchState();

  // If state says "polling" but the server restarted, resume polling
  if (state.status === "polling" && state.batchName) {
    resumeBatchPolling(state);
  }

  return NextResponse.json(state);
}

// POST — start a new batch of 50
export async function POST() {
  const state = await startBatchGeneration(50);
  return NextResponse.json(state);
}

// DELETE — cancel running batch
export async function DELETE() {
  await cancelBatch();
  return NextResponse.json({ cancelled: true });
}
