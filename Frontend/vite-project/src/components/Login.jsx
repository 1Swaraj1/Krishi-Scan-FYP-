import React, { useState } from "react";
import ToggleUserType from "./ToggleUserType";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios"; // Make sure this path is correct

function Login() {
  const [userType, setUserType] = useState("farmer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent default form reload
    setError(""); // reset error

    try {
      const response = await api.post("/auth/login", { email, password });
      const { access_token } = response.data;

      // Store token (you can also store user type if needed)
      localStorage.setItem("token", access_token);
      localStorage.setItem("userType", userType);

      // Conditional redirection based on user type
    if (userType === "admin") {
      navigate("/dashboard");
    } else if (userType === "farmer") {
      navigate("/detect");
    } else {
      navigate("/"); // fallback route
    }

    } catch (err) {
      const msg = err.response?.data?.detail || "Login failed";
      setError(msg);
    }
  };

  return (
    <div className="flex h-screen font-sans">
      {/* Left side */}
      <div
        className="w-1/2 bg-cover bg-center flex flex-col justify-end items-start px-12 pb-12 text-white relative rounded-tr-3xl rounded-br-3xl overflow-hidden"
        style={{ backgroundImage: "url('/healthy-green-crop-field-with-farmer-examining-pla.jpg')" }}
      >
        <div className="bg-black/50 backdrop-blur-md p-6 rounded-lg max-w-md">
          <h1 className="text-4xl font-bold mb-2 tracking-tight text-green-300">
            Krishi Scan
          </h1>
          <p className="text-lg font-semibold text-white mb-2">Join the Future of Farming</p>
          <p className="text-sm leading-relaxed text-gray-200">
            Join thousands of farmers worldwide who trust Krishi Scan
            <span className="font-semibold text-green-200"> AI technology </span>
            to protect their crops and maximize their harvest.
          </p>
        </div>
      </div>

      {/* Right side (Form) */}
      <div className="w-1/2 flex items-center justify-center bg-white px-8">
        <div className="max-w-md w-full space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome back</h2>
            <p className="text-sm text-gray-500">
              Sign in to your account and continue protecting your crops
            </p>
          </div>

          <ToggleUserType userType={userType} setUserType={setUserType} />

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="mt-1 w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="mt-1 w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => console.log("Forgot password clicked")}
                className="text-sm text-green-600 hover:underline"
              >
                Forgot your password?
              </button>
            </div>

            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-green-700 hover:bg-green-800 text-white rounded font-semibold transition"
            >
              Sign in as {userType.charAt(0).toUpperCase() + userType.slice(1)}
            </button>
          </form>

          <p className="text-sm text-center text-gray-600">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-green-700 font-semibold hover:underline">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
