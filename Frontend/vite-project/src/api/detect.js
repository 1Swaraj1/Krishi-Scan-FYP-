// src/api/detect.js
import api from "./axios"; // your axios instance

export const detectDisease = async (imageFile) => {
  const token = localStorage.getItem("token"); // get JWT

  const formData = new FormData();
  formData.append("file", imageFile);

  try {
    const response = await api.post("/predict/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (err) {
    console.error("Detection API error:", err.response?.data || err.message);
    throw err.response?.data || { detail: "Prediction failed" };
  }
};
