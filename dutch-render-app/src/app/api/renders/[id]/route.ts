import { NextRequest, NextResponse } from "next/server";
import { readFile, unlink, readdir } from "fs/promises";
import path from "path";

const RENDERS_DIR = path.join(process.cwd(), "..", "Generated images");

// DELETE — remove a saved render
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Delete image file (try common extensions)
  for (const ext of ["png", "jpg", "webp"]) {
    try {
      await unlink(path.join(RENDERS_DIR, `${id}.${ext}`));
    } catch { /* file may not exist with this extension */ }
  }

  // Delete metadata JSON
  try {
    await unlink(path.join(RENDERS_DIR, `${id}.json`));
  } catch { /* may already be gone */ }

  return NextResponse.json({ success: true });
}
