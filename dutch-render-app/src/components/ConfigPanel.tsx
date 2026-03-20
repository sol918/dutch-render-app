"use client";

import { motion } from "framer-motion";
import { Sparkles, Shuffle, Moon, Square } from "lucide-react";
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
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="w-[340px] shrink-0 border-r border-[#1a1a1a] bg-[#0e0e0e] overflow-y-auto flex flex-col"
    >
      <div className="flex-1 p-5 space-y-5">
        {/* Houses */}
        <Section title="Woningen">
          <div className="flex gap-1.5">
            {([4, 5, 6, 7, 8] as NumberOfHouses[]).map((n) => (
              <button
                key={n}
                onClick={() => updateGeometry("numberOfHouses", n)}
                className={cn(
                  "flex-1 h-9 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer",
                  config.geometry.numberOfHouses === n
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                    : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70"
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </Section>

        {/* Width */}
        <Section title={`Breedte — ${config.geometry.width.toFixed(1)}m`}>
          <input
            type="range"
            min={4.0}
            max={7.3}
            step={0.1}
            value={config.geometry.width}
            onChange={(e) => updateGeometry("width", parseFloat(e.target.value))}
            className="w-full cursor-pointer"
          />
          <div className="flex justify-between text-xs text-white/25 -mt-0.5">
            <span>4.0</span>
            <span>7.3</span>
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
        <Section title="Stijl">
          <div className="space-y-1">
            {STYLE_OPTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => onChange({ ...config, style: s.id as StylePreset })}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 cursor-pointer",
                  config.style === s.id
                    ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                    : "text-white/50 hover:bg-white/5 hover:text-white/70 border border-transparent"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </Section>

        {/* Wood type — only for timber styles */}
        {(config.style === "landelijk" || config.style === "biobased") && (
          <Section title="Houttype">
            <div className="space-y-1">
              {WOOD_OPTIONS.map((w) => (
                <button
                  key={w.id}
                  onClick={() => onChange({ ...config, woodType: config.woodType === w.id ? undefined : w.id as WoodType })}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 cursor-pointer",
                    config.woodType === w.id
                      ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                      : "text-white/50 hover:bg-white/5 hover:text-white/70 border border-transparent"
                  )}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </Section>
        )}

        {/* Brick type — only for brick styles */}
        {(config.style === "jaren-30" || config.style === "moderne-stadswoning" || config.style === "oud-hollands" || config.style === "industrieel" || config.style === "haags") && (
          <Section title="Baksteentype">
            <div className="space-y-1">
              {BRICK_OPTIONS.map((b) => (
                <button
                  key={b.id}
                  onClick={() => onChange({ ...config, brickType: config.brickType === b.id ? undefined : b.id as BrickType })}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 cursor-pointer",
                    config.brickType === b.id
                      ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                      : "text-white/50 hover:bg-white/5 hover:text-white/70 border border-transparent"
                  )}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </Section>
        )}

        {/* Gutter */}
        <Section title="Goottype">
          <div className="flex gap-1.5">
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
        <Section title="Verdiepingsovergang">
          <div className="space-y-1">
            {FLOORLINE_OPTIONS.map((fl) => (
              <button
                key={fl.id}
                onClick={() => onChange({ ...config, floorLine: fl.id as FloorLineTreatment })}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 cursor-pointer",
                  config.floorLine === fl.id
                    ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                    : "text-white/50 hover:bg-white/5 hover:text-white/70 border border-transparent"
                )}
              >
                {fl.label}
              </button>
            ))}
          </div>
        </Section>

        {/* Features */}
        <Section title="Extra">
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
        <Section title="Nuance">
          <textarea
            value={config.userNuance}
            onChange={(e) => onChange({ ...config, userNuance: e.target.value })}
            placeholder="Warmer, meer groen, strakker..."
            className="w-full h-20 px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg resize-none focus:outline-none focus:border-indigo-500/50 placeholder:text-white/20 text-white/80 transition-all"
          />
        </Section>
      </div>

      {/* Generate buttons */}
      <div className="p-5 pt-0 space-y-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onGenerate("hq", "google")}
          disabled={isGenerating}
          className={cn(
            "w-full h-12 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer disabled:cursor-not-allowed",
            isGenerating
              ? "bg-indigo-500/20 text-indigo-300/60"
              : "bg-gradient-to-r from-indigo-500 to-violet-600 text-white glow-button hover:from-indigo-400 hover:to-violet-500"
          )}
        >
          {isGenerating ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            >
              <Sparkles className="w-5 h-5" />
            </motion.div>
          ) : (
            <Sparkles className="w-5 h-5" />
          )}
          {isGenerating ? "Bezig..." : "Google Render"}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onGenerate("hq", "bytedance")}
          disabled={isGenerating}
          className={cn(
            "w-full h-12 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer disabled:cursor-not-allowed",
            isGenerating
              ? "bg-cyan-500/20 text-cyan-300/60"
              : "bg-gradient-to-r from-cyan-500 to-teal-600 text-white glow-button hover:from-cyan-400 hover:to-teal-500"
          )}
        >
          {isGenerating ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            >
              <Sparkles className="w-5 h-5" />
            </motion.div>
          ) : (
            <Sparkles className="w-5 h-5" />
          )}
          {isGenerating ? "Bezig..." : "ByteDance Render"}
        </motion.button>
        <div className="h-px bg-white/10 my-2" />

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onBatchGenerate("google")}
          disabled={isGenerating}
          className={cn(
            "w-full h-12 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer disabled:cursor-not-allowed",
            isGenerating
              ? "bg-amber-500/20 text-amber-300/60"
              : "bg-gradient-to-r from-amber-500 to-orange-600 text-white glow-button hover:from-amber-400 hover:to-orange-500"
          )}
        >
          {batchProgress ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              >
                <Shuffle className="w-5 h-5" />
              </motion.div>
              {batchProgress.current}/{batchProgress.total} Bezig...
            </>
          ) : (
            <>
              <Shuffle className="w-5 h-5" />
              10x Random Generate
            </>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onBatchGenerate("bytedance")}
          disabled={isGenerating}
          className={cn(
            "w-full h-12 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer disabled:cursor-not-allowed",
            isGenerating
              ? "bg-teal-500/20 text-teal-300/60"
              : "bg-gradient-to-r from-teal-500 to-emerald-600 text-white glow-button hover:from-teal-400 hover:to-emerald-500"
          )}
        >
          {batchProgress ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              >
                <Shuffle className="w-5 h-5" />
              </motion.div>
              {batchProgress.current}/{batchProgress.total} Bezig...
            </>
          ) : (
            <>
              <Shuffle className="w-5 h-5" />
              10x Random ByteDance
            </>
          )}
        </motion.button>

        <div className="h-px bg-white/10 my-2" />

        {overnightBatch && (overnightBatch.status === "running" || overnightBatch.status === "submitting" || overnightBatch.status === "polling") ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCancelOvernightBatch}
            className="w-full h-12 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer bg-gradient-to-r from-purple-500/20 to-indigo-600/20 border border-purple-500/30 text-purple-300"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            >
              <Moon className="w-5 h-5" />
            </motion.div>
            <span className="flex flex-col items-start leading-tight">
              <span>
                {overnightBatch.status === "submitting" ? "Indienen..." :
                 overnightBatch.status === "polling" ? `Wachten op Google... (${overnightBatch.completed}/${overnightBatch.total})` :
                 `${overnightBatch.completed}/${overnightBatch.total} klaar`}
                {overnightBatch.failed > 0 ? ` (${overnightBatch.failed} mislukt)` : ""}
              </span>
              <span className="text-[10px] text-purple-400/60">Klik om te stoppen</span>
            </span>
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStartOvernightBatch}
            className={cn(
              "w-full h-12 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer",
              "bg-gradient-to-r from-purple-600 to-indigo-700 text-white glow-button hover:from-purple-500 hover:to-indigo-600"
            )}
          >
            <Moon className="w-5 h-5" />
            50x Overnight Batch
          </motion.button>
        )}
      </div>
    </motion.aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-[11px] font-semibold text-white/30 uppercase tracking-widest">
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
        "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer",
        active
          ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
          : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60 border border-transparent"
      )}
    >
      {label}
    </button>
  );
}
