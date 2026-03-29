"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Download } from "lucide-react";
import { GeneratedVariant } from "@/types";
import { LoadingState } from "./LoadingState";
import { TenderStoryBubble } from "./TenderStoryBubble";

interface PreviewAreaProps {
  selectedVariant: GeneratedVariant | null;
  isGenerating: boolean;
  isRefining: boolean;
  error: string | null;
  onRefine: () => void;
}

function downloadImage(src: string, filename: string) {
  const link = document.createElement("a");
  link.href = src;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function PreviewArea({
  selectedVariant,
  isGenerating,
  isRefining,
  error,
  onRefine,
}: PreviewAreaProps) {
  return (
    <div className="flex-1 overflow-hidden relative bg-[#F9F9F9]">
      {/* Main image or empty state */}
      <div className="h-full flex flex-col items-center justify-center p-8">
        {/* Error toast */}
        <AnimatePresence>
          {error && !isGenerating && !isRefining && (
            <motion.div
              key="error-toast"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-[#E8E8E8] border-black/10 border px-5 py-3 text-center max-w-md"
            >
              <p className="text-[0.8125rem] font-medium text-black/70">
                {error === "QUOTA_EXCEEDED"
                  ? "API quota bereikt — schakel facturering in voor uw Google Cloud project."
                  : error}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {selectedVariant ? (
          <div
            key={`variant-${selectedVariant.id}`}
            className="w-full h-full flex items-center justify-center relative"
          >
            <div className="relative max-h-full overflow-hidden ghost-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedVariant.imageUrl}
                alt="Render"
                className="max-h-[calc(100vh-220px)] object-contain"
              />
              {/* Tender story bubble */}
              {selectedVariant.config && (
                <TenderStoryBubble config={selectedVariant.config} />
              )}
              {/* Action buttons */}
              <div className="absolute bottom-4 right-4 flex gap-2">
                {selectedVariant.config && (
                  <button
                    onClick={onRefine}
                    disabled={isRefining || isGenerating}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white text-black text-[0.75rem] font-bold uppercase tracking-[0.1em] border border-black/10 hover:bg-black/5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isRefining ? "Bezig..." : "Verfijn"}
                  </button>
                )}
                <button
                  onClick={() =>
                    downloadImage(selectedVariant.imageUrl, `vlakwerk-render.png`)
                  }
                  className="flex items-center gap-2 px-4 py-2.5 bg-black text-white text-[0.75rem] font-bold uppercase tracking-[0.1em] hover:bg-black/80 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-24 h-24 bg-black/5 flex items-center justify-center mx-auto mb-8">
              <span className="text-[2rem] font-black text-black/10 tracking-tighter">VW</span>
            </div>
            <p className="text-[0.8125rem] text-black/25 max-w-xs mx-auto uppercase tracking-[0.05em]">
              Configureer links en klik op Genereer Render
            </p>
          </div>
        )}
      </div>

      {/* Loading overlay */}
      <AnimatePresence>
        {(isGenerating || isRefining) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#F9F9F9]/90 backdrop-blur-sm flex items-center justify-center z-10"
          >
            <LoadingState label={isRefining ? "Verfijnen" : undefined} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
