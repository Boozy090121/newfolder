import React from 'react';
import { Box, Paper, Grid, Typography, Chip, Tooltip, CircularProgress } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Sparklines, SparklinesLine, SparklinesSpots } from 'react-sparklines';
import { useDataService } from '../services/DataService';

interface KpiMetric {
  id: string;
  label: string;
  value: string | number;
  secondaryValue?: string;
  sparklineData?: number[];
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  status?: 'success' | 'warning' | 'error' | 'neutral';
  alert?: boolean;
  info?: string;
}

const KpiHeader: React.FC = () => {
  const { data, isLoading, error } = useDataService();
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }
  
  if (error || !data) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">Error loading data</Typography>
      </Box>
    );
  }
  
  // Prepare metrics from real data
  const metrics: KpiMetric[] = [
    {
      id: 'overall-rft',
      label: 'Overall RFT Rate',
      value: `${data.summary.rftRate.toFixed(1)}%`,
      secondaryValue: `${data.summary.lotCount} lots analyzed`,
      sparklineData: data.rftTrend.slice(-10).map(d => d.overall),
      trend: data.rftTrend.length > 1 && data.rftTrend[data.rftTrend.length - 1].overall > data.rftTrend[data.rftTrend.length - 2].overall ? 'up' : 'down',
      trendValue: data.rftTrend.length > 1 ? `${(data.rftTrend[data.rftTrend.length - 1].overall - data.rftTrend[data.rftTrend.length - 2].overall).toFixed(1)}%` : '0%',
      status: data.summary.rftRate >= 95 ? 'success' : data.summary.rftRate >= 90 ? 'warning' : 'error',
      info: 'Overall Right First Time rate across all lots in the last 30 days'
    },
    {
      id: 'internal-rft',
      label: 'Internal RFT',
      value: `${data.rftTrend[data.rftTrend.length - 1]?.internal.toFixed(1) || 0}%`,
      sparklineData: data.rftTrend.slice(-10).map(d => d.internal),
      trend: data.rftTrend.length > 1 && data.rftTrend[data.rftTrend.length - 1].internal > data.rftTrend[data.rftTrend.length - 2].internal ? 'up' : 'down',
      trendValue: data.rftTrend.length > 1 ? `${(data.rftTrend[data.rftTrend.length - 1].internal - data.rftTrend[data.rftTrend.length - 2].internal).toFixed(1)}%` : '0%',
      status: data.rftTrend[data.rftTrend.length - 1]?.internal >= 95 ? 'success' : data.rftTrend[data.rftTrend.length - 1]?.internal >= 90 ? 'warning' : 'error',
      info: 'Internal Right First Time rate during documentation and production'
    },
    {
      id: 'external-rft',
      label: 'External RFT',
      value: `${data.rftTrend[data.rftTrend.length - 1]?.external.toFixed(1) || 0}%`,
      sparklineData: data.rftTrend.slice(-10).map(d => d.external),
      trend: data.rftTrend.length > 1 && data.rftTrend[data.rftTrend.length - 1].external > data.rftTrend[data.rftTrend.length - 2].external ? 'up' : 'down',
      trendValue: data.rftTrend.length > 1 ? `${(data.rftTrend[data.rftTrend.length - 1].external - data.rftTrend[data.rftTrend.length - 2].external).toFixed(1)}%` : '0%',
      status: data.rftTrend[data.rftTrend.length - 1]?.external >= 95 ? 'success' : data.rftTrend[data.rftTrend.length - 1]?.external >= 90 ? 'warning' : 'error',
      info: 'External Right First Time rate reported by customers'
    },
    {
      id: 'active-lots',
      label: 'Active Lots',
      value: data.summary.inProgressLots,
      sparklineData: [data.summary.inProgressLots + 5, data.summary.inProgressLots + 3, data.summary.inProgressLots + 2, data.summary.inProgressLots + 1, data.summary.inProgressLots], // Simulate trend
      trend: 'neutral',
      trendValue: '0',
      status: 'neutral',
      info: 'Currently active manufacturing lots in the system'
    },
    {
      id: 'cycle-time',
      label: 'Avg Cycle Time',
      value: data.summary.avgCycleTime.toFixed(1),
      secondaryValue: 'days',
      sparklineData: [data.summary.avgCycleTime + 2, data.summary.avgCycleTime + 1.5, data.summary.avgCycleTime + 1, data.summary.avgCycleTime + 0.5, data.summary.avgCycleTime], // Simulate trend
      trend: 'down',
      trendValue: '-0.5 days',
      status: data.summary.avgCycleTime <= 21 ? 'success' : 'warning', 
      info: 'Average cycle time for lot completion in the last 30 days'
    },
    {
      id: 'at-risk-lots',
      label: 'At-Risk Lots',
      value: data.summary.atRiskLots,
      sparklineData: [data.summary.atRiskLots - 2, data.summary.atRiskLots - 1, data.summary.atRiskLots], // Simulate trend
      trend: data.summary.atRiskLots > 0 ? 'up' : 'neutral',
      trendValue: data.summary.atRiskLots > 0 ? `+${data.summary.atRiskLots}` : '0',
      status: data.summary.atRiskLots > 5 ? 'error' : data.summary.atRiskLots > 0 ? 'warning' : 'success',
      alert: data.summary.atRiskLots > 0,
      info: 'Lots with detected quality or timing issues that need review'
    }
  ];

  return (
    <Paper elevation={0} sx={{ p: 1, width: '100%', backgroundColor: '#f8f9fa', borderRadius: 2 }}>
      <Grid container spacing={2}>
        {metrics.map((metric) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={metric.id}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1,
                bgcolor: 'white',
                height: '100%',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                position: 'relative',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              {metric.alert && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    bgcolor: 'error.main',
                    color: 'white',
                    borderRadius: '50%',
                    width: 18,
                    height: 18,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    border: '2px solid white',
                    zIndex: 1
                  }}
                >
                  !
                </Box>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                  {metric.label}
                </Typography>
                
                {metric.info && (
                  <Tooltip title={metric.info} arrow placement="top">
                    <InfoOutlinedIcon sx={{ fontSize: '0.875rem', color: 'text.disabled', ml: 0.5 }} />
                  </Tooltip>
                )}
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 600, 
                    color: metric.status === 'warning' 
                      ? 'warning.main' 
                      : metric.status === 'error' 
                        ? 'error.main' 
                        : metric.status === 'success' 
                          ? 'success.main' 
                          : 'text.primary'
                  }}
                >
                  {metric.value}
                </Typography>
                {metric.secondaryValue && (
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                    {metric.secondaryValue}
                  </Typography>
                )}
              </Box>
              
              {metric.sparklineData && (
                <Box sx={{ height: 30, mb: 1 }}>
                  <Sparklines data={metric.sparklineData} limit={10} height={30} margin={5}>
                    <SparklinesLine 
                      color={
                        metric.status === 'warning' 
                          ? '#f57c00' 
                          : metric.status === 'error' 
                            ? '#d32f2f' 
                            : metric.status === 'success' 
                              ? '#0288d1' 
                              : '#9e9e9e'
                      } 
                      style={{ fill: "none" }}
                    />
                    <SparklinesSpots size={2} />
                  </Sparklines>
                </Box>
              )}
              
              {metric.trend && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip 
                    icon={
                      metric.trend === 'up' 
                        ? <ArrowUpwardIcon fontSize="small" /> 
                        : metric.trend === 'down' 
                          ? <ArrowDownwardIcon fontSize="small" /> 
                          : undefined
                    }
                    label={metric.trendValue}
                    size="small"
                    color={
                      (metric.trend === 'up' && (metric.id === 'at-risk-lots')) || 
                      (metric.trend === 'down' && (metric.id === 'overall-rft' || metric.id === 'internal-rft' || metric.id === 'external-rft'))
                        ? 'error'
                        : (metric.trend === 'up' && (metric.id === 'overall-rft' || metric.id === 'internal-rft' || metric.id === 'external-rft')) || 
                          (metric.trend === 'down' && (metric.id === 'at-risk-lots' || metric.id === 'cycle-time'))
                          ? 'success'
                          : 'default'
                    }
                    variant="outlined"
                    sx={{ height: 20, '& .MuiChip-label': { px: 0.5, fontSize: '0.675rem' } }}
                  />
                  
                  {metric.status === 'warning' && (
                    <Tooltip title="This metric requires attention" arrow>
                      <WarningAmberIcon 
                        color="warning" 
                        sx={{ fontSize: '1rem', ml: 'auto' }} 
                      />
                    </Tooltip>
                  )}
                </Box>
              )}
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default KpiHeader; 