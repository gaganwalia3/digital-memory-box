import { motion } from "framer-motion";
import { Heart, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { GiftConfig } from "@/components/gift/GiftSettingsPanel";

interface FloatingElement {
  id: number;
  type: "heart" | "star";
  x: number;
  y: number;
  scale: number;
  rotation: number;
  duration: number;
  delay: number;
}

interface FloatingBackgroundProps {
  theme?: GiftConfig["theme"];
}

const themeBgClasses = {
  pink: {
    blob1: "bg-pink-300",
    blob2: "bg-purple-300",
    heart: "text-pink-300/40 fill-pink-300/40",
    pageBg: "bg-[#faf8ff]"
  },
  ocean: {
    blob1: "bg-sky-300",
    blob2: "bg-blue-300",
    heart: "text-sky-300/40 fill-sky-300/40",
    pageBg: "bg-[#f0f9ff]"
  },
  midnight: {
    blob1: "bg-indigo-900",
    blob2: "bg-slate-800",
    heart: "text-indigo-400/40 fill-indigo-400/40",
    pageBg: "bg-[#020617]"
  },
  gold: {
    blob1: "bg-amber-200",
    blob2: "bg-yellow-200",
    heart: "text-amber-300/50 fill-amber-300/50",
    pageBg: "bg-[#fffbeb]"
  }
};

export const FloatingBackground = ({ theme = "pink" }: FloatingBackgroundProps) => {
  const [elements, setElements] = useState<FloatingElement[]>([]);

  useEffect(() => {
    const generateElements = () => {
      return Array.from({ length: 25 }).map((_, i) => ({
        id: i,
        type: Math.random() > 0.4 ? "heart" : "star" as "heart" | "star",
        x: Math.random() * 100,
        y: Math.random() * 100,
        scale: Math.random() * 0.8 + 0.4,
        rotation: Math.random() * 360,
        duration: Math.random() * 10 + 15,
        delay: Math.random() * -20,
      }));
    };

    setElements(generateElements());
  }, []);

  const styles = themeBgClasses[theme];

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden select-none z-0 ${styles.pageBg} transition-colors duration-1000`}>
      <motion.div 
        animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        style={{ willChange: "transform" }}
        className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[140px] opacity-40 mix-blend-multiply transition-colors duration-1000 ${styles.blob1}`} 
      />
      <motion.div 
        animate={{ 
            scale: [1, 1.3, 1],
            x: [0, -60, 0],
            y: [0, -40, 0]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        style={{ willChange: "transform" }}
        className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[140px] opacity-40 mix-blend-multiply transition-colors duration-1000 ${styles.blob2}`} 
      />

      {elements.map((el) => (
        <motion.div
          key={el.id}
          initial={{
            x: `${el.x}vw`,
            y: `${el.y}vh`,
            scale: el.scale,
            rotate: el.rotation,
            opacity: 0
          }}
          animate={{
            y: [`${el.y}vh`, `${el.y - 30}vh`, `${el.y}vh`],
            rotate: [el.rotation, el.rotation + 180, el.rotation + 360],
            opacity: [0.1, 0.4, 0.1]
          }}
          transition={{
            duration: el.duration,
            repeat: Infinity,
            delay: el.delay,
            ease: "linear"
          }}
          className="absolute"
          style={{ willChange: "transform, opacity" }}
        >
          {el.type === "heart" ? (
            <Heart className={`w-8 h-8 transition-colors duration-1000 ${styles.heart}`} />
          ) : (
            <Star className={`w-6 h-6 text-yellow-300/40 fill-yellow-300/40 transition-colors duration-1000`} />
          )}
        </motion.div>
      ))}
    </div>
  );
};
