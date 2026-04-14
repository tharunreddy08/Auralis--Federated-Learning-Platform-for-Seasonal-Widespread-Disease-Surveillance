import { useEffect, useMemo, useState } from "react";
import { dataClient } from "@/api/dataClient";
import { motion } from "framer-motion";
import DiseaseChart from "../../components/dashboard/DiseaseChart";
import StatCard from "../../components/dashboard/StatCard";
import { TrendingUp, Activity, BarChart3, PieChart } from "lucide-react";

export default function OfficialAnalytics() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const data = await dataClient.entities.DiseaseAlert.list("-created_date", 500);
        setAlerts(data);
      } catch (error) {
        console.error("Failed to load analytics alerts:", error);
        setAlerts([]);
      }
    };

    loadAlerts();
  }, []);

  const analytics = useMemo(() => {
    const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const weekLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const monthly = monthLabels.map((name) => ({ name, cases: 0 }));
    const weekly = weekLabels.map((name) => ({ name, cases: 0 }));
    const diseaseMap = new Map();
    const regionMap = new Map();

    let totalCases = 0;

    alerts.forEach((alert) => {
      const cases = Number(alert.case_count ?? 0);
      const timestamp = alert.created_date || alert.report_date || alert.updated_date;
      const date = timestamp ? new Date(timestamp) : null;
      const disease = String(alert.disease || "unknown");
      const region = String(alert.region || "Unknown");

      totalCases += cases;

      diseaseMap.set(disease, (diseaseMap.get(disease) || 0) + cases);
      regionMap.set(region, (regionMap.get(region) || 0) + cases);

      if (date && !Number.isNaN(date.getTime())) {
        monthly[date.getMonth()].cases += cases;
        weekly[date.getDay()].cases += cases;
      }
    });

    const diseaseDistribution = Array.from(diseaseMap.entries())
      .map(([name, cases]) => ({ name, cases, value: cases }))
      .sort((a, b) => b.cases - a.cases);

    const regionalDistribution = Array.from(regionMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return {
      totalCases,
      activeRegions: regionMap.size,
      peakDisease: diseaseDistribution[0]?.name || "N/A",
      monthlyTrendData: monthly,
      weeklyData: weekly,
      diseaseDistribution,
      regionalDistribution,
    };
  }, [alerts]);

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Disease trends, patterns, and predictions</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Cases" value={analytics.totalCases.toLocaleString()} icon={Activity} color="primary" />
        <StatCard title="Active Regions" value={analytics.activeRegions} icon={BarChart3} color="accent" />
        <StatCard title="Alerts Tracked" value={alerts.length} icon={TrendingUp} color="success" />
        <StatCard title="Peak Disease" value={analytics.peakDisease} icon={PieChart} color="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DiseaseChart data={analytics.monthlyTrendData} type="area" title="Annual Trend" subtitle="National case count" />
        <DiseaseChart data={analytics.diseaseDistribution} type="bar" title="Disease Breakdown" subtitle="Cases per disease type" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DiseaseChart data={analytics.weeklyData} type="area" title="This Week" subtitle="Daily reports" />
        <DiseaseChart
          data={analytics.regionalDistribution}
          type="pie"
          title="Regional Distribution"
          subtitle="Cases by region"
        />
      </div>
    </div>
  );
}
