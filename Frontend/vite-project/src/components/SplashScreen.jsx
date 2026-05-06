import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Leaf, ScanLine } from "lucide-react";

function SplashScreen({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000); // 3 seconds splash screen
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a1910]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <div className="relative mb-8">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
          className="relative text-green-500"
        >
          <Leaf size={100} strokeWidth={1.5} />
          {/* Scanning line */}
          <motion.div
            className="absolute left-0 right-0 h-1 bg-green-400 shadow-[0_0_15px_rgba(74,222,128,0.8)]"
            initial={{ top: -10, opacity: 0 }}
            animate={{ top: 110, opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 2,
              ease: "linear",
              repeat: Infinity,
            }}
          />
        </motion.div>
        
        {/* Subtle background glow */}
        <motion.div
          className="absolute inset-0 bg-green-500 rounded-full filter blur-3xl -z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.2, scale: 1.2 }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
        />
      </div>

      <motion.h2
        className="text-2xl font-semibold tracking-wide text-green-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        Scanning Crop Health with AI...
      </motion.h2>

      {/* Loading dots */}
      <motion.div 
        className="flex mt-4 space-x-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-green-400"
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

export default SplashScreen;
