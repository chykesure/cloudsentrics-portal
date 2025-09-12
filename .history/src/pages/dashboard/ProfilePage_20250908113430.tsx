import { useState } from "react";
import { Camera } from "lucide-react";
import { motion } from "framer-motion";
import profileCover from "../../../src/assets/profile.jpg"; // cover background
import defaultAvatar from "../../../src/assets/pic.png"; // <-- your default profile pic

const ProfilePage = () => {
  const [form, setForm] = useState({
    name: "Josh Kaleb Oluwafemi",
    email: "cloudsentrics@gmail.com",
    orgName: "Cloud Sentrics",
    contactPerson: "Oluwagbenga Benson",
    customerId: "SENTRICS235",
    phone: "+2349045743221",
    industry: "Technology",
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
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Cover Image */}
      <div
        className="relative h-56 bg-cover bg-center"
        style={{ backgroundImage: `url(${profileCover})` }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 flex flex-col items-center justify-center text-white text-center"
        >
          <h2 className="text-3xl font-bold">Cloud Sentrics</h2>
          <p className="text-sm opacity-90 mt-1">Profile Settings</p>
        </motion.div>
      </div>

      {/* Avatar */}
      <div className="relative flex items-center justify-center -mt-16">
        <motion.div whileHover={{ scale: 1.05 }} className="relative">
          <img
            src={avatar}
            alt="Profile"
            className="h-28 w-28 rounded-full border-[4px] border-yellow-400 shadow-lg object-cover"
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
            className="absolute bottom-1 right-1 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition cursor-pointer"
          >
            <Camera className="h-4 w-4" />
          </label>
        </motion.div>
      </div>

      {/* Profile Update Form */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="bg-white shadow-xl rounded-xl p-8 max-w-3xl mx-auto mt-10 border border-gray-100"
      >
        <h3 className="text-lg font-semibold mb-6 text-gray-800">Update your profile</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-600">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Contact Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Organization&apos;s Name</label>
            <input
              type="text"
              name="orgName"
              value={form.orgName}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Contact Phone</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Contact Person</label>
            <input
              type="text"
              name="contactPerson"
              value={form.contactPerson}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Business Industry</label>
            <input
              type="text"
              name="industry"
              value={form.industry}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button className="px-6 py-2 bg-[#032352] text-white rounded-lg shadow hover:bg-[#021a3d] transition font-medium">
            Update Profile
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
