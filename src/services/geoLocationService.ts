// Coordinates for all tracked locations
const locationCoordinates: Record<string, { lat: number; lng: number }> = {
  // Central Chennai
  "Anna Nagar":       { lat: 13.0850, lng: 80.2101 },
  "T. Nagar":         { lat: 13.0418, lng: 80.2341 },
  "Nungambakkam":     { lat: 13.0569, lng: 80.2425 },
  "Egmore":           { lat: 13.0732, lng: 80.2609 },
  "Central":          { lat: 13.0827, lng: 80.2707 },
  "Royapettah":       { lat: 13.0524, lng: 80.2626 },
  "Mylapore":         { lat: 13.0339, lng: 80.2619 },
  "Teynampet":        { lat: 13.0389, lng: 80.2456 },
  "Nandanam":         { lat: 13.0297, lng: 80.2424 },
  "Alwarpet":         { lat: 13.0333, lng: 80.2528 },
  "Mandaveli":        { lat: 13.0258, lng: 80.2667 },
  "Thousand Lights":  { lat: 13.0600, lng: 80.2550 },
  "Triplicane":       { lat: 13.0544, lng: 80.2778 },
  "Chetpet":          { lat: 13.0708, lng: 80.2431 },
  "Kilpauk":          { lat: 13.0789, lng: 80.2347 },
  // North Chennai
  "George Town":      { lat: 13.0933, lng: 80.2889 },
  "Parrys":           { lat: 13.0878, lng: 80.2850 },
  "Sowcarpet":        { lat: 13.0900, lng: 80.2800 },
  "Purasawalkam":     { lat: 13.0878, lng: 80.2550 },
  "Perambur":         { lat: 13.1133, lng: 80.2333 },
  "Vyasarpadi":       { lat: 13.1050, lng: 80.2450 },
  "Tondiarpet":       { lat: 13.1200, lng: 80.2800 },
  "Washermanpet":     { lat: 13.1050, lng: 80.2750 },
  "Kolathur":         { lat: 13.1333, lng: 80.2167 },
  "Villivakkam":      { lat: 13.1167, lng: 80.2000 },
  "Madhavaram":       { lat: 13.1483, lng: 80.2317 },
  "Manali":           { lat: 13.1667, lng: 80.2667 },
  "Ennore":           { lat: 13.2167, lng: 80.3167 },
  "Tiruvottiyur":     { lat: 13.1667, lng: 80.3000 },
  "Red Hills":        { lat: 13.1833, lng: 80.1667 },
  // South Chennai
  "Velachery":        { lat: 12.9808, lng: 80.2209 },
  "Adyar":            { lat: 13.0067, lng: 80.2572 },
  "Guindy":           { lat: 13.0067, lng: 80.2206 },
  "Saidapet":         { lat: 13.0210, lng: 80.2231 },
  "Saidapet East":    { lat: 13.0220, lng: 80.2280 },
  "Kotturpuram":      { lat: 13.0167, lng: 80.2500 },
  "Besant Nagar":     { lat: 12.9986, lng: 80.2667 },
  "Thiruvanmiyur":    { lat: 12.9833, lng: 80.2583 },
  "Tambaram":         { lat: 12.9226, lng: 80.1275 },
  "Chromepet":        { lat: 12.9516, lng: 80.1462 },
  "Pallavaram":       { lat: 12.9675, lng: 80.1491 },
  "Nanganallur":      { lat: 12.9833, lng: 80.1833 },
  "Madipakkam":       { lat: 12.9625, lng: 80.1989 },
  "Keelkattalai":     { lat: 12.9500, lng: 80.2000 },
  "Medavakkam":       { lat: 12.9200, lng: 80.1917 },
  "Palavanthangal":   { lat: 12.9667, lng: 80.1667 },
  "Meenambakkam":     { lat: 12.9833, lng: 80.1667 },
  "Tirusulam":        { lat: 12.9667, lng: 80.1333 },
  "Vandalur":         { lat: 12.8925, lng: 80.0811 },
  // West Chennai
  "Porur":            { lat: 13.0358, lng: 80.1560 },
  "Ashok Nagar":      { lat: 13.0358, lng: 80.2093 },
  "Ashok Pillar":     { lat: 13.0500, lng: 80.2050 },
  "Vadapalani":       { lat: 13.0504, lng: 80.2121 },
  "Kodambakkam":      { lat: 13.0524, lng: 80.2254 },
  "Saligramam":       { lat: 13.0548, lng: 80.2006 },
  "Koyambedu":        { lat: 13.0732, lng: 80.1986 },
  "Virugambakkam":    { lat: 13.0548, lng: 80.1897 },
  "Arumbakkam":       { lat: 13.0667, lng: 80.2083 },
  "KK Nagar":         { lat: 13.0417, lng: 80.2000 },
  "Thirumangalam":    { lat: 13.0833, lng: 80.1917 },
  "West Mambalam":    { lat: 13.0333, lng: 80.2250 },
  "Valasaravakkam":   { lat: 13.0417, lng: 80.1750 },
  "Nerkundram":       { lat: 13.0500, lng: 80.1833 },
  "Nandambakkam":     { lat: 13.0083, lng: 80.2000 },
  "Poonamallee":      { lat: 13.0333, lng: 80.1000 },
  "Avadi":            { lat: 13.1167, lng: 80.1000 },
  "Ambattur":         { lat: 13.1167, lng: 80.1667 },
  "Madhuravoyal":     { lat: 13.0667, lng: 80.1667 },
  "Mogappair":        { lat: 13.0833, lng: 80.1833 },
  // IT Corridor / OMR / ECR
  "Perungudi":        { lat: 12.9611, lng: 80.2417 },
  "Sholinganallur":   { lat: 12.9008, lng: 80.2281 },
  "OMR":              { lat: 12.8698, lng: 80.2201 },
  "ECR":              { lat: 12.7925, lng: 80.2186 },
  "Thoraipakkam":     { lat: 12.9375, lng: 80.2333 },
  "Navalur":          { lat: 12.8500, lng: 80.2250 },
  "Siruseri":         { lat: 12.8250, lng: 80.2167 },
  "Jalladianpet":     { lat: 12.9833, lng: 80.2333 },
  "Taramani":         { lat: 12.9917, lng: 80.2417 },
  "Tidel Park":       { lat: 13.0083, lng: 80.2417 },
  "Palavakkam":       { lat: 12.9667, lng: 80.2583 },
  "Neelankarai":      { lat: 12.9500, lng: 80.2583 },
  "Injambakkam":      { lat: 12.9167, lng: 80.2500 },
  "Akkarai":          { lat: 12.9000, lng: 80.2417 },
  "Uthandi":          { lat: 12.8667, lng: 80.2417 },
  // Surrounding areas
  "Thiruvallur":      { lat: 13.1333, lng: 79.9167 },
  "Kanchipuram":      { lat: 12.8342, lng: 79.7036 },
  "Chengalpattu":     { lat: 12.6917, lng: 79.9750 },
  "Mahabalipuram":    { lat: 12.6208, lng: 80.1989 },
  "Pondicherry":      { lat: 11.9139, lng: 79.8145 },
  // Other TN cities
  "Coimbatore":       { lat: 11.0168, lng: 76.9558 },
  "Madurai":          { lat: 9.9252,  lng: 78.1198 },
  "Trichy":           { lat: 10.7905, lng: 78.7047 },
  "Salem":            { lat: 11.6643, lng: 78.1460 },
  "Tirunelveli":      { lat: 8.7139,  lng: 77.7567 },
};

/** Haversine distance in km between two lat/lng points */
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Returns the name of the nearest tracked location to the given coordinates */
export function getNearestLocation(lat: number, lng: number): string {
  let nearest = "Velachery";
  let minDist = Infinity;

  for (const [name, coords] of Object.entries(locationCoordinates)) {
    const dist = haversineDistance(lat, lng, coords.lat, coords.lng);
    if (dist < minDist) {
      minDist = dist;
      nearest = name;
    }
  }
  return nearest;
}

/** Promisified wrapper around the browser Geolocation API */
export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    });
  });
}
