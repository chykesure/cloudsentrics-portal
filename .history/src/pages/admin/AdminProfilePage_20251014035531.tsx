import { useEffect, useState } from "react";
import { ChangeEvent } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Camera } from "lucide-react";

interface AdminProfile {
  id: string;
  email: string;
  role: string;
  avatar?: string;
}

const AdminProfilePage = () => {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
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
    fetchProfile();
  }, []);

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setAvatarFile(e.target.files[0]);
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
      if (avatarFile) formData.append("avatar", avatarFile);

      const res = await axios.put("http://localhost:5000/api/admin/profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        setSuccessMsg("Profile updated successfully!");
        setProfile(res.data.data);
        setIsEditing(false);
        toast.success("Profile updated!");
      } else toast.error("Failed to update profile.");
    } catch (err) {
      console.error(err);
      toast.error("Error updating profile.");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-blue-800 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-700 mt-4 font-medium animate-pulse">Loading profile...</p>
        <Toaster />
      </div>
    );

  if (errorMsg) return <div className="text-red-600 text-center mt-10">{errorMsg}</div>;

  return (
    <div className="min-h-[80vh] bg-gray-50 pb-16 relative">
      <Toaster />

      {/* Banner / Header */}
      <div className="relative h-44 bg-blue-800/70 flex items-center justify-center text-white shadow-md">
        <h2 className="text-3xl font-bold">Admin Profile</h2>
      </div>

      {/* Profile Content */}
      <div className="max-w-6xl mx-auto -mt-20 flex flex-col md:flex-row gap-8 px-4 sm:px-8">
        {/* Left: Avatar & Info */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 bg-white rounded-3xl shadow-lg p-6 sm:p-10 text-center relative"
        >
          <div className="relative inline-block mb-5 group">
            <label htmlFor="avatar-upload" className="cursor-pointer block">
              <img
                src={
                  avatarFile
                    ? URL.createObjectURL(avatarFile)
                    : profile?.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                }
                alt="Avatar"
                className="w-32 h-32 rounded-full border-4 border-blue-200 object-cover shadow-lg transition-transform group-hover:scale-105"
              />
              <div className="absolute bottom-2 right-2 bg-blue-800 p-2 rounded-full shadow-md group-hover:scale-110 transition">
                <Camera className="text-white w-4 h-4" />
              </div>
            </label>
            <input id="avatar-upload" type="file" className="hidden" onChange={handleAvatarChange} />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{profile?.email}</h3>
          <p className="text-gray-500 mt-1">{profile?.role}</p>
        </motion.div>

        {/* Right: Edit Form */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex-1 bg-white rounded-2xl shadow-lg p-6 sm:p-10"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Edit Profile</h3>
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition"
            >
              Edit
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Email</label>
              <input
                type="email"
                value={profile?.email}
                onChange={(e) => setProfile({ ...profile!, email: e.target.value })}
                disabled={!isEditing}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-blue-800 focus:border-blue-800 transition ${
                  !isEditing ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">Role</label>
              <input
                type="text"
                value={profile?.role}
                readOnly
                className="w-full border rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={handleSave}
                disabled={!isEditing}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  isEditing ? "bg-blue-800 text-white hover:bg-blue-900" : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Save Changes
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminProfilePage;
