import { useState, useEffect } from "react";
import { fetchDiseaseAlertEntities, createDiseaseAlertEntity } from "@/api/diseaseAlertService";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import AlertsList from "../../components/dashboard/AlertsList";
import { motion } from "framer-motion";

export default function AdminAlerts() {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState([]);
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "", disease: "influenza", severity: "medium", region: "", description: "", case_count: 0, status: "active"
  });

  useEffect(() => { loadAlerts(); }, []);

  const loadAlerts = async () => {
    try {
      const data = await fetchDiseaseAlertEntities();
      setAlerts(data);
    } catch (error) {
      console.error('Failed to load alerts:', error);
      setAlerts([]);
    }
  };

  const handleCreate = async () => {
    if (!form.title.trim() || !form.region.trim()) {
      toast({
        title: "Missing required fields",
        description: "Please enter both Title and Region.",
        variant: "destructive"
      });
      return;
    }

    if ((Number(form.case_count) || 0) < 0) {
      toast({
        title: "Invalid case count",
        description: "Case Count cannot be negative.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      await createDiseaseAlertEntity({
        ...form,
        title: form.title.trim(),
        region: form.region.trim(),
        description: form.description.trim(),
        case_count: Number(form.case_count) || 0
      });

      toast({
        title: "Alert created",
        description: "Disease alert created successfully."
      });

      setDialogOpen(false);
      setForm({ title: "", disease: "influenza", severity: "medium", region: "", description: "", case_count: 0, status: "active" });
      loadAlerts();
    } catch (error) {
      console.error("Failed to create alert:", error);
      toast({
        title: "Create alert failed",
        description: error?.message || "Unable to create alert. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = filterSeverity === "all" ? alerts : alerts.filter(a => a.severity === filterSeverity);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold tracking-tight">Disease Alerts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {alerts.filter(a => a.status === "active").length} active alerts • {alerts.filter(a => a.status === "resolved").length} solved updates
          </p>
        </motion.div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Create Alert</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Disease Alert</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Alert title..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Disease</Label>
                  <Select value={form.disease} onValueChange={(v) => setForm({ ...form, disease: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["influenza","dengue","malaria","covid19","cholera","tuberculosis","typhoid","hepatitis"].map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Severity</Label>
                  <Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["low","medium","high","critical"].map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Region</Label>
                  <Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="Region" />
                </div>
                <div className="space-y-2">
                  <Label>Case Count</Label>
                  <Input type="number" value={form.case_count} onChange={(e) => setForm({ ...form, case_count: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Alert details..." />
              </div>
              <Button onClick={handleCreate} className="w-full" disabled={submitting}>
                {submitting ? "Creating..." : "Create Alert"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {["all", "critical", "high", "medium", "low"].map(s => (
          <Button
            key={s}
            variant={filterSeverity === s ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterSeverity(s)}
            className="capitalize text-xs"
          >
            {s}
          </Button>
        ))}
      </div>

      <AlertsList alerts={filtered} showResolutionDetails />
    </div>
  );
}
