import { useState } from "react";
import { Camera } from "lucide-react";
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
    <div className="min-h-screen w-full bg-gray-50 p-6">
      {/* Cover Image */}
      <div
        className="relative h-40 bg-cover bg-center rounded-xl overflow-hidden"
        style={{ backgroundImage: `url(${profileCover})` }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center px-6">
          <h2 className="text-2xl font-bold text-white">{form.orgName} – Profile</h2>
        </div>
      </div>

      {/* Main Layout */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left: Profile Card */}
        <div className="bg-white shadow rounded-lg p-5 border border-gray-100">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={avatar}
                alt="Profile"
                className="h-24 w-24 rounded-full border-4 border-blue-500 object-cover"
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
                className="absolute bottom-1 right-1 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer"
              >
                <Camera className="h-4 w-4" />
              </label>
            </div>
            <div>
              <p className="text-lg font-semibold">{form.name}</p>
              <p className="text-sm text-gray-500">{form.email}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-8 mt-4">
            <div>
              <p className="text-xs text-gray-500">Tier</p>
              <p className="text-sm font-medium">{form.tier}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Storage</p>
              <p className="text-sm font-medium">{form.storage}</p>
            </div>
          </div>

          {/* Profile Info */}
          <div className="mt-5 space-y-2 text-sm">
            <p><span className="font-medium">Organization:</span> {form.orgName}</p>
            <p><span className="font-medium">Phone:</span> {form.phone}</p>
            <p><span className="font-medium">Contact Person:</span> {form.contactPerson}</p>
            <p><span className="font-medium">Industry:</span> {form.industry}</p>
            <p><span className="font-medium">Customer ID:</span> {form.customerId}</p>
          </div>
        </div>

        {/* Right: Edit Form Card */}
        <div className="bg-white shadow rounded-lg p-5 border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>
          <div className="space-y-4">
            {[
              { label: "Name", name: "name", type: "text" },
              { label: "Contact Email", name: "email", type: "email" },
              { label: "Organization", name: "orgName", type: "text" },
              { label: "Phone", name: "phone", type: "text" },
              { label: "Contact Person", name: "contactPerson", type: "text" },
              { label: "Industry", name: "industry", type: "text" },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-xs text-gray-600 mb-1">{field.label}</label>
                <input
                  type={field.type}
                  name={field.name}
                  value={(form as any)[field.name]}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 text-sm p-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button className="px-5 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
