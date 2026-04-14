import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Building2, Eye, Activity, ArrowRight, Globe } from "lucide-react";

const roles = [
  {
    id: "admin",
    title: "Government Admin",
    description: "Manage hospitals, view nationwide analytics, configure federated learning, and monitor disease outbreaks.",
    icon: Shield,
    path: "/admin",
    gradient: "from-primary/20 to-primary/5",
    borderColor: "hover:border-primary/40",
    iconColor: "text-primary",
  },
  {
    id: "hospital",
    title: "Hospital Portal",
    description: "Upload patient data, train local ML models, and contribute to federated disease surveillance.",
    icon: Building2,
    path: "/hospital",
    gradient: "from-accent/20 to-accent/5",
    borderColor: "hover:border-accent/40",
    iconColor: "text-accent",
  },
  {
    id: "official",
    title: "Health Official",
    description: "View disease heatmaps, monitor alerts, and access real-time analytics dashboards.",
    icon: Eye,
    path: "/official",
    gradient: "from-success/20 to-success/5",
    borderColor: "hover:border-success/40",
    iconColor: "text-success",
  },
];

export default function RoleSelection() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Auralis</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Federated Disease Surveillance
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <Globe className="w-3.5 h-3.5" />
            <span>Secure • Federated • Real-time</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Federated Learning Platform
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Seasonal & Widespread
            <br />
            <span className="text-primary">Disease Surveillance</span>
          </h2>
          <p className="text-muted-foreground mt-4 text-base leading-relaxed max-w-lg mx-auto">
            A privacy-preserving federated learning platform enabling collaborative disease
            surveillance across hospitals without sharing sensitive patient data.
          </p>
        </motion.div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
          {roles.map((role, i) => {
            const Icon = role.icon;
            return (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              >
                <Link
                  to={role.path}
                  className={`group block border border-border rounded-2xl p-6 bg-card 
                    transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${role.borderColor}`}
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${role.gradient} flex items-center justify-center mb-5`}>
                    <Icon className={`w-6 h-6 ${role.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{role.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {role.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-semibold text-primary group-hover:gap-3 transition-all">
                    <span>Enter Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Footer info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 flex flex-wrap justify-center gap-8 text-xs text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success" />
            End-to-end Encryption
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            HIPAA Compliant
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent" />
            Real-time Analytics
          </div>
        </motion.div>
      </div>
    </div>
  );
}
