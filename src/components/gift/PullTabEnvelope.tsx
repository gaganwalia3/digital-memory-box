import { useState } from "react";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";

interface PullTabEnvelopeProps {
  text: string;
}

export const PullTabEnvelope = ({ text }: PullTabEnvelopeProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full flex justify-center my-6">
      <div 
        className="relative w-full max-w-sm h-48 cursor-pointer group perspective-[1000px]"
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* The Envelope Body (Bottom Z) */}
        <div className="absolute inset-0 bg-[#e4ba7e] rounded-xl shadow-md border border-[#c49b64] overflow-hidden">
            {/* Inner envelope shadow */}
            <div className="absolute inset-x-0 bottom-0 top-10 bg-black/10 rounded-xl" />
        </div>

        {/* The Letter that slides out! */}
        <motion.div
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: isOpen ? -100 : 20, opacity: isOpen ? 1 : 0 }}
           transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
           className="absolute left-4 right-4 top-4 bottom-4 bg-[#fffdf8] shadow-lg rounded-lg border border-gray-100 p-4 pt-6 z-10 flex flex-col items-center justify-start text-center overflow-y-auto"
        >
            <p className="text-gray-800 font-serif italic text-sm md:text-base leading-relaxed break-words whitespace-pre-wrap">
                {text}
            </p>
        </motion.div>

        {/* The Envelope Front Flap (Top Z) */}
        <div className="absolute inset-x-0 bottom-0 top-16 bg-[#ebc389] shadow-[0_-5px_15px_rgba(0,0,0,0.1)] rounded-b-xl z-20 flex justify-center rounded-t-sm" style={{ clipPath: "polygon(0 40%, 50% 0, 100% 40%, 100% 100%, 0 100%)" }}>
           {/* Wax Seal or Icon */}
           <motion.div 
             animate={{ scale: isOpen ? 0.9 : 1, y: isOpen ? 20 : 0 }}
             className="mt-6 w-10 h-10 rounded-full bg-red-500/80 shadow-md border-2 border-red-600/50 flex items-center justify-center backdrop-blur-sm"
           >
              <Mail className="w-4 h-4 text-white" />
           </motion.div>
        </div>
        
        {/* Top Envelope Flap (Hinged) */}
        <motion.div
           initial={{ rotateX: 0, zIndex: 30 }}
           animate={{ rotateX: isOpen ? -180 : 0, zIndex: isOpen ? 5 : 30 }}
           transition={{ duration: 0.5, zIndex: { delay: 0.25 } }}
           className="absolute top-0 left-0 right-0 h-24 bg-[#cca164] rounded-t-xl"
           style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)", transformOrigin: "top" }}
        />

        {!isOpen && (
            <motion.div 
               animate={{ y: [0, -5, 0] }}
               transition={{ repeat: Infinity, duration: 1.5 }}
               className="absolute -bottom-8 left-0 right-0 text-center text-xs font-bold text-gray-400 uppercase tracking-widest"
            >
                Tap to open
            </motion.div>
        )}
      </div>
    </div>
  );
};
