import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

const COLORS = [
  "hsl(174, 72%, 40%)",
  "hsl(262, 60%, 55%)",
  "hsl(36, 90%, 55%)",
  "hsl(0, 72%, 55%)",
  "hsl(142, 60%, 45%)",
  "hsl(200, 70%, 50%)",
  "hsl(320, 60%, 50%)",
  "hsl(80, 60%, 45%)",
];

export default function DiseaseChart({ data, type = "area", title, subtitle }) {
  return (
    <div className="glass-panel rounded-xl p-5">
      <div className="mb-5">
        <h3 className="text-sm font-semibold">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {type === "area" ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="gradPrimary" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(174, 72%, 40%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(174, 72%, 40%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" strokeOpacity={0.5} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(220, 10%, 45%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(220, 10%, 45%)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(220, 15%, 88%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Area type="monotone" dataKey="cases" stroke="hsl(174, 72%, 40%)" fill="url(#gradPrimary)" strokeWidth={2} />
            </AreaChart>
          ) : type === "bar" ? (
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 44 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 88%)" strokeOpacity={0.5} />
              <XAxis
                dataKey="name"
                interval={0}
                minTickGap={0}
                tickMargin={10}
                angle={-20}
                textAnchor="end"
                height={58}
                tick={{ fontSize: 11 }}
                stroke="hsl(220, 10%, 45%)"
              />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(220, 10%, 45%)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(220, 15%, 88%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="cases" radius={[6, 6, 0, 0]}>
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={3}>
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(220, 15%, 88%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
      {type === "pie" && data?.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
          {data.map((entry, index) => (
            <div key={`${entry.name}-${index}`} className="flex items-center gap-2 rounded-md border border-border/60 bg-background/40 px-2 py-1.5">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="truncate text-muted-foreground">{entry.name || `Item ${index + 1}`}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
