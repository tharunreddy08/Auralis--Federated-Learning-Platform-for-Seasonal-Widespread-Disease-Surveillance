import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import Layout from './components/Layout';
import RoleSelection from './pages/RoleSelection';
import Login from './pages/Login';
import Landing from './pages/Landing';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageHospitals from './pages/admin/ManageHospitals';
import AdminAlerts from './pages/admin/AdminAlerts';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminFederated from './pages/admin/AdminFederated';
import AdminModelPerformance from './pages/admin/AdminModelPerformance';
import AdminUserManagement from './pages/admin/AdminUserManagement';
import AdminReportsExport from './pages/admin/AdminReportsExport';
import AdminSystemLogs from './pages/admin/AdminSystemLogs';
import HospitalDashboard from './pages/hospital/HospitalDashboard';
import UploadData from './pages/hospital/UploadData';
import TrainModel from './pages/hospital/TrainModel';
import ModelUpdates from './pages/hospital/ModelUpdates';
import HospitalDataHistory from './pages/hospital/HospitalDataHistory';
import HospitalTrainingHistory from './pages/hospital/HospitalTrainingHistory';
import HospitalModelPerformance from './pages/hospital/HospitalModelPerformance';
import OfficialDashboard from './pages/official/OfficialDashboard';
import OfficialHeatmap from './pages/official/OfficialHeatmap';
import OfficialAlerts from './pages/official/OfficialAlerts';
import OfficialAnalytics from './pages/official/OfficialAnalytics';
import DiseasePrediction from './pages/official/DiseasePrediction';
import OfficialAlertDetail from './pages/official/OfficialAlertDetail';
import OfficialReports from './pages/official/OfficialReports';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Checking session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const PublicLoginRoute = () => {
  const { isAuthenticated, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Preparing login...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/select-role" replace />;
  }

  return <Login />;
};

const PublicHomeRoute = () => {
  const { isAuthenticated, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Loading experience...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/select-role" replace />;
  }

  return <Landing />;
};

const AuthenticatedApp = () => {
  return (
    <Routes>
      <Route path="/" element={<PublicHomeRoute />} />
      <Route path="/login" element={<PublicLoginRoute />} />
      <Route path="/select-role" element={<ProtectedRoute><RoleSelection /></ProtectedRoute>} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/hospitals" element={<ManageHospitals />} />
        <Route path="/admin/alerts" element={<AdminAlerts />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/federated" element={<AdminFederated />} />
        <Route path="/admin/model-performance" element={<AdminModelPerformance />} />
        <Route path="/admin/users" element={<AdminUserManagement />} />
        <Route path="/admin/reports" element={<AdminReportsExport />} />
        <Route path="/admin/system-logs" element={<AdminSystemLogs />} />
        <Route path="/hospital" element={<HospitalDashboard />} />
        <Route path="/hospital/upload" element={<UploadData />} />
        <Route path="/hospital/train" element={<TrainModel />} />
        <Route path="/hospital/updates" element={<ModelUpdates />} />
        <Route path="/hospital/data-history" element={<HospitalDataHistory />} />
        <Route path="/hospital/training-history" element={<HospitalTrainingHistory />} />
        <Route path="/hospital/model-performance" element={<HospitalModelPerformance />} />
        <Route path="/official" element={<OfficialDashboard />} />
        <Route path="/official/heatmap" element={<OfficialHeatmap />} />
        <Route path="/official/alerts" element={<OfficialAlerts />} />
        <Route path="/official/alerts/:alertId" element={<OfficialAlertDetail />} />
        <Route path="/official/analytics" element={<OfficialAnalytics />} />
        <Route path="/official/prediction" element={<DiseasePrediction />} />
        <Route path="/official/reports" element={<OfficialReports />} />
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
