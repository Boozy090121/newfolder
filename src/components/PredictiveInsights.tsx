import React from 'react';
import { Box, Typography, Chip, Card, CardContent, CircularProgress, Divider } from '@mui/material';
import { useDataService } from '../services/DataService';

export const PredictiveInsights: React.FC = () => {
  const { data, isLoading, error } = useDataService();
  
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
  
  if (!data.predictions || data.predictions.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography color="text.secondary">No predictive insights available</Typography>
      </Box>
    );
  }

  const severityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      {data.predictions.map((insight) => (
        <Card 
          key={insight.id} 
          sx={{ 
            mb: 2,
            boxShadow: 'none'
          }}
          variant="outlined"
        >
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Typography variant="subtitle1" fontWeight="medium">
                {insight.type}
              </Typography>
              <Chip 
                label={insight.severity.charAt(0).toUpperCase() + insight.severity.slice(1)} 
                size="small" 
                color={severityColor(insight.severity) as any}
                sx={{ fontWeight: 500 }}
              />
            </Box>
            
            <Typography variant="body2" sx={{ mb: 1.5 }}>
              <strong>Lot: {insight.lot}</strong> - {insight.description}
            </Typography>
            
            <Divider sx={{ my: 1.5 }} />
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              <strong>Recommendation:</strong> {insight.recommendation}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}; 