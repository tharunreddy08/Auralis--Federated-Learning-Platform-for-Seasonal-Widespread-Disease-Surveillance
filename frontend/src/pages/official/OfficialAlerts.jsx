import { useState, useEffect } from "react";
import { dataClient } from "@/api/dataClient";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import AlertsList from "../../components/dashboard/AlertsList";

export default function OfficialAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const data = await dataClient.entities.DiseaseAlert.list("-created_date", 50);
      setAlerts(data);
    } catch (error) {
      console.error("Failed to load official alerts:", error);
      setAlerts([]);
    }
  };

  const filtered = filter === "all" ? alerts : alerts.filter(a => a.status === filter);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">Disease Alerts</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor and track active disease alerts</p>
      </motion.div>

      <div className="flex gap-2 flex-wrap">
        {["all", "active", "monitoring", "resolved"].map(s => (
          <Button
            key={s}
            variant={filter === s ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(s)}
            className="capitalize text-xs"
          >
            {s}
          </Button>
        ))}
      </div>

      <AlertsList alerts={filtered} />
    </div>
  );
}
