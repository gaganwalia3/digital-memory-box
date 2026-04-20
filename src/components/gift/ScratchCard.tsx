import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface ScratchCardProps {
  secretMessage: string;
}

const ScratchCard = ({ secretMessage }: ScratchCardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set up high-DPI canvas
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const { width, height } = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Paint silver foil
    ctx.fillStyle = "#e5e7eb"; // light gray/silver
    ctx.fillRect(0, 0, width, height);

    // Add some noise for a foil texture
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imgData.data.length; i += 4) {
      if (Math.random() > 0.5) {
        const shade = 200 + Math.random() * 40;
        imgData.data[i] = shade;
        imgData.data[i + 1] = shade;
        imgData.data[i + 2] = shade;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Add "Scratch Me" text over the foil
    ctx.font = "bold 20px system-ui";
    ctx.fillStyle = "#9ca3af";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Scratch to reveal", width / 2, height / 2);

    let isDrawing = false;
    let scratchedPixels = 0;
    const totalPixels = width * height;

    const scratch = (x: number, y: number) => {
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fill();

      // Check if enough is revealed (e.g. 40%)
      // Because getImagedata is slow, we just roughly approximate or wait for user to scratch a lot
      scratchedPixels += Math.PI * 20 * 20;
      if (scratchedPixels / totalPixels > 0.8 && !isRevealed) {
        setIsRevealed(true);
        // Fade out canvas
        canvas.style.opacity = "0";
        setTimeout(() => {
            canvas.style.display = "none";
        }, 500);
      }
    };

    const handleStart = (e: MouseEvent | TouchEvent) => {
      isDrawing = true;
      handleMove(e);
    };

    const handleEnd = () => {
      isDrawing = false;
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing) return;
      e.preventDefault();
      
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      
      scratch(clientX - rect.left, clientY - rect.top);
    };

    canvas.addEventListener("mousedown", handleStart);
    window.addEventListener("mouseup", handleEnd);
    canvas.addEventListener("mousemove", handleMove);

    canvas.addEventListener("touchstart", handleStart, { passive: false });
    window.addEventListener("touchend", handleEnd);
    canvas.addEventListener("touchmove", handleMove, { passive: false });

    return () => {
      canvas.removeEventListener("mousedown", handleStart);
      window.removeEventListener("mouseup", handleEnd);
      canvas.removeEventListener("mousemove", handleMove);
      canvas.removeEventListener("touchstart", handleStart);
      window.removeEventListener("touchend", handleEnd);
      canvas.removeEventListener("touchmove", handleMove);
    };
  }, [isRevealed]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.8 }}
      className="mt-8 text-center"
    >
      <div className="flex items-center justify-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-gray-400" />
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Secret Message</h3>
        <Sparkles className="w-5 h-5 text-gray-400" />
      </div>

      <div 
        ref={containerRef}
        className="relative w-full max-w-sm mx-auto h-48 rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-6"
      >
        {/* The hidden text */}
        <p className="text-xl md:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-br from-pink-500 to-purple-500 leading-tight select-none">
          {secretMessage}
        </p>

        {/* The scratchable overlay */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-crosshair transition-opacity duration-500"
          style={{ touchAction: "none" }}
        />
      </div>
    </motion.div>
  );
};

export default ScratchCard;
