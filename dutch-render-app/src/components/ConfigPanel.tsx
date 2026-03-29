"use client";

import { useState } from "react";
import { Shuffle, Moon, Eye, EyeOff } from "lucide-react";
import {
  RenderConfig,
  RenderQuality,
  RenderEngine,
  NumberOfHouses,
  StylePreset,
  GutterType,
  FloorLineTreatment,
  OptionalFeature,
  WoodType,
  BrickType,
} from "@/types";
import { STYLE_OPTIONS } from "@/config/styles";
import { GUTTER_OPTIONS } from "@/config/gutters";
import { FLOORLINE_OPTIONS } from "@/config/floorline";
import { FEATURE_OPTIONS } from "@/config/options";
import { WOOD_OPTIONS } from "@/config/wood";
import { BRICK_OPTIONS } from "@/config/bricks";
import { cn } from "@/lib/utils";
import { buildPrompt } from "@/lib/prompt-builder";
import { selectBaseImage } from "@/lib/image-selector";

interface ConfigPanelProps {
  config: RenderConfig;
  onChange: (config: RenderConfig) => void;
  onGenerate: (quality: RenderQuality, engine?: RenderEngine) => void;
  onBatchGenerate: (engine?: RenderEngine) => void;
  isGenerating: boolean;
  batchProgress: { current: number; total: number } | null;
  overnightBatch: { status: string; completed: number; total: number; failed: number } | null;
  onStartOvernightBatch: () => void;
  onCancelOvernightBatch: () => void;
}

