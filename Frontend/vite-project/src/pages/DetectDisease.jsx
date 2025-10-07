// src/pages/DetectDisease.jsx
import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { detectDisease } from "../api/detect";

function DetectDisease() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handle file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setResult(null); // Reset previous result
  };

  // Clear image and result
  const handleClear = () => {
    setImage(null);
    setResult(null);
  };

  // Submit image to backend
  const handleSubmit = async () => {
    if (!image) return;

    setIsLoading(true);
    setResult(null);

    try {
      const data = await detectDisease(image);
      setResult({
        disease: data.predicted_label,
        confidence: Math.round(data.confidence_score * 100),
        solution: data.disease_treatment,
        description: data.disease_description,
      });
    } catch (err) {
      setResult({ error: err.detail || "Prediction failed. Try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto py-12 px-6">
        <h1 className="text-3xl font-bold mb-8 text-green-700 text-center">
          🌿 Crop Disease Detection
        </h1>

        <div className="bg-white p-6 rounded-lg shadow-lg grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Upload a crop leaf photo:
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border border-gray-300 p-2 rounded-md"
            />

            {image && (
              <div className="mt-4">
                <img
                  src={URL.createObjectURL(image)}
                  alt="Uploaded preview"
                  className="rounded-lg border max-h-72 object-contain"
                />
              </div>
            )}

            <div className="flex gap-4 mt-4">
              <button
                onClick={handleSubmit}
                disabled={!image || isLoading}
                className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded transition"
              >
                {isLoading ? "Analyzing..." : "Detect Disease"}
              </button>
              <button
                onClick={handleClear}
                className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded transition"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Result Section */}
          <div className="space-y-4">
            {result ? (
              result.error ? (
                <div className="text-red-600 font-semibold">{result.error}</div>
              ) : (
                <div className="bg-green-50 border border-green-300 p-4 rounded-lg shadow-sm">
                  <h2 className="text-xl font-semibold text-green-800 mb-2">
                    🧪 Detection Result
                  </h2>
                  <p>
                    <span className="font-medium">Disease:</span> {result.disease}
                  </p>
                  <p>
                    <span className="font-medium">Confidence:</span> {result.confidence}%
                  </p>
                  <p>
                    <span className="font-medium">Description:</span> {result.description}
                  </p>
                  <p>
                    <span className="font-medium">Suggested Treatment:</span> {result.solution}
                  </p>
                </div>
              )
            ) : isLoading ? (
              <div className="text-gray-500 italic">Running detection...</div>
            ) : (
              <div className="text-gray-400 italic">Result will appear here.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetectDisease;
