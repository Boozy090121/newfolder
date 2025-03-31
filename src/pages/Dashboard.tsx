import React, { useState } from 'react';
import { Box, Paper, Typography, Grid, Card, CardContent, CardHeader, IconButton } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import RefreshIcon from '@mui/icons-material/Refresh';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import KpiHeader from '../components/KpiHeader';
import { RftTrendChart } from '../components/charts/RftTrendChart';
import { LotPerformanceTable } from '../components/LotPerformanceTable';
import { RftAnalysisSankey } from '../components/charts/RftAnalysisSankey';
import { ProcessTimeline } from '../components/ProcessTimeline';
import { PredictiveInsights } from '../components/PredictiveInsights';

// Define the layout for the grid
const defaultLayout = [
  { i: 'kpi-header', x: 0, y: 0, w: 12, h: 1, static: true },
  { i: 'rft-trend', x: 0, y: 1, w: 6, h: 2, minW: 3 },
  { i: 'lot-performance', x: 6, y: 1, w: 6, h: 2, minW: 3 },
  { i: 'rft-analysis', x: 0, y: 3, w: 4, h: 3, minW: 3 },
  { i: 'process-timeline', x: 4, y: 3, w: 4, h: 3, minW: 3 },
  { i: 'predictive-insights', x: 8, y: 3, w: 4, h: 3, minW: 3 }
];

export default function Dashboard() {
  const [layout, setLayout] = useState(defaultLayout);

  const handleLayoutChange = (newLayout: any) => {
    setLayout(newLayout);
  };

  return (
    <Box sx={{ flexGrow: 1, height: '100%' }}>
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
          Manufacturing Analytics Dashboard
        </Typography>
        <Typography variant="body1">
          An interactive dashboard to monitor and analyze manufacturing metrics
        </Typography>
      </Paper>

      <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={180}
        width={1200}
        onLayoutChange={handleLayoutChange}
        draggableHandle=".drag-handle"
      >
        <Box key="kpi-header" sx={{ width: '100%', height: '100%', overflow: 'hidden' }}>
          <KpiHeader />
        </Box>

        <Box key="rft-trend" sx={{ width: '100%', height: '100%', overflow: 'hidden' }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              className="drag-handle"
              title="RFT Performance Trend"
              titleTypographyProps={{ variant: 'h6' }}
              action={
                <Box>
                  <IconButton size="small">
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small">
                    <SettingsIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small">
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Box>
              }
              sx={{ 
                py: 1, 
                cursor: 'move',
                '& .MuiCardHeader-action': {
                  margin: 0
                }
              }}
            />
            <CardContent sx={{ height: 'calc(100% - 52px)', pt: 0 }}>
              <RftTrendChart />
            </CardContent>
          </Card>
        </Box>

        <Box key="lot-performance" sx={{ width: '100%', height: '100%', overflow: 'hidden' }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              className="drag-handle"
              title="Lot Performance"
              titleTypographyProps={{ variant: 'h6' }}
              action={
                <Box>
                  <IconButton size="small">
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small">
                    <SettingsIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small">
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Box>
              }
              sx={{ 
                py: 1, 
                cursor: 'move',
                '& .MuiCardHeader-action': {
                  margin: 0
                }
              }}
            />
            <CardContent sx={{ height: 'calc(100% - 52px)', pt: 0 }}>
              <LotPerformanceTable />
            </CardContent>
          </Card>
        </Box>

        <Box key="rft-analysis" sx={{ width: '100%', height: '100%', overflow: 'hidden' }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              className="drag-handle"
              title="RFT Analysis"
              titleTypographyProps={{ variant: 'h6' }}
              action={
                <Box>
                  <IconButton size="small">
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small">
                    <SettingsIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small">
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Box>
              }
              sx={{ 
                py: 1, 
                cursor: 'move',
                '& .MuiCardHeader-action': {
                  margin: 0
                }
              }}
            />
            <CardContent sx={{ height: 'calc(100% - 52px)', pt: 0 }}>
              <RftAnalysisSankey />
            </CardContent>
          </Card>
        </Box>

        <Box key="process-timeline" sx={{ width: '100%', height: '100%', overflow: 'hidden' }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              className="drag-handle"
              title="Process Timeline"
              titleTypographyProps={{ variant: 'h6' }}
              action={
                <Box>
                  <IconButton size="small">
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small">
                    <SettingsIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small">
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Box>
              }
              sx={{ 
                py: 1, 
                cursor: 'move',
                '& .MuiCardHeader-action': {
                  margin: 0
                }
              }}
            />
            <CardContent sx={{ height: 'calc(100% - 52px)', pt: 0 }}>
              <ProcessTimeline />
            </CardContent>
          </Card>
        </Box>

        <Box key="predictive-insights" sx={{ width: '100%', height: '100%', overflow: 'hidden' }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              className="drag-handle"
              title="Predictive Insights"
              titleTypographyProps={{ variant: 'h6' }}
              action={
                <Box>
                  <IconButton size="small">
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small">
                    <SettingsIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small">
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Box>
              }
              sx={{ 
                py: 1, 
                cursor: 'move',
                '& .MuiCardHeader-action': {
                  margin: 0
                }
              }}
            />
            <CardContent sx={{ height: 'calc(100% - 52px)', pt: 0 }}>
              <PredictiveInsights />
            </CardContent>
          </Card>
        </Box>
      </GridLayout>
    </Box>
  );
} 