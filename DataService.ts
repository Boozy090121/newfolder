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

// Create pre-generated static mock data
const MOCK_DATA: DashboardData = createStaticMockData();

// Hook to access the static data
export function useDataService() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    // Simply return the static data with a small delay to simulate loading
    const timer = setTimeout(() => {
      setData(MOCK_DATA);
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return { data, isLoading, error };
}

// Create static mock data
function createStaticMockData(): DashboardData {
  // Create mock lots
  const lots: Record<string, LotData> = {};
  
  // Add 6 sample lots with different statuses
  lots['NAR0001'] = {
    id: 'NAR0001',
    number: 'NAR0001',
    product: 'WEGOVY 2.4MG 4 PREF PENS',
    customer: 'NOVO NORDISK',
    startDate: '2023-12-01',
    dueDate: '2024-01-15',
    status: 'Complete',
    rftRate: 95.2,
    trend: [91, 92, 93, 94, 95, 95.2, 95.2],
    errors: 0,
    cycleTime: 18,
    cycleTimeTarget: 21,
    hasErrors: false,
    errorTypes: [],
    bulkBatch: 'NAT0235',
    strength: 2.4
  };
  
  lots['NAR0002'] = {
    id: 'NAR0002',
    number: 'NAR0002',
    product: 'WEGOVY 1.7MG 4 PREF PENS',
    customer: 'NOVO NORDISK',
    startDate: '2023-12-15',
    dueDate: '2024-01-30',
    status: 'In Progress',
    rftRate: 92.1,
    trend: [90, 91, 91.5, 92, 92.1, 92.1, 92.1],
    errors: 2,
    cycleTime: 21,
    cycleTimeTarget: 21,
    hasErrors: true,
    errorTypes: ['Label Error', 'Documentation Error'],
    bulkBatch: 'NAT0235',
    strength: 1.7
  };
  
  lots['NAR0003'] = {
    id: 'NAR0003',
    number: 'NAR0003',
    product: 'WEGOVY 1.0MG 4 PREF PENS',
    customer: 'NOVO NORDISK',
    startDate: '2023-12-20',
    dueDate: '2024-02-05',
    status: 'At Risk',
    rftRate: 80.5,
    trend: [85, 83, 82, 81, 80, 80.5, 80.5],
    errors: 6,
    cycleTime: 25,
    cycleTimeTarget: 21,
    hasErrors: true,
    errorTypes: ['Assembly Error', 'Label Error', 'Validation Error'],
    bulkBatch: 'NAT0235',
    strength: 1.0
  };
  
  lots['NAR0004'] = {
    id: 'NAR0004',
    number: 'NAR0004',
    product: 'WEGOVY 0.5MG 4 PREF PENS',
    customer: 'NOVO NORDISK',
    startDate: '2023-12-25',
    dueDate: '2024-02-10',
    status: 'On Hold',
    rftRate: 88.3,
    trend: [88, 87, 87.5, 88, 88.3, 88.3, 88.3],
    errors: 3,
    cycleTime: 23,
    cycleTimeTarget: 21,
    hasErrors: true,
    errorTypes: ['Documentation Error'],
    bulkBatch: 'NAT0236',
    strength: 0.5
  };
  
  lots['NAR0005'] = {
    id: 'NAR0005',
    number: 'NAR0005',
    product: 'WEGOVY 0.25MG 4 PREF PENS',
    customer: 'NOVO NORDISK',
    startDate: '2024-01-05',
    dueDate: '2024-02-20',
    status: 'In Progress',
    rftRate: 91.8,
    trend: [91, 91.2, 91.5, 91.8, 91.8, 91.8, 91.8],
    errors: 1,
    cycleTime: 19,
    cycleTimeTarget: 21,
    hasErrors: true,
    errorTypes: ['Assembly Error'],
    bulkBatch: 'NAT0236',
    strength: 0.25
  };
  
  lots['NAR0006'] = {
    id: 'NAR0006',
    number: 'NAR0006',
    product: 'WEGOVY 2.4MG 4 PREF PENS',
    customer: 'NOVO NORDISK',
    startDate: '2024-01-10',
    dueDate: '2024-02-25',
    status: 'In Progress',
    rftRate: 94.0,
    trend: [92, 93, 93.5, 94, 94, 94, 94],
    errors: 0,
    cycleTime: 17,
    cycleTimeTarget: 21,
    hasErrors: false,
    errorTypes: [],
    bulkBatch: 'NAT0236',
    strength: 2.4
  };
  
  // Create RFT trend data
  const rftTrend: RftData[] = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    // Create slightly random but upward trend
    const dayFactor = 1 - (i / 30); 
    const baseline = 85 + (dayFactor * 10); 
    const randomFactor = Math.random() * 3;
    
    rftTrend.push({
      date: date.toISOString().split('T')[0],
      overall: Math.min(100, baseline + randomFactor),
      internal: Math.min(100, baseline + 2 + randomFactor),
      external: Math.min(100, baseline + 4 + randomFactor)
    });
  }
  
  // Create timeline events
  const timelineEvents: TimelineEvent[] = [
    { lot: 'NAR0001', event: 'Bulk Receipt', date: '2023-12-01', status: 'complete' },
    { lot: 'NAR0001', event: 'Assembly Start', date: '2023-12-05', status: 'complete' },
    { lot: 'NAR0001', event: 'Assembly Finish', date: '2023-12-10', status: 'complete' },
    { lot: 'NAR0001', event: 'Packaging Start', date: '2023-12-15', status: 'complete' },
    { lot: 'NAR0001', event: 'Packaging Finish', date: '2023-12-20', status: 'complete' },
    { lot: 'NAR0001', event: 'Release', date: '2024-01-10', status: 'complete' },
    { lot: 'NAR0001', event: 'Shipment', date: '2024-01-15', status: 'complete' },
    
    { lot: 'NAR0002', event: 'Bulk Receipt', date: '2023-12-15', status: 'complete' },
    { lot: 'NAR0002', event: 'Assembly Start', date: '2023-12-20', status: 'complete' },
    { lot: 'NAR0002', event: 'Assembly Finish', date: '2023-12-27', status: 'complete' },
    { lot: 'NAR0002', event: 'Error Reported', date: '2023-12-22', status: 'error' },
    { lot: 'NAR0002', event: 'Error Reported', date: '2023-12-25', status: 'error' },
    { lot: 'NAR0002', event: 'Packaging Start', date: '2024-01-05', status: 'complete' },
    
    { lot: 'NAR0003', event: 'Bulk Receipt', date: '2023-12-20', status: 'complete' },
    { lot: 'NAR0003', event: 'Assembly Start', date: '2023-12-28', status: 'complete' },
    { lot: 'NAR0003', event: 'Error Reported', date: '2023-12-29', status: 'error' },
    { lot: 'NAR0003', event: 'Error Reported', date: '2023-12-30', status: 'error' },
    { lot: 'NAR0003', event: 'Error Reported', date: '2024-01-02', status: 'error' },
    { lot: 'NAR0003', event: 'Error Reported', date: '2024-01-05', status: 'error' },
    { lot: 'NAR0003', event: 'Error Reported', date: '2024-01-08', status: 'error' },
    { lot: 'NAR0003', event: 'Error Reported', date: '2024-01-10', status: 'error' },
    
    { lot: 'NAR0004', event: 'Bulk Receipt', date: '2023-12-25', status: 'complete' },
    { lot: 'NAR0004', event: 'Assembly Start', date: '2024-01-02', status: 'complete' },
    { lot: 'NAR0004', event: 'Error Reported', date: '2024-01-05', status: 'error' },
    { lot: 'NAR0004', event: 'Error Reported', date: '2024-01-06', status: 'error' },
    { lot: 'NAR0004', event: 'Error Reported', date: '2024-01-07', status: 'error' },
    
    { lot: 'NAR0005', event: 'Bulk Receipt', date: '2024-01-05', status: 'complete' },
    { lot: 'NAR0005', event: 'Assembly Start', date: '2024-01-10', status: 'complete' },
    { lot: 'NAR0005', event: 'Assembly Finish', date: '2024-01-15', status: 'complete' },
    { lot: 'NAR0005', event: 'Error Reported', date: '2024-01-12', status: 'error' },
    
    { lot: 'NAR0006', event: 'Bulk Receipt', date: '2024-01-10', status: 'complete' },
    { lot: 'NAR0006', event: 'Assembly Start', date: '2024-01-15', status: 'complete' }
  ];
  
  // Create predictive insights
  const predictions: PredictiveInsight[] = [
    {
      id: 'insight-1',
      lot: 'NAR0003',
      type: 'Quality Risk',
      severity: 'high',
      description: 'Lot NAR0003 has 6 errors and high risk of failing RFT requirements.',
      recommendation: 'Conduct quality review meeting and implement corrective actions.'
    },
    {
      id: 'insight-2',
      lot: 'NAR0003',
      type: 'Cycle Time',
      severity: 'medium',
      description: 'Lot NAR0003 cycle time (25 days) exceeds target by 19%.',
      recommendation: 'Review process bottlenecks and optimize production schedule.'
    },
    {
      id: 'insight-3',
      lot: 'NAR0004',
      type: 'Error Pattern',
      severity: 'medium',
      description: 'Lot NAR0004 shows consistent Documentation Error patterns.',
      recommendation: 'Implement additional training and process controls for this error type.'
    },
    {
      id: 'insight-4',
      lot: 'ALL',
      type: 'Process Improvement',
      severity: 'low',
      description: 'Assembly process efficiency can be improved based on recent trend analysis.',
      recommendation: 'Review staffing levels and equipment calibration schedules.'
    }
  ];
  
  // Create summary metrics
  const lotValues = Object.values(lots);
  const inProgressLots = lotValues.filter(lot => lot.status === 'In Progress').length;
  const completedLots = lotValues.filter(lot => lot.status === 'Complete').length;
  const atRiskLots = lotValues.filter(lot => lot.status === 'At Risk').length;
  
  return {
    lots,
    rftTrend,
    timelineEvents,
    predictions,
    summary: {
      lotCount: lotValues.length,
      rftRate: 90.3,
      avgCycleTime: 20.5,
      avgErrors: 2,
      inProgressLots,
      completedLots,
      atRiskLots
    }
  };
} 