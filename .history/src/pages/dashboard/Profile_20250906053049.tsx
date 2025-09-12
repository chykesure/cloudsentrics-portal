import { useState } from "react";
import { User, Mail, Phone, MapPin, Settings } from "lucide-react";

const Profile = () => {
  const [editing, setEditing] = useState(false);

  // Example user data (later you’ll fetch from backend)
  const [profile, setProfile] = useState({
    name: "Oluwadamilare Odo",
    email: "oluwaodo@example.com",
    phone: "+234 801 234 5678",
    address: "Lagos, Nigeria",
  });

  const [form, setForm] = useState(profile);

  const handleSave = () => {
    setProfile(form);
    setEditing(false);
    console.log("Updated profile:", form);
    // 🔗 Later: Send update to backend API
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <User className="h-6 w-6 text-[#032352]" />
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center mb-8">
        <img
          src="https://via.placeholder.com/100"
          alt="User Avatar"
          className="h-24 w-24 rounded-full border shadow"
        />
        <button className="mt-2 text-sm text-[#032352] hover:underline">
          Change Photo
        </button>
      </div>

      {/* Profile Form */}
      <div className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            disabled={!editing}
            className={`w-full border rounded-lg px-4 py-2 focus:ring-[#032352] focus:border-[#032352] ${
              !editing ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            disabled={!editing}
            className={`w-full border rounded-lg px-4 py-2 focus:ring-[#032352] focus:border-[#032352] ${
              !editing ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            disabled={!editing}
            className={`w-full border rounded-lg px-4 py-2 focus:ring-[#032352] focus:border-[#032352] ${
              !editing ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <textarea
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            disabled={!editing}
            rows={3}
            className={`w-full border rounded-lg px-4 py-2 focus:ring-[#032352] focus:border-[#032352] ${
              !editing ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end mt-8 gap-3">
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 bg-[#032352] text-white px-5 py-2 rounded-lg hover:bg-[#021a3a] transition"
          >
            <Settings className="h-4 w-4" /> Edit Profile
          </button>
        ) : (
          <>
            <button
              onClick={() => setEditing(false)}
              className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Save Changes
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
