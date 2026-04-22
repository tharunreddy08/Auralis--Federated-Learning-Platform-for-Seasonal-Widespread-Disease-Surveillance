import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  ShieldCheck,
  Brain,
  Building2,
  Map,
  ArrowRight,
  Sparkles,
  Lock,
  Radar,
  HeartPulse,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

const capabilities = [
  {
    title: "Federated Learning",
    description: "Train models collaboratively across hospitals without moving patient-level records.",
    icon: Brain,
  },
  {
    title: "Outbreak Intelligence",
    description: "Track active alerts, severity trends, and regional spread with live analytics.",
    icon: Map,
  },
  {
    title: "Policy-Ready Operations",
    description: "Coordinate officials, hospitals, and admins from a unified response dashboard.",
    icon: ShieldCheck,
  },
];

const roles = [
  {
    name: "Hospital",
    details: "Upload data, train local models, and contribute secure updates.",
    icon: Building2,
  },
  {
    name: "Admin",
    details: "Manage hospitals, monitor outbreaks, and govern model updates.",
    icon: ShieldCheck,
  },
  {
    name: "Health Official",
    details: "Review heatmaps, alerts, and response-level analytics in real time.",
    icon: Activity,
  },
];

const metrics = [
  { label: "Hospitals Connected", value: "48+", icon: Building2 },
  { label: "Alerts Monitored", value: "24/7", icon: Radar },
  { label: "Privacy Exposure", value: "0 Raw Records", icon: HeartPulse },
];

export default function Landing() {
  return (
    <div className="aurora-surface relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="animate-float-gentle absolute -top-24 -left-20 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="animate-float-gentle absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-accent/15 blur-3xl" style={{ animationDelay: "1.3s" }} />
      </div>

      <header className="relative z-10 border-b border-border/50 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight">Auralis</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Disease Surveillance
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild size="sm" variant="outline">
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-16 pt-12 sm:pt-16">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2"
        >
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Privacy-first outbreak intelligence platform
            </div>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
              Build national disease awareness without exposing patient data.
            </h1>
            <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
              Auralis combines secure federated learning, live surveillance dashboards, and coordinated
              role-based workflows for hospitals, officials, and administrators.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button asChild className="gap-2 shadow-lg shadow-primary/30">
                  <Link to="/login">
                    Enter Platform
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button asChild variant="secondary" className="border border-border">
                  <Link to="/login">Use Demo Credentials</Link>
                </Button>
              </motion.div>
            </div>
            <div className="flex flex-wrap items-center gap-5 pt-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-success" />
                End-to-end secure collaboration
              </div>
              <div className="flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-primary" />
                Real-time surveillance updates
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-6 shadow-2xl shadow-black/10">
            <p className="mb-4 text-sm font-semibold tracking-wide text-muted-foreground">Platform roles</p>
            <div className="space-y-3">
              {roles.map((role, idx) => {
                const Icon = role.icon;
                return (
                  <motion.div
                    key={role.name}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ y: -3, scale: 1.01 }}
                    transition={{ delay: 0.08 * idx + 0.2 }}
                    className="rounded-2xl border border-border/80 bg-background/70 p-4 transition-shadow hover:shadow-lg hover:shadow-primary/10"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{role.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{role.details}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.section>

        <section className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {metrics.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <motion.article
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * idx + 0.2 }}
                whileHover={{ y: -4 }}
                className="glass-panel rounded-2xl p-5"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <p className="text-2xl font-extrabold tracking-tight">{metric.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{metric.label}</p>
              </motion.article>
            );
          })}
        </section>

        <section className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          {capabilities.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5, scale: 1.01 }}
                transition={{ delay: 0.08 * idx + 0.25 }}
                className="glass-panel rounded-2xl p-5 transition-shadow hover:shadow-xl hover:shadow-primary/10"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-base font-bold">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </motion.article>
            );
          })}
        </section>
      </main>
    </div>
  );
}
