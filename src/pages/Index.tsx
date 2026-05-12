import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Link2, Gift, Eye, ArrowLeft, X, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import confetti from "canvas-confetti";

import SlideEditor from "@/components/gift/SlideEditor";
import GiftBox3D from "@/components/gift/GiftBox3D";
import SlideViewer from "@/components/gift/SlideViewer";
import PaymentModal from "@/components/gift/PaymentModal";
import { FloatingBackground } from "@/components/ui/FloatingBackground";
import { GiftSettingsPanel, GiftConfig } from "@/components/gift/GiftSettingsPanel";
import { FloatingPolaroids } from "@/components/gift/FloatingPolaroids";
import { Input } from "@/components/ui/input";

const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const target = new Date(targetDate).getTime();
    
    const update = () => {
      const now = new Date().getTime();
      const difference = target - now;
      
      if (difference <= 0) {
        setIsReady(true);
        setTimeLeft("Hurray, open it now! 🎉");
      } else {
        setIsReady(false);
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        parts.push(`${minutes}m`);
        parts.push(`${seconds}s`);
        setTimeLeft(`Opens in: ${parts.join(" ")}`);
      }
    };
    
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return <span className={isReady ? "text-green-400 font-black animate-pulse" : ""}>{timeLeft}</span>;
}

interface Slide {
  text: string;
  image: string;
  videoUrl?: string;
  isEnvelope?: boolean;
}

const DB_NAME = 'JoyboxDB';
const STORE_NAME = 'autoSave';

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const saveToDB = async (key: string, data: any) => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(data, key);
  } catch (e) {
    console.warn("Autosave Failed:", e);
  }
};

const loadFromDB = async (key: string): Promise<any> => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(key);
    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    });
  } catch(e) {
    return null;
  }
};

