import { useState, useEffect } from "react";
import { Camera } from "lucide-react";
import { motion } from "framer-motion";
import profileCover from "../../../src/assets/profile.jpg";
import defaultAvatar from "../../../src/assets/pic.png";
import ProfileSuccess from "./ProfileSuccess";

const ProfilePage = (props) => {
  const email = props.email; // get email from dashboard layout

  const [form, setForm] = useState({
    name: "",
    email: "",
    customerId: "",
    phone: "",
    tier: "",
    storage: "",
  });

  const [avatar, setAvatar] = useState(defaultAvatar);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showProfileSuccess, setShowProfileSuccess] = useState(false);

  // Fetch profile from backend
  useEffect(() => {
    if (!email) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/profile/${email}`);
        const data = await res.json();
        setForm({
          name: data.name || "",
          email: data.email || "",
          customerId: data.customerId || "",
          phone: data.phone || "",
          tier: data.tier || "",
          storage: data.storage || "",
        });
        if (data.avatar) setAvatar(data.avatar);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
  }, [email]);

  // Avatar upload preview
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) setAvatar(reader.result as string);
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  };


  // Update form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle profile update (frontend simulation)
  const handleProfileUpdate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsEditing(false);
      setShowProfileSuccess(true);
    }, 1500);
  };

  if (showProfileSuccess) {
    return <ProfileSuccess />;
  }

  return (
    <div className="min-h-screen w-full bg-gray-100">
      {/* Cover Image */}
      <div
        className="relative h-48 sm:h-64 bg-cover bg-center"
        style={{ backgroundImage: `url(${profileCover})` }}
      >
        <div className="absolute inset-0 bg-[#032352]/80" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4"
        >
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-wide">
            Cloud Sentrics
          </h2>
          <p className="text-base sm:text-lg opacity-90 mt-1">Profile Settings</p>
        </motion.div>
      </div>

      {/* Avatar + Stats */}
      <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 px-4 sm:px-10">
        <motion.div whileHover={{ scale: 1.05 }} className="relative">
          <img
            src={avatar}
            alt="Profile"
            className="h-28 w-28 sm:h-36 sm:w-36 rounded-full border-[5px] sm:border-[6px] border-[#032352] shadow-lg object-cover"
          />
          <input
            type="file"
            accept="image/*"
            id="avatarUpload"
            onChange={handleImageUpload}
            className="hidden"
          />
          <label
            htmlFor="avatarUpload"
            className="absolute bottom-2 right-2 bg-[#032352] text-white p-2 rounded-full shadow-lg hover:bg-[#021a3d] transition cursor-pointer"
          >
            <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
          </label>
        </motion.div>

        <div className="flex gap-8 sm:gap-12 sm:ml-10 text-center sm:text-left">
          <div>
            <p className="text-xs sm:text-sm font-semibold text-[#032352]/70 tracking-wide">
              TIER LEVEL
            </p>
            <p className="text-base sm:text-lg font-bold text-[#032352]">
              {form.tier}
            </p>
          </div>
          <div>
            <p className="text-xs sm:text-sm font-semibold text-[#032352]/70 tracking-wide">
              STORAGE
            </p>
            <p className="text-base sm:text-lg font-bold text-[#032352]">
              {form.storage}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Details & Editable Form */}
      <div className="flex flex-col md:flex-row gap-6 sm:gap-8 px-4 sm:px-10 mt-10 sm:mt-12">
        {/* Left: Profile Details */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="bg-gray-50 shadow-xl rounded-2xl p-4 sm:p-8 border-l-4 sm:border-l-8 border-[#032352] w-full md:w-1/2"
        >
          <div className="flex justify-end mb-4 sm:mb-6">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 sm:px-6 py-2 bg-[#032352] text-white rounded-lg shadow hover:bg-[#021a3d] transition font-medium text-sm sm:text-base"
            >
              Edit Profile
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-gray-700">
            {Object.entries(form).map(([key, value]) => (
              <div key={key} className="flex flex-col">
                <p className="font-semibold text-xs sm:text-sm text-[#032352]/70">
                  {key.toUpperCase()}
                </p>
                <p className="text-base sm:text-lg font-medium text-[#032352]">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right: Editable Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="bg-gray-50 shadow-xl rounded-2xl p-4 sm:p-8 border-r-4 sm:border-r-8 border-[#032352] w-full md:w-1/2"
        >
          <h3 className="text-lg sm:text-2xl font-semibold mb-4 sm:mb-6 text-[#032352]">
            Update your profile
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {Object.keys(form).map((key) => (
              <div key={key} className="flex flex-col">
                <label className="block text-xs sm:text-sm font-medium text-[#032352]/70 mb-1">
                  {key.toUpperCase()}
                </label>
                <input
                  type="text"
                  name={key}
                  value={form[key]}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`form-control w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 text-gray-800 shadow-sm 
                    focus:border-[#032352] focus:ring-2 focus:ring-[#032352] focus:outline-none transition 
                    ${!isEditing ? "bg-gray-100 cursor-not-allowed" : ""}`}
                />
              </div>
            ))}
          </div>

          <div className="mt-6 sm:mt-8 flex justify-center">
            <button
              disabled={!isEditing}
              onClick={handleProfileUpdate}
              className={`px-5 sm:px-6 py-2 rounded-lg shadow font-medium transition text-sm sm:text-base 
                ${isEditing
                  ? "bg-[#032352] text-white hover:bg-[#021a3d]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
            >
              Update Profile
            </button>
          </div>
        </motion.div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/90 backdrop-blur-md">
          <motion.div
            className="h-12 w-12 sm:h-16 sm:w-16 border-4 border-t-blue-800 border-b-blue-500 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          />
          <p className="mt-4 text-gray-700 font-medium text-sm sm:text-lg animate-pulse text-center">
            Loading, please wait...
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
