import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import WelcomePage from "../pages/WelcomePage";
import OnboardingForm1 from "../pages/OnboardPage1";
import OnboardingForm2 from "../pages/OnboardPage2";
import OnboardingForm3 from "../pages/OnboardPage3";
import DashboardLayout from "../layouts/DashboardLayout";
import DashboardHome from "../pages/dashboard/DashboardHome";
import ReportIssue from "../pages/dashboard/ReportIssue";
import ProfilePage from "../pages/dashboard/ProfilePage";
import RequestWizard from "../pages/dashboard/RequestWizard";
import ScrollToTop from "../components/ScrollToTop";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <ScrollToTop /> {/* 👈 works globally */}
      <Routes>
        <Route path="/" element={<WelcomePage />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<OnboardingForm1 />} />
        <Route path="/signup/step2" element={<OnboardingForm2 />} />
        <Route path="/signup/step3" element={<OnboardingForm3 />} />

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="request-portal" element={<RequestWizard />} />
          <Route path="report-issue" element={<ReportIssue />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
