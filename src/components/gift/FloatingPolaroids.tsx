import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface PolaroidData {
  id: number;
  image: string;
  ropeIndex: number;
  xPercent: number; // Position along the rope left to right
  staticRotation: number;
  swingOffset: number;
  swingDuration: number;
}

interface FloatingPolaroidsProps {
  images: string[];
}

export const FloatingPolaroids = ({ images }: FloatingPolaroidsProps) => {
  const [polaroids, setPolaroids] = useState<PolaroidData[]>([]);

  useEffect(() => {
    if (!images || images.length === 0) return;
    const validImages = images.filter(img => img && img.trim() !== "");
    if (validImages.length === 0) return;

    // Distribute images along 3 ropes
    const generated: PolaroidData[] = Array.from({ length: Math.min(validImages.length, 9) }).map((_, i) => {
      const isLeftSide = i % 2 === 0;
      
      return {
        id: i,
        image: validImages[i % validImages.length],
        ropeIndex: i % 3, 
        // Force images completely away from the center (Scroll Area)
        xPercent: isLeftSide 
             ? (Math.random() * 10 + 5)   // Left bound: 5% to 15%
             : (Math.random() * 10 + 85), // Right bound: 85% to 95%
        staticRotation: Math.random() * 10 - 5,
        swingOffset: Math.random() * 4 + 2, 
        swingDuration: Math.random() * 2 + 3 
      };
    });

    setPolaroids(generated);
  }, [images]);

  if (polaroids.length === 0) return null;

  // The vertical positions of our 3 ropes
  const ropePositions = ["15%", "45%", "75%"];

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden opacity-100">
      
      {/* 3 Drooping Ropes (Invisible per user request, but physics structure remains) */}
      {[0, 1, 2].map((ropeIndex) => (
         <div key={`rope-${ropeIndex}`} className="absolute w-full h-[600px]" style={{ top: ropePositions[ropeIndex] }}>
            {/* Invisible structural reference for the parabolic math */}
            <div className="absolute w-[120%] h-[200px] rounded-[50%] -left-[10%] -top-[100px] pointer-events-none opacity-0" />
         </div>
      ))}

      {/* Hanging Polaroids */}
      {polaroids.map((p) => {
         // To make them align with the curve of the rope roughly, 
         // we map their Y based on how close they are to the center (xPercent = 50%)
         // A parabola approximation: dropping lower in the middle.
         const distanceFromCenter = Math.abs(50 - p.xPercent) / 50; // 0 to 1
         const droopHeight = 200; // max drop in pixels
         const yDroopOffset = droopHeight - (Math.pow(distanceFromCenter, 2) * droopHeight);

         return (
            <div 
               key={p.id} 
               className="absolute w-[120px] md:w-[140px]"
               style={{ 
                   left: `${p.xPercent}%`, 
                   top: `calc(${ropePositions[p.ropeIndex]} - 100px + ${yDroopOffset}px)`,
                   transform: `translateX(-50%)`, // center it on exactly its X point
                   perspective: 1000
               }}
            >
               <motion.div
                 initial={{ rotate: p.staticRotation }}
                 animate={{
                   rotate: [p.staticRotation - p.swingOffset, p.staticRotation + p.swingOffset, p.staticRotation - p.swingOffset],
                 }}
                 transition={{
                   duration: p.swingDuration,
                   repeat: Infinity,
                   ease: "easeInOut",
                 }}
                 style={{ transformOrigin: "top center", willChange: "transform" }}
                 className="relative bg-white p-2 md:p-3 pb-8 md:pb-10 rounded-sm shadow-[0_10px_30px_rgba(0,0,0,0.15)] border border-gray-200 cursor-pointer pointer-events-auto hover:z-50 transition-transform hover:scale-110"
               >
                 {/* The Wooden Clip Graphic */}
                 <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-3 h-8 bg-[#b58b66] rounded-sm shadow-md flex items-center justify-center border border-[#8b613f] z-10">
                     <div className="w-[1px] h-full bg-[#8b613f] opacity-50" />
                     <div className="absolute w-5 h-[2px] bg-white/40 top-4 rounded-full" />
                 </div>

                 {/* The Image */}
                 <div className="w-full h-[100px] md:h-[120px] bg-gray-100 overflow-hidden relative shadow-inner mt-1">
                   <img src={p.image} className="w-full h-full object-cover" alt="Memory string fragment" />
                 </div>
               </motion.div>
            </div>
         );
      })}
    </div>
  );
};
