import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  FormControl,
  Select,
  MenuItem,
  Slider,
  Tooltip,
  IconButton,
  SelectChangeEvent,
  Grid,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { format, addDays, differenceInDays, isAfter } from 'date-fns';

// Process step interface
interface ProcessStep {
  id: string;
  lotId: string;
  name: string;
  start: Date;
  end: Date;
  status: 'completed' | 'in-progress' | 'delayed' | 'not-started';
  bottleneck?: boolean;
  dependsOn?: string[];
  assignedTo?: string;
  notes?: string;
}

// Lot process interface
interface LotProcess {
  id: string;
  lotNumber: string;
  product: string;
  startDate: Date;
  targetEndDate: Date;
  actualEndDate?: Date;
  steps: ProcessStep[];
}

// Sample data for demonstration
const today = new Date();
const sampleLots: LotProcess[] = [
  {
    id: '1',
    lotNumber: '2066476',
    product: 'WEGOVY 1.7MG 4 PREF PENS',
    startDate: addDays(today, -18),
    targetEndDate: addDays(today, 12),
    steps: [
      {
        id: '1-1',
        lotId: '1',
        name: 'Document Preparation',
        start: addDays(today, -18),
        end: addDays(today, -15),
        status: 'completed'
      },
      {
        id: '1-2',
        lotId: '1',
        name: 'Material Receipt',
        start: addDays(today, -16),
        end: addDays(today, -13),
        status: 'completed'
      },
      {
        id: '1-3',
        lotId: '1',
        name: 'Equipment Setup',
        start: addDays(today, -13),
        end: addDays(today, -11),
        status: 'completed',
        dependsOn: ['1-1', '1-2']
      },
      {
        id: '1-4',
        lotId: '1',
        name: 'Production',
        start: addDays(today, -11),
        end: addDays(today, -3),
        status: 'completed',
        dependsOn: ['1-3']
      },
      {
        id: '1-5',
        lotId: '1',
        name: 'Quality Testing',
        start: addDays(today, -3),
        end: addDays(today, 0),
        status: 'in-progress',
        dependsOn: ['1-4']
      },
      {
        id: '1-6',
        lotId: '1',
        name: 'Packaging',
        start: addDays(today, 0),
        end: addDays(today, 5),
        status: 'not-started',
        dependsOn: ['1-5']
      },
      {
        id: '1-7',
        lotId: '1',
        name: 'Final QA Review',
        start: addDays(today, 5),
        end: addDays(today, 8),
        status: 'not-started',
        dependsOn: ['1-6']
      },
      {
        id: '1-8',
        lotId: '1',
        name: 'Release',
        start: addDays(today, 8),
        end: addDays(today, 9),
        status: 'not-started',
        dependsOn: ['1-7']
      }
    ]
  },
  {
    id: '2',
    lotNumber: '2066477',
    product: 'OZEMPIC 0.5MG PENS',
    startDate: addDays(today, -22),
    targetEndDate: addDays(today, 8),
    steps: [
      {
        id: '2-1',
        lotId: '2',
        name: 'Document Preparation',
        start: addDays(today, -22),
        end: addDays(today, -20),
        status: 'completed'
      },
      {
        id: '2-2',
        lotId: '2',
        name: 'Material Receipt',
        start: addDays(today, -21),
        end: addDays(today, -17),
        status: 'completed'
      },
      {
        id: '2-3',
        lotId: '2',
        name: 'Equipment Setup',
        start: addDays(today, -17),
        end: addDays(today, -15),
        status: 'completed',
        dependsOn: ['2-1', '2-2']
      },
      {
        id: '2-4',
        lotId: '2',
        name: 'Production',
        start: addDays(today, -15),
        end: addDays(today, -7),
        status: 'completed',
        bottleneck: true,
        dependsOn: ['2-3']
      },
      {
        id: '2-5',
        lotId: '2',
        name: 'Quality Testing',
        start: addDays(today, -7),
        end: addDays(today, -2),
        status: 'delayed',
        bottleneck: true,
        dependsOn: ['2-4'],
        notes: 'Quality testing delayed due to equipment calibration issue'
      },
      {
        id: '2-6',
        lotId: '2',
        name: 'Packaging',
        start: addDays(today, -2),
        end: addDays(today, 3),
        status: 'delayed',
        dependsOn: ['2-5']
      },
      {
        id: '2-7',
        lotId: '2',
        name: 'Final QA Review',
        start: addDays(today, 3),
        end: addDays(today, 6),
        status: 'not-started',
        dependsOn: ['2-6']
      },
      {
        id: '2-8',
        lotId: '2',
        name: 'Release',
        start: addDays(today, 6),
        end: addDays(today, 7),
        status: 'not-started',
        dependsOn: ['2-7']
      }
    ]
  },
  {
    id: '3',
    lotNumber: '2066478',
    product: 'WEGOVY 0.25MG 4 PREF PENS',
    startDate: addDays(today, -12),
    targetEndDate: addDays(today, 16),
    steps: [
      {
        id: '3-1',
        lotId: '3',
        name: 'Document Preparation',
        start: addDays(today, -12),
        end: addDays(today, -10),
        status: 'completed'
      },
      {
        id: '3-2',
        lotId: '3',
        name: 'Material Receipt',
        start: addDays(today, -11),
        end: addDays(today, -8),
        status: 'completed'
      },
      {
        id: '3-3',
        lotId: '3',
        name: 'Equipment Setup',
        start: addDays(today, -8),
        end: addDays(today, -6),
        status: 'completed',
        dependsOn: ['3-1', '3-2']
      },
      {
        id: '3-4',
        lotId: '3',
        name: 'Production',
        start: addDays(today, -6),
        end: addDays(today, 1),
        status: 'in-progress',
        dependsOn: ['3-3']
      },
      {
        id: '3-5',
        lotId: '3',
        name: 'Quality Testing',
        start: addDays(today, 1),
        end: addDays(today, 6),
        status: 'not-started',
        dependsOn: ['3-4']
      },
      {
        id: '3-6',
        lotId: '3',
        name: 'Packaging',
        start: addDays(today, 6),
        end: addDays(today, 11),
        status: 'not-started',
        dependsOn: ['3-5']
      },
      {
        id: '3-7',
        lotId: '3',
        name: 'Final QA Review',
        start: addDays(today, 11),
        end: addDays(today, 14),
        status: 'not-started',
        dependsOn: ['3-6']
      },
      {
        id: '3-8',
        lotId: '3',
        name: 'Release',
        start: addDays(today, 14),
        end: addDays(today, 15),
        status: 'not-started',
        dependsOn: ['3-7']
      }
    ]
  }
];

