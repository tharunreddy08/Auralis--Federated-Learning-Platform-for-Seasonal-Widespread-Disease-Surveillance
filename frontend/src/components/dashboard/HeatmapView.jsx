import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const severityColorMap = {
  low: "#10b981",
  medium: "#8b5cf6",
  high: "#f59e0b",
  critical: "#ef4444",
};

function MapBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      const bounds = points.map((p) => [p.lat, p.lng]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [points, map]);
  return null;
}

export default function HeatmapView({ dataPoints = [], center = [20, 0], zoom = 2 }) {
  const points = dataPoints.filter((p) => p.lat && p.lng);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "500px", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {points.length > 0 && <MapBounds points={points} />}
        {points.map((point, i) => (
          <CircleMarker
            key={i}
            center={[point.lat, point.lng]}
            radius={Math.max(8, Math.min(25, (point.cases || 1) / 5))}
            fillColor={severityColorMap[point.severity] || "#8b5cf6"}
            color="transparent"
            fillOpacity={0.6}
          >
            <Popup>
              <div className="text-xs space-y-1">
                <p className="font-bold">{point.label || point.region}</p>
                <p>{point.disease} — {point.cases} cases</p>
                <p className="capitalize">Severity: {point.severity}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
