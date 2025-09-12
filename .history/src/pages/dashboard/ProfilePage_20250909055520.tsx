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
  const [isEditing, setIsEditing] = useState(false); // 🔑 New state to control edit mode
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [step, setStep] = useState(1); // Step 1 = Frame 36
  const [loading, setLoading] = useState(false);


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

  const handleStepTransition = (nextStep: number) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(nextStep);
    }, 1500); // 1.5 seconds "loading" time
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
            <button
              onClick={() => setIsEditing(true)} // 🔑 Enable editing
              className="px-6 py-2.5 bg-[#032352] text-white rounded-lg shadow hover:bg-[#021a3d] transition font-medium"
            >
              Edit Profile
            </button>
          </div>

          {/* Restructured into 2-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            {Object.entries(form).map(([key, value]) => (
              <div key={key} className="flex flex-col">
                <p className="font-semibold text-sm text-[#032352]/70">
                  {key.toUpperCase()}
                </p>
                <p className="text-lg font-medium text-[#032352]">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <button
  onClick={() => {
    setLoading(true);
    setTimeout(() => {
      setShowPasswordModal(false);
      setStep(1);
      setLoading(false);
      // Optionally show a toast/alert here
    }, 1500);
  }}
  className="w-full bg-[#032352] text-white py-2 rounded-lg hover:bg-[#021a3d]"
>
  Change Password
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
          <h3 className="text-2xl font-semibold mb-6 text-[#032352]">
            Update your profile
          </h3>

          {/* Restructured into 2-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.keys(form).map((key) => (
              <div key={key} className="flex flex-col">
                <label className="block text-sm font-medium text-[#032352]/70 mb-1">
                  {key.toUpperCase()}
                </label>
                <input
                  type="text"
                  name={key}
                  value={(form as any)[key]}
                  onChange={handleChange}
                  disabled={!isEditing} // 🔑 Inputs disabled until Edit is clicked
                  className={`form-control w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-800 shadow-sm 
                    focus:border-[#032352] focus:ring-2 focus:ring-[#032352] focus:outline-none transition 
                    ${!isEditing ? "bg-gray-100 cursor-not-allowed" : ""}`}
                />
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              disabled={!isEditing} // 🔑 Save only works when editing
              className={`px-6 py-2.5 rounded-lg shadow font-medium transition 
                ${isEditing
                  ? "bg-[#032352] text-white hover:bg-[#021a3d]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
            >
              Update Profile
            </button>
          </div>
        </motion.div>
      </div>
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-[400px] p-6 relative">
            <button
              onClick={() => setShowPasswordModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
            >
              ×
            </button>

            {/* Step-based rendering */}
            {step === 1 && (
              <>
                <h2 className="text-xl font-semibold mb-4">Change your password</h2>
                <p className="text-sm text-gray-600 mb-6">
                  Confirm your email address <strong>{form.email}</strong> by clicking the confirm email button.
                </p>
                <button
                  onClick={() => handleStepTransition(2)}
                  className="w-full bg-[#032352] text-white py-2 rounded-lg hover:bg-[#021a3d]"
                >
                  Confirm Email
                </button>

              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-xl font-semibold mb-4">Change your password</h2>
                <p className="text-sm text-gray-600 mb-3">
                  Enter the 6 digits sent to your email <strong>{form.email}</strong>
                </p>
                <input
                  type="text"
                  placeholder="Enter Code"
                  className="w-full border rounded-lg px-4 py-2 mb-4"
                />
                <button
                  onClick={() => handleStepTransition(3)}
                  className="w-full bg-[#032352] text-white py-2 rounded-lg hover:bg-[#021a3d]"
                >
                  Continue
                </button>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="text-xl font-semibold mb-4">Email Successfully Confirmed</h2>
                <div className="flex justify-center mb-6">
                  <div className="text-green-500 text-4xl">👍</div>
                </div>
                <button
                  onClick={() => handleStepTransition(4)}
                  className="w-full bg-[#032352] text-white py-2 rounded-lg hover:bg-[#021a3d]"
                >
                  Change password
                </button>
              </>
            )}

            {step === 4 && (
              <>
                <h2 className="text-xl font-semibold mb-4">Change your password</h2>
                <input
                  type="password"
                  placeholder="Enter New Password"
                  className="w-full border rounded-lg px-4 py-2 mb-3"
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  className="w-full border rounded-lg px-4 py-2 mb-4"
                />
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setStep(1);
                    // Add success notification here if needed
                  }}
                  className="w-full bg-[#032352] text-white py-2 rounded-lg hover:bg-[#021a3d]"
                >
                  Change Password
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
