import { useState, useEffect } from "react";
import { dataClient } from "@/api/dataClient";
import { Map, Bell, BarChart3, Activity, TrendingUp, Shield } from "lucide-react";
import StatCard from "../../components/dashboard/StatCard";
import DiseaseChart from "../../components/dashboard/DiseaseChart";
import AlertsList from "../../components/dashboard/AlertsList";
import HeatmapView from "../../components/dashboard/HeatmapView";
import { monthlyTrendData, heatmapPoints } from "../../lib/sampleData";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function OfficialDashboard() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await dataClient.entities.DiseaseAlert.list("-created_date", 5);
      setAlerts(data);
    } catch (error) {
      console.error("Failed to load dashboard alerts:", error);
      setAlerts([]);
    }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">Health Official Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time disease surveillance overview</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Outbreaks" value="3" change="2 critical" changeType="up" icon={Activity} color="destructive" />
        <StatCard title="Total Cases" value="8,700" change="+340 this week" changeType="up" icon={TrendingUp} color="primary" />
        <StatCard title="Regions Affected" value="12" icon={Map} color="accent" />
        <StatCard title="Response Level" value="High" icon={Shield} color="warning" />
      </div>

      {/* Quick Map */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Disease Heatmap</h3>
          <Link to="/official/heatmap" className="text-xs text-primary font-medium hover:underline">
            View Full Map →
          </Link>
        </div>
        <HeatmapView dataPoints={heatmapPoints} center={[22, 78]} zoom={5} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold mb-3">Recent Alerts</h3>
          <AlertsList alerts={alerts.slice(0, 3)} compact />
        </div>
        <DiseaseChart data={monthlyTrendData} type="area" title="Monthly Trend" subtitle="National aggregate" />
      </div>
    </div>
  );
}
