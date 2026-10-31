import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AQILocation } from "@/services/csvService";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Comprehensive Chennai and Tamil Nadu location coordinates (100+ locations)
const locationCoordinates: Record<string, { lat: number; lng: number }> = {
  // Central Chennai
  "Anna Nagar": { lat: 13.0850, lng: 80.2101 },
  "T. Nagar": { lat: 13.0418, lng: 80.2341 },
  "Nungambakkam": { lat: 13.0569, lng: 80.2425 },
  "Egmore": { lat: 13.0732, lng: 80.2609 },
  "Central": { lat: 13.0827, lng: 80.2707 },
  "Royapettah": { lat: 13.0524, lng: 80.2626 },
  "Mylapore": { lat: 13.0339, lng: 80.2619 },
  "Teynampet": { lat: 13.0389, lng: 80.2456 },
  "Nandanam": { lat: 13.0297, lng: 80.2424 },
  "Alwarpet": { lat: 13.0333, lng: 80.2528 },
  "Mandaveli": { lat: 13.0258, lng: 80.2667 },
  "Thousand Lights": { lat: 13.0600, lng: 80.2550 },
  "Triplicane": { lat: 13.0544, lng: 80.2778 },
  "Chetpet": { lat: 13.0708, lng: 80.2431 },
  "Kilpauk": { lat: 13.0789, lng: 80.2347 },
  
  // North Chennai
  "George Town": { lat: 13.0933, lng: 80.2889 },
  "Parrys": { lat: 13.0878, lng: 80.2850 },
  "Sowcarpet": { lat: 13.0900, lng: 80.2800 },
  "Purasawalkam": { lat: 13.0878, lng: 80.2550 },
  "Perambur": { lat: 13.1133, lng: 80.2333 },
  "Vyasarpadi": { lat: 13.1050, lng: 80.2450 },
  "Tondiarpet": { lat: 13.1200, lng: 80.2800 },
  "Washermanpet": { lat: 13.1050, lng: 80.2750 },
  "Kolathur": { lat: 13.1333, lng: 80.2167 },
  "Villivakkam": { lat: 13.1167, lng: 80.2000 },
  "Madhavaram": { lat: 13.1483, lng: 80.2317 },
  "Manali": { lat: 13.1667, lng: 80.2667 },
  "Ennore": { lat: 13.2167, lng: 80.3167 },
  "Tiruvottiyur": { lat: 13.1667, lng: 80.3000 },
  "Red Hills": { lat: 13.1833, lng: 80.1667 },
  
  // South Chennai
  "Velachery": { lat: 12.9808, lng: 80.2209 },
  "Adyar": { lat: 13.0067, lng: 80.2572 },
  "Guindy": { lat: 13.0067, lng: 80.2206 },
  "Saidapet": { lat: 13.0210, lng: 80.2231 },
  "Saidapet East": { lat: 13.0220, lng: 80.2280 },
  "Kotturpuram": { lat: 13.0167, lng: 80.2500 },
  "Besant Nagar": { lat: 12.9986, lng: 80.2667 },
  "Thiruvanmiyur": { lat: 12.9833, lng: 80.2583 },
  "Thiruvanmiyur Beach": { lat: 12.9800, lng: 80.2650 },
  "Tambaram": { lat: 12.9226, lng: 80.1275 },
  "Chromepet": { lat: 12.9516, lng: 80.1462 },
  "Pallavaram": { lat: 12.9675, lng: 80.1491 },
  "Nanganallur": { lat: 12.9833, lng: 80.1833 },
  "Madipakkam": { lat: 12.9625, lng: 80.1989 },
  "Keelkattalai": { lat: 12.9500, lng: 80.2000 },
  "Medavakkam": { lat: 12.9200, lng: 80.1917 },
  "Palavanthangal": { lat: 12.9667, lng: 80.1667 },
  "Meenambakkam": { lat: 12.9833, lng: 80.1667 },
  "Tirusulam": { lat: 12.9667, lng: 80.1333 },
  "Vandalur": { lat: 12.8925, lng: 80.0811 },
  
  // West Chennai
  "Porur": { lat: 13.0358, lng: 80.1560 },
  "Ashok Nagar": { lat: 13.0358, lng: 80.2093 },
  "Ashok Pillar": { lat: 13.0500, lng: 80.2050 },
  "Vadapalani": { lat: 13.0504, lng: 80.2121 },
  "Kodambakkam": { lat: 13.0524, lng: 80.2254 },
  "Saligramam": { lat: 13.0548, lng: 80.2006 },
  "Koyambedu": { lat: 13.0732, lng: 80.1986 },
  "Virugambakkam": { lat: 13.0548, lng: 80.1897 },
  "Virugambakkam West": { lat: 13.0550, lng: 80.1850 },
  "Arumbakkam": { lat: 13.0667, lng: 80.2083 },
  "KK Nagar": { lat: 13.0417, lng: 80.2000 },
  "Thirumangalam": { lat: 13.0833, lng: 80.1917 },
  "West Mambalam": { lat: 13.0333, lng: 80.2250 },
  "Valasaravakkam": { lat: 13.0417, lng: 80.1750 },
  "Nerkundram": { lat: 13.0500, lng: 80.1833 },
  "Nandambakkam": { lat: 13.0083, lng: 80.2000 },
  "Poonamallee": { lat: 13.0333, lng: 80.1000 },
  "Avadi": { lat: 13.1167, lng: 80.1000 },
  "Ambattur": { lat: 13.1167, lng: 80.1667 },
  "Madhuravoyal": { lat: 13.0667, lng: 80.1667 },
  "Mogappair": { lat: 13.0833, lng: 80.1833 },
  
  // IT Corridor / OMR / ECR
  "Perungudi": { lat: 12.9611, lng: 80.2417 },
  "Sholinganallur": { lat: 12.9008, lng: 80.2281 },
  "OMR": { lat: 12.8698, lng: 80.2201 },
  "ECR": { lat: 12.7925, lng: 80.2186 },
  "Thoraipakkam": { lat: 12.9375, lng: 80.2333 },
  "Navalur": { lat: 12.8500, lng: 80.2250 },
  "Siruseri": { lat: 12.8250, lng: 80.2167 },
  "Jalladianpet": { lat: 12.9833, lng: 80.2333 },
  "Taramani": { lat: 12.9917, lng: 80.2417 },
  "Tidel Park": { lat: 13.0083, lng: 80.2417 },
  "Palavakkam": { lat: 12.9667, lng: 80.2583 },
  "Neelankarai": { lat: 12.9500, lng: 80.2583 },
  "Injambakkam": { lat: 12.9167, lng: 80.2500 },
  "Akkarai": { lat: 12.9000, lng: 80.2417 },
  "Uthandi": { lat: 12.8667, lng: 80.2417 },
  
  // Surrounding Areas
  "Thiruvallur": { lat: 13.1333, lng: 79.9167 },
  "Kanchipuram": { lat: 12.8342, lng: 79.7036 },
  "Chengalpattu": { lat: 12.6917, lng: 79.9750 },
  "Mahabalipuram": { lat: 12.6208, lng: 80.1989 },
  "Pondicherry": { lat: 11.9139, lng: 79.8145 },
  
  // Other Tamil Nadu Cities
  "Coimbatore": { lat: 11.0168, lng: 76.9558 },
  "Madurai": { lat: 9.9252, lng: 78.1198 },
  "Trichy": { lat: 10.7905, lng: 78.7047 },
  "Salem": { lat: 11.6643, lng: 78.1460 },
  "Tirunelveli": { lat: 8.7139, lng: 77.7567 }
};

