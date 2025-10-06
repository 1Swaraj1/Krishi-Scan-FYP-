import React from "react";
import Navbar from "../components/Navbar";

function Dashboard() {
  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50 p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to CropGuard 🌾</h2>
        <p className="text-gray-600">
          Here you can manage your crops, track diseases, and access AI-powered insights.
        </p>

        {/* Placeholder for cards, data, charts etc. */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold">Crop Health</h3>
            <p className="text-sm text-gray-500">AI scan results summary</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold">Recent Alerts</h3>
            <p className="text-sm text-gray-500">No critical alerts currently</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold">Farm Activity</h3>
            <p className="text-sm text-gray-500">Last login: Today at 10:12 AM</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
