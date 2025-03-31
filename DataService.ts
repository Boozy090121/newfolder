// @ts-ignore
import { useState, useEffect } from 'react';

// Define interfaces for the processed data
export interface LotData {
  id: string;
  number: string;
  product: string;
  customer: string;
  startDate: string;
  dueDate: string;
  status: 'In Progress' | 'Complete' | 'On Hold' | 'At Risk';
  rftRate: number;
  trend: number[];
  errors: number;
  cycleTime: number;
  cycleTimeTarget: number;
  hasErrors: boolean;
  errorTypes: string[];
  bulkBatch?: string;
  strength?: number;
}

export interface RftData {
  date: string;
  overall: number;
  internal: number;
  external: number;
}

export interface TimelineEvent {
  lot: string;
  event: string;
  date: string;
  status: string;
}

export interface PredictiveInsight {
  id: string;
  lot: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  recommendation: string;
}

export interface DashboardData {
  lots: Record<string, LotData>;
  rftTrend: RftData[];
  timelineEvents: TimelineEvent[];
  predictions: PredictiveInsight[];
  summary: {
    lotCount: number;
    rftRate: number;
    avgCycleTime: number;
    avgErrors: number;
    inProgressLots: number;
    completedLots: number;
    atRiskLots: number;
  };
}

// Create a hook that returns mock data
export function useDataService() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    async function loadMockData() {
      try {
        setIsLoading(true);
        
        // Simulate loading time
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Generate mock data
        const mockData = generateMockData();
        
        setData(mockData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error creating mock data:', err);
        setError('Failed to create mock data for display');
        setIsLoading(false);
      }
    }
    
    loadMockData();
  }, []);

  return { data, isLoading, error };
}

