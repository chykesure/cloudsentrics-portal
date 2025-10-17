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

    // Fetch profile data
    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("adminToken");
                const { data } = await axios.get("https://onboardingportal.cloudsentrics.org/api/admin/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const profileData: AdminProfile = data.data;
                setProfile(profileData);

                const avatarUrl = profileData.avatar
                    ? profileData.avatar.startsWith("http")
                        ? profileData.avatar
                        : `https://onboardingportal.cloudsentrics.org${profileData.avatar}`
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

    // Handle avatar upload and auto-save
    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("avatar", file);

        // ✅ Automatically detect which token is available
        const token =
            localStorage.getItem("adminToken") ||
            localStorage.getItem("superAdminToken") ||
            localStorage.getItem("token");

        if (!token) {
            toast.error("No valid token found. Please log in again.");
            return;
        }

        toast.loading("Uploading avatar...", { id: "upload" });

        try {
            const res = await axios.put(
                "https://onboardingportal.cloudsentrics.org/api/admin/profile/avatar",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            const updatedAvatar = res.data?.data?.avatar;
            if (!updatedAvatar) {
                toast.error("Avatar not returned from server.", { id: "upload" });
                return;
            }

            setProfile((prev: any) => ({ ...prev, avatar: updatedAvatar }));
            toast.success("Profile photo updated successfully!", { id: "upload" });
        } catch (err) {
            console.error(err);
            toast.error("Failed to upload avatar.", { id: "upload" });
        }
    };

    if (loading)
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
                <div className="w-16 h-16 border-4 border-[#032352] border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-700 text-lg mt-4 font-medium animate-pulse">
                    Loading profile...
                </p>
                <Toaster position="top-right" />
            </div>
        );

    if (error)
        return (
            <div className="flex items-center justify-center min-h-screen text-red-600 text-center">
                <p>{error}</p>
                <Toaster position="top-right" />
            </div>
        );

    if (!profile) return null;

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
            <Toaster position="top-right" />

            {/* HEADER COVER */}
            <motion.div
                className="relative h-52 sm:h-64 bg-cover bg-center shadow-md"
                style={{ backgroundImage: `url(${profileCover})` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                <div className="absolute inset-0 bg-[#032352]/80 backdrop-blur-sm" />
                <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white">
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-wide drop-shadow-lg">
                        Admin Profile
                    </h1>
                    <p className="mt-2 text-sm sm:text-lg font-medium opacity-90">
                        Manage your CloudSentrics identity
                    </p>
                </div>
            </motion.div>

            {/* PROFILE CARD */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-xl mx-auto -mt-20 sm:-mt-28 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-10 border border-gray-100 flex flex-col items-center"
            >
                {/* AVATAR */}
                <div className="relative mb-5 group">
                    <label htmlFor="avatar-upload" className="cursor-pointer block">
                        <img
                            src={avatar}
                            alt="Avatar"
                            className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-[#032352]/30 object-cover shadow-lg transition-transform group-hover:scale-105 duration-300"
                        />
                        <div className="absolute bottom-3 right-3 bg-[#032352] p-2 rounded-full shadow-md group-hover:scale-110 transition">
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

                {/* INFO */}
                <h2 className="text-2xl sm:text-3xl font-bold text-[#032352]">
                    {profile.email}
                </h2>
                <p className="text-gray-600 mt-1 text-base sm:text-lg">
                    Role: {profile.role}
                </p>

                {/* DIVIDER */}
                <div className="mt-6 h-[1px] bg-gray-200 w-3/4"></div>

                {/* TIMESTAMP */}
                <p className="mt-3 text-sm text-gray-500">
                    Member since 2025 • Last login: Today
                </p>
            </motion.div>

            {/* FOOTER */}
            <motion.footer
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="bg-gradient-to-r from-[#021a3d] via-[#032352] to-[#021a3d] text-white text-center py-8 shadow-inner mt-auto"
            >
                <h3 className="text-lg sm:text-2xl font-bold tracking-wide uppercase drop-shadow-lg">
                    © {new Date().getFullYear()} CloudSentrics
                </h3>
                <p className="text-sm sm:text-base mt-2 text-gray-200 opacity-90 font-medium">
                    Empowering businesses through seamless cloud operations and smart workflows.
                </p>
            </motion.footer>
        </div>
    );
};

export default AdminProfilePage;
