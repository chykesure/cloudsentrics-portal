import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Camera, Crown, Briefcase, Feather } from "lucide-react";
import { CButton, CFormInput, CCard, CCardBody, CRow, CCol } from "@coreui/react";

interface ProfileData {
  name: string;
  companyEmail: string;
  phone: string;
  tier?: string;
  storage?: string;
  avatar?: string;
}

const ProfilePage: React.FC = () => {
  const [form, setForm] = useState<ProfileData>({
    name: "",
    companyEmail: "",
    phone: "",
    tier: "",
    storage: "300GB",
    avatar: "",
  });

  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChanged, setIsChanged] = useState(false);

  // Simulated fetch from backend
  const fetchProfile = async () => {
    try {
      const response = await fetch("https://api.onboardingportal.cloudsentrics.org/api/auth/profile", {
        method: "GET",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const profile = await response.json();

      setForm({
        name: profile.name || "",
        companyEmail: profile.companyEmail || "",
        phone: profile.phone || "",
        tier: profile.tier || "", // 👈 No default value
        storage: profile.storage || "300GB",
        avatar: profile.avatar || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setIsChanged(true);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
      setIsChanged(true);
    }
  };

  const handleUpdate = async () => {
    if (!isChanged) return;
    setIsUpdating(true);

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("companyEmail", form.companyEmail);
    formData.append("phone", form.phone);
    formData.append("storage", form.storage);
    if (selectedAvatar) formData.append("avatar", selectedAvatar);

    try {
      const response = await fetch("https://api.onboardingportal.cloudsentrics.org/api/auth/update-profile", {
        method: "PUT",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      });

      if (response.ok) {
        setIsChanged(false);
        await fetchProfile();
        alert("Profile updated successfully ✅");
      } else {
        alert("Failed to update profile ❌");
      }
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const renderTierBadge = (tier: string | undefined) => {
    if (!tier) return null; // 👈 Hide completely if no tier

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

    const tierStyle =
      styleMap[tier?.toUpperCase()] || styleMap["STANDARD TIER"];

    return (
      <div
        className={`inline-flex items-center px-4 py-2 rounded-full border font-semibold text-sm shadow-sm ${tierStyle.color}`}
      >
        {tierStyle.icon}
        {tier}
      </div>
    );
  };

  return (
    <motion.div
      className="container mx-auto py-6 px-4 max-w-3xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <CCard className="shadow-lg border-0 rounded-3xl">
        <CCardBody>
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-32 h-32">
              <img
                src={
                  avatarPreview ||
                  (form.avatar
                    ? `https://api.onboardingportal.cloudsentrics.org/uploads/${form.avatar}`
                    : "/default-avatar.png")
                }
                alt="Avatar"
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-300 shadow-md"
              />
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-2 right-2 bg-blue-500 p-2 rounded-full cursor-pointer hover:bg-blue-600 transition"
              >
                <Camera className="w-4 h-4 text-white" />
              </label>
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            {form.tier && (
              <div className="mt-4">{renderTierBadge(form.tier)}</div>
            )}
          </div>

          <CRow className="gy-3">
            <CCol md={6}>
              <CFormInput
                label="Full Name"
                name="name"
                value={form.name}
                onChange={handleChange}
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                label="Company Email"
                name="companyEmail"
                value={form.companyEmail}
                onChange={handleChange}
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                label="Phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                label="Storage"
                name="storage"
                value={form.storage}
                onChange={handleChange}
              />
            </CCol>
          </CRow>

          <div className="text-center mt-6">
            <CButton
              color="primary"
              disabled={!isChanged || isUpdating}
              onClick={handleUpdate}
              className="px-5 py-2 rounded-full shadow-md"
            >
              {isUpdating ? "Updating..." : "Update Profile"}
            </CButton>
          </div>
        </CCardBody>
      </CCard>
    </motion.div>
  );
};

export default ProfilePage;
