import { useState } from "react";
import { Mail, User, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";

interface UserType {
  id: string;
  companyEmail: string;
  companyName: string;
  customerId: string;
}

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, customerId }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Login failed");
        setLoading(false);
        return;
      }

      // ✅ Save token and user info
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // ✅ Ensure email is saved for profile & dashboard
      if (data.user?.email) {
        localStorage.setItem("email", data.user.email);
      } else {
        localStorage.setItem("email", email); // fallback if backend didn’t send it
      }

      toast.success("Login successful!");

      // ✅ Optional: short delay for UX smoothness
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


  return (
    <>
      {/* Toaster component for showing toast notifications */}
      <Toaster position="top-right" reverseOrder={false} />

      <motion.div
        className="relative flex min-h-screen items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url('/Image2.jpg')" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="relative w-11/12 max-w-sm sm:max-w-md md:max-w-lg rounded-2xl bg-white/90 p-4 sm:p-6 md:p-8 shadow-lg backdrop-blur-sm">
          {/* Logo */}
          <div className="mb-6 flex flex-col items-center">
            <img src={logo} alt="Cloud Sentric" className="mb-2 h-12 sm:h-16 md:h-20 object-contain" />
            <h2 className="text-center text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
              Login to your Account
            </h2>
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
                "Login"
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </>
  );
};

export default AdminLogin;
