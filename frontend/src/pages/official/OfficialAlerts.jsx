import { useState, useEffect } from "react";
import { fetchDiseaseAlertEntities, updateDiseaseAlertEntity } from "@/api/diseaseAlertService";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AlertsList from "../../components/dashboard/AlertsList";

export default function OfficialAlerts() {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [resolutionNote, setResolutionNote] = useState("");
  const [adminMessage, setAdminMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const data = await fetchDiseaseAlertEntities();
      setAlerts(data);
    } catch (error) {
      console.error("Failed to load official alerts:", error);
      setAlerts([]);
    }
  };

  const openResolveDialog = (alert) => {
    setSelectedAlert(alert);
    setResolutionNote("");
    setAdminMessage("Issue solved by health official and alert resolved.");
    setDialogOpen(true);
  };

  const handleMarkSolved = async () => {
    if (!selectedAlert?.id) {
      return;
    }

    if (!adminMessage.trim()) {
      toast({
        title: "Message required",
        description: "Please enter a message for admin.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      await updateDiseaseAlertEntity(selectedAlert.id, {
        status: "resolved",
        resolved_by: "Health Official",
        resolved_at: new Date().toISOString(),
        resolution_note: resolutionNote.trim(),
        admin_message: adminMessage.trim()
      });

      toast({
        title: "Alert marked as solved",
        description: "Admin will now see the solved message for this alert."
      });

      setDialogOpen(false);
      setSelectedAlert(null);
      setResolutionNote("");
      setAdminMessage("");
      await loadAlerts();
    } catch (error) {
      console.error("Failed to resolve alert:", error);
      toast({
        title: "Update failed",
        description: error?.message || "Unable to mark alert as solved.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = filter === "all" ? alerts : alerts.filter(a => a.status === filter);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">Disease Alerts</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor and track active disease alerts</p>
      </motion.div>

      <div className="flex gap-2 flex-wrap">
        {["all", "active", "monitoring", "resolved"].map(s => (
          <Button
            key={s}
            variant={filter === s ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(s)}
            className="capitalize text-xs"
          >
            {s}
          </Button>
        ))}
      </div>

      <AlertsList
        alerts={filtered}
        showResolutionDetails
        renderActions={(alert) => {
          if (alert.status === "resolved") {
            return (
              <span className="text-xs font-medium text-success">Solved</span>
            );
          }

          return (
            <div className="flex items-center gap-2">
              <Button asChild size="sm" variant="outline">
                <Link to={`/official/alerts/${alert.id || alert._id}`}>Details</Link>
              </Button>
              <Button size="sm" onClick={() => openResolveDialog(alert)}>
                Mark Solved
              </Button>
            </div>
          );
        }}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Alert</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {selectedAlert?.title || "Selected alert"}
            </p>
            <div className="space-y-2">
              <Label>Message to Admin</Label>
              <Textarea
                value={adminMessage}
                onChange={(e) => setAdminMessage(e.target.value)}
                placeholder="Issue solved and actions completed..."
              />
            </div>
            <div className="space-y-2">
              <Label>Resolution Note (optional)</Label>
              <Textarea
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="Additional details for record..."
              />
            </div>
            <Button className="w-full" onClick={handleMarkSolved} disabled={submitting}>
              {submitting ? "Saving..." : "Save as Solved"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
