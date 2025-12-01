// src/pages/ChangePassword.tsx
import { useState } from "react";
import { Lock, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";

const ChangePassword = () => {
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Validation Rules
  const passwordRules = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    symbol: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
  };

  const allValid =
    passwordRules.length &&
    passwordRules.uppercase &&
    passwordRules.number &&
    passwordRules.symbol;

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!allValid) {
      toast.error("Password does not meet the requirements!");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match!");
      return;
    }

    setLoading(true);

    try {
      // Fake API Delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success("Password changed successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Toaster />

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Change Password
        </h2>

        {/* Old Password */}
        <div>
          <label className="font-medium">Old Password</label>
          <div className="flex items-center border rounded-lg px-3 mt-1">
            <Lock className="text-gray-400" size={20} />
            <input
              type="password"
              className="w-full p-3 outline-none"
              placeholder="Enter old password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>
        </div>

        {/* New Password */}
        <div className="mt-4">
          <label className="font-medium">New Password</label>
          <div className="flex items-center border rounded-lg px-3 mt-1">
            <Lock className="text-gray-400" size={20} />
            <input
              type="password"
              className="w-full p-3 outline-none"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          {/* Validation Messages */}
          <div className="mt-2 text-sm">
            <p className={passwordRules.length ? "text-green-600" : "text-red-600"}>
              • At least 8 characters
            </p>
            <p className={passwordRules.uppercase ? "text-green-600" : "text-red-600"}>
              • Must contain an uppercase letter (A–Z)
            </p>
            <p className={passwordRules.number ? "text-green-600" : "text-red-600"}>
              • Must contain a number (0–9)
            </p>
            <p className={passwordRules.symbol ? "text-green-600" : "text-red-600"}>
              • Must contain a symbol (!, @, #, $, etc.)
            </p>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="mt-4">
          <label className="font-medium">Confirm New Password</label>
          <div className="flex items-center border rounded-lg px-3 mt-1">
            <Lock className="text-gray-400" size={20} />
            <input
              type="password"
              className="w-full p-3 outline-none"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full bg-blue-600 text-white p-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition disabled:bg-gray-400"
        >
          {loading && <Loader2 className="animate-spin" size={20} />}
          Change Password
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
