"use client";

import { motion } from "framer-motion";

export function LoadingState({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-28">
      {/* Minimal loading indicator */}
      <div className="relative w-16 h-16 mb-10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="absolute inset-0 border-2 border-black/10 border-t-black"
        />
      </div>

      <div className="text-center">
        <h3 className="text-[0.875rem] font-bold uppercase tracking-[0.1em] text-black/70 mb-2">
          {label || "Rendering"}
        </h3>
        <motion.p
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="text-[0.75rem] text-black/30 uppercase tracking-[0.05em]"
        >
          Materialisatie van uw ontwerp
        </motion.p>
      </div>

      <div className="mt-8 w-48 h-[2px] bg-black/5 overflow-hidden">
        <motion.div
          className="h-full bg-black"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 25, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}
