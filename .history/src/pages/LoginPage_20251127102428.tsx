// src/pages/LoginPage.tsx
import { useState } from "react";
import { Mail, Lock, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [showCustomerIdModal, setShowCustomerIdModal] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recovering, setRecovering] = useState(false);

  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [sendingForgot, setSendingForgot] = useState(false);

  const navigate = useNavigate();

  // 🔹 Handle Login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5002/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Login failed");
        return;
      }

      // Save token and user once
      const userData = data.user;
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(userData));

      // First-time login
      if (data.mustChangePassword) {
        toast.success("Login successful! Please change your temporary password.");
        setTimeout(() => navigate("/change-password"), 800);
        return;
      }

      // Normal login
      toast.success("Login successful!");
      console.log("Saved token:", data.token);
      console.log("Saved user:", JSON.stringify(userData));

      setTimeout(() => navigate("/dashboard"), 800);

    } catch (err) {
      console.error("Login error:", err);
      toast.error("Something went wrong, try again later");
    } finally {
      setLoading(false);
    }
  };


  // 🔹 Handle Customer ID Recovery
  const handleRecoverCustomerId = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecovering(true);

    try {
      const res = await fetch(
        //"https://api.onboardingportal.cloudsentrics.org/api/auth/recover-customer-id",
        "http://localhost:5002/api/auth/recover-customer-id",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: recoveryEmail }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Email not found or invalid");
        return;
      }

      toast.success("Customer ID has been sent to your company email!");
      setShowCustomerIdModal(false);
      setRecoveryEmail("");
    } catch (err) {
      console.error("Recovery error:", err);
      toast.error("Unable to send recovery email at the moment");
    } finally {
      setRecovering(false);
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingForgot(true);

    try {
      const res = await fetch(
        "http://localhost:5002/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: forgotEmail.trim().toLowerCase() }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Email not found or invalid");
        return;
      }

      toast.success(
        "Password reset link has been sent to your email! Check your inbox."
      );
      setShowForgotPasswordModal(false);
      setForgotEmail("");
    } catch (err) {
      console.error("Forgot password error:", err);
      toast.error("Unable to send reset link at the moment");
    } finally {
      setSendingForgot(false);
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
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="relative w-11/12 max-w-sm sm:max-w-md md:max-w-lg rounded-2xl bg-white/90 p-4 sm:p-6 md:p-8 shadow-lg backdrop-blur-sm">
          {/* Logo */}
          <div className="mb-6 flex flex-col items-center">
            <img src={logo} alt="Cloud Sentric" className="mb-2 h-12 sm:h-16 md:h-20 object-contain" />
            <h2 className="text-center text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
              Login to your Account
            </h2>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center rounded-lg border border-gray-300 bg-white">
              <div className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-l-lg bg-blue-900">
                <Mail className="h-4 sm:h-5 w-4 sm:w-5 text-white" />
              </div>
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-r-lg px-2 sm:px-3 py-2 text-sm sm:text-base text-gray-700 focus:outline-none"
                required
              />
            </div>

            <div className="flex items-center rounded-lg border border-gray-300 bg-white">
              <div className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-l-lg bg-blue-900">
                <Lock className="h-4 sm:h-5 w-4 sm:w-5 text-white" />
              </div>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="mt-4 flex justify-between text-sm sm:text-base">
            <button
              type="button"
              onClick={() => setShowCustomerIdModal(true)}
              className="text-blue-800 hover:underline font-medium"
            >
              Recover your Customer ID
            </button>

            <button
              type="button"
              onClick={() => setShowForgotPasswordModal(true)}
              className="text-blue-800 hover:underline font-medium"
            >
              Forgotten Password
            </button>
          </div>
        </div>
      </motion.div>

      {/* 🔹 Customer ID Recovery Modal */}
      {showCustomerIdModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-xl p-6 w-11/12 max-w-md"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Recover Customer ID
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Enter the <strong>company email</strong> you used during onboarding.
            </p>

            <form onSubmit={handleRecoverCustomerId} className="space-y-3">
              <input
                type="email"
                placeholder="Enter your company email"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-800"
              />

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowCustomerIdModal(false)}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recovering}
                  className="px-4 py-2 text-sm rounded-lg bg-blue-900 text-white hover:bg-blue-800 flex items-center gap-2 disabled:opacity-70"
                >
                  {recovering ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Now"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 🔹 Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-xl p-6 w-11/12 max-w-md"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Forgotten Password
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Enter your <strong>company email</strong> to receive a password reset link.
            </p>

            <form onSubmit={handleForgotPassword} className="space-y-3">
              <input
                type="email"
                placeholder="Enter your company email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-800"
              />

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(false)}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingForgot}
                  className="px-4 py-2 text-sm rounded-lg bg-blue-900 text-white hover:bg-blue-800 flex items-center gap-2 disabled:opacity-70"
                >
                  {sendingForgot ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Now"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default LoginPage;
