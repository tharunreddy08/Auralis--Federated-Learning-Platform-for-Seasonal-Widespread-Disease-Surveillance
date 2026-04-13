import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from './components/Layout';
import RoleSelection from './pages/RoleSelection';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageHospitals from './pages/admin/ManageHospitals';
import AdminAlerts from './pages/admin/AdminAlerts';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminFederated from './pages/admin/AdminFederated';
import HospitalDashboard from './pages/hospital/HospitalDashboard';
import UploadData from './pages/hospital/UploadData';
import TrainModel from './pages/hospital/TrainModel';
import ModelUpdates from './pages/hospital/ModelUpdates';
import OfficialDashboard from './pages/official/OfficialDashboard';
import OfficialHeatmap from './pages/official/OfficialHeatmap';
import OfficialAlerts from './pages/official/OfficialAlerts';
import OfficialAnalytics from './pages/official/OfficialAnalytics';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<RoleSelection />} />
      <Route element={<Layout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/hospitals" element={<ManageHospitals />} />
        <Route path="/admin/alerts" element={<AdminAlerts />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/federated" element={<AdminFederated />} />
        <Route path="/hospital" element={<HospitalDashboard />} />
        <Route path="/hospital/upload" element={<UploadData />} />
        <Route path="/hospital/train" element={<TrainModel />} />
        <Route path="/hospital/updates" element={<ModelUpdates />} />
        <Route path="/official" element={<OfficialDashboard />} />
        <Route path="/official/heatmap" element={<OfficialHeatmap />} />
        <Route path="/official/alerts" element={<OfficialAlerts />} />
        <Route path="/official/analytics" element={<OfficialAnalytics />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App