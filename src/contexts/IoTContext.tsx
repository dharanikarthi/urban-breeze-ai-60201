/**
 * IoTContext — provides live sensor data to the entire application.
 *
 * Wraps the iotDataService singleton so any component can call
 * `useIoT()` without managing its own subscription / cleanup.
 */
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { iotDataService, IoTSensorData, IoTStatus } from "@/services/iotDataService";

interface IoTContextValue {
  data: IoTSensorData | null;
  status: IoTStatus;
  error: string | null;
  hardwareOnline: boolean;
  /** Rolling history (newest first, max 50 entries) */
  history: IoTSensorData[];
}

const IoTContext = createContext<IoTContextValue>({
  data: null,
  status: "idle",
  error: null,
  hardwareOnline: false,
  history: [],
});

export const IoTProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData]                 = useState<IoTSensorData | null>(null);
  const [status, setStatus]             = useState<IoTStatus>("idle");
  const [error, setError]               = useState<string | null>(null);
  const [hardwareOnline, setHwOnline]   = useState(false);
  const [history, setHistory]           = useState<IoTSensorData[]>([]);

  useEffect(() => {
    const unsub = iotDataService.subscribe((d, s, e, hw) => {
      setData(d);
      setStatus(s);
      setError(e);
      setHwOnline(hw);
      setHistory(iotDataService.getHistory());
    });
    return unsub;
  }, []);

  return (
    <IoTContext.Provider value={{ data, status, error, hardwareOnline, history }}>
      {children}
    </IoTContext.Provider>
  );
};

export const useIoT = () => useContext(IoTContext);
