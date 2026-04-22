import { useEffect, useState } from 'react';
import { Activity, Gauge, Target, TrendingUp } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import DiseaseChart from '@/components/dashboard/DiseaseChart';
import { fetchAdminModelPerformance } from '@/api/roleFeatureService';

export default function AdminModelPerformance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetchAdminModelPerformance();
        setData(response);
      } catch (error) {
        console.error('Failed to load admin model performance:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const trend = (data?.recentModels || [])
    .slice()
    .reverse()
    .map((row, index) => ({
      name: `#${row.round_number || index + 1}`,
      cases: Number((row.accuracy || 0) * 100)
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Model Performance</h1>
        <p className="mt-1 text-sm text-muted-foreground">National model quality indicators and recent training rounds.</p>
      </div>

      {loading ? (
        <div className="rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">Loading model metrics...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard title="Accuracy" value={`${((data?.modelMetrics?.accuracy || 0) * 100).toFixed(1)}%`} icon={Gauge} color="primary" />
            <StatCard title="Precision" value={`${((data?.modelMetrics?.precision || 0) * 100).toFixed(1)}%`} icon={Target} color="accent" />
            <StatCard title="Recall" value={`${((data?.modelMetrics?.recall || 0) * 100).toFixed(1)}%`} icon={Activity} color="success" />
            <StatCard title="F1 Score" value={`${((data?.modelMetrics?.f1Score || 0) * 100).toFixed(1)}%`} icon={TrendingUp} color="warning" />
            <StatCard title="Loss" value={(data?.modelMetrics?.loss || 0).toFixed(3)} icon={Activity} color="destructive" />
          </div>

          <DiseaseChart
            data={trend.length > 0 ? trend : [{ name: 'No data', cases: 0 }]}
            type="area"
            title="Recent Training Accuracy"
            subtitle="Accuracy percentage by recent model rounds"
          />

          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">Recent Rounds</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                    <th className="py-2">Hospital</th>
                    <th className="py-2">Model</th>
                    <th className="py-2">Round</th>
                    <th className="py-2">Accuracy</th>
                    <th className="py-2">Loss</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.recentModels || []).map((row) => (
                    <tr key={row._id} className="border-b border-border/70">
                      <td className="py-2">{row.hospital_name}</td>
                      <td className="py-2 capitalize">{String(row.model_type || '').replaceAll('_', ' ')}</td>
                      <td className="py-2">{row.round_number || '-'}</td>
                      <td className="py-2">{((row.accuracy || 0) * 100).toFixed(1)}%</td>
                      <td className="py-2">{Number(row.loss || 0).toFixed(3)}</td>
                      <td className="py-2 capitalize">{row.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
