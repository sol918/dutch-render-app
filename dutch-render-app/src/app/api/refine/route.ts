import { NextRequest, NextResponse } from "next/server";
import { RenderConfig } from "@/types";
import { selectBaseImage } from "@/lib/image-selector";
import { refineRender, loadBaseImage } from "@/lib/gemini";
import { buildRefinePrompt } from "@/lib/refine-prompt";

interface RefineRequest {
  config: RenderConfig;
  renderImageUrl: string; // base64 data URL or API path
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: RefineRequest = await request.json();
    const { config, renderImageUrl } = body;

    // Load the grey massing base image
    const baseImage = selectBaseImage(config.geometry);
    const baseImageBase64 = await loadBaseImage(baseImage);

    // Extract base64 from the render image
    let renderBase64: string;
    if (renderImageUrl.startsWith("data:")) {
      // data URL — extract base64 part
      const match = renderImageUrl.match(/^data:image\/\w+;base64,(.+)$/);
      if (!match) throw new Error("Invalid render image data URL");
      renderBase64 = match[1];
    } else if (renderImageUrl.startsWith("/api/generated-image/")) {
      // Local file — fetch it from our own API
      const filename = renderImageUrl.replace("/api/generated-image/", "");
      const { readFile } = await import("fs/promises");
      const path = await import("path");
      const imagePath = path.join(process.cwd(), "..", "Generated images", filename);
      const buffer = await readFile(imagePath);
      renderBase64 = buffer.toString("base64");
    } else {
      throw new Error("Unsupported image URL format");
    }

    // Build the refine prompt
    const refinePrompt = buildRefinePrompt(config);

    // Call Gemini with both images
    const result = await refineRender(baseImageBase64, renderBase64, refinePrompt);

    if (result) {
      return NextResponse.json({ success: true, imageUrl: result });
    } else {
      return NextResponse.json(
        { success: false, error: "Verfijning mislukt — geen afbeelding ontvangen." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Refine error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    const status = message === "QUOTA_EXCEEDED" ? 429 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
