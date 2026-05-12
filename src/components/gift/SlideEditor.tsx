import { motion } from "framer-motion";
import { X, ImagePlus, Heart, Star, Sparkles, Video } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useRef, useState } from "react";
import { compressImage } from "@/lib/utils";
import { toast } from "sonner";

interface Slide {
  text: string;
  image: string;
  videoUrl?: string;
  isEnvelope?: boolean;
}

interface SlideEditorProps {
  slide: Slide;
  index: number;
  onUpdate: (index: number, slide: Slide) => void;
  onRemove: (index: number) => void;
}

const SlideEditor = ({ slide, index, onUpdate, onRemove }: SlideEditorProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showVideoInput, setShowVideoInput] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressedDataUrl = await compressImage(file);
      onUpdate(index, { ...slide, image: compressedDataUrl, videoUrl: "" });
    } catch (err) {
      console.warn("Compression unsupported or failed.", err);
      if (file.type === "image/heic" || file.name.toLowerCase().endsWith(".heic")) {
         toast.error("HEIC format is not supported. Please upload a JPEG or PNG.");
      } else {
         toast.error("Failed to process image. Try a smaller photo.");
      }
    }
  };
  
  const handleUrlInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate(index, { ...slide, videoUrl: e.target.value, image: "" });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.9, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.9, y: -20, filter: "blur(4px)" }}
      transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative flex-shrink-0 w-[320px] rounded-[2rem] border-2 border-white/40 bg-white/40 backdrop-blur-xl p-5 shadow-[0_8px_40px_rgba(236,72,153,0.15)] overflow-visible group transition-all duration-300 hover:bg-white/60 hover:shadow-[0_12px_50px_rgba(236,72,153,0.25)] hover:border-pink-200/60"
    >
      {/* Decorative corner icon */}
      <motion.div 
        animate={{ rotate: isHovered ? [0, -15, 15, -15, 15, 0] : 0, scale: isHovered ? 1.2 : 1 }}
        transition={{ duration: 0.5 }}
        className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 text-white flex items-center justify-center shadow-lg"
      >
        <Heart className="w-5 h-5 fill-current" />
      </motion.div>

      <button
        onClick={() => onRemove(index)}
        className="absolute -top-3 -right-3 w-10 h-10 flex items-center justify-center rounded-full bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 shadow-lg border border-gray-100 transition-all active:scale-90 z-10"
        aria-label="Remove slide"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-center justify-between mb-4 mt-2">
        <p className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500 uppercase tracking-widest pl-4">
          Memory #{index + 1}
        </p>
        <Sparkles className="w-4 h-4 text-pink-300 opacity-60" />
      </div>

      {/* Media Rendering */}
      {slide.image ? (
        <div className="relative mb-5 rounded-2xl overflow-hidden aspect-video bg-pink-50/50 shadow-inner group/img border-2 border-transparent hover:border-pink-200 transition-colors">
          <img
            src={slide.image}
            alt={`Slide ${index + 1}`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110"
          />
          <button
            onClick={() => onUpdate(index, { ...slide, image: "" })}
            className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-all active:scale-90 opacity-0 group-hover/img:opacity-100"
            aria-label="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : slide.videoUrl ? (
         <div className="relative mb-5 rounded-2xl overflow-hidden aspect-video bg-indigo-50/50 shadow-inner group/vid border-2 border-transparent hover:border-indigo-200 transition-colors flex items-center justify-center p-4">
           {slide.videoUrl.includes('drive.google.com') || slide.videoUrl.includes('youtube.com') || slide.videoUrl.includes('youtu.be') ? (
             <Video className="w-10 h-10 text-indigo-400 opacity-50" />
           ) : (
             <span className="text-xs text-center font-semibold text-gray-500 break-all">{slide.videoUrl.slice(0, 40)}...</span>
           )}
           <div className="absolute inset-0 bg-transparent flex flex-col justify-end p-2 opacity-100 bg-gradient-to-t from-gray-900/40 to-transparent">
             <span className="text-[10px] text-white font-bold tracking-wider uppercase">Video Link Saved</span>
           </div>
           <button
            onClick={() => onUpdate(index, { ...slide, videoUrl: "" })}
            className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-all active:scale-90 opacity-0 group-hover/vid:opacity-100"
            aria-label="Remove video link"
          >
            <X className="w-4 h-4" />
          </button>
         </div>
      ) : (
         <>
         {showVideoInput ? (
             <div className="mb-5 flex flex-col gap-2">
                 <Input 
                   type="text" 
                   autoFocus
                   placeholder="Paste YouTube or Drive Link..." 
                   className="rounded-xl border-pink-200 bg-white/70 h-10 shadow-sm focus-visible:ring-indigo-300 font-medium text-xs text-gray-700"
                   onChange={handleUrlInput}
                 />
                 <button 
                  onClick={() => setShowVideoInput(false)}
                  className="text-xs text-gray-400 hover:text-gray-600 font-semibold"
                 >
                     Cancel
                 </button>
             </div>
         ) : (
             <div className="flex gap-2 mb-5">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-square md:aspect-video rounded-2xl border-[2px] border-dashed border-pink-200 bg-pink-50/40 flex flex-col items-center justify-center gap-2 text-pink-400 hover:border-pink-400 hover:text-pink-500 hover:bg-pink-100/50 transition-all shadow-sm"
                >
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <ImagePlus className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider">Photo</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowVideoInput(true)}
                  className="w-full aspect-square md:aspect-video rounded-2xl border-[2px] border-dashed border-indigo-200 bg-indigo-50/40 flex flex-col items-center justify-center gap-2 text-indigo-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-100/50 transition-all shadow-sm"
                >
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <Video className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider">Video Link</span>
                </motion.button>
            </div>
         )}
         </>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      <div className="relative">
        <Textarea
          value={slide.text}
          onChange={(e) => onUpdate(index, { ...slide, text: e.target.value })}
          placeholder="Pour your heart out here..."
          className="resize-none text-sm font-medium min-h-[100px] rounded-2xl border-0 bg-white/60 focus:bg-white focus:ring-4 focus:ring-pink-200/50 transition-all shadow-inner placeholder:text-gray-400 placeholder:font-normal pb-8 scrollbar-hide"
        />
        
        {slide.text && (
            <div className="absolute top-2 right-2 flex items-center justify-center p-2">
               <button 
                  onClick={() => onUpdate(index, { ...slide, isEnvelope: !slide.isEnvelope })}
                  className={`text-[10px] font-bold px-3 py-1 rounded-full border transition-all ${slide.isEnvelope ? 'bg-pink-100 border-pink-300 text-pink-600' : 'bg-white/40 border-gray-200 text-gray-400 hover:text-gray-600'}`}
               >
                  {slide.isEnvelope ? "Envelope On" : "Wrap in Envelope"}
               </button>
            </div>
        )}

        <div className="absolute bottom-3 right-3 opacity-30 pointer-events-none">
          <Star className="w-5 h-5 fill-pink-400 text-pink-400" />
        </div>
      </div>
    </motion.div>
  );
};

export default SlideEditor;
