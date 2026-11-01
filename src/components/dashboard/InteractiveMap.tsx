/**
 * InteractiveMap
 *
 * Leaflet map showing:
 *  • A live IoT sensor marker at the device's GPS coordinates (from IoTContext)
 *  • Background AQI-coloured circle markers for well-known Chennai/TN locations
 *    with sample AQI values (used as reference points when no multi-sensor
 *    backend is available)
 *
 * Props: none — reads everything from IoTContext
 */
import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useIoT } from "@/contexts/IoTContext";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon paths (bundler issue)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// ─── AQI helpers ─────────────────────────────────────────────────────────────

const aqiColor = (aqi: number) => {
  if (aqi <= 50)  return "#10b981";
  if (aqi <= 100) return "#fbbf24";
  if (aqi <= 150) return "#f97316";
  if (aqi <= 200) return "#ef4444";
  if (aqi <= 300) return "#a855f7";
  return "#7f1d1d";
};
const aqiLabel = (aqi: number) => {
  if (aqi <= 50)  return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
};

// ─── Reference location data ─────────────────────────────────────────────────
// Sample AQI values for well-known TN locations used as reference markers

const REFERENCE_LOCATIONS = [
  { name: "Anna Nagar",     lat: 13.0850, lng: 80.2101, aqi: 72 },
  { name: "T. Nagar",       lat: 13.0418, lng: 80.2341, aqi: 88 },
  { name: "Velachery",      lat: 12.9808, lng: 80.2209, aqi: 85 },
  { name: "Adyar",          lat: 13.0067, lng: 80.2572, aqi: 70 },
  { name: "Guindy",         lat: 13.0067, lng: 80.2206, aqi: 95 },
  { name: "Tambaram",       lat: 12.9226, lng: 80.1275, aqi: 92 },
  { name: "Porur",          lat: 13.0358, lng: 80.1560, aqi: 78 },
  { name: "Ambattur",       lat: 13.1167, lng: 80.1667, aqi: 105 },
  { name: "Sholinganallur", lat: 12.9008, lng: 80.2281, aqi: 68 },
  { name: "Koyambedu",      lat: 13.0732, lng: 80.1986, aqi: 110 },
  { name: "Mylapore",       lat: 13.0339, lng: 80.2619, aqi: 82 },
  { name: "OMR",            lat: 12.8698, lng: 80.2201, aqi: 65 },
  { name: "Chromepet",      lat: 12.9516, lng: 80.1462, aqi: 90 },
  { name: "Perambur",       lat: 13.1133, lng: 80.2333, aqi: 98 },
  { name: "Pallavaram",     lat: 12.9675, lng: 80.1491, aqi: 87 },
];

// ─── Component ────────────────────────────────────────────────────────────────

