import React, { useState } from "react";
import ToggleUserType from "./ToggleUserType";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios"; // Adjust path based on your file structure

function Signup() {
  const [userType, setUserType] = useState("farmer");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    farmSize: "",
    primaryCrop: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const payload = {
        name: `${form.firstName} ${form.lastName}`,
        email: form.email,
        password: form.password,
      };

      const res = await api.post("/signup", payload);

      setSuccess(res.data.message || "Account created successfully");
      localStorage.setItem("userType", userType);

      // Redirect to login or dashboard after a short delay
      setTimeout(() => navigate("/"), 1500); // Adjust route
    } catch (err) {
      setError(err.response?.data?.detail || "Signup failed");
    }
  };

  return (
    <div className="flex h-screen font-sans">
      {/* Left Panel */}
      <div
        className="w-1/2 bg-cover bg-center flex flex-col justify-end items-start px-12 pb-12 text-white relative rounded-tr-3xl rounded-br-3xl overflow-hidden"
        style={{ backgroundImage: "url('/agricultural-technology-farmer-using-smartphone-to.jpg')" }}
      >
        <div className="bg-black/50 backdrop-blur-md p-6 rounded-lg max-w-md">
          <h1 className="text-4xl font-bold mb-2 tracking-tight text-green-300">🌱 Krishi Scan</h1>
          <p className="text-lg font-semibold text-white mb-2">Join the Future of Farming</p>
          <p className="text-sm leading-relaxed text-gray-200">
            Join thousands of farmers worldwide who trust Krishi Scan
            <span className="font-semibold text-green-200"> AI technology </span>
            to protect their crops and maximize their harvest.
          </p>
        </div>
      </div>

      {/* Right Panel (Form) */}
      <div className="w-1/2 flex items-center justify-center bg-white px-8">
        <div className="max-w-md w-full space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Create your account</h2>
            <p className="text-sm text-gray-500">Let’s get you started with Krishi Scan</p>
          </div>

          <ToggleUserType userType={userType} setUserType={setUserType} />

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="flex gap-4">
              <input
                name="firstName"
                placeholder="First name"
                className="w-1/2 p-3 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:outline-none transition"
                onChange={handleChange}
                required
              />
              <input
                name="lastName"
                placeholder="Last name"
                className="w-1/2 p-3 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:outline-none transition"
                onChange={handleChange}
                required
              />
            </div>

            <input
              name="email"
              type="email"
              placeholder="Email address"
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:outline-none transition"
              onChange={handleChange}
              required
            />

            <input
              name="password"
              type="password"
              placeholder="Create a strong password"
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:outline-none transition"
              onChange={handleChange}
              required
            />

            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:outline-none transition"
              onChange={handleChange}
              required
            />

            {userType === "farmer" && (
              <div className="flex gap-4">
                <select
                  name="farmSize"
                  className="w-1/2 p-3 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:outline-none transition"
                  onChange={handleChange}
                >
                  <option value="">Farm size</option>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>

                <select
                  name="primaryCrop"
                  className="w-1/2 p-3 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:outline-none transition"
                  onChange={handleChange}
                >
                  <option value="">Primary crop</option>
                  <option value="rice">Rice</option>
                  <option value="wheat">Wheat</option>
                  <option value="corn">Corn</option>
                </select>
              </div>
            )}

            <div className="text-sm flex items-center">
              <input type="checkbox" required className="mr-2 accent-green-600" />
              I agree to the{" "}
              <span className="text-green-700 font-medium underline ml-1 mr-1">Terms of Service</span>
              and
              <span className="text-green-700 font-medium underline ml-1">Privacy Policy</span>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}

            <button
              type="submit"
              className="w-full py-3 bg-green-700 hover:bg-green-800 text-white rounded font-semibold transition"
            >
              Create account
            </button>
          </form>

          <p className="text-sm text-center text-gray-600">
            Already have an account?{" "}
            <Link to="/" className="text-green-700 font-semibold hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
