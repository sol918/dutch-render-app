"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
            onClick={() => setOpen(true)}
            className="w-9 h-9 bg-black text-white flex items-center justify-center cursor-pointer hover:bg-black/80 transition-colors"
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
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute top-0 right-0 w-[420px] max-h-[70vh] bg-white border border-black/10 shadow-[0_20px_40px_rgba(0,0,0,0.04)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-black/5 shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-black/40" />
                <span className="text-[0.6875rem] font-bold text-black/50 uppercase tracking-[0.1em]">
                  Tenderverhaal
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-[0.6875rem] font-medium text-black/40 hover:text-black/70 hover:bg-black/5 transition-all cursor-pointer"
                  title="Kopieer naar klembord"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-black" />
                      <span className="text-black">Gekopieerd</span>
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
                  className="w-7 h-7 flex items-center justify-center text-black/30 hover:text-black/70 hover:bg-black/5 transition-all cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Story content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 text-[0.8125rem] leading-relaxed text-black/60">
              {story.split("\n\n").map((paragraph, i) => {
                if (i === 0) {
                  return (
                    <h3
                      key={i}
                      className="text-[0.875rem] font-bold text-black/80 mb-4 uppercase tracking-tight"
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
