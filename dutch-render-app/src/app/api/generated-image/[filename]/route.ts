import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

const RENDERS_DIR = path.join(process.cwd(), "..", "Generated images");

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const filePath = path.join(RENDERS_DIR, filename);

  if (!existsSync(filePath)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const buffer = await readFile(filePath);
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
  };

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": mimeTypes[ext] || "image/png",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
