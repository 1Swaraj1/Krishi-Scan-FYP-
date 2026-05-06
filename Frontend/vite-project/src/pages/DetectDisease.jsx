import React, { useState, useEffect, useMemo, useRef } from "react";
import Navbar from "../components/Navbar";
import DragDropUpload from "../components/DragDropUpload";
import HistoryModal from "../components/HistoryModal";
import { detectDisease } from "../api/detect";
import api from "../api/axios";
import { useLanguage } from "../context/LanguageContext";
import jsPDF from "jspdf";
import { toJpeg } from "html-to-image";
import { motion } from "framer-motion";
import { Search, Download, Leaf, Stethoscope, FileText, AlertTriangle } from "lucide-react";

function DetectDisease() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  const pdfTemplateRef = useRef(null);

  // Translation States for Result
  const [translatedDesc, setTranslatedDesc] = useState("");
  const [translatedSol, setTranslatedSol] = useState("");
  const [translatedDisease, setTranslatedDisease] = useState("");

  const [imageBase64, setImageBase64] = useState(null);

  const { lang, t, translateDynamic } = useLanguage();

  const formatDiseaseName = (name) => {
    if (!name) return "";
    return name
      .replace(/_/g, " ")
      .replace(/,/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      const payload = token.split(".")[1];
      const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(b64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const parsed = JSON.parse(jsonPayload);
      return parsed.user_id ?? parsed.userId ?? null;
    } catch (e) {
      console.warn("Failed to parse token for user id:", e);
      return null;
    }
  };

  const userId = getUserIdFromToken();

  const makeImageUrl = (imagePath) => {
    if (!imagePath) return "";
    const parts = imagePath.split(/[/\\]+/);
    const filename = parts[parts.length - 1];
    return `${api.defaults.baseURL.replace(/\/$/, "")}/uploads/${encodeURIComponent(filename)}`;
  };

  const fetchHistory = async () => {
    setError(null);
    if (!userId) {
      setError(t?.userNotFound || "User not found");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/user/${userId}/history`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setHistory(res.data || []);
    } catch (err) {
      console.error("Error fetching history:", err);
      setError(err.response?.data?.detail || t?.errorHistory || "Error fetching history");
      setHistory([]);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (result) {
      const translateData = async () => {
        if (result.disease) {
          const formatted = formatDiseaseName(result.disease);
          const td = await translateDynamic(formatted);
          setTranslatedDisease(td);
        }
        if (result.description) {
          const tDesc = await translateDynamic(result.description);
          setTranslatedDesc(tDesc);
        }
        if (result.solution) {
          const tSol = await translateDynamic(result.solution);
          setTranslatedSol(tSol);
        }
      };
      translateData();
    }
  }, [result, lang, translateDynamic]);

  // Convert image to base64 for html2canvas support
  useEffect(() => {
    if (image) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result);
      };
      reader.readAsDataURL(image);
    } else {
      setImageBase64(null);
    }
  }, [image]);

  const handleClear = () => {
    setImage(null);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!image) return;
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const data = await detectDisease(image);
      const mapped = {
        disease: data.predicted_label ?? data.label ?? "Unknown",
        confidence:
          typeof data.confidence_score === "number"
            ? Math.round(data.confidence_score * (data.confidence_score <= 1 ? 100 : 1))
            : Math.round(Number(data.confidence_score) || 0),
        description: data.disease_description ?? data.description ?? "",
        solution: data.disease_treatment ?? data.treatment ?? "",
      };
      setResult(mapped);
      await fetchHistory();
    } catch (err) {
      console.error("Detection failed:", err);
      setError(err.detail || err.response?.data?.detail || t?.errorPrediction || "Error");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredHistory = useMemo(() => {
    if (!searchQuery) return history;
    return history.filter(item => {
      const lbl = (item.predicted_label || "").toLowerCase();
      return lbl.includes(searchQuery.toLowerCase());
    });
  }, [history, searchQuery]);

  const isHealthy = result?.disease?.toLowerCase().includes("healthy");
  const severityColorClass = isHealthy ? 'text-green-800 bg-green-50 border-green-200' : (result?.confidence > 80 ? 'text-red-800 bg-red-50 border-red-200' : 'text-yellow-800 bg-yellow-50 border-yellow-200');
  const barColor = isHealthy ? 'bg-green-500' : (result?.confidence > 80 ? 'bg-red-500' : 'bg-yellow-500');

  const generatePDF = async () => {
    setIsGeneratingPdf(true);
    
    try {
      const element = document.getElementById("report-capture-area");
      if (!element) throw new Error("Report area not found");

      // Use html-to-image to capture the DOM exactly as it appears (supports all languages and modern CSS like oklch)
      const imgData = await toJpeg(element, { 
        quality: 0.98, 
        backgroundColor: "#ffffff",
        pixelRatio: 2
      });
      
      const pdf = new jsPDF("p", "mm", "a4");
      
      // Calculate dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const availableWidth = pdfWidth - margin * 2;
      const imgHeight = (element.offsetHeight * availableWidth) / element.offsetWidth;
      
      // Add standard PDF header
      pdf.setFontSize(22);
      pdf.setTextColor(21, 128, 61); // text-green-700
      pdf.text("Krishi Scan", margin, 20);
      
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Date: ${new Date().toLocaleDateString()}`, margin, 28);
      
      let yPos = 35;

      // Handle multi-page or tall content by scaling it to fit one page perfectly
      if (imgHeight > (pdfHeight - yPos - margin)) {
        const scaledWidth = (pdfHeight - yPos - margin) * element.offsetWidth / element.offsetHeight;
        const xOffset = (pdfWidth - scaledWidth) / 2; // Center horizontally
        pdf.addImage(imgData, "JPEG", xOffset, yPos, scaledWidth, pdfHeight - yPos - margin);
      } else {
        pdf.addImage(imgData, "JPEG", margin, yPos, availableWidth, imgHeight);
      }
      
      pdf.save("KrishiScan_Report.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. " + error.message);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans relative overflow-x-hidden">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center justify-center p-3 bg-green-100 text-green-700 rounded-2xl mb-4">
            <Leaf size={32} />
          </motion.div>
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
            {t?.detect || "Detect Disease"}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg text-gray-500 max-w-2xl mx-auto">
            {t?.heroSub || "Upload an image of your crop leaf and our AI will instantly analyze it for diseases and provide actionable treatments."}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: Upload Section */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative transition-shadow hover:shadow-md">
              <h2 className="text-xl font-bold text-gray-800 mb-4">{t?.upload || "Upload Image"}</h2>
              
              <DragDropUpload image={image} setImage={setImage} isAnalyzing={isLoading} t={t} />

              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleSubmit}
                  disabled={!image || isLoading}
                  className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-xl font-semibold text-white shadow-sm transition-all ${
                    !image || isLoading 
                      ? "bg-green-300 cursor-not-allowed" 
                      : "bg-green-600 hover:bg-green-700 hover:shadow-md active:scale-[0.98]"
                  }`}
                >
                  <Stethoscope size={20} />
                  {isLoading ? (t?.analyzing || "Analyzing...") : (t?.detect || "Detect Disease")}
                </button>
                {image && !isLoading && (
                  <button
                    onClick={handleClear}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all active:scale-[0.98]"
                  >
                    {t?.clear || "Clear"}
                  </button>
                )}
              </div>
              
              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
                  <AlertTriangle size={16} /> {error}
                </motion.div>
              )}
            </div>
          </div>

          {/* RIGHT: Intelligent Result Section */}
          <div className="lg:col-span-7">
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 h-full transition-shadow hover:shadow-md">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FileText className="text-green-600" /> {t?.result || "Detection Result"}
              </h2>

              {!result && !isLoading && (
                <div className="flex flex-col items-center justify-center h-64 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl p-6">
                  <Leaf size={48} className="text-gray-300 mb-4" />
                  <p>{t?.resultPlaceholder || "Upload an image and run detection to see results here."}</p>
                </div>
              )}

              {isLoading && (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                  <p className="text-gray-500 font-medium animate-pulse">{t?.analyzing || "Analyzing..."}</p>
                </div>
              )}

              {result && !isLoading && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  
                  {/* The area that gets captured by html2canvas */}
                  <div id="report-capture-area" className="space-y-6 bg-white p-1 pb-4">
                    {/* Optionally include the image in the PDF capture area only when downloading, or just leave it out to keep it clean. Let's include it for a professional report. */}
                    {image && (
                      <div className="w-full h-48 bg-gray-100 rounded-2xl overflow-hidden mb-4 border border-gray-200">
                        {imageBase64 ? (
                          <img src={imageBase64} alt="Crop" className="w-full h-full object-cover" />
                        ) : (
                          <img src={URL.createObjectURL(image)} alt="Crop" className="w-full h-full object-cover" />
                        )}
                      </div>
                    )}

                    {/* Overview Card */}
                    <div className={`p-6 rounded-2xl border ${severityColorClass}`}>
                      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">{t?.disease || "Disease"}</p>
                          <h3 className={`text-2xl sm:text-3xl font-extrabold`}>
                            {translatedDisease || formatDiseaseName(result.disease)}
                          </h3>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-sm font-medium text-gray-500 mb-1">{t?.confidence || "Confidence"}</p>
                          <p className="text-xl font-bold">{result.confidence}%</p>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-white/50 rounded-full h-3 overflow-hidden border border-black/5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(0, Math.min(100, result.confidence))}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full ${barColor}`}
                        />
                      </div>
                    </div>

                    {/* AI Suggestions */}
                    <div className="space-y-4">
                      {translatedDesc && (
                        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                          <h4 className="font-semibold text-gray-800 flex items-center gap-2 mb-2">
                            <AlertTriangle size={18} className="text-orange-500" />
                            {t?.description || "Description"}
                          </h4>
                          <p className="text-gray-600 text-sm leading-relaxed">{translatedDesc}</p>
                        </div>
                      )}

                      {translatedSol && (
                        <div className="bg-green-50/50 p-5 rounded-2xl border border-green-100">
                          <h4 className="font-semibold text-green-800 flex items-center gap-2 mb-2">
                            <Stethoscope size={18} className="text-green-600" />
                            {t?.treatment || "Suggested Treatment"}
                          </h4>
                          <div className="text-gray-700 text-sm leading-relaxed prose prose-sm max-w-none">
                            <ul className="list-disc pl-5 m-0 space-y-1">
                              {translatedSol.split(/(?<=\.)\s+/).map((sentence, idx) => (
                                 sentence ? <li key={idx}>{sentence}</li> : null
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* PDF Download Button (Not included in capture) */}
                  <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={generatePDF}
                      disabled={isGeneratingPdf}
                      className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-5 py-2.5 rounded-xl transition-all disabled:opacity-50 active:scale-[0.98]"
                    >
                      <Download size={18} /> {isGeneratingPdf ? (t?.analyzing || "Generating...") : (t?.downloadPdf || "Download PDF Report")}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* History Section (Insights Dashboard removed) */}
        <div className="mt-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t?.history || "Your Detection History"}</h2>
              <p className="text-sm text-gray-500 mt-1">{t?.showing || "Showing"} {filteredHistory.length} {t?.detections || "detections"}</p>
            </div>
            
            {/* Search / Filter */}
            <div className="relative w-full sm:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={t?.searchPlaceholder || "Search history..."}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {filteredHistory.length === 0 ? (
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center flex flex-col items-center">
              <div className="p-4 bg-gray-50 rounded-full mb-4">
                <Search size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">{t?.noHistory || "No past detections found."}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredHistory.map((item) => {
                const imgUrl = makeImageUrl(item.image_path);
                const label = item.predicted_label ?? "Unknown";
                const confidence =
                  typeof item.confidence_score === "number"
                    ? Math.round(item.confidence_score * (item.confidence_score <= 1 ? 100 : 1))
                    : Math.round(Number(item.confidence_score) || 0);
                const dateStr = item.created_at ? new Date(item.created_at).toLocaleDateString() : "";
                
                const isItemHealthy = label.toLowerCase().includes("healthy");
                const itemColor = isItemHealthy ? "text-green-600 bg-green-50 border-green-100" : confidence > 80 ? "text-red-600 bg-red-50 border-red-100" : "text-yellow-600 bg-yellow-50 border-yellow-100";

                return (
                  <motion.div 
                    key={item.prediction_id} 
                    whileHover={{ y: -4, shadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer flex flex-col transition-all"
                    onClick={() => setSelectedHistoryItem(item)}
                  >
                    <div className="w-full h-40 bg-gray-100 relative group">
                      {imgUrl ? (
                        <img src={imgUrl} alt="history" className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Leaf size={24}/>
                          <span className="text-xs ml-2">{t?.noImage || "No Image"}</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-bold text-gray-800 shadow-sm">
                        {confidence}%
                      </div>
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-800 truncate pr-2 flex-1" title={formatDiseaseName(label)}>
                          {formatDiseaseName(label)}
                        </h3>
                      </div>
                      <div className="flex items-center justify-between mt-auto pt-3">
                        <span className={`text-xs px-2 py-1 rounded-md font-medium border ${itemColor}`}>
                          {isItemHealthy ? (t?.healthy || "Healthy") : (t?.infected || "Infected")}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">{dateStr}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <HistoryModal 
        isOpen={!!selectedHistoryItem} 
        onClose={() => setSelectedHistoryItem(null)} 
        item={selectedHistoryItem} 
        makeImageUrl={makeImageUrl} 
      />
    </div>
  );
}

export default DetectDisease;
