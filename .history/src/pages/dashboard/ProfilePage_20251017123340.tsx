import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import profileCover from "../../../src/assets/pic.png";
import ProfileSuccess from "./ProfileSuccess";
import { Crown, Briefcase, Feather, Camera } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface ProfileData {
  name: string;
  companyEmail: string;
  phone: string;
  tier: string;
  storage: string;
}

interface ProfileData {
  name: string;
  companyEmail: string;
  phone: string;
  tier: string;
  storage: string;
  companyName?: string; // ✅ added
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

  // Load avatar and profile
  useEffect(() => {
    const storedAvatar = localStorage.getItem("avatar");
    if (storedAvatar) {
      setAvatar(storedAvatar);
    }

    // ✅ Robust user/email retrieval
    const storedUser = localStorage.getItem("user");
    const storedEmail = localStorage.getItem("email");

    let email = "";

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        email = user.companyEmail || user.email || storedEmail || "";
      } catch {
        email = storedEmail || "";
      }
    } else {
      email = storedEmail || "";
    }

    if (!email) {
      toast.error("User email not found in localStorage!");
      setError("User email not found in localStorage!");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("/api/profile/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const profile = data.data; // ✅ your backend sends profile inside `data.data`

        // ✅ update other form fields
        setForm({
          name: profile.name || "",
          companyEmail: profile.companyEmail || "",
          phone: profile.phone || "",
          tier: profile.tier || "STANDARD TIER",
          storage: profile.storage || "300GB",
        });

        // ✅ Always update avatar from backend (not just once)
        const avatarUrl = profile.avatar
          ? profile.avatar.startsWith("http")
            ? profile.avatar
            : `${profile.avatar}`
          : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

        setAvatar(avatarUrl);
        localStorage.setItem("avatar", avatarUrl); // ✅ keep in sync for reloads
      } catch (err) {
        console.error("Error fetching profile:", err);
        toast.error("Failed to fetch profile data.");
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

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("phone", form.phone);

      // ✅ Always include companyEmail
      formData.append("companyEmail", form.companyEmail);

      // Handle avatar
      if (avatar && avatar.startsWith("data:")) {
        const blob = await fetch(avatar).then((res) => res.blob());
        formData.append("avatar", new File([blob], "avatar.png"));
      }

      const token = localStorage.getItem("token");

      const response = await axios.put(
        `/api/profile/${form.companyEmail}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        const updatedProfile = response.data.profile;
        localStorage.setItem("user", JSON.stringify(updatedProfile));

        if (updatedProfile.avatar) {
          const fullAvatarUrl = `${updatedProfile.avatar}`;
          localStorage.setItem("avatar", fullAvatarUrl);
          setAvatar(fullAvatarUrl);
        }

        setIsEditing(false);
        setShowProfileSuccess(true);
        toast.success("Profile updated successfully!");
      } else {
        toast.error("Failed to update profile.");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      toast.error("Something went wrong while updating profile.");
    } finally {
      setLoading(false);
    }
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-[#032352] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-700 text-lg mt-4 font-medium animate-pulse">
          Loading your profile...
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

  if (showProfileSuccess) return <ProfileSuccess />;

  return (
    <div className="min-h-[80vh] w-full bg-gradient-to-b from-gray-100 to-gray-50 pb-16 relative">
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
            Cloud Sentrics
          </h2>
          <p className="text-base sm:text-lg opacity-90 mt-2 font-medium">
            Profile Settings
          </p>
        </motion.div>
      </div>

      {/* Main Cards */}
      <div className="max-w-7xl mx-auto -mt-14 sm:-mt-20 px-4 sm:px-8 mb-16">
        <div className="flex flex-col md:flex-row justify-center items-start gap-6 md:gap-10">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex-1 w-full max-w-md lg:max-w-xl 2xl:max-w-2xl bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-10 border border-gray-200 text-center mx-auto"
          >
            <div className="relative inline-block mb-5 group">
              <label htmlFor="avatar-upload" className="cursor-pointer block">
                <img
                  src={
                    avatar ||
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
              {form.name || "User"} 👋
            </h3>
            <p className="text-gray-600 mt-1">{form.companyEmail}</p>

            <div className="flex flex-col sm:flex-row gap-3 mt-5 justify-center items-center">
              {renderTierBadge(form.tier)}
              <span className="bg-gray-100 border border-[#032352]/20 text-[#032352] px-4 py-2 rounded-xl text-sm font-semibold shadow">
                {form.storage || "N/A"}
              </span>
            </div>
          </motion.div>

          {/* Edit Form */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 w-full max-w-md lg:max-w-xl 2xl:max-w-2xl bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 sm:p-10 border border-gray-200 mx-auto"
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
            transition-all duration-200 ${isEditing
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

      {/* Footer Section */}
      <motion.footer
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative bg-gradient-to-r from-[#021a3d] via-[#032352] to-[#021a3d] text-white text-center py-8 shadow-inner overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-white to-yellow-400 animate-pulse" />
        <h3 className="text-lg sm:text-2xl font-bold tracking-wide uppercase drop-shadow-lg">
          © {new Date().getFullYear()} Cloud Sentrics
        </h3>
        <p className="text-sm sm:text-base mt-2 text-gray-200 opacity-90 font-medium">
          Empowering businesses through seamless cloud operations and smart workflows.
        </p>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shine_6s_linear_infinite]" />
      </motion.footer>
    </div>
  );
};

export default ProfilePage;
