import { useState, useEffect, ChangeEvent } from "react";
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
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("adminToken");
        const { data } = await axios.get("http://localhost:5000/api/admin/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const profileData = data.data;
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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!profile) return;
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setAvatar(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!profile) return;
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("adminToken");
      const formData = new FormData();
      formData.append("email", profile.email);
      formData.append("role", profile.role);

      if (avatar.startsWith("data:")) {
        const blob = await fetch(avatar).then((res) => res.blob());
        formData.append("avatar", new File([blob], "avatar.png"));
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

      if (res.status === 200) {
        toast.success("Profile updated successfully!");
        setSuccess("Profile updated successfully!");
        setIsEditing(false);
      } else {
        toast.error("Failed to update profile.");
        setError("Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating profile.");
      setError("Error updating profile.");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-[#032352] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-700 text-lg mt-4 font-medium animate-pulse">
          Loading profile...
        </p>
        <Toaster position="top-right" reverseOrder={false} />
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600 text-center">
        <p>{error}</p>
        <Toaster position="top-right" reverseOrder={false} />
      </div>
    );

  return (
    <div className="min-h-[80vh] w-full bg-gradient-to-b from-gray-100 to-gray-50 pb-16 relative">
      <Toaster position="top-right" reverseOrder={false} />

      {/* Banner */}
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
            Manage your account settings
          </p>
        </motion.div>
      </div>

      {/* Profile Card & Form */}
      <div className="max-w-5xl mx-auto -mt-20 px-4 sm:px-8 flex flex-col md:flex-row gap-8 justify-center items-start">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex-1 bg-white rounded-3xl shadow-2xl p-6 sm:p-10 text-center border border-gray-200"
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

        {/* Edit Form */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 bg-white rounded-2xl shadow-lg p-6 sm:p-10 border border-gray-200"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl sm:text-2xl font-semibold text-[#032352]">
              Update Profile
            </h3>
            <button
              onClick={() => setIsEditing(true)}
              className="px-5 py-2 bg-[#032352] text-white rounded-lg shadow hover:bg-[#021a3d] transition font-medium text-sm sm:text-base"
            >
              Edit
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {["email", "role"].map((key) => (
              <div key={key} className="flex flex-col">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  {key.toUpperCase()}
                </label>
                <input
                  type="text"
                  name={key}
                  value={profile[key as keyof AdminProfile] || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`form-control w-full rounded-xl border border-gray-300 bg-white/90 px-4 py-2 text-gray-800 shadow-sm 
                  focus:border-[#032352] focus:ring-2 focus:ring-[#032352] focus:outline-none transition 
                  ${!isEditing ? "bg-gray-100 cursor-not-allowed" : ""}`}
                />
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              disabled={!isEditing}
              onClick={handleSave}
              className={`px-6 py-2 rounded-lg shadow font-semibold text-base 
              transition-all duration-200 ${
                isEditing
                  ? "bg-[#032352] text-white hover:bg-[#021a3d]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Save Changes
            </button>
          </div>

          {success && <p className="text-green-600 text-center mt-4">{success}</p>}
          {error && <p className="text-red-600 text-center mt-4">{error}</p>}
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative bg-gradient-to-r from-[#021a3d] via-[#032352] to-[#021a3d] text-white text-center py-8 shadow-inner overflow-hidden mt-16"
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
