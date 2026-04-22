import { useState, useEffect } from "react";
import { dataClient } from "@/api/dataClient";
import { Upload, Brain, Send, Activity, FileText, TrendingUp } from "lucide-react";
import StatCard from "../../components/dashboard/StatCard";
import DiseaseChart from "../../components/dashboard/DiseaseChart";
import DashboardHero from "../../components/dashboard/DashboardHero";
import { weeklyData } from "../../lib/sampleData";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function HospitalDashboard() {
  const [patientCount, setPatientCount] = useState(0);
  const [modelUpdates, setModelUpdates] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [patientsResponse, updates] = await Promise.all([
        dataClient.entities.PatientData.listWithMeta("-created_date", 5),
        dataClient.entities.ModelUpdate.list("-created_date", 5),
      ]);

      const total = Number(patientsResponse?.pagination?.total || 0);
      setPatientCount(total);
      setRecentPatients(Array.isArray(patientsResponse?.items) ? patientsResponse.items : []);
      setModelUpdates(updates);
    } catch (error) {
      console.error("Failed to load hospital dashboard data:", error);
      setPatientCount(0);
      setRecentPatients([]);
      setModelUpdates([]);
    }
  };

  const quickActions = [
    { label: "Upload Patient Data", icon: Upload, path: "/hospital/upload", color: "bg-primary/10 text-primary" },
    { label: "Train Local Model", icon: Brain, path: "/hospital/train", color: "bg-accent/10 text-accent" },
    { label: "Send Model Update", icon: Send, path: "/hospital/updates", color: "bg-success/10 text-success" },
  ];

  return (
    <div className="space-y-8">
      <DashboardHero
        badge="Hospital Node"
        title="Hospital Dashboard"
        description="Track reporting throughput, local model status, and rapid actions for your medical team."
        items={[
          { label: "Recent Records", value: recentPatients.length, icon: FileText },
          { label: "Model Updates", value: modelUpdates.length, icon: Send },
          { label: "Total Records", value: patientCount.toLocaleString(), icon: Activity },
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Records" value={patientCount} icon={FileText} color="primary" />
        <StatCard title="This Week" value="48" change="+12 from last week" changeType="up" icon={TrendingUp} color="success" />
        <StatCard title="Model Updates Sent" value={modelUpdates.length} icon={Send} color="accent" />
        <StatCard title="Local Accuracy" value="91.7%" change="+1.8% improvement" changeType="up" icon={Brain} color="warning" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickActions.map((action, i) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={action.path}
                className="glass-panel flex items-center gap-4 rounded-xl p-5 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
              >
                <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-semibold text-sm">{action.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <DiseaseChart data={weeklyData} type="area" title="Weekly Reporting Activity" subtitle="Patient data submissions this week" />

      <div className="glass-panel rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Recent Uploaded Records</h3>
          <span className="text-xs text-muted-foreground">Last {recentPatients.length} records</span>
        </div>

        {recentPatients.length === 0 ? (
          <p className="text-sm text-muted-foreground">No patient records uploaded yet.</p>
        ) : (
          <div className="space-y-2">
            {recentPatients.map((row) => (
              <div key={row.id} className="flex flex-col gap-1 rounded-lg border border-border/80 bg-background/60 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium capitalize">{row.disease} - {row.hospital_name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {row.severity} severity{row.region ? ` • ${row.region}` : ""}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {row.report_date ? new Date(row.report_date).toLocaleString() : "-"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
