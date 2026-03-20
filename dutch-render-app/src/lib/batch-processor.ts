import { writeFile, readFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { RenderConfig, StylePreset, GutterType, FloorLineTreatment, OptionalFeature, NumberOfHouses, WoodType, BrickType } from "@/types";
import { selectBaseImage } from "@/lib/image-selector";
import { buildPrompt } from "@/lib/prompt-builder";
import { submitBatchJob, pollBatchJob, loadBaseImage } from "@/lib/gemini";
import { generateId } from "@/lib/utils";

const RENDERS_DIR = path.join(process.cwd(), "..", "Generated images");
const BATCH_STATE_FILE = path.join(RENDERS_DIR, "_batch-state.json");

export interface BatchState {
  id: string;
  status: "running" | "submitting" | "polling" | "completed" | "error" | "idle";
  total: number;
  completed: number;
  failed: number;
  startedAt: string;
  lastUpdate: string;
  generatedIds: string[];
  batchName?: string;
  error?: string;
}

const DEFAULT_STATE: BatchState = {
  id: "",
  status: "idle",
  total: 0,
  completed: 0,
  failed: 0,
  startedAt: "",
  lastUpdate: "",
  generatedIds: [],
};

async function ensureDir() {
  if (!existsSync(RENDERS_DIR)) {
    await mkdir(RENDERS_DIR, { recursive: true });
  }
}

async function saveBatchState(state: BatchState): Promise<void> {
  await ensureDir();
  await writeFile(BATCH_STATE_FILE, JSON.stringify(state, null, 2));
}

export async function getBatchState(): Promise<BatchState> {
  try {
    const data = await readFile(BATCH_STATE_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return DEFAULT_STATE;
  }
}

function generateRandomConfig(): RenderConfig {
  const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const weightedPick = <T,>(items: [T, number][]): T => {
    const total = items.reduce((sum, [, w]) => sum + w, 0);
    let r = Math.random() * total;
    for (const [item, weight] of items) {
      r -= weight;
      if (r <= 0) return item;
    }
    return items[items.length - 1][0];
  };

  const gutters: GutterType[] = ["overstek", "mastgoot", "verholen-goot"];
  const allFeatures: OptionalFeature[] = ["pergola", "dakkapel", "extra-ramen-kopgevel", "luifel", "franse-balkons", "erker", "zonnepanelen", "afwijkende-voordeuraccenten"];
  const houses: NumberOfHouses[] = [4, 5, 6, 7, 8];

  const style = weightedPick<StylePreset>([
    ["jaren-30", 15],
    ["moderne-stadswoning", 10],
    ["landelijk", 25],
    ["biobased", 25],
    ["oud-hollands", 8],
    ["industrieel", 7],
    ["haags", 10],
  ]);

  const floorLine = weightedPick<FloorLineTreatment>([
    ["bijna-onzichtbaar", 70],
    ["architectonisch-opgelost", 20],
    ["expliciet-gemaakt", 10],
  ]);

  const featureCount = weightedPick<number>([
    [0, 20],
    [1, 30],
    [2, 30],
    [3, 20],
  ]);
  const shuffled = [...allFeatures].sort(() => Math.random() - 0.5);
  const features = shuffled.slice(0, featureCount);

  const width = Math.round((4.0 + Math.random() * 3.0) * 10) / 10;

  const timberStyles = new Set(["landelijk", "biobased"]);
  const allWoodTypes: WoodType[] = [
    "smalle-latten-vuren", "smalle-latten-frake", "smalle-latten-cedar",
    "smalle-latten-thermowood", "brede-latten-vuren", "brede-latten-frake",
    "smalle-latten-moso-bamboe", "diepe-profilering", "zwart-hout",
  ];
  const woodType = timberStyles.has(style) ? pick(allWoodTypes) : undefined;

  const brickStyleSet = new Set(["jaren-30", "moderne-stadswoning", "oud-hollands", "industrieel", "haags"]);
  const allBrickTypes: BrickType[] = [
    "waals-rood", "ijsselsteen-geel", "handvorm-bruin", "strengpers-grijs",
    "langformaat-antraciet", "geglazuurd-donker", "lichte-baksteen",
  ];
  const brickType = brickStyleSet.has(style) ? pick(allBrickTypes) : undefined;

  return {
    geometry: {
      numberOfHouses: pick(houses),
      width,
      crossGables: Math.random() < 0.8,
      stepping: Math.random() < 0.5,
    },
    style,
    gutterType: pick(gutters),
    floorLine,
    optionalFeatures: features as OptionalFeature[],
    woodType,
    brickType,
    userNuance: "",
  };
}

async function saveImageToDisk(imageDataUrl: string, config: RenderConfig): Promise<string> {
  await ensureDir();
  const id = generateId();

  const match = imageDataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!match) throw new Error("Invalid image data");

  const ext = match[1] === "jpeg" ? "jpg" : match[1];
  const imageFilename = `${id}.${ext}`;
  const buffer = Buffer.from(match[2], "base64");

  await writeFile(path.join(RENDERS_DIR, imageFilename), buffer);

  const metadata = { imageFilename, config, createdAt: new Date().toISOString(), batch: true };
  await writeFile(path.join(RENDERS_DIR, `${id}.json`), JSON.stringify(metadata, null, 2));

  return id;
}

const BATCH_CONFIGS_FILE = path.join(RENDERS_DIR, "_batch-configs.json");

async function saveBatchConfigs(configs: RenderConfig[]): Promise<void> {
  await ensureDir();
  await writeFile(BATCH_CONFIGS_FILE, JSON.stringify(configs));
}

async function loadBatchConfigs(): Promise<RenderConfig[]> {
  try {
    const data = await readFile(BATCH_CONFIGS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Track if polling is already active to prevent duplicate loops
let isPollingActive = false;

export async function startBatchGeneration(count: number = 50): Promise<BatchState> {
  const currentState = await getBatchState();
  if (currentState.status === "running" || currentState.status === "submitting" || currentState.status === "polling") {
    return currentState;
  }

  const batchId = generateId();
  const state: BatchState = {
    id: batchId,
    status: "submitting",
    total: count,
    completed: 0,
    failed: 0,
    startedAt: new Date().toISOString(),
    lastUpdate: new Date().toISOString(),
    generatedIds: [],
  };

  await saveBatchState(state);

  // Fire and forget
  processBatch(state, count).catch((err) => {
    console.error("[Batch] Fatal error:", err);
    state.status = "error";
    state.error = err?.message || "Unknown error";
    state.lastUpdate = new Date().toISOString();
    saveBatchState(state).catch(() => {});
  });

  return state;
}

async function processBatch(state: BatchState, count: number): Promise<void> {
  // 1. Generate all configs and prepare requests
  console.log(`[Batch] Preparing ${count} requests...`);
  const configs: RenderConfig[] = [];
  const batchRequests: { imageBase64: string; prompt: string }[] = [];

  for (let i = 0; i < count; i++) {
    const config = generateRandomConfig();
    configs.push(config);

    const baseImage = selectBaseImage(config.geometry);
    const prompt = buildPrompt(config, baseImage, "hq");
    const imageBase64 = await loadBaseImage(baseImage);
    batchRequests.push({ imageBase64, prompt });
  }

  // Save configs to disk so they survive a restart
  await saveBatchConfigs(configs);

  // 2. Submit the batch job
  state.status = "submitting";
  state.lastUpdate = new Date().toISOString();
  await saveBatchState(state);

  console.log(`[Batch] Submitting ${count} requests as batch job...`);
  const batchName = await submitBatchJob(batchRequests);
  console.log(`[Batch] Batch submitted: ${batchName}`);

  state.status = "polling";
  state.batchName = batchName;
  state.lastUpdate = new Date().toISOString();
  await saveBatchState(state);

  // 3. Poll until done
  const POLL_INTERVAL = 30_000; // 30 seconds
  const MAX_POLL_TIME = 24 * 60 * 60 * 1000; // 24 hours
  const startTime = Date.now();

  while (Date.now() - startTime < MAX_POLL_TIME) {
    // Check if cancelled
    const current = await getBatchState();
    if (current.id !== state.id || current.status === "completed" || current.status === "error") {
      console.log("[Batch] Cancelled or superseded, stopping poll.");
      return;
    }

    await new Promise((r) => setTimeout(r, POLL_INTERVAL));

    console.log(`[Batch] Polling batch ${batchName}...`);
    let result;
    try {
      result = await pollBatchJob(batchName);
    } catch (pollErr) {
      console.warn(`[Batch] Poll network error, will retry:`, pollErr instanceof Error ? pollErr.message : pollErr);
      continue;
    }

    if (result.error) {
      state.status = "error";
      state.error = result.error;
      state.lastUpdate = new Date().toISOString();
      await saveBatchState(state);
      console.error(`[Batch] Batch failed: ${result.error}`);
      return;
    }

    if (!result.done) {
      console.log(`[Batch] Still processing... (${Math.round((Date.now() - startTime) / 1000)}s elapsed)`);
      continue;
    }

    // 4. Save all results
    console.log(`[Batch] Batch complete! Saving ${result.results.length} results...`);
    for (let i = 0; i < result.results.length; i++) {
      const imageUrl = result.results[i];
      if (imageUrl && i < configs.length) {
        try {
          const savedId = await saveImageToDisk(imageUrl, configs[i]);
          state.generatedIds.push(savedId);
          state.completed++;
        } catch (err) {
          state.failed++;
          console.warn(`[Batch] Failed to save image ${i}:`, err);
        }
      } else {
        state.failed++;
      }
    }

    state.status = "completed";
    state.lastUpdate = new Date().toISOString();
    await saveBatchState(state);
    console.log(`[Batch] Done! ${state.completed} succeeded, ${state.failed} failed.`);
    return;
  }

  // Timed out
  state.status = "error";
  state.error = "Batch timed out after 24 hours";
  state.lastUpdate = new Date().toISOString();
  await saveBatchState(state);
}

export async function cancelBatch(): Promise<void> {
  const state = await getBatchState();
  if (state.status === "running" || state.status === "submitting" || state.status === "polling") {
    state.status = "completed";
    state.lastUpdate = new Date().toISOString();
    await saveBatchState(state);
    isPollingActive = false;
  }
}

// Resume polling after server restart — called from the GET endpoint
export function resumeBatchPolling(state: BatchState): void {
  if (isPollingActive) return;
  if (!state.batchName || state.status !== "polling") return;

  isPollingActive = true;
  console.log(`[Batch] Resuming poll for batch ${state.batchName} after restart...`);

  // Fire and forget the polling loop
  (async () => {
    const batchName = state.batchName!;
    const configs = await loadBatchConfigs();
    const POLL_INTERVAL = 30_000;
    const MAX_POLL_TIME = 24 * 60 * 60 * 1000;
    const startTime = Date.now();

    while (Date.now() - startTime < MAX_POLL_TIME) {
      const current = await getBatchState();
      if (current.id !== state.id || current.status === "completed" || current.status === "error") {
        isPollingActive = false;
        return;
      }

      await new Promise((r) => setTimeout(r, POLL_INTERVAL));

      console.log(`[Batch] Polling batch ${batchName}...`);
      const result = await pollBatchJob(batchName);

      if (result.error) {
        state.status = "error";
        state.error = result.error;
        state.lastUpdate = new Date().toISOString();
        await saveBatchState(state);
        isPollingActive = false;
        return;
      }

      if (!result.done) {
        console.log(`[Batch] Still processing...`);
        continue;
      }

      // Save results
      console.log(`[Batch] Batch complete! Saving ${result.results.length} results...`);
      for (let i = 0; i < result.results.length; i++) {
        const imageUrl = result.results[i];
        if (imageUrl && i < configs.length) {
          try {
            const savedId = await saveImageToDisk(imageUrl, configs[i]);
            state.generatedIds.push(savedId);
            state.completed++;
          } catch {
            state.failed++;
          }
        } else {
          state.failed++;
        }
      }

      state.status = "completed";
      state.lastUpdate = new Date().toISOString();
      await saveBatchState(state);
      isPollingActive = false;
      console.log(`[Batch] Resumed batch done! ${state.completed} succeeded, ${state.failed} failed.`);
      return;
    }

    state.status = "error";
    state.error = "Batch timed out after 24 hours";
    state.lastUpdate = new Date().toISOString();
    await saveBatchState(state);
    isPollingActive = false;
  })().catch((err) => {
    console.error("[Batch] Resume polling error:", err);
    isPollingActive = false;
  });
}
