import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { fetchHospitalDataHistory } from '@/api/roleFeatureService';

export default function HospitalDataHistory() {
  const [filters, setFilters] = useState({ hospital_name: '', startDate: '', endDate: '', page: 1, limit: 25 });
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async (nextFilters = filters) => {
    setLoading(true);
    try {
      const response = await fetchHospitalDataHistory(nextFilters);
      setRows(response?.items || []);
      setPagination(response?.pagination || null);
    } catch (error) {
      console.error('Failed to load data history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = () => {
    const next = { ...filters, page: 1 };
    setFilters(next);
    load(next);
  };

  const goToPage = (page) => {
    const next = { ...filters, page };
    setFilters(next);
    load(next);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Data History</h1>
        <p className="mt-1 text-sm text-muted-foreground">View all uploaded patient records with date and hospital filters.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-4">
        <Input placeholder="Hospital name" value={filters.hospital_name} onChange={(e) => setFilters((prev) => ({ ...prev, hospital_name: e.target.value }))} />
        <Input type="date" value={filters.startDate} onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))} />
        <Input type="date" value={filters.endDate} onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))} />
        <Button onClick={applyFilters}>Apply</Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading patient history...</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                    <th className="py-2">Hospital</th>
                    <th className="py-2">Disease</th>
                    <th className="py-2">Severity</th>
                    <th className="py-2">Age</th>
                    <th className="py-2">Region</th>
                    <th className="py-2">Reported</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-b border-border/70">
                      <td className="py-2">{row.hospital_name}</td>
                      <td className="py-2 capitalize">{row.disease}</td>
                      <td className="py-2 capitalize">{row.severity}</td>
                      <td className="py-2">{row.age ?? '-'}</td>
                      <td className="py-2">{row.region || '-'}</td>
                      <td className="py-2">{row.report_date ? new Date(row.report_date).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Page {pagination?.page || 1} / {pagination?.totalPages || 1} ({pagination?.total || rows.length} records)
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={(pagination?.page || 1) <= 1} onClick={() => goToPage((pagination?.page || 1) - 1)}>
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={(pagination?.page || 1) >= (pagination?.totalPages || 1)}
                  onClick={() => goToPage((pagination?.page || 1) + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
