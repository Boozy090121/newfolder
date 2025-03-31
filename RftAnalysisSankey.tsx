import React, { useState } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Typography, Tabs, Tab } from '@mui/material';
import { ResponsiveSankey } from '@nivo/sankey';
import { ResponsiveHeatMap } from '@nivo/heatmap';

interface SankeyNode {
  id: string;
  nodeColor?: string;
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

// Sample data for the Sankey diagram (failure analysis flow)
const sankeyData: SankeyData = {
  nodes: [
    { id: 'Documentation', nodeColor: '#0070c0' },
    { id: 'Production', nodeColor: '#70ad47' },
    { id: 'QA Review', nodeColor: '#4472c4' },
    
    { id: 'Missing Information', nodeColor: '#ff9800' },
    { id: 'Incorrect Data', nodeColor: '#f44336' },
    { id: 'Format Errors', nodeColor: '#9c27b0' },
    
    { id: 'Process Deviation', nodeColor: '#e91e63' },
    { id: 'Equipment Issues', nodeColor: '#795548' },
    { id: 'Operator Error', nodeColor: '#607d8b' },
    
    { id: 'Rejected', nodeColor: '#d32f2f' },
    { id: 'Rework Required', nodeColor: '#ff9800' },
    { id: 'Approved with Comments', nodeColor: '#4caf50' }
  ],
  links: [
    // From Documentation to error types
    { source: 'Documentation', target: 'Missing Information', value: 32 },
    { source: 'Documentation', target: 'Incorrect Data', value: 25 },
    { source: 'Documentation', target: 'Format Errors', value: 18 },
    
    // From Production to error types
    { source: 'Production', target: 'Process Deviation', value: 15 },
    { source: 'Production', target: 'Equipment Issues', value: 8 },
    { source: 'Production', target: 'Operator Error', value: 22 },
    
    // From QA Review to error types
    { source: 'QA Review', target: 'Missing Information', value: 12 },
    { source: 'QA Review', target: 'Incorrect Data', value: 9 },
    { source: 'QA Review', target: 'Format Errors', value: 5 },
    
    // From error types to outcomes
    { source: 'Missing Information', target: 'Rework Required', value: 38 },
    { source: 'Missing Information', target: 'Approved with Comments', value: 6 },
    
    { source: 'Incorrect Data', target: 'Rejected', value: 12 },
    { source: 'Incorrect Data', target: 'Rework Required', value: 22 },
    
    { source: 'Format Errors', target: 'Approved with Comments', value: 15 },
    { source: 'Format Errors', target: 'Rework Required', value: 8 },
    
    { source: 'Process Deviation', target: 'Rejected', value: 8 },
    { source: 'Process Deviation', target: 'Rework Required', value: 7 },
    
    { source: 'Equipment Issues', target: 'Rejected', value: 2 },
    { source: 'Equipment Issues', target: 'Rework Required', value: 6 },
    
    { source: 'Operator Error', target: 'Rejected', value: 10 },
    { source: 'Operator Error', target: 'Rework Required', value: 12 }
  ]
};

// Sample data for the heatmap (failure patterns)
const heatmapData = [
  {
    id: 'Missing comment',
    data: [
      { x: 'Setup', y: 12 },
      { x: 'Equipment', y: 3 },
      { x: 'Production', y: 5 },
      { x: 'Inspection', y: 8 },
      { x: 'Packaging', y: 4 }
    ]
  },
  {
    id: 'Wrong value',
    data: [
      { x: 'Setup', y: 7 },
      { x: 'Equipment', y: 10 },
      { x: 'Production', y: 6 },
      { x: 'Inspection', y: 4 },
      { x: 'Packaging', y: 2 }
    ]
  },
  {
    id: 'Missing signature',
    data: [
      { x: 'Setup', y: 5 },
      { x: 'Equipment', y: 2 },
      { x: 'Production', y: 3 },
      { x: 'Inspection', y: 9 },
      { x: 'Packaging', y: 6 }
    ]
  },
  {
    id: 'Date format',
    data: [
      { x: 'Setup', y: 9 },
      { x: 'Equipment', y: 1 },
      { x: 'Production', y: 2 },
      { x: 'Inspection', y: 5 },
      { x: 'Packaging', y: 8 }
    ]
  },
  {
    id: 'Process deviation',
    data: [
      { x: 'Setup', y: 2 },
      { x: 'Equipment', y: 8 },
      { x: 'Production', y: 11 },
      { x: 'Inspection', y: 3 },
      { x: 'Packaging', y: 1 }
    ]
  }
];

// Sample data for pareto chart
const paretoData = [
  { id: 'Missing comment', value: 32, color: '#0070c0' },
  { id: 'Wrong value', value: 29, color: '#70ad47' },
  { id: 'Missing signature', value: 25, color: '#4472c4' },
  { id: 'Date format', value: 18, color: '#ff9800' },
  { id: 'Process deviation', value: 15, color: '#e91e63' },
  { id: 'Equipment malfunction', value: 10, color: '#9c27b0' },
  { id: 'Material issue', value: 7, color: '#607d8b' },
  { id: 'Other', value: 4, color: '#795548' }
];

export const RftAnalysisSankey: React.FC = () => {
  const [analysisType, setAnalysisType] = useState<number>(0);
  const [timeRange, setTimeRange] = useState<string>('30d');

  const handleAnalysisTypeChange = (event: React.SyntheticEvent, newValue: number) => {
    setAnalysisType(newValue);
  };

  const handleTimeRangeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setTimeRange(event.target.value as string);
  };

