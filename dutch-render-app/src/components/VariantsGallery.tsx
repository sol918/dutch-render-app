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
  if (a.style !== b.style) dist += 10;
  if (a.geometry.crossGables !== b.geometry.crossGables) dist += 5;
  if (a.geometry.stepping !== b.geometry.stepping) dist += 4;
  dist += Math.abs(a.geometry.numberOfHouses - b.geometry.numberOfHouses) * 0.3;
  dist += Math.abs(a.geometry.width - b.geometry.width) * 0.2;
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
    "jaren-30": "Jaren '30",
    "modern": "Modern",
    "landelijk": "Landelijk",
    "biobased": "Biobased",
    // Legacy labels for old renders
    "moderne-stadswoning": "Modern",
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: Math.min(index * 0.02, 0.2) }}
      className="shrink-0 relative group p-1"
    >
      <div
        onClick={onSelect}
        className={cn(
          "w-28 h-[72px] overflow-hidden transition-all cursor-pointer border-2",
          isSelected
            ? "border-black"
            : "border-transparent opacity-60 hover:opacity-100"
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={variant.imageUrl} alt="Render" className="w-full h-full object-cover" />
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="absolute top-0 right-0 w-5 h-5 bg-black text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-black/70 z-10"
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

  // Expanded: full-screen overlay
  if (expanded) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden border-t border-black/5 bg-[#F9F9F9]">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#F4F3F3] shrink-0">
          <span className="text-[0.6875rem] font-bold text-black/30 uppercase tracking-[0.1em]">
            Alle afbeeldingen ({allVariants.length})
          </span>
          <button
            onClick={onToggleExpanded}
            className="flex items-center gap-1 text-[0.6875rem] text-black/40 hover:text-black/70 transition-colors cursor-pointer uppercase tracking-[0.05em] font-medium"
          >
            Sluiten
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Selected image preview */}
        {selectedVariant && (
          <div className="shrink-0 flex items-center justify-center p-4 bg-[#F9F9F9]" style={{ height: "40%" }}>
            <div className="relative max-h-full overflow-hidden ghost-border">
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
                onClick={() => downloadImage(selectedVariant.imageUrl, `vlakwerk-render.png`)}
                className="absolute bottom-3 right-3 flex items-center gap-2 px-3 py-2 bg-black text-white text-[0.6875rem] font-bold uppercase tracking-[0.1em] hover:bg-black/80 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
            </div>
          </div>
        )}

        {/* Grouped thumbnails grid */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-6 border-t border-black/5">
          {groupedVariants.map((group) => (
            <div key={group.label}>
              <h4 className="text-[0.6875rem] font-bold text-black/30 uppercase tracking-[0.1em] mb-2">
                {group.label}
                <span className="ml-2 text-black/20">({group.variants.length})</span>
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

  // Collapsed: sorted by closest match
  const displayVariants = sortedByClosest.slice(0, 20);
  return (
    <div className="border-t border-black/5 bg-[#F4F3F3] shrink-0">
      <div className="flex items-center justify-between px-4 pt-2">
        <span className="text-[0.6875rem] font-bold text-black/30 uppercase tracking-[0.1em]">
          Dichtsbijzijnd ({displayVariants.length}/{allVariants.length})
        </span>
        {allVariants.length > 20 && (
          <button
            onClick={onToggleExpanded}
            className="flex items-center gap-1 text-[0.6875rem] text-black/40 hover:text-black/70 transition-colors cursor-pointer uppercase tracking-[0.05em] font-medium"
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
