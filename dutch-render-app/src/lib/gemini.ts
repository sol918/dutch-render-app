import { readFile } from "fs/promises";
import path from "path";
import { GreyVolumeImage, RenderConfig, RenderEngine, RenderQuality } from "@/types";
import { STYLE_CONFIGS } from "@/config/styles";
import { FLOORLINE_CONFIGS } from "@/config/floorline";
import { GUTTER_CONFIGS } from "@/config/gutters";
import { FEATURE_CONFIGS } from "@/config/options";

function getProvider(): "gemini" | "pollinations" {
  return (process.env.IMAGE_PROVIDER as "gemini" | "pollinations") || "pollinations";
}

// ─── Gemini (Google Render) ───

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const MODEL_QUICK = "gemini-2.5-flash-image";
const MODEL_HQ = "gemini-3.1-flash-image-preview";

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
        inlineData?: {
          mimeType: string;
          data: string;
        };
      }>;
    };
  }>;
  error?: { message: string };
}

async function loadBaseImage(image: GreyVolumeImage): Promise<string> {
  const imagePath = path.join(process.cwd(), "..", "Images", image.fileName);
  const buffer = await readFile(imagePath);
  return buffer.toString("base64");
}

async function callGeminiOnce(
  apiKey: string,
  imageBase64: string,
  prompt: string,
  model: string
): Promise<string | null> {
  const url = `${GEMINI_BASE_URL}/${model}:generateContent?key=${apiKey}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120_000);

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: controller.signal,
    body: JSON.stringify({
      contents: [{
        parts: [
          { inlineData: { mimeType: "image/png", data: imageBase64 } },
          { text: prompt },
        ],
      }],
      generationConfig: {
        responseModalities: ["IMAGE", "TEXT"],
      },
    }),
  }).finally(() => clearTimeout(timeout));

  if (!response.ok) {
    if (response.status === 429) throw new Error("QUOTA_EXCEEDED");
    if (response.status === 503) throw new Error("MODEL_OVERLOADED");
    const errorText = await response.text();
    console.warn(`[Gemini] API error (${response.status}):`, errorText.substring(0, 200));
    return null;
  }

  const data: GeminiResponse = await response.json();

  if (data.error) {
    console.warn("[Gemini] Error:", data.error.message);
    return null;
  }

  // Extract first image
  if (data.candidates) {
    for (const candidate of data.candidates) {
      if (candidate.content?.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData?.data) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
        }
      }
    }
  }

  console.warn("[Gemini] Text-only response, no image");
  return null;
}

// ─── Batch Generate (batchGenerateContent) ───

interface BatchRequest {
  imageBase64: string;
  prompt: string;
}

interface BatchGeminiResponse {
  responses?: Array<GeminiResponse>;
  error?: { message: string };
}

// Submit a batch job — returns the batch operation name to poll
export async function submitBatchJob(
  requests: BatchRequest[],
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY environment variable is not set");

  const model = MODEL_HQ;
  const url = `${GEMINI_BASE_URL}/${model}:batchGenerateContent?key=${apiKey}`;

  const body = {
    batch: {
      display_name: `batch-${Date.now()}`,
      input_config: {
        requests: {
          requests: requests.map((req, i) => ({
            request: {
              contents: [{
                parts: [
                  { inlineData: { mimeType: "image/png", data: req.imageBase64 } },
                  { text: req.prompt },
                ],
              }],
              generation_config: {
                responseModalities: ["TEXT", "IMAGE"],
              },
            },
            metadata: { key: `request-${i}` },
          })),
        },
      },
    },
  };

  console.log(`[Gemini Batch] Submitting batch with ${requests.length} requests...`);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.warn(`[Gemini Batch] API error (${response.status}):`, errorText.substring(0, 500));
    if (response.status === 429) throw new Error("QUOTA_EXCEEDED");
    throw new Error(`Batch API error: ${response.status} — ${errorText.substring(0, 200)}`);
  }

  const data = await response.json();
  console.log(`[Gemini Batch] Batch submitted. Response:`, JSON.stringify(data).substring(0, 500));

  // The response should contain the batch name/operation to poll
  const batchName = data.name || data.batch?.name;
  if (!batchName) {
    throw new Error(`Batch submitted but no batch name returned. Response: ${JSON.stringify(data).substring(0, 300)}`);
  }

  return batchName;
}

// Poll a batch job for results
export async function pollBatchJob(batchName: string): Promise<{
  done: boolean;
  results: (string | null)[];
  error?: string;
}> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY environment variable is not set");

  // Poll the batch operation
  const url = `https://generativelanguage.googleapis.com/v1beta/${batchName}?key=${apiKey}`;

  const response = await fetch(url, {
    headers: { "x-goog-api-key": apiKey },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.warn(`[Gemini Batch] Poll error (${response.status}):`, errorText.substring(0, 300));
    // Don't treat poll errors as fatal — could be a transient network issue
    return { done: false, results: [] };
  }

  const data = await response.json();
  const batchState = data.metadata?.state || data.state || "unknown";
  const stats = data.metadata?.batchStats || {};
  console.log(`[Gemini Batch] Poll state: ${batchState}, stats:`, JSON.stringify(stats));

  // Check states — uses BATCH_STATE_* prefix per the API
  const isDone = batchState === "BATCH_STATE_SUCCEEDED" || batchState === "JOB_STATE_SUCCEEDED" || batchState === "SUCCEEDED";
  const isFailed = batchState === "BATCH_STATE_FAILED" || batchState === "JOB_STATE_FAILED" || batchState === "FAILED" || batchState === "BATCH_STATE_CANCELLED";

  if (isFailed) {
    return { done: true, results: [], error: data.error?.message || `Batch job failed (${batchState})` };
  }

  if (!isDone) {
    return { done: false, results: [] };
  }

  // Batch is done — fetch the results
  // The response may contain an output_config or we may need to list batch results
  console.log(`[Gemini Batch] Batch done! Full response keys:`, Object.keys(data));
  console.log(`[Gemini Batch] Full response (truncated):`, JSON.stringify(data).substring(0, 2000));

  // Try to extract results from various possible response formats
  const results: (string | null)[] = [];

  // Actual Gemini batch API format: data.response.inlinedResponses.inlinedResponses[]
  const responses = data.response?.inlinedResponses?.inlinedResponses
    || data.response?.inlinedResponses
    || data.response?.responses
    || data.responses
    || [];
  const responseList = Array.isArray(responses) ? responses : [];

  for (const resp of responseList) {
    let found: string | null = null;
    const responseObj = resp.response || resp;
    const candidates = responseObj.candidates || [];
    for (const candidate of candidates) {
      const parts = candidate.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          found = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }
      if (found) break;
    }
    results.push(found);
  }

  console.log(`[Gemini Batch] Extracted ${results.filter(Boolean).length}/${results.length} images`);
  return { done: true, results };
}