const InteractiveMap = () => {
  const { data, status } = useIoT();

  const mapRef         = useRef<HTMLDivElement>(null);
  const mapInstance    = useRef<L.Map | null>(null);
  const liveMarkerRef  = useRef<L.Marker | null>(null);
  const refMarkersRef  = useRef<L.CircleMarker[]>([]);

  // Init map once
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center:           [13.034107, 80.230168],
      zoom:             12,
      zoomControl:      true,
      scrollWheelZoom:  true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    mapInstance.current = map;

    // Add reference markers
    REFERENCE_LOCATIONS.forEach(loc => {
      const color  = aqiColor(loc.aqi);
      const marker = L.circleMarker([loc.lat, loc.lng], {
        radius:      10,
        fillColor:   color,
        color:       "#fff",
        weight:      2,
        opacity:     1,
        fillOpacity: 0.75,
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family:system-ui;min-width:160px;">
          <strong style="font-size:14px;">${loc.name}</strong><br/>
          <span style="font-size:28px;font-weight:700;color:${color}">${loc.aqi}</span>
          <span style="font-size:11px;color:#6b7280;margin-left:4px;">AQI</span><br/>
          <span style="font-size:11px;font-weight:600;color:${color}">${aqiLabel(loc.aqi)}</span>
          <p style="font-size:10px;color:#9ca3af;margin-top:4px;">Reference / sample value</p>
        </div>
      `);
      marker.on("mouseover", function() { this.openPopup(); });
      refMarkersRef.current.push(marker);
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Update live IoT sensor marker whenever data changes
  useEffect(() => {
    if (!mapInstance.current) return;

    const lat = data?.latitude;
    const lng = data?.longitude;
    const aqi = data?.aqi;

    if (!lat || !lng) return;

    const color = aqi !== null && aqi !== undefined ? aqiColor(aqi) : "#6b7280";

    if (liveMarkerRef.current) {
      liveMarkerRef.current.remove();
      liveMarkerRef.current = null;
    }

    // Pulsing live sensor icon
    const icon = L.divIcon({
      html: `
        <div style="position:relative;width:28px;height:28px;">
          <div style="
            position:absolute;inset:0;border-radius:50%;
            background:${color};opacity:0.3;
            animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
          "></div>
          <div style="
            position:absolute;top:4px;left:4px;width:20px;height:20px;
            border-radius:50%;background:${color};border:3px solid #fff;
            box-shadow:0 2px 8px rgba(0,0,0,0.4);
          "></div>
        </div>
        <style>@keyframes ping{0%{transform:scale(1);opacity:.3}70%{transform:scale(2);opacity:0}100%{transform:scale(2);opacity:0}}</style>
      `,
      iconSize:   [28, 28],
      iconAnchor: [14, 14],
      className:  "",
    });

    const marker = L.marker([lat, lng], { icon }).addTo(mapInstance.current);
    marker.bindPopup(`
      <div style="font-family:system-ui;min-width:180px;">
        <strong style="font-size:14px;">📡 IoT Sensor (Live)</strong><br/>
        ${aqi !== null && aqi !== undefined
          ? `<span style="font-size:32px;font-weight:700;color:${color}">${aqi}</span>
             <span style="font-size:11px;color:#6b7280;margin-left:4px;">AQI</span><br/>
             <span style="font-size:12px;font-weight:600;color:${color}">${aqiLabel(aqi)}</span>`
          : `<span style="font-size:12px;color:#6b7280;">No AQI data yet</span>`
        }
        ${data?.temperature != null ? `<br/><span style="font-size:11px;color:#6b7280;">🌡️ ${data.temperature}°C</span>` : ""}
        ${data?.humidity    != null ? `<span style="font-size:11px;color:#6b7280;margin-left:8px;">💧 ${data.humidity}%</span>` : ""}
        ${data?.readingTime ? `<p style="font-size:10px;color:#9ca3af;margin-top:4px;">${data.readingTime}</p>` : ""}
      </div>
    `).openPopup();

    liveMarkerRef.current = marker;

    // Re-centre map on live sensor location (only first time it arrives)
    if (status === "ok") {
      mapInstance.current.setView([lat, lng], mapInstance.current.getZoom());
    }
  }, [data?.latitude, data?.longitude, data?.aqi, data?.readingTime]);

  return (
    <Card className="hover:shadow-lg transition-shadow border-2">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-lg sm:text-xl">Tamil Nadu AQI Map</CardTitle>
          <div className="flex flex-wrap gap-1.5">
            {[
              { aqi: 25,  label: "Good" },
              { aqi: 75,  label: "Moderate" },
              { aqi: 125, label: "Sensitive" },
              { aqi: 175, label: "Unhealthy" },
              { aqi: 250, label: "Very Unhealthy" },
            ].map(({ aqi, label }) => (
              <Badge key={label} style={{ backgroundColor: aqiColor(aqi), color: "#fff" }} className="text-[10px] px-1.5 py-0.5">
                {label}
              </Badge>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          📡 Live sensor marker = your IoT device · ⭕ Circle markers = reference stations
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <div
          ref={mapRef}
          className="w-full h-[320px] sm:h-[420px] md:h-[520px] rounded-lg overflow-hidden border"
          style={{ zIndex: 1 }}
        />
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Hover markers to view AQI · Scroll / pinch to zoom · Drag to pan
        </p>
      </CardContent>
    </Card>
  );
};

export default InteractiveMap;
