"use client";

import { motion } from "framer-motion";
import { X, Download } from "lucide-react";
import { GeneratedVariant } from "@/types";

interface CompareModeProps {
  variants: GeneratedVariant[];
  onClose: () => void;
}

export function CompareMode({ variants, onClose }: CompareModeProps) {
  if (variants.length < 2) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col"
    >
      <div className="flex items-center justify-between px-6 py-4">
        <h2 className="text-white/80 font-semibold text-sm">
          {variants.length} varianten
        </h2>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div
        className="flex-1 p-6 grid gap-4 overflow-auto"
        style={{
          gridTemplateColumns: `repeat(${Math.min(variants.length, 3)}, 1fr)`,
        }}
      >
        {variants.map((variant, i) => (
          <motion.div
            key={variant.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative rounded-2xl overflow-hidden border border-white/10"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={variant.imageUrl}
              alt={`Variant ${i + 1}`}
              className="w-full h-full object-contain"
            />
            <button
              className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/50 hover:text-white transition-all cursor-pointer"
              onClick={() => {
                const link = document.createElement("a");
                link.href = variant.imageUrl;
                link.download = `render-variant-${i + 1}.png`;
                link.click();
              }}
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
