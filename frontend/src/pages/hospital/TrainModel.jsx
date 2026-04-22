import { useState } from "react";
import { dataClient } from "@/api/dataClient";
import { Brain, Play, CheckCircle, Loader2, Zap, Database, Target, Zap as ZapIcon, TrendingUp, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

const RANDOM_FOREST_MODEL = {
  value: "random_forest",
  label: "Random Forest",
  desc: "Ensemble method, handles non-linear patterns"
};

export default function TrainModel() {
  const { toast } = useToast();
  const [modelType] = useState(RANDOM_FOREST_MODEL.value);
  const [phase, setPhase] = useState("idle"); // idle, loading, preprocessing, training, evaluating, complete
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);

  const simulateTraining = async () => {
    setPhase("loading");
    setProgress(0);
    setResults(null);

    // Simulate: loading data
    await sleep(1200);
    setPhase("preprocessing");
    setProgress(20);

    await sleep(1500);
    setProgress(40);
    setPhase("training");

    // Simulate training iterations
    for (let i = 40; i <= 85; i += 5) {
      await sleep(400);
      setProgress(i);
    }

    setPhase("evaluating");
    setProgress(90);
    await sleep(1000);

    const accuracy = 0.85 + Math.random() * 0.12;
    const loss = 1 - accuracy + Math.random() * 0.05;

    setResults({
      accuracy: accuracy,
      loss: loss,
      training_samples: Math.floor(200 + Math.random() * 300),
      precision: accuracy - 0.02 + Math.random() * 0.04,
      recall: accuracy - 0.03 + Math.random() * 0.06,
      f1: accuracy - 0.01 + Math.random() * 0.03,
    });

    setProgress(100);
    setPhase("complete");

    // Save to DB
    await dataClient.entities.ModelUpdate.create({
      hospital_name: "Current Hospital",
      model_type: modelType,
      accuracy: accuracy,
      loss: loss,
      training_samples: Math.floor(200 + Math.random() * 300),
      round_number: Math.floor(Math.random() * 10) + 1,
      status: "pending",
      weights_hash: Math.random().toString(36).substring(2, 10),
    });

    toast({ title: "Training Complete", description: `Model accuracy: ${(accuracy * 100).toFixed(1)}%` });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">Train Local Model</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Train a model on your hospital's data for federated aggregation
        </p>
      </motion.div>

      {/* Model Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <Brain className="w-5 h-5 text-primary" />
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">ACTIVE</span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Model Type</p>
            <p className="text-lg font-bold mt-1">{RANDOM_FOREST_MODEL.label}</p>
          </div>
          <p className="text-xs text-muted-foreground">{RANDOM_FOREST_MODEL.desc}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card border border-border rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <Database className="w-5 h-5 text-accent" />
            <span className="text-xs font-semibold text-accent bg-accent/10 px-2 py-1 rounded">NEW</span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Training Data</p>
            <p className="text-lg font-bold mt-1">Your Hospital</p>
          </div>
          <p className="text-xs text-muted-foreground">Patient records + historical diagnoses</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <TrendingUp className="w-5 h-5 text-success" />
            <span className="text-xs font-semibold text-success bg-success/10 px-2 py-1 rounded">~6 MIN</span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Duration</p>
            <p className="text-lg font-bold mt-1">Quick Train</p>
          </div>
          <p className="text-xs text-muted-foreground">Data load → Train → Evaluate</p>
        </motion.div>
      </div>

      {/* Start Training Button */}
      <div className="bg-card border border-border rounded-xl p-6">
        <Button
          onClick={simulateTraining}
          disabled={phase !== "idle" && phase !== "complete"}
          className="w-full gap-2"
          size="lg"
        >
          {phase === "idle" || phase === "complete" ? (
            <>
              <Play className="w-4 h-4" /> Start Training
            </>
          ) : (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Training in Progress...
            </>
          )}
        </Button>
      </div>

      {/* Training Progress */}
      <AnimatePresence>
        {phase !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Training Progress</h3>
              <span className="text-xs font-mono text-muted-foreground capitalize">{phase}</span>
            </div>
            <Progress value={progress} className="h-2" />

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Data Loading", icon: Database, active: phase === "loading" || phase === "preprocessing", done: ["training", "evaluating", "complete"].includes(phase) },
                { label: "Training", icon: Brain, active: phase === "training", done: ["evaluating", "complete"].includes(phase) },
                { label: "Evaluation", icon: Target, active: phase === "evaluating", done: phase === "complete" },
              ].map((step, i) => {
                const StepIcon = step.icon;
                return (
                  <div
                    key={i}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg text-center transition-all ${
                      step.done ? "bg-success/10" : step.active ? "bg-primary/10" : "bg-muted/50"
                    }`}
                  >
                    {step.done ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : step.active ? (
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    ) : (
                      <StepIcon className="w-5 h-5 text-muted-foreground" />
                    )}
                    <span className="text-[10px] font-medium">{step.label}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-6 space-y-4"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-warning" />
              <h3 className="text-sm font-semibold">Training Results</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: "Accuracy", value: `${(results.accuracy * 100).toFixed(2)}%` },
                { label: "Loss", value: results.loss.toFixed(4) },
                { label: "Samples", value: results.training_samples },
                { label: "Precision", value: `${(results.precision * 100).toFixed(2)}%` },
                { label: "Recall", value: `${(results.recall * 100).toFixed(2)}%` },
                { label: "F1 Score", value: `${(results.f1 * 100).toFixed(2)}%` },
              ].map((metric, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/50">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{metric.label}</p>
                  <p className="text-lg font-bold font-mono">{metric.value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