export const ProcessTimeline: React.FC = () => {
  const [selectedLot, setSelectedLot] = useState<string>(sampleLots[0].id);
  const [zoomLevel, setZoomLevel] = useState<number>(70);
  const [showBottlenecks, setShowBottlenecks] = useState<boolean>(true);
  
  const handleLotChange = (event: SelectChangeEvent<string>) => {
    setSelectedLot(event.target.value as string);
  };
  
  const handleZoomChange = (event: Event, newValue: number | number[]) => {
    setZoomLevel(newValue as number);
  };
  
  const handleZoomIn = () => {
    setZoomLevel(Math.min(100, zoomLevel + 10));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(Math.max(30, zoomLevel - 10));
  };
  
  const selectedLotData = sampleLots.find(lot => lot.id === selectedLot) || sampleLots[0];
  
  // Calculate the date range for the timeline
  const earliestDate = new Date(Math.min(...selectedLotData.steps.map(step => step.start.getTime())));
  const latestDate = new Date(Math.max(...selectedLotData.steps.map(step => step.end.getTime())));
  const dateRange = differenceInDays(latestDate, earliestDate) + 4; // Add padding
  
  // Day width based on zoom level
  const dayWidth = (zoomLevel / 100) * 40 + 15; // Min 15px, Max 55px per day
  
  // Calculate bottlenecks
  const criticalPath = new Set<string>();
  const getBottlenecks = (steps: ProcessStep[]) => {
    // Identify delayed steps
    const delayedSteps = steps.filter(step => step.status === 'delayed');
    
    // Find dependencies of delayed steps
    delayedSteps.forEach(step => {
      criticalPath.add(step.id);
      
      // Find steps that depend on this step
      const dependentSteps = steps.filter(s => 
        s.dependsOn && s.dependsOn.includes(step.id)
      );
      
      // Add them to critical path
      dependentSteps.forEach(s => criticalPath.add(s.id));
    });
    
    // Also include steps with actual bottleneck flag
    steps.filter(step => step.bottleneck).forEach(step => {
      criticalPath.add(step.id);
    });
    
    return steps.map(step => ({
      ...step,
      isOnCriticalPath: criticalPath.has(step.id)
    }));
  };
  
  const stepsWithBottlenecks = getBottlenecks(selectedLotData.steps);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4caf50';
      case 'in-progress':
        return '#2196f3';
      case 'delayed':
        return '#f44336';
      case 'not-started':
      default:
        return '#9e9e9e';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleOutlineIcon fontSize="small" color="success" />;
      case 'in-progress':
        return <ArrowRightIcon fontSize="small" color="info" />;
      case 'delayed':
        return <WarningAmberIcon fontSize="small" color="error" />;
      case 'not-started':
      default:
        return <ErrorOutlineIcon fontSize="small" color="disabled" />;
    }
  };
  
  // Days off target calculation
  const daysOffTarget = selectedLotData.actualEndDate 
    ? differenceInDays(selectedLotData.actualEndDate, selectedLotData.targetEndDate)
    : (stepsWithBottlenecks.some(step => step.status === 'delayed')
      ? differenceInDays(
          stepsWithBottlenecks.filter(step => step.status === 'delayed').reduce(
            (latest, step) => isAfter(step.end, latest) ? step.end : latest, 
            stepsWithBottlenecks.filter(step => step.status === 'delayed')[0].end
          ),
          selectedLotData.targetEndDate
        )
      : 0);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
          <Select
            value={selectedLot}
            onChange={handleLotChange}
            displayEmpty
          >
            {sampleLots.map(lot => (
              <MenuItem key={lot.id} value={lot.id}>
                {lot.lotNumber} - {lot.product}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="caption" sx={{ mr: 1 }}>Zoom:</Typography>
          <IconButton size="small" onClick={handleZoomOut} disabled={zoomLevel <= 30}>
            <ZoomOutIcon fontSize="small" />
          </IconButton>
          <Slider
            value={zoomLevel}
            onChange={handleZoomChange}
            min={30}
            max={100}
            sx={{ width: 80, mx: 1 }}
            size="small"
          />
          <IconButton size="small" onClick={handleZoomIn} disabled={zoomLevel >= 100}>
            <ZoomInIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={3}>
          <Paper sx={{ p: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
            <Typography variant="caption" color="text.secondary">Start Date</Typography>
            <Typography variant="subtitle2">{format(selectedLotData.startDate, 'MMM dd, yyyy')}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={3}>
          <Paper sx={{ p: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
            <Typography variant="caption" color="text.secondary">Target End Date</Typography>
            <Typography variant="subtitle2">{format(selectedLotData.targetEndDate, 'MMM dd, yyyy')}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={3}>
          <Paper sx={{ p: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
            <Typography variant="caption" color="text.secondary">Estimated Time</Typography>
            <Typography variant="subtitle2">
              {differenceInDays(selectedLotData.targetEndDate, selectedLotData.startDate)} days
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={3}>
          <Paper
            sx={{ 
              p: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              height: '100%',
              bgcolor: daysOffTarget > 0 ? 'error.light' : daysOffTarget < 0 ? 'success.light' : 'inherit'
            }}
          >
            <Typography variant="caption" color="text.secondary">Days Off Target</Typography>
            <Typography 
              variant="subtitle2" 
              color={daysOffTarget > 0 ? 'error.main' : daysOffTarget < 0 ? 'success.main' : 'inherit'}
            >
              {daysOffTarget > 0 ? `+${daysOffTarget}` : daysOffTarget < 0 ? daysOffTarget : 'On Target'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      <Box sx={{ flexGrow: 1, overflowX: 'auto', overflowY: 'hidden' }}>
        <Box
          sx={{
            width: dateRange * dayWidth + 100,
            minWidth: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          {/* Timeline headers - days */}
          <Box sx={{ display: 'flex', borderBottom: '1px solid #eee', mb: 1, pl: 18 }}>
            {Array.from({ length: dateRange }).map((_, i) => {
              const date = addDays(earliestDate, i - 1);
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <Box
                  key={i}
                  sx={{
                    width: dayWidth,
                    py: 0.5,
                    px: 0.5,
                    textAlign: 'center',
                    borderRight: '1px solid #f5f5f5',
                    backgroundColor: isWeekend ? '#f9f9f9' : isToday ? 'primary.light' : 'inherit',
                    color: isToday ? 'white' : 'inherit',
                  }}
                >
                  <Typography variant="caption" noWrap>
                    {format(date, 'MMM d')}
                  </Typography>
                </Box>
              );
            })}
          </Box>
          
          {/* Timeline grid and bars */}
          <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
            {stepsWithBottlenecks.map((step, index) => {
              const startOffset = differenceInDays(step.start, earliestDate) + 1;
              const duration = differenceInDays(step.end, step.start) + 1;
              const isDelayed = step.status === 'delayed';
              const isOnCriticalPath = showBottlenecks && step.isOnCriticalPath;
              
              return (
                <Box
                  key={step.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 1,
                    height: 38,
                    position: 'relative',
                  }}
                >
                  {/* Step name */}
                  <Box
                    sx={{
                      width: 180,
                      pr: 1,
                      display: 'flex',
                      alignItems: 'center',
                      position: 'sticky',
                      left: 0,
                      backgroundColor: 'background.paper',
                      zIndex: 1,
                      flexShrink: 0,
                    }}
                  >
                    <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                      {getStatusIcon(step.status)}
                    </Box>
                    <Typography variant="body2" noWrap>
                      {step.name}
                    </Typography>
                    {step.notes && (
                      <Tooltip title={step.notes} arrow>
                        <InfoOutlinedIcon fontSize="small" sx={{ ml: 0.5, color: 'text.secondary', opacity: 0.6 }} />
                      </Tooltip>
                    )}
                  </Box>
                  
                  {/* Timeline grid */}
                  <Box
                    sx={{
                      flexGrow: 1,
                      height: '100%',
                      position: 'relative',
                      borderTop: '1px dashed #eee',
                      borderBottom: '1px dashed #eee',
                    }}
                  >
                    {/* Today indicator */}
                    {(() => {
                      const todayOffset = differenceInDays(new Date(), earliestDate) + 1;
                      if (todayOffset >= 0 && todayOffset <= dateRange) {
                        return (
                          <Box
                            sx={{
                              position: 'absolute',
                              left: todayOffset * dayWidth,
                              top: -1,
                              bottom: -1,
                              width: 2,
                              backgroundColor: 'primary.main',
                              zIndex: 1,
                            }}
                          />
                        );
                      }
                      return null;
                    })()}
                    
                    {/* Target end date indicator */}
                    {(() => {
                      const targetOffset = differenceInDays(selectedLotData.targetEndDate, earliestDate) + 1;
                      if (targetOffset >= 0 && targetOffset <= dateRange) {
                        return (
                          <Box
                            sx={{
                              position: 'absolute',
                              left: targetOffset * dayWidth,
                              top: -1,
                              bottom: -1,
                              width: 1,
                              backgroundColor: 'warning.main',
                              zIndex: 1,
                              borderLeft: '1px dashed',
                              borderColor: 'warning.main',
                            }}
                          />
                        );
                      }
                      return null;
                    })()}
                    
                    {/* Step duration bar */}
                    <Box
                      sx={{
                        position: 'absolute',
                        left: startOffset * dayWidth,
                        top: 6,
                        height: 26,
                        width: duration * dayWidth - 4,
                        borderRadius: 1,
                        backgroundColor: getStatusColor(step.status),
                        opacity: step.status === 'not-started' ? 0.4 : 0.7,
                        border: isOnCriticalPath ? '2px solid #f44336' : '1px solid #ccc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        boxShadow: isOnCriticalPath ? '0 0 5px rgba(244, 67, 54, 0.5)' : 'none',
                        transition: 'all 0.2s',
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontWeight: isOnCriticalPath ? 'bold' : 'normal',
                          px: 1,
                          fontSize: '0.7rem',
                        }}
                      >
                        {step.status !== 'not-started' && (
                          isDelayed ? 'DELAYED' : `${duration} days`
                        )}
                      </Typography>
                    </Box>
                    
                    {/* Dependency arrows (simplified) */}
                    {step.dependsOn && step.dependsOn.map(depId => {
                      const depStep = selectedLotData.steps.find(s => s.id === depId);
                      if (!depStep) return null;
                      
                      return (
                        <Box
                          key={`${depId}-${step.id}`}
                          sx={{
                            position: 'absolute',
                            left: (differenceInDays(depStep.end, earliestDate) + 1) * dayWidth,
                            top: -10,
                            width: (startOffset - differenceInDays(depStep.end, earliestDate)) * dayWidth,
                            height: 10,
                            borderLeft: '1px dashed #aaa',
                            borderBottom: '1px dashed #aaa',
                            borderBottomLeftRadius: 8,
                            zIndex: 0,
                          }}
                        />
                      );
                    })}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
      
      {criticalPath.size > 0 && (
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ 
            width: 12, 
            height: 12, 
            borderRadius: '50%', 
            border: '2px solid #f44336',
            mr: 1 
          }} />
          <Typography variant="caption" color="text.secondary">
            Highlighted items are on critical path and may affect delivery timeline
          </Typography>
        </Box>
      )}
    </Box>
  );
}; 