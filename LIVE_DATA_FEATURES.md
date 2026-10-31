# Urban Breeze AI - Live Data Features

## 🔄 Real-Time Data Updates

All charts across the application now update automatically every **2 seconds** with small, observable variations to simulate live air quality monitoring.

### Updated Pages:

1. **Dashboard - Real-Time AQI Section**
   - AQI values change every 2 seconds
   - Pollutant levels (PM2.5, PM10, CO, NO2, O3) vary slightly
   - Changes are minimal but observable (±2-3 points for AQI)

2. **Dashboard - Forecast Section**
   - Forecast AQI values update live
   - Temperature and humidity values vary slightly
   - Condition descriptions remain stable

3. **Dashboard - Pollutants Section**
   - All pollutant breakdowns update in real-time
   - Synchronized with Real-Time AQI data

4. **Insights Page**
   - Weekly AQI trends update live
   - Health progress scores vary slightly
   - Task completion numbers change dynamically

## 🔍 Search Functionality

### Real-Time AQI Search
**Location:** Dashboard → Real-Time Tab

- Search bar at the top of the section
- Search by location name (e.g., "Velachery", "Anna Nagar")
- Real-time filtering as you type
- Shows "No locations found" if search yields no results
- Clear search button to reset

**Chennai-Based Locations (30 total):**
- Velachery, Tambaram, Anna Nagar, T. Nagar
- Coimbatore, Madurai, Trichy, Adyar
- Mylapore, Guindy, Porur, Chrompet
- Pallavaram, Sholinganallur, OMR, ECR
- Perungudi, Thoraipakkam, Navalur, Siruseri
- Vandalur, Poonamallee, Avadi, Ambattur
- Red Hills, Thiruvallur, Kanchipuram, Chengalpattu
- Mahabalipuram, Pondicherry

### Forecast Search
**Location:** Dashboard → Forecast Tab

- Search bar at the top of the forecast section
- Search by day (e.g., "Day 1", "Day 15")
- Search by condition (e.g., "Moderate", "Unhealthy")
- Real-time filtering as you type
- Shows "No forecast found" if search yields no results
- Clear search button to reset

## 📊 Live Data Variation Details

### AQI Values
- **Variation Range:** ±3 points
- **Update Frequency:** Every 2 seconds
- **Example:** 85 → 87 → 84 → 86

### Pollutants
- **PM2.5:** ±2 points
- **PM10:** ±3 points
- **CO:** ±0.1 points
- **NO2:** ±1.5 points
- **O3:** ±2 points

### Temperature & Humidity
- **Temperature:** ±1°C
- **Humidity:** ±2%

### Health Scores
- **Variation Range:** ±2 points
- **Update Frequency:** Every 2 seconds

### Task Completion
- **Variation Range:** ±1 task
- **Update Frequency:** Every 2 seconds

## 🎯 Technical Implementation

### Live Data Service
**File:** `src/services/liveDataService.ts`

- Generates small random variations
- Maintains realistic value ranges
- Ensures values never go negative
- Updates all data types consistently

### Update Mechanism
- Uses `setInterval` with 2-second intervals
- Automatically starts when data is loaded
- Cleans up intervals on component unmount
- Independent updates for Dashboard and Insights

### Search Implementation
- Client-side filtering (instant results)
- Case-insensitive search
- Searches across multiple fields
- No API calls required

## 🚀 User Experience

### Visual Feedback
- Charts animate smoothly between values
- Last updated timestamp shows current time
- Search results appear instantly
- No loading states needed (data is already loaded)

### Performance
- Minimal CPU usage (simple calculations)
- No network requests for updates
- Smooth animations with Recharts
- Efficient React state updates

## 📝 Usage Tips

1. **Watching Live Updates:**
   - Open any chart page
   - Watch values change every 2 seconds
   - Changes are subtle but noticeable

2. **Using Search:**
   - Type location name in search bar
   - Results filter instantly
   - Clear search to see all data again

3. **Multiple Locations:**
   - Search for specific areas
   - Compare different locations
   - All data updates in real-time

## 🔧 Customization

To adjust update frequency, edit `liveDataService.ts`:

```typescript
private updateInterval: number = 2000; // Change to desired milliseconds
```

To adjust variation ranges, modify the `maxChange` parameters in:
- `varyValue()` - for integer values
- `varyDecimal()` - for decimal values