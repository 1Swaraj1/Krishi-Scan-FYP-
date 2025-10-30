import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-green-700 text-white px-6 py-4 shadow flex justify-between items-center">
      <h1 className="text-2xl font-bold tracking-tight"> Krishi Scan</h1>

      <ul className="flex space-x-6 items-center text-sm font-medium">
        <li>
          <button
            className="ml-4 bg-white text-green-700 px-3 py-1 rounded hover:bg-green-100 transition"
            onClick={async () => {
              try {
                const token = localStorage.getItem("token");
                if (!token) {
                  console.log("No token found");
                  window.location.href = "/";
                  return;
                }

                const response = await fetch("http://127.0.0.1:8000/auth/logout", {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                });

                if (response.ok) {
                  const data = await response.json();
                  console.log(data.message); // optional: show toast or alert
                } else {
                  console.warn("Logout failed on server");
                }

                // ✅ Remove token and redirect
                localStorage.removeItem("token");
                window.location.href = "/";
              } catch (error) {
                console.error("Logout error:", error);
                localStorage.removeItem("token");
                window.location.href = "/";
              }
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
