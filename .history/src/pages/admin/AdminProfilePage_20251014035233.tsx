import { useEffect, useState} from "react";
import type { ChangeEvent } from "react";
import axios from "axios";
import { motion } from "framer-motion";

interface AdminProfile {
  id: string;
  email: string;
  role: string;
  avatar?: string;
}

const AdminProfilePage = () => {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [password, setPassword] = useState("");

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get("http://localhost:5000/api/admin/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data.data);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const token = localStorage.getItem("adminToken");
      const formData = new FormData();
      formData.append("email", profile.email);
      formData.append("role", profile.role);
      if (password) formData.append("password", password);
      if (avatarFile) formData.append("avatar", avatarFile);

      const res = await axios.put("http://localhost:5000/api/admin/profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        setSuccessMsg("Profile updated successfully!");
        setPassword("");
        fetchProfile();
      } else {
        setErrorMsg("Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Error updating profile.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) return <p className="text-center mt-10">Loading profile...</p>;

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-3xl shadow-lg mt-10 space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 text-center">Admin Profile</h2>

      {profile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center"
        >
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative group">
              <img
                src={avatarFile ? URL.createObjectURL(avatarFile) : profile.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                alt="Avatar"
                className="h-32 w-32 rounded-full object-cover border-4 border-gray-200 shadow-md transition-transform transform hover:scale-105"
              />
              <input
                type="file"
                onChange={handleAvatarChange}
                className="absolute inset-0 opacity-0 cursor-pointer rounded-full"
                title="Change Avatar"
              />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-80 transition">
                Change
              </div>
            </div>
            <p className="text-gray-500 text-sm text-center">Click avatar to change</p>
          </div>

          {/* Info Section */}
          <div className="md:col-span-2 space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 focus:ring-[#032352] focus:border-[#032352] shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 focus:ring-[#032352] focus:border-[#032352] shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <input
                type="text"
                value={profile.role}
                readOnly
                className="w-full border rounded-lg px-4 py-2 bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 mt-4">
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2 bg-[#032352] text-white font-semibold rounded-lg hover:bg-blue-800 transition"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
              {successMsg && <p className="text-green-600 font-medium">{successMsg}</p>}
              {errorMsg && <p className="text-red-600 font-medium">{errorMsg}</p>}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminProfilePage;
