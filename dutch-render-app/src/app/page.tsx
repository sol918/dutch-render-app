"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { ConfigPanel } from "@/components/ConfigPanel";
import { PreviewArea } from "@/components/PreviewArea";
import { VariantsGallery, configDistance } from "@/components/VariantsGallery";
import { RenderConfig, GenerateResponse, GeneratedVariant, RenderQuality, RenderEngine, StylePreset, GutterType, FloorLineTreatment, OptionalFeature, NumberOfHouses, WoodType, BrickType } from "@/types";

const DEFAULT_CONFIG: RenderConfig = {
  geometry: {
    numberOfHouses: 5,
    width: 5.4,
    crossGables: false,
    stepping: false,
  },
  style: "jaren-30",
  gutterType: "overstek",
  floorLine: "architectonisch-opgelost",
  optionalFeatures: [],
  userNuance: "",
};

export default function Home() {
  const [config, setConfig] = useState<RenderConfig>(DEFAULT_CONFIG);
  const [allVariants, setAllVariants] = useState<GeneratedVariant[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const configFromVariantRef = useRef(false);
  const [overnightBatch, setOvernightBatch] = useState<{ status: string; completed: number; total: number; failed: number } | null>(null);
  const batchPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll overnight batch status
  const startBatchPolling = useCallback(() => {
    if (batchPollRef.current) return;
    batchPollRef.current = setInterval(async () => {
      try {
        const res = await fetch("/api/batch-generate");
        const state = await res.json();
        setOvernightBatch(state.status === "idle" ? null : state);

        // If batch completed or errored, stop polling and reload renders
        if (state.status === "completed" || state.status === "error") {
          if (batchPollRef.current) {
            clearInterval(batchPollRef.current);
            batchPollRef.current = null;
          }
        }

        // Reload renders to pick up new images
        if (state.completed > 0) {
          const rendersRes = await fetch("/api/renders");
          const rendersData = await rendersRes.json();
          if (rendersData.renders?.length > 0) {
            const loaded: GeneratedVariant[] = rendersData.renders.map(
              (r: { id: string; imageFilename: string; config?: RenderConfig }) => ({
                id: r.id,
                imageUrl: `/api/generated-image/${r.imageFilename}`,
                config: r.config,
              })
            );
            setAllVariants(loaded);
            setSelectedVariantId(loaded[loaded.length - 1].id);
          }
        }
      } catch { /* ignore */ }
    }, 10_000); // Poll every 10 seconds
  }, []);

  const handleStartOvernightBatch = useCallback(async () => {
    try {
      const res = await fetch("/api/batch-generate", { method: "POST" });
      const state = await res.json();
      setOvernightBatch(state);
      startBatchPolling();
    } catch (err) {
      console.error("Failed to start batch:", err);
    }
  }, [startBatchPolling]);

  const handleCancelOvernightBatch = useCallback(async () => {
    try {
      await fetch("/api/batch-generate", { method: "DELETE" });
      setOvernightBatch(null);
      if (batchPollRef.current) {
        clearInterval(batchPollRef.current);
        batchPollRef.current = null;
      }
    } catch { /* ignore */ }
  }, []);

  // Check for running batch on startup
  useEffect(() => {
    fetch("/api/batch-generate")
      .then((r) => r.json())
      .then((state) => {
        if (state.status === "running") {
          setOvernightBatch(state);
          startBatchPolling();
        }
      })
      .catch(() => {});
  }, [startBatchPolling]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (batchPollRef.current) clearInterval(batchPollRef.current);
    };
  }, []);

  // Load saved renders on startup
  useEffect(() => {
    fetch("/api/renders")
      .then((r) => r.json())
      .then((data) => {
        if (data.renders?.length > 0) {
          const loaded: GeneratedVariant[] = data.renders.map(
            (r: { id: string; imageFilename: string; config?: RenderConfig }) => ({
              id: r.id,
              imageUrl: `/api/generated-image/${r.imageFilename}`,
              config: r.config,
            })
          );
          setAllVariants(loaded);
          setSelectedVariantId(loaded[loaded.length - 1].id);
        }
      })
      .catch(() => {});
  }, []);

  const selectedVariant = useMemo(
    () => allVariants.find((v) => v.id === selectedVariantId) ?? null,
    [allVariants, selectedVariantId]
  );

  // When a variant is selected, restore its config
  const handleSelectVariant = useCallback((id: string) => {
    configFromVariantRef.current = true;
    setSelectedVariantId(id);
    const variant = allVariants.find((v) => v.id === id);
    if (variant?.config) {
      setConfig(variant.config);
    }
  }, [allVariants]);

  // Auto-select closest variant when config changes from menu
  useEffect(() => {
    if (configFromVariantRef.current) {
      configFromVariantRef.current = false;
      return;
    }
    if (allVariants.length === 0 || isGenerating) return;

    let closest: GeneratedVariant | null = null;
    let closestDist = Infinity;
    for (const v of allVariants) {
      if (!v.config) continue;
      const d = configDistance(config, v.config);
      if (d < closestDist) {
        closestDist = d;
        closest = v;
      }
    }
    if (closest && closest.id !== selectedVariantId) {
      setSelectedVariantId(closest.id);
    }
  }, [config, allVariants, isGenerating]);

  const handleGenerate = useCallback(async (quality: RenderQuality = "hq", engine: RenderEngine = "google") => {
    if (isGenerating) return;

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config, quality, engine }),
        signal: controller.signal,
      });

      const data: GenerateResponse = await response.json();

      if (data.success && data.result) {
        const newVariants = data.result.variants;

        // Save all variants to disk in parallel (with config)
        await Promise.all(
          newVariants.map((variant) =>
            fetch("/api/renders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: variant.id, imageUrl: variant.imageUrl, config }),
            })
              .then((r) => r.json())
              .then((saved) => {
                if (saved.imageFilename) {
                  variant.imageUrl = `/api/generated-image/${saved.imageFilename}`;
                }
                variant.config = config;
              })
              .catch(() => {})
          )
        );

        setAllVariants((prev) => [...prev, ...newVariants]);
        if (newVariants.length > 0) {
          setSelectedVariantId(newVariants[0].id);
        }
      } else {
        setError(data.error ?? "Generation failed");
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Verbindingsfout");
    } finally {
      setIsGenerating(false);
      abortRef.current = null;
    }
  }, [config, isGenerating]);

  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);
  const [galleryExpanded, setGalleryExpanded] = useState(false);

  const generateRandomConfig = useCallback((): RenderConfig => {
    // Weighted random picker
    const weightedPick = <T,>(items: [T, number][]): T => {
      const total = items.reduce((sum, [, w]) => sum + w, 0);
      let r = Math.random() * total;
      for (const [item, weight] of items) {
        r -= weight;
        if (r <= 0) return item;
      }
      return items[items.length - 1][0];
    };

    const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

    const gutters: GutterType[] = ["overstek", "mastgoot", "verholen-goot"];
    const floorLineWeighted: [FloorLineTreatment, number][] = [
      ["bijna-onzichtbaar", 70],
      ["architectonisch-opgelost", 20],
      ["expliciet-gemaakt", 10],
    ];
    const allFeatures: OptionalFeature[] = ["pergola", "dakkapel", "extra-ramen-kopgevel", "luifel", "franse-balkons", "erker", "zonnepanelen", "afwijkende-voordeuraccenten"];
    const houses: NumberOfHouses[] = [4, 5, 6, 7, 8];

    // Weighted style distribution
    const style = weightedPick<StylePreset>([
      ["jaren-30", 15],
      ["moderne-stadswoning", 10],
      ["landelijk", 25],
      ["biobased", 25],
      ["oud-hollands", 8],
      ["industrieel", 7],
      ["haags", 10],
    ]);

    // Weighted feature count: 0=20%, 1=30%, 2=30%, 3=20%
    const featureCount = weightedPick<number>([
      [0, 20],
      [1, 30],
      [2, 30],
      [3, 20],
    ]);
    const shuffled = [...allFeatures].sort(() => Math.random() - 0.5);
    const features = shuffled.slice(0, featureCount);

    // Random width between 4.0 and 7.0, snapped to 0.1
    const width = Math.round((4.0 + Math.random() * 3.0) * 10) / 10;

    // Random wood type for timber styles (landelijk, biobased)
    const timberStyles = new Set(["landelijk", "biobased"]);
    const allWoodTypes: WoodType[] = [
      "smalle-latten-vuren", "smalle-latten-frake", "smalle-latten-cedar",
      "smalle-latten-thermowood", "brede-latten-vuren", "brede-latten-frake",
      "smalle-latten-moso-bamboe", "diepe-profilering", "zwart-hout",
    ];
    const woodType = timberStyles.has(style) ? pick(allWoodTypes) : undefined;

    // Random brick type for brick styles
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
        crossGables: Math.random() < 0.8,   // 80% met dwarskap
        stepping: Math.random() < 0.5,       // 50% verspringend
      },
      style,
      gutterType: pick(gutters),
      floorLine: weightedPick(floorLineWeighted),
      optionalFeatures: features as OptionalFeature[],
      woodType,
      brickType,
      userNuance: "",
    };
  }, []);

  const handleBatchGenerate = useCallback(async (engine: RenderEngine = "google") => {
    if (isGenerating) return;

    setIsGenerating(true);
    setError(null);
    setBatchProgress({ current: 0, total: 10 });

    for (let i = 0; i < 10; i++) {
      setBatchProgress({ current: i + 1, total: 10 });
      const randomConfig = generateRandomConfig();

      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ config: randomConfig, quality: "hq" as RenderQuality, engine }),
        });

        const data: GenerateResponse = await response.json();

        if (data.success && data.result) {
          const newVariants = data.result.variants;

          await Promise.all(
            newVariants.map((variant) =>
              fetch("/api/renders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: variant.id, imageUrl: variant.imageUrl, config: randomConfig }),
              })
                .then((r) => r.json())
                .then((saved) => {
                  if (saved.imageFilename) {
                    variant.imageUrl = `/api/generated-image/${saved.imageFilename}`;
                  }
                  variant.config = randomConfig;
                })
                .catch(() => {})
            )
          );

          setAllVariants((prev) => [...prev, ...newVariants]);
          if (newVariants.length > 0) {
            setSelectedVariantId(newVariants[0].id);
            setConfig(randomConfig);
          }
        } else {
          console.error(`Batch ${i + 1}/10 failed:`, data.error);
        }
      } catch (err) {
        console.error(`Batch ${i + 1}/10 error:`, err);
      }
    }

    setIsGenerating(false);
    setBatchProgress(null);
  }, [isGenerating, generateRandomConfig]);

  const handleDeleteVariant = useCallback((id: string) => {
    fetch(`/api/renders/${id}`, { method: "DELETE" }).catch(() => {});

    setAllVariants((prev) => {
      const remaining = prev.filter((v) => v.id !== id);
      if (selectedVariantId === id) {
        setSelectedVariantId(
          remaining.length > 0 ? remaining[remaining.length - 1].id : null
        );
      }
      return remaining;
    });
  }, [selectedVariantId]);

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0a] overflow-hidden">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        <ConfigPanel
          config={config}
          onChange={setConfig}
          onGenerate={handleGenerate}
          onBatchGenerate={handleBatchGenerate}
          isGenerating={isGenerating}
          batchProgress={batchProgress}
          overnightBatch={overnightBatch}
          onStartOvernightBatch={handleStartOvernightBatch}
          onCancelOvernightBatch={handleCancelOvernightBatch}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          {!galleryExpanded && (
            <PreviewArea
              selectedVariant={selectedVariant}
              isGenerating={isGenerating}
              error={error}
            />
          )}

          <VariantsGallery
            allVariants={allVariants}
            selectedVariantId={selectedVariantId}
            currentConfig={config}
            onSelectVariant={handleSelectVariant}
            onDeleteVariant={handleDeleteVariant}
            expanded={galleryExpanded}
            onToggleExpanded={() => setGalleryExpanded((e) => !e)}
          />
        </div>
      </div>
    </div>
  );
}
