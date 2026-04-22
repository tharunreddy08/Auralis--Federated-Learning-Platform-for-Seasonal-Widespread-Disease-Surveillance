import { motion } from "framer-motion";

export default function DashboardHero({ title, description, badge, items = [] }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel relative overflow-hidden rounded-2xl p-6"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-12 -top-16 h-44 w-44 rounded-full bg-primary/15 blur-2xl" />
        <div className="absolute -bottom-20 right-2 h-40 w-40 rounded-full bg-accent/10 blur-2xl" />
      </div>

      <div className="relative z-10">
        {badge && (
          <div className="mb-3 inline-flex items-center rounded-full border border-border bg-background/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {badge}
          </div>
        )}
        <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>

        {items.length > 0 && (
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="rounded-xl border border-border/80 bg-background/70 px-3 py-2.5"
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {Icon ? <Icon className="h-3.5 w-3.5 text-primary" /> : null}
                    <span>{item.label}</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold">{item.value}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.section>
  );
}