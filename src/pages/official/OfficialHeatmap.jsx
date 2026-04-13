import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Map, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import HeatmapView from "../../components/dashboard/HeatmapView";

const diseases = ["all", "influenza", "dengue", "malaria", "covid19", "cholera", "tuberculosis", "typhoid", "hepatitis"];
const severities = ["all", "low", "medium", "high", "critical"];

export default function OfficialHeatmap() {
  const [points, setPoints] = useState([]);
  const [diseaseFilter, setDiseaseFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");

  useEffect(() => {
    const loadPoints = async () => {
      try {
        const alerts = await base44.entities.DiseaseAlert.list("-created_date", 500);
        const mapped = alerts
          .filter((a) => Number.isFinite(Number(a.latitude)) && Number.isFinite(Number(a.longitude)))
          .map((a) => ({
            lat: Number(a.latitude),
            lng: Number(a.longitude),
            region: a.region || "Unknown",
            disease: a.disease || "unknown",
            cases: Number(a.case_count ?? 0),
            severity: a.severity || "medium",
          }));

        setPoints(mapped);
      } catch (error) {
        console.error("Failed to load heatmap points:", error);
        setPoints([]);
      }
    };

    loadPoints();
  }, []);

  const filtered = points.filter((p) => {
    if (diseaseFilter !== "all" && p.disease.toLowerCase() !== diseaseFilter) return false;
    if (severityFilter !== "all" && p.severity !== severityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">Disease Heatmap</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Geographic visualization of disease hotspots — {filtered.length} locations
        </p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Disease</label>
          <Select value={diseaseFilter} onValueChange={setDiseaseFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {diseases.map(d => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Severity</label>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {severities.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setDiseaseFilter("all"); setSeverityFilter("all"); }}
        >
          Reset Filters
        </Button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        {[
          { label: "Low", color: "bg-success" },
          { label: "Medium", color: "bg-accent" },
          { label: "High", color: "bg-warning" },
          { label: "Critical", color: "bg-destructive" },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-full ${item.color}`} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      <HeatmapView dataPoints={filtered} center={[22, 78]} zoom={5} />
    </div>
  );
}