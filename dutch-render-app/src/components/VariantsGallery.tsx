"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronUp, ChevronDown, Download } from "lucide-react";
import { GeneratedVariant, RenderConfig } from "@/types";
import { cn } from "@/lib/utils";
import { TenderStoryBubble } from "./TenderStoryBubble";

interface VariantsGalleryProps {
  allVariants: GeneratedVariant[];
  selectedVariantId: string | null;
  currentConfig: RenderConfig;
  onSelectVariant: (id: string) => void;
  onDeleteVariant: (id: string) => void;
  expanded: boolean;
  onToggleExpanded: () => void;
}

export function configDistance(a: RenderConfig, b: RenderConfig): number {
  let dist = 0;
  // 1. Style (most important)
  if (a.style !== b.style) dist += 10;
  // 2. Dwarskappen & verspringingen
  if (a.geometry.crossGables !== b.geometry.crossGables) dist += 5;
  if (a.geometry.stepping !== b.geometry.stepping) dist += 4;
  // 3. Number of houses & width
  dist += Math.abs(a.geometry.numberOfHouses - b.geometry.numberOfHouses) * 0.3;
  dist += Math.abs(a.geometry.width - b.geometry.width) * 0.2;
  // 4. All other options
  if (a.gutterType !== b.gutterType) dist += 1;
  if (a.floorLine !== b.floorLine) dist += 1;
  if (a.brickType !== b.brickType) dist += 1;
  if (a.woodType !== b.woodType) dist += 1;
  const aFeats = new Set(a.optionalFeatures);
  const bFeats = new Set(b.optionalFeatures);
  const union = new Set([...aFeats, ...bFeats]);
  const intersection = [...aFeats].filter((f) => bFeats.has(f));
  if (union.size > 0) dist += (1 - intersection.length / union.size) * 2;
  return dist;
}

function groupByProximity(variants: GeneratedVariant[]): { label: string; variants: GeneratedVariant[] }[] {
  const styleLabels: Record<string, string> = {
    "jaren-30": "Jaren 30",
    "moderne-stadswoning": "Moderne Stadswoning",
    "landelijk": "Landelijk",
    "biobased": "Biobased",
    "oud-hollands": "Oud-Hollands",
    "industrieel": "Industrieel",
    "haags": "Haagse Stijl",
  };

  const groups = new Map<string, GeneratedVariant[]>();
  const unconfigured: GeneratedVariant[] = [];

  for (const v of variants) {
    if (!v.config) { unconfigured.push(v); continue; }
    const key = v.config.style;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(v);
  }

  const result: { label: string; variants: GeneratedVariant[] }[] = [];

  for (const [style, items] of groups) {
    if (items.length <= 1) {
      result.push({ label: styleLabels[style] || style, variants: items });
      continue;
    }
    const ordered: GeneratedVariant[] = [items[0]];
    const remaining = new Set(items.slice(1));
    while (remaining.size > 0) {
      const last = ordered[ordered.length - 1];
      let nearest: GeneratedVariant | null = null;
      let nearestDist = Infinity;
      for (const candidate of remaining) {
        if (last.config && candidate.config) {
          const d = configDistance(last.config, candidate.config);
          if (d < nearestDist) { nearestDist = d; nearest = candidate; }
        }
      }
      if (nearest) { ordered.push(nearest); remaining.delete(nearest); }
      else { for (const r of remaining) ordered.push(r); break; }
    }
    result.push({ label: styleLabels[style] || style, variants: ordered });
  }

  if (unconfigured.length > 0) result.push({ label: "Overig", variants: unconfigured });
  result.sort((a, b) => b.variants.length - a.variants.length);
  return result;
}

