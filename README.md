# 🌬️ Urban Breeze - AI Air Quality Monitoring System

<div align="center">

![Urban Breeze](https://img.shields.io/badge/Urban%20Breeze-AI%20Powered-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css)

**A comprehensive, real-time air quality monitoring system delivering personalized health insights and forecasts for safer urban living across Tamil Nadu.**

[Live Demo](https://lovable.dev/projects/39170d25-6225-4484-8484-a91b18b7c061) | [Documentation](#features) | [Report Bug](https://github.com/dharanikarthi/Urban-Breeze/issues)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Key Components](#-key-components)
- [Data Management](#-data-management)
- [Mobile Optimization](#-mobile-optimization)
- [Contributing](#-contributing)

---

## ✨ Features

### 🎯 Core Features

- **Real-Time AQI Monitoring**: Live air quality data for 100+ locations across Tamil Nadu
- **7-Day Forecast**: Professional, interactive charts with weather integration
- **Interactive Map**: Leaflet.js powered map with color-coded AQI markers
- **Personalized Health Alerts**: AI-driven recommendations based on user health profile
- **Location Search**: Autocomplete search with instant data updates
- **Live Data Updates**: Real-time data refresh every 2 seconds

### 🏥 Health Features

- **Health Profile System**: Personalized tracking for Asthma, COPD, Allergies, Heart conditions
- **Smart Recommendations**: Age-specific, condition-specific health guidance
- **Activity Level Tracking**: Customized advice based on user activity
- **Emergency Alerts**: Critical air quality warnings with evacuation guidance
- **Pollutant Breakdown**: Detailed analysis of PM2.5, PM10, CO, NO₂, O₃

### 📊 Analytics & Insights

- **Weekly Trends**: Historical AQI data visualization
- **Health Progress**: Track respiratory health improvements
- **Task Completion**: Gamified health task system
- **Achievement Badges**: Reward system for healthy behaviors
- **Points & Levels**: Progression system (Beginner → Legend)

### 🎨 User Experience

- **Mobile-First Design**: Fully responsive across all devices
- **Dark Mode Support**: Eye-friendly dark theme
- **Smooth Animations**: Professional transitions and effects
- **Touch-Optimized**: 44px minimum touch targets
- **Loading States**: Beautiful 2-second loading animations
- **Persistent Alerts**: Location-specific health notifications

---

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1** - UI library
- **TypeScript 5.8.3** - Type safety
- **Vite 5.4.19** - Build tool
- **Tailwind CSS 3.4.17** - Styling
- **Shadcn/ui** - Component library

### Data Visualization
- **Recharts 2.15.4** - Charts and graphs
- **Leaflet.js** - Interactive maps

### Data Management
- **PapaParse 5.5.3** - CSV parsing
- **React Query** - Data fetching

### Routing & State
- **React Router DOM 6.30.1** - Navigation
- **LocalStorage** - User data persistence

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/dharanikarthi/Urban-Breeze.git
cd Urban-Breeze
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open in browser**
```
http://localhost:5173
```

### Quick Start Scripts

**Windows:**
```bash
run.bat
```

**Linux/Mac:**
```bash
chmod +x start_app.sh
./start_app.sh
```

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
Urban-Breeze/
├── public/
│   └── data/                    # CSV data files
│       ├── aqi_data.csv         # 100+ locations AQI data
│       ├── forecast_data.csv    # 7-day forecast
│       ├── weekly_aqi_data.csv  # Historical trends
│       ├── health_progress_data.csv
│       └── task_completion_data.csv
├── src/
│   ├── components/
│   │   ├── dashboard/           # Dashboard components
│   │   │   ├── RealTimeAQI.tsx
│   │   │   ├── ForecastSection.tsx
│   │   │   ├── InteractiveMap.tsx
│   │   │   ├── PollutantBreakdown.tsx
│   │   │   └── RecommendationsSection.tsx
│   │   ├── ui/                  # Shadcn UI components
│   │   ├── HealthProfileModal.tsx
│   │   ├── Sidebar.tsx
│   │   └── Navigation.tsx
│   ├── pages/
│   │   ├── Index.tsx            # Landing page
│   │   ├── Dashboard.tsx        # Main dashboard
│   │   ├── Insights.tsx         # Analytics page
│   │   ├── Profile.tsx          # User profile
│   │   └── Settings.tsx         # Settings page
│   ├── services/
│   │   ├── csvService.ts        # CSV data loading
│   │   └── liveDataService.ts   # Real-time updates
│   ├── lib/
│   │   └── utils.ts             # Utility functions
│   └── index.css                # Global styles
├── CSV_DATA_GUIDE.md            # Data documentation
├── LIVE_DATA_FEATURES.md        # Live data docs
├── MOBILE_OPTIMIZATION.md       # Mobile guide
└── README.md
```

---

## 🔑 Key Components

### Dashboard
- **Real-Time AQI Display**: Current air quality with live updates
- **Location Search**: Autocomplete with 100+ locations
- **Health Alerts**: Personalized safety recommendations
- **Interactive Map**: Leaflet.js map with AQI markers
- **Forecast Charts**: Professional 7-day predictions

### Health Profile System
- **Initial Setup**: One-time modal on first visit
- **Profile Data**: Name, age, gender, location, health conditions
- **Activity Level**: Low, moderate, active
- **Alert Preferences**: Email, SMS, in-app

### Insights Page
- **Weekly Trends**: AQI exposure over time
- **Health Progress**: Respiratory health tracking
- **Task Completion**: Gamified health tasks
- **Achievement System**: Badges and rewards

---

## 📊 Data Management

### CSV Data Structure

**AQI Data (100+ locations)**
```csv
location,aqi,pm25,pm10,co,no2,o3
Velachery,85,42,68,0.8,28,35
Anna Nagar,72,35,58,0.6,24,30
```

**Forecast Data (7 days)**
```csv
date,aqi,condition,temperature,humidity
2024-01-15,75,Sunny,28,65
2024-01-16,82,Cloudy,27,70
```

### Live Data Updates
- **Interval**: 2 seconds
- **Variation**: ±2-3 AQI points
- **Pollutants**: Small realistic changes
- **Smooth**: No jarring jumps

---

## 📱 Mobile Optimization

### Responsive Design
- **Breakpoints**: 640px, 768px, 1024px, 1280px
- **Touch Targets**: Minimum 44x44px
- **Font Sizes**: 16px inputs (prevents iOS zoom)
- **Spacing**: Mobile-first approach

### Performance
- **First Paint**: < 1.5s
- **Interactive**: < 3.5s
- **Smooth Scrolling**: Hardware accelerated
- **Optimized Assets**: Lazy loading

See [MOBILE_OPTIMIZATION.md](MOBILE_OPTIMIZATION.md) for details.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Authors

- **Dharani Karthi** - *Initial work* - [dharanikarthi](https://github.com/dharanikarthi)

---

## 🙏 Acknowledgments

- OpenStreetMap for map tiles
- Shadcn/ui for component library
- Recharts for data visualization
- Leaflet.js for interactive maps
- Tamil Nadu Pollution Control Board for inspiration

---

<div align="center">

**Made with ❤️ for cleaner air and healthier living**

⭐ Star this repo if you find it helpful!

</div>
