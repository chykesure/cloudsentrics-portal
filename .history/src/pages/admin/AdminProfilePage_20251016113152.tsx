import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import profileCover from "../../../src/assets/pic.png";
import toast, { Toaster } from "react-hot-toast";
import { Camera } from "lucide-react";

interface AdminProfile {
  email: string;
  role: string;
  avatar?: string;
}

const AdminProfilePage = () => {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [avatar, setAvatar] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("adminToken");
        const { data } = await axios.get("http://localhost:5000/api/admin/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const profileData: AdminProfile = data.data;
        setProfile(profileData);

        const avatarUrl = profileData.avatar
          ? profileData.avatar.startsWith("http")
            ? profileData.avatar
            : `http://localhost:5000${profileData.avatar}`
          : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

        setAvatar(avatarUrl);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch profile data.");
        setError("Failed to fetch profile data.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Handle avatar change (for display only)
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setAvatar(base64);
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-[#032352] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-700 text-lg mt-4 font-medium animate-pulse">
          Loading profile...
        </p>
        <Toaster position="top-right" reverseOrder={false} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600 text-center">
        <p>{error}</p>
        <Toaster position="top-right" reverseOrder={false} />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-b from-gray-100 to-gray-50 relative">
      <Toaster position="top-right" reverseOrder={false} />

      {/* Profile Cover */}
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
            View your account information
          </p>
        </motion.div>
      </div>

      {/* Profile Card */}
      <div className="max-w-4xl mx-auto mt-10 sm:mt-16 px-4 sm:px-8 relative z-10 flex-grow">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="bg-white rounded-3xl shadow-2xl p-6 sm:p-10 text-center border border-gray-200"
        >
          <div className="relative inline-block mb-5 group">
            <label htmlFor="avatar-upload" className="cursor-pointer block">
              <img
                src={avatar}
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
            {profile.email}
          </h3>
          <p className="text-gray-600 mt-1">Role: {profile.role}</p>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-gradient-to-r from-[#021a3d] via-[#032352] to-[#021a3d] text-white text-center py-8 shadow-inner mt-auto w-full"
      >
        <h3 className="text-lg sm:text-2xl font-bold tracking-wide uppercase drop-shadow-lg">
          © {new Date().getFullYear()} Cloud Sentrics
        </h3>
        <p className="text-sm sm:text-base mt-2 text-gray-200 opacity-90 font-medium">
          Empowering businesses through seamless cloud operations and smart workflows.
        </p>
      </motion.footer>
    </div>
  );
};

export default AdminProfilePage;
