"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, X, Copy, Check } from "lucide-react";
import { RenderConfig } from "@/types";
import { generateTenderStory } from "@/lib/tender-story";

interface TenderStoryBubbleProps {
  config: RenderConfig;
}

export function TenderStoryBubble({ config }: TenderStoryBubbleProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const story = generateTenderStory(config);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(story);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div ref={panelRef} className="absolute top-3 right-3 z-30">
      {/* Trigger bubble */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="w-9 h-9 rounded-full bg-indigo-500/80 backdrop-blur-md border border-indigo-400/30 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 cursor-pointer hover:bg-indigo-500 transition-colors"
            title="Tenderverhaal bekijken"
          >
            <FileText className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded story panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10, originX: 1, originY: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute top-0 right-0 w-[420px] max-h-[70vh] bg-[#111111]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/60 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">
                  Tenderverhaal
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-white/50 hover:text-white/80 hover:bg-white/5 transition-all cursor-pointer"
                  title="Kopieer naar klembord"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Gekopieerd</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Kopieer</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/5 transition-all cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Story content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 text-[13px] leading-relaxed text-white/75">
              {story.split("\n\n").map((paragraph, i) => {
                // First line is the title
                if (i === 0) {
                  return (
                    <h3
                      key={i}
                      className="text-sm font-semibold text-white/90 mb-4"
                    >
                      {paragraph}
                    </h3>
                  );
                }
                return (
                  <p key={i} className="mb-3 last:mb-0">
                    {paragraph}
                  </p>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
