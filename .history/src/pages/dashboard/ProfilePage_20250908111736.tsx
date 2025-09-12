import { useState } from "react";
import { Camera } from "lucide-react";
import { motion } from "framer-motion";
import profileCover from "../../../src/assets/profile.jpg"; // <-- your background image

const ProfilePage = () => {
  const [form] = useState({
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

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Cover Image */}
      <div
        className="relative h-56 bg-cover bg-center"
        style={{ backgroundImage: `url(${profileCover})` }}
      >
        {/* Overlay text */}
        <div className="absolute bottom-4 left-40 text-white">
          <h2 className="text-3xl font-bold">Cloud Sentrics</h2>
          <p className="text-lg opacity-90">Profile Settings</p>
        </div>
      </div>

      {/* Avatar + Stats */}
      <div className="relative flex items-end -mt-16 px-10">
        {/* Avatar at left */}
        <div className="relative">
          <img
            src="https://via.placeholder.com/150"
            alt="Profile"
            className="h-32 w-32 rounded-full border-[6px] border-yellow-400 shadow-lg"
          />
          <button className="absolute bottom-1 right-1 bg-blue-600 text-white p-1 rounded-full shadow hover:bg-blue-700">
            <Camera className="h-4 w-4" />
          </button>
        </div>

        {/* Stats aligned beside avatar */}
        <div className="flex gap-10 ml-10 text-center">
          <div>
            <p className="text-sm text-gray-500">TIER LEVEL</p>
            <p className="font-semibold">{form.tier}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">STORAGE</p>
            <p className="font-semibold">{form.storage}</p>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-lg rounded-xl p-8 max-w-4xl mx-auto mt-10"
      >
        {/* Top Action */}
        <div className="flex justify-end mb-6">
          <button className="px-5 py-2 bg-[#032352] text-white rounded-lg hover:bg-[#021a3d] transition">
            Edit Profile
          </button>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
          <div>
            <p className="font-semibold">NAME</p>
            <p>{form.name}</p>
          </div>
          <div>
            <p className="font-semibold">CONTACT EMAIL</p>
            <p>{form.email}</p>
          </div>
          <div>
            <p className="font-semibold">ORGANIZATION&apos;S NAME</p>
            <p>{form.orgName}</p>
          </div>
          <div>
            <p className="font-semibold">CONTACT PHONE NUMBER</p>
            <p>{form.phone}</p>
          </div>
          <div>
            <p className="font-semibold">CONTACT PERSON NAME</p>
            <p>{form.contactPerson}</p>
          </div>
          <div>
            <p className="font-semibold">BUSINESS INDUSTRY</p>
            <p>{form.industry}</p>
          </div>
          <div>
            <p className="font-semibold">CUSTOMER ID</p>
            <p>{form.customerId}</p>
          </div>
          <div>
            <p className="font-semibold">PASSWORD</p>
            <p>{form.password}</p>
          </div>
        </div>

        {/* Bottom Action */}
        <div className="mt-6 flex justify-end">
          <button className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
            Change password
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
