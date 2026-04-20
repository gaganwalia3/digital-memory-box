import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import GiftBox3D from "@/components/gift/GiftBox3D";
import SlideViewer from "@/components/gift/SlideViewer";
import { FloatingBackground } from "@/components/ui/FloatingBackground";
import { GiftConfig } from "@/components/gift/GiftSettingsPanel";
import { FloatingPolaroids } from "@/components/gift/FloatingPolaroids";
import { Input } from "@/components/ui/input";

interface Slide {
  text: string;
  image: string;
  videoUrl?: string;
  isEnvelope?: boolean;
}

const ViewGift = () => {
  const [searchParams] = useSearchParams();
  const [opened, setOpened] = useState(false);
  const [isRattling, setIsRattling] = useState(false);
  
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState("");

  const [parsedData, setParsedData] = useState<{slides: Slide[], config: GiftConfig} | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     const parse = async () => {
         const id = searchParams.get("id");
         if (id) {
             try {
                 const res = await fetch(`https://bytebin.lucko.me/${id}`);
                 if (res.ok) {
                     const parsed = await res.json();
                     if (Array.isArray(parsed)) {
                         setParsedData({
                           slides: parsed as Slide[],
                           config: { theme: "pink", unlockDate: null, secretMessage: null, questionLock: null, backgroundImages: [] } as GiftConfig
                         });
                     } else {
                         setParsedData(parsed);
                     }
                 } else {
                     setParsedData(null);
                 }
             } catch {
                 setParsedData(null);
             } finally {
                 setLoading(false);
             }
             return;
         }

         const data = searchParams.get("data");
         if (data) {
             try {
                const parsed = JSON.parse(atob(decodeURIComponent(data)));
                if (Array.isArray(parsed)) {
                  setParsedData({
                    slides: parsed as Slide[],
                    config: { theme: "pink", unlockDate: null, secretMessage: null, questionLock: null, backgroundImages: [] } as GiftConfig
                  });
                } else {
                  setParsedData(parsed as { slides: Slide[], config: GiftConfig });
                }
             } catch {
                setParsedData(null);
             }
         } else {
             setParsedData(null);
         }
         setLoading(false);
     };
     
     parse();
  }, [searchParams]);

  // Extract explicitly generated background ropes images from config.
  const extractedImages = useMemo(() => {
     if (!parsedData?.config?.backgroundImages) return [];
     return parsedData.config.backgroundImages.filter(i => i.trim() !== "");
  }, [parsedData]);


  const fireConfetti = useCallback(() => {
    const duration = 3500;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 8,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: ['#ff6b9e', '#ffd700', '#c084fc', '#ffffff']
      });
      confetti({
        particleCount: 8,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: ['#ff6b9e', '#ffd700', '#c084fc', '#ffffff']
      });

      if (Date.now() < end) requestAnimationFrame(frame);
    };
    
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#ff6b9e', '#ffd700', '#c084fc', '#ffffff']
    });
    
    frame();
  }, []);

  const openGiftAction = () => {
     setShowPasscodeModal(false);
     setOpened(true);
     fireConfetti();
  }

  const handleOpenGiftAttempt = () => {
    // 1. Check Date Timelock First
    if (parsedData?.config?.unlockDate) {
      const now = new Date();
      const unlockTime = new Date(parsedData.config.unlockDate);
      if (now < unlockTime) {
        setIsRattling(true);
        toast.error(`This gift cannot be opened before ${unlockTime.toLocaleString()}`);
        setTimeout(() => setIsRattling(false), 800);
        return;
      }
    }

    // 2. Check Question Lock
    if (parsedData?.config?.questionLock) {
        // Pop the modal instead of opening
        setShowPasscodeModal(true);
        return;
    }

    // Pass and Open
    openGiftAction();
  };

  const handlePasscodeSubmit = () => {
      const answerMatch = parsedData?.config?.questionLock?.answer.trim().toLowerCase();
      const inputMatch = passcodeInput.trim().toLowerCase();
      
      if (inputMatch === answerMatch) {
          toast.success("Correct! Access Granted.");
          openGiftAction();
      } else {
          toast.error("Incorrect Answer. Try again.");
          setIsRattling(true);
          setTimeout(() => setIsRattling(false), 800);
      }
  }


  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf8ff] flex-col gap-4">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-400 to-purple-500 animate-pulse shadow-lg flex items-center justify-center"></div>
      <p className="text-xl font-bold text-gray-400 animate-pulse">Unboxing magic...</p>
    </div>
  );

  if (!parsedData) return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf8ff] flex-col gap-4">
      <p className="text-xl font-bold text-gray-400">Oops! No gift found here.</p>
      <Link to="/" className="text-pink-500 hover:text-pink-600 font-semibold underline">Create one now</Link>
    </div>
  );

  const { slides, config } = parsedData;

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center overflow-hidden relative">
      <FloatingBackground theme={config.theme} />

      {/* Floating Polaroids only render while the box is actually opened and if images exist */}
      {opened && extractedImages.length > 0 && (
          <FloatingPolaroids images={extractedImages} />
      )}

      <div className="flex flex-col items-center justify-center relative z-10 w-full min-h-screen pt-12">
          
          <AnimatePresence>
            {!opened && (
              <motion.h1 
                 initial={{ opacity: 0, y: -20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.9, y: -30 }}
                 transition={{ duration: 0.8, ease: "easeOut" }}
                 className="text-5xl md:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 text-center tracking-tight px-4 leading-[1.2] mb-8"
              >
                Open Your Gift 🎁
              </motion.h1>
            )}
          </AnimatePresence>

          <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
                className={`w-full flex items-center justify-center cursor-pointer transition-all duration-1000 ${opened ? 'h-80 mb-[-120px] pointer-events-none' : 'h-96'}`}
            >
                <GiftBox3D isOpen={opened} onClick={handleOpenGiftAttempt} theme={config.theme} isRattling={isRattling} />
            </motion.div>
          </AnimatePresence>

          <AnimatePresence>
            {!opened && (
               <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 transition={{ duration: 0.5, delay: 0.5 }}
                 className="flex flex-col items-center mt-6"
               >
                 <div className="w-1 h-8 bg-gradient-to-b from-pink-400 to-transparent mb-4 animate-bounce rounded-full" />
                 <p className="text-sm font-black text-pink-400 uppercase tracking-widest bg-white/50 px-6 py-2 rounded-full shadow-sm backdrop-blur-sm">
                   {config.unlockDate ? "Locked until date" : (config.questionLock ? "Passcode locked" : "Tap to unlock")}
                 </p>
               </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {opened && (
              <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 1, type: "spring" }}
                className="w-full flex flex-col items-center z-20 pb-24"
              >
                <SlideViewer slides={slides} secretMessage={config.secretMessage} />

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2, duration: 1 }}
                  className="mt-16"
                >
                  <Link to="/" className="inline-flex items-center justify-center h-14 px-8 rounded-full bg-white text-pink-600 font-bold shadow-xl shadow-pink-500/20 hover:scale-105 active:scale-95 transition-all text-lg mb-12">
                    Create Your Own Giftbox ✨
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
      </div>

      {/* Passcode UI overlay Modal */}
      <AnimatePresence>
         {showPasscodeModal && (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                 <motion.div
                   initial={{ opacity: 0, scale: 0.9, y: 20 }}
                   animate={{ opacity: 1, scale: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.9, y: 20 }}
                   className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative"
                 >
                    <button onClick={() => setShowPasscodeModal(false)} className="absolute top-4 right-4 text-gray-400">X</button>
                    
                    <h3 className="text-2xl font-black text-center text-gray-800 mb-2">Secret Question</h3>
                    <p className="text-center text-pink-500 font-bold mb-6 italic">"{config.questionLock?.question}"</p>
                    
                     <Input 
                        type="text" 
                        autoFocus
                        placeholder="Type answer here..." 
                        value={passcodeInput}
                        onChange={(e) => setPasscodeInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handlePasscodeSubmit()}
                        className="rounded-xl border-gray-200 bg-gray-50 h-12 shadow-inner focus-visible:ring-pink-300 font-medium text-gray-800 mb-4"
                     />
                     <button 
                        onClick={handlePasscodeSubmit}
                        className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold h-12 rounded-xl shadow-lg transition-all active:scale-95"
                     >
                        Unlock Gift
                     </button>
                 </motion.div>
             </div>
         )}
      </AnimatePresence>

    </div>
  );
};

export default ViewGift;