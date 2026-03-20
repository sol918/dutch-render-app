"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, Download } from "lucide-react";
import { GeneratedVariant } from "@/types";
import { LoadingState } from "./LoadingState";
import { TenderStoryBubble } from "./TenderStoryBubble";

interface PreviewAreaProps {
  selectedVariant: GeneratedVariant | null;
  isGenerating: boolean;
  error: string | null;
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
  error,
}: PreviewAreaProps) {
  return (
    <div className="flex-1 overflow-hidden relative">
      {/* Main image or empty state — always visible, even while generating */}
      <div className="h-full flex flex-col items-center justify-center p-6">
        {/* Error toast — shown on top of existing image if there is one */}
        <AnimatePresence>
          {error && !isGenerating && (
            <motion.div
              key="error-toast"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`absolute top-4 left-1/2 -translate-x-1/2 z-20 ${error === "QUOTA_EXCEEDED" ? "bg-amber-500/15 border-amber-500/25" : "bg-red-500/15 border-red-500/25"} border backdrop-blur-md rounded-xl px-5 py-3 text-center max-w-md`}
            >
              <p className={`text-sm font-medium ${error === "QUOTA_EXCEEDED" ? "text-amber-300" : "text-red-300"}`}>
                {error === "QUOTA_EXCEEDED"
                  ? "API quota bereikt — schakel facturering in voor uw Google Cloud project."
                  : error}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {selectedVariant ? (
          <motion.div
            key={`variant-${selectedVariant.id}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full h-full flex items-center justify-center relative"
          >
            <div className="relative max-h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50">
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
              {/* Download button overlaid on image */}
              <button
                onClick={() =>
                  downloadImage(selectedVariant.imageUrl, `sustainer-render.png`)
                }
                className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 text-white/90 hover:bg-black/80 hover:text-white transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Download</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <motion.div
              animate={{ opacity: [0.15, 0.25, 0.15] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="w-28 h-28 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-6"
            >
              <ImageIcon className="w-14 h-14 text-white/20" />
            </motion.div>
            <p className="text-sm text-white/25 max-w-xs mx-auto">
              Configureer links en klik op Genereer Render
            </p>
          </motion.div>
        )}
      </div>

      {/* Loading overlay — floats on top, doesn't replace content */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0a0a0a]/80 backdrop-blur-sm flex items-center justify-center z-10"
          >
            <LoadingState />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
