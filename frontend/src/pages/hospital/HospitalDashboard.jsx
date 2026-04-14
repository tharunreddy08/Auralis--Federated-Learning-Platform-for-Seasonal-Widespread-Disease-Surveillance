import { useState, useEffect } from "react";
import { dataClient } from "@/api/dataClient";
import { Upload, Brain, Send, Activity, FileText, TrendingUp } from "lucide-react";
import StatCard from "../../components/dashboard/StatCard";
import DiseaseChart from "../../components/dashboard/DiseaseChart";
import { weeklyData } from "../../lib/sampleData";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function HospitalDashboard() {
  const [patientCount, setPatientCount] = useState(0);
  const [modelUpdates, setModelUpdates] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [patients, updates] = await Promise.all([
        dataClient.entities.PatientData.list("-created_date", 1),
        dataClient.entities.ModelUpdate.list("-created_date", 5),
      ]);
      setPatientCount(patients.length);
      setModelUpdates(updates);
    } catch (error) {
      console.error("Failed to load hospital dashboard data:", error);
      setPatientCount(0);
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
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">Hospital Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Your hospital's surveillance overview</p>
      </motion.div>

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
                className="flex items-center gap-4 p-5 bg-card border border-border rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all"
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
    </div>
  );
}
