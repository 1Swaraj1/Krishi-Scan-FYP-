import { useState } from "react";
import Sidebar from "../components/Sidebar";

const Dashboard = () => {
  const [selected, setSelected] = useState("Detect");

  const handleLogout = () => {
    // Example: clear storage and redirect
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="flex bg-[#f8f9fa] min-h-screen text-gray-800">
      <Sidebar onSelect={setSelected} onLogout={handleLogout} />

      <div className="flex-1 p-8">
        {selected === "Detect" && (
          <div>
            <h2 className="text-2xl font-semibold text-green-700 mb-4">
              🌿 Detect Section
            </h2>
            <p className="text-gray-600">
              This section can display crop disease detection or scanning results.
            </p>
          </div>
        )}

        {selected === "Check Logs" && (
          <div>
            <h2 className="text-2xl font-semibold text-green-700 mb-4">
              🧾 Check Logs
            </h2>
            <p className="text-gray-600">
              Here you can review all detection logs and system activities.
            </p>
          </div>
        )}

        {selected === "Administration" && (
          <div>
            <h2 className="text-2xl font-semibold text-green-700 mb-4">
              ⚙️ Administration
            </h2>
            <p className="text-gray-600">
              Manage system settings, users, and access control here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
