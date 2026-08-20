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
        <motion.img
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          src="/file_00000000e5488211a30a7a0c477318d0.png"
          alt="Zero Fashion Loading"
          className="h-24 md:h-32 mb-8 object-contain drop-shadow-2xl"
        />
        
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
