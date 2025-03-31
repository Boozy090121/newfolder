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
  
  const handleLotChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedLot(event.target.value as string);
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
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error loading data: {error || 'Unknown error'}</Typography>
      </Box>
    );
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'info';
      case 'Complete':
        return 'success';
      case 'On Hold':
        return 'warning';
      case 'At Risk':
        return 'error';
      default:
        return 'default';
    }
  };
  
  const selectedLotData = selectedLot ? data.lots[selectedLot] : null;
  const lotEvents = selectedLot ? 
    data.timelineEvents.filter(event => event.lot === selectedLot) : [];
  
  const lotInsights = selectedLot ? 
    data.predictions.filter(insight => insight.lot === selectedLot) : [];

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
          Lot Analysis Dashboard
        </Typography>
        <Typography variant="body1">
          Comprehensive lot-based manufacturing analysis for pharmaceutical production
        </Typography>
      </Paper>
      
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Lot Summary</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Lots</Typography>
                  <Typography variant="h4">{data.summary.lotCount}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">RFT Rate</Typography>
                  <Typography 
                    variant="h4" 
                    color={data.summary.rftRate >= 95 ? 'success.main' : 'warning.main'}
                  >
                    {data.summary.rftRate.toFixed(1)}%
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Avg Cycle Time</Typography>
                  <Typography variant="h4">{data.summary.avgCycleTime.toFixed(1)} days</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Status Breakdown</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">In Progress</Typography>
                  <Typography variant="h4">{data.summary.inProgressLots}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Completed</Typography>
                  <Typography variant="h4" color="success.main">{data.summary.completedLots}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">At Risk Lots</Typography>
                  <Typography variant="h4" color="error.main">{data.summary.atRiskLots}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={12} lg={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Lot Analysis</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select a lot to view detailed analysis
              </Typography>
              
              <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                <InputLabel id="lot-select-label">Select Lot</InputLabel>
                <Select
                  labelId="lot-select-label"
                  value={selectedLot}
                  onChange={handleLotChange as any}
                  label="Select Lot"
                >
                  <MenuItem value="">
                    <em>Select a lot</em>
                  </MenuItem>
                  {Object.keys(data.lots).sort().map(lotId => (
                    <MenuItem key={lotId} value={lotId}>
                      {lotId} - {data.lots[lotId].product} 
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {selectedLotData && (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h5">{selectedLotData.number}</Typography>
                    <Chip 
                      label={selectedLotData.status} 
                      color={getStatusColor(selectedLotData.status) as any} 
                      sx={{ fontWeight: 500 }}
                    />
                  </Box>
                  
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {selectedLotData.product}
                  </Typography>
                  
                  <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Start Date</Typography>
                      <Typography variant="body2">{selectedLotData.startDate}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Due Date</Typography>
                      <Typography variant="body2">{selectedLotData.dueDate}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">RFT Rate</Typography>
                      <Typography 
                        variant="body2"
                        color={selectedLotData.rftRate >= 95 ? 'success.main' : 'warning.main'}
                      >
                        {selectedLotData.rftRate.toFixed(1)}%
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Errors</Typography>
                      <Typography 
                        variant="body2"
                        color={selectedLotData.errors > 0 ? 'error.main' : 'success.main'}
                      >
                        {selectedLotData.errors}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {selectedLotData && (
          <>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>Timeline Events</Typography>
                  
                  {lotEvents.length > 0 ? (
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Event</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {lotEvents.map((event, index) => (
                          <TableRow key={`${event.lot}-${index}`}>
                            <TableCell>{event.date}</TableCell>
                            <TableCell>{event.event}</TableCell>
                            <TableCell>
                              <Chip 
                                label={event.status} 
                                size="small"
                                color={event.status === 'error' ? 'error' : 'success'}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No timeline events available for this lot
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>Insights & Recommendations</Typography>
                  
                  {lotInsights.length > 0 ? (
                    <Box>
                      {lotInsights.map(insight => (
                        <Card 
                          key={insight.id} 
                          variant="outlined" 
                          sx={{ mb: 2, p: 1 }}
                        >
                          <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="subtitle2">{insight.type}</Typography>
                              <Chip 
                                label={insight.severity.charAt(0).toUpperCase() + insight.severity.slice(1)} 
                                size="small" 
                                color={insight.severity === 'high' ? 'error' : 
                                        insight.severity === 'medium' ? 'warning' : 'info'} 
                              />
                            </Box>
                            <Typography variant="body2" sx={{ mb: 1 }}>{insight.description}</Typography>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              <strong>Recommendation:</strong> {insight.recommendation}
                            </Typography>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No insights available for this lot
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
} 