// Generate complete mock data set
function generateMockData(): DashboardData {
  // Create mock lots
  const lots: Record<string, LotData> = {};
  
  // Create 10 sample lots
  const statuses: ('In Progress' | 'Complete' | 'On Hold' | 'At Risk')[] = ['In Progress', 'Complete', 'On Hold', 'At Risk'];
  const strengths = [0.25, 0.5, 1.0, 1.7, 2.4];
  const errorTypes = ['Label Error', 'Assembly Error', 'Cartoning Error', 'Documentation Error', 'Validation Error'];
  
  for (let i = 1; i <= 10; i++) {
    const lotNumber = `NAR${String(i).padStart(4, '0')}`;
    const strength = strengths[Math.floor(Math.random() * strengths.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const rftRate = 80 + Math.random() * 20;
    const errors = status === 'At Risk' ? 5 + Math.floor(Math.random() * 5) : Math.floor(Math.random() * 3);
    
    // Generate start and due dates
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - Math.floor(Math.random() * 60)); // Random start in last 60 days
    
    const dueDate = new Date(startDate);
    dueDate.setDate(startDate.getDate() + 30 + Math.floor(Math.random() * 30)); // Due date 30-60 days after start
    
    lots[lotNumber] = {
      id: lotNumber,
      number: lotNumber,
      product: `WEGOVY ${strength}MG 4 PREF PENS`,
      customer: 'NOVO NORDISK',
      startDate: startDate.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      status,
      rftRate,
      trend: Array(7).fill(0).map(() => 80 + Math.random() * 20),
      errors,
      cycleTime: 14 + Math.floor(Math.random() * 14),
      cycleTimeTarget: 21,
      hasErrors: errors > 0,
      errorTypes: errors > 0 ? 
        Array(errors).fill(0).map(() => errorTypes[Math.floor(Math.random() * errorTypes.length)]) : 
        [],
      bulkBatch: `NAT${String(1000 + i).padStart(4, '0')}`,
      strength
    };
  }
  
  // Create RFT trend data
  const rftTrend: RftData[] = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // Create slightly random but upward trend
    const dayFactor = 1 - (i / 30); // Higher for more recent days
    const baseline = 85 + (dayFactor * 10); // Starting at 85% and trending up to 95%
    const randomFactor = Math.random() * 3; // Add some randomness
    
    rftTrend.push({
      date: date.toISOString().split('T')[0],
      overall: Math.min(100, baseline + randomFactor),
      internal: Math.min(100, baseline + 2 + randomFactor),
      external: Math.min(100, baseline + 4 + randomFactor)
    });
  }
  
  // Create timeline events
  const timelineEvents: TimelineEvent[] = [];
  const eventTypes = ['Bulk Receipt', 'Assembly Start', 'Assembly Finish', 'Packaging Start', 'Packaging Finish', 'Release', 'Shipment'];
  
  Object.values(lots).forEach(lot => {
    // Generate random events for this lot
    const startDateObj = new Date(lot.startDate);
    const dueDateObj = new Date(lot.dueDate);
    
    // Calculate total days between start and due date
    const totalDays = (dueDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24);
    
    // Determine how many events to create based on status
    let eventCount = 0;
    if (lot.status === 'Complete') {
      eventCount = eventTypes.length;
    } else if (lot.status === 'In Progress') {
      eventCount = 2 + Math.floor(Math.random() * 3); // 2-4 events
    } else if (lot.status === 'On Hold') {
      eventCount = 1 + Math.floor(Math.random() * 3); // 1-3 events
    } else if (lot.status === 'At Risk') {
      eventCount = 2 + Math.floor(Math.random() * 2); // 2-3 events
    }
    
    // Generate events
    for (let i = 0; i < eventCount; i++) {
      const eventDate = new Date(startDateObj);
      const dayOffset = Math.floor((totalDays / eventTypes.length) * i);
      eventDate.setDate(startDateObj.getDate() + dayOffset);
      
      timelineEvents.push({
        lot: lot.id,
        event: eventTypes[i],
        date: eventDate.toISOString().split('T')[0],
        status: 'complete'
      });
    }
    
    // Add error events if there are errors
    if (lot.hasErrors) {
      for (let i = 0; i < lot.errors; i++) {
        const errorDate = new Date(startDateObj);
        const randomDayOffset = Math.floor(Math.random() * totalDays);
        errorDate.setDate(startDateObj.getDate() + randomDayOffset);
        
        timelineEvents.push({
          lot: lot.id,
          event: 'Error Reported',
          date: errorDate.toISOString().split('T')[0],
          status: 'error'
        });
      }
    }
  });
  
  // Sort events by date
  timelineEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Create predictive insights
  const predictions: PredictiveInsight[] = [];
  let insightId = 1;
  
  // Add insights for at-risk lots
  Object.values(lots).filter(lot => lot.status === 'At Risk').forEach(lot => {
    predictions.push({
      id: `insight-${insightId++}`,
      lot: lot.id,
      type: 'Quality Risk',
      severity: 'high',
      description: `Lot ${lot.id} has ${lot.errors} errors and high risk of failing RFT requirements.`,
      recommendation: 'Conduct quality review meeting and implement corrective actions.'
    });
  });
  
  // Add insights for long cycle times
  Object.values(lots).filter(lot => lot.cycleTime > lot.cycleTimeTarget * 1.2).forEach(lot => {
    predictions.push({
      id: `insight-${insightId++}`,
      lot: lot.id,
      type: 'Cycle Time',
      severity: 'medium',
      description: `Lot ${lot.id} cycle time (${lot.cycleTime} days) exceeds target by ${Math.round((lot.cycleTime / lot.cycleTimeTarget - 1) * 100)}%.`,
      recommendation: 'Review process bottlenecks and optimize production schedule.'
    });
  });
  
  // Add generic insights
  predictions.push({
    id: `insight-${insightId++}`,
    lot: 'ALL',
    type: 'Process Improvement',
    severity: 'low',
    description: 'Assembly process efficiency can be improved based on recent trend analysis.',
    recommendation: 'Review staffing levels and equipment calibration schedules.'
  });
  
  // Calculate summary metrics
  const lotValues = Object.values(lots);
  const inProgressLots = lotValues.filter(lot => lot.status === 'In Progress').length;
  const completedLots = lotValues.filter(lot => lot.status === 'Complete').length;
  const atRiskLots = lotValues.filter(lot => lot.status === 'At Risk').length;
  const totalCycleTime = lotValues.reduce((sum, lot) => sum + lot.cycleTime, 0);
  const avgCycleTime = lotValues.length > 0 ? totalCycleTime / lotValues.length : 0;
  const totalErrors = lotValues.reduce((sum, lot) => sum + lot.errors, 0);
  const avgErrors = lotValues.length > 0 ? totalErrors / lotValues.length : 0;
  const rftLots = lotValues.filter(lot => lot.errors === 0).length;
  const averageRftRate = lotValues.length > 0 ? (rftLots / lotValues.length) * 100 : 0;
  
  return {
    lots,
    rftTrend,
    timelineEvents,
    predictions,
    summary: {
      lotCount: lotValues.length,
      rftRate: averageRftRate,
      avgCycleTime,
      avgErrors,
      inProgressLots,
      completedLots,
      atRiskLots
    }
  };
} 