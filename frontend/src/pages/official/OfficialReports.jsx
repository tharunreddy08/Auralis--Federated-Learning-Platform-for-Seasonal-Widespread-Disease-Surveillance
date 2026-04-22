import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import DiseaseChart from '@/components/dashboard/DiseaseChart';
import { fetchOfficialReportSummary } from '@/api/roleFeatureService';

export default function OfficialReports() {
  const [filters, setFilters] = useState({ region: '', startDate: '', endDate: '' });
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const load = async (nextFilters = filters) => {
    setLoading(true);
    try {
      const response = await fetchOfficialReportSummary(nextFilters);
      setData(response);
    } catch (error) {
      console.error('Failed to load official report summary:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Outbreak Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">Summary reports for outbreak trends and regional severity.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-4">
        <Input placeholder="Region" value={filters.region} onChange={(e) => setFilters((prev) => ({ ...prev, region: e.target.value }))} />
        <Input type="date" value={filters.startDate} onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))} />
        <Input type="date" value={filters.endDate} onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))} />
        <Button onClick={() => load()}>Apply</Button>
      </div>

      {loading ? (
        <div className="rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">Loading reports...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Total Alerts</p><p className="mt-1 text-xl font-semibold">{data?.totalAlerts ?? 0}</p></div>
            <div className="rounded-xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Total Cases</p><p className="mt-1 text-xl font-semibold">{data?.totalCases ?? 0}</p></div>
          </div>

          <DiseaseChart
            data={(data?.outbreakTrend || []).map((item) => ({ name: item.month, cases: item.cases }))}
            type="area"
            title="Outbreak Trend"
            subtitle="Monthly outbreaks by case counts"
          />

          <DiseaseChart
            data={(data?.topRegions || []).map((item) => ({ name: item.region, cases: item.cases, value: item.cases }))}
            type="bar"
            title="Top Affected Regions"
            subtitle="Regions with highest outbreaks"
          />
        </>
      )}
    </div>
  );
}
