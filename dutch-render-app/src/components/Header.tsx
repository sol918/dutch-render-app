"use client";

import { motion } from "framer-motion";

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="h-14 border-b border-[#1a1a1a] bg-[#0a0a0a]/90 backdrop-blur-md px-6 flex items-center shrink-0"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
          <span className="text-white text-xs font-bold">S</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-semibold text-white/90 tracking-tight">
            Sustainer
          </span>
          <span className="text-sm text-white/40 font-light">/</span>
          <span className="text-sm font-semibold text-white/90 tracking-tight">
            VORM
          </span>
          <span className="text-sm text-white/40 ml-1">
            rijwoning
          </span>
        </div>
      </div>
    </motion.header>
  );
}