function downloadImage(src: string, filename: string) {
  const link = document.createElement("a");
  link.href = src;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function ThumbnailCard({
  variant,
  index,
  isSelected,
  onSelect,
  onDelete,
}: {
  variant: GeneratedVariant;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ delay: Math.min(index * 0.02, 0.2) }}
      className="shrink-0 relative group"
    >
      <button
        onClick={onSelect}
        className={cn(
          "w-28 h-[72px] rounded-lg overflow-hidden border-2 transition-all cursor-pointer",
          isSelected
            ? "border-indigo-500 shadow-lg shadow-indigo-500/20"
            : "border-white/10 hover:border-white/25 opacity-70 hover:opacity-100"
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={variant.imageUrl} alt="Render" className="w-full h-full object-cover" />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-red-500"
      >
        <X className="w-3 h-3" />
      </button>
    </motion.div>
  );
}

export function VariantsGallery({
  allVariants,
  selectedVariantId,
  currentConfig,
  onSelectVariant,
  onDeleteVariant,
  expanded,
  onToggleExpanded,
}: VariantsGalleryProps) {

  const sortedByClosest = useMemo(() => {
    const withDistance = allVariants.map((v) => ({
      variant: v,
      distance: v.config ? configDistance(currentConfig, v.config) : Infinity,
    }));
    withDistance.sort((a, b) => a.distance - b.distance);
    return withDistance.map((item) => item.variant);
  }, [allVariants, currentConfig]);

  const recentVariants = useMemo(() => allVariants.slice(-20), [allVariants]);
  const groupedVariants = useMemo(() => groupByProximity([...allVariants]), [allVariants]);
  const selectedVariant = useMemo(
    () => allVariants.find((v) => v.id === selectedVariantId) ?? null,
    [allVariants, selectedVariantId]
  );

  if (allVariants.length === 0) return null;

  // Expanded: full-screen overlay replacing the bottom bar
  if (expanded) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden border-t border-white/5 bg-[#0a0a0a]">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#0e0e0e] shrink-0">
          <span className="text-[11px] font-semibold text-white/30 uppercase tracking-widest">
            Alle afbeeldingen ({allVariants.length})
          </span>
          <button
            onClick={onToggleExpanded}
            className="flex items-center gap-1 text-[11px] text-white/40 hover:text-white/70 transition-colors cursor-pointer"
          >
            Sluiten
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Selected image preview */}
        {selectedVariant && (
          <div className="shrink-0 flex items-center justify-center p-4 bg-[#0a0a0a]" style={{ height: "40%" }}>
            <div className="relative max-h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedVariant.imageUrl}
                alt="Render"
                className="max-h-full object-contain"
                style={{ maxHeight: "calc(40vh - 48px)" }}
              />
              {selectedVariant.config && (
                <TenderStoryBubble config={selectedVariant.config} />
              )}
              <button
                onClick={() => downloadImage(selectedVariant.imageUrl, `sustainer-render.png`)}
                className="absolute bottom-3 right-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 text-white/90 hover:bg-black/80 hover:text-white transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">Download</span>
              </button>
            </div>
          </div>
        )}

        {/* Grouped thumbnails grid */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 border-t border-white/5">
          {groupedVariants.map((group) => (
            <div key={group.label}>
              <h4 className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-2">
                {group.label}
                <span className="ml-2 text-white/20">({group.variants.length})</span>
              </h4>
              <div className="flex gap-2 flex-wrap">
                {group.variants.map((variant, i) => (
                  <ThumbnailCard
                    key={variant.id}
                    variant={variant}
                    index={i}
                    isSelected={variant.id === selectedVariantId}
                    onSelect={() => onSelectVariant(variant.id)}
                    onDelete={() => onDeleteVariant(variant.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Collapsed: sorted by closest match to current config
  const displayVariants = sortedByClosest.slice(0, 20);
  return (
    <div className="border-t border-white/5 bg-[#0e0e0e] shrink-0">
      <div className="flex items-center justify-between px-4 pt-2">
        <span className="text-[11px] font-semibold text-white/30 uppercase tracking-widest">
          Dichtsbijzijnd ({displayVariants.length}/{allVariants.length})
        </span>
        {allVariants.length > 20 && (
          <button
            onClick={onToggleExpanded}
            className="flex items-center gap-1 text-[11px] text-white/40 hover:text-white/70 transition-colors cursor-pointer"
          >
            Alle {allVariants.length} tonen
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <div className="px-4 py-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {displayVariants.map((variant, i) => (
            <ThumbnailCard
              key={variant.id}
              variant={variant}
              index={i}
              isSelected={variant.id === selectedVariantId}
              onSelect={() => onSelectVariant(variant.id)}
              onDelete={() => onDeleteVariant(variant.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
