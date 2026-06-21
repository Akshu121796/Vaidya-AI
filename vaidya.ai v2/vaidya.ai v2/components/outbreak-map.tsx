"use client";

import { useEffect, useRef } from "react";

export interface OutbreakLocation {
  name: string;
  lat?: number;
  lng?: number;
  cases: number;
  symptom: string;
  alert: "Critical" | "Warning" | "Stable";
  syncTime: string;
}

interface OutbreakMapProps {
  alerts: OutbreakLocation[];
  focusLocation?: { lat: number; lng: number } | null;
}

const VILLAGE_COORDS: Record<string, [number, number]> = {
  "Nabha":         [30.3742, 76.1422],
  "Rampura Phul":  [30.2632, 75.8234],
  "Barnala":       [30.3806, 75.5493],
  "Sangrur":       [30.2452, 75.8369],
  "Malerkotla":    [30.5290, 75.8826],
  "Dhuri":         [30.3695, 75.8665],
  "Sunam":         [30.1279, 75.7978],
  "Lehragaga":     [30.1706, 75.9533],
  "Moonak":        [29.9971, 75.9106],
  "Budhlada":      [29.9249, 75.5575],
  "Mansa":         [29.9914, 75.3872],
  "Bhikhi":        [30.0423, 75.6231],
  "Bhadaur":       [30.2027, 75.5891],
  "Patran":        [30.0552, 76.0367],
  "Nabha Rural":   [30.3500, 76.1100],
};

function getCoords(name: string): [number, number] {
  const normalized = name.replace("Village ", "").trim();
  if (VILLAGE_COORDS[normalized]) {
    return VILLAGE_COORDS[normalized];
  }
  for (const key of Object.keys(VILLAGE_COORDS)) {
    if (normalized.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(normalized.toLowerCase())) {
      return VILLAGE_COORDS[key];
    }
  }
  return [30.3, 75.8]; // default center of region
}

function getMarkerColor(alert: "Critical" | "Warning" | "Stable") {
  if (alert === "Critical") return "#ef4444";
  if (alert === "Warning") return "#f59e0b";
  return "#3b82f6";
}

function createOutbreakIcon(L: any, alert: "Critical" | "Warning" | "Stable") {
  const color = getMarkerColor(alert);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
    <circle cx="16" cy="16" r="8" fill="${color}" stroke="white" stroke-width="2"/>
    <circle cx="16" cy="16" r="14" fill="${color}" opacity="0.3">
      <animate attributeName="r" from="8" to="16" dur="2s" repeatCount="indefinite"/>
      <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite"/>
    </circle>
  </svg>`;
  return L.divIcon({ html: svg, iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -12], className: "" });
}

function addOutbreakMarkers(L: any, map: any, alerts: OutbreakLocation[]) {
  const bounds: [number, number][] = [];

  alerts.forEach((item) => {
    const coords = item.lat && item.lng ? [item.lat, item.lng] as [number, number] : getCoords(item.name);
    const color = getMarkerColor(item.alert);
    bounds.push(coords);

    // Add cluster zone boundary overlay circle
    L.circle(coords, {
      color: color,
      weight: 1,
      fillColor: color,
      fillOpacity: 0.1,
      radius: Math.max(800, item.cases * 120) // scalable radius representing the footprint of the cluster
    }).addTo(map);

    // Add custom marker with popups
    L.marker(coords, { icon: createOutbreakIcon(L, item.alert) })
      .addTo(map)
      .bindPopup(
        `<div style="font-family:Inter,sans-serif;font-size:11px;line-height:1.9;min-width:170px;max-width:210px">
          <b style="font-size:13px;color:#f1f5f9">🚨 Outbreak Cluster</b><hr style="border-color:rgba(255,255,255,0.08); margin:4px 0;" />
          <span style="color:#94a3b8">📍 Village: </span><b style="color:#f1f5f9">${item.name}</b><br/>
          <span style="color:#94a3b8">🦠 Symptom: </span><b style="color:#f1f5f9">${item.symptom}</b><br/>
          <span style="color:#94a3b8">📊 Active Cases: </span><b style="color:#f1f5f9">${item.cases}</b><br/>
          <span style="color:#94a3b8">⚠️ Severity: </span><span style="color:${color};font-weight:700">${item.alert}</span><br/>
          <span style="color:#64748b;font-size:9px">Last Synced: ${item.syncTime}</span>
        </div>`,
        { className: "outbreak-popup" }
      );
  });

  // Fit map to contain all active outbreak markers
  if (bounds.length > 0) {
    map.fitBounds(L.latLngBounds(bounds), { padding: [50, 50] });
  }
}

export default function OutbreakMap({ alerts, focusLocation = null }: OutbreakMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const LRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if ((mapRef.current as any)._leaflet_id) return;

    let destroyed = false;

    // Inject Leaflet CSS if not already present
    const cssId = "leaflet-css";
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Inject Custom Popup Styles
    const styleId = "outbreak-map-styles";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .outbreak-popup .leaflet-popup-content-wrapper {
          background: #0b1120;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          color: #e2e8f0;
          box-shadow: 0 10px 40px rgba(0,0,0,0.7);
        }
        .outbreak-popup .leaflet-popup-tip { background: #0b1120; }
        .leaflet-control-zoom a {
          background: #0b1120 !important;
          color: #94a3b8 !important;
          border-color: rgba(255,255,255,0.08) !important;
        }
        .leaflet-control-zoom a:hover {
          background: #1e293b !important;
          color: #e2e8f0 !important;
        }
        .leaflet-control-attribution {
          background: rgba(11,17,32,0.7) !important;
          color: #475569 !important;
          font-size: 9px !important;
        }
        .leaflet-control-attribution a { color: #6366f1 !important; }
      `;
      document.head.appendChild(style);
    }

    // Dynamically import Leaflet
    import("leaflet").then((L) => {
      if (destroyed || !mapRef.current) return;
      if ((mapRef.current as any)._leaflet_id) return;

      LRef.current = L;

      const map = L.map(mapRef.current, {
        center: [30.3, 75.8],
        zoom: 9,
        zoomControl: false,
        attributionControl: false,
      });

      mapInstance.current = map;

      // Dark Mode Tile Layer
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/">OSM</a> &copy; <a href="https://carto.com/">Carto</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      L.control.attribution({ position: "bottomright", prefix: false }).addTo(map);
      L.control.zoom({ position: "bottomright" }).addTo(map);

      addOutbreakMarkers(L, map, alerts);
    });

    return () => {
      destroyed = true;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Update markers when list of outbreaks changes
  useEffect(() => {
    const L = LRef.current;
    const map = mapInstance.current;
    if (!L || !map) return;

    map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker || layer instanceof L.Circle) {
        map.removeLayer(layer);
      }
    });

    addOutbreakMarkers(L, map, alerts);
  }, [alerts]);

  // Handle focus changes (flying to active outbreak selected in table)
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !focusLocation) return;
    map.flyTo([focusLocation.lat, focusLocation.lng], 12, { duration: 1.5 });
  }, [focusLocation]);

  return (
    <div
      ref={mapRef}
      className="border border-white/5 shadow-2xl"
      style={{ width: "100%", height: "400px", borderRadius: "12px", overflow: "hidden" }}
    />
  );
}
