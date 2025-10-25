import { useState } from "react";
import { Mail, User, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recovering, setRecovering] = useState(false);

  const navigate = useNavigate();

  // 🔹 Handle Login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        "https://api.onboardingportal.cloudsentrics.org/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, customerId }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Login failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("email", data.user?.email || email);

      toast.success("Login successful!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 800);
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Something went wrong, try again later");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Handle Customer ID Recovery
  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecovering(true);
    try {
      const res = await fetch(
        "https://api.onboardingportal.cloudsentrics.org/api/auth/recover-customer-id",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: recoveryEmail }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Email not found or invalid");
        setRecovering(false);
        return;
      }

      toast.success("Customer ID has been sent to your company email!");
      setShowModal(false);
      setRecoveryEmail("");
    } catch (err) {
      console.error("Recovery error:", err);
      toast.error("Unable to send recovery email at the moment");
    } finally {
      setRecovering(false);
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
            <img
              src={logo}
              alt="Cloud Sentric"
              className="mb-2 h-12 sm:h-16 md:h-20 object-contain"
            />
            <h2 className="text-center text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
              Login to your Account
            </h2>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
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

            {/* Customer ID */}
            <div className="flex items-center rounded-lg border border-gray-300 bg-white">
              <div className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-l-lg bg-blue-900">
                <User className="h-4 sm:h-5 w-4 sm:w-5 text-white" />
              </div>
              <input
                type="text"
                placeholder="Enter your Customer ID"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="flex-1 rounded-r-lg px-2 sm:px-3 py-2 text-sm sm:text-base text-gray-700 focus:outline-none"
                required
              />
            </div>

            {/* Login Button */}
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

          {/* Recover ID Button */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="text-blue-800 text-sm hover:underline font-medium"
            >
              Recover your Customer ID
            </button>
          </div>
        </div>
      </motion.div>

      {/* 🔹 Recovery Modal */}
      {showModal && (
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

            <form onSubmit={handleRecover} className="space-y-3">
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
                  onClick={() => setShowModal(false)}
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
    </>
  );
};

export default LoginPage;
