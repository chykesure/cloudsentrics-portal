import { useState } from "react";
import { Mail, User, Loader2 } from "lucide-react";
import { motion } from "framer-motion"; // import motion
import logo from "../assets/logo.png";
import bgImage from "../assets/image2.jpg";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate async login
    setTimeout(() => {
      console.log("Login attempt:", { email, customerId });
      setLoading(false);
      navigate("/signup/step2");
    }, 2000);
  };

  return (
    <motion.div
      className="flex min-h-screen items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: `url(${bgImage})` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="w-full sm:w-11/12 md:max-w-md lg:max-w-lg rounded-2xl bg-white/90 p-6 sm:p-8 shadow-lg backdrop-blur-sm">
        {/* Logo */}
        <div className="mb-6 flex flex-col items-center">
          <img
            src={logo}
            alt="Cloud Sentric"
            className="mb-2 h-16 sm:h-30 object-contain"
          />
          <h2 className="text-center text-xl sm:text-2xl font-bold text-gray-800">
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

          {/* Button with Spinner */}
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
  );
};

export default LoginPage;
