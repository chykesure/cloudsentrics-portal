import { useState } from "react";
import { Lock, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import logo from "../../assets/logo.png";

const ResetPassword = () => {
  const { token } = useParams<{ token: string }>();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `https://api.onboardingportal.cloudsentrics.org/api/admin/reset-password/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newPassword }), // ✅ match backend key name
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Reset failed");
        return;
      }

      toast.success("Password reset successful!");
      setTimeout(() => navigate("/admin/login"), 1500);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      <motion.div
        className="relative flex min-h-screen items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url('/Image2.jpg')" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Reset Password Card */}
        <div className="relative w-11/12 max-w-sm sm:max-w-md md:max-w-lg rounded-2xl bg-white/95 p-6 sm:p-8 shadow-lg backdrop-blur-sm">
          {/* Logo */}
          <div className="mb-6 flex flex-col items-center">
            <img
              src={logo}
              alt="Cloud Sentric Admin"
              className="mb-2 h-12 sm:h-16 md:h-20 object-contain"
            />
            <h2 className="text-center text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
              Reset Password
            </h2>
            <p className="text-sm text-gray-500 mt-1 text-center">
              Enter your new password below
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div className="flex items-center rounded-lg border border-gray-300 bg-white">
              <div className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-l-lg bg-blue-900">
                <Lock className="h-4 sm:h-5 w-4 sm:w-5 text-white" />
              </div>
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="flex-1 rounded-r-lg px-2 sm:px-3 py-2 text-sm sm:text-base text-gray-700 focus:outline-none"
                required
              />
            </div>

            {/* Confirm Password */}
            <div className="flex items-center rounded-lg border border-gray-300 bg-white">
              <div className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-l-lg bg-blue-900">
                <Lock className="h-4 sm:h-5 w-4 sm:w-5 text-white" />
              </div>
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="flex-1 rounded-r-lg px-2 sm:px-3 py-2 text-sm sm:text-base text-gray-700 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-900 py-2 sm:py-3 text-sm sm:text-base font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => navigate("/admin/login")}
              className="text-sm text-blue-800 hover:underline font-medium"
            >
              Back to Login
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default ResetPassword;
