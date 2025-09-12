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
        className="relative h-52 bg-cover bg-center"
        style={{ backgroundImage: `url(${profileCover})` }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 flex flex-col items-start justify-center px-8 text-white"
        >
          <h2 className="text-3xl font-bold">Cloud Sentrics</h2>
          <p className="text-base opacity-90">Profile Settings</p>
        </motion.div>
      </div>

      {/* Avatar + Stats */}
      <div className="relative flex items-end -mt-12 px-8">
        <motion.div whileHover={{ scale: 1.05 }} className="relative">
          <img
            src={avatar}
            alt="Profile"
            className="h-28 w-28 rounded-full border-4 border-yellow-400 shadow-lg object-cover"
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
            className="absolute bottom-1 right-1 bg-blue-600 text-white p-2 rounded-full shadow hover:bg-blue-700 transition cursor-pointer"
          >
            <Camera className="h-4 w-4" />
          </label>
        </motion.div>

        {/* Stats */}
        <div className="flex gap-8 ml-6 text-center">
          <div>
            <p className="text-xs text-gray-500">TIER LEVEL</p>
            <p className="text-sm font-semibold text-gray-800">{form.tier}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">STORAGE</p>
            <p className="text-sm font-semibold text-gray-800">{form.storage}</p>
          </div>
        </div>
      </div>

      {/* Profile Display + Editable Form Side by Side */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="mt-8 px-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Display Section */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Profile Details</h3>
              <button className="px-4 py-1.5 bg-[#032352] text-white rounded-md shadow hover:bg-[#021a3d] text-sm">
                Edit
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
              <div>
                <p className="text-xs font-medium text-gray-500">NAME</p>
                <p>{form.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">EMAIL</p>
                <p>{form.email}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">ORGANIZATION</p>
                <p>{form.orgName}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">PHONE</p>
                <p>{form.phone}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">CONTACT PERSON</p>
                <p>{form.contactPerson}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">INDUSTRY</p>
                <p>{form.industry}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">CUSTOMER ID</p>
                <p>{form.customerId}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">PASSWORD</p>
                <p>{form.password}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button className="px-4 py-1.5 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm">
                Change password
              </button>
            </div>
          </div>

          {/* Editable Form Section */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Update Profile</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500">Name</label>
                <input
                  type="text"
                  defaultValue={form.name}
                  className="mt-1 w-full rounded-md border-gray-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Email</label>
                <input
                  type="email"
                  defaultValue={form.email}
                  className="mt-1 w-full rounded-md border-gray-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Organization</label>
                <input
                  type="text"
                  defaultValue={form.orgName}
                  className="mt-1 w-full rounded-md border-gray-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Phone</label>
                <input
                  type="text"
                  defaultValue={form.phone}
                  className="mt-1 w-full rounded-md border-gray-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Contact Person</label>
                <input
                  type="text"
                  defaultValue={form.contactPerson}
                  className="mt-1 w-full rounded-md border-gray-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Industry</label>
                <input
                  type="text"
                  defaultValue={form.industry}
                  className="mt-1 w-full rounded-md border-gray-300 text-sm"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button className="px-5 py-2 bg-[#032352] text-white rounded-md shadow hover:bg-[#021a3d] text-sm">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
