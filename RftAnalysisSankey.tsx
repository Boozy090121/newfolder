import React, { useState } from 'react';
import { ResponsiveSankey } from '@nivo/sankey';
import { ResponsiveHeatMap } from '@nivo/heatmap';
import { 
  Box, 
  Typography, 
  Select, 
  MenuItem,
  SelectChangeEvent,
  FormControl, 
  InputLabel,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress
} from '@mui/material';
import { useDataService } from '../../services/DataService';

// Rest of imports...

export const RftAnalysisSankey: React.FC = () => {
  const [viewMode, setViewMode] = useState<'sankey' | 'heatmap'>('sankey');
  const [timeRange, setTimeRange] = useState<string>('30d');
  const { data, isLoading, error } = useDataService();

  // Update the function signature to use SelectChangeEvent
  const handleTimeRangeChange = (event: SelectChangeEvent<string>) => {
    setTimeRange(event.target.value);
  };

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewMode: 'sankey' | 'heatmap' | null,
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  // Rest of the component...
}; 