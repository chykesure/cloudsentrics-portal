import { useState, useEffect} from "react";
import type { ChangeEvent } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import profileCover from "../../../src/assets/profile.jpg";
import defaultAvatar from "../../../src/assets/pic.png";
import ProfileSuccess from "./ProfileSuccess";

interface ProfileData {
  name: string;
  companyEmail: string;
  phone: string;
  tier: string;
  storage: string;
  avatar?: string;
}

const ProfilePage = () => {
  const [form, setForm] = useState<ProfileData>({
    name: "",
    companyEmail: "",
    phone: "",
    tier: "",
    storage: "",
    avatar: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showProfileSuccess, setShowProfileSuccess] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedAvatar = localStorage.getItem("avatar");

    if (!storedUser) {
      setError("No logged-in user found!");
      setLoading(false);
      return;
    }

    const user = JSON.parse(storedUser);
    const email = user.companyEmail;

    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/profile/${email}`);
        setForm({
          name: data.name || "",
          companyEmail: data.companyEmail || "",
          phone: data.phone || "",
          tier: data.tier || "",
          storage: data.storage || "",
          avatar: storedAvatar || data.avatar || "",
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to fetch profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      const preview = URL.createObjectURL(file);
      setForm((prev) => ({ ...prev, avatar: preview }));
      localStorage.setItem("avatar", preview);
    }
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("phone", form.phone);
      if (avatarFile) formData.append("avatar", avatarFile);

      const response = await axios.put(
        `http://localhost:5000/api/profile/${form.companyEmail}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.status === 200) {
        localStorage.setItem("user", JSON.stringify(response.data.profile));
        setIsEditing(false);
        setShowProfileSuccess(true);
      } else {
        alert("Failed to update profile.");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      alert("Something went wrong while updating profile.");
    } finally {
      setLoading(false);
    }
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier?.toUpperCase()) {
      case "STANDARD TIER":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "BUSINESS TIER":
        return "bg-green-100 text-green-800 border-green-300";
      case "PREMIUM TIER":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-600 border-gray-300";
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-700 text-lg animate-pulse">Loading profile...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600 text-center">
        <p>{error}</p>
      </div>
    );

  if (showProfileSuccess) return <ProfileSuccess />;

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-100 to-gray-50">
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
            Cloud Sentrics
          </h2>
          <p className="text-base sm:text-lg opacity-90 mt-2 font-medium">
            Profile Settings
          </p>
        </motion.div>
      </div>

      {/* Profile Section */}
      <div className="max-w-5xl mx-auto -mt-16 px-4 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-gray-200"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative cursor-pointer" onClick={() => document.getElementById("avatarInput")?.click()}>
              <img
                src={form.avatar || localStorage.getItem("avatar") || defaultAvatar}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md hover:opacity-90 transition"
              />
              <input
                type="file"
                id="avatarInput"
                accept="image/*"
                onChange={handleAvatarChange}
                hidden
              />
              <p className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">
                Click to change
              </p>
            </div>

            <div className="flex-1 w-full">
              <h3 className="text-2xl sm:text-3xl font-bold text-[#032352]">
                {form.name || "User"} 👋
              </h3>
              <p className="text-gray-600 mt-1">{form.companyEmail}</p>

              {/* Tier & Storage Badges */}
              <div className="flex flex-wrap gap-3 mt-4">
                <span
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border shadow ${getTierBadgeColor(
                    form.tier
                  )}`}
                >
                  {form.tier || "No Tier"}
                </span>
                <span className="bg-gray-100 border border-gray-300 text-[#032352] px-4 py-2 rounded-xl text-sm font-semibold shadow">
                  {form.storage ? `${form.storage} Storage` : "N/A"}
                </span>
              </div>
            </div>
          </div>

          <hr className="border-gray-200 my-6" />

          {/* Profile Info */}
          <div className="grid sm:grid-cols-2 gap-6">
            {["name", "companyEmail", "phone"].map((key) => (
              <div key={key} className="flex flex-col">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  {key.toUpperCase()}
                </label>
                <input
                  type="text"
                  name={key}
                  value={form[key as keyof ProfileData]}
                  onChange={handleChange}
                  disabled={!isEditing || key === "companyEmail"}
                  className={`w-full rounded-xl border border-gray-300 bg-white/90 px-4 py-2 text-gray-800 shadow-sm 
                    focus:border-[#032352] focus:ring-2 focus:ring-[#032352] focus:outline-none transition 
                    ${!isEditing ? "bg-gray-100 cursor-not-allowed" : ""}`}
                />
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-[#032352] text-white rounded-lg shadow hover:bg-[#021a3d] transition"
              >
                Edit Profile
              </button>
            ) : (
              <button
                onClick={handleProfileUpdate}
                className="px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
              >
                Save Changes
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
