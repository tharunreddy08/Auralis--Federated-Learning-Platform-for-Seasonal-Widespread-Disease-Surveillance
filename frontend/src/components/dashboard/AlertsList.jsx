import { AlertTriangle, CheckCircle, Clock, Info } from "lucide-react";
import { motion } from "framer-motion";

const severityConfig = {
  critical: { color: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertTriangle },
  high: { color: "bg-warning/10 text-warning border-warning/20", icon: AlertTriangle },
  medium: { color: "bg-accent/10 text-accent border-accent/20", icon: Info },
  low: { color: "bg-primary/10 text-primary border-primary/20", icon: Info },
};

const statusBadge = {
  active: "bg-destructive/15 text-destructive",
  monitoring: "bg-warning/15 text-warning",
  resolved: "bg-success/15 text-success",
};

export default function AlertsList({ alerts = [], compact = false }) {
  if (alerts.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <CheckCircle className="w-10 h-10 text-success mx-auto mb-3" />
        <p className="text-sm font-medium">No active alerts</p>
        <p className="text-xs text-muted-foreground mt-1">All systems operating normally</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {alerts.map((alert, i) => {
        const cfg = severityConfig[alert.severity] || severityConfig.low;
        const Icon = cfg.icon;
        return (
          <motion.div
            key={alert.id || i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`border rounded-xl p-4 ${cfg.color} transition-all hover:shadow-md`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-semibold truncate">{alert.title}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusBadge[alert.status] || statusBadge.active}`}>
                    {alert.status}
                  </span>
                </div>
                {!compact && (
                  <p className="text-xs opacity-80 line-clamp-2">{alert.description}</p>
                )}
                <div className="flex items-center gap-3 mt-2 text-[10px] uppercase tracking-wider opacity-60">
                  <span>{alert.disease}</span>
                  <span>•</span>
                  <span>{alert.region}</span>
                  {alert.case_count && (
                    <>
                      <span>•</span>
                      <span>{alert.case_count} cases</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
