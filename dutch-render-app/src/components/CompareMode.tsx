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
      className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col"
    >
      <div className="flex items-center justify-between px-8 py-4 border-b border-black/5">
        <h2 className="text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-black/50">
          {variants.length} varianten
        </h2>
        <button
          onClick={onClose}
          className="w-9 h-9 bg-black/5 flex items-center justify-center text-black/40 hover:text-black hover:bg-black/10 transition-all cursor-pointer"
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
            className="relative overflow-hidden ghost-border"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={variant.imageUrl}
              alt={`Variant ${i + 1}`}
              className="w-full h-full object-contain"
            />
            <button
              className="absolute top-3 right-3 w-8 h-8 bg-black/80 flex items-center justify-center text-white hover:bg-black transition-all cursor-pointer"
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
