import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./app/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import NotAuthorized from "./pages/NotAuthorized";
import Login from "./pages/Login";
import Registration from "./pages/Registration"; // add register
import ButtonShowcase from "./pages/ButtonShowcase"; // dev/demo page

import ProtectedRoute from "./routes/ProtectedRoute";
import { UserManagement } from "./components/users/UserManagement"; // New: Import the UserManagement component
import RolesPermissionsPage from "./pages/RolesPermissionsPage"; // New: Import the RolesPermissionsPage
import PermissionsPage from "./pages/PermissionsPage";
import CustomerDashboard from "./pages/CustomerDashboard";
import DatacenterDashboard from "./pages/DatacenterDashboard";
import MeterDashboard from "./pages/MeterDashboard";
import MeterDetailsDashboard from "./pages/MeterDetailsDashboard";
import UsageSummaryDashboard from "./pages/UsageSummaryDashboard";
import MenuAndPageManagement from "./pages/MenuAndPageManagement";
// New: Create a client for React Query. This manages caching and data state.

import '@fortawesome/fontawesome-free/css/fontawesome.min.css';
import '@fortawesome/fontawesome-free/css/solid.min.css';
import '@fortawesome/fontawesome-free/css/brands.min.css'; // only if you use brands
import RackDashboard from "./pages/RackDashboard";
import RealTimeData from "./pages/RealTimeData";
import LogsDashboard from "./pages/LogsDashboard";
import PowerUsageDashboard from "./pages/PowerUsageDashboard";
import PowerUsageLogDashboard from "./pages/PowerUsageLogDashboard";
// (optional) import '@fortawesome/fontawesome-free/css/regular.min.css';



const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Keep data fresh for 5 minutes by default
      staleTime: 1000 * 60 * 5,
    },
  },
});

export default function App() {
  return (
    // New: Wrap the entire application with the QueryClientProvider
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* All pages share the main layout */}
            <Route element={<MainLayout />}>
              {/* Public routes */}
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Registration />} />
              <Route path="403" element={<NotAuthorized />} />
              <Route path="settings" element={<ButtonShowcase />} />
              <Route path="customer" element={<CustomerDashboard />} />
              <Route path="rack" element={<RackDashboard />} />
              <Route path="meter" element={<MeterDashboard />} />
              <Route path="report-meter-details" element={<MeterDetailsDashboard />} />
              <Route path="report-usage-summary" element={<UsageSummaryDashboard />} />
              <Route path="menu-page-management" element={<MenuAndPageManagement />} />
              <Route path="real-time-graph" element={<RealTimeData />} />
              <Route path="logs" element={<LogsDashboard />} />
              <Route path="report-power-usage" element={<PowerUsageLogDashboard /> } />
              {/* Protected routes that require authentication */}
              <Route element={<ProtectedRoute />}>
                <Route path="dashboard" element={<Dashboard />} />
                {/* New: The User Management page is a protected route */}
                <Route path="users" element={<UserManagement />} />
                <Route path="roles" element={<RolesPermissionsPage />} />
                <Route path="permissions" element={<PermissionsPage />} />
                <Route path="datacenter" element={<DatacenterDashboard />} />
              </Route>

              {/* 404 - Not Found */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}


