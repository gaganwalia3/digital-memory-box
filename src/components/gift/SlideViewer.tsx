import { motion } from "framer-motion";
import ScratchCard from "@/components/gift/ScratchCard";
import { PullTabEnvelope } from "@/components/gift/PullTabEnvelope";

interface Slide {
  text: string;
  image: string;
  videoUrl?: string;
}

interface SlideViewerProps {
  slides: Slide[];
  secretMessage?: string | null;
}

// Helper to convert standard youtube or drive links into embed links
const getEmbedUrl = (url: string) => {
    if (!url) return "";
    
    // Youtube matching
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})/);
    if (ytMatch && ytMatch[1]) {
        return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }

    // Google drive matching
    const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch && driveMatch[1]) {
        return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
    }

    return url; // fallback
};

const SlideViewer = ({ slides, secretMessage }: SlideViewerProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      className="w-full max-w-lg mx-auto relative origin-top z-10"
    >
      {/* The Scroll Container */}
      <div className="relative overflow-hidden rounded-b-3xl rounded-t-xl bg-[#fffdf8] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border-x-[12px] border-b-[20px] border-[#fbf3e0] min-h-[400px] mt-4 z-20">
        
        {/* Inner shadow/texture for the scroll */}
        <div className="absolute inset-0 pointer-events-none shadow-inner opacity-40 bg-gradient-to-b from-transparent via-[#fdf5e6]/20 to-[#eaddc5]" />

        <div className="p-8 pb-16 relative z-10">
          {slides.map((slide, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.3, duration: 0.7 }}
              className={`pb-12 ${
                index !== slides.length - 1 || secretMessage 
                ? 'border-b border-pink-100/50 mb-12' 
                : ''
              }`}
            >
              {/* IMAGE HANDLING */}
              {slide.image && (
                <div className="rounded-2xl overflow-hidden mb-6 shadow-md bg-muted/30">
                  <img
                    src={slide.image}
                    alt={`Slide ${index + 1}`}
                    className="w-full object-cover"
                  />
                </div>
              )}

              {/* VIDEO URL HANDLING */}
              {slide.videoUrl && (
                  <div className="rounded-2xl overflow-hidden mb-6 shadow-md bg-black/5 aspect-video w-full border border-gray-100">
                     <iframe 
                        className="w-full h-full"
                        src={getEmbedUrl(slide.videoUrl)}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                     ></iframe>
                  </div>
              )}

              {/* TEXT HANDLING */}
              {slide.text && (
                 slide.isEnvelope ? (
                     <PullTabEnvelope text={slide.text} />
                 ) : (
                     <p className="text-gray-800 text-lg md:text-xl font-serif italic leading-relaxed text-center" style={{ overflowWrap: "break-word" }}>
                       "{slide.text}"
                     </p>
                 )
              )}
              
              {!slide.text && !slide.image && !slide.videoUrl && (
                <p className="text-muted-foreground text-sm text-center italic">
                  (Empty Slide)
                </p>
              )}
            </motion.div>
          ))}

          {secretMessage && (
            <ScratchCard secretMessage={secretMessage} />
          )}

        </div>
        
        {/* Bottom Roller Decor (mimicking a scroll bar) */}
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-r from-[#d4b886] via-[#ebb14e] to-[#d4b886] shadow-[0_-2px_10px_rgba(0,0,0,0.2)] rounded-b-xl z-20" />
      </div>

    </motion.div>
  );
};

export default SlideViewer;
