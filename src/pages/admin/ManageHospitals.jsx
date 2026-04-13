import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Building2, Plus, Search, MoreHorizontal, MapPin, Mail, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function ManageHospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", code: "", location: "", latitude: 0, longitude: 0, status: "active", region: "", contact_email: "" });

  useEffect(() => { loadHospitals(); }, []);

  const loadHospitals = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Hospital.list("-created_date", 50);
      setHospitals(data);
    } catch (error) {
      console.error("Failed to load hospitals:", error);
      setHospitals([]);
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    await base44.entities.Hospital.create(form);
    setDialogOpen(false);
    setForm({ name: "", code: "", location: "", latitude: 0, longitude: 0, status: "active", region: "", contact_email: "" });
    loadHospitals();
  };

  const handleStatusChange = async (hospital, newStatus) => {
    if (hospital.id) {
      await base44.entities.Hospital.update(hospital.id, { status: newStatus });
      loadHospitals();
    }
  };

  const filtered = hospitals.filter((h) =>
    h.name?.toLowerCase().includes(search.toLowerCase()) ||
    h.location?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = {
    active: "bg-success/15 text-success",
    inactive: "bg-muted text-muted-foreground",
    suspended: "bg-destructive/15 text-destructive",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage Hospitals</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} hospitals registered</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Add Hospital
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register New Hospital</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hospital Name</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="City General Hospital" />
                </div>
                <div className="space-y-2">
                  <Label>Code</Label>
                  <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="CGH-001" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="New Delhi" />
                </div>
                <div className="space-y-2">
                  <Label>Region</Label>
                  <Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="North Region" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Latitude</Label>
                  <Input type="number" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: parseFloat(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Longitude</Label>
                  <Input type="number" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: parseFloat(e.target.value) })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Contact Email</Label>
                <Input value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} placeholder="admin@hospital.org" />
              </div>
              <Button onClick={handleCreate} className="w-full">Register Hospital</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search hospitals..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Hospital Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((hospital, i) => (
          <motion.div
            key={hospital.id || i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-xl p-5 hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-accent" />
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusColor[hospital.status]}`}>
                {hospital.status}
              </span>
            </div>
            <h3 className="font-semibold text-sm mb-1">{hospital.name}</h3>
            <p className="text-xs text-muted-foreground font-mono mb-3">{hospital.code}</p>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3" /> {hospital.location}
              </div>
              {hospital.contact_email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3 h-3" /> {hospital.contact_email}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Activity className="w-3 h-3" /> {hospital.total_patients || 0} patients reported
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}