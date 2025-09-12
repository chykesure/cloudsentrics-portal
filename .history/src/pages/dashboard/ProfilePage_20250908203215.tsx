import { useState } from "react";
import { Camera } from "lucide-react";
import { motion } from "framer-motion";
import profileCover from "../../../src/assets/profile.jpg";
import defaultAvatar from "../../../src/assets/pic.png";

const ProfilePage = () => {
  const [form, setForm] = useState({
    name: "Josh Kaleb Oluwafemi",
    email: "cloudsentrics@gmail.com",
    orgName: "Cloud Sentrics",
    contactPerson: "Oluwagbenga Benson",
    customerId: "SENTRICS235",
    phone: "+2349045743221",
    industry: "Technology",
    password: "************",
    tier: "Business",
    storage: "400GB",
  });

  const [avatar, setAvatar] = useState(defaultAvatar);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result as string);
      reader.readAsDataURL(event.target.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen w-full bg-gray-100">
      {/* Cover Image */}
      <div
        className="relative h-64 bg-cover bg-center"
        style={{ backgroundImage: `url(${profileCover})` }}
      >
        <div className="absolute inset-0 bg-[#032352]/80" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4"
        >
          <h2 className="text-4xl font-extrabold tracking-wide">Cloud Sentrics</h2>
          <p className="text-lg opacity-90 mt-1">Profile Settings</p>
        </motion.div>
      </div>

      {/* Avatar + Stats */}
      <div className="relative flex items-end -mt-16 px-10">
        <motion.div whileHover={{ scale: 1.05 }} className="relative">
          <img
            src={avatar}
            alt="Profile"
            className="h-36 w-36 rounded-full border-[6px] border-[#032352] shadow-lg object-cover"
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
            <Camera className="h-5 w-5" />
          </label>
        </motion.div>

        {/* Stats */}
        <div className="flex gap-12 ml-10 text-center">
          <div>
            <p className="text-sm font-semibold text-[#032352]/70 tracking-wide">TIER LEVEL</p>
            <p className="text-lg font-bold text-[#032352]">{form.tier}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#032352]/70 tracking-wide">STORAGE</p>
            <p className="text-lg font-bold text-[#032352]">{form.storage}</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="flex flex-col md:flex-row gap-8 px-10 mt-12">
        {/* Profile Card (Left) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="bg-gray-50 shadow-xl rounded-2xl p-8 border-l-8 border-[#032352] w-full md:w-1/2"
        >
          <div className="flex justify-end mb-6">
            <button className="px-6 py-2.5 bg-[#032352] text-white rounded-lg shadow hover:bg-[#021a3d] transition font-medium">
              Edit Profile
            </button>
          </div>

          {/* Restructured into 2-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            {Object.entries(form).map(([key, value]) => (
              <div key={key} className="flex flex-col">
                <p className="font-semibold text-sm text-[#032352]/70">{key.toUpperCase()}</p>
                <p className="text-lg font-medium text-[#032352]">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <button className="px-6 py-2.5 bg-[#032352]/10 text-[#032352] rounded-lg shadow hover:bg-[#032352]/20 transition font-medium">
              Change password
            </button>
          </div>
        </motion.div>

        {/* Editable Form (Right) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="bg-gray-50 shadow-xl rounded-2xl p-8 border-r-8 border-[#032352] w-full md:w-1/2"
        >
          <h3 className="text-2xl font-semibold mb-6 text-[#032352]">Update your profile</h3>

          {/* Restructured into 2-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.keys(form).map((key) => (
              <div key={key} className="flex flex-col">
                <label className="block text-sm font-medium text-[#032352]/70">
                  {key.toUpperCase()}
                </label>
                <input
                  type="text"
                  name={key}
                  value={(form as any)[key]}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-[#032352] focus:ring-[#032352]"
                />
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <button className="px-6 py-2.5 bg-[#032352] text-white rounded-lg shadow hover:bg-[#021a3d] transition font-medium">
              Update Profile
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
