import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { detectDisease } from "../api/detect";
import { motion } from "framer-motion";
import { 
  Users, 
  FileText, 
  Shield, 
  ShieldAlert, 
  Trash2, 
  Search, 
  Activity,
  ChevronDown,
  UploadCloud,
  Stethoscope,
  Leaf
} from "lucide-react";

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
    <div className="flex bg-[#F8FAFC] min-h-screen text-gray-800 font-sans">
      <Sidebar onSelect={setSelected} onLogout={handleLogout} />

      <div className="flex-1 p-6 md:p-10 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          
          {/* ✅ Detect Section */}
          {selected === "Detect" && (
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                  <span className="p-2 bg-green-100 text-green-700 rounded-xl"><Leaf size={28} /></span>
                  Crop Disease Detection
                </h2>
                <p className="text-gray-500 mt-2">Upload a leaf image to test the detection system manually.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload Section */}
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <UploadCloud className="text-green-600" /> Upload Image
                  </h3>
                  
                  <div className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors relative cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {!image ? (
                      <div className="text-center">
                        <UploadCloud size={40} className="mx-auto text-gray-400 mb-3" />
                        <p className="text-sm text-gray-600 font-medium">Click or drag image here</p>
                      </div>
                    ) : (
                      <img src={URL.createObjectURL(image)} alt="Preview" className="h-48 object-contain rounded-xl" />
                    )}
                  </div>

                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={handleSubmit}
                      disabled={!image || isDetecting}
                      className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-xl font-semibold text-white shadow-sm transition-all ${
                        !image || isDetecting 
                          ? "bg-green-300 cursor-not-allowed" 
                          : "bg-green-600 hover:bg-green-700 hover:shadow-md active:scale-[0.98]"
                      }`}
                    >
                      <Stethoscope size={20} />
                      {isDetecting ? "Analyzing..." : "Detect Disease"}
                    </button>
                    {image && !isDetecting && (
                      <button
                        onClick={handleClear}
                        className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all active:scale-[0.98]"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Result Section */}
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md h-full">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FileText className="text-green-600" /> Detection Result
                  </h3>
                  
                  {result ? (
                    result.error ? (
                      <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
                         <ShieldAlert /> <span className="font-semibold">{result.error}</span>
                      </div>
                    ) : (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                        <div className="bg-green-50 border border-green-200 p-6 rounded-2xl">
                          <p className="text-sm text-gray-500 font-medium mb-1">Disease Detected</p>
                          <h4 className="text-2xl font-extrabold text-green-800 mb-2">{result.disease}</h4>
                          <div className="flex justify-between items-center text-sm font-semibold text-green-700 mt-4">
                            <span>Confidence</span>
                            <span>{result.confidence}%</span>
                          </div>
                          <div className="w-full bg-white/50 rounded-full h-2 mt-2">
                            <div className="bg-green-500 h-full rounded-full" style={{ width: `${result.confidence}%` }}></div>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                          <p className="text-sm font-bold text-gray-800 mb-2">Description</p>
                          <p className="text-gray-600 text-sm leading-relaxed">{result.description}</p>
                        </div>
                        <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                          <p className="text-sm font-bold text-blue-900 mb-2">Suggested Treatment</p>
                          <p className="text-blue-800 text-sm leading-relaxed">{result.solution}</p>
                        </div>
                      </motion.div>
                    )
                  ) : isDetecting ? (
                    <div className="flex flex-col items-center justify-center h-48 space-y-4">
                      <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                      <p className="text-gray-500 font-medium animate-pulse">Analyzing image...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl">
                      <Leaf size={40} className="mb-3 text-gray-300" />
                      <p>Result will appear here.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ✅ Check Logs Section */}
          {selected === "Check Logs" && (
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <div>
                  <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                    <span className="p-2 bg-blue-100 text-blue-700 rounded-xl"><Activity size={28} /></span>
                    System Logs
                  </h2>
                  <p className="text-gray-500 mt-2">Monitor all system activities and user actions.</p>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-gray-400" />
                  </div>
                  <select
                    className="appearance-none w-full sm:w-64 pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium text-gray-700 shadow-sm"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="All">All Actions</option>
                    <option value="Prediction">Predictions</option>
                    <option value="Login/Logout">Login / Logout</option>
                    <option value="Signup">Signups</option>
                    <option value="Admin">Admin Actions</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ChevronDown size={16} className="text-gray-400" />
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                      <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-4 font-semibold">#</th>
                          <th className="px-6 py-4 font-semibold">User ID</th>
                          <th className="px-6 py-4 font-semibold">Action</th>
                          <th className="px-6 py-4 font-semibold">Details</th>
                          <th className="px-6 py-4 font-semibold">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredLogs.length > 0 ? (
                          filteredLogs.map((log, index) => (
                            <motion.tr 
                              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }}
                              key={log.id || index} 
                              className="hover:bg-blue-50/50 transition-colors"
                            >
                              <td className="px-6 py-4 text-gray-400">{index + 1}</td>
                              <td className="px-6 py-4 font-medium text-gray-700">{log.user_id ?? "System"}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  log.action.includes('Prediction') ? 'bg-purple-100 text-purple-700' :
                                  log.action.includes('Admin') ? 'bg-red-100 text-red-700' :
                                  'bg-blue-100 text-blue-700'
                                }`}>
                                  {log.action}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-gray-600 truncate max-w-[200px]" title={log.details || "—"}>
                                {log.details || "—"}
                              </td>
                              <td className="px-6 py-4 text-gray-500 text-xs">
                                {new Date(log.timestamp).toLocaleString()}
                              </td>
                            </motion.tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="text-center py-10 text-gray-500 bg-gray-50/50">
                              <Activity size={32} className="mx-auto mb-3 text-gray-400" />
                              No logs found matching your filter.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ✅ Administration Section */}
          {selected === "Administration" && (
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                  <span className="p-2 bg-purple-100 text-purple-700 rounded-xl"><Users size={28} /></span>
                  User Administration
                </h2>
                <p className="text-gray-500 mt-2">Manage registered users, assign roles, and control access.</p>
              </div>

              {userLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                      <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-4 font-semibold">User ID</th>
                          <th className="px-6 py-4 font-semibold">Name</th>
                          <th className="px-6 py-4 font-semibold">Email</th>
                          <th className="px-6 py-4 font-semibold">Role</th>
                          <th className="px-6 py-4 font-semibold">Joined Date</th>
                          <th className="px-6 py-4 font-semibold text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {users.length > 0 ? (
                          users.map((u, index) => (
                            <motion.tr 
                              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }}
                              key={u.user_id} 
                              className="hover:bg-purple-50/50 transition-colors"
                            >
                              <td className="px-6 py-4 text-gray-400 text-xs font-mono">{u.user_id}</td>
                              <td className="px-6 py-4 font-bold text-gray-800">{u.name}</td>
                              <td className="px-6 py-4 text-gray-600">{u.email}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                  u.role === "admin"
                                    ? "bg-red-100 text-red-700 border border-red-200"
                                    : "bg-gray-100 text-gray-600 border border-gray-200"
                                }`}>
                                  {u.role === "admin" && <Shield size={12} className="mr-1" />}
                                  {u.role.toUpperCase()}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-gray-500 text-xs">
                                {new Date(u.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 flex justify-center items-center gap-2">
                                {u.role === "user" ? (
                                  <button
                                    onClick={() => handlePromote(u.user_id)}
                                    className="bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold px-3 py-1.5 rounded-lg transition-colors active:scale-95 text-xs flex items-center gap-1"
                                  >
                                    Promote
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleDemote(u.user_id)}
                                    className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-semibold px-3 py-1.5 rounded-lg transition-colors active:scale-95 text-xs flex items-center gap-1"
                                  >
                                    Demote
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDelete(u.user_id)}
                                  className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-lg transition-colors active:scale-95"
                                  title="Delete User"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </motion.tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="text-center py-10 text-gray-500 bg-gray-50/50">
                              <Users size={32} className="mx-auto mb-3 text-gray-400" />
                              No users found in the system.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
