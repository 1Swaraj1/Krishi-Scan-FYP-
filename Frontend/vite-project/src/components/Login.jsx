import React, { useState, useEffect } from "react";
import ToggleUserType from "./ToggleUserType";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios"; // Make sure this path is correct
import SplashScreen from "./SplashScreen";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf } from "lucide-react";

function Login() {
  const [userType, setUserType] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isShake, setIsShake] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
        role: userType, // 👈 Send this to backend
      });

      const { access_token, role } = response.data;
      localStorage.setItem("token", access_token);
      localStorage.setItem("role", role);

      // Redirect based on backend-confirmed role
      if (userType === "admin") {
        navigate("/dashboard");
      } else if (userType === "user") {
        navigate("/detect");
      } else {
        navigate("/"); // fallback route
      }
    } catch (err) {
      const msg = err.response?.data?.detail || "Login failed";
      setError(msg);
      // Trigger shake animation on error
      setIsShake(true);
      setTimeout(() => setIsShake(false), 500);
    }
  };

  return (
    <AnimatePresence>
      {showSplash ? (
        <SplashScreen key="splash" onComplete={() => setShowSplash(false)} />
      ) : (
        <motion.div
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row h-screen font-sans bg-gray-50"
        >
          {/* Left side (Story Section) */}
          <div className="w-full md:w-1/2 relative flex flex-col justify-end items-start px-8 md:px-16 pb-12 text-white overflow-hidden bg-black md:rounded-r-3xl h-64 md:h-full">
            {/* Background Image with Dark Gradient Overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: "url('/healthy-green-crop-field-with-farmer-examining-pla.jpg')",
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
                Detect Crop Diseases in Seconds 🌱
              </h2>
              <p className="text-base md:text-lg leading-relaxed text-gray-200 mb-6">
                AI-powered insights to protect and maximize your harvest. Join thousands of farmers making data-driven decisions.
              </p>

              {/* Floating Badges */}
              <div className="flex space-x-4">
                <motion.div
                  className="flex items-center bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <span className="text-sm font-medium">⚡ Instant Results</span>
                </motion.div>
                <motion.div
                  className="flex items-center bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <span className="text-sm font-medium">🛡️ AI Powered</span>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Right side (Form) */}
          <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 px-6 py-12 md:px-12 flex-1">
            <motion.div
              className="w-full max-w-md bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                  Welcome back
                </h2>
                <p className="text-gray-500 mt-2 text-sm">
                  Please enter your details to sign in.
                </p>
              </div>

              <ToggleUserType userType={userType} setUserType={setUserType} />

              <motion.form
                className="space-y-5"
                onSubmit={handleSubmit}
                animate={isShake ? { x: [-10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 focus:bg-white transition-all duration-200"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => console.log("Forgot password clicked")}
                      className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 focus:bg-white transition-all duration-200"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
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

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 bg-green-700 hover:bg-green-800 text-white rounded-xl font-semibold shadow-sm shadow-green-700/20 transition-all relative overflow-hidden group"
                >
                  <span className="relative z-10">
                    Sign in as {userType === "user" ? "Farmer" : "Admin"}
                  </span>
                  <span className="absolute inset-0 bg-white/20 rounded-xl scale-0 group-active:scale-100 opacity-0 group-active:opacity-100 transition-all duration-300 origin-center" />
                </motion.button>
              </motion.form>

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="text-green-700 font-semibold hover:text-green-800 transition-colors"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Login;
