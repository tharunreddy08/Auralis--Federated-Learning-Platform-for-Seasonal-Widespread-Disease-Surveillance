import { useEffect, useState } from 'react';
import { Gauge, Target, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import StatCard from '@/components/dashboard/StatCard';
import DiseaseChart from '@/components/dashboard/DiseaseChart';
import { fetchHospitalModelPerformance } from '@/api/roleFeatureService';

export default function HospitalModelPerformance() {
  const [hospitalName, setHospitalName] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const load = async (name = hospitalName) => {
    setLoading(true);
    try {
      const response = await fetchHospitalModelPerformance({ hospital_name: name });
      setData(response);
    } catch (error) {
      console.error('Failed to load hospital performance:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trend = (data?.trend || []).map((item, idx) => ({ name: `#${item.round || idx + 1}`, cases: Number((item.accuracy || 0) * 100) }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Model Performance</h1>
        <p className="mt-1 text-sm text-muted-foreground">Local model quality and historical trend for hospital training.</p>
      </div>

      <div className="flex gap-3 rounded-xl border border-border bg-card p-4">
        <Input placeholder="Hospital name (optional)" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} />
        <Button onClick={() => load()}>Apply</Button>
      </div>

      {loading ? (
        <div className="rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">Loading model performance...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard title="Local Accuracy" value={`${((data?.metrics?.localAccuracy || 0) * 100).toFixed(1)}%`} icon={Gauge} color="primary" />
            <StatCard title="Precision" value={`${((data?.metrics?.precision || 0) * 100).toFixed(1)}%`} icon={Target} color="accent" />
            <StatCard title="Recall" value={`${((data?.metrics?.recall || 0) * 100).toFixed(1)}%`} icon={TrendingUp} color="success" />
            <StatCard title="F1 Score" value={`${((data?.metrics?.f1Score || 0) * 100).toFixed(1)}%`} icon={TrendingUp} color="warning" />
            <StatCard title="Avg Loss" value={(data?.metrics?.avgLoss || 0).toFixed(3)} icon={Gauge} color="destructive" />
          </div>

          <DiseaseChart
            data={trend.length ? trend : [{ name: 'No data', cases: 0 }]}
            type="area"
            title="Local Accuracy Trend"
            subtitle="Recent rounds by local training runs"
          />
        </>
      )}
    </div>
  );
}
