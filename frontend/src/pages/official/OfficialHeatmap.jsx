import { useEffect, useState } from "react";
import { dataClient } from "@/api/dataClient";
import { motion } from "framer-motion";
import { Map, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

  useEffect(() => {
    const loadPoints = async () => {
      try {
        const [patientRows, alerts, hospitals] = await Promise.all([
          dataClient.entities.PatientData.list("-report_date", 5000),
          dataClient.entities.DiseaseAlert.list("-created_date", 1000),
          dataClient.entities.Hospital.list("-created_date", 1000),
        ]);

        const hospitalCoordByName = new Map(
          hospitals
            .filter((h) => Number.isFinite(Number(h.latitude)) && Number.isFinite(Number(h.longitude)))
            .map((h) => [
              normalizeKey(h.name),
              { lat: Number(h.latitude), lng: Number(h.longitude) },
            ])
        );

        const regionCoordByName = new Map();
        for (const h of hospitals) {
          const regionKey = normalizeKey(h.region);
          const lat = Number(h.latitude);
          const lng = Number(h.longitude);
          if (!regionKey || !Number.isFinite(lat) || !Number.isFinite(lng)) continue;

          const existing = regionCoordByName.get(regionKey) || { lat: 0, lng: 0, count: 0 };
          existing.lat += lat;
          existing.lng += lng;
          existing.count += 1;
          regionCoordByName.set(regionKey, existing);
        }

        const resolveCoords = (row) => {
          const explicitLat = Number(row.latitude);
          const explicitLng = Number(row.longitude);
          if (Number.isFinite(explicitLat) && Number.isFinite(explicitLng)) {
            return { lat: explicitLat, lng: explicitLng };
          }

          const byHospital = hospitalCoordByName.get(normalizeKey(row.hospital_name));
          if (byHospital) {
            return byHospital;
          }

          const regionKey = normalizeKey(row.region);
          const regionAgg = regionCoordByName.get(regionKey);
          if (regionAgg && regionAgg.count > 0) {
            return {
              lat: regionAgg.lat / regionAgg.count,
              lng: regionAgg.lng / regionAgg.count,
            };
          }

          const fallback = fallbackRegionCoords[regionKey];
          if (fallback) {
            return fallback;
          }

          return null;
        };

        const patientPoints = patientRows
          .map((row) => {
            const coords = resolveCoords(row);
            if (!coords) return null;

            return {
              lat: coords.lat,
              lng: coords.lng,
              region: row.region || "Unknown",
              disease: normalizeDisease(row.disease || "unknown"),
              cases: 1,
              severity: normalizeSeverity(row.severity),
              label: row.hospital_name || row.region || "Unknown",
            };
          })
          .filter(Boolean);

        const alertPoints = alerts
          .filter((a) => Number.isFinite(Number(a.latitude)) && Number.isFinite(Number(a.longitude)))
          .map((a) => ({
            lat: Number(a.latitude),
            lng: Number(a.longitude),
            region: a.region || "Unknown",
            disease: normalizeDisease(a.disease || "unknown"),
            cases: Number(a.case_count ?? 1),
            severity: normalizeSeverity(a.severity),
            label: a.title || a.region || "Alert",
          }));

        const mapped = [...patientPoints, ...alertPoints];

        setPoints(mapped);
      } catch (error) {
        console.error("Failed to load heatmap points:", error);
        setPoints([]);
      }
    };

    loadPoints();
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
