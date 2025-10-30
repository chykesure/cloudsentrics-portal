import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import WelcomePage from "../pages/WelcomePage";
import OnboardingForm1 from "../pages/OnboardPage1";
import OnboardingForm2 from "../pages/OnboardPage2";
import OnboardingForm3 from "../pages/OnboardPage3";
import DashboardLayout from "../layouts/DashboardLayout";
import AdminDashboardLayout from "../layouts/AdminDashboardLayout";
import DashboardHome from "../pages/dashboard/DashboardHome";
import ReportIssue from "../pages/dashboard/ReportIssue";
import ProfilePage from "../pages/dashboard/ProfilePage";
import RequestWizard from "../pages/dashboard/RequestWizard";
import ScrollToTop from "../components/ScrollToTop";

// ✅ ADMIN IMPORTS
import AdminLogin from "../pages/admin/AdminLogin";
import AdminDashboard from "../pages/admin/AdminDashboard";
import StaffManagement from "../pages/admin/StaffManagement";
import AnalyticsDashboard from "../pages/admin/AnalyticsDashboard";
import AdminProfilePage from "../pages/admin/AdminProfilePage";
import ForgotPassword from "../pages/admin/ForgotPassword";
import ResetPassword from "../pages/admin/ResetPassword";
import ChangePassword from "../pages/admin/ChangePassword"; // ✅ NEW

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* ---------- PUBLIC ROUTES ---------- */}
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<OnboardingForm1 />} />
        <Route path="/signup/step2" element={<OnboardingForm2 />} />
        <Route path="/signup/step3" element={<OnboardingForm3 />} />

        {/* ---------- USER DASHBOARD ROUTES ---------- */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="request-portal" element={<RequestWizard />} />
          <Route path="report-issue" element={<ReportIssue />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* ---------- ADMIN AUTH ROUTES ---------- */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/reset-password/:token" element={<ResetPassword />} />
        <Route path="/admin/change-password" element={<ChangePassword />} /> {/* ✅ ADDED */}

        {/* ---------- ADMIN DASHBOARD ROUTES ---------- */}
        <Route path="/admin/dashboard" element={<AdminDashboardLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="profile" element={<AdminProfilePage />} />
        </Route>

        {/* ---------- DEFAULT REDIRECT ---------- */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
