# Urban Breeze AI - CSV Data Guide

## Overview
The Urban Breeze AI dashboard now loads all data directly from CSV files located in the `public/data/` directory. No backend server is required!

## CSV Files

### 1. aqi_data.csv
**Location:** `public/data/aqi_data.csv`
**Used in:** Dashboard → Real-Time AQI section
**Columns:**
- `location` - Name of the location (e.g., "Velachery")
- `aqi` - Air Quality Index value (0-500)
- `pm25` - PM2.5 particulate matter level
- `pm10` - PM10 particulate matter level
- `co` - Carbon monoxide level
- `no2` - Nitrogen dioxide level
- `o3` - Ozone level

**Current Data:** 30 locations across Tamil Nadu

### 2. forecast_data.csv
**Location:** `public/data/forecast_data.csv`
**Used in:** Dashboard → Forecast section
**Columns:**
- `date` - Forecast day (e.g., "Day 1", "Day 2")
- `aqi` - Predicted AQI value
- `condition` - Weather condition description
- `temperature` - Temperature in Celsius
- `humidity` - Humidity percentage

**Current Data:** 30-day forecast

### 3. weekly_aqi_data.csv
**Location:** `public/data/weekly_aqi_data.csv`
**Used in:** Insights page → Weekly AQI Exposure chart
**Columns:**
- `day` - Day identifier (e.g., "Week1-Mon")
- `aqi` - AQI value for that day
- `exposure` - Exposure hours

**Current Data:** 30 data points covering multiple weeks

### 4. health_progress_data.csv
**Location:** `public/data/health_progress_data.csv`
**Used in:** Insights page → Health Progress Score chart
**Columns:**
- `week` - Week identifier (e.g., "Week 1")
- `score` - Health score value

**Current Data:** 30 weeks of health progression

### 5. task_completion_data.csv
**Location:** `public/data/task_completion_data.csv`
**Used in:** Insights page → Task Completion pie chart
**Columns:**
- `name` - Task status ("Completed" or "Pending")
- `value` - Number of tasks

**Current Data:** Task completion statistics

## How to Update Data

1. **Edit CSV Files:**
   - Open any CSV file in `public/data/` with a text editor or Excel
   - Modify the values as needed
   - Save the file

2. **Refresh Browser:**
   - Simply refresh the browser (F5)
   - The charts will automatically update with new data

3. **Add More Data:**
   - Add new rows to any CSV file
   - Keep the same column structure
   - The charts will automatically accommodate more data points

## Chart Mapping

| Page | Section | CSV File | Chart Type |
|------|---------|----------|------------|
| Dashboard | Real-Time AQI | aqi_data.csv | Gauge + Map |
| Dashboard | Forecast | forecast_data.csv | Line Chart |
| Dashboard | Pollutants | aqi_data.csv | Bar Chart |
| Insights | Weekly AQI | weekly_aqi_data.csv | Area Chart |
| Insights | Health Progress | health_progress_data.csv | Line Chart |
| Insights | Task Completion | task_completion_data.csv | Pie Chart |

## Technical Details

- **CSV Parser:** PapaParse library
- **Loading:** Automatic on page load
- **Caching:** Browser caches CSV files (refresh to reload)
- **Error Handling:** Falls back to "No Data Available" if CSV fails to load

## Tips

- Keep CSV files properly formatted with headers
- Use consistent data types (numbers for numeric columns)
- Don't use special characters in location names
- Test changes by refreshing the browser
- Check browser console for any loading errors