const Index = () => {
  const [slides, setSlides] = useState<Slide[]>([{ text: "", image: "" }]);
  const [config, setConfig] = useState<GiftConfig>({
    theme: "pink",
    unlockDate: null,
    secretMessage: null,
    questionLock: null,
    backgroundImages: []
  });
  
  const [previewing, setPreviewing] = useState(false);
  const [giftOpened, setGiftOpened] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isRattling, setIsRattling] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [fallbackLink, setFallbackLink] = useState<string | null>(null);

  const handleRestart = async () => {
    if (window.confirm("Are you sure you want to clear all progress? This cannot be undone.")) {
      try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).clear();
      } catch (e) {
        console.warn("Clear DB Failed:", e);
      }
      setSlides([{ text: "", image: "" }]);
      setConfig({
        theme: "pink",
        unlockDate: null,
        secretMessage: null,
        questionLock: null,
        backgroundImages: []
      });
      toast.success("Progress restarted successfully! Start fresh.");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const savedSlides = await loadFromDB('joybox-slides');
      const savedConfig = await loadFromDB('joybox-config');
      if (savedSlides && savedSlides.length > 0) setSlides(savedSlides);
      if (savedConfig) setConfig((prev) => ({ ...prev, ...savedConfig }));
      setIsLoaded(true);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (isLoaded) saveToDB('joybox-slides', slides);
  }, [slides, isLoaded]);

  useEffect(() => {
    if (isLoaded) saveToDB('joybox-config', config);
  }, [config, isLoaded]);

  const addSlide = () => {
    if (slides.length >= 15) {
      toast.error("You've reached the maximum limit of 15 pages for guaranteed sharing capability!");
      return;
    }
    setSlides((prev) => [...prev, { text: "", image: "" }]);
  };

  const updateSlide = (index: number, slide: Slide) => {
    setSlides((prev) => prev.map((s, i) => (i === index ? slide : s)));
  };

  const removeSlide = (index: number) => {
    if (slides.length <= 1) {
      toast.error("You need at least one slide");
      return;
    }
    setSlides((prev) => prev.filter((_, i) => i !== index));
  };

  const hasContent = slides.some((s) => s.text.trim() || s.image);

  const startPreview = () => {
    if (!hasContent) {
      toast.error("Add some content to your slides first");
      return;
    }
    setGiftOpened(false);
    setPreviewing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const exitPreview = () => {
    setPreviewing(false);
    setGiftOpened(false);
  };

  const handleGenerateLinkClick = () => {
    setPaymentModalOpen(true);
  };

  const generateLink = async () => {
    setPaymentModalOpen(false);

    const overlay = document.createElement("div");
    overlay.id = "generate-link-overlay";
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
    overlay.style.backdropFilter = "blur(8px)";
    overlay.style.zIndex = "999999";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.color = "#ec4899";
    overlay.style.fontFamily = "sans-serif";
    overlay.innerHTML = `
      <div style="width: 60px; height: 60px; border: 6px solid #fbcfe8; border-top-color: #ec4899; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 24px;"></div>
      <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
      <h3 style="font-size: 1.75rem; font-weight: 900; margin: 0; background: linear-gradient(to right, #ec4899, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Generating Link...</h3>
      <p style="font-size: 1rem; color: #6b7280; margin-top: 12px; font-weight: 500;">Wrapping your digital giftbox in the cloud.</p>
    `;
    document.body.appendChild(overlay);

    toast.loading("Wrapping your digital giftbox...", { id: "generating" });
    
    await new Promise(r => setTimeout(r, 150));

    const payload = {
      slides,
      config
    };
    
    const fallbackCopy = (text: string) => {
        try {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            textArea.style.top = "-999999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const success = document.execCommand('copy');
            textArea.remove();
            return success;
        } catch (e) {
            return false;
        }
    };

    const copyUrl = async (url: string) => {
        try {
            await navigator.clipboard.writeText(url);
            return true;
        } catch (err) {
            return fallbackCopy(url);
        }
    };

    try {
        const response = await fetch('https://bytebin.lucko.me/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        let url = "";

        if (data && data.key) {
            url = `${window.location.origin}/view?id=${data.key}`;
        } else {
             const encoded = btoa(encodeURIComponent(JSON.stringify(payload)));
             if (encoded.length > 30000) {
                 toast.error("Gift is too large! Please remove some photos to make the link shareable.", { id: "generating" });
                 if (document.getElementById("generate-link-overlay")) document.getElementById("generate-link-overlay")?.remove();
                 return;
             }
             url = `${window.location.origin}/view?data=${encoded}`;
        }

        const copied = await copyUrl(url);
        if (document.getElementById("generate-link-overlay")) document.getElementById("generate-link-overlay")?.remove();
        
        if (!copied) {
             setFallbackLink(url);
        } else {
             toast.success("Link copied to clipboard! 🎁 Share it with them now!", { id: "generating" });
        }
        fireConfetti(100, 2);
    } catch (e) {
        const encoded = btoa(encodeURIComponent(JSON.stringify(payload)));
        if (encoded.length > 30000) {
             toast.error("Gift is too large! Please remove some photos to make the link shareable.", { id: "generating" });
             if (document.getElementById("generate-link-overlay")) document.getElementById("generate-link-overlay")?.remove();
             return;
        }
        const url = `${window.location.origin}/view?data=${encoded}`;
        
        const copied = await copyUrl(url);
        if (document.getElementById("generate-link-overlay")) document.getElementById("generate-link-overlay")?.remove();
        
        if (!copied) {
             setFallbackLink(url);
        } else {
             toast.success("Link copied to clipboard! 🎁 Share it with them now!", { id: "generating" });
        }
        fireConfetti(100, 2);
    }
  };

  const fireConfetti = useCallback((particleCount: number = 100, spread: number = 70) => {
    const defaults = {
      spread: spread,
      ticks: 100,
      gravity: 0.8,
      decay: 0.94,
      startVelocity: 30,
      colors: ['#ff6b9e', '#ffd700', '#c084fc', '#60a5fa']
    };

    confetti({ ...defaults, particleCount, origin: { x: 0.2, y: 0.6 } });
    confetti({ ...defaults, particleCount, origin: { x: 0.8, y: 0.6 } });
    
    setTimeout(() => {
        confetti({ ...defaults, particleCount: particleCount * 1.5, startVelocity: 45, origin: { x: 0.5, y: 0.7 } });
    }, 200);
  }, []);

  const openGiftAction = () => {
     setGiftOpened(true);
     fireConfetti(80, 80);
  }

  const handleOpenGiftAttempt = () => {
    if (config.unlockDate) {
      const now = new Date();
      const unlockTime = new Date(config.unlockDate);
      if (now < unlockTime) {
        setIsRattling(true);
        toast.error(`This gift cannot be opened before ${unlockTime.toLocaleString()}`);
        setTimeout(() => setIsRattling(false), 800);
        return;
      }
    }

    openGiftAction();
  };

  const extractedImages = config.backgroundImages || [];

  if (previewing) {
    return (
      <div className="min-h-screen flex flex-col items-center bg-transparent relative overflow-hidden">
        <FloatingBackground theme={config.theme} />
        
        {/* Top bar */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/40 border-b border-pink-200/50"
        >
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={exitPreview}
              className="gap-2 active:scale-[0.95] transition-all text-pink-700 hover:bg-pink-100 rounded-xl"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-bold">Edit Gift</span>
            </Button>
            <span className="text-xs font-black text-pink-400 uppercase tracking-[0.2em] hidden sm:block">
              Receiver Preview
            </span>
            <Button
              onClick={handleGenerateLinkClick}
              className="gap-2 active:scale-[0.95] transition-all bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-xl shadow-lg shadow-pink-500/30 border-0 font-bold"
            >
              <Link2 className="w-4 h-4" />
              Generate Link 💝
            </Button>
          </div>
        </motion.div>

        {giftOpened && extractedImages.length > 0 && (
            <FloatingPolaroids images={extractedImages} />
        )}

        <div className="flex flex-col items-center justify-center relative z-10 w-full min-h-screen pt-14">
            
            <AnimatePresence>
            {!giftOpened && (
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8, delay: 0.2, type: "spring", bounce: 0.5 }}
                className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500 text-center px-4 leading-tight mb-4"
                style={{ textWrap: "balance" }}
              >
                {config.senderName ? `A sweet surprise from ${config.senderName} ✨` : "A sweet surprise, just for you ✨"}
              </motion.h2>
            )}
            </AnimatePresence>

            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.1, type: "spring", bounce: 0.6 }}
                className={`w-full flex items-center justify-center cursor-pointer transition-all duration-700 relative z-0 ${giftOpened ? 'h-80 mb-[-120px] pointer-events-none' : 'h-96'}`}
              >
                <GiftBox3D isOpen={giftOpened} onClick={handleOpenGiftAttempt} theme={config.theme} isRattling={isRattling} />
              </motion.div>
            </AnimatePresence>

            <AnimatePresence>
            {!giftOpened && (
               <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 transition={{ duration: 0.5, delay: 1 }}
                 className="flex flex-col items-center mt-4"
               >
                 <div className="w-1 h-8 bg-gradient-to-b from-pink-400 to-transparent mb-4 animate-bounce rounded-full" />
                 <p className="text-sm font-black text-pink-400 uppercase tracking-widest bg-white/50 px-6 py-2 rounded-full shadow-sm backdrop-blur-sm">
                   {config.unlockDate ? <CountdownTimer targetDate={config.unlockDate} /> : "Tap to open"}
                 </p>
               </motion.div>
            )}
            </AnimatePresence>

            {/* ONLY show slides WHEN it is opened */}
            <AnimatePresence>
              {giftOpened && (
                <motion.div
                  initial={{ opacity: 0, y: -40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 1, type: "spring" }}
                  className="w-full flex flex-col items-center z-20 pb-24"
                >
                  <SlideViewer slides={slides} secretMessage={config.secretMessage} />
                </motion.div>
              )}
            </AnimatePresence>
        </div>

        <PaymentModal  
          isOpen={paymentModalOpen} 
          onClose={() => setPaymentModalOpen(false)} 
          onSuccess={generateLink} 
        />

        <AnimatePresence>
          {fallbackLink && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative"
              >
                <button
                  onClick={() => setFallbackLink(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="text-center mb-6">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Giftbox Ready! 🎁</h3>
                  <p className="text-gray-500">Your browser blocked the automatic copy. Please copy your link below:</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-200">
                  <input
                    type="text"
                    value={fallbackLink}
                    readOnly
                    className="flex-1 bg-transparent border-none focus:ring-0 text-gray-700 font-medium px-2 min-w-0 outline-none truncate"
                    onClick={(e) => e.currentTarget.select()}
                  />
                  <Button
                    onClick={() => {
                      try {
                        const textArea = document.createElement("textarea");
                        textArea.value = fallbackLink;
                        document.body.appendChild(textArea);
                        textArea.select();
                        document.execCommand('copy');
                        textArea.remove();
                        toast.success("Copied to clipboard!");
                      } catch (e) {
                         toast.error("Still unable to copy, please copy manually");
                      }
                    }}
                    className="shrink-0 bg-pink-500 hover:bg-pink-600 text-white rounded-xl px-6 py-5 font-bold flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Editor mode
  return (
    <div className="min-h-screen relative overflow-hidden bg-transparent">
      <FloatingBackground theme={config.theme} />
      
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-0 z-50 backdrop-blur-xl bg-white/60 border-b border-pink-100/50 shadow-sm"
      >
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div 
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-400 to-purple-500 flex items-center justify-center shadow-lg shadow-pink-500/30"
            >
              <Gift className="w-6 h-6 text-white" />
            </motion.div>
            <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 tracking-tight hidden sm:block">
              Digital<span className="text-pink-500">Joybox</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="outline"
              onClick={handleRestart}
              className="h-12 px-4 gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200 rounded-2xl font-bold text-sm transition-all shadow-sm"
            >
              Restart
            </Button>
            <motion.span 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-sm font-bold text-pink-500 tabular-nums hidden sm:block bg-pink-50 px-4 py-1.5 rounded-full border border-pink-100"
            >
              {slides.length} slide{slides.length !== 1 ? "s" : ""}
            </motion.span>
            
            <Button
              onClick={startPreview}
              className="h-12 px-6 sm:px-8 gap-2 active:scale-[0.95] transition-all bg-gray-900 hover:bg-black text-white rounded-2xl shadow-xl shadow-gray-900/20 font-bold text-base"
            >
              <Eye className="w-5 h-5 text-pink-400" />
              Preview & Share
            </Button>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, type: "spring" }}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md shadow-sm border border-white">
            <span className="flex h-2 w-2 rounded-full bg-pink-500 animate-pulse"></span>
            <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Editing Mode</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight mb-4" style={{ textWrap: "balance" }}>
            Craft Your Perfect Gift 🎁
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium">
            Fill these magical cards with your favorite memories.
          </p>
        </motion.div>

        {/* 
          Instead of hiding it inside a button dialog, the entire Settings panel is 
          now mounted natively inline, exactly like the user requested.
        */}
        <GiftSettingsPanel config={config} onChange={setConfig} />

        <div className="flex gap-8 overflow-x-auto pb-12 pt-4 snap-x snap-mandatory scrollbar-hide px-4 items-center">
          <AnimatePresence mode="popLayout">
            {slides.map((slide, i) => (
              <div key={i} className="snap-center flex-shrink-0">
                <SlideEditor
                  slide={slide}
                  index={i}
                  onUpdate={updateSlide}
                  onRemove={removeSlide}
                />
              </div>
            ))}
          </AnimatePresence>

          <motion.button
            layout
            onClick={() => {
                if (slides.length < 15) addSlide();
            }}
            disabled={slides.length >= 15}
            className={`snap-center flex-shrink-0 w-[320px] min-h-[420px] rounded-[2rem] border-[3px] border-dashed flex flex-col items-center justify-center gap-6 transition-all group shadow-sm backdrop-blur-sm ${
                slides.length >= 15 
                  ? "border-gray-300 bg-gray-50/60 text-gray-400 cursor-not-allowed" 
                  : "border-pink-300 bg-white/40 text-pink-400 hover:border-pink-500 hover:text-pink-600 hover:bg-pink-50/60 active:scale-95"
            }`}
            whileHover={slides.length < 15 ? { scale: 1.02 } : undefined}
            whileTap={slides.length < 15 ? { scale: 0.98 } : undefined}
          >
            <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
                slides.length >= 15 ? "bg-gray-200" : "bg-white group-hover:bg-pink-100 group-hover:shadow-xl group-hover:scale-110"
            }`}>
              <Plus className="w-10 h-10" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-xl font-black">{slides.length >= 15 ? "Max Limit Reached" : "Add Memory"}</span>
              <span className="text-sm font-medium opacity-70">{slides.length >= 15 ? "15 pages maximum" : "Pictures or text messages"}</span>
            </div>
          </motion.button>
          
          <div className="w-8 flex-shrink-0" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center mt-2 sm:hidden pb-12 px-4"
        >
          <Button
            onClick={startPreview}
            className="w-full h-14 max-w-sm gap-2 active:scale-[0.95] transition-all bg-gray-900 hover:bg-black text-white rounded-2xl shadow-xl shadow-gray-900/20 font-bold text-lg"
          >
            <Eye className="w-6 h-6 text-pink-400" />
            Preview & Share
          </Button>
        </motion.div>
      </main>
    </div>
  );
};

export default Index;
