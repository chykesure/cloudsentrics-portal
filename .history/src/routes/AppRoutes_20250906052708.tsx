import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import WelcomePage from "../pages/WelcomePage";
import OnboardingForm1 from "../pages/OnboardPage1";
import OnboardingForm2 from "../pages/OnboardPage2"; // 👈 import Step 2
import OnboardingForm3 from "../pages/OnboardPage3"; // 👈 import Step 2
import DashboardLayout from "../layouts/DashboardLayout";
import DashboardHome from "../pages/dashboard/DashboardHome";
import RequestPortal from "../pages/dashboard/RequestPortal";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route */}
        <Route path="/" element={<WelcomePage />} />

        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<OnboardingForm1 />} />
        <Route path="/signup/step2" element={<OnboardingForm2 />} /> {/* 👈 new */}
        <Route path="/signup/step3" element={<OnboardingForm3 />} /> {/* 👈 new */}

        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="request-portal" element={<RequestPortal />} />
          <Route path="request-portal" element={<RequestPortal />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
