"use client";

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
    <div className="bg-white border border-black/5 px-4 py-3">
      <div className="flex items-center gap-2 mb-2">
        <Lock className="w-3.5 h-3.5 text-black/30" />
        <span className="text-[0.6875rem] font-bold text-black/40 uppercase tracking-[0.1em]">
          Vergrendelde geometrie
        </span>
      </div>
      <div className="flex gap-4">
        {constraints.map((c) => (
          <div key={c.label} className="text-center">
            <div className="text-[0.6875rem] text-black/30 uppercase tracking-[0.05em]">{c.label}</div>
            <div className="text-[0.875rem] font-bold text-black/70">{c.value}</div>
          </div>
        ))}
      </div>
      {widthDiff > 0.01 && (
        <div className="flex items-center gap-1.5 mt-2 text-[0.75rem] text-black/40">
          <Info className="w-3 h-3" />
          <span>
            Aangevraagd {requestedWidth.toFixed(1)}m, dichtstbijzijnde: {baseImage.width.toFixed(1)}m
          </span>
        </div>
      )}
    </div>
  );
}
