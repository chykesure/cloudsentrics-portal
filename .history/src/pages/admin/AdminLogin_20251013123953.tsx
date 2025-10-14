import { useState} from "react";
import type { FC } from "react"; // ✅ type-only import
import { Mail, Lock, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import logo from "../";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";

const AdminLogin: FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Login failed");
        setLoading(false);
        return;
      }

      // Save token and admin info
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("admin", JSON.stringify(data.admin));

      toast.success("Admin login successful!");

      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 800);
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Something went wrong, try again later");
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

        <div className="relative w-11/12 max-w-sm sm:max-w-md md:max-w-lg rounded-2xl bg-white/95 p-6 sm:p-8 shadow-lg backdrop-blur-sm">
          {/* Logo */}
          <div className="mb-6 flex flex-col items-center">
            <img
              src={logo}
              alt="Cloud Sentric Admin"
              className="mb-2 h-12 sm:h-16 md:h-20 object-contain"
            />
            <h2 className="text-center text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
              Admin Login
            </h2>
            <p className="text-sm text-gray-500 mt-1 text-center">
              Enter your admin credentials to access the dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="flex items-center rounded-lg border border-gray-300 bg-white">
              <div className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-l-lg bg-blue-900">
                <Mail className="h-4 sm:h-5 w-4 sm:w-5 text-white" />
              </div>
              <input
                type="email"
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-r-lg px-2 sm:px-3 py-2 text-sm sm:text-base text-gray-700 focus:outline-none"
                required
              />
            </div>

            {/* Password */}
            <div className="flex items-center rounded-lg border border-gray-300 bg-white">
              <div className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-l-lg bg-blue-900">
                <Lock className="h-4 sm:h-5 w-4 sm:w-5 text-white" />
              </div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 rounded-r-lg px-2 sm:px-3 py-2 text-sm sm:text-base text-gray-700 focus:outline-none"
                required
              />
            </div>

            {/* Submit Button */}
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
                "Login as Admin"
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </>
  );
};

export default AdminLogin;
