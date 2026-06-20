"use client";

import { useEffect, useRef } from "react";

export interface PharmacyLocation {
  name: string;
  lat: number;
  lng: number;
  distance: number;
  stock: string;
  price: number;
  type: "normal" | "low" | "out";
}

interface PharmacyMapProps {
  pharmacies: PharmacyLocation[];
  userLat?: number;
  userLng?: number;
  focusLocation?: { lat: number; lng: number } | null;
}

function getMarkerColor(type: "normal" | "low" | "out") {
  if (type === "out") return "#ef4444";
  if (type === "low") return "#f59e0b";
  return "#22c55e";
}

function createIcon(L: any, color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="28" height="42">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24S24 21 24 12C24 5.373 18.627 0 12 0z" fill="${color}" stroke="white" stroke-width="1.5"/>
    <circle cx="12" cy="12" r="5" fill="white" opacity="0.9"/>
  </svg>`;
  return L.divIcon({ html: svg, iconSize: [28, 42], iconAnchor: [14, 42], popupAnchor: [0, -44], className: "" });
}

function createUserIcon(L: any) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
    <circle cx="16" cy="16" r="14" fill="#6366f1" stroke="white" stroke-width="2.5"/>
    <circle cx="16" cy="16" r="5" fill="white"/>
    <circle cx="16" cy="16" r="14" fill="#6366f1" opacity="0.3">
      <animate attributeName="r" from="14" to="22" dur="1.8s" repeatCount="indefinite"/>
      <animate attributeName="opacity" from="0.3" to="0" dur="1.8s" repeatCount="indefinite"/>
    </circle>
  </svg>`;
  return L.divIcon({ html: svg, iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -18], className: "" });
}

function addMarkers(L: any, map: any, pharmacies: PharmacyLocation[], userLat: number, userLng: number) {
  // User location marker
  L.marker([userLat, userLng], { icon: createUserIcon(L) })
    .addTo(map)
    .bindPopup(
      `<div style="font-family:Inter,sans-serif;font-size:11px;line-height:1.6;min-width:130px">
        <b style="color:#6366f1;font-size:12px">📍 Your Location</b><br/>
        <span style="color:#94a3b8">Dehradun, Uttarakhand</span><br/>
        <span style="color:#64748b;font-size:10px">🟢 Live · GPS Active</span>
      </div>`,
      { className: "pharmacy-popup" }
    );

  // Pharmacy markers
  pharmacies.forEach((p) => {
    const color = getMarkerColor(p.type);
    const stockLabel = p.type === "out" ? "❌ Out of Stock" : p.type === "low" ? "⚠️ Low Stock" : "✅ In Stock";
    const stockColor = p.type === "out" ? "#ef4444" : p.type === "low" ? "#f59e0b" : "#22c55e";

    L.marker([p.lat, p.lng], { icon: createIcon(L, color) })
      .addTo(map)
      .bindPopup(
        `<div style="font-family:Inter,sans-serif;font-size:11px;line-height:1.9;min-width:170px;max-width:210px">
          <b style="font-size:12.5px;color:#f1f5f9">${p.name}</b><br/>
          <span style="color:${stockColor};font-weight:700;font-size:11px">${stockLabel}</span><br/>
          <span style="color:#94a3b8">📦 ${p.stock}</span><br/>
          <span style="color:#94a3b8">📍 ${p.distance} km from you</span><br/>
          ${p.price > 0 ? `<span style="color:#e2e8f0;font-weight:700;font-size:12px">₹${p.price}</span>` : ""}
        </div>`,
        { className: "pharmacy-popup" }
      );
  });

  // Draw premium Sector zones overlays
  const sectors = [
    { name: "Sector 1 (Paltan Bazaar)", lat: 30.3220, lng: 78.0310, radius: 700, color: "#6366f1" },
    { name: "Sector 2 (Saharanpur Rd)", lat: 30.3012, lng: 78.0760, radius: 850, color: "#10b981" },
    { name: "Sector 3 (Prem Nagar)", lat: 30.2950, lng: 78.0520, radius: 1000, color: "#8b5cf6" },
    { name: "Sector 4 (Rajpur Rd)", lat: 30.3510, lng: 78.0645, radius: 900, color: "#06b6d4" },
    { name: "Sector 5 (Clement Town)", lat: 30.2700, lng: 78.0060, radius: 950, color: "#f59e0b" },
  ];

  sectors.forEach((sec) => {
    L.circle([sec.lat, sec.lng], {
      color: sec.color,
      weight: 1,
      fillColor: sec.color,
      fillOpacity: 0.04,
      radius: sec.radius
    }).addTo(map)
      .bindTooltip(sec.name, { permanent: true, direction: "center", className: "sector-label-tooltip" });
  });

  // Fit map to user and nearby pharmacies (within 15km) to keep sectors/streets visible
  const nearbyPharmacies = pharmacies.filter((p) => p.distance <= 15);
  const bounds: [number, number][] = [
    [userLat, userLng],
    ...(nearbyPharmacies.length > 0 ? nearbyPharmacies : pharmacies).map((p) => [p.lat, p.lng] as [number, number]),
  ];
  map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40] });
}

