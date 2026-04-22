import { useEffect, useState } from "react";
import { fetchOfficialHeatmapRisk } from "@/api/roleFeatureService";
import { motion } from "framer-motion";
import { Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import HeatmapView from "../../components/dashboard/HeatmapView";

const diseases = ["all", "influenza", "dengue", "malaria", "covid19", "cholera", "tuberculosis", "typhoid", "hepatitis"];
const severities = ["all", "low", "medium", "high", "critical"];

const fallbackRegionCoords = {
  southwest: { lat: 6.5244, lng: 3.3792 },
  southsouth: { lat: 4.8156, lng: 7.0498 },
  "south-south": { lat: 4.8156, lng: 7.0498 },
  southeast: { lat: 6.4584, lng: 7.5464 },
  "north-central": { lat: 9.0765, lng: 7.3986 },
  northcentral: { lat: 9.0765, lng: 7.3986 },
  north: { lat: 12.0022, lng: 8.5919 },
  northwest: { lat: 12.0000, lng: 8.5200 },
  northeast: { lat: 11.8333, lng: 13.1500 },
  lagos: { lat: 6.5244, lng: 3.3792 },
  abuja: { lat: 9.0765, lng: 7.3986 },
  kano: { lat: 12.0022, lng: 8.5919 },
  "port harcourt": { lat: 4.8156, lng: 7.0498 },
};

const normalizeKey = (value) => String(value || "").trim().toLowerCase();

const normalizeDisease = (value) => normalizeKey(value).replace(/[^a-z0-9]/g, "");

const normalizeSeverity = (value) => {
  const raw = normalizeKey(value);
  if (raw === "mild") return "low";
  if (raw === "moderate") return "medium";
  if (raw === "severe") return "high";
  if (raw === "critical") return "critical";
  if (raw === "low" || raw === "medium" || raw === "high") return raw;
  return "medium";
};

export default function OfficialHeatmap() {
  const [points, setPoints] = useState([]);
  const [diseaseFilter, setDiseaseFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [filters, setFilters] = useState({ region: "", startDate: "", endDate: "" });

  const loadPoints = async (nextFilters = filters) => {
    try {
      const response = await fetchOfficialHeatmapRisk(nextFilters);
      const mapped = (response?.items || [])
        .map((item) => {
          const regionKey = normalizeKey(item.region);
          const fallback = fallbackRegionCoords[regionKey] || null;
          const lat = Number(item.latitude);
          const lng = Number(item.longitude);
          const coords = Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : fallback;
          if (!coords) {
            return null;
          }

          return {
            lat: coords.lat,
            lng: coords.lng,
            region: item.region,
            disease: normalizeDisease(item.disease),
            cases: item.cases,
            severity: normalizeSeverity(item.riskLevel),
            label: item.region,
          };
        })
        .filter(Boolean);

      setPoints(mapped);
    } catch (error) {
      console.error("Failed to load heatmap points:", error);
      setPoints([]);
    }
  };

  useEffect(() => {
    loadPoints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = points.filter((p) => {
    if (diseaseFilter !== "all" && normalizeDisease(p.disease) !== diseaseFilter) return false;
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
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-3 lg:grid-cols-5">
        <Input placeholder="Region" value={filters.region} onChange={(e) => setFilters((prev) => ({ ...prev, region: e.target.value }))} />
        <Input type="date" value={filters.startDate} onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))} />
        <Input type="date" value={filters.endDate} onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))} />
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
          onClick={() => {
            setDiseaseFilter("all");
            setSeverityFilter("all");
            setFilters({ region: "", startDate: "", endDate: "" });
            loadPoints({ region: "", startDate: "", endDate: "" });
          }}
        >
          Reset Filters
        </Button>
        <Button size="sm" onClick={() => loadPoints()}>
          Apply
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
