import { useState, useRef, useEffect } from "react";
import { motion, useAnimation, PanInfo } from "framer-motion";
import confetti from "canvas-confetti";

interface WrappingPaperProps {
  onTear: () => void;
  theme: "pink" | "ocean" | "midnight" | "gold";
}

const getThemeGradient = (theme: string) => {
  switch (theme) {
    case "ocean": return "from-blue-400 via-cyan-300 to-teal-400";
    case "midnight": return "from-indigo-900 via-purple-900 to-fuchsia-900";
    case "gold": return "from-amber-200 via-yellow-400 to-orange-400";
    default: return "from-pink-400 via-rose-300 to-pink-500";
  }
};

export const WrappingPaper = ({ onTear, theme }: WrappingPaperProps) => {
  const [isTorn, setIsTorn] = useState(false);
  const controlsRight = useAnimation();
  const controlsLeft = useAnimation();

  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // If they drag far enough to the right or left, tear it!
    if (Math.abs(info.offset.x) > 100 || Math.abs(info.offset.y) > 150) {
      setIsTorn(true);
      
      // Explode the halves apart
      controlsLeft.start({
        x: -window.innerWidth,
        rotate: -45,
        opacity: 0,
        transition: { duration: 0.8, ease: "easeIn" }
      });
      controlsRight.start({
        x: window.innerWidth,
        rotate: 45,
        opacity: 0,
        transition: { duration: 0.8, ease: "easeIn" }
      });

      // Small celebration confetti
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.5 },
        colors: theme === "gold" ? ["#ffd700", "#ffaa00"] : ["#ff6b9e", "#ffffff"]
      });

      setTimeout(onTear, 600);
    }
  };

  if (isTorn) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden touch-none">
      
      <motion.div
         className={`absolute inset-0 bg-gradient-to-br ${getThemeGradient(theme)}`}
         initial={{ opacity: 1 }}
         exit={{ opacity: 0 }}
      >
        {/* Subtle patterned texture on the wrapping paper */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle, #fff 2px, transparent 2px)", backgroundSize: "30px 30px" }} />
      </motion.div>

      {/* Instructional text to provoke interaction */}
      <motion.div 
         animate={{ y: [0, -10, 0] }}
         transition={{ repeat: Infinity, duration: 2 }}
         className="absolute top-1/4 z-10 bg-white/40 backdrop-blur-md px-6 py-3 rounded-full text-white font-black tracking-widest uppercase shadow-xl"
      >
         Swipe to tear open
      </motion.div>

      {/* Right Half of paper */}
      <motion.div
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.8}
        onDragEnd={handleDragEnd}
        animate={controlsRight}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-20 flex justify-center"
      >
         {/* The visual "seam" or ribbon they are tearing */}
         <div className="h-full w-4 bg-white/30 shadow-[0_0_30px_rgba(255,255,255,0.8)] backdrop-blur-sm self-center pointer-events-none" />
      </motion.div>
      
      {/* Left Half (Visual only, dragged symmetrically by the logic above) */}
      <motion.div
        animate={controlsLeft}
        className="absolute inset-y-0 left-0 w-1/2 bg-black/5 pointer-events-none z-10 border-r-2 border-white/20"
      />
    </div>
  );
};
