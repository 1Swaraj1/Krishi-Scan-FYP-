import React from "react";

function ToggleUserType({ userType, setUserType }) {
  return (
    <div className="flex space-x-2 mb-4">
      <button
        className={`flex-1 py-2 rounded ${
          userType === "farmer" ? "bg-green-700 text-white" : "bg-white border"
        }`}
        onClick={() => setUserType("farmer")}
      >
        F <br /> Farmer
      </button>
      <button
        className={`flex-1 py-2 rounded ${
          userType === "user" ? "bg-green-700 text-white" : "bg-white border"
        }`}
        onClick={() => setUserType("admin")}
      >
        A <br /> Admin
      </button>
    </div>
  );
}

export default ToggleUserType;
