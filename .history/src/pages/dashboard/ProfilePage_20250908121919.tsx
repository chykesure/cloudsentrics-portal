import { useState } from "react";
import { Camera } from "lucide-react";
import { motion } from "framer-motion";
import profileCover from "../../../src/assets/profile.jpg"; 
import defaultAvatar from "../../../src/assets/pic.png"; 

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

  const [avatar, setAvatar] = useState(defaultAvatar);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result as string);
      reader.readAsDataURL(event.target.files[0]);
    }
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
          className="absolute inset-0 flex flex-col items-start justify-center text-white px-10"
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

      {/* Profile Card aligned left */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="bg-gray-50 shadow-xl rounded-2xl p-10 ml-10 mt-12 border-l-8 border-[#032352] w-[90%] md:w-[70%]"
      >
        {/* Top Action */}
        <div className="flex justify-end mb-8">
          <button className="px-6 py-2.5 bg-[#032352] text-white rounded-lg shadow hover:bg-[#021a3d] transition font-medium">
            Edit Profile
          </button>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-700">
          <div>
            <p className="font-semibold text-sm text-[#032352]/70">NAME</p>
            <p className="text-lg font-medium text-[#032352]">{form.name}</p>
          </div>
          <div>
            <p className="font-semibold text-sm text-[#032352]/70">CONTACT EMAIL</p>
            <p className="text-lg font-medium text-[#032352]">{form.email}</p>
          </div>
          <div>
            <p className="font-semibold text-sm text-[#032352]/70">ORGANIZATION&apos;S NAME</p>
            <p className="text-lg font-medium text-[#032352]">{form.orgName}</p>
          </div>
          <div>
            <p className="font-semibold text-sm text-[#032352]/70">CONTACT PHONE</p>
            <p className="text-lg font-medium text-[#032352]">{form.phone}</p>
          </div>
          <div>
            <p className="font-semibold text-sm text-[#032352]/70">CONTACT PERSON</p>
            <p className="text-lg font-medium text-[#032352]">{form.contactPerson}</p>
          </div>
          <div>
            <p className="font-semibold text-sm text-[#032352]/70">BUSINESS INDUSTRY</p>
            <p className="text-lg font-medium text-[#032352]">{form.industry}</p>
          </div>
          <div>
            <p className="font-semibold text-sm text-[#032352]/70">CUSTOMER ID</p>
            <p className="text-lg font-medium text-[#032352]">{form.customerId}</p>
          </div>
          <div>
            <p className="font-semibold text-sm text-[#032352]/70">PASSWORD</p>
            <p className="text-lg font-medium text-[#032352]">{form.password}</p>
          </div>
        </div>

        {/* Bottom Action */}
        <div className="mt-10 flex justify-end">
          <button className="px-6 py-2.5 bg-[#032352]/10 text-[#032352] rounded-lg shadow hover:bg-[#032352]/20 transition font-medium">
            Change password
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
