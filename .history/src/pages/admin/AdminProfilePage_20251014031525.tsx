import { useEffect, useState} from "react";
import type { ChangeEvent } from "react";
import axios from "axios";


interface AdminProfile {
  id: string;
  email: string;
  role: string;
  avatar?: string;
}

const AdminProfilePage = () => {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get("http://localhost:5000/api/admin/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data.data);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const token = localStorage.getItem("adminToken");
      const formData = new FormData();
      formData.append("email", profile.email);
      formData.append("role", profile.role);
      if (avatarFile) formData.append("avatar", avatarFile);

      const res = await axios.put("http://localhost:5000/api/admin/profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        setSuccessMsg("Profile updated successfully!");
        fetchProfile();
      } else {
        setErrorMsg("Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Error updating profile.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) return <p>Loading profile...</p>;

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Admin Profile</h2>

      {profile && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <img
              src={avatarFile ? URL.createObjectURL(avatarFile) : profile.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
              alt="Avatar"
              className="h-20 w-20 rounded-full object-cover border-2 border-gray-200"
            />
            <input type="file" onChange={handleAvatarChange} className="border p-1 rounded" />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-[#032352] focus:border-[#032352]"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <input
              type="text"
              value={profile.role}
              readOnly
              className="w-full border rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Changes
            </button>
            {successMsg && <p className="text-green-600">{successMsg}</p>}
            {errorMsg && <p className="text-red-600">{errorMsg}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfilePage;
