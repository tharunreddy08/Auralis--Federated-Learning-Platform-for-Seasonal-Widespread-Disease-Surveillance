import { useState, useEffect } from "react";
import { dataClient } from "@/api/dataClient";
import { Map, Activity, TrendingUp, Shield, Calendar } from "lucide-react";
import StatCard from "../../components/dashboard/StatCard";
import DiseaseChart from "../../components/dashboard/DiseaseChart";
import AlertsList from "../../components/dashboard/AlertsList";
import DashboardHero from "../../components/dashboard/DashboardHero";
import HeatmapView from "../../components/dashboard/HeatmapView";
import { monthlyTrendData, weeklyData, annualData, heatmapPoints } from "../../lib/sampleData";
import { Button } from "../../components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const REFRESH_INTERVAL_MS = 10000;

export default function OfficialDashboard() {
  const [alerts, setAlerts] = useState([]);
  const [timePeriod, setTimePeriod] = useState("monthly"); // weekly, monthly, annual

  useEffect(() => {
    loadData();

    const timerId = setInterval(() => {
      loadData();
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(timerId);
  }, []);

  const loadData = async () => {
    try {
      const data = await dataClient.entities.DiseaseAlert.list("-created_date", 200);
      setAlerts(data);
    } catch (error) {
      console.error("Failed to load dashboard alerts:", error);
      setAlerts([]);
    }
  };

  const activeAlerts = alerts.filter((alert) => alert.status === "active");
  const criticalCount = activeAlerts.filter((alert) => alert.severity === "critical").length;
  
  // Count unique regions from heatmap data (what's displayed visually)
  const activeRegions = new Set(
    heatmapPoints.map((point) => (point.region || "").trim()).filter(Boolean)
  ).size;
  
  const totalCases = alerts.reduce((sum, alert) => sum + (Number(alert.case_count) || 0), 0);

  const responseLevel =
    criticalCount >= 5 || activeAlerts.length >= 12
      ? "Critical"
      : criticalCount >= 2 || activeAlerts.length >= 6
      ? "High"
      : activeAlerts.length >= 3
      ? "Medium"
      : "Low";

  // Select chart data based on time period
  const getChartData = () => {
    if (timePeriod === "weekly") return weeklyData;
    if (timePeriod === "annual") return annualData;
    return monthlyTrendData;
  };

  const getChartTitle = () => {
    if (timePeriod === "weekly") return "Weekly Trend";
    if (timePeriod === "annual") return "Annual Trend";
    return "Monthly Trend";
  };

  return (
    <div className="space-y-8">
      <DashboardHero
        badge="Public Health Monitor"
        title="Health Official Dashboard"
        description="Assess spread patterns, prioritize response level, and coordinate interventions from one control center."
        items={[
          { label: "Active Regions", value: activeRegions, icon: Map },
          { label: "Response Level", value: responseLevel, icon: Shield },
          { label: "Auto Refresh", value: "Every 10s", icon: Activity },
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Outbreaks"
          value={activeAlerts.length}
          change={`${criticalCount} critical`}
          changeType={criticalCount > 0 ? "up" : "neutral"}
          icon={Activity}
          color="destructive"
        />
        <StatCard
          title="Total Cases"
          value={totalCases.toLocaleString()}
          change="Live from alert records"
          changeType="neutral"
          icon={TrendingUp}
          color="primary"
        />
        <StatCard title="Active Regions" value={activeRegions} icon={Map} color="accent" />
        <StatCard title="Response Level" value={responseLevel} icon={Shield} color="warning" />
      </div>

      {/* Quick Map */}
      <div className="glass-panel rounded-xl p-4">
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
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">{getChartTitle()}</h3>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={timePeriod === "weekly" ? "default" : "outline"}
                onClick={() => setTimePeriod("weekly")}
                className="h-8 text-xs"
              >
                Weekly
              </Button>
              <Button
                size="sm"
                variant={timePeriod === "monthly" ? "default" : "outline"}
                onClick={() => setTimePeriod("monthly")}
                className="h-8 text-xs"
              >
                Monthly
              </Button>
              <Button
                size="sm"
                variant={timePeriod === "annual" ? "default" : "outline"}
                onClick={() => setTimePeriod("annual")}
                className="h-8 text-xs"
              >
                Annual
              </Button>
            </div>
          </div>
          <DiseaseChart data={getChartData()} type="area" title={getChartTitle()} subtitle="National aggregate" />
        </motion.div>
      </div>
    </div>
  );
}
