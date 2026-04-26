import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRef } from "react";
import { Lock, Palette, MessageSquareText, ImagePlus, X, KeySquare } from "lucide-react";
import { toast } from "sonner";
import { compressImage } from "@/lib/utils";

export interface GiftConfig {
  theme: "pink" | "ocean" | "midnight" | "gold";
  unlockDate: string | null;  // ISO Date string
  secretMessage: string | null;
  backgroundImages: string[];
  senderName?: string;
}

interface GiftSettingsPanelProps {
  config: GiftConfig;
  onChange: (config: GiftConfig) => void;
  section?: "top" | "bottom" | "all";
}

export const GiftSettingsPanel = ({ config, onChange, section = "all" }: GiftSettingsPanelProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGlobalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const currentImages = config.backgroundImages || [];
    if (currentImages.length >= 6) {
       toast.error("You can only add up to 6 hanging polaroids!");
       return;
    }
    
    try {
      const compressedDataUrl = await compressImage(file, 400, 0.4);
      onChange({ ...config, backgroundImages: [...currentImages, compressedDataUrl] });
      // Reset input so they can upload the same file again if they deleted it
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.warn("Compression unsupported, falling back to raw image.", err);
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ ...config, backgroundImages: [...currentImages, reader.result as string] });
        if (fileInputRef.current) fileInputRef.current.value = "";
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBackgroundImage = (idx: number) => {
      const newImages = [...(config.backgroundImages || [])];
      newImages.splice(idx, 1);
      onChange({ ...config, backgroundImages: newImages });
  };

  return (
    <div className={`w-full max-w-5xl mx-auto bg-white/60 backdrop-blur-md border border-white/50 shadow-xl rounded-3xl p-6 md:p-8 ${section === "top" ? "mb-12" : "mt-12 mb-12"}`}>
        <h3 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500 mb-6">
          {section === "bottom" ? "Advanced Settings 🔒" : "Gift Settings 🎁"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Themes */}
          {(section === "top" || section === "all") && (
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-600 uppercase tracking-wider">
              <Palette className="w-5 h-5 text-pink-400" />
              Box Theme
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["pink", "ocean", "midnight", "gold"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => onChange({ ...config, theme: t })}
                  className={`flex flex-col items-center justify-center py-4 px-2 rounded-2xl border-[3px] transition-all ${
                    config.theme === t 
                      ? "border-pink-400 bg-pink-50/80 scale-[1.02] shadow-md" 
                      : "border-white bg-white/50 hover:border-pink-200 hover:bg-white shadow-sm"
                  }`}
                >
                  <span className="capitalize font-bold text-gray-700">{t}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 font-medium">Changes the 3D Box & ambiance.</p>
          </div>
          )}

          {/* Timelock */}
          {(section === "bottom" || section === "all") && (
            <>
          <div className="space-y-4">
             <label className="flex items-center gap-2 text-sm font-bold text-gray-600 uppercase tracking-wider">
              <Lock className="w-5 h-5 text-purple-400" />
              Date Lock <span className="opacity-50 text-xs ml-1">(Optional)</span>
            </label>
            <div className="relative w-full">
              <Input 
                type="datetime-local" 
                value={config.unlockDate || ""}
                onChange={(e) => onChange({ ...config, unlockDate: e.target.value || null })}
                className="rounded-2xl border-white bg-white/70 h-14 pl-4 pr-10 shadow-sm focus-visible:ring-pink-300 font-medium text-gray-700 w-full min-w-0"
              />
              {config.unlockDate && (
                <button
                  onClick={() => onChange({ ...config, unlockDate: null })}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-200/50 hover:bg-red-100 text-gray-500 hover:text-red-500 p-1.5 rounded-full transition-colors z-10"
                  title="Clear Date Lock"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 font-medium">Box will rattle and stay locked before this date.</p>
          </div>

          {/* Sender Name */}
          {(section === "bottom" || section === "all") && (
          <div className="space-y-4">
             <label className="flex items-center gap-2 text-sm font-bold text-gray-600 uppercase tracking-wider">
              <MessageSquareText className="w-5 h-5 text-indigo-400" />
              Sender Name
            </label>
            <Input 
              type="text" 
              placeholder="Your Name (e.g. John)"
              value={config.senderName || ""}
              onChange={(e) => onChange({ ...config, senderName: e.target.value })}
              className="rounded-2xl border-white bg-white/70 h-14 px-4 shadow-sm focus-visible:ring-pink-300 font-medium text-gray-700"
            />
            <p className="text-xs text-gray-500 font-medium">Who is this gift from?</p>
          </div>
          )}

          {/* Scratch Message */}
          <div className="space-y-4 lg:col-span-2">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-600 uppercase tracking-wider">
              <MessageSquareText className="w-5 h-5 text-indigo-400" />
              Secret Message <span className="opacity-50 text-xs ml-1">(Optional)</span>
            </label>
            <Textarea 
              placeholder="Type a hidden message for them to scratch off..."
              value={config.secretMessage || ""}
              onChange={(e) => onChange({ ...config, secretMessage: e.target.value || null })}
              className="rounded-2xl border-white bg-white/70 shadow-sm focus-visible:ring-pink-300 resize-none min-h-[100px] font-medium text-gray-700"
            />
            <p className="text-xs text-gray-500 font-medium">Hidden underneath digital silver foil at the very bottom.</p>
          </div>
          </>
          )}

          {/* Clothesline Polaroids */}
          {(section === "top" || section === "all") && (
          <div className="space-y-4 lg:col-span-3 pt-6 border-t border-pink-100">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                 <div>
                     <label className="flex items-center gap-2 text-sm font-bold text-gray-600 uppercase tracking-wider mb-1">
                      <ImagePlus className="w-5 h-5 text-teal-400" />
                      Hanging Polaroids
                    </label>
                    <p className="text-xs text-gray-500 font-medium max-w-sm">
                        Upload specific photos here. They will be beautifully clipped to the background ropes using tiny wooden pins!
                    </p>
                 </div>
                 <button 
                    onClick={() => {
                        if (config.backgroundImages?.length >= 6) {
                            toast.error("You can only add up to 6 hanging polaroids!");
                        } else {
                            fileInputRef.current?.click();
                        }
                    }}
                    className="h-10 px-6 rounded-full bg-teal-50 text-teal-600 border border-teal-200 font-bold hover:bg-teal-100 transition-all text-sm flex-shrink-0"
                 >
                    + Add Hanging Polaroid
                 </button>
                 <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleGlobalImageUpload} />
             </div>

             {config.backgroundImages && config.backgroundImages.length > 0 && (
                 <div className="flex gap-4 overflow-x-auto py-2 scrollbar-hide snap-x">
                    {config.backgroundImages.map((img, i) => (
                        <div key={i} className="relative flex-shrink-0 w-24 h-24 rounded-xl border-2 border-white bg-white/50 shadow-sm overflow-hidden group snap-start">
                            <img src={img} alt={`Decor ${i}`} className="w-full h-full object-cover" />
                            <button 
                               onClick={() => removeBackgroundImage(i)}
                               className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                 </div>
             )}
          </div>
          )}

        </div>
    </div>
  );
};