export { loadBaseImage };

async function generateWithGemini(
  baseImage: GreyVolumeImage,
  prompt: string,
  quality: RenderQuality
): Promise<string[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY environment variable is not set");

  const model = quality === "hq" ? MODEL_HQ : MODEL_QUICK;
  const imageBase64 = await loadBaseImage(baseImage);

  const MAX_ATTEMPTS = 4;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    console.log(`[Gemini] ${quality} mode (${model}), attempt ${attempt}/${MAX_ATTEMPTS}...`);

    const image = await callGeminiOnce(apiKey, imageBase64, prompt, model).catch((err) => {
      if (err?.message === "QUOTA_EXCEEDED") throw err;
      if (err?.message === "MODEL_OVERLOADED") {
        console.warn(`[Gemini] Model overloaded (503), retrying in 3s...`);
        return new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000));
      }
      console.warn(`[Gemini] Attempt ${attempt} failed:`, err?.message);
      return null;
    });

    if (image) {
      console.log(`[Gemini] Got image on attempt ${attempt}`);
      return [image];
    }
  }

  throw new Error("Geen afbeelding ontvangen. Probeer het opnieuw.");
}

// ─── Imagen 4 Fast (Quick Preview) ───

const IMAGEN_MODEL = "imagen-4.0-fast-generate-001";

interface ImagenResponse {
  generatedImages?: Array<{
    image?: {
      imageBytes?: string;
    };
  }>;
  error?: { message: string };
}

