import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import profileCover from "../../../src/assets/profile.jpg";
import ProfileSuccess from "./ProfileSuccess";
import { Crown, Briefcase, Feather, Camera } from "lucide-react";

interface ProfileData {
  name: string;
  companyEmail: string;
  phone: string;
  tier: string;
  storage: string;
}

const ProfilePage = () => {
  const [form, setForm] = useState<ProfileData>({
    name: "",
    companyEmail: "",
    phone: "",
    tier: "",
    storage: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showProfileSuccess, setShowProfileSuccess] = useState(false);
  const [error, setError] = useState<string>("");
  const [avatar, setAvatar] = useState<string>("");

  // Load avatar and profile from localStorage
  useEffect(() => {
    const storedAvatar = localStorage.getItem("avatar");
    if (storedAvatar) setAvatar(storedAvatar);

    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      setError("No logged-in user found!");
      setLoading(false);
      return;
    }

    const user = JSON.parse(storedUser);
    const email = user.companyEmail;

    if (!email) {
      setError("User email not found in localStorage!");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/profile/${email}`);
        setForm({
          name: data.name || "",
          companyEmail: data.companyEmail || "",
          phone: data.phone || "",
          tier: data.tier || "",
          storage: data.storage || "",
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

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      const response = await axios.put(
        `http://localhost:5000/api/profile/${form.companyEmail}`,
        form
      );
      if (response.status === 200) {
        localStorage.setItem("user", JSON.stringify(form));
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

  // Handle avatar upload
  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setAvatar(base64);
      localStorage.setItem("avatar", base64);
    };
    reader.readAsDataURL(file);
  };

  const renderTierBadge = (tier: string) => {
    const styleMap: Record<string, any> = {
      "STANDARD TIER": {
        color: "bg-blue-100 text-blue-800 border-blue-300",
        icon: <Feather className="w-4 h-4 mr-1" />,
      },
      "BUSINESS TIER": {
        color: "bg-indigo-100 text-indigo-800 border-indigo-300",
        icon: <Briefcase className="w-4 h-4 mr-1" />,
      },
      "PREMIUM TIER": {
        color:
          "bg-gradient-to-r from-yellow-300 to-yellow-500 text-yellow-900 border-yellow-400",
        icon: <Crown className="w-4 h-4 mr-1" />,
      },
    };

    const tierStyle = styleMap[tier?.toUpperCase()] || styleMap["STANDARD TIER"];

    return (
      <div
        className={`inline-flex items-center px-4 py-2 rounded-full border font-semibold text-sm shadow-sm ${tierStyle.color}`}
      >
        {tierStyle.icon}
        {tier || "No Tier"}
      </div>
    );
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

      {/* Profile Summary Section */}
      <div className="max-w-5xl mx-auto -mt-12 sm:-mt-16 px-4 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 sm:p-10 border border-gray-200"
        >
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            {/* Avatar Upload */}
            <div className="relative group">
              <label htmlFor="avatar-upload" className="cursor-pointer block">
                <img
                  src={
                    avatar ||
                    "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                  }
                  alt="Avatar"
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-[#032352]/20 object-cover shadow-lg transition-transform group-hover:scale-105"
                />
                <div className="absolute bottom-0 right-0 bg-[#032352] p-2 rounded-full shadow-md group-hover:scale-110 transition">
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

            <div className="mt-6 sm:mt-0 text-center sm:text-left">
              <h3 className="text-2xl sm:text-3xl font-bold text-[#032352]">
                {form.name || "User"} 👋
              </h3>
              <p className="text-gray-600 mt-1">{form.companyEmail}</p>
              <div className="flex flex-col sm:flex-row gap-3 mt-4 items-center justify-center sm:justify-start">
                {renderTierBadge(form.tier)}
                <span className="bg-gray-100 border border-[#032352]/20 text-[#032352] px-4 py-2 rounded-xl text-sm font-semibold shadow">
                  {form.storage || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Edit Form */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 sm:p-10 border border-gray-200 mt-10"
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
              onClick={handleProfileUpdate}
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
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
