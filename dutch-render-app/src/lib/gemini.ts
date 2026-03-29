import { readFile } from "fs/promises";
import path from "path";
import { GreyVolumeImage, RenderConfig, RenderEngine, RenderQuality } from "@/types";

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

// ─── Refine Render (second-pass correction) ───

export async function refineRender(
  baseImageBase64: string,
  renderImageBase64: string,
  refinePrompt: string,
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY environment variable is not set");

  const model = MODEL_HQ;
  const MAX_ATTEMPTS = 3;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    console.log(`[Gemini Refine] Attempt ${attempt}/${MAX_ATTEMPTS}...`);

    const image = await callGeminiRefine(apiKey, baseImageBase64, renderImageBase64, refinePrompt, model).catch((err) => {
      if (err?.message === "QUOTA_EXCEEDED") throw err;
      if (err?.message === "MODEL_OVERLOADED") {
        console.warn(`[Gemini Refine] Model overloaded, retrying in 3s...`);
        return new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000));
      }
      console.warn(`[Gemini Refine] Attempt ${attempt} failed:`, err?.message);
      return null;
    });

    if (image) {
      console.log(`[Gemini Refine] Got refined image on attempt ${attempt}`);
      return image;
    }
  }

  return null;
}

async function callGeminiRefine(
  apiKey: string,
  baseImageBase64: string,
  renderImageBase64: string,
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
          { inlineData: { mimeType: "image/png", data: baseImageBase64 } },
          { inlineData: { mimeType: "image/jpeg", data: renderImageBase64 } },
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
    console.warn(`[Gemini Refine] API error (${response.status}):`, errorText.substring(0, 200));
    return null;
  }

  const data: GeminiResponse = await response.json();
  if (data.error) {
    console.warn("[Gemini Refine] Error:", data.error.message);
    return null;
  }

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

  console.warn("[Gemini Refine] Text-only response, no image");
  return null;
}

// ─── Batch Generate (batchGenerateContent) ───
// Uses the Gemini Batch API which is 50% cheaper than real-time.
// All requests are submitted as a single batch job and processed asynchronously.
// Docs: https://ai.google.dev/gemini-api/docs/batch-api

interface BatchRequest {
  imageBase64: string;
  prompt: string;
}

// Submit a batch job — returns the batch name (e.g. "batches/abc123") to poll
export async function submitBatchJob(
  requests: BatchRequest[],
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY environment variable is not set");

  const model = MODEL_HQ;
  const url = `${GEMINI_BASE_URL}/${model}:batchGenerateContent?key=${apiKey}`;

  const body = {
    batch: {
      display_name: `vlakwerk-batch-${Date.now()}`,
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

  console.log(`[Gemini Batch] Submitting batch with ${requests.length} requests to ${model}...`);
  const payloadSize = JSON.stringify(body).length;
  console.log(`[Gemini Batch] Payload size: ${(payloadSize / 1024 / 1024).toFixed(1)}MB`);

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

  // Response returns an operation with name like "batches/abc123"
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

  // GET the batch status — batchName is like "batches/abc123"
  const url = `https://generativelanguage.googleapis.com/v1beta/${batchName}?key=${apiKey}`;

  const response = await fetch(url, {
    headers: { "x-goog-api-key": apiKey },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.warn(`[Gemini Batch] Poll error (${response.status}):`, errorText.substring(0, 300));
    return { done: false, results: [] };
  }

  const data = await response.json();
  const batchState = data.metadata?.state || data.state || "unknown";
  const stats = data.metadata?.batchStats || {};
  console.log(`[Gemini Batch] Poll state: ${batchState}, stats:`, JSON.stringify(stats));

  // Terminal failure states
  const failStates = new Set([
    "BATCH_STATE_FAILED", "JOB_STATE_FAILED",
    "BATCH_STATE_CANCELLED", "JOB_STATE_CANCELLED",
    "BATCH_STATE_EXPIRED", "JOB_STATE_EXPIRED",
  ]);
  if (failStates.has(batchState)) {
    return { done: true, results: [], error: data.error?.message || `Batch job failed (${batchState})` };
  }

  // Success states
  const doneStates = new Set([
    "BATCH_STATE_SUCCEEDED", "JOB_STATE_SUCCEEDED",
  ]);
  if (!doneStates.has(batchState)) {
    return { done: false, results: [] };
  }

  // Batch succeeded — extract images from inlined responses
  console.log(`[Gemini Batch] Batch done! Extracting results...`);
  const results: (string | null)[] = [];

  // Actual response structure from the API:
  // data.metadata.output.inlinedResponses.inlinedResponses[].response.candidates[].content.parts[]
  const inlined = data.metadata?.output?.inlinedResponses?.inlinedResponses
    || data.response?.inlinedResponses?.inlinedResponses
    || data.response?.inlinedResponses
    || [];
  const responseList = Array.isArray(inlined) ? inlined : [];

  for (const entry of responseList) {
    let found: string | null = null;
    // Each entry has: { response: { candidates: [{ content: { parts: [...] } }] } }
    const responseObj = entry.response || entry.output?.response || entry;
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
  const provider = getProvider();
  if (provider === "gemini") return generateWithGemini(baseImage, prompt, quality);
  return generateWithPollinations(baseImage, prompt);
}
