import { motion } from "framer-motion";

interface GiftBoxProps {
  isOpen: boolean;
  onClick: () => void;
}

const GiftBox = ({ isOpen, onClick }: GiftBoxProps) => {
  return (
    <motion.div
      className="cursor-pointer select-none relative"
      onClick={!isOpen ? onClick : undefined}
      animate={{ y: isOpen ? 0 : [0, -12, 0] }}
      transition={isOpen ? { duration: 0.4 } : { duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* 3D Stage Wrapper */}
      <div className="relative w-40 h-40 mx-auto" style={{ perspective: "1200px" }}>
        
        {/* Lid shoots up and away */}
        <motion.div
          className="absolute -top-6 left-1/2 -translate-x-1/2 z-30"
          animate={isOpen ? { y: -150, opacity: 0, rotateX: 45 } : { y: 0, opacity: 1, rotateX: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="w-44 h-10 rounded-lg bg-pink-400 shadow-2xl relative">
            <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 bg-yellow-200" />
          </div>
        </motion.div>

        {/* Box Body with 3D Transform */}
        <div className="absolute bottom-0 w-40 h-32" style={{ transformStyle: "preserve-3d" }}>
          {/* FRONT PANEL - This hinges DOWN toward the user */}
          <motion.div
            className="absolute inset-0 bg-pink-500 rounded-lg z-20 shadow-2xl origin-bottom"
            animate={isOpen ? { rotateX: -110 } : { rotateX: 0 }}
            transition={{ duration: 0.8, ease: "anticipate" }}
          >
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-3 bg-yellow-200" />
            <div className="absolute top-1/2 -translate-y-1/2 w-full h-3 bg-yellow-200" />
          </motion.div>

          {/* BACK INTERIOR - Static background for the paper */}
          <div className="absolute inset-0 bg-pink-900 rounded-lg -z-10 shadow-inner" />
        </div>
      </div>
    </motion.div>
  );
};

export default GiftBox;