export function ConfigPanel({
  config,
  onChange,
  onGenerate,
  onBatchGenerate,
  isGenerating,
  batchProgress,
  overnightBatch,
  onStartOvernightBatch,
  onCancelOvernightBatch,
}: ConfigPanelProps) {
  const updateGeometry = (field: string, value: number | boolean) => {
    onChange({
      ...config,
      geometry: { ...config.geometry, [field]: value },
    });
  };

  const toggleFeature = (feature: OptionalFeature) => {
    const features = config.optionalFeatures.includes(feature)
      ? config.optionalFeatures.filter((f) => f !== feature)
      : [...config.optionalFeatures, feature];
    onChange({ ...config, optionalFeatures: features });
  };

  return (
    <aside className="w-[340px] shrink-0 border-r border-black/5 bg-[#F4F3F3] overflow-y-auto flex flex-col">
      <div className="flex-1 p-6 space-y-8">
        {/* Houses */}
        <Section title="01 / WONINGEN">
          <div className="flex gap-1">
            {([2, 3, 4, 5, 6, 7, 8, 9, 10] as NumberOfHouses[]).map((n) => (
              <button
                key={n}
                onClick={() => updateGeometry("numberOfHouses", n)}
                className={cn(
                  "flex-1 h-9 text-[0.6875rem] font-bold uppercase tracking-wide transition-all duration-150 cursor-pointer",
                  config.geometry.numberOfHouses === n
                    ? "bg-black text-white"
                    : "bg-white text-black/40 hover:bg-black/5 hover:text-black/70"
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </Section>

        {/* Width */}
        <Section title={`02 / BREEDTE — ${config.geometry.width.toFixed(1)}M`}>
          <input
            type="range"
            min={4.0}
            max={7.3}
            step={0.1}
            value={config.geometry.width}
            onChange={(e) => updateGeometry("width", parseFloat(e.target.value))}
            className="w-full cursor-pointer"
          />
          <div className="flex justify-between text-[0.6875rem] text-black/30 -mt-0.5 tracking-wide">
            <span>4.0M</span>
            <span>7.3M</span>
          </div>
        </Section>

        {/* Toggles */}
        <div className="grid grid-cols-2 gap-2">
          <Chip
            label="Dwarskappen"
            active={config.geometry.crossGables}
            onClick={() => updateGeometry("crossGables", !config.geometry.crossGables)}
          />
          <Chip
            label="Verspringend"
            active={config.geometry.stepping}
            onClick={() => updateGeometry("stepping", !config.geometry.stepping)}
          />
        </div>

        {/* Style */}
        <Section title="03 / STIJL">
          <div className="space-y-1">
            {STYLE_OPTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => onChange({ ...config, style: s.id as StylePreset })}
                className={cn(
                  "w-full text-left px-4 py-2.5 text-[0.8125rem] font-medium transition-all duration-150 cursor-pointer",
                  config.style === s.id
                    ? "bg-black text-white"
                    : "bg-white text-black/50 hover:bg-black/5 hover:text-black/80"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </Section>

        {/* Wood type — only for timber styles */}
        {(config.style === "landelijk" || config.style === "biobased") && (
          <Section title="HOUTTYPE">
            <div className="space-y-1">
              {WOOD_OPTIONS.map((w) => (
                <button
                  key={w.id}
                  onClick={() => onChange({ ...config, woodType: config.woodType === w.id ? undefined : w.id as WoodType })}
                  className={cn(
                    "w-full text-left px-4 py-2.5 text-[0.8125rem] font-medium transition-all duration-150 cursor-pointer",
                    config.woodType === w.id
                      ? "bg-black text-white"
                      : "bg-white text-black/50 hover:bg-black/5 hover:text-black/80"
                  )}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </Section>
        )}

        {/* Brick type — only for brick styles */}
        {(config.style === "jaren-30" || config.style === "modern") && (
          <Section title="BAKSTEENTYPE">
            <div className="space-y-1">
              {BRICK_OPTIONS.map((b) => (
                <button
                  key={b.id}
                  onClick={() => onChange({ ...config, brickType: config.brickType === b.id ? undefined : b.id as BrickType })}
                  className={cn(
                    "w-full text-left px-4 py-2.5 text-[0.8125rem] font-medium transition-all duration-150 cursor-pointer",
                    config.brickType === b.id
                      ? "bg-black text-white"
                      : "bg-white text-black/50 hover:bg-black/5 hover:text-black/80"
                  )}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </Section>
        )}

        {/* Gutter */}
        <Section title="04 / GOOTTYPE">
          <div className="flex gap-1">
            {GUTTER_OPTIONS.map((g) => (
              <Chip
                key={g.id}
                label={g.label}
                active={config.gutterType === g.id}
                onClick={() => onChange({ ...config, gutterType: g.id as GutterType })}
              />
            ))}
          </div>
        </Section>

        {/* Floor-line */}
        <Section title="05 / VERDIEPINGSOVERGANG">
          <div className="space-y-1">
            {FLOORLINE_OPTIONS.map((fl) => (
              <button
                key={fl.id}
                onClick={() => onChange({ ...config, floorLine: fl.id as FloorLineTreatment })}
                className={cn(
                  "w-full text-left px-4 py-2.5 text-[0.8125rem] font-medium transition-all duration-150 cursor-pointer",
                  config.floorLine === fl.id
                    ? "bg-black text-white"
                    : "bg-white text-black/50 hover:bg-black/5 hover:text-black/80"
                )}
              >
                {fl.label}
              </button>
            ))}
          </div>
        </Section>

        {/* Features */}
        <Section title="06 / EXTRA">
          <div className="flex flex-wrap gap-1.5">
            {FEATURE_OPTIONS.map((f) => (
              <Chip
                key={f.id}
                label={f.label}
                active={config.optionalFeatures.includes(f.id)}
                onClick={() => toggleFeature(f.id)}
              />
            ))}
          </div>
        </Section>

        {/* Nuance */}
        <Section title="07 / NUANCE">
          <textarea
            value={config.userNuance}
            onChange={(e) => onChange({ ...config, userNuance: e.target.value })}
            placeholder="Warmer, meer groen, strakker..."
            className="w-full h-20 px-4 py-3 text-[0.8125rem] bg-white border border-black/5 resize-none focus:outline-none focus:border-black/30 placeholder:text-black/20 text-black/80 transition-all"
          />
        </Section>
      </div>

      {/* Generate buttons */}
      <PromptPreviewPanel config={config} />
      <div className="p-6 pt-0 space-y-2">
        <button
          onClick={() => onGenerate("hq", "google")}
          disabled={isGenerating}
          className={cn(
            "w-full py-4 text-[0.8125rem] font-bold uppercase tracking-[0.15em] transition-all duration-200 cursor-pointer disabled:cursor-not-allowed",
            isGenerating
              ? "bg-black/20 text-black/40"
              : "bg-black text-white hover:bg-black/80"
          )}
        >
          {isGenerating ? "Bezig..." : "Genereer Render"}
        </button>

        <div className="h-px bg-black/5 my-2" />

        <button
          onClick={() => onBatchGenerate("google")}
          disabled={isGenerating}
          className={cn(
            "w-full py-3 text-[0.75rem] font-bold uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed",
            isGenerating
              ? "bg-black/10 text-black/30"
              : "bg-white text-black border border-black/10 hover:bg-black/5"
          )}
        >
          {batchProgress ? (
            <>
              <Shuffle className="w-4 h-4 animate-spin" />
              {batchProgress.current}/{batchProgress.total} Bezig...
            </>
          ) : (
            <>
              <Shuffle className="w-4 h-4" />
              10x Random
            </>
          )}
        </button>

        <div className="h-px bg-black/5 my-2" />

        {overnightBatch && (overnightBatch.status === "running" || overnightBatch.status === "submitting" || overnightBatch.status === "polling") ? (
          <button
            onClick={onCancelOvernightBatch}
            className="w-full py-3 text-[0.75rem] font-bold uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer bg-white text-black border border-black/10 hover:bg-black/5"
          >
            <Moon className="w-4 h-4 animate-spin" style={{ animationDuration: "3s" }} />
            <span className="flex flex-col items-start leading-tight">
              <span>
                {overnightBatch.status === "submitting" ? "Indienen..." :
                 overnightBatch.status === "polling" ? `Wachten... (${overnightBatch.completed}/${overnightBatch.total})` :
                 `${overnightBatch.completed}/${overnightBatch.total} klaar`}
                {overnightBatch.failed > 0 ? ` (${overnightBatch.failed} mislukt)` : ""}
              </span>
              <span className="text-[0.625rem] text-black/30">Klik om te stoppen</span>
            </span>
          </button>
        ) : (
          <button
            onClick={onStartOvernightBatch}
            className="w-full py-3 text-[0.75rem] font-bold uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer bg-white text-black border border-black/10 hover:bg-black/5"
          >
            <Moon className="w-4 h-4" />
            50x Overnight Batch
          </button>
        )}
      </div>
    </aside>
  );
}

function PromptPreviewPanel({ config }: { config: RenderConfig }) {
  const [showPrompt, setShowPrompt] = useState(false);

  if (!showPrompt) {
    return (
      <div className="px-6 pb-2">
        <button
          onClick={() => setShowPrompt(true)}
          className="w-full py-2 text-[0.6875rem] font-bold uppercase tracking-[0.15em] flex items-center justify-center gap-2 cursor-pointer text-black/30 hover:text-black/60 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          Toon Prompt
        </button>
      </div>
    );
  }

  let prompt: string;
  try {
    const baseImage = selectBaseImage(config.geometry);
    prompt = buildPrompt(config, baseImage, "hq");
  } catch (e) {
    prompt = `Error building prompt: ${e instanceof Error ? e.message : "Unknown error"}`;
  }

  return (
    <div className="px-6 pb-2">
      <button
        onClick={() => setShowPrompt(false)}
        className="w-full py-2 text-[0.6875rem] font-bold uppercase tracking-[0.15em] flex items-center justify-center gap-2 cursor-pointer text-black/50 hover:text-black/80 transition-colors mb-2"
      >
        <EyeOff className="w-3.5 h-3.5" />
        Verberg Prompt
      </button>
      <pre className="text-[0.6875rem] text-black/50 whitespace-pre-wrap bg-white border border-black/5 p-4 max-h-80 overflow-y-auto font-mono leading-relaxed">
        {prompt}
      </pre>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-[0.6875rem] font-bold text-black/40 uppercase tracking-[0.1em]">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-2 text-[0.75rem] font-medium transition-all duration-150 cursor-pointer",
        active
          ? "bg-black text-white"
          : "bg-white text-black/40 hover:bg-black/5 hover:text-black/70 border border-black/5"
      )}
    >
      {label}
    </button>
  );
}
