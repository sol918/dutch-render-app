"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface PromptPreviewProps {
  prompt: string;
}

export function PromptPreview({ prompt }: PromptPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-stone-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-stone-50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2 text-sm text-stone-600">
          <FileText className="w-4 h-4" />
          <span className="font-medium">Prompt preview</span>
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-stone-400 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4">
              <pre className="text-xs text-stone-500 whitespace-pre-wrap bg-stone-50 rounded-lg p-3 max-h-64 overflow-y-auto font-mono leading-relaxed">
                {prompt}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
