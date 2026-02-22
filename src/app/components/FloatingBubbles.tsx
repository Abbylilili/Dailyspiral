import { motion } from "motion/react";
import { useEffect, useState } from "react";

export function FloatingBubbles({ variant = 'pastel' }: { variant?: 'pastel' | 'zen' }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (variant === 'zen') {
    return (
      <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#f9fafb] pointer-events-none">
         {/* 1. Soft Yellow - Top Left */}
        <motion.div
          className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-yellow-100/60 rounded-full blur-[100px]"
          animate={{
            x: [0, 20, -10, 0],
            y: [0, 15, -15, 0],
            scale: [1, 1.05, 0.95, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* 2. Emerald/Green - Top Right */}
        <motion.div
          className="absolute top-[-5%] right-[-15%] w-[55vw] h-[55vw] bg-emerald-100/50 rounded-full blur-[100px]"
          animate={{
            x: [0, -20, 10, 0],
            y: [0, 30, 10, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />

        {/* 3. Gray/Stone - Bottom Left */}
        <motion.div
          className="absolute bottom-[-10%] left-[-5%] w-[45vw] h-[45vw] bg-gray-200/50 rounded-full blur-[90px]"
          animate={{
            x: [0, 20, -20, 0],
            y: [0, -20, 20, 0],
            scale: [1, 0.95, 1.05, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
        />

        {/* 4. White/Light - Bottom Right */}
        <motion.div
          className="absolute bottom-[-15%] right-[-5%] w-[60vw] h-[60vw] bg-white/80 rounded-full blur-[100px]"
          animate={{
            x: [0, -30, 20, 0],
            y: [0, -20, 10, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{
            duration: 19,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#fffdfa] pointer-events-none">
      
      {/* 1. Purple Zone - Top Left (Distinct blob, not full coverage) */}
      <motion.div
        className="absolute top-[-5%] left-[-5%] w-[45vw] h-[45vw] bg-purple-300/40 rounded-full blur-[100px]"
        animate={{
          x: [0, 20, -10, 0],
          y: [0, 15, -15, 0],
          scale: [1, 1.05, 0.95, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* 2. Orange/Peach Zone - Top Right (Prominent but soft) */}
      <motion.div
        className="absolute top-[-10%] right-[-10%] w-[55vw] h-[55vw] bg-orange-300/40 rounded-full blur-[100px]"
        animate={{
          x: [0, -20, 10, 0],
          y: [0, 30, 10, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      {/* 3. Blue/Cyan Zone - Left/Center (Leaving Bottom Left Corner White) */}
      <motion.div
        className="absolute top-[40%] left-[-15%] w-[40vw] h-[40vw] bg-blue-300/30 rounded-full blur-[90px]"
        animate={{
          x: [0, 20, -20, 0],
          y: [0, -20, 20, 0],
          scale: [1, 0.95, 1.05, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        }}
      />

      {/* 4. Warm Pink Zone - Bottom Right (Soft glow) */}
      <motion.div
        className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-pink-100/40 rounded-full blur-[100px]"
        animate={{
          x: [0, -30, 20, 0],
          y: [0, -20, 10, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 19,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      
      {/* Removed Center Highlight to prevent "filling up" the white space */}
    </div>
  );
}
