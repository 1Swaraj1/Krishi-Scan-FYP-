import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { translateText } from "../utils/translate";

const baseEnglishStrings = {
  logout: "Logout",
  detect: "Detect Disease",
  upload: "Upload Image",
  result: "Detection Result",
  disease: "Disease",
  confidence: "Confidence",
  treatment: "Suggested Treatment",
  description: "Description",
  analyzing: "Analyzing...",
  resultPlaceholder: "Upload an image and run detection to see results here.",
  clear: "Clear",
  showing: "Showing",
  detections: "detections",
  history: "Your Detection History",
  noHistory: "No past detections found.",
  date: "Date",
  viewImage: "View Image",
  reDetect: "Re-detect",
  errorPrediction: "Prediction failed. Try again.",
  errorHistory: "Failed to load history",
  userNotFound: "User not identified. Please login.",
  dragDropTitle: "Drag & Drop or Click to Upload",
  dragDropSub: "Supports JPG, PNG, WEBP",
  insights: "Insights Dashboard",
  totalScans: "Total Scans",
  mostCommon: "Most Common",
  avgConfidence: "Avg Confidence",
  causes: "Causes",
  solutions: "Solutions",
  prevention: "Prevention Tips",
  searchPlaceholder: "Search history...",
  heroSub: "Upload an image of your crop leaf and our AI will instantly analyze it for diseases and provide actionable treatments.",
  healthy: "Healthy",
  infected: "Infected",
  noImage: "No Image",
  scanDetails: "Scan Details",
  downloadPdf: "Download PDF Report",
  roleUser: "Farmer",
  roleAdmin: "Admin",
  loginFailed: "Login failed"
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState("en");
  const [translations, setTranslations] = useState(baseEnglishStrings);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const translateUI = async () => {
      if (lang === "en") {
        setTranslations(baseEnglishStrings);
        return;
      }
      setIsTranslating(true);
      const newTranslations = {};
      
      // Translate all keys in parallel
      const keys = Object.keys(baseEnglishStrings);
      const promises = keys.map(async (key) => {
        const translated = await translateText(baseEnglishStrings[key], lang);
        newTranslations[key] = translated;
      });

      await Promise.all(promises);
      setTranslations(newTranslations);
      setIsTranslating(false);
    };

    translateUI();
  }, [lang]);

  // Expose an async function to translate dynamic backend content
  const translateDynamic = useCallback(async (text) => {
    return await translateText(text, lang);
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations, isTranslating, translateDynamic }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);