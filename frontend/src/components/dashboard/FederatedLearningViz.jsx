// @ts-nocheck
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Building2, Server, ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const hospitals = [
  { name: "Hospital A", accuracy: 0, status: "idle" },
  { name: "Hospital B", accuracy: 0, status: "idle" },
  { name: "Hospital C", accuracy: 0, status: "idle" },
  { name: "Hospital D", accuracy: 0, status: "idle" },
];

export default function FederatedLearningViz({ onComplete }) {
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState("idle"); // idle, training, sending, aggregating, complete
  const [nodes, setNodes] = useState(hospitals);
  const [globalAccuracy, setGlobalAccuracy] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const simulateRound = async () => {
    setIsRunning(true);
    setRound((r) => r + 1);

    // Phase 1: Local training
    setPhase("training");
    setNodes((prev) =>
      prev.map((n) => ({ ...n, status: "training" }))
    );
    await sleep(2000);

    // Update accuracies
    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        accuracy: Math.min(0.99, (globalAccuracy || 0.5) + Math.random() * 0.15),
        status: "trained",
      }))
    );
    await sleep(800);

    // Phase 2: Sending updates
    setPhase("sending");
    setNodes((prev) =>
      prev.map((n) => ({ ...n, status: "sending" }))
    );
    await sleep(1500);

    // Phase 3: Aggregation
    setPhase("aggregating");
    setNodes((prev) =>
      prev.map((n) => ({ ...n, status: "aggregated" }))
    );
    await sleep(1500);

    // Update global
    const newGlobal = Math.min(0.98, (globalAccuracy || 0.5) + 0.05 + Math.random() * 0.05);
    setGlobalAccuracy(newGlobal);

    setPhase("complete");
    setNodes((prev) =>
      prev.map((n) => ({ ...n, status: "idle" }))
    );
    setIsRunning(false);

    if (onComplete) onComplete(round + 1, newGlobal);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Federated Learning Simulation</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Round {round} • Global Accuracy: {(globalAccuracy * 100).toFixed(1)}%
          </p>
        </div>
        <Button
          onClick={simulateRound}
          disabled={isRunning}
          size="sm"
          className="gap-2"
        >
          {isRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Brain className="w-3 h-3" />}
          {isRunning ? "Running..." : "Run Round"}
        </Button>
      </div>

      {/* Global Model */}
      <div className="flex justify-center">
        <motion.div
          animate={{ scale: phase === "aggregating" ? 1.1 : 1 }}
          className="w-24 h-24 rounded-2xl bg-primary/10 border-2 border-primary/30 flex flex-col items-center justify-center"
        >
          <Server className="w-6 h-6 text-primary mb-1" />
          <span className="text-[10px] font-bold text-primary">Global Model</span>
          <span className="text-[10px] font-mono text-muted-foreground">
            {(globalAccuracy * 100).toFixed(1)}%
          </span>
        </motion.div>
      </div>

      {/* Connection lines visual */}
      <div className="flex justify-center">
        <AnimatePresence>
          {(phase === "sending" || phase === "aggregating") && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ y: phase === "sending" ? [-3, 3] : [3, -3] }}
                  transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.3, delay: i * 0.1 }}
                  className="w-1.5 h-1.5 rounded-full bg-primary"
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hospital nodes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {nodes.map((node, i) => (
          <motion.div
            key={i}
            animate={{
              borderColor: node.status === "training"
                ? "hsl(174, 72%, 40%)"
                : node.status === "sending"
                ? "hsl(262, 60%, 55%)"
                : "hsl(220, 15%, 88%)",
            }}
            className="border-2 rounded-xl p-3 text-center space-y-2 transition-colors"
          >
            <Building2 className="w-5 h-5 mx-auto text-muted-foreground" />
            <p className="text-xs font-semibold">{node.name}</p>
            <div className="space-y-1">
              <p className="text-[10px] font-mono text-muted-foreground">
                Acc: {(node.accuracy * 100).toFixed(1)}%
              </p>
              <div className="flex justify-center">
                {node.status === "training" && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                {node.status === "trained" && <Check className="w-3 h-3 text-success" />}
                {node.status === "sending" && <ArrowRight className="w-3 h-3 text-accent animate-pulse" />}
                {node.status === "aggregated" && <Check className="w-3 h-3 text-primary" />}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Progress */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>Training Progress</span>
          <span>{phase === "idle" ? "Ready" : phase}</span>
        </div>
        <Progress
          value={
            phase === "idle" ? 0 :
            phase === "training" ? 30 :
            phase === "sending" ? 60 :
            phase === "aggregating" ? 85 :
            100
          }
          className="h-1.5"
        />
      </div>
    </div>
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
