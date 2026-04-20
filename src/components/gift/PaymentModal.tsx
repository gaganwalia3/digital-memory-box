import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { X, Heart, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PRESET_AMOUNTS = [5, 11, 51, 101];

export default function PaymentModal({ isOpen, onClose, onSuccess }: PaymentModalProps) {
  const [amount, setAmount] = useState<number | "">(5);
  const [step, setStep] = useState<"amount" | "pay">("amount");
  const [upiId, setUpiId] = useState("");

  const handleProceed = () => {
    if (typeof amount !== "number" || amount < 5) {
      toast.error("Please enter a minimum donation of ₹5");
      return;
    }
    setStep("pay");
  };

  const handlePaymentConfirmed = () => {
    toast.success("Thank you for your generous gift! 💖");
    onSuccess();
    // Reset state for future
    setTimeout(() => {
      setStep("amount");
      setAmount(5);
    }, 500);
  };

  // Replace this with the user's UPI ID. 
  // If empty, we still generate a format, but it won't work perfectly without their ID.
  const targetUpiId = upiId || "gagan.walia5678@oksbi";

  const upiUrl = `upi://pay?pa=${targetUpiId}&pn=Digital%20Joybox&am=${amount}&cu=INR`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          {/* Container wrapper for perfect flex centering */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md pointer-events-auto"
            >
              <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5">
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 z-10 rounded-full bg-black/5 p-1.5 text-black/50 transition-colors hover:bg-black/10 hover:text-black"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="px-6 pb-6 pt-8">
                  <div className="mb-6 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-100 shadow-inner">
                      <Heart className="h-8 w-8 text-pink-500" fill="currentColor" />
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {step === "amount" ? (
                      <motion.div
                        key="amount"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                      >
                        <div className="text-center">
                          <h2 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
                            Support Digital Joybox
                          </h2>
                          <p className="mb-6 text-sm text-gray-500">
                            To generate your shareable link, please make a minimal donation of ₹5. Feel free to give more if you love it!
                          </p>
                        </div>

                        {/* Your UPI ID Input */}
                        <div className="mb-4">
                          <label className="text-xs font-semibold uppercase text-gray-500">Your UPI ID (For receiving)</label>
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="e.g. name@okhdfcbank"
                            className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                          />
                        </div>

                        {/* Amount Input */}
                        <div className="mb-6">
                          <div className="relative flex items-center justify-center">
                            <span className="absolute left-6 text-2xl font-semibold text-gray-400">₹</span>
                            <input
                              type="number"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
                              className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 py-4 pl-12 pr-6 text-2xl font-bold text-gray-900 focus:border-pink-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-pink-500/10"
                              placeholder="Amount"
                              min="5"
                            />
                          </div>

                          {/* Presets */}
                          <div className="mt-4 grid grid-cols-4 gap-2">
                            {PRESET_AMOUNTS.map((preset) => (
                              <button
                                key={preset}
                                onClick={() => setAmount(preset)}
                                className={`rounded-xl py-2 text-sm font-semibold transition-all ${amount === preset
                                  ? "bg-pink-100 text-pink-700 ring-2 ring-pink-500 ring-offset-1"
                                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                  }`}
                              >
                                ₹{preset}
                              </button>
                            ))}
                          </div>
                        </div>

                        <Button
                          onClick={handleProceed}
                          className="h-12 w-full rounded-xl bg-pink-600 text-base font-bold shadow-lg shadow-pink-500/30 transition-all hover:bg-pink-700 active:scale-[0.98]"
                        >
                          Proceed to Pay
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="pay"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="text-center"
                      >
                        <h2 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
                          Scan to Pay ₹{amount}
                        </h2>
                        <p className="mb-6 text-sm text-gray-500">
                          Scan the code below or click an app to pay instantly.
                        </p>

                        <div className="mx-auto mb-6 flex h-48 w-48 items-center justify-center rounded-2xl bg-white p-4 shadow-[0_0_40px_rgba(0,0,0,0.08)]">
                          <QRCodeSVG
                            value={upiUrl}
                            size={160}
                            bgColor="#ffffff"
                            fgColor="#000000"
                            level="Q"
                          />
                        </div>

                        <div className="mb-6 flex flex-col gap-3">
                          <a 
                              href={upiUrl}
                              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all"
                          >
                              Auto Open UPI App
                          </a>
                          
                          <div className="grid grid-cols-3 gap-2">
                              <a 
                                 href={`tez://upi/pay?pa=${targetUpiId}&pn=Digital%20Joybox&am=${amount}&cu=INR`}
                                 className="flex flex-col items-center justify-center h-14 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-xl transition-all active:scale-95"
                              >
                                  <span className="font-bold text-gray-700 text-sm tracking-tight">GPay</span>
                              </a>
                              <a 
                                 href={`phonepe://pay?pa=${targetUpiId}&pn=Digital%20Joybox&am=${amount}&cu=INR`}
                                 className="flex flex-col items-center justify-center h-14 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-xl transition-all active:scale-95"
                              >
                                  <span className="font-bold text-purple-700 text-sm tracking-tight">PhonePe</span>
                              </a>
                              <a 
                                 href={`paytmmp://pay?pa=${targetUpiId}&pn=Digital%20Joybox&am=${amount}&cu=INR`}
                                 className="flex flex-col items-center justify-center h-14 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-xl transition-all active:scale-95"
                              >
                                  <span className="font-bold text-sky-600 text-sm tracking-tight">Paytm</span>
                              </a>
                          </div>
                        </div>

                        <div className="mb-6 flex items-center justify-center gap-2 text-sm text-gray-600">
                          <ShieldCheck className="h-4 w-4 text-green-500" />
                          <span>100% Secure Payment</span>
                        </div>

                        <Button
                          onClick={handlePaymentConfirmed}
                          className="h-12 w-full rounded-xl bg-gray-900 text-base font-bold shadow-lg hover:bg-black active:scale-[0.98]"
                        >
                          I have paid {amount ? `₹${amount}` : ""}
                        </Button>

                        <button
                          onClick={() => setStep("amount")}
                          className="mt-4 text-sm font-medium text-gray-500 hover:text-gray-800"
                        >
                          Change Amount
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
