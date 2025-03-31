import React, { useState } from 'react';
import { Box, ToggleButtonGroup, ToggleButton, Typography, CircularProgress, Select, MenuItem, SelectChangeEvent } from '@mui/material';
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
  
  // Update the function signature to use SelectChangeEvent
  const handleTimeRangeChange = (
    event: SelectChangeEvent<string>,
  ) => {
    if (event.target.value !== null) {
      setTimeRange(event.target.value);
    }
  };
  
  // Rest of the component code...
}; 