async function callImagenOnce(
  apiKey: string,
  prompt: string,
): Promise<string | null> {
  // Imagen uses the predict endpoint via v1beta
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${IMAGEN_MODEL}:predict?key=${apiKey}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  const requestBody = {
    instances: [{ prompt }],
    parameters: {
      sampleCount: 1,
      aspectRatio: "16:9",
    },
  };

  console.log(`[Imagen] URL: ${url.replace(apiKey, "***")}`);

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: controller.signal,
    body: JSON.stringify(requestBody),
  }).finally(() => clearTimeout(timeout));

  if (!response.ok) {
    if (response.status === 429) throw new Error("QUOTA_EXCEEDED");
    if (response.status === 503) throw new Error("MODEL_OVERLOADED");
    const errorText = await response.text();
    console.warn(`[Imagen] API error (${response.status}):`, errorText.substring(0, 500));
    return null;
  }

  const data = await response.json();
  console.log(`[Imagen] Response keys:`, JSON.stringify(Object.keys(data)));

  if (data.error) {
    console.warn("[Imagen] Error:", data.error.message);
    return null;
  }

  // Try multiple response formats
  // Format 1: predictions[].bytesBase64Encoded
  if (data.predictions) {
    for (const pred of data.predictions) {
      if (pred.bytesBase64Encoded) {
        return `data:image/png;base64,${pred.bytesBase64Encoded}`;
      }
    }
  }

  // Format 2: generatedImages[].image.imageBytes
  if (data.generatedImages) {
    for (const item of data.generatedImages) {
      if (item.image?.imageBytes) {
        return `data:image/png;base64,${item.image.imageBytes}`;
      }
    }
  }

  console.warn("[Imagen] No image in response. Keys:", JSON.stringify(data).substring(0, 500));
  return null;
}

async function generateWithImagen(
  baseImage: GreyVolumeImage,
  prompt: string,
): Promise<string[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY environment variable is not set");

  const MAX_ATTEMPTS = 3;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    console.log(`[Imagen] Fast mode (${IMAGEN_MODEL}), attempt ${attempt}/${MAX_ATTEMPTS}...`);

    const image = await callImagenOnce(apiKey, prompt).catch((err) => {
      if (err?.message === "QUOTA_EXCEEDED") throw err;
      if (err?.message === "MODEL_OVERLOADED") {
        console.warn(`[Imagen] Model overloaded, retrying in 2s...`);
        return new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000));
      }
      console.warn(`[Imagen] Attempt ${attempt} failed:`, err?.message);
      return null;
    });

    if (image) {
      console.log(`[Imagen] Got image on attempt ${attempt}`);
      return [image];
    }
  }

  throw new Error("Geen afbeelding ontvangen van Imagen. Probeer het opnieuw.");
}

// ─── ByteDance (SeedDream) ───

const BYTEDANCE_BASE_URL = "https://ark.ap-southeast.bytepluses.com/api/v3/images/generations";

interface ByteDanceResponse {
  data?: Array<{
    b64_json?: string;
    url?: string;
  }>;
  error?: { message: string; code: string };
}

async function callByteDanceOnce(
  apiKey: string,
  prompt: string,
  model: string,
  imageBase64: string
): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120_000);

  const imageDataUri = `data:image/png;base64,${imageBase64}`;

  const requestBody = {
    model,
    prompt,
    image: imageDataUri,
    sequential_image_generation: "disabled",
    size: "2K",
    response_format: "b64_json",
    watermark: false,
  };

  console.log(`[ByteDance] Calling API with model=${model}, prompt length=${prompt.length}, image provided=true`);

  const response = await fetch(BYTEDANCE_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    signal: controller.signal,
    body: JSON.stringify(requestBody),
  }).finally(() => clearTimeout(timeout));

  if (!response.ok) {
    const errorText = await response.text();
    console.warn(`[ByteDance] API error (${response.status}):`, errorText.substring(0, 500));
    if (response.status === 429) throw new Error("QUOTA_EXCEEDED");
    if (response.status === 503) throw new Error("MODEL_OVERLOADED");
    return null;
  }

  const data: ByteDanceResponse = await response.json();
  console.log(`[ByteDance] Response keys:`, Object.keys(data));

  if (data.error) {
    console.warn("[ByteDance] Error:", data.error.message);
    return null;
  }

  if (data.data) {
    for (const item of data.data) {
      if (item.b64_json) {
        return `data:image/png;base64,${item.b64_json}`;
      }
      if (item.url) {
        // Fetch the image from URL and convert to data URL
        console.log(`[ByteDance] Fetching image from URL...`);
        const imgRes = await fetch(item.url);
        const imgBuf = Buffer.from(await imgRes.arrayBuffer());
        return `data:image/png;base64,${imgBuf.toString("base64")}`;
      }
    }
  }

  console.warn("[ByteDance] No image in response. Full response:", JSON.stringify(data).substring(0, 500));
  return null;
}

