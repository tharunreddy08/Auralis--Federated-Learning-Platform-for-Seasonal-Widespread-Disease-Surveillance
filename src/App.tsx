import { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import HospitalSimulation from './pages/HospitalSimulation';
import Prediction from './pages/Prediction';
import Alerts from './pages/Alerts';
import RiskHeatmap from './pages/RiskHeatmap';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'hospitals':
        return <HospitalSimulation />;
      case 'prediction':
        return <Prediction />;
      case 'alerts':
        return <Alerts />;
      case 'risk-heatmap':
        return <RiskHeatmap />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export default App;
