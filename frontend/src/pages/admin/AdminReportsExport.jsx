import { useEffect, useState } from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchAdminReportAnalytics, downloadAdminReport } from '@/api/roleFeatureService';

export default function AdminReportsExport() {
  const [filters, setFilters] = useState({ startDate: '', endDate: '' });
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminReportAnalytics(filters);
      setSummary(data);
    } catch (error) {
      console.error('Failed to load report summary:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownload = async (format) => {
    setDownloading(format);
    try {
      await downloadAdminReport(format, filters);
    } catch (error) {
      console.error(`Failed to download ${format}:`, error);
    } finally {
      setDownloading('');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports & Export</h1>
        <p className="mt-1 text-sm text-muted-foreground">Generate analytics snapshots and export as CSV or PDF.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-card p-5 sm:grid-cols-3">
        <Input type="date" value={filters.startDate} onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))} />
        <Input type="date" value={filters.endDate} onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))} />
        <Button onClick={load} disabled={loading}>{loading ? 'Loading...' : 'Apply Filters'}</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Hospitals</p><p className="mt-1 text-lg font-semibold">{summary?.totals?.hospitals ?? '-'}</p></div>
        <div className="rounded-xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Patient Records</p><p className="mt-1 text-lg font-semibold">{summary?.totals?.patientRecords ?? '-'}</p></div>
        <div className="rounded-xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Total Alerts</p><p className="mt-1 text-lg font-semibold">{summary?.totals?.alerts ?? '-'}</p></div>
        <div className="rounded-xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Active Alerts</p><p className="mt-1 text-lg font-semibold">{summary?.totals?.activeAlerts ?? '-'}</p></div>
        <div className="rounded-xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Predictions</p><p className="mt-1 text-lg font-semibold">{summary?.totals?.predictions ?? '-'}</p></div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">Export</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <Button onClick={() => handleDownload('csv')} disabled={downloading !== ''} className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            {downloading === 'csv' ? 'Exporting CSV...' : 'Download CSV'}
          </Button>
          <Button onClick={() => handleDownload('pdf')} disabled={downloading !== ''} variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            {downloading === 'pdf' ? 'Exporting PDF...' : 'Download PDF'}
          </Button>
          <Button onClick={() => handleDownload('csv')} disabled={downloading !== ''} variant="ghost" className="gap-2">
            <Download className="h-4 w-4" />
            Quick Export
          </Button>
        </div>
      </div>
    </div>
  );
}