  // Calculate cumulative percentages for Pareto chart
  const totalPareto = paretoData.reduce((sum, item) => sum + item.value, 0);
  const cumulativeData = paretoData
    .sort((a, b) => b.value - a.value)
    .map((item, index, array) => {
      const cumulativeSum = array
        .slice(0, index + 1)
        .reduce((sum, i) => sum + i.value, 0);
      return {
        ...item,
        cumulativePercentage: (cumulativeSum / totalPareto) * 100
      };
    });

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Tabs
          value={analysisType}
          onChange={handleAnalysisTypeChange}
          textColor="primary"
          indicatorColor="primary"
          sx={{ 
            '& .MuiTab-root': { 
              minWidth: 'unset', 
              px: 2, 
              fontSize: '0.75rem',
              textTransform: 'none'
            } 
          }}
        >
          <Tab label="Failure Flow" />
          <Tab label="Pattern Map" />
          <Tab label="Pareto Analysis" />
        </Tabs>
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={timeRange}
            onChange={handleTimeRangeChange}
            displayEmpty
            variant="outlined"
            sx={{ fontSize: '0.75rem' }}
          >
            <MenuItem value="7d">Last 7 days</MenuItem>
            <MenuItem value="30d">Last 30 days</MenuItem>
            <MenuItem value="90d">Last 90 days</MenuItem>
            <MenuItem value="1y">Last year</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {analysisType === 0 && (
        <Box sx={{ flexGrow: 1, position: 'relative' }}>
          <Typography 
            variant="caption" 
            sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              color: 'text.secondary',
              fontStyle: 'italic'
            }}
          >
            Hover on nodes or connections for details
          </Typography>
          
