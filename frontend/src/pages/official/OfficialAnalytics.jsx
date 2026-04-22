import { useEffect, useMemo, useState } from "react";
import { fetchOfficialAnalytics } from "@/api/roleFeatureService";
import { motion } from "framer-motion";
import DiseaseChart from "../../components/dashboard/DiseaseChart";
import StatCard from "../../components/dashboard/StatCard";
import { TrendingUp, Activity, BarChart3, PieChart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function OfficialAnalytics() {
  const [payload, setPayload] = useState(null);
  const [filters, setFilters] = useState({ region: "", startDate: "", endDate: "" });
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async (nextFilters = filters) => {
    setLoading(true);
    try {
      const data = await fetchOfficialAnalytics(nextFilters);
      setPayload(data);
    } catch (error) {
      console.error("Failed to load analytics:", error);
      setPayload(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const analytics = useMemo(() => {
    return {
      totalCases: payload?.totals?.totalCases || 0,
      activeRegions: payload?.regionBreakdown?.length || 0,
      peakDisease: payload?.diseaseBreakdown?.[0]?.name || "N/A",
      monthlyTrendData: (payload?.timeline || []).map((row) => ({ name: row.date, cases: row.value })),
      weeklyData: (payload?.timeline || []).slice(-7).map((row) => ({ name: row.date, cases: row.value })),
      diseaseDistribution: (payload?.diseaseBreakdown || []).map((row) => ({ name: row.name, cases: row.value, value: row.value })),
      regionalDistribution: (payload?.regionBreakdown || []).map((row) => ({ name: row.name, value: row.value })),
      alertCount: payload?.totals?.alerts || 0,
      predictionCount: payload?.totals?.predictions || 0,
      avgConfidence: payload?.totals?.avgConfidence || 0,
    };
  }, [payload]);

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Disease trends, patterns, and predictions with region/date filters</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-4">
        <Input placeholder="Region" value={filters.region} onChange={(e) => setFilters((prev) => ({ ...prev, region: e.target.value }))} />
        <Input type="date" value={filters.startDate} onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))} />
        <Input type="date" value={filters.endDate} onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))} />
        <Button onClick={() => loadAnalytics()} disabled={loading}>{loading ? "Loading..." : "Apply Filters"}</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Cases" value={analytics.totalCases.toLocaleString()} icon={Activity} color="primary" />
        <StatCard title="Active Regions" value={analytics.activeRegions} icon={BarChart3} color="accent" />
        <StatCard title="Alerts Tracked" value={analytics.alertCount} icon={TrendingUp} color="success" />
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
