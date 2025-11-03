// src/pages/DetectDisease.jsx
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { detectDisease } from "../api/detect";
import api from "../api/axios";

function DetectDisease() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  // Attempt to get userId from JWT stored in localStorage token
  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      const payload = token.split(".")[1];
      // base64url -> base64
      const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(b64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const parsed = JSON.parse(jsonPayload);
      return parsed.user_id ?? parsed.userId ?? null;
    } catch (e) {
      console.warn("Failed to parse token for user id:", e);
      return null;
    }
  };

  const userId = getUserIdFromToken();

  // Build image URL from returned image_path string in DB by extracting filename.
  // Adjust this if your backend serves uploads at another route.
  const makeImageUrl = (imagePath) => {
    if (!imagePath) return "";
    // extract filename from path (handles C:\... and /... and backslashes)
    const parts = imagePath.split(/[/\\]+/);
    const filename = parts[parts.length - 1];
    // common static route: http://localhost:8000/uploads/<filename>
    return `${api.defaults.baseURL.replace(/\/$/, "")}/uploads/${encodeURIComponent(filename)}`;
  };

  // Fetch user history from backend predictions table
  const fetchHistory = async () => {
    setError(null);
    if (!userId) {
      setError("User not identified. Please login.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/user/${userId}/history`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setHistory(res.data || []);
    } catch (err) {
      console.error("Error fetching history:", err);
      setError(err.response?.data?.detail || "Failed to load history");
      setHistory([]);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // file selection
  const handleImageChange = (e) => {
    setResult(null);
    setError(null);
    const file = e.target.files?.[0] ?? null;
    setImage(file);
  };

  // clear current selection/result
  const handleClear = () => {
    setImage(null);
    setResult(null);
    setError(null);
  };

  // submit to predict endpoint (detect.js handles auth header)
  const handleSubmit = async () => {
    if (!image) return;
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const data = await detectDisease(image);
      // map response to UI-friendly object (guard against different shapes)
      const mapped = {
        disease: data.predicted_label ?? data.label ?? "Unknown",
        confidence:
          typeof data.confidence_score === "number"
            ? Math.round(data.confidence_score * (data.confidence_score <= 1 ? 100 : 1))
            : Math.round(Number(data.confidence_score) || 0),
        description: data.disease_description ?? data.description ?? "",
        solution: data.disease_treatment ?? data.treatment ?? "",
      };
      setResult(mapped);

      // backend (predict endpoint) should have saved the prediction into predictions table.
      // refresh history to display newly created record
      await fetchHistory();
    } catch (err) {
      console.error("Detection failed:", err);
      setError(err.detail || err.response?.data?.detail || "Prediction failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto py-10 px-6">
        <h1 className="text-3xl font-bold mb-8 text-green-700 text-center">
          <span role="img" aria-label="leaf">🌿</span> Crop Disease Detection
        </h1>

        <div className="bg-white p-6 rounded-lg shadow-lg grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Upload / Controls */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Upload a crop leaf photo:</label>

            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full border border-gray-300 p-2 rounded-md"
              />
            </div>

            {image && (
              <div className="mt-4">
                <div className="rounded-lg border overflow-hidden w-64">
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Preview"
                    className="object-contain w-full h-64"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-4 mt-4">
              <button
                onClick={handleSubmit}
                disabled={!image || isLoading}
                className={`inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded transition ${
                  !image || isLoading ? "opacity-60 cursor-not-allowed" : ""
                }`}
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

            {error && <div className="text-red-600 mt-2">{error}</div>}
          </div>

          {/* Result Card */}
          <div className="space-y-4">
            {result ? (
              <div className="bg-green-50 border border-green-300 p-5 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-green-800 mb-3">Detection Result</h2>

                <div className="mb-2">
                  <div className="text-sm text-gray-600">Disease</div>
                  <div className="font-medium text-lg">{result.disease}</div>
                </div>

                <div className="mb-3">
                  <div className="text-sm text-gray-600">Confidence</div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-white rounded-full h-3 overflow-hidden border">
                      <div
                        style={{ width: `${Math.max(0, Math.min(100, result.confidence))}%` }}
                        className="h-full bg-green-600"
                      />
                    </div>
                    <div className="text-sm font-medium">{result.confidence}%</div>
                  </div>
                </div>

                {result.description && (
                  <p className="text-gray-700"><strong>Description:</strong> {result.description}</p>
                )}
                {result.solution && (
                  <p className="text-gray-700 mt-2"><strong>Suggested Treatment:</strong> {result.solution}</p>
                )}
              </div>
            ) : isLoading ? (
              <div className="text-gray-500 italic">Running detection...</div>
            ) : (
              <div className="text-gray-400 italic">Result will appear here.</div>
            )}
          </div>
        </div>

        {/* History Section */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-green-700">Your Detection History</h2>
            <div className="text-sm text-gray-600">Showing last {history.length} detections</div>
          </div>

          {history.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">No past detections found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {history.map((item) => {
                // item fields: prediction_id, image_path, predicted_label, confidence_score, created_at
                const imgUrl = makeImageUrl(item.image_path);
                // normalize label and confidence
                const label = item.predicted_label ?? "Unknown";
                const confidence =
                  typeof item.confidence_score === "number"
                    ? Math.round(item.confidence_score * (item.confidence_score <= 1 ? 100 : 1))
                    : Math.round(Number(item.confidence_score) || 0);
                const dateStr = item.created_at ? new Date(item.created_at).toLocaleString() : "";

                return (
                  <div key={item.prediction_id} className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
                    <div className="w-full h-44 rounded overflow-hidden border mb-3 flex items-center justify-center bg-gray-50">
                      {imgUrl ? (
                        // Use backend static uploads route
                        // If backend doesn't serve uploads like this, change makeImageUrl() to match your server
                        <img src={imgUrl} alt="history" className="object-cover w-full h-full" />
                      ) : (
                        <div className="text-sm text-gray-400">No preview</div>
                      )}
                    </div>

                    <h3 className="font-semibold text-green-800">{label}</h3>
                    <p className="text-sm text-gray-600 mt-1">Confidence: <span className="font-medium">{confidence}%</span></p>
                    <p className="text-sm text-gray-500 mt-1">Date: {dateStr}</p>

                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => {
                          // re-open the image in a new tab (raw image)
                          if (imgUrl) window.open(imgUrl, "_blank");
                        }}
                        className="text-sm px-3 py-1 border rounded text-green-700 hover:bg-green-50"
                      >
                        View Image
                      </button>

                      <button
                        onClick={() => {
                          // re-run detection by fetching the image as blob and sending to predict
                          // we will attempt to fetch the image and re-send it — fallback if image inaccessible
                          (async () => {
                            try {
                              setIsLoading(true);
                              setResult(null);
                              // fetch remote image as blob
                              const token = localStorage.getItem("token");
                              const resp = await fetch(imgUrl, {
                                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                              });
                              const blob = await resp.blob();
                              const filename = imgUrl.split("/").pop();
                              const file = new File([blob], filename, { type: blob.type });
                              const data = await detectDisease(file);
                              const mapped = {
                                disease: data.predicted_label ?? data.label ?? "Unknown",
                                confidence:
                                  typeof data.confidence_score === "number"
                                    ? Math.round(data.confidence_score * (data.confidence_score <= 1 ? 100 : 1))
                                    : Math.round(Number(data.confidence_score) || 0),
                                description: data.disease_description ?? data.description ?? "",
                                solution: data.disease_treatment ?? data.treatment ?? "",
                              };
                              setResult(mapped);
                              await fetchHistory();
                            } catch (e) {
                              console.error("Re-detect failed:", e);
                              setError("Re-detect failed. Check image access or server.");
                            } finally {
                              setIsLoading(false);
                            }
                          })();
                        }}
                        className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Re-detect
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DetectDisease;