          <ResponsiveSankey
            data={sankeyData}
            margin={{ top: 20, right: 20, bottom: 10, left: 20 }}
            align="justify"
            colors={{ scheme: 'category10' }}
            nodeOpacity={1}
            nodeHoverOthersOpacity={0.35}
            nodeThickness={18}
            nodeSpacing={24}
            nodeBorderWidth={0}
            linkOpacity={0.3}
            linkHoverOpacity={0.6}
            linkHoverOthersOpacity={0.1}
            linkContract={1}
            enableLinkGradient={true}
            labelPosition="outside"
            labelOrientation="horizontal"
            labelPadding={16}
            labelTextColor={{ from: 'color', modifiers: [['darker', 1]] }}
            animate={true}
            motionConfig="gentle"
            tooltip={({ node, link }) => {
              if (node) {
                return (
                  <Box
                    sx={{
                      padding: '8px 12px',
                      backgroundColor: 'white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="subtitle2">{node.id}</Typography>
                    <Typography variant="caption">
                      Value: {node.value}
                    </Typography>
                  </Box>
                );
              }
              if (link) {
                return (
                  <Box
                    sx={{
                      padding: '8px 12px',
                      backgroundColor: 'white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="subtitle2">
                      {link.source.id} → {link.target.id}
                    </Typography>
                    <Typography variant="caption">
                      Value: {link.value}
                    </Typography>
                  </Box>
                );
              }
              return null;
            }}
          />
        </Box>
      )}
      
      {analysisType === 1 && (
        <Box sx={{ flexGrow: 1 }}>
          <ResponsiveHeatMap
            data={heatmapData}
            margin={{ top: 40, right: 30, bottom: 40, left: 90 }}
            valueFormat=">-.2s"
            axisTop={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Process Stage',
              legendOffset: -30,
            }}
            axisRight={null}
            axisBottom={null}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Error Type',
              legendPosition: 'middle',
              legendOffset: -80,
            }}
            colors={{
              type: 'sequential',
              scheme: 'YlOrRd',
              minValue: 0,
              maxValue: 12,
            }}
            emptyColor="#eeeeee"
            borderWidth={0}
            borderColor="#ffffff"
            legendLabel={(datum) => `${datum.id}: ${datum.value}`}
            tooltip={({ xKey, yKey, value, color }) => (
              <Box
                sx={{
                  padding: '8px 12px',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  borderRadius: 1,
                }}
              >
                <Typography variant="subtitle2">
                  {yKey}: {xKey}
                </Typography>
                <Typography variant="caption" component="div" 
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      backgroundColor: color,
                      borderRadius: '2px'
                    }}
                  />
                  {value} errors
                </Typography>
              </Box>
            )}
            animate
            motionConfig="gentle"
            hoverTarget="cell"
            cellHoverOpacity={0.25}
          />
        </Box>
      )}
      
      {analysisType === 2 && (
        <Box sx={{ flexGrow: 1, position: 'relative' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              position: 'relative'
            }}
          >
            <Box sx={{ flexGrow: 1, mb: 2 }}>
              {/* Draw bars manually for more control */}
              <svg width="100%" height="100%" viewBox="0 0 500 250" preserveAspectRatio="xMidYMid meet">
                <g transform="translate(50, 20)">
                  {/* Y axis */}
                  <line x1="0" y1="0" x2="0" y2="180" stroke="#ccc" strokeWidth="1" />
                  {/* X axis */}
                  <line x1="0" y1="180" x2="400" y2="180" stroke="#ccc" strokeWidth="1" />
                  
                  {/* Bars */}
                  {cumulativeData.map((item, index) => {
                    const barWidth = 400 / cumulativeData.length * 0.8;
                    const barSpacing = 400 / cumulativeData.length;
                    const barHeight = (item.value / Math.max(...cumulativeData.map(d => d.value))) * 180;
                    const barX = index * barSpacing + (barSpacing - barWidth) / 2;
                    
                    return (
                      <g key={item.id}>
                        <rect
                          x={barX}
                          y={180 - barHeight}
                          width={barWidth}
                          height={barHeight}
                          fill={item.color}
                          opacity={0.8}
                        />
                        <text
                          x={barX + barWidth / 2}
                          y={190}
                          textAnchor="middle"
                          fontSize="8"
                          transform={`rotate(45 ${barX + barWidth / 2} 190)`}
                        >
                          {item.id}
                        </text>
                        <text
                          x={barX + barWidth / 2}
                          y={180 - barHeight - 5}
                          textAnchor="middle"
                          fontSize="8"
                          fill="#333"
                        >
                          {item.value}
                        </text>
                      </g>
                    );
                  })}
                  
                  {/* Line for cumulative percentage */}
                  <path
                    d={`M ${(400 / cumulativeData.length) * 0.5} ${180 - (cumulativeData[0].cumulativePercentage / 100) * 180} ${
                      cumulativeData.map((item, index) => {
                        const x = index * (400 / cumulativeData.length) + (400 / cumulativeData.length) * 0.5;
                        const y = 180 - (item.cumulativePercentage / 100) * 180;
                        return `L ${x} ${y}`;
                      }).join(' ')
                    }`}
                    fill="none"
                    stroke="#e11a28"
                    strokeWidth="2"
                  />
                  
                  {/* Points on line */}
                  {cumulativeData.map((item, index) => {
                    const x = index * (400 / cumulativeData.length) + (400 / cumulativeData.length) * 0.5;
                    const y = 180 - (item.cumulativePercentage / 100) * 180;
                    return (
                      <g key={`point-${item.id}`}>
                        <circle
                          cx={x}
                          cy={y}
                          r={3}
                          fill="#e11a28"
                        />
                        <text
                          x={x}
                          y={y - 10}
                          textAnchor="middle"
                          fontSize="8"
                          fill="#e11a28"
                        >
                          {item.cumulativePercentage.toFixed(0)}%
                        </text>
                      </g>
                    );
                  })}
                  
                  {/* Y-axis labels */}
                  <text x="-30" y="0" textAnchor="end" fontSize="8" alignmentBaseline="middle">100%</text>
                  <text x="-30" y="45" textAnchor="end" fontSize="8" alignmentBaseline="middle">75%</text>
                  <text x="-30" y="90" textAnchor="end" fontSize="8" alignmentBaseline="middle">50%</text>
                  <text x="-30" y="135" textAnchor="end" fontSize="8" alignmentBaseline="middle">25%</text>
                  <text x="-30" y="180" textAnchor="end" fontSize="8" alignmentBaseline="middle">0%</text>
                  
                  {/* Axis titles */}
                  <text x="200" y="210" textAnchor="middle" fontSize="10">Error Types</text>
                  <text x="-40" y="90" textAnchor="middle" fontSize="10" transform="rotate(-90 -40 90)">Error Count / Cumulative %</text>
                </g>
              </svg>
            </Box>
            
            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
              Pareto Analysis: 80% of errors come from the first 3 error types
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}; 