import React, { useRef } from "react";
import { UploadCloud, X, ScanSearch } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function DragDropUpload({ image, setImage, isAnalyzing, t }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setImage(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full relative">
      <AnimatePresence>
        {!image ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full border-2 border-dashed border-green-300 rounded-2xl p-10 flex flex-col items-center justify-center bg-green-50/50 hover:bg-green-50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <UploadCloud size={48} className="text-green-500 mb-4" />
            <p className="text-lg font-medium text-gray-700">{t?.dragDropTitle || "Drag & Drop or Click to Upload"}</p>
            <p className="text-sm text-gray-500 mt-2">{t?.dragDropSub || "Supports JPG, PNG, WEBP"}</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm"
          >
            <img
              src={URL.createObjectURL(image)}
              alt="Preview"
              className="w-full h-64 object-cover"
            />
            
            {/* Remove button */}
            {!isAnalyzing && (
              <button
                onClick={() => setImage(null)}
                className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm p-1.5 rounded-full shadow-sm hover:bg-white transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            )}

            {/* AI Scanning Animation Overlay */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-10 overflow-hidden">
                {/* Moving Scan Line */}
                <motion.div
                  className="absolute left-0 right-0 h-1 bg-green-400 shadow-[0_0_15px_rgba(74,222,128,0.8)] z-20"
                  initial={{ top: "0%" }}
                  animate={{ top: "100%" }}
                  transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
                />
                
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white/90 px-6 py-3 rounded-full flex items-center gap-3 shadow-lg z-30"
                >
                  <ScanSearch className="text-green-600 animate-pulse" size={24} />
                  <span className="font-semibold text-green-800 tracking-wide">
                    {t?.analyzing || "AI analyzing crop health..."}
                  </span>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DragDropUpload;
