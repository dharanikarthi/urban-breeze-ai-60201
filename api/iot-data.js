/**
 * Vercel Serverless Function - IoT Data Proxy
 * Scrapes https://iotcloud22.in/4991/demo.php and returns parsed sensor data as JSON.
 * This avoids CORS issues when the browser fetches from a different origin.
 */

export default async function handler(req, res) {
  // Allow requests from any origin (required for Vercel frontend calling this API)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const response = await fetch('https://iotcloud22.in/4991/demo.php', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; UrbanBreezeBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      // 8 second timeout to keep well within Vercel's 10s limit for hobby tier
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      throw new Error(`Upstream responded with ${response.status}`);
    }

    const html = await response.text();

    // Parse every label/value pair produced by the IoT page.
    // The page renders rows like:
    //   <some tag> Label </some tag>
    //   <some tag> Value unit </some tag>
    // We extract all text nodes that look like a label followed by a value.
    const data = parseSensorHtml(html);

    if (!data) {
      return res.status(502).json({ error: 'Could not parse sensor data from upstream page' });
    }

    // Cache for 2 seconds on the CDN edge so back-to-back polls don't hammer the source
    res.setHeader('Cache-Control', 's-maxage=2, stale-while-revalidate=1');
    return res.status(200).json(data);
  } catch (err) {
    console.error('[iot-data] fetch error:', err.message);
    return res.status(502).json({ error: err.message || 'Failed to fetch IoT data' });
  }
}

/**
 * Parses the plain-text content returned by the IoT page.
 * The page structure (stripped of HTML tags) looks like:
 *   Sensor Values
 *   MQ135 Gas   12ppm
 *   Temperature   31.60 °C
 *   Humidity   70.10 %
 *   Latitude   13.034107
 *   Longitude   80.230168
 *   Speed   0.07 km/h
 *   Reading Time   2026-10-24 14:04:04
 */
function parseSensorHtml(html) {
  // Strip all HTML tags to get plain text
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Helper: extract numeric value from a string like "12ppm", "31.60 °C", "70.10 %", "0.07 km/h"
  const parseNum = (str) => {
    const m = str.match(/[-+]?\d+\.?\d*/);
    return m ? parseFloat(m[0]) : null;
  };

  // Helper: find the value that follows a label keyword in the text
  const extractAfter = (label) => {
    // Build a pattern: label followed by optional whitespace and then captured content up to next known label or end
    const knownLabels = ['MQ135 Gas', 'Temperature', 'Humidity', 'Latitude', 'Longitude', 'Speed', 'Reading Time'];
    const labelIdx = text.indexOf(label);
    if (labelIdx === -1) return null;
    const afterLabel = text.slice(labelIdx + label.length).trimStart();
    // Cut off at the next known label
    let end = afterLabel.length;
    for (const other of knownLabels) {
      if (other === label) continue;
      const idx = afterLabel.indexOf(other);
      if (idx !== -1 && idx < end) end = idx;
    }
    return afterLabel.slice(0, end).trim();
  };

  const mqRaw       = extractAfter('MQ135 Gas');
  const tempRaw     = extractAfter('Temperature');
  const humidRaw    = extractAfter('Humidity');
  const latRaw      = extractAfter('Latitude');
  const lonRaw      = extractAfter('Longitude');
  const speedRaw    = extractAfter('Speed');
  const timeRaw     = extractAfter('Reading Time');

  // If nothing was extracted the page likely changed or failed
  if (!mqRaw && !tempRaw) return null;

  const mq135      = parseNum(mqRaw)   ?? null;
  const temperature = parseNum(tempRaw) ?? null;
  const humidity   = parseNum(humidRaw) ?? null;
  const latitude   = parseNum(latRaw)   ?? null;
  const longitude  = parseNum(lonRaw)   ?? null;
  const speed      = parseNum(speedRaw) ?? null;

  // Derive a simple AQI estimate from MQ135 ppm value.
  // MQ135 measures mixed gases (CO2, NH3, NOx, benzene, smoke).
  // A rough linear mapping: 0–50 ppm → Good, 50–150 → Moderate, etc.
  const deriveAQI = (ppm) => {
    if (ppm === null) return null;
    if (ppm <= 50)  return Math.round((ppm / 50) * 50);          // 0–50 (Good)
    if (ppm <= 150) return Math.round(50 + ((ppm - 50) / 100) * 50);  // 50–100 (Moderate)
    if (ppm <= 300) return Math.round(100 + ((ppm - 150) / 150) * 50); // 100–150 (Sensitive)
    if (ppm <= 500) return Math.round(150 + ((ppm - 300) / 200) * 50); // 150–200 (Unhealthy)
    return Math.min(300, Math.round(200 + ((ppm - 500) / 500) * 100));  // 200–300
  };

  return {
    mq135,
    temperature,
    humidity,
    latitude,
    longitude,
    speed,
    readingTime: timeRaw || null,
    aqi: deriveAQI(mq135),
    fetchedAt: new Date().toISOString(),
  };
}
