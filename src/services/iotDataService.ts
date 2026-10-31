/**
 * IoT Data Service — Urban Breeze
 * Polls /api/iot-data every 3 s and exposes sensor readings + hardware
 * connection status to the entire application.
 *
 * Hardware-online detection:
 *   The IoT device page updates its "Reading Time" field when the hardware is
 *   actively sending data.  We keep a rolling buffer of the last N readingTime
 *   values.  If the same timestamp repeats across STALE_THRESHOLD consecutive
 *   polls the device is considered offline / disconnected.
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
  | 'idle'      // never fetched yet
  | 'loading'   // first fetch in progress
  | 'ok'        // data received, hardware online
  | 'stale'     // data received but hardware appears disconnected
  | 'error';    // network/proxy error

/** How many consecutive polls with the same readingTime before we call it stale */
const STALE_THRESHOLD = 4;
const POLL_INTERVAL_MS = 3000;
const API_URL = '/api/iot-data';

type Listener = (
  data: IoTSensorData | null,
  status: IoTStatus,
  error: string | null,
  hardwareOnline: boolean
) => void;

class IoTDataService {
  private listeners: Set<Listener> = new Set();
  private timerId: ReturnType<typeof setInterval> | null = null;
  private latestData: IoTSensorData | null = null;
  private status: IoTStatus = 'idle';
  private lastError: string | null = null;
  private refCount = 0;

  /** Rolling buffer of the last STALE_THRESHOLD+1 readingTime strings */
  private readingTimeHistory: (string | null)[] = [];
  private hardwareOnline = false;

  /** History of readings used by Insights charts (capped at 50 entries) */
  private sensorHistory: IoTSensorData[] = [];
  readonly MAX_HISTORY = 50;

  // ─── Public API ──────────────────────────────────────────────────────────

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    this.refCount++;
    // Immediately deliver current state
    listener(this.latestData, this.status, this.lastError, this.hardwareOnline);
    if (this.refCount === 1) this.startPolling();
    return () => {
      this.listeners.delete(listener);
      this.refCount = Math.max(0, this.refCount - 1);
      if (this.refCount === 0) this.stopPolling();
    };
  }

  getLatest(): IoTSensorData | null { return this.latestData; }
  getStatus(): IoTStatus { return this.status; }
  isHardwareOnline(): boolean { return this.hardwareOnline; }

  /** Last N sensor snapshots (newest first) */
  getHistory(): IoTSensorData[] { return [...this.sensorHistory].reverse(); }

  // ─── Polling ──────────────────────────────────────────────────────────────

  private startPolling() {
    this.fetchData();
    this.timerId = setInterval(() => this.fetchData(), POLL_INTERVAL_MS);
  }

  private stopPolling() {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private async fetchData() {
    // While waiting, keep current status unless this is the very first fetch
    if (this.status === 'idle') {
      this.status = 'loading';
      this.notify();
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 9000);

      const response = await fetch(API_URL, {
        signal: controller.signal,
        cache: 'no-store',
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new Error(`API error ${response.status}: ${body.slice(0, 120)}`);
      }

      const json: IoTSensorData = await response.json();

      // ── Hardware online detection ─────────────────────────────────────────
      this.readingTimeHistory.push(json.readingTime);
      if (this.readingTimeHistory.length > STALE_THRESHOLD + 1) {
        this.readingTimeHistory.shift();
      }

      const allSame =
        this.readingTimeHistory.length >= STALE_THRESHOLD &&
        this.readingTimeHistory.every(t => t === this.readingTimeHistory[0]);

      this.hardwareOnline = !allSame;

      // ── Store data ────────────────────────────────────────────────────────
      this.latestData = json;
      this.lastError = null;
      this.status = allSame ? 'stale' : 'ok';

      // Push to history only when readingTime changes (new real reading)
      const prevReading = this.sensorHistory[this.sensorHistory.length - 1];
      if (!prevReading || prevReading.readingTime !== json.readingTime) {
        this.sensorHistory.push(json);
        if (this.sensorHistory.length > this.MAX_HISTORY) {
          this.sensorHistory.shift();
        }
      }
    } catch (err: unknown) {
      const e = err as { name?: string; message?: string };
      this.lastError = e?.name === 'AbortError' ? 'Request timed out' : (e?.message ?? 'Unknown error');
      this.status = 'error';
      this.hardwareOnline = false;
    }

    this.notify();
  }

  private notify() {
    for (const listener of this.listeners) {
      listener(this.latestData, this.status, this.lastError, this.hardwareOnline);
    }
  }
}

/** Singleton shared across the entire app */
export const iotDataService = new IoTDataService();
