import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";

function Navbar() {
  const { lang, setLang } = useLanguage();
  const t = translations[lang];
return (
    <nav className="bg-green-700 text-white px-6 py-4 shadow flex justify-between items-center">
      
      {/* LEFT */}
      <h1 className="text-2xl font-bold tracking-tight">
        Krishi Scan
      </h1>

      {/* RIGHT */}
      <div className="flex items-center gap-4">

        {/* 🌐 LANGUAGE SELECT */}
        🌐
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="text-black px-2 py-1 rounded"
        >
          <option value="en">English</option>
          <option value="hi">हिन्दी</option>
          <option value="bn">বাংলা</option>
          <option value="mr">मराठी</option>
          <option value="pa">ਪੰਜਾਬੀ</option>
        </select>

        {/* LOGOUT BUTTON */}
        <button
          className="bg-white text-green-700 px-3 py-1 rounded hover:bg-green-100 transition"
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
          {t.logout}
        </button>

      </div>
    </nav>
  );
}

export default Navbar;