function buildByteDancePrompt(config: RenderConfig, baseImage: GreyVolumeImage): string {
  const style = STYLE_CONFIGS[config.style];
  const gutter = GUTTER_CONFIGS[config.gutterType];
  const floorLine = FLOORLINE_CONFIGS[config.floorLine];
  const geo = baseImage;

  const brickStyles = new Set(["jaren-30", "moderne-stadswoning", "oud-hollands", "industrieel"]);
  const isTimber = config.style === "landelijk" || config.style === "biobased";
  const skipFloorLine = brickStyles.has(config.style) && config.floorLine === "bijna-onzichtbaar";
  const subtleTimberFloorLine = isTimber && config.floorLine === "bijna-onzichtbaar";

  const featuresText = config.optionalFeatures.length > 0
    ? config.optionalFeatures.map((f) => FEATURE_CONFIGS[f].promptText).join(", ")
    : "";

  const nuance = config.userNuance.trim();

  // Determine the primary facade material from style
  const isTimberStyle = config.style === "landelijk" || config.style === "biobased";
  const materialRule = isTimberStyle
    ? "The facade material is timber cladding. Use the SAME timber cladding continuously from ground level to the roofline on every house. Do NOT use plaster, render, or stucco anywhere on the facade. Do NOT switch to a different material below the floor-line — timber runs all the way down to ground level."
    : "The facade material is small-format Dutch brick (waalformaat, approximately 210x50mm face size). Use the SAME brick continuously from ground level to the roofline on every house. Do NOT use plaster, render, stucco, or large-format bricks anywhere. Do NOT switch to a different material above or below the floor-line — it is all one continuous brick surface.";

  // Roof material
  const isSedum = config.style === "biobased";
  const roofRule = isSedum
    ? "The roof is covered entirely in sedum (green living roof). Use ONLY sedum — do not mix with clay tiles, slate, or solar panels unless explicitly requested."
    : "The roof is covered entirely in dark Dutch clay pan tiles or slate tiles. Use ONE uniform roof material across the entire roof surface. Do NOT mix different roofing materials — no patches of sedum, no random solar panels, no mixing tiles with metal.";

  // Floor-line instruction
  let floorLineRule: string;
  if (skipFloorLine) {
    floorLineRule = "IGNORE the floor transition completely. Do NOT add any visible horizontal line, band, groove, colour change, or material change at the floor transition. The same brick in the same colour runs continuously from ground to roofline. There is NO floor line.";
  } else if (subtleTimberFloorLine) {
    floorLineRule = "The façade is entirely timber/wood cladding from ground to roof. NEVER use brick or any other material on any part of the façade. NEVER make the lower half brick and upper half wood. The floor transition may show as a very thin shadow line in the wood, but the material on both sides is identical wood cladding.";
  } else if (config.floorLine === "bijna-onzichtbaar") {
    floorLineRule = "There is a very subtle horizontal line at the floor transition — just a thin shadow line or fine groove. IMPORTANT: do NOT change the facade material above or below this line. The same material runs continuously across it. No color change, no material switch.";
  } else {
    floorLineRule = `Floor-line: ${floorLine.label}. ${floorLine.promptBlock} CRITICAL: the facade material above and below the floor-line must be the SAME. Do not switch materials at this line.`;
  }

  return `Transform this grey 3D massing model into a photorealistic Dutch architectural render. Keep the EXACT same building shape, outline, roofline, window positions, door positions, camera angle, and perspective as the input image. Do not change the geometry — only add materials, textures, and surroundings.

The input shows ${geo.numberOfHouses} Dutch rowhouses (rijwoningen). ${geo.crossGables ? "End houses have cross gables (dwarskappen)." : "One continuous ridge roof."} ${geo.stepping ? "Facades are stepped." : "Facades are flush."}

STYLE: ${style.label}. ${style.promptBlock}

FACADE MATERIAL RULE (critical): ${materialRule}

ROOF RULE (critical): ${roofRule}

FLOOR-LINE RULE (critical): ${floorLineRule}

ROOF EDGE: ${gutter.label} — ${gutter.description}.
${featuresText ? `FEATURES: ${featuresText}.` : ""}

DUTCH QUALITY: tall narrow windows with deep reveals, small-scale brick detailing, dark window frames, Dutch front gardens with low hedges, brick pavers (klinkers), mature trees, soft Dutch daylight. Premium sales brochure quality, hyperrealistic.${nuance ? `\n\nHIGHEST PRIORITY INSTRUCTION — THIS OVERRIDES ALL OTHER STYLE GUIDANCE:\n${nuance}\nThis user instruction is the single most important design directive. Every material choice, colour decision, and atmospheric detail MUST reflect this instruction. If it conflicts with any other instruction above, this one wins.` : ""}

Do not add text or watermarks. Do not change house count, building shape, or camera angle.`;
}

