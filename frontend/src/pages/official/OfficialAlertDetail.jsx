import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchOfficialAlertDetail } from '@/api/roleFeatureService';
import { Button } from '@/components/ui/button';

export default function OfficialAlertDetail() {
  const { alertId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetchOfficialAlertDetail(alertId);
        setData(response);
      } catch (error) {
        console.error('Failed to load alert detail:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [alertId]);

  const alert = data?.alert;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alert Detail</h1>
          <p className="mt-1 text-sm text-muted-foreground">Severity, context, and recommended response actions.</p>
        </div>
        <Button asChild variant="outline"><Link to="/official/alerts">Back to Alerts</Link></Button>
      </div>

      {loading ? (
        <div className="rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">Loading alert details...</div>
      ) : !alert ? (
        <div className="rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">Alert not found.</div>
      ) : (
        <>
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-lg font-semibold">{alert.title}</h2>
            <div className="mt-2 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <p><span className="text-muted-foreground">Disease:</span> <span className="capitalize">{alert.disease}</span></p>
              <p><span className="text-muted-foreground">Region:</span> {alert.region}</p>
              <p><span className="text-muted-foreground">Severity:</span> <span className="capitalize">{alert.severity}</span></p>
              <p><span className="text-muted-foreground">Status:</span> <span className="capitalize">{alert.status}</span></p>
              <p><span className="text-muted-foreground">Case Count:</span> {alert.case_count || 0}</p>
              <p><span className="text-muted-foreground">Created:</span> {alert.createdAt ? new Date(alert.createdAt).toLocaleString() : '-'}</p>
            </div>
            {alert.description ? <p className="mt-3 text-sm">{alert.description}</p> : null}
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold">Recommendations</h3>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
              {(data?.recommendations?.immediate || []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-muted-foreground">{data?.recommendations?.diseaseSpecific}</p>
          </div>
        </>
      )}
    </div>
  );
}
