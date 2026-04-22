import { motion } from "framer-motion";

export default function StatCard({ title, value, change, changeType, icon: Icon, color = "primary" }) {
  const colorMap = {
    primary: "bg-primary/15 text-primary",
    accent: "bg-accent/15 text-accent",
    destructive: "bg-destructive/15 text-destructive",
    warning: "bg-warning/15 text-warning",
    success: "bg-success/15 text-success",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="glass-panel relative overflow-hidden rounded-xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10"
    >
      <div className="pointer-events-none absolute right-0 top-0 h-20 w-20 rounded-full bg-primary/10 blur-2xl" />
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {change !== undefined && (
            <p className={`text-xs font-medium ${changeType === "up" ? "text-success" : changeType === "down" ? "text-destructive" : "text-muted-foreground"}`}>
              {changeType === "up" ? "↑" : changeType === "down" ? "↓" : "→"} {change}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
