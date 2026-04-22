import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { fetchHospitalTrainingHistory } from '@/api/roleFeatureService';

export default function HospitalTrainingHistory() {
  const [filters, setFilters] = useState({ hospital_name: '', startDate: '', endDate: '' });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async (nextFilters = filters) => {
    setLoading(true);
    try {
      const response = await fetchHospitalTrainingHistory({ ...nextFilters, limit: 100 });
      setRows(response?.items || []);
    } catch (error) {
      console.error('Failed to load training history:', error);
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
        <h1 className="text-2xl font-bold tracking-tight">Training History</h1>
        <p className="mt-1 text-sm text-muted-foreground">Review past model training rounds and their results.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-4">
        <Input placeholder="Hospital name" value={filters.hospital_name} onChange={(e) => setFilters((prev) => ({ ...prev, hospital_name: e.target.value }))} />
        <Input type="date" value={filters.startDate} onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))} />
        <Input type="date" value={filters.endDate} onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))} />
        <Button onClick={() => load()}>Apply</Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading training history...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                  <th className="py-2">Hospital</th>
                  <th className="py-2">Model</th>
                  <th className="py-2">Round</th>
                  <th className="py-2">Accuracy</th>
                  <th className="py-2">Loss</th>
                  <th className="py-2">Samples</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-border/70">
                    <td className="py-2">{row.hospital_name}</td>
                    <td className="py-2 capitalize">{String(row.model_type || '').replaceAll('_', ' ')}</td>
                    <td className="py-2">{row.round_number || '-'}</td>
                    <td className="py-2">{((row.accuracy || 0) * 100).toFixed(1)}%</td>
                    <td className="py-2">{Number(row.loss || 0).toFixed(3)}</td>
                    <td className="py-2">{row.training_samples || '-'}</td>
                    <td className="py-2 capitalize">{row.status}</td>
                    <td className="py-2">{row.created_date ? new Date(row.created_date).toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
