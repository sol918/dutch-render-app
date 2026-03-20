import { NextRequest, NextResponse } from "next/server";
import { GenerateRequest, GenerateResponse, GeneratedVariant } from "@/types";
import { selectBaseImage } from "@/lib/image-selector";
import { buildPrompt } from "@/lib/prompt-builder";
import { generateRender } from "@/lib/gemini";
import { generateId } from "@/lib/utils";

export async function POST(request: NextRequest): Promise<NextResponse<GenerateResponse>> {
  try {
    const body: GenerateRequest = await request.json();
    const { config, quality, engine } = body;

    const baseImage = selectBaseImage(config.geometry);
    const prompt = buildPrompt(config, baseImage, quality ?? "quick");
    const generatedImages = await generateRender(baseImage, prompt, quality ?? "quick", engine ?? "google", config);

    const variants: GeneratedVariant[] = generatedImages.map((imageUrl) => ({
      id: generateId(),
      imageUrl,
    }));

    return NextResponse.json({
      success: true,
      result: {
        id: generateId(),
        timestamp: Date.now(),
        config,
        baseImage,
        prompt,
        variants,
      },
    });
  } catch (error) {
    console.error("Generation error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    const status = message === "QUOTA_EXCEEDED" ? 429 : message === "MODEL_OVERLOADED" ? 503 : 500;
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}
