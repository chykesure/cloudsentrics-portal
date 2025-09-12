import { useState } from "react";
import { Camera } from "lucide-react";
import { motion } from "framer-motion";
import profileCover from "../../../src/assets/profile.jpg"; // cover background
import defaultAvatar from "../../../src/assets/pic.png";     // default profile pic

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

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Cover Image */}
      <div
        className="relative h-64 bg-cover bg-center"
        style={{ backgroundImage: `url(${profileCover})` }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 flex flex-col items-center justify-center text-white text-center"
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
            className="h-36 w-36 rounded-full border-[6px] border-yellow-400 shadow-lg object-cover"
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
            className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition cursor-pointer animate-pulse"
          >
            <Camera className="h-5 w-5" />
          </label>
        </motion.div>

        {/* Stats */}
        <div className="flex gap-12 ml-10 text-center">
          <div>
            <p className="text-sm text-gray-500 tracking-wide">TIER LEVEL</p>
            <p className="text-lg font-semibold text-gray-800">{form.tier}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 tracking-wide">STORAGE</p>
            <p className="text-lg font-semibold text-gray-800">{form.storage}</p>
          </div>
        </div>
      </div>

      {/* Profile Display Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="bg-white shadow-xl rounded-2xl p-10 max-w-4xl mx-auto mt-12 border border-gray-100"
      >
        <div className="flex justify-end mb-8">
          <button className="px-6 py-2.5 bg-[#032352] text-white rounded-lg shadow hover:bg-[#021a3d] transition font-medium">
            Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-700">
          <div>
            <p className="font-semibold text-sm text-gray-500">NAME</p>
            <p className="text-lg">{form.name}</p>
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-500">CONTACT EMAIL</p>
            <p className="text-lg">{form.email}</p>
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-500">ORGANIZATION&apos;S NAME</p>
            <p className="text-lg">{form.orgName}</p>
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-500">CONTACT PHONE</p>
            <p className="text-lg">{form.phone}</p>
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-500">CONTACT PERSON</p>
            <p className="text-lg">{form.contactPerson}</p>
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-500">BUSINESS INDUSTRY</p>
            <p className="text-lg">{form.industry}</p>
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-500">CUSTOMER ID</p>
            <p className="text-lg">{form.customerId}</p>
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-500">PASSWORD</p>
            <p className="text-lg">{form.password}</p>
          </div>
        </div>

        <div className="mt-10 flex justify-end">
          <button className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300 transition font-medium">
            Change password
          </button>
        </div>
      </motion.div>

      {/* Editable Form Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="bg-white shadow-xl rounded-2xl p-10 max-w-4xl mx-auto mt-12 border border-gray-100"
      >
        <h3 className="text-2xl font-semibold mb-6 text-gray-800">Update your profile</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600">Name</label>
            <input
              type="text"
              defaultValue={form.name}
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Contact Email</label>
            <input
              type="email"
              defaultValue={form.email}
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Organization's Name</label>
            <input
              type="text"
              defaultValue={form.orgName}
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Contact Phone Number</label>
            <input
              type="text"
              defaultValue={form.phone}
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Contact Person Name</label>
            <input
              type="text"
              defaultValue={form.contactPerson}
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Business Industry</label>
            <input
              type="text"
              defaultValue={form.industry}
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button className="px-6 py-2.5 bg-[#032352] text-white rounded-lg shadow hover:bg-[#021a3d] transition font-medium">
            Update Profile
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
