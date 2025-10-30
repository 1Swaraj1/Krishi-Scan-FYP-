import { useState } from "react";
import { Activity, FileText, Settings, LogOut } from "lucide-react";
import { motion } from "framer-motion";

const Sidebar = ({ onSelect, onLogout }) => {
  const [active, setActive] = useState("Detect");

  const menuItems = [
    { name: "Detect", icon: <Activity size={20} /> },
    { name: "Check Logs", icon: <FileText size={20} /> },
    { name: "Administration", icon: <Settings size={20} /> },
  ];

  return (
    <motion.div
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-screen w-64 bg-white text-gray-800 flex flex-col p-4 shadow-md border-r border-gray-200"
    >
      <h1 className="text-2xl font-bold mb-6 text-green-600 tracking-wide">
        Krishi-Scan
      </h1>

      <ul className="space-y-2 flex-1">
        {menuItems.map((item) => (
          <li
            key={item.name}
            onClick={() => {
              setActive(item.name);
              onSelect(item.name);
            }}
            className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all duration-200 
            ${
              active === item.name
                ? "bg-green-100 text-green-700 shadow-sm"
                : "hover:bg-gray-100"
            }`}
          >
            {item.icon}
            <span className="text-sm font-medium">{item.name}</span>
          </li>
        ))}
      </ul>

      <div
        onClick={onLogout}
        className="flex items-center gap-3 p-2 rounded-xl cursor-pointer text-gray-700 hover:bg-red-100 hover:text-red-600 transition-all"
      >
        <LogOut size={20} />
        <span className="text-sm font-medium">Logout</span>
      </div>
    </motion.div>
  );
};

export default Sidebar;
