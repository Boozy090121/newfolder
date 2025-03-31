import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  SelectChangeEvent,
  CircularProgress, 
  Paper, 
  Divider,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Stack
} from '@mui/material';
import { useDataService } from '../services/DataService';

export default function LotAnalysis() {
  const { data, isLoading, error } = useDataService();
  const [selectedLot, setSelectedLot] = useState<string>('');
  
  const handleLotChange = (event: SelectChangeEvent<string>) => {
    setSelectedLot(event.target.value);
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
        <InputLabel id="lot-select-label">Select Lot</InputLabel>
        <Select
          labelId="lot-select-label"
          value={selectedLot}
          onChange={handleLotChange}
          label="Select Lot"
        >
          <MenuItem value="">
            <em>Select a lot</em>
          </MenuItem>
          {data && data.lots && Object.keys(data.lots).sort().map(lotId => (
            <MenuItem key={lotId} value={lotId}>
              {lotId} - {data.lots[lotId].product} 
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
} 