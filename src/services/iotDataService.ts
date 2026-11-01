/**
 * IoT Data Service — Urban Breeze
 *
 * Polls /api/iot-data every 3 s.  Pre-seeds the history with 24 hours of
 * realistic sample data so charts are never blank on first load.
 *
 * Hardware-online detection:
 *   Rolling buffer of last STALE_THRESHOLD readingTime values.
 *   If all identical → status = 'stale', hardwareOnline = false.
 */

export interface IoTSensorData {
  mq135: number | null;        // Gas concentration, ppm
  temperature: number | null;  // °C
  humidity: number | null;     // %
  latitude: number | null;
  longitude: number | null;
  speed: number | null;        // km/h
  readingTime: string | null;  // as reported by device
  aqi: number | null;          // derived from MQ135
  fetchedAt: string;           // ISO — when proxy retrieved data
}

export type IoTStatus =
  | 'idle'
  | 'loading'
  | 'ok'
  | 'stale'
  | 'error';

const STALE_THRESHOLD  = 4;
const POLL_INTERVAL_MS = 3000;
const API_URL          = '/api/iot-data';

type Listener = (
  data: IoTSensorData | null,
  status: IoTStatus,
  error: string | null,
  hardwareOnline: boolean
) => void;

// ─── Sample seed data — 24 hours of realistic Chennai readings ───────────────

function buildSeedHistory(): IoTSensorData[] {
  const now    = Date.now();
  const hour   = 3600_000;
  const seed: IoTSensorData[] = [];

  // Typical Chennai AQI pattern: lower at night, peaks mid-morning & evening rush
  const hourlyAqi = [
    68, 65, 62, 60, 58, 63, 72, 85, 95, 92, 88, 84,
    82, 80, 83, 87, 91, 96, 94, 88, 82, 78, 74, 70,
  ];
  const hourlyTemp = [
    28, 27, 27, 26, 26, 27, 28, 29, 30, 31, 32, 33,
    34, 35, 35, 34, 33, 32, 31, 30, 30, 29, 29, 28,
  ];
  const hourlyHum = [
    72, 74, 75, 76, 77, 75, 72, 68, 65, 63, 61, 60,
    59, 58, 59, 61, 63, 65, 67, 69, 70, 71, 72, 72,
  ];

  for (let i = 23; i >= 0; i--) {
    const ts  = new Date(now - i * hour);
    const idx = 23 - i;
    const aqi = hourlyAqi[idx] + Math.round((Math.random() - 0.5) * 6);

    // format "YYYY-MM-DD HH:MM:SS"
    const pad  = (n: number) => String(n).padStart(2, "0");
    const rtStr = `${ts.getFullYear()}-${pad(ts.getMonth()+1)}-${pad(ts.getDate())} ${pad(ts.getHours())}:${pad(ts.getMinutes())}:${pad(ts.getSeconds())}`;

    // MQ135 ppm back-calculated from AQI
    const ppm = Math.round(aqi * 3.5);

    seed.push({
      mq135:       ppm,
      temperature: hourlyTemp[idx] + parseFloat((Math.random() * 0.6 - 0.3).toFixed(1)),
      humidity:    hourlyHum[idx]  + Math.round(Math.random() * 2 - 1),
      latitude:    13.034107,
      longitude:   80.230168,
      speed:       parseFloat((Math.random() * 0.3).toFixed(2)),
      readingTime: rtStr,
      aqi:         Math.max(0, aqi),
      fetchedAt:   ts.toISOString(),
    });
  }
  return seed;
}

// ─── Service ─────────────────────────────────────────────────────────────────

class IoTDataService {
  private listeners: Set<Listener>          = new Set();
  private timerId: ReturnType<typeof setInterval> | null = null;
  private latestData: IoTSensorData | null  = null;
  private status: IoTStatus                 = 'idle';
  private lastError: string | null          = null;
  private refCount                          = 0;

  private readingTimeHistory: (string | null)[] = [];
  private hardwareOnline                    = false;

  /** Circular history buffer — newest at the tail */
  private sensorHistory: IoTSensorData[] = buildSeedHistory();
  readonly MAX_HISTORY = 50;

  // ─── Public ───────────────────────────────────────────────────────────────

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    this.refCount++;
    listener(this.latestData, this.status, this.lastError, this.hardwareOnline);
    if (this.refCount === 1) this.startPolling();
    return () => {
      this.listeners.delete(listener);
      this.refCount = Math.max(0, this.refCount - 1);
      if (this.refCount === 0) this.stopPolling();
    };
  }

  getLatest():        IoTSensorData | null { return this.latestData; }
  getStatus():        IoTStatus            { return this.status; }
  isHardwareOnline(): boolean              { return this.hardwareOnline; }

  /** Newest-first for UI consumption */
  getHistory(): IoTSensorData[] { return [...this.sensorHistory].reverse(); }

  // ─── Polling ──────────────────────────────────────────────────────────────

  private startPolling() {
    this.fetchData();
    this.timerId = setInterval(() => this.fetchData(), POLL_INTERVAL_MS);
  }
  private stopPolling() {
    if (this.timerId !== null) { clearInterval(this.timerId); this.timerId = null; }
  }

  private async fetchData() {
    if (this.status === 'idle') { this.status = 'loading'; this.notify(); }

    try {
      const controller = new AbortController();
      const timeout    = setTimeout(() => controller.abort(), 9000);
      const response   = await fetch(API_URL, { signal: controller.signal, cache: 'no-store' });
      clearTimeout(timeout);

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new Error(`API error ${response.status}: ${body.slice(0, 120)}`);
      }

      const json: IoTSensorData = await response.json();

      // Hardware-stale detection
      this.readingTimeHistory.push(json.readingTime);
      if (this.readingTimeHistory.length > STALE_THRESHOLD + 1) this.readingTimeHistory.shift();
      const allSame =
        this.readingTimeHistory.length >= STALE_THRESHOLD &&
        this.readingTimeHistory.every(t => t === this.readingTimeHistory[0]);

      this.hardwareOnline = !allSame;
      this.latestData     = json;
      this.lastError      = null;
      this.status         = allSame ? 'stale' : 'ok';

      // Only push when readingTime changes (real new reading)
      const prev = this.sensorHistory[this.sensorHistory.length - 1];
      if (!prev || prev.readingTime !== json.readingTime) {
        this.sensorHistory.push(json);
        if (this.sensorHistory.length > this.MAX_HISTORY) this.sensorHistory.shift();
      }
    } catch (err: unknown) {
      const e = err as { name?: string; message?: string };
      this.lastError      = e?.name === 'AbortError' ? 'Request timed out' : (e?.message ?? 'Unknown error');
      this.status         = 'error';
      this.hardwareOnline = false;
    }

    this.notify();
  }

  private notify() {
    for (const l of this.listeners) l(this.latestData, this.status, this.lastError, this.hardwareOnline);
  }
}

export const iotDataService = new IoTDataService();
