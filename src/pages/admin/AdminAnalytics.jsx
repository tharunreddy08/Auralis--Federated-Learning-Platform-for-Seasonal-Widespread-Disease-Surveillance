import { motion } from "framer-motion";
import DiseaseChart from "../../components/dashboard/DiseaseChart";
import StatCard from "../../components/dashboard/StatCard";
import { monthlyTrendData, diseaseDistribution, weeklyData } from "../../lib/sampleData";
import { TrendingUp, TrendingDown, BarChart3, PieChart } from "lucide-react";

export default function AdminAnalytics() {
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Comprehensive disease analytics and trends</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Weekly New Cases" value="1,229" change="+8.3% vs last week" changeType="up" icon={TrendingUp} color="primary" />
        <StatCard title="Recovery Rate" value="87.4%" change="+1.2% improvement" changeType="up" icon={TrendingUp} color="success" />
        <StatCard title="Mortality Rate" value="1.8%" change="-0.3% decrease" changeType="down" icon={TrendingDown} color="destructive" />
        <StatCard title="Predictions Made" value="2,847" change="98.2% accuracy" changeType="neutral" icon={BarChart3} color="accent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DiseaseChart data={monthlyTrendData} type="area" title="Annual Case Trend" subtitle="12-month rolling cases" />
        <DiseaseChart data={weeklyData} type="bar" title="This Week's Activity" subtitle="Daily case reports" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DiseaseChart data={diseaseDistribution} type="bar" title="Disease Distribution" subtitle="Total cases by disease" />
        <DiseaseChart
          data={[
            { name: "Recovered", value: 5890 },
            { name: "Under Treatment", value: 2120 },
            { name: "Deceased", value: 690 },
          ]}
          type="pie"
          title="Patient Outcomes"
          subtitle="Overall outcome distribution"
        />
      </div>
    </div>
  );
}