import React, { useState, useEffect } from "react";
import { X, Calendar, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";

function HistoryModal({ isOpen, onClose, item, makeImageUrl }) {
  const { t, translateDynamic } = useLanguage();
  const [translatedDesc, setTranslatedDesc] = useState("");
  const [translatedSol, setTranslatedSol] = useState("");

  useEffect(() => {
    if (isOpen && item) {
      // For history items, we might not have description/solution if not saved in DB,
      // but if they are, we translate them. If the backend only saves label and confidence,
      // we show what we have. Let's assume description/solution are available or we just show label.
      // If we don't have them in history, we won't show them.
      const desc = item.disease_description || item.description || "";
      const sol = item.disease_treatment || item.solution || "";

      if (desc) translateDynamic(desc).then(setTranslatedDesc);
      else setTranslatedDesc("");

      if (sol) translateDynamic(sol).then(setTranslatedSol);
      else setTranslatedSol("");
    }
  }, [isOpen, item, translateDynamic]);

  if (!isOpen || !item) return null;

  const imgUrl = makeImageUrl(item.image_path);
  const label = item.predicted_label ?? "Unknown";
  const confidence =
    typeof item.confidence_score === "number"
      ? Math.round(item.confidence_score * (item.confidence_score <= 1 ? 100 : 1))
      : Math.round(Number(item.confidence_score) || 0);
  const dateStr = item.created_at ? new Date(item.created_at).toLocaleString() : "";

  const isHealthy = label.toLowerCase().includes("healthy");
  const colorClass = isHealthy ? "text-green-600 bg-green-50" : confidence > 80 ? "text-red-600 bg-red-50" : "text-yellow-600 bg-yellow-50";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-5 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-800">{t?.scanDetails || "Scan Details"}</h3>
            <button onClick={onClose} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto custom-scrollbar">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Image */}
              <div className="w-full md:w-1/2 flex-shrink-0">
                <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 h-64 flex items-center justify-center">
                  {imgUrl ? (
                    <img src={imgUrl} alt="Scan" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-sm">{t?.noImage || "No Image"}</span>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="w-full md:w-1/2 space-y-4">
                <div>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold mb-2 ${colorClass}`}>
                    {label.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Calendar size={16} />
                  <span>{dateStr}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Activity size={16} />
                  <span>{t?.confidence || "Confidence"}: <strong className="text-gray-800">{confidence}%</strong></span>
                </div>

                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${confidence}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full ${isHealthy ? 'bg-green-500' : confidence > 80 ? 'bg-red-500' : 'bg-yellow-500'}`}
                  />
                </div>

                {(translatedDesc || translatedSol) && (
                  <div className="mt-6 space-y-4">
                    {translatedDesc && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-800 mb-1">{t?.description || "Description"}</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">{translatedDesc}</p>
                      </div>
                    )}
                    {translatedSol && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-800 mb-1">{t?.treatment || "Suggested Treatment"}</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">{translatedSol}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default HistoryModal;
