import { useState, useEffect } from "react";
import { dataClient } from "@/api/dataClient";
import { motion } from "framer-motion";
import { Brain, Clock, CheckCircle, XCircle } from "lucide-react";
import FederatedLearningViz from "../../components/dashboard/FederatedLearningViz";
import StatCard from "../../components/dashboard/StatCard";

export default function AdminFederated() {
  const [modelUpdates, setModelUpdates] = useState([]);
  const [roundHistory, setRoundHistory] = useState([]);
  const [hospitals, setHospitals] = useState([]);

  useEffect(() => {
    loadUpdates();
    loadHospitals();
  }, []);

  const loadUpdates = async () => {
    const data = await dataClient.entities.ModelUpdate.list("-created_date", 20);
    setModelUpdates(data);
  };

  const loadHospitals = async () => {
    try {
      const data = await dataClient.entities.Hospital.list("-created_date", 50);
      setHospitals(data);
    } catch (error) {
      console.error("Failed to load hospitals:", error);
      setHospitals([]);
    }
  };

  const handleRoundComplete = async (round, accuracy) => {
    setRoundHistory(prev => [...prev, { round, accuracy, timestamp: new Date().toISOString() }]);
    await dataClient.entities.ModelUpdate.create({
      hospital_name: "Federated Aggregate",
      model_type: "gradient_boosting",
      accuracy: accuracy,
      loss: 1 - accuracy,
      training_samples: 0,
      round_number: round,
      status: "aggregated",
      weights_hash: Math.random().toString(36).substring(7),
    });
    loadUpdates();
  };

  const pending = modelUpdates.filter(m => m.status === "pending").length;
  const aggregated = modelUpdates.filter(m => m.status === "aggregated").length;
  const latestAccuracy = modelUpdates.length > 0 
    ? modelUpdates.sort((a, b) => (b.round_number || 0) - (a.round_number || 0))[0]?.accuracy 
    : 0;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">Federated Learning</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Coordinate and monitor federated model training across hospitals
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Pending Updates" value={pending} icon={Clock} color="warning" />
        <StatCard title="Aggregated Rounds" value={aggregated || roundHistory.length} icon={CheckCircle} color="success" />
        <StatCard title="Global Accuracy" value={`${((latestAccuracy || 0.942) * 100).toFixed(1)}%`} icon={Brain} color="primary" />
      </div>

      <FederatedLearningViz onComplete={handleRoundComplete} hospitals={hospitals} />

      {/* Round history */}
      {roundHistory.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4">Round History (This Session)</h3>
          <div className="space-y-2">
            {roundHistory.map((r, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    R{r.round}
                  </div>
                  <span className="font-medium">Round {r.round}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono text-muted-foreground">
                    Accuracy: {(r.accuracy * 100).toFixed(2)}%
                  </span>
                  <CheckCircle className="w-4 h-4 text-success" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Model Updates from DB */}
      {modelUpdates.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4">Model Update Log</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground uppercase tracking-wider border-b">
                  <th className="text-left py-2 pr-4">Hospital</th>
                  <th className="text-left py-2 pr-4">Model</th>
                  <th className="text-left py-2 pr-4">Round</th>
                  <th className="text-left py-2 pr-4">Accuracy</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {modelUpdates.slice(0, 10).map((mu, i) => (
                  <tr key={mu.id || i} className="border-b border-border/50">
                    <td className="py-2.5 pr-4 font-medium">{mu.hospital_name}</td>
                    <td className="py-2.5 pr-4 text-muted-foreground">{mu.model_type}</td>
                    <td className="py-2.5 pr-4">{mu.round_number || "—"}</td>
                    <td className="py-2.5 pr-4 font-mono">{mu.accuracy ? `${(mu.accuracy * 100).toFixed(1)}%` : "—"}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        mu.status === "aggregated" ? "bg-success/15 text-success" :
                        mu.status === "pending" ? "bg-warning/15 text-warning" :
                        "bg-destructive/15 text-destructive"
                      }`}>
                        {mu.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
