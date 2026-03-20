import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import type { LatLngBoundsExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { api, RiskLevel, RiskMapPoint } from '../lib/api';

const REFRESH_MS = 8000; // falls within the 5-10s requirement

const RISK_COLORS: Record<RiskLevel, string> = {
  Low: '#22c55e',
  Medium: '#facc15',
  High: '#fb923c',
  Critical: '#ef4444',
};

const DEFAULT_CENTER: [number, number] = [13.0827, 80.2707]; // Chennai
const DEFAULT_ZOOM = 6;

function getRadius(cases: number) {
  const capped = Math.max(0, Math.min(200, cases));
  // Map small/large values to a pleasant circle size range.
  return 6 + (capped / 200) * 16;
}

export default function RiskHeatmap() {
  const [days, setDays] = useState(7);
  const [points, setPoints] = useState<RiskMapPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const riskCounts = useMemo(() => {
    const counts: Record<RiskLevel, number> = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    for (const p of points) counts[p.risk_level] += 1;
    return counts;
  }, [points]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getRiskMap(days);
        if (cancelled) return;
        setPoints(data);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Failed to fetch risk heatmap');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    // Initial load
    load();

    // Simulate near real-time updates
    const id = window.setInterval(load, REFRESH_MS);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [days]);

  const bounds: LatLngBoundsExpression | null = useMemo(() => {
    if (points.length === 0) return null;
    return points.map((p) => [p.lat, p.lng]) as LatLngBoundsExpression;
  }, [points]);

  const mapKey = `risk-heatmap-${days}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Zone-wise Risk Heatmap</h2>
          <p className="text-slate-600 mt-1">Interactive distribution of outbreak risk by zone.</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-600" htmlFor="risk-days">
            Time range
          </label>
          <select
            id="risk-days"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 shadow-sm"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
          </select>
          <div className="text-xs text-slate-500 hidden sm:block">Auto-refresh ~{REFRESH_MS / 1000}s</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(['Low', 'Medium', 'High', 'Critical'] as RiskLevel[]).map((level) => {
          const color = RISK_COLORS[level];
          return (
            <div
              key={level}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <p className="text-sm font-medium text-slate-700">{level}</p>
              </div>
              <p className="text-lg font-bold text-slate-900">{riskCounts[level]}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="relative">
          <div className="h-[520px] w-full">
            <MapContainer
              key={mapKey}
              center={DEFAULT_CENTER}
              zoom={DEFAULT_ZOOM}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%' }}
              bounds={bounds ?? undefined}
              boundsOptions={{ padding: [20, 20] }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {points.map((p) => {
                const color = RISK_COLORS[p.risk_level];
                return (
                  <CircleMarker
                    key={p.zone}
                    center={[p.lat, p.lng]}
                    radius={getRadius(p.cases)}
                    pathOptions={{ color, weight: 2 }}
                    fillColor={color}
                    fillOpacity={0.75}
                  >
                    <Tooltip
                      direction="top"
                      offset={[0, -8]}
                      opacity={1}
                      className="!bg-white !border !border-slate-200 !shadow-sm !text-slate-800"
                    >
                      <div className="text-sm font-semibold">{p.zone}</div>
                      <div className="mt-1 text-xs text-slate-600">
                        Risk:{' '}
                        <span className="font-semibold" style={{ color }}>
                          {p.risk_level}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-slate-600">
                        Cases: <span className="font-semibold text-slate-900">{p.cases}</span>
                      </div>
                    </Tooltip>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>

          <div className="absolute top-4 right-4 bg-white/95 border border-slate-200 rounded-lg shadow px-4 py-3 w-60">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-900">Legend</p>
              <p className="text-xs text-slate-500">{points.length} zones</p>
            </div>
            <div className="mt-3 space-y-2">
              {(['Low', 'Medium', 'High', 'Critical'] as RiskLevel[]).map((level) => {
                const color = RISK_COLORS[level];
                return (
                  <div key={level} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-sm text-slate-700">{level}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {loading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="mt-4 text-slate-700 text-sm">Loading risk map...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <p className="font-medium">Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}
    </div>
  );
}

