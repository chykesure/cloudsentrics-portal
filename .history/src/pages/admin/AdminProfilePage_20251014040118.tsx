import { useEffect, useState, ChangeEvent } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import profileCover from "../../../src/assets/pic.png";
import { Camera } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface AdminProfile {
  id: string;
  email: string;
  role: string;
  avatar?: string;
  name?: string;
}

const AdminProfilePage = () => {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [name, setName] = useState("");

  // Fetch profile from backend
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get("http://localhost:5000/api/admin/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: AdminProfile = res.data.data;
      setProfile(data);
      setName(data.name || "");
      if (data.avatar) setAvatarFile(new File([], data.avatar));
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load profile.");
      toast.error("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Avatar file change
  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  // Save profile changes
  const handleSave = async () => {
    if (!profile) return;
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const token = localStorage.getItem("adminToken");
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", profile.email);
      formData.append("role", profile.role);
      if (avatarFile && avatarFile.size > 0) {
        formData.append("avatar", avatarFile);
      }

      const res = await axios.put(
        `http://localhost:5000/api/admin/profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.success) {
        setSuccessMsg("Profile updated successfully!");
        toast.success("Profile updated successfully!");
        fetchProfile();
      } else {
        setErrorMsg("Failed to update profile.");
        toast.error("Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Error updating profile.");
      toast.error("Error updating profile.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-[#032352] border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-700 text-lg mt-4 font-medium animate-pulse">
          Loading profile...
        </p>
        <Toaster position="top-right" reverseOrder={false} />
      </div>
    );

  if (!profile)
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600 text-center">
        <p>Profile not found</p>
        <Toaster position="top-right" reverseOrder={false} />
      </div>
    );

  return (
    <div className="min-h-[80vh] w-full bg-gray-100 pb-16 relative">
      <Toaster position="top-right" reverseOrder={false} />

      {/* Header Banner */}
      <div
        className="relative h-52 sm:h-64 bg-cover bg-center shadow-md"
        style={{ backgroundImage: `url(${profileCover})` }}
      >
        <div className="absolute inset-0 bg-[#032352]/80 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4"
        >
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-wide drop-shadow-md">
            Admin Profile
          </h2>
          <p className="text-base sm:text-lg opacity-90 mt-2 font-medium">
            Profile Settings
          </p>
        </motion.div>
      </div>

      {/* Profile Card */}
      <div className="max-w-3xl mx-auto -mt-20 p-6 bg-white rounded-3xl shadow-2xl border border-gray-200 text-center">
        <div className="relative inline-block mb-5 group">
          <label htmlFor="avatar-upload" className="cursor-pointer block">
            <img
              src={
                avatarFile
                  ? URL.createObjectURL(avatarFile)
                  : profile.avatar ||
                    "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              }
              alt="Avatar"
              className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 border-[#032352]/20 object-cover shadow-xl transition-transform group-hover:scale-105"
            />
            <div className="absolute bottom-2 right-2 bg-[#032352] p-2 rounded-full shadow-md group-hover:scale-110 transition">
              <Camera className="text-white w-4 h-4" />
            </div>
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        <h3 className="text-2xl sm:text-3xl font-bold text-[#032352]">
          {name || "Admin"} 👋
        </h3>
        <p className="text-gray-600 mt-1">{profile.email}</p>
        <p className="text-gray-500 mt-1 font-medium">{profile.role}</p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-lg shadow font-semibold text-base bg-[#032352] text-white hover:bg-[#021a3d] transition"
          >
            Save Changes
          </button>
        </div>

        {successMsg && <p className="text-green-600 mt-4">{successMsg}</p>}
        {errorMsg && <p className="text-red-600 mt-4">{errorMsg}</p>}
      </div>
    </div>
  );
};

export default AdminProfilePage;
