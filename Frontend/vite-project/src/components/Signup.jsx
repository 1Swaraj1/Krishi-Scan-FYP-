import React, { useState } from "react";
import ToggleUserType from "./ToggleUserType";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios"; // Adjust path based on your file structure
import { motion, AnimatePresence } from "framer-motion";
import { Leaf } from "lucide-react";

function Signup() {
  const [userType, setUserType] = useState("user");
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
  const [isShake, setIsShake] = useState(false);
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
      setIsShake(true);
      setTimeout(() => setIsShake(false), 500);
      return;
    }

    try {
      const payload = {
        name: `${form.firstName} ${form.lastName}`,
        email: form.email,
        password: form.password,
      };

      const res = await api.post("/auth/signup", payload);

      setSuccess(res.data.message || "Account created successfully!");
      localStorage.setItem("userType", userType);

      // Redirect to login after a short delay
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setError(err.response?.data?.detail || "Signup failed");
      setIsShake(true);
      setTimeout(() => setIsShake(false), 500);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col md:flex-row h-screen font-sans bg-gray-50"
    >
      {/* Left side (Story Section) */}
      <div className="hidden md:flex w-full md:w-1/2 relative flex-col justify-end items-start px-8 md:px-16 pb-12 text-white overflow-hidden bg-black md:rounded-r-3xl h-64 md:h-full">
        {/* Background Image with Dark Gradient Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/agricultural-technology-farmer-using-smartphone-to.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

        <motion.div
          className="relative z-10 w-full max-w-lg"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <div className="flex items-center space-x-2 mb-4">
            <Leaf className="text-green-400" size={32} />
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-md">
              Krishi Scan
            </h1>
          </div>
          <h2 className="text-xl md:text-3xl font-semibold mb-3 text-green-300">
            Join the Future of Farming 🌱
          </h2>
          <p className="text-base md:text-lg leading-relaxed text-gray-200 mb-6">
            Join thousands of farmers worldwide who trust Krishi Scan AI technology to protect their crops and maximize their harvest.
          </p>

          {/* Floating Badges */}
          <div className="flex space-x-4">
            <motion.div
              className="flex items-center bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <span className="text-sm font-medium">🛡️ Secure Account</span>
            </motion.div>
            <motion.div
              className="flex items-center bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <span className="text-sm font-medium">📈 Grow More</span>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Right side (Form) */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 px-6 py-12 md:px-12 flex-1 overflow-y-auto">
        <motion.div
          className="w-full max-w-md bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 my-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              Create Account
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              Let's get you started with Krishi Scan.
            </p>
          </div>

          <ToggleUserType userType={userType} setUserType={setUserType} />

          <motion.form
            className="space-y-4 mt-2"
            onSubmit={handleSubmit}
            animate={isShake ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
                <input
                  name="firstName"
                  placeholder="John"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 focus:bg-white transition-all duration-200 text-sm"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                <input
                  name="lastName"
                  placeholder="Doe"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 focus:bg-white transition-all duration-200 text-sm"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                name="email"
                type="email"
                placeholder="name@example.com"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 focus:bg-white transition-all duration-200 text-sm"
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                name="password"
                type="password"
                placeholder="Create a strong password"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 focus:bg-white transition-all duration-200 text-sm"
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 focus:bg-white transition-all duration-200 text-sm"
                onChange={handleChange}
                required
              />
            </div>

            {userType === "user" && (
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Farm size</label>
                  <select
                    name="farmSize"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 focus:bg-white transition-all duration-200 text-sm text-gray-600"
                    onChange={handleChange}
                  >
                    <option value="">Select size</option>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primary crop</label>
                  <select
                    name="primaryCrop"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 focus:bg-white transition-all duration-200 text-sm text-gray-600"
                    onChange={handleChange}
                  >
                    <option value="">Select crop</option>
                    <option value="rice">Rice</option>
                    <option value="wheat">Wheat</option>
                    <option value="corn">Corn</option>
                  </select>
                </div>
              </div>
            )}

            <div className="text-sm flex items-start pt-2">
              <input type="checkbox" required className="mt-1 mr-2 accent-green-600" />
              <span className="text-gray-600 leading-tight">
                I agree to the{" "}
                <span className="text-green-700 font-medium hover:underline cursor-pointer">Terms of Service</span>
                {" "}and{" "}
                <span className="text-green-700 font-medium hover:underline cursor-pointer">Privacy Policy</span>
              </span>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100"
              >
                {error}
              </motion.p>
            )}

            {success && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-green-600 text-sm font-medium bg-green-50 p-3 rounded-lg border border-green-100"
              >
                {success}
              </motion.p>
            )}

            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 mt-2 bg-green-700 hover:bg-green-800 text-white rounded-xl font-semibold shadow-sm shadow-green-700/20 transition-all relative overflow-hidden group"
            >
              <span className="relative z-10">
                Create account
              </span>
              <span className="absolute inset-0 bg-white/20 rounded-xl scale-0 group-active:scale-100 opacity-0 group-active:opacity-100 transition-all duration-300 origin-center" />
            </motion.button>
          </motion.form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/"
                className="text-green-700 font-semibold hover:text-green-800 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Signup;
