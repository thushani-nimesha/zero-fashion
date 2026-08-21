import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = ({ onComplete }) => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(10px)" }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] text-white"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        {/* Sony-style staggered letter animation */}
        <div className="font-heading text-4xl md:text-5xl font-extrabold tracking-[0.2em] flex flex-wrap justify-center gap-x-6 mb-8 uppercase select-none">
          <div className="flex">
            {"ZERO".split("").map((char, index) => (
              <motion.span
                key={`zero-${index}`}
                initial={{ opacity: 0, filter: "blur(8px)", y: 5 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.08,
                  ease: [0.25, 1, 0.5, 1]
                }}
                className="text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]"
              >
                {char}
              </motion.span>
            ))}
          </div>
          <div className="flex">
            {"FASHION".split("").map((char, index) => (
              <motion.span
                key={`fashion-${index}`}
                initial={{ opacity: 0, filter: "blur(8px)", y: 5 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: (index + 4) * 0.08,
                  ease: [0.25, 1, 0.5, 1]
                }}
                className="text-primary drop-shadow-[0_0_12px_hsl(var(--primary)/0.4)]"
              >
                {char}
              </motion.span>
            ))}
          </div>
        </div>
        
        {/* Elegant thin progress bar */}
        <div className="w-48 md:w-64 h-[1px] bg-neutral-800 relative overflow-hidden mt-4">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: [0.76, 0, 0.24, 1] }}
            onAnimationComplete={() => {
              setTimeout(onComplete, 400);
            }}
            className="absolute top-0 left-0 h-full bg-white"
          />
        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-6 text-[10px] uppercase tracking-[0.3em] text-neutral-400"
        >
          Curating your style
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default LoadingScreen;
