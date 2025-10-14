import { useState, FC } from "react";
import { Mail, Lock, Loader2, X } from "lucide-react";
import { motion } from "framer-motion";
import logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";

const AdminLogin: FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
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

      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("admin", JSON.stringify(data.admin));

      toast.success("Admin login successful!");
      setTimeout(() => navigate("/admin/dashboard"), 800);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword !== signupConfirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setSignupLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signupEmail, password: signupPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Signup failed");
        setSignupLoading(false);
        return;
      }

      toast.success("Admin account created successfully!");
      setShowModal(false);
      setSignupEmail("");
      setSignupPassword("");
      setSignupConfirmPassword("");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setSignupLoading(false);
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
        <div className="absolute inset-0 bg-black/50"></div>

        <div className="relative w-11/12 max-w-sm sm:max-w-md md:max-w-lg rounded-2xl bg-white/95 p-6 sm:p-8 shadow-lg backdrop-blur-sm">
          {/* Logo */}
          <div className="mb-6 flex flex-col items-center">
            <img src={logo} alt="Cloud Sentric Admin" className="mb-2 h-12 sm:h-16 md:h-20 object-contain" />
            <h2 className="text-center text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
              Admin Login
            </h2>
            <p className="text-sm text-gray-500 mt-1 text-center">
              Enter your admin credentials to access the dashboard
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
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

          {/* Sign Up Trigger */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Don’t have an admin account?{" "}
              <button
                onClick={() => setShowModal(true)}
                className="font-medium text-blue-900 hover:underline"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="relative w-11/12 max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-lg">
              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="text-center text-xl font-bold mb-4">Admin Sign Up</h2>

              <form onSubmit={handleSignup} className="space-y-4">
                <div className="flex items-center rounded-lg border border-gray-300 bg-white">
                  <div className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-l-lg bg-blue-900">
                    <Mail className="h-4 sm:h-5 w-4 sm:w-5 text-white" />
                  </div>
                  <input
                    type="email"
                    placeholder="Admin Email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
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
                    placeholder="Password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
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
                    placeholder="Confirm Password"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    className="flex-1 rounded-r-lg px-2 sm:px-3 py-2 text-sm sm:text-base text-gray-700 focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={signupLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-900 py-2 sm:py-3 text-sm sm:text-base font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {signupLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing Up...
                    </>
                  ) : (
                    "Sign Up"
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default AdminLogin;