export default function PharmacyMap({ pharmacies, userLat = 30.3165, userLng = 78.0322, focusLocation = null }: PharmacyMapProps) {
  const mapRef      = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const LRef        = useRef<any>(null);

  // ── One-time map initialisation ────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;

    // Prevent double-init (React StrictMode fires effects twice in dev)
    if ((mapRef.current as any)._leaflet_id) return;

    let destroyed = false;

    // 1. Inject Leaflet CSS into <head> once (client-only, no SSR mismatch)
    const cssId = "leaflet-css";
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id   = cssId;
      link.rel  = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // 2. Inject custom popup + control styles once
    const styleId = "pharmacy-map-styles";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .pharmacy-popup .leaflet-popup-content-wrapper {
          background: #0f172a;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          color: #e2e8f0;
          box-shadow: 0 8px 32px rgba(0,0,0,0.6);
        }
        .pharmacy-popup .leaflet-popup-tip { background: #0f172a; }
        .leaflet-control-zoom a {
          background: #0f172a !important;
          color: #94a3b8 !important;
          border-color: rgba(255,255,255,0.08) !important;
        }
        .leaflet-control-zoom a:hover {
          background: #1e293b !important;
          color: #e2e8f0 !important;
        }
        .leaflet-control-attribution {
          background: rgba(15,23,42,0.7) !important;
          color: #475569 !important;
          font-size: 9px !important;
        }
        .leaflet-control-attribution a { color: #6366f1 !important; }
        .sector-label-tooltip {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          color: rgba(255, 255, 255, 0.35) !important;
          font-weight: 800 !important;
          font-size: 8px !important;
          text-shadow: 0 1px 3px rgba(0,0,0,0.8);
          font-family: Inter, sans-serif;
        }
      `;
      document.head.appendChild(style);
    }

    // 3. Dynamically load Leaflet and build the map
    import("leaflet").then((L) => {
      if (destroyed || !mapRef.current) return;
      // Guard in case StrictMode already called cleanup and re-runs this
      if ((mapRef.current as any)._leaflet_id) return;

      LRef.current = L;

      const map = L.map(mapRef.current, {
        center: [userLat, userLng],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      mapInstance.current = map;

      // Dark CartoDB tile layer
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/">OSM</a> &copy; <a href="https://carto.com/">Carto</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      L.control.attribution({ position: "bottomright", prefix: false }).addTo(map);
      L.control.zoom({ position: "bottomright" }).addTo(map);

      addMarkers(L, map, pharmacies, userLat, userLng);
    });

    return () => {
      destroyed = true;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Update markers when selected medicine changes ──────────────────────────
  useEffect(() => {
    const L   = LRef.current;
    const map = mapInstance.current;
    if (!L || !map) return;

    // Remove only marker and circle layers
    map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker || layer instanceof L.Circle) {
        map.removeLayer(layer);
      }
    });

    addMarkers(L, map, pharmacies, userLat, userLng);
  }, [pharmacies, userLat, userLng]);

  // ── Fly to focused pharmacy when clicked ───────────────────────────────────
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !focusLocation) return;
    map.flyTo([focusLocation.lat, focusLocation.lng], 15, { duration: 1.5 });
  }, [focusLocation]);

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: "320px", borderRadius: "0 0 12px 12px", overflow: "hidden" }}
    />
  );
}
