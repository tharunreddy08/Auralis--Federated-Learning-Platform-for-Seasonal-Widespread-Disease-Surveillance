import { useState, useEffect } from "react";
import { dataClient } from "@/api/dataClient";
import { Send, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

export default function ModelUpdates() {
  const { toast } = useToast();
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(null);

  useEffect(() => { loadUpdates(); }, []);

  const loadUpdates = async () => {
    setLoading(true);
    const data = await dataClient.entities.ModelUpdate.list("-created_date", 20);
    setUpdates(data);
    setLoading(false);
  };

  const handleSend = async (update) => {
    setSending(update.id);
    // Simulate sending model weights
    await new Promise(r => setTimeout(r, 2000));
    await dataClient.entities.ModelUpdate.update(update.id, { status: "aggregated" });
    toast({ title: "Model Sent", description: "Model weights submitted for federated aggregation" });
    setSending(null);
    loadUpdates();
  };

  const statusIcon = {
    pending: <Clock className="w-4 h-4 text-warning" />,
    aggregated: <CheckCircle className="w-4 h-4 text-success" />,
    rejected: <XCircle className="w-4 h-4 text-destructive" />,
  };

  const statusColor = {
    pending: "bg-warning/15 text-warning",
    aggregated: "bg-success/15 text-success",
    rejected: "bg-destructive/15 text-destructive",
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">Model Updates</h1>
        <p className="text-sm text-muted-foreground mt-1">Send trained model weights for federated aggregation</p>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : updates.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-10 text-center">
          <Send className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium">No Model Updates Yet</p>
          <p className="text-xs text-muted-foreground mt-1">Train a local model first, then send updates here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {updates.map((update, i) => (
            <motion.div
              key={update.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl p-5 flex items-center gap-4"
            >
              {statusIcon[update.status]}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-semibold">{update.model_type?.replace("_", " ")}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusColor[update.status]}`}>
                    {update.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {update.accuracy && <span>Accuracy: {(update.accuracy * 100).toFixed(1)}%</span>}
                  {update.training_samples && <span>Samples: {update.training_samples}</span>}
                  {update.round_number && <span>Round: {update.round_number}</span>}
                  {update.weights_hash && <span className="font-mono">Hash: {update.weights_hash}</span>}
                </div>
              </div>
              {update.status === "pending" && (
                <Button
                  size="sm"
                  onClick={() => handleSend(update)}
                  disabled={sending === update.id}
                  className="gap-2 shrink-0"
                >
                  {sending === update.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                  Send
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
