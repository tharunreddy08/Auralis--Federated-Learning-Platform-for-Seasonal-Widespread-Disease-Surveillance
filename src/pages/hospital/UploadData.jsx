import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, FileSpreadsheet, Plus, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

const diseases = ["influenza", "dengue", "malaria", "covid19", "cholera", "tuberculosis", "typhoid", "hepatitis"];
const severities = ["mild", "moderate", "severe", "critical"];
const genders = ["male", "female", "other"];
const outcomes = ["recovered", "under_treatment", "deceased"];

export default function UploadData() {
  const { toast } = useToast();
  const [mode, setMode] = useState("form"); // form or csv
  const [submitting, setSubmitting] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvProcessing, setCsvProcessing] = useState(false);
  const [form, setForm] = useState({
    hospital_name: "",
    disease: "influenza",
    age: "",
    gender: "male",
    symptoms: "",
    severity: "mild",
    outcome: "under_treatment",
    report_date: new Date().toISOString().split("T")[0],
    region: "",
  });

  const handleSubmit = async () => {
    setSubmitting(true);
    await base44.entities.PatientData.create({
      ...form,
      age: parseInt(form.age) || 0,
      report_date: new Date(form.report_date).toISOString(),
    });
    toast({ title: "Success", description: "Patient record uploaded successfully" });
    setForm({
      hospital_name: "",
      disease: "influenza",
      age: "",
      gender: "male",
      symptoms: "",
      severity: "mild",
      outcome: "under_treatment",
      report_date: new Date().toISOString().split("T")[0],
      region: "",
    });
    setSubmitting(false);
  };

  const handleCsvUpload = async () => {
    if (!csvFile) return;
    setCsvProcessing(true);

    const { file_url } = await base44.integrations.Core.UploadFile({ file: csvFile });

    const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url,
      json_schema: {
        type: "object",
        properties: {
          records: {
            type: "array",
            items: {
              type: "object",
              properties: {
                hospital_name: { type: "string" },
                disease: { type: "string" },
                age: { type: "number" },
                gender: { type: "string" },
                symptoms: { type: "string" },
                severity: { type: "string" },
                outcome: { type: "string" },
                report_date: { type: "string" },
                region: { type: "string" },
              },
            },
          },
        },
      },
    });

    if (result.status === "success" && result.output?.records) {
      const records = result.output.records.map((r) => ({
        ...r,
        report_date: r.report_date ? new Date(r.report_date).toISOString() : new Date().toISOString(),
      }));
      await base44.entities.PatientData.bulkCreate(records);
      toast({ title: "CSV Imported", description: `${records.length} records uploaded successfully` });
    } else {
      toast({ title: "Error", description: "Failed to process CSV file", variant: "destructive" });
    }
    setCsvFile(null);
    setCsvProcessing(false);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">Upload Patient Data</h1>
        <p className="text-sm text-muted-foreground mt-1">Submit individual records or bulk CSV upload</p>
      </motion.div>

      {/* Mode Toggle */}
      <div className="flex gap-2">
        <Button variant={mode === "form" ? "default" : "outline"} size="sm" onClick={() => setMode("form")} className="gap-2">
          <Plus className="w-3 h-3" /> Individual Entry
        </Button>
        <Button variant={mode === "csv" ? "default" : "outline"} size="sm" onClick={() => setMode("csv")} className="gap-2">
          <FileSpreadsheet className="w-3 h-3" /> CSV Upload
        </Button>
      </div>

      {mode === "form" ? (
        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Hospital Name</Label>
              <Input value={form.hospital_name} onChange={(e) => setForm({ ...form, hospital_name: e.target.value })} placeholder="City General Hospital" />
            </div>
            <div className="space-y-2">
              <Label>Region</Label>
              <Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="North Region" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Disease</Label>
              <Select value={form.disease} onValueChange={(v) => setForm({ ...form, disease: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {diseases.map(d => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Severity</Label>
              <Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {severities.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Outcome</Label>
              <Select value={form.outcome} onValueChange={(v) => setForm({ ...form, outcome: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {outcomes.map(o => <SelectItem key={o} value={o} className="capitalize">{o.replace("_", " ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Patient Age</Label>
              <Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="35" />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {genders.map(g => <SelectItem key={g} value={g} className="capitalize">{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Report Date</Label>
              <Input type="date" value={form.report_date} onChange={(e) => setForm({ ...form, report_date: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Symptoms</Label>
            <Input value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} placeholder="fever, cough, headache..." />
          </div>
          <Button onClick={handleSubmit} disabled={submitting} className="w-full gap-2">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {submitting ? "Uploading..." : "Submit Patient Record"}
          </Button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <div className="border-2 border-dashed border-border rounded-xl p-10 text-center">
            <FileSpreadsheet className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium mb-1">Upload CSV File</p>
            <p className="text-xs text-muted-foreground mb-4">
              Columns: hospital_name, disease, age, gender, symptoms, severity, outcome, report_date, region
            </p>
            <Input
              type="file"
              accept=".csv,.xlsx"
              onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
              className="max-w-xs mx-auto"
            />
          </div>
          {csvFile && (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">{csvFile.name}</span>
              <Button onClick={handleCsvUpload} disabled={csvProcessing} size="sm" className="gap-2">
                {csvProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                {csvProcessing ? "Processing..." : "Import"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}