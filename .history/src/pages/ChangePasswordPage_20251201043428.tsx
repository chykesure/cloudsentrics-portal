// src/pages/ChangePassword.tsx
import { useState, useEffect } from "react";
import { Lock, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [passwordValid, setPasswordValid] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);

  const navigate = useNavigate();

  // 🔐 Password validation (same as Reset Password page)
  useEffect(() => {
    const hasMinLength = newPassword.length >= 8;
    const hasSymbol = /[@!#\$%\^\&\*\(\)\-_=\+\{\}\[\]:;"'<>,\.\?\/]/.test(newPassword);
    const hasUppercase = /[A-Z]/.test(newPassword);

    setPasswordValid(hasMinLength && hasSymbol && hasUppercase);

    setPasswordMatch(
      newPassword === confirmPassword || confirmPassword === ""
    );
  }, [newPassword, confirmPassword]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordValid) {
      toast.error("Password must be 8+ chars, include 1 uppercase and 1 symbol.");
      return;
    }

    if (!passwordMatch) {
      toast.error("New password and confirmation do not match");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      // 1️⃣ Change password API
      const res = await fetch("https://api.onboardingportal.cloudsentrics.org/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user.id, oldPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to change password");
        return;
      }

      toast.success("Password changed successfully!");

      // 2️⃣ Auto-login using new password
      const loginRes = await fetch("https://api.onboardingportal.cloudsentrics.org/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, password: newPassword }),
      });

      const loginData = await loginRes.json();
      if (!loginRes.ok) {
        toast.error(loginData.message || "Login failed after password change");
        return;
      }

      localStorage.setItem("token", loginData.token);
      localStorage.setItem("user", JSON.stringify({ ...loginData.user, mustChangePassword: false }));

      setTimeout(() => navigate("/dashboard"), 800);

    } catch (err) {
      console.error("Change password error:", err);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center p-4"
      style={{ backgroundImage: "url('/Image2.jpg')" }}
    >
      <Toaster position="top-right" />

      <div className="w-full max-w-md bg-white/90 rounded-2xl shadow-lg p-6 backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Change Password
        </h2>

        <form onSubmit={handleChangePassword} className="space-y-4">

          {/* Old Password */}
          <div>
            <div className="flex items-center rounded-lg border border-gray-300 bg-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-l-lg bg-blue-900">
                <Lock className="h-4 w-4 text-white" />
              </div>
              <input
                type="password"
                placeholder="Old Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="flex-1 rounded-r-lg px-2 py-2 text-gray-700 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* New Password */}
          <div>
            <div
              className={`flex items-center rounded-lg border ${passwordValid ? "border-green-500" : "border-red-500"
                } bg-white`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-l-lg bg-blue-900">
                <Lock className="h-4 w-4 text-white" />
              </div>
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="flex-1 rounded-r-lg px-2 py-2 text-gray-700 focus:outline-none"
                required
              />
            </div>

            {/* Password Rules */}
            {newPassword.length > 0 && (
              <div className="mt-1 text-sm space-y-1">
                {!/[A-Z]/.test(newPassword) && (
                  <p className="text-red-500">Must include at least one uppercase letter (A–Z).</p>
                )}

                {!/[@!#\$%\^\&\*\(\)\-_=\+\{\}\[\]:;"'<>,\.\?\/]/.test(newPassword) && (
                  <p className="text-red-500">Must include at least one symbol (@, !, #, $, etc).</p>
                )}

                {newPassword.length < 8 && (
                  <p className="text-red-500">Must be at least 8 characters long.</p>
                )}

                {passwordValid && (
                  <p className="text-green-600">Password looks strong!</p>
                )}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <div
              className={`flex items-center rounded-lg border ${passwordMatch ? "border-green-500" : "border-red-500"
                } bg-white`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-l-lg bg-blue-900">
                <Lock className="h-4 w-4 text-white" />
              </div>
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="flex-1 rounded-r-lg px-2 py-2 text-gray-700 focus:outline-none"
                required
              />
            </div>

            {!passwordMatch && (
              <p className="text-red-500 text-sm mt-1">
                Passwords do not match.
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !passwordValid || !passwordMatch}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-900 py-2 text-white font-semibold hover:bg-blue-800 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Changing...
              </>
            ) : (
              "Change Password"
            )}
          </button>

        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
