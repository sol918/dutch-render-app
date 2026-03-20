"use client";

import { motion } from "framer-motion";
import { Lock, Info } from "lucide-react";
import { GreyVolumeImage } from "@/types";

interface ConstraintsSummaryProps {
  baseImage: GreyVolumeImage | null;
  requestedWidth: number;
}

export function ConstraintsSummary({
  baseImage,
  requestedWidth,
}: ConstraintsSummaryProps) {
  if (!baseImage) return null;

  const constraints = [
    { label: "Woningen", value: baseImage.numberOfHouses },
    { label: "Breedte", value: `${baseImage.width.toFixed(1)}m` },
    { label: "Dwarskappen", value: baseImage.crossGables ? "Ja" : "Nee" },
    { label: "Verspringend", value: baseImage.stepping ? "Ja" : "Nee" },
  ];

  const widthDiff = Math.abs(requestedWidth - baseImage.width);

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3"
    >
      <div className="flex items-center gap-2 mb-2">
        <Lock className="w-3.5 h-3.5 text-stone-500" />
        <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
          Vergrendelde geometrie
        </span>
      </div>
      <div className="flex gap-4">
        {constraints.map((c) => (
          <div key={c.label} className="text-center">
            <div className="text-xs text-stone-400">{c.label}</div>
            <div className="text-sm font-semibold text-stone-700">{c.value}</div>
          </div>
        ))}
      </div>
      {widthDiff > 0.01 && (
        <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-600">
          <Info className="w-3 h-3" />
          <span>
            Aangevraagd {requestedWidth.toFixed(1)}m, dichtstbijzijnde beschikbare breedte: {baseImage.width.toFixed(1)}m
          </span>
        </div>
      )}
    </motion.div>
  );
}
