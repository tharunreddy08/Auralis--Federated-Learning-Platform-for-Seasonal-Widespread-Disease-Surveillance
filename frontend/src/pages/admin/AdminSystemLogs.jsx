import { useEffect, useMemo, useState } from 'react';
import { fetchAdminSystemLogs } from '@/api/roleFeatureService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminSystemLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchAdminSystemLogs(100);
        setLogs(data?.items || []);
      } catch (error) {
        console.error('Failed to load logs:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filtered = useMemo(
    () =>
      logs.filter((log) => {
        if (typeFilter !== 'all' && log.type !== typeFilter) return false;
        if (levelFilter !== 'all' && log.level !== levelFilter) return false;
        return true;
      }),
    [logs, typeFilter, levelFilter]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Logs</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track training jobs, alerts, exports, and platform activity.</p>
      </div>

      <div className="flex flex-wrap gap-3 rounded-xl border border-border bg-card p-4">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Log type" /></SelectTrigger>
          <SelectContent>
            {['all', 'training', 'alert', 'activity', 'report', 'system'].map((item) => (
              <SelectItem key={item} value={item} className="capitalize">{item}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Level" /></SelectTrigger>
          <SelectContent>
            {['all', 'info', 'warning', 'error'].map((item) => (
              <SelectItem key={item} value={item} className="capitalize">{item}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading logs...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                  <th className="py-2">Time</th>
                  <th className="py-2">Type</th>
                  <th className="py-2">Level</th>
                  <th className="py-2">Source</th>
                  <th className="py-2">Message</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log, idx) => (
                  <tr key={`${log.id || idx}-${log.createdAt}`} className="border-b border-border/70">
                    <td className="py-2">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="py-2 capitalize">{log.type}</td>
                    <td className="py-2 capitalize">{log.level}</td>
                    <td className="py-2">{log.source}</td>
                    <td className="py-2">{log.message}</td>
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
