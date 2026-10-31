import { AQILocation, ForecastData, WeeklyAQIData, HealthProgressData, TaskCompletionData } from './csvService';

class LiveDataService {
  private updateInterval: number = 2000; // 2 seconds

  // Generate small random variation for AQI values
  private varyValue(value: number, maxChange: number = 3): number {
    const change = (Math.random() - 0.5) * 2 * maxChange;
    return Math.max(0, Math.round(value + change));
  }

  // Generate small random variation for decimal values
  private varyDecimal(value: number, maxChange: number = 0.2): number {
    const change = (Math.random() - 0.5) * 2 * maxChange;
    return Math.max(0, Number((value + change).toFixed(1)));
  }

  // Update AQI location data with small variations
  updateAQIData(data: AQILocation[]): AQILocation[] {
    return data.map(location => ({
      ...location,
      aqi: this.varyValue(location.aqi, 3),
      pollutants: {
        pm25: this.varyDecimal(location.pollutants.pm25, 2),
        pm10: this.varyDecimal(location.pollutants.pm10, 3),
        co: this.varyDecimal(location.pollutants.co, 0.1),
        no2: this.varyDecimal(location.pollutants.no2, 1.5),
        o3: this.varyDecimal(location.pollutants.o3, 2)
      }
    }));
  }

  // Update forecast data with small variations
  updateForecastData(data: ForecastData[]): ForecastData[] {
    return data.map(forecast => ({
      ...forecast,
      aqi: this.varyValue(forecast.aqi, 2),
      temperature: this.varyValue(forecast.temperature, 1),
      humidity: this.varyValue(forecast.humidity, 2)
    }));
  }

  // Update weekly AQI data with small variations
  updateWeeklyAQIData(data: WeeklyAQIData[]): WeeklyAQIData[] {
    return data.map(week => ({
      ...week,
      aqi: this.varyValue(week.aqi, 2),
      exposure: this.varyDecimal(week.exposure, 0.3)
    }));
  }

  // Update health progress data with small variations
  updateHealthProgressData(data: HealthProgressData[]): HealthProgressData[] {
    return data.map(health => ({
      ...health,
      score: this.varyValue(health.score, 2)
    }));
  }

  // Update task completion data with small variations
  updateTaskCompletionData(data: TaskCompletionData[]): TaskCompletionData[] {
    return data.map(task => ({
      ...task,
      value: Math.max(0, this.varyValue(task.value, 1))
    }));
  }

  getUpdateInterval(): number {
    return this.updateInterval;
  }
}

export const liveDataService = new LiveDataService();