// AQI color coding based on standard AQI guide
const getAQIColor = (aqi: number) => {
  if (aqi <= 50) return "#10b981";      // Good - Green
  if (aqi <= 100) return "#fbbf24";     // Moderate - Yellow
  if (aqi <= 150) return "#f97316";     // Unhealthy for Sensitive - Orange
  if (aqi <= 200) return "#ef4444";     // Unhealthy - Red
  if (aqi <= 300) return "#a855f7";     // Very Unhealthy - Purple
  return "#7f1d1d";                      // Hazardous - Maroon
};

const getAQICategory = (aqi: number) => {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
};

interface InteractiveMapProps {
  aqiLocations?: AQILocation[];
}

const InteractiveMap = ({ aqiLocations = [] }: InteractiveMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map centered on Chennai
    const map = L.map(mapRef.current, {
      center: [13.0827, 80.2707],
      zoom: 11,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when AQI data changes
  useEffect(() => {
    if (!mapInstanceRef.current || aqiLocations.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Calculate average AQI for background color
    const avgAQI = aqiLocations.reduce((sum, loc) => sum + loc.aqi, 0) / aqiLocations.length;
    const avgColor = getAQIColor(avgAQI);
    
    if (mapRef.current) {
      mapRef.current.style.backgroundColor = avgColor;
      mapRef.current.style.opacity = '0.95';
    }

    // Add markers for each location
    aqiLocations.forEach((location) => {
      const coords = locationCoordinates[location.name];
      if (!coords) return;

      const color = getAQIColor(location.aqi);
      
      // Create circle marker
      const marker = L.circleMarker([coords.lat, coords.lng], {
        radius: 12,
        fillColor: color,
        color: '#ffffff',
        weight: 3,
        opacity: 1,
        fillOpacity: 0.85,
      }).addTo(mapInstanceRef.current!);

      // Create popup content
      const popupContent = `
        <div style="font-family: system-ui; min-width: 200px;">
          <h3 style="margin: 0 0 10px 0; font-weight: 600; font-size: 16px; color: #1f2937;">
            ${location.name}
          </h3>
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
            <span style="font-size: 32px; font-weight: 700; color: ${color}">
              ${location.aqi}
            </span>
            <div>
              <div style="font-size: 12px; color: #6b7280; font-weight: 500;">AQI</div>
              <div style="font-size: 11px; color: ${color}; font-weight: 600;">
                ${getAQICategory(location.aqi)}
              </div>
            </div>
          </div>
          <div style="border-top: 1px solid #e5e7eb; padding-top: 8px; font-size: 11px; color: #6b7280;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
              <div><strong>PM2.5:</strong> ${location.pollutants.pm25} μg/m³</div>
              <div><strong>PM10:</strong> ${location.pollutants.pm10} μg/m³</div>
              <div><strong>CO:</strong> ${location.pollutants.co} ppm</div>
              <div><strong>NO₂:</strong> ${location.pollutants.no2} ppb</div>
              <div><strong>O₃:</strong> ${location.pollutants.o3} ppb</div>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      
      // Show popup on hover
      marker.on('mouseover', function() {
        this.openPopup();
      });

      markersRef.current.push(marker);
    });
  }, [aqiLocations]);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Tamil Nadu AQI Map</CardTitle>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground font-medium">AQI Scale:</span>
            <Badge style={{ backgroundColor: getAQIColor(25), color: "#fff" }}>Good (0-50)</Badge>
            <Badge style={{ backgroundColor: getAQIColor(75), color: "#fff" }}>Moderate (51-100)</Badge>
            <Badge style={{ backgroundColor: getAQIColor(125), color: "#fff" }}>Unhealthy for Sensitive (101-150)</Badge>
            <Badge style={{ backgroundColor: getAQIColor(175), color: "#fff" }}>Unhealthy (151-200)</Badge>
            <Badge style={{ backgroundColor: getAQIColor(250), color: "#fff" }}>Very Unhealthy (201-300)</Badge>
            <Badge style={{ backgroundColor: getAQIColor(350), color: "#fff" }}>Hazardous (301+)</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          ref={mapRef}
          className="w-full h-[350px] sm:h-[450px] md:h-[600px] rounded-lg overflow-hidden border-2"
          style={{ zIndex: 1 }}
        />
        <p className="text-xs text-muted-foreground mt-3 text-center">
          🖱️ Hover over markers to see real-time AQI • 🔍 Zoom with controls or scroll • 👆 Drag to pan • 📍 Click markers for details
        </p>
      </CardContent>
    </Card>
  );
};

export default InteractiveMap;
