import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, readdir, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import { RenderConfig } from "@/types";

const RENDERS_DIR = path.join(process.cwd(), "..", "Generated images");

async function ensureDir() {
  if (!existsSync(RENDERS_DIR)) {
    await mkdir(RENDERS_DIR, { recursive: true });
  }
}

interface SavedRender {
  id: string;
  imageFilename: string;
  config?: RenderConfig;
}

// GET — load all saved renders by scanning the folder
export async function GET() {
  await ensureDir();

  try {
    const files = await readdir(RENDERS_DIR);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));

    const renders: SavedRender[] = [];
    for (const jsonFile of jsonFiles) {
      try {
        const data = JSON.parse(await readFile(path.join(RENDERS_DIR, jsonFile), "utf-8"));
        const id = jsonFile.replace(".json", "");
        const imageFilename = data.imageFilename || `${id}.png`;
        // Verify image exists
        if (existsSync(path.join(RENDERS_DIR, imageFilename))) {
          renders.push({ id, imageFilename, config: data.config });
        }
      } catch { /* skip corrupt files */ }
    }

    return NextResponse.json({ renders });
  } catch {
    return NextResponse.json({ renders: [] });
  }
}

// POST — save a new render (base64 data URL) + config
export async function POST(request: NextRequest) {
  await ensureDir();

  const { id, imageUrl, config } = await request.json();

  // Extract base64 data
  const match = imageUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!match) {
    return NextResponse.json({ error: "Invalid image data" }, { status: 400 });
  }

  const ext = match[1] === "jpeg" ? "jpg" : match[1];
  const imageFilename = `${id}.${ext}`;
  const buffer = Buffer.from(match[2], "base64");

  // Write image file
  await writeFile(path.join(RENDERS_DIR, imageFilename), buffer);

  // Write metadata JSON alongside
  const metadata = { imageFilename, config, createdAt: new Date().toISOString() };
  await writeFile(path.join(RENDERS_DIR, `${id}.json`), JSON.stringify(metadata, null, 2));

  return NextResponse.json({ success: true, imageFilename });
}
