import React, { useState } from 'react';
import { Box, ToggleButtonGroup, ToggleButton, Typography, CircularProgress } from '@mui/material';
import { ResponsiveLine } from '@nivo/line';
import { format, parseISO } from 'date-fns';
import { useDataService, RftData } from '../../services/DataService';

// Time range options for the chart
const timeRangeOptions = [
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
  { value: '1y', label: '1Y' }
];

export const RftTrendChart: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [hoveredPoint, setHoveredPoint] = useState<any>(null);
  const { data, isLoading, error } = useDataService();
  
  const handleTimeRangeChange = (
    event: React.MouseEvent<HTMLElement>,
    newTimeRange: string | null,
  ) => {
    if (newTimeRange !== null) {
      setTimeRange(newTimeRange);
    }
  };
  
  // Filter data based on selected time range
  const getFilteredData = () => {
    if (!data?.rftTrend) return [];
    
    const now = new Date();
    let daysToInclude = 30;
    
    if (timeRange === '7d') daysToInclude = 7;
    else if (timeRange === '30d') daysToInclude = 30;
    else if (timeRange === '90d') daysToInclude = 90;
    else if (timeRange === '1y') daysToInclude = 365;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToInclude);
    
    return data.rftTrend.filter(d => new Date(d.date) >= cutoffDate);
  };
  
  // Format data for the chart
  const formatChartData = () => {
    const filteredData = getFilteredData();
    
    return [
      {
        id: 'Overall RFT',
        color: '#0070C0',
        data: filteredData.map(d => ({
          x: format(parseISO(d.date), 'MMM dd'),
          y: d.overall
        }))
      },
      {
        id: 'Internal RFT',
        color: '#70AD47',
        data: filteredData.map(d => ({
          x: format(parseISO(d.date), 'MMM dd'),
          y: d.internal
        }))
      },
      {
        id: 'External RFT',
        color: '#4472C4',
        data: filteredData.map(d => ({
          x: format(parseISO(d.date), 'MMM dd'),
          y: d.external
        }))
      }
    ];
  };
  
  // Add target line data
  const getTargetLineData = () => {
    const filteredData = getFilteredData();
    
    return {
      id: 'Target',
      color: '#E11A28',
      data: filteredData.map(d => ({
        x: format(parseISO(d.date), 'MMM dd'),
        y: 95.0 // Target line
      }))
    };
  };
  
  // Get latest values for each metric
  const getLatestValues = () => {
    const chartData = formatChartData();
    return chartData.map(dataset => {
      const values = dataset.data;
      const current = values.length > 0 ? values[values.length - 1].y : 0;
      const previous = values.length > 1 ? values[values.length - 2].y : current;
      
      return {
        id: dataset.id,
        color: dataset.color,
        value: current,
        previousValue: previous,
        change: current - previous,
      };
    });
  };
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error || !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography color="error">Error loading data: {error || 'Unknown error'}</Typography>
      </Box>
    );
  }
  
  const chartData = formatChartData();
  const targetLine = getTargetLineData();
  const latestValues = getLatestValues();
  
  return (
    <Box sx={{ height: '100%', position: 'relative' }}>
      <Box sx={{ position: 'absolute', top: 0, right: 0, zIndex: 1 }}>
        <ToggleButtonGroup
          size="small"
          value={timeRange}
          exclusive
          onChange={handleTimeRangeChange}
          aria-label="time range"
          sx={{ 
            '& .MuiToggleButton-root': {
              py: 0.25,
              px: 1,
              fontSize: '0.75rem',
              textTransform: 'none',
              color: 'text.secondary'
            },
            '& .Mui-selected': {
              backgroundColor: 'primary.main',
              color: 'white',
              '&:hover': {
                backgroundColor: 'primary.dark',
              }
            }
          }}
        >
          {timeRangeOptions.map(option => (
            <ToggleButton value={option.value} key={option.value}>
              {option.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
      
      <Box sx={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        zIndex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        gap: 1,
        p: 1
      }}>
        {latestValues.map((item) => (
          <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
              {item.id}: 
              <Typography 
                component="span" 
                variant="caption" 
                sx={{ 
                  fontWeight: 600, 
                  color: item.change > 0 ? 'success.main' : item.change < 0 ? 'error.main' : 'text.primary',
                  ml: 0.5
                }}
              >
                {item.value.toFixed(1)}%
                {item.change !== 0 && (
                  <Typography 
                    component="span" 
                    variant="caption" 
                    sx={{ 
                      fontWeight: 500, 
                      color: item.change > 0 ? 'success.main' : 'error.main',
                      fontSize: '0.65rem',
                      ml: 0.5
                    }}
                  >
                    ({item.change > 0 ? '+' : ''}{item.change.toFixed(1)}%)
                  </Typography>
                )}
              </Typography>
            </Typography>
          </Box>
        ))}
      </Box>
      
      <Box sx={{ height: '100%', pt: 4 }}>
        <ResponsiveLine
          data={chartData}
          margin={{ top: 10, right: 30, bottom: 40, left: 40 }}
          xScale={{ type: 'point' }}
          yScale={{
            type: 'linear',
            min: 'auto',
            max: 'auto',
            stacked: false,
            reverse: false
          }}
          curve="monotoneX"
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
            legend: '', // Hide the legend
            legendOffset: 36,
            legendPosition: 'middle',
            truncateTickAt: 0,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'RFT Rate (%)',
            legendOffset: -36,
            legendPosition: 'middle',
            truncateTickAt: 0,
          }}
          colors={{ datum: 'color' }}
          pointSize={6}
          pointColor={{ theme: 'background' }}
          pointBorderWidth={2}
          pointBorderColor={{ from: 'serieColor' }}
          pointLabelYOffset={-12}
          enableCrosshair={true}
          useMesh={true}
          lineWidth={2}
          enableArea={false}
          enableGridX={false}
          enableGridY={true}
          areaOpacity={0.1}
          animate={true}
          motionConfig="stiff"
          layers={[
            'grid',
            'markers',
            'axes',
            'areas',
            'crosshair',
            'lines',
            'points',
            'slices',
            'mesh',
            'legends',
            // Custom layer for target line
            ({ xScale, yScale, width }) => {
              if (!xScale || !yScale) return null;
              
              const targetY = yScale(95); // Target line at 95%
              
              return (
                <g>
                  <line
                    x1={0}
                    y1={targetY}
                    x2={width}
                    y2={targetY}
                    stroke="#E11A28"
                    strokeWidth={1.5}
                    strokeDasharray="4,4"
                  />
                  <text
                    x={width - 5}
                    y={targetY - 5}
                    textAnchor="end"
                    fontSize={10}
                    fill="#E11A28"
                  >
                    Target (95%)
                  </text>
                </g>
              );
            }
          ]}
        />
      </Box>
    </Box>
  );
}; 