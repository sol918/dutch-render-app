"use client";

import { motion } from "framer-motion";

const PARTICLES = Array.from({ length: 8 }, (_, i) => i);

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-28">
      <div className="relative w-32 h-32 mb-10">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="absolute inset-8 rounded-full bg-indigo-500/30 blur-xl"
        />
        <motion.div
          animate={{ scale: [0.8, 1, 0.8], opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="absolute inset-10 rounded-full bg-indigo-500/60 blur-md"
        />
        {PARTICLES.map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3 + i * 0.4, ease: "linear" }}
            style={{ transform: `rotate(${i * 45}deg)` }}
          >
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ repeat: Infinity, duration: 2, delay: i * 0.25, ease: "easeInOut" }}
              className="w-2 h-2 rounded-full bg-indigo-400"
              style={{ transform: `translateX(${36 + i * 3}px)`, filter: "blur(0.5px)" }}
            />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <h3 className="text-lg font-semibold text-white/90 mb-2">Rendering...</h3>
        <motion.p
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="text-sm text-white/40"
        >
          Materialisatie van uw ontwerp
        </motion.p>
      </motion.div>

      <div className="mt-8 w-48 h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 25, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}
