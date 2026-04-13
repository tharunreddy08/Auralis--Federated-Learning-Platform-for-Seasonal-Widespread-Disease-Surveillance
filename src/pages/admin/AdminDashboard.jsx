import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Activity, Building2, AlertTriangle, Brain, TrendingUp, Users } from "lucide-react";
import StatCard from "../../components/dashboard/StatCard";
import DiseaseChart from "../../components/dashboard/DiseaseChart";
import AlertsList from "../../components/dashboard/AlertsList";
import { monthlyTrendData, diseaseDistribution, sampleAlerts } from "../../lib/sampleData";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const [alerts, setAlerts] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [patientCount, setPatientCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [alertsData, hospitalsData, patientsData] = await Promise.all([
      base44.entities.DiseaseAlert.list("-created_date", 10),
      base44.entities.Hospital.list("-created_date", 50),
      base44.entities.PatientData.list("-created_date", 1),
    ]);
    setAlerts(alertsData.length > 0 ? alertsData : sampleAlerts);
    setHospitals(hospitalsData);
    setPatientCount(patientsData.length > 0 ? patientsData.length : 8700);
    setLoading(false);
  };

  const activeAlerts = alerts.filter((a) => a.status === "active");
  const activeHospitals = hospitals.filter((h) => h.status === "active");

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          National disease surveillance overview
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Cases"
          value={patientCount.toLocaleString()}
          change="+12.4% from last month"
          changeType="up"
          icon={Activity}
          color="primary"
        />
        <StatCard
          title="Active Alerts"
          value={activeAlerts.length}
          change={`${alerts.filter(a => a.severity === "critical").length} critical`}
          changeType="up"
          icon={AlertTriangle}
          color="destructive"
        />
        <StatCard
          title="Active Hospitals"
          value={activeHospitals.length || 5}
          change="All connected"
          changeType="neutral"
          icon={Building2}
          color="accent"
        />
        <StatCard
          title="Model Accuracy"
          value="94.2%"
          change="+2.1% this round"
          changeType="up"
          icon={Brain}
          color="success"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DiseaseChart
          data={monthlyTrendData}
          type="area"
          title="Monthly Case Trend"
          subtitle="Aggregate cases across all regions"
        />
        <DiseaseChart
          data={diseaseDistribution}
          type="bar"
          title="Disease Distribution"
          subtitle="Cases by disease type"
        />
      </div>

      {/* Alerts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold mb-3">Active Alerts</h3>
          <AlertsList alerts={activeAlerts.slice(0, 4)} />
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-3">Disease Severity Breakdown</h3>
          <DiseaseChart
            data={[
              { name: "Mild", value: 3200 },
              { name: "Moderate", value: 2100 },
              { name: "Severe", value: 980 },
              { name: "Critical", value: 420 },
            ]}
            type="pie"
            title=""
          />
        </div>
      </div>
    </div>
  );
}