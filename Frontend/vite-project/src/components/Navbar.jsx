import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { Globe, LogOut } from "lucide-react";

function Navbar() {
  const { lang, setLang, t, isTranslating } = useLanguage();

  return (
    <nav className="bg-white px-6 py-4 shadow-sm border-b border-gray-100 flex justify-between items-center sticky top-0 z-50">
      
      {/* LEFT */}
      <h1 className="text-2xl font-extrabold tracking-tight text-green-700 flex items-center gap-2">
        Krishi Scan
      </h1>

      {/* RIGHT */}
      <div className="flex items-center gap-4">

        {/* 🌐 LANGUAGE SELECT */}
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
          <Globe size={16} className="text-gray-500" />
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="bg-transparent text-sm font-medium text-gray-700 outline-none cursor-pointer"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी (Hindi)</option>
            <option value="bn">বাংলা (Bengali)</option>
            <option value="mr">मराठी (Marathi)</option>
            <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
          </select>
          {isTranslating && <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>}
        </div>

        {/* LOGOUT BUTTON */}
        <button
          className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full font-medium hover:bg-green-100 transition-colors"
          onClick={async () => {
            try {
              const token = localStorage.getItem("token");
              if (!token) {
                window.location.href = "/";
                return;
              }

              await fetch("http://127.0.0.1:8000/auth/logout", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              localStorage.removeItem("token");
              window.location.href = "/";
            } catch (error) {
              localStorage.removeItem("token");
              window.location.href = "/";
            }
          }}
        >
          <LogOut size={16} />
          {t.logout || "Logout"}
        </button>

      </div>
    </nav>
  );
}

export default Navbar;