import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { detectDisease } from "../api/detect";

const Dashboard = () => {
  const [selected, setSelected] = useState("Detect");
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(false);

  // Detect feature states
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);

  // Administration states
  const [users, setUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const token = localStorage.getItem("token");
  const ADMIN_API = "http://127.0.0.1:8000/admin";

  // Fetch logs
  useEffect(() => {
    if (selected === "Check Logs") {
      fetchLogs();
    }
  }, [selected]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${ADMIN_API}/logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(response.data);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter logs client-side
  const filteredLogs = logs.filter((log) => {
    if (filter === "All") return true;
    if (filter === "Login/Logout")
      return (
        log.action.toLowerCase().includes("login") ||
        log.action.toLowerCase().includes("logout")
      );
    return log.action.toLowerCase().includes(filter.toLowerCase());
  });

  // Detect logic
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setResult(null);
  };

  const handleClear = () => {
    setImage(null);
    setResult(null);
  };

  const handleSubmit = async () => {
    if (!image) return;
    setIsDetecting(true);
    setResult(null);

    try {
      const data = await detectDisease(image);
      setResult({
        disease: data.predicted_label,
        confidence: Math.round(data.confidence_score),
        solution: data.disease_treatment,
        description: data.disease_description,
      });
    } catch (err) {
      setResult({ error: err.detail || "Prediction failed. Try again." });
    } finally {
      setIsDetecting(false);
    }
  };

  // --- ADMINISTRATION FUNCTIONS ---
  const fetchUsers = async () => {
    setUserLoading(true);
    try {
      const res = await axios.get(`${ADMIN_API}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setUserLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`${ADMIN_API}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const handlePromote = async (userId) => {
    try {
      await axios.put(`${ADMIN_API}/users/${userId}/promote`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
      console.error("Error promoting user:", err);
    }
  };

  const handleDemote = async (userId) => {
    try {
      await axios.put(`${ADMIN_API}/users/${userId}/demote`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
      console.error("Error demoting user:", err);
    }
  };

  useEffect(() => {
    if (selected === "Administration") {
      fetchUsers();
    }
  }, [selected]);

  return (
    <div className="flex bg-[#f8f9fa] min-h-screen text-gray-800">
      <Sidebar onSelect={setSelected} onLogout={handleLogout} />

      <div className="flex-1 p-8 overflow-y-auto">
        {/* ✅ Detect Section */}
        {selected === "Detect" && (
          <div>
            <h2 className="text-2xl font-semibold text-green-700 mb-4">
              🌿 Crop Disease Detection
            </h2>

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
                    disabled={!image || isDetecting}
                    className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded transition"
                  >
                    {isDetecting ? "Analyzing..." : "Detect Disease"}
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
                        Detection Result
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
                ) : isDetecting ? (
                  <div className="text-gray-500 italic">Running detection...</div>
                ) : (
                  <div className="text-gray-400 italic">Result will appear here.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ✅ Check Logs Section */}
        {selected === "Check Logs" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-green-700">🧾 Check Logs</h2>

              <select
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Prediction">Prediction</option>
                <option value="Login/Logout">Login/Logout</option>
                <option value="Signup">Signup</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            {loading ? (
              <p>Loading logs...</p>
            ) : (
              <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full text-sm text-left">
                  <thead className="bg-green-600 text-white">
                    <tr>
                      <th className="px-4 py-2">#</th>
                      <th className="px-4 py-2">User ID</th>
                      <th className="px-4 py-2">Action</th>
                      <th className="px-4 py-2">Details</th>
                      <th className="px-4 py-2">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.length > 0 ? (
                      filteredLogs.map((log, index) => (
                        <tr
                          key={log.id || index}
                          className="border-b hover:bg-green-50 transition"
                        >
                          <td className="px-4 py-2">{index + 1}</td>
                          <td className="px-4 py-2">{log.user_id}</td>
                          <td className="px-4 py-2 font-medium text-green-700">{log.action}</td>
                          <td className="px-4 py-2">{log.details || "—"}</td>
                          <td className="px-4 py-2">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-gray-500">
                          No logs found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ✅ Administration Section */}
        {selected === "Administration" && (
          <div className="p-4">
            <h2 className="text-2xl font-semibold text-green-700 mb-4">⚙️ User Administration</h2>

            {userLoading ? (
              <p>Loading users...</p>
            ) : (
              <div className="overflow-x-auto shadow-lg rounded-lg bg-white">
                <table className="min-w-full border border-gray-200 text-sm text-left">
                  <thead className="bg-green-100 text-green-800">
                    <tr>
                      <th className="px-4 py-3 border-b">User ID</th>
                      <th className="px-4 py-3 border-b">Name</th>
                      <th className="px-4 py-3 border-b">Email</th>
                      <th className="px-4 py-3 border-b">Role</th>
                      <th className="px-4 py-3 border-b">Created At</th>
                      <th className="px-4 py-3 border-b text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length > 0 ? (
                      users.map((u) => (
                        <tr key={u.user_id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 border-b">{u.user_id}</td>
                          <td className="px-4 py-3 border-b">{u.name}</td>
                          <td className="px-4 py-3 border-b">{u.email}</td>
                          <td className="px-4 py-3 border-b">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                u.role === "admin"
                                  ? "bg-blue-100 text-blue-600"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 border-b">{u.created_at}</td>
                          <td className="px-4 py-3 border-b text-center space-x-2">
                            {u.role === "user" ? (
                              <button
                                onClick={() => handlePromote(u.user_id)}
                                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                              >
                                Promote
                              </button>
                            ) : (
                              <button
                                onClick={() => handleDemote(u.user_id)}
                                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                              >
                                Demote
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(u.user_id)}
                              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-4 text-gray-500">
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
