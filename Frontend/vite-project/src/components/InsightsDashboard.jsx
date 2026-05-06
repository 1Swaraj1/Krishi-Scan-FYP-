import React, { useMemo } from "react";
import { motion } from "framer-motion";

function InsightsDashboard({ history, t }) {
  const stats = useMemo(() => {
    if (!history || history.length === 0) return { total: 0, common: "-", avgConf: 0 };
    
    const total = history.length;
    let sumConf = 0;
    const diseaseCounts = {};
    
    history.forEach(h => {
      const conf = typeof h.confidence_score === "number"
        ? Math.round(h.confidence_score * (h.confidence_score <= 1 ? 100 : 1))
        : Math.round(Number(h.confidence_score) || 0);
      sumConf += conf;
      
      const label = h.predicted_label || "Unknown";
      diseaseCounts[label] = (diseaseCounts[label] || 0) + 1;
    });

    const avgConf = Math.round(sumConf / total);
    
    // Find most common
    let common = "-";
    let max = 0;
    for (const [disease, count] of Object.entries(diseaseCounts)) {
      if (count > max && disease.toLowerCase() !== "healthy") {
        max = count;
        common = disease;
      }
    }
    // if all were healthy, fallback to highest count overall
    if (common === "-") {
      for (const [disease, count] of Object.entries(diseaseCounts)) {
        if (count > max) {
          max = count;
          common = disease;
        }
      }
    }

    return { total, common, avgConf };
  }, [history]);

  // simple formatter
  const formatName = (name) => {
    if (!name || name === "-") return "-";
    return name.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <motion.div whileHover={{ y: -2 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
        <p className="text-sm text-gray-500 font-medium mb-1">{t?.totalScans || "Total Scans"}</p>
        <p className="text-3xl font-extrabold text-gray-800">{stats.total}</p>
      </motion.div>

      <motion.div whileHover={{ y: -2 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
        <p className="text-sm text-gray-500 font-medium mb-1">{t?.mostCommon || "Most Common"}</p>
        <p className="text-xl font-bold text-gray-800 truncate" title={formatName(stats.common)}>
          {formatName(stats.common)}
        </p>
      </motion.div>

      <motion.div whileHover={{ y: -2 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
        <p className="text-sm text-gray-500 font-medium mb-1">{t?.avgConfidence || "Avg Confidence"}</p>
        <p className="text-3xl font-extrabold text-gray-800">{stats.avgConf}%</p>
      </motion.div>
    </div>
  );
}

export default InsightsDashboard;

