import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const ResetPasswordPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [passwordValid, setPasswordValid] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);

  // 🔐 Real-time password validation
  useEffect(() => {
    const hasMinLength = newPassword.length >= 8;
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSymbol = /[@!#\$%\^\&\*\(\)\-_=\+\{\}\[\]:;"'<>,\.\?\/]/.test(newPassword);

    setPasswordValid(hasMinLength && hasUppercase && hasNumber && hasSymbol);

    setPasswordMatch(
      newPassword === confirmPassword || confirmPassword === ""
    );
  }, [newPassword, confirmPassword]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordValid) {
      toast.error("Password must contain capital letter, number, symbol and be 8+ characters.");
      return;
    }

    if (!passwordMatch) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("https://api.onboardingportal.cloudsentrics.org/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to reset password");
        return;
      }

      toast.success("Password reset successfully! Redirecting...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error("Reset password error:", err);
      toast.error("Something went wrong. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-cover bg-center p-4 sm:p-6"
      style={{ backgroundImage: "url('/Image2.jpg')" }}
    >
      <div className="bg-black/50 flex items-center justify-center w-full h-full">
        <form
          onSubmit={handleResetPassword}
          className="bg-white p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-md"
        >
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Reset Password
          </h2>

          {/* New Password */}
          <div className="mb-4">
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none transition-colors"
            />

            {/* Validation messages */}
            {newPassword.length > 0 && (
              <div className="text-sm mt-1 space-y-1">

                <p className={/[A-Z]/.test(newPassword) ? "text-green-600" : "text-red-500"}>
                  • Must include at least one uppercase letter (A–Z)
                </p>

                <p className={/[0-9]/.test(newPassword) ? "text-green-600" : "text-red-500"}>
                  • Must include at least one number (0–9)
                </p>

                <p className={
                    /[@!#\$%\^\&\*\(\)\-_=\+\{\}\[\]:;"'<>,\.\?\/]/.test(newPassword)
                      ? "text-green-600"
                      : "text-red-500"
                  }>
                  • Must include at least one symbol (@, !, #, $, etc)
                </p>

                <p className={newPassword.length >= 8 ? "text-green-600" : "text-red-500"}>
                  • Must be at least 8 characters long
                </p>

                {passwordValid && (
                  <p className="text-green-600 font-medium">Password looks strong!</p>
                )}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mb-4">
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none transition-colors"
            />

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
            className={`w-full py-2 rounded-lg text-white font-semibold transition-colors ${
              loading || !passwordValid || !passwordMatch
                ? "bg-blue-700 cursor-not-allowed opacity-70"
                : "bg-blue-900 hover:bg-blue-800"
            }`}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