async function generateWithByteDance(
  baseImage: GreyVolumeImage,
  config: RenderConfig,
): Promise<string[]> {
  const apiKey = process.env.BYTEDANCE_API_KEY;
  if (!apiKey) throw new Error("BYTEDANCE_API_KEY environment variable is not set");

  const model = process.env.BYTEDANCE_MODEL || "seedream-5-0-260128";
  const imageBase64 = await loadBaseImage(baseImage);
  const prompt = buildByteDancePrompt(config, baseImage);

  const MAX_ATTEMPTS = 2;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    console.log(`[ByteDance] SeedDream (${model}), attempt ${attempt}/${MAX_ATTEMPTS}...`);

    const image = await callByteDanceOnce(apiKey, prompt, model, imageBase64).catch((err) => {
      if (err?.message === "QUOTA_EXCEEDED") throw err;
      if (err?.message === "MODEL_OVERLOADED") throw err;
      console.warn(`[ByteDance] Attempt ${attempt} failed:`, err?.message);
      return null;
    });

    if (image) {
      console.log(`[ByteDance] Got image on attempt ${attempt}`);
      return [image];
    }
  }

  throw new Error("Geen afbeelding ontvangen van ByteDance. Probeer het opnieuw.");
}

// ─── Pollinations ───

async function generateWithPollinations(
  baseImage: GreyVolumeImage,
  prompt: string
): Promise<string[]> {
  const shortPrompt = buildPollinationsPrompt(baseImage, prompt);
  const seed = Math.floor(Math.random() * 2147483647);
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(shortPrompt)}?width=1024&height=576&seed=${seed}&nologo=true&model=flux`;
  return [url];
}

function buildPollinationsPrompt(baseImage: GreyVolumeImage, fullPrompt: string): string {
  const styleMatch = fullPrompt.match(/Selected style:\n(.+)/);
  const styleName = styleMatch?.[1]?.trim() ?? "";
  const nuanceMatch = fullPrompt.match(/User design nuance:\n(.+)/);
  const nuance = nuanceMatch?.[1]?.trim() ?? "";
  const features = baseImage.crossGables ? ", with cross gables" : "";
  const stepping = baseImage.stepping ? ", with stepped facades" : "";
  return `Hyperrealistic premium Dutch terraced housing architectural render, ${baseImage.numberOfHouses} rowhouses, ${baseImage.width}m wide each${features}${stepping}. Style: ${styleName}. High-end Dutch project developer visualization, elegant brick facades, realistic daylight, landscaped front gardens, Dutch streetscape with trees and greenery, aspirational sales brochure quality. ${nuance}. Photorealistic, 8k, architectural photography.`;
}

// ─── Public API ───

export async function generateRender(
  baseImage: GreyVolumeImage,
  prompt: string,
  quality: RenderQuality = "quick",
  engine: RenderEngine = "google",
  config?: RenderConfig
): Promise<string[]> {
  if (engine === "bytedance" && config) return generateWithByteDance(baseImage, config);

  const provider = getProvider();
  if (provider === "gemini") return generateWithGemini(baseImage, prompt, quality);
  return generateWithPollinations(baseImage, prompt);
}
