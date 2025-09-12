import { useState } from "react";
import { User, Mail, Phone, MapPin, Settings, LogOut } from "lucide-react";
import { motion } from "framer-motion";

const ProfilePage = () => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "Oluwadamilare Odo",
    email: "oluwadamilare@example.com",
    phone: "+234 800 000 0000",
    address: "Lagos, Nigeria",
  });

  const handleSave = () => {
    console.log("Saved profile:", form);
    setEditing(false);
  };

  return (
    <div className="p-6">
      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl font-bold mb-6"
      >
        Profile
      </motion.h2>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white rounded-2xl shadow-md p-6 max-w-2xl"
      >
        {/* Avatar + Actions */}
        <div className="flex items-center space-x-6 mb-6">
          <img
            src="https://via.placeholder.com/100"
            alt="User"
            className="h-24 w-24 rounded-full border"
          />
          <div>
            <h3 className="text-xl font-semibold">{form.name}</h3>
            <p className="text-gray-500">{form.email}</p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                disabled={!editing}
                className={`pl-10 w-full border rounded-lg px-4 py-2 focus:ring-[#032352] focus:border-[#032352] ${
                  !editing ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={!editing}
                className={`pl-10 w-full border rounded-lg px-4 py-2 focus:ring-[#032352] focus:border-[#032352] ${
                  !editing ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                disabled={!editing}
                className={`pl-10 w-full border rounded-lg px-4 py-2 focus:ring-[#032352] focus:border-[#032352] ${
                  !editing ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                disabled={!editing}
                className={`pl-10 w-full border rounded-lg px-4 py-2 focus:ring-[#032352] focus:border-[#032352] ${
                  !editing ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center space-x-4">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-[#032352] text-white rounded-lg hover:bg-[#021a3d] transition"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-[#032352] text-white rounded-lg hover:bg-[#021a3d] transition flex items-center gap-2"
              >
                <Settings className="h-4 w-4" /> Edit Profile
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2">
                <LogOut className="h-4 w-4" /> Log Out
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
