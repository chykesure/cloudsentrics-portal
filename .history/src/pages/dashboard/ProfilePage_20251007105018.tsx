import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import profileCover from "../../../src/assets/profile.jpg";
import ProfileSuccess from "./ProfileSuccess";

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

  useEffect(() => {
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

      {/* Side by Side Cards */}
      <div className="max-w-7xl mx-auto -mt-12 sm:-mt-16 px-4 sm:px-8 flex flex-col lg:flex-row justify-center items-start gap-10">
        {/* Profile Summary */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex-1 min-w-[350px] bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 sm:p-10 border border-gray-200"
        >
          <div className="flex flex-col justify-between h-full">
            <div className="mb-6">
              <h3 className="text-2xl sm:text-3xl font-bold text-[#032352]">
                Welcome, {form.name || "User"} 👋
              </h3>
              <p className="text-gray-600 mt-1">{form.companyEmail}</p>
            </div>

            <div className="flex gap-3 mb-6">
              <span className="bg-[#032352] text-white px-4 py-2 rounded-xl text-sm font-semibold shadow">
                {form.tier || "No Tier"}
              </span>
              <span className="bg-gray-100 border border-[#032352]/20 text-[#032352] px-4 py-2 rounded-xl text-sm font-semibold shadow">
                {form.storage || "N/A"}
              </span>
            </div>

            <hr className="border-gray-200 mb-6" />

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-600">Name</span>
                <span className="text-lg font-semibold text-[#032352]">{form.name}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-600">Phone</span>
                <span className="text-lg font-semibold text-[#032352]">{form.phone}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Edit Form */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 min-w-[350px] bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 sm:p-10 border border-gray-200"
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
