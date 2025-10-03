import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-green-700 text-white px-6 py-4 shadow flex justify-between items-center">
      <h1 className="text-2xl font-bold tracking-tight">🌿 CropGuard</h1>

      <ul className="flex space-x-6 items-center text-sm font-medium">
        <li>
          <Link to="/dashboard" className="hover:text-green-200 transition">
            Dashboard
          </Link>
        </li>
        <li>
          <Link to="/profile" className="hover:text-green-200 transition">
            Profile
          </Link>
        </li>
        <li>
          <Link to="/settings" className="hover:text-green-200 transition">
            Settings
          </Link>
        </li>
        <li>
          <button
            className="ml-4 bg-white text-green-700 px-3 py-1 rounded hover:bg-green-100 transition"
            onClick={() => {
              // implement logout logic
              console.log("Logging out");
            }}
          >
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
