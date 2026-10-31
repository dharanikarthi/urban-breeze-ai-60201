import Papa from 'papaparse';

export interface AQILocation {
  name: string;
  aqi: number;
  pollutants: {
    pm25: number;
    pm10: number;
    co: number;
    no2: number;
    o3: number;
  };
}

export interface ForecastData {
  date: string;
  aqi: number;
  condition: string;
  temperature: number;
  humidity: number;
}

export interface WeeklyAQIData {
  day: string;
  aqi: number;
  exposure: number;
}

export interface HealthProgressData {
  week: string;
  score: number;
}

export interface TaskCompletionData {
  name: string;
  value: number;
  color: string;
}

class CSVService {
  private async loadCSV(filename: string): Promise<any[]> {
    try {
      const response = await fetch(`/data/${filename}`);
      const csvText = await response.text();
      
      return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            console.log(`✅ Loaded ${filename}:`, results.data.length, 'records');
            resolve(results.data);
          },
          error: (error) => {
            console.error(`❌ Error parsing ${filename}:`, error);
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error(`❌ Error loading ${filename}:`, error);
      throw error;
    }
  }

  async getAQIData(): Promise<AQILocation[]> {
    const data = await this.loadCSV('aqi_data.csv');
    return data.map((row: any) => ({
      name: row.location,
      aqi: Number(row.aqi),
      pollutants: {
        pm25: Number(row.pm25),
        pm10: Number(row.pm10),
        co: Number(row.co),
        no2: Number(row.no2),
        o3: Number(row.o3)
      }
    }));
  }

  async getForecastData(): Promise<ForecastData[]> {
    const data = await this.loadCSV('forecast_data.csv');
    return data.map((row: any) => ({
      date: row.date,
      aqi: Number(row.aqi),
      condition: row.condition,
      temperature: Number(row.temperature),
      humidity: Number(row.humidity)
    }));
  }

  async getWeeklyAQIData(): Promise<WeeklyAQIData[]> {
    const data = await this.loadCSV('weekly_aqi_data.csv');
    return data.map((row: any) => ({
      day: row.day,
      aqi: Number(row.aqi),
      exposure: Number(row.exposure)
    }));
  }

  async getHealthProgressData(): Promise<HealthProgressData[]> {
    const data = await this.loadCSV('health_progress_data.csv');
    return data.map((row: any) => ({
      week: row.week,
      score: Number(row.score)
    }));
  }

  async getTaskCompletionData(): Promise<TaskCompletionData[]> {
    const data = await this.loadCSV('task_completion_data.csv');
    return data.map((row: any) => ({
      name: row.name,
      value: Number(row.value),
      color: row.name === 'Completed' ? 'hsl(var(--aqi-good))' : 'hsl(var(--muted))'
    }));
  }
}

export const csvService = new CSVService();