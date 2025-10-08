import { useState, useEffect, ChangeEvent } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import profileCover from "../../../src/assets/pic.png";
import ProfileSuccess from "./ProfileSuccess";
import { Crown, Briefcase, Feather, Camera } from "lucide-react";

interface ProfileData {
  name: string;
  companyEmail: string;
  phone: string;
  tier: string;
  storage: string;
  avatar?: string;
}

const ProfilePage = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [form, setForm] = useState<ProfileData>({
    name: "",
    companyEmail: "",
    phone: "",
    tier: "",
    storage: "",
    avatar: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [success, setSuccess] = useState(false);

  const email = localStorage.getItem("userEmail") || ""; // ✅ stored email

  // ✅ Fetch profile
  useEffect(() => {
    if (!email) return;

    axios
      .get(`http://localhost:5000/api/profile/${email}`)
      .then((res) => {
        setProfile(res.data);
        setForm(res.data);
      })
      .catch((err) => console.error("Error fetching profile:", err));
  }, [email]);

  // ✅ Handle text input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle image selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // ✅ Submit profile updates
  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("phone", form.phone);
      if (selectedFile) formData.append("avatar", selectedFile);

      const res = await axios.post(
        `http://localhost:5000/api/profile/update/${form.companyEmail}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setProfile(res.data.profile);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  if (!profile) return <p className="p-8 text-gray-500">Loading profile...</p>;

  return (
    <motion.div
      className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Cover */}
        <div className="relative">
          <img src={profileCover} alt="cover" className="w-full h-40 object-cover" />
          <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-white/80 to-transparent" />
        </div>

        {/* Avatar */}
        <div className="relative -mt-16 flex justify-center">
          <div className="relative">
            <img
              src={
                selectedFile
                  ? URL.createObjectURL(selectedFile)
                  : profile.avatar
                  ? `http://localhost:5000${profile.avatar}`
                  : "https://via.placeholder.com/120"
              }
              alt="avatar"
              className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover"
            />
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-2 right-2 bg-white rounded-full p-2 cursor-pointer shadow"
            >
              <Camera className="w-5 h-5 text-gray-600" />
              <input
                id="avatar-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>

        {/* Info Section */}
        <div className="px-8 pb-10 mt-6">
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-gray-500 text-sm">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              />
            </div>

            <div>
              <label className="text-gray-500 text-sm">Email</label>
              <input
                type="text"
                name="companyEmail"
                value={form.companyEmail}
                readOnly
                className="w-full border rounded-lg px-3 py-2 mt-1 bg-gray-100"
              />
            </div>

            <div>
              <label className="text-gray-500 text-sm">Phone</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              />
            </div>

            {/* Tier & Storage */}
            <div className="flex flex-wrap justify-between mt-4">
              <div className="flex items-center gap-2 text-gray-700">
                <Crown className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold">{profile.tier || "No Tier"}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Briefcase className="w-5 h-5 text-blue-500" />
                <span>{profile.storage || "No Storage"}</span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow transition"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {success && <ProfileSuccess />}
    </motion.div>
  );
};

export default ProfilePage;
