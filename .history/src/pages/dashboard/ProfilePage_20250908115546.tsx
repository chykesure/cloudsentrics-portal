import { useState } from "react";
import { Camera } from "lucide-react";
import { motion } from "framer-motion";
import profileCover from "../../../src/assets/profile.jpg"; // cover background
import defaultAvatar from "../../../src/assets/pic.png"; // default profile pic

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

  // Live form update
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 p-6">
      {/* Cover Image */}
      <div
        className="relative h-52 bg-cover bg-center rounded-2xl overflow-hidden"
        style={{ backgroundImage: `url(${profileCover})` }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 flex flex-col items-center justify-center text-white text-center"
        >
          <h2 className="text-3xl font-extrabold tracking-wide">{form.orgName}</h2>
          <p className="text-md opacity-90 mt-1">Profile Settings</p>
        </motion.div>
      </div>

      {/* Main Content: Two Cards Side by Side */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Profile Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white shadow-md rounded-2xl p-6 border border-gray-100"
        >
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <img
                src={avatar}
                alt="Profile"
                className="h-32 w-32 rounded-full border-4 border-yellow-400 shadow-lg object-cover"
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
                className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition cursor-pointer"
              >
                <Camera className="h-5 w-5" />
              </label>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-4 text-center">
              <div>
                <p className="text-xs text-gray-500">TIER LEVEL</p>
                <p className="text-base font-semibold text-gray-800">{form.tier}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">STORAGE</p>
                <p className="text-base font-semibold text-gray-800">{form.storage}</p>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="mt-6 grid grid-cols-1 gap-4 text-gray-700">
            <div>
              <p className="text-xs text-gray-500">NAME</p>
              <p className="text-base">{form.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">CONTACT EMAIL</p>
              <p className="text-base">{form.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">ORGANIZATION</p>
              <p className="text-base">{form.orgName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">PHONE</p>
              <p className="text-base">{form.phone}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">CONTACT PERSON</p>
              <p className="text-base">{form.contactPerson}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">INDUSTRY</p>
              <p className="text-base">{form.industry}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">CUSTOMER ID</p>
              <p className="text-base">{form.customerId}</p>
            </div>
          </div>
        </motion.div>

        {/* Right: Edit Form Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white shadow-md rounded-2xl p-6 border border-gray-100"
        >
          <h3 className="text-xl font-semibold mb-6 text-gray-800">Update Profile</h3>

          <div className="grid grid-cols-1 gap-5">
            {[
              { label: "Name", name: "name", type: "text" },
              { label: "Contact Email", name: "email", type: "email" },
              { label: "Organization", name: "orgName", type: "text" },
              { label: "Phone", name: "phone", type: "text" },
              { label: "Contact Person", name: "contactPerson", type: "text" },
              { label: "Industry", name: "industry", type: "text" },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-xs font-medium text-gray-600">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={(form as any)[field.name]}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm p-2"
                />
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <button className="px-6 py-2.5 bg-[#032352] text-white rounded-lg shadow hover:bg-[#021a3d] transition font-medium">
              Save Changes
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
