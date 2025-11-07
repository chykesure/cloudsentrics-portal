import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React from "react"; // ✅ Required for hooks and JSX
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
import UpgradeTier from "../pages/dashboard/Step2";
import type { ReportFormData } from "../pages/dashboard/types"; // ✅ Import the type

// ✅ ADMIN IMPORTS
import AdminLogin from "../pages/admin/AdminLogin";
import AdminDashboard from "../pages/admin/AdminDashboard";
import StaffManagement from "../pages/admin/StaffManagement";
import AnalyticsDashboard from "../pages/admin/AnalyticsDashboard";
import AdminProfilePage from "../pages/admin/AdminProfilePage";
import ForgotPassword from "../pages/admin/ForgotPassword";
import ResetPassword from "../pages/admin/ResetPassword";
import ChangePassword from "../pages/admin/ChangePassword"; // ✅ NEW
import UpgradeRequest from "../pages/admin/UpgradeRequest"; // ✅ NEW

// ✅ Wrapper to load Step2 (UpgradeTier) as a standalone safe page
const UpgradeTierWrapper = () => {
  const [formData, setFormData] = React.useState<ReportFormData>({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    accountId: "",
    bucketName: "",
    date: "",
    time: "",
    category: "",
    otherCategoryDesc: "",
    description: "",
    title: "",
    priority: "Low",
    steps: "",
    image: null,
    confirm: false,
    upgradeStatus: null,
  });

  return (
    <UpgradeTier
      goBack={() => {}}
      jumpToStep={() => {}}
      formData={formData}
      setFormData={setFormData}
    />
  );
};

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
          <Route path="upgrade-tier" element={<UpgradeTierWrapper />} /> {/* ✅ FIXED */}
        </Route>

        {/* ---------- ADMIN AUTH ROUTES ---------- */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/reset-password/:token" element={<ResetPassword />} />
        <Route path="/admin/change-password" element={<ChangePassword />} />

        {/* ---------- ADMIN DASHBOARD ROUTES ---------- */}
        <Route path="/admin/dashboard" element={<AdminDashboardLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="profile" element={<AdminProfilePage />} />
          <Route path="upgrade-requests" element={<UpgradeRequest />} />
        </Route>

        {/* ---------- DEFAULT REDIRECT ---------- */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
