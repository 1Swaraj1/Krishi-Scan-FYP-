import React from "react";
import { motion } from "framer-motion";

function ToggleUserType({ userType, setUserType }) {
  const options = [
    { id: "user", label: "Farmer", icon: "🌾" },
    { id: "admin", label: "Admin", icon: "🛡️" },
  ];

  return (
    <div className="flex p-1 bg-gray-100 rounded-xl mb-6 relative">
      {options.map((option) => {
        const isActive = userType === option.id;
        return (
          <button
            key={option.id}
            onClick={() => setUserType(option.id)}
            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 text-sm font-medium rounded-lg relative z-10 transition-colors duration-200 ${
              isActive ? "text-green-800" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-white rounded-lg shadow-sm"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-20 text-base">{option.icon}</span>
            <span className="relative z-20">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default ToggleUserType;
