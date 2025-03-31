# Novo Nordisk Manufacturing Analytics Dashboard v4

This dashboard provides comprehensive analytics for pharmaceutical manufacturing processes, with a focus on lot-based analysis for Novo Nordisk products.

## Features

- **Overall Dashboard** - High-level KPIs and real-time charts showing manufacturing performance metrics
- **RFT Analysis** - Right First Time metrics for internal and external quality measurements
- **Lot Analysis** - Detailed analysis of individual manufacturing lots with timeline events and insights
- **Process Metrics** - In-depth views of manufacturing process efficiency and cycle times
- **Predictive Insights** - ML-driven predictions and recommendations to improve manufacturing quality

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Installation

1. Clone the repository or extract the zip file to your local machine
2. Run the `start-dashboard.bat` file by double-clicking it
3. The dashboard will open automatically in your default browser

If the dashboard doesn't open automatically, navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## Data Integration

The dashboard reads manufacturing data from the `dashboard_data.json` file, which contains records of manufacturing processes, quality measurements, and lot information. The data is automatically loaded and processed when the dashboard starts.

### Data Processing

The dashboard performs the following data processing operations:

1. **Lot Identification** - Records are grouped by lot ID for lot-based analysis
2. **RFT Calculation** - Right First Time metrics are calculated for each lot and overall
3. **Trend Analysis** - Historical trends are analyzed to identify patterns
4. **Insight Generation** - Predictive insights are generated based on historical data

## Dashboard Sections

### Main Dashboard

The main dashboard provides a high-level overview of manufacturing performance, including:

- Key Performance Indicators (KPIs)
- RFT Trend charts
- Lot performance table

### Lot Analysis

The Lot Analysis page allows you to:

- View summary metrics for all lots
- Select individual lots for detailed analysis
- See timeline events for each lot
- Review insights and recommendations specific to each lot

### Other Pages

- **Internal RFT** - Focuses on internal quality measurements
- **External RFT** - Analyzes external quality reports
- **Process Metrics** - Examines manufacturing process efficiency
- **Predictive Insights** - Provides ML-driven recommendations

## Customization

The dashboard can be customized by:

1. Modifying the `dashboard_data.json` file to include your own manufacturing data
2. Editing the React components in the `src` directory to change the dashboard layout and appearance
3. Adjusting the data processing logic in `src/services/DataService.ts` to match your data structure

## Technology Stack

- React 18
- TypeScript
- Material UI
- Nivo Charts
- React Grid Layout
- Date-fns

## Support

For questions or support, please contact your IT department or the dashboard development team. 