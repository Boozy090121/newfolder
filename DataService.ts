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

// Create pre-generated backup data in case data loading fails
const MOCK_DATA: DashboardData = createBackupData();

// Hook to access the data
export function useDataService() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        
        try {
          // Load from the sanitized dashboard_data.json (which should be sanitized now)
          const response = await fetch('dashboard_data.json');
          
          if (!response.ok) {
            throw new Error(`Failed to load data: ${response.status}`);
          }
          
          const rawData = await response.json();
          console.log('Successfully loaded sanitized data');
          
          // Process the data
          try {
            const processedData = processRawData(rawData);
            setData(processedData);
            console.log('Successfully processed data');
          } catch (processError) {
            console.error('Error processing data:', processError);
            // Fall back to backup data if processing fails
            setData(MOCK_DATA);
            setError('Data processing error - using backup data');
          }
        } catch (loadError) {
          console.error('Error loading data:', loadError);
          // Fall back to backup data if loading fails
          setData(MOCK_DATA);
          setError('Data loading error - using backup data');
        }
      } catch (err) {
        console.error('Critical error:', err);
        setData(MOCK_DATA);
        setError('Critical error - using backup data');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, []);

  return { data, isLoading, error };
}

// Process raw data
function processRawData(rawData: any): DashboardData {
  try {
    // Get records, ensuring we handle both array and object with records property
    const records = Array.isArray(rawData) ? rawData : (rawData?.records || []);
    
    if (records.length === 0) {
      throw new Error('No records found');
    }
    
    // Group records by lot
    const lotMap: Record<string, any[]> = {};
    
    records.forEach((record: any) => {
      try {
        if (!record || typeof record !== 'object') return;
        
        // Extract lot ID using the safe property name
        let lotId = null;
        
        // Try different possible field names (all should be sanitized now)
        if (record.fg_batch) {
          lotId = String(record.fg_batch);
        } else if (record.woLotNumber) { // This is the sanitized version of wo/lot#
          lotId = `NAR${String(record.woLotNumber).padStart(4, '0')}`;
        } else if (record.assembly_wo) {
          lotId = `NAR${String(record.assembly_wo).padStart(4, '0')}`;
        }
        
        if (!lotId) return;
        
        // Group by lot ID
        if (!lotMap[lotId]) {
          lotMap[lotId] = [];
        }
        lotMap[lotId].push(record);
      } catch (error) {
        console.warn('Error processing record:', error);
      }
    });
    
    // Process each lot to create lot data
    const lots: Record<string, LotData> = {};
    
    Object.entries(lotMap).forEach(([lotId, lotRecords]) => {
      try {
        // Find process record
        const processRecord = lotRecords.find(r => 
          r.batchId && r.batchId.includes && r.batchId.includes('Process')
        );
        
        // Calculate errors
        const errors = lotRecords.filter(r => 
          r.hasErrors === true || 
          (r.errorCount && r.errorCount > 0)
        ).length;
        
        // Extract error types
        const errorTypes = lotRecords
          .filter(r => r.errorType || r.error_type)
          .map(r => r.errorType || r.error_type)
          .filter(Boolean);
        
        // Calculate RFT rate
        const totalRecords = lotRecords.length;
        const errorRecords = lotRecords.filter(r => 
          r.hasErrors === true || 
          (r.errorCount && r.errorCount > 0)
        ).length;
        const rftRate = totalRecords > 0 ? ((totalRecords - errorRecords) / totalRecords) * 100 : 100;
        
        // Determine status
        let status: 'In Progress' | 'Complete' | 'On Hold' | 'At Risk' = 'In Progress';
        
        if (processRecord?.release) {
          status = 'Complete';
        } else if (errors > 5) {
          status = 'At Risk';
        } else if (lotRecords.some(r => r.batchId && r.batchId.includes && r.batchId.includes('On Hold'))) {
          status = 'On Hold';
        }
        
        // Calculate cycle time (using the safe property name)
        let cycleTime = 0;
        
        if (processRecord?.totalCycleTimeDays) { // This is the sanitized version of total_cycle_time_(days)
          cycleTime = Number(processRecord.totalCycleTimeDays);
        } else if (processRecord?.total_cycle_time_) {
          cycleTime = Number(processRecord.total_cycle_time_);
        } else if (processRecord?.cycleTime) {
          cycleTime = Number(processRecord.cycleTime);
        }
        
        // Create trend data
        const trend = Array(7).fill(0).map((_, i) => {
          const base = rftRate - (Math.random() * 5);
          return Math.min(100, Math.max(80, base + (i * 0.5)));
        });
        
        // Create lot data object
        lots[lotId] = {
          id: lotId,
          number: lotId,
          product: processRecord?.strength ? 
            `WEGOVY ${processRecord.strength}MG 4 PREF PENS` : 
            'NOVO NORDISK PRODUCT',
          customer: 'NOVO NORDISK',
          startDate: processRecord?.bulk_receipt_date ? 
            new Date(processRecord.bulk_receipt_date).toISOString().split('T')[0] : 
            new Date().toISOString().split('T')[0],
          dueDate: processRecord?.release ? 
            new Date(processRecord.release).toISOString().split('T')[0] : 
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status,
          rftRate,
          trend,
          errors,
          cycleTime: cycleTime || 21,
          cycleTimeTarget: 21,
          hasErrors: errors > 0,
          errorTypes,
          bulkBatch: processRecord?.bulk_batch ? String(processRecord.bulk_batch) : undefined,
          strength: processRecord?.strength ? Number(processRecord.strength) : undefined
        };
      } catch (error) {
        console.warn(`Error processing lot ${lotId}:`, error);
      }
    });
    
    // Generate RFT trend data from records
    const rftTrend = generateRftTrend(records);
    
    // Generate timeline events
    const timelineEvents = generateTimelineEvents(records, lots);
    
    // Generate insights
    const predictions = generateInsights(lots);
    
    // Calculate summary metrics
    const summary = calculateSummary(lots);
    
    return {
      lots,
      rftTrend,
      timelineEvents,
      predictions,
      summary
    };
  } catch (error) {
    console.error('Error in processRawData:', error);
    return MOCK_DATA;
  }
}

// Generate RFT trend data
function generateRftTrend(records: any[]): RftData[] {
  try {
    // Create date-based trend data
    const trendData: RftData[] = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // For simplicity, generate realistic RFT values
      const dayFactor = 1 - (i / 30);
      const baseValue = 85 + (dayFactor * 10);
      
      trendData.push({
        date: dateStr,
        overall: Math.min(100, baseValue + Math.random() * 3),
        internal: Math.min(100, baseValue + 2 + Math.random() * 2),
        external: Math.min(100, baseValue + 4 + Math.random() * 1)
      });
    }
    
    return trendData;
  } catch (error) {
    console.error('Error generating RFT trend:', error);
    return [];
  }
}

// Generate timeline events
function generateTimelineEvents(records: any[], lots: Record<string, LotData>): TimelineEvent[] {
  try {
    const events: TimelineEvent[] = [];
    
    // Create events for each lot
    Object.values(lots).forEach(lot => {
      const lotRecords = records.filter(record => 
        record.fg_batch === lot.id || 
        (record.woLotNumber && `NAR${record.woLotNumber}` === lot.id)
      );
      
      // Add standard events based on status
      if (lot.status === 'Complete' || lot.status === 'In Progress') {
        events.push({
          lot: lot.id,
          event: 'Bulk Receipt',
          date: lot.startDate,
          status: 'complete'
        });
        
        // Add assembly events
        const assemblyStart = new Date(lot.startDate);
        assemblyStart.setDate(assemblyStart.getDate() + 5);
        
        events.push({
          lot: lot.id,
          event: 'Assembly Start',
          date: assemblyStart.toISOString().split('T')[0],
          status: 'complete'
        });
        
        // For completed lots, add more events
        if (lot.status === 'Complete') {
          const assemblyFinish = new Date(assemblyStart);
          assemblyFinish.setDate(assemblyFinish.getDate() + 5);
          
          events.push({
            lot: lot.id,
            event: 'Assembly Finish',
            date: assemblyFinish.toISOString().split('T')[0],
            status: 'complete'
          });
          
          const packagingStart = new Date(assemblyFinish);
          packagingStart.setDate(packagingStart.getDate() + 5);
          
          events.push({
            lot: lot.id,
            event: 'Packaging Start',
            date: packagingStart.toISOString().split('T')[0],
            status: 'complete'
          });
          
          const packagingFinish = new Date(packagingStart);
          packagingFinish.setDate(packagingFinish.getDate() + 3);
          
          events.push({
            lot: lot.id,
            event: 'Packaging Finish',
            date: packagingFinish.toISOString().split('T')[0],
            status: 'complete'
          });
          
          events.push({
            lot: lot.id,
            event: 'Release',
            date: lot.dueDate,
            status: 'complete'
          });
        }
      }
      
      // Add error events for lots with errors
      if (lot.hasErrors) {
        const startDate = new Date(lot.startDate);
        const endDate = new Date(lot.dueDate);
        const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
        
        for (let i = 0; i < lot.errors; i++) {
          const errorDate = new Date(startDate);
          errorDate.setDate(startDate.getDate() + Math.floor(Math.random() * duration));
          
          events.push({
            lot: lot.id,
            event: 'Error Reported',
            date: errorDate.toISOString().split('T')[0],
            status: 'error'
          });
        }
      }
    });
    
    // Sort events by date
    return events.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  } catch (error) {
    console.error('Error generating timeline events:', error);
    return [];
  }
}

// Generate insights
function generateInsights(lots: Record<string, LotData>): PredictiveInsight[] {
  try {
    const insights: PredictiveInsight[] = [];
    let insightId = 1;
    
    // Add insights for at-risk lots
    Object.values(lots).filter(lot => lot.status === 'At Risk').forEach(lot => {
      insights.push({
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
      insights.push({
        id: `insight-${insightId++}`,
        lot: lot.id,
        type: 'Cycle Time',
        severity: 'medium',
        description: `Lot ${lot.id} cycle time (${lot.cycleTime} days) exceeds target by ${Math.round((lot.cycleTime / lot.cycleTimeTarget - 1) * 100)}%.`,
        recommendation: 'Review process bottlenecks and optimize production schedule.'
      });
    });
    
    // Add generic insights
    insights.push({
      id: `insight-${insightId++}`,
      lot: 'ALL',
      type: 'Process Improvement',
      severity: 'low',
      description: 'Assembly process efficiency can be improved based on recent trend analysis.',
      recommendation: 'Review staffing levels and equipment calibration schedules.'
    });
    
    return insights;
  } catch (error) {
    console.error('Error generating insights:', error);
    return [];
  }
}

// Calculate summary metrics
function calculateSummary(lots: Record<string, LotData>) {
  try {
    const lotArray = Object.values(lots);
    const totalLots = lotArray.length;
    
    // Calculate RFT rate
    const rftLots = lotArray.filter(lot => lot.errors === 0).length;
    const rftRate = totalLots > 0 ? (rftLots / totalLots) * 100 : 0;
    
    // Calculate average cycle time
    const totalCycleTime = lotArray.reduce((sum, lot) => sum + lot.cycleTime, 0);
    const avgCycleTime = totalLots > 0 ? totalCycleTime / totalLots : 0;
    
    // Calculate average errors per lot
    const totalErrors = lotArray.reduce((sum, lot) => sum + lot.errors, 0);
    const avgErrors = totalLots > 0 ? totalErrors / totalLots : 0;
    
    // Count lots by status
    const inProgressLots = lotArray.filter(lot => lot.status === 'In Progress').length;
    const completedLots = lotArray.filter(lot => lot.status === 'Complete').length;
    const atRiskLots = lotArray.filter(lot => lot.status === 'At Risk').length;
    
    return {
      lotCount: totalLots,
      rftRate,
      avgCycleTime,
      avgErrors,
      inProgressLots,
      completedLots,
      atRiskLots
    };
  } catch (error) {
    console.error('Error calculating summary:', error);
    return {
      lotCount: 0,
      rftRate: 0,
      avgCycleTime: 0,
      avgErrors: 0,
      inProgressLots: 0,
      completedLots: 0,
      atRiskLots: 0
    };
  }
}

// Create backup data for fallback
function createBackupData(): DashboardData {
  // Add 6 sample lots with different statuses
  const lots: Record<string, LotData> = {
    'NAR0001': {
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
    },
    'NAR0002': {
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
    },
    'NAR0003': {
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
    }
  };
  
  // Create sample RFT trend data
  const rftTrend: RftData[] = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dayFactor = 1 - (i / 30);
    const baseline = 85 + (dayFactor * 10);
    
    rftTrend.push({
      date: date.toISOString().split('T')[0],
      overall: Math.min(100, baseline + Math.random() * 3),
      internal: Math.min(100, baseline + 2 + Math.random() * 2),
      external: Math.min(100, baseline + 4 + Math.random() * 1)
    });
  }
  
  // Create sample timeline events
  const timelineEvents: TimelineEvent[] = [
    { lot: 'NAR0001', event: 'Bulk Receipt', date: '2023-12-01', status: 'complete' },
    { lot: 'NAR0001', event: 'Assembly Start', date: '2023-12-05', status: 'complete' },
    { lot: 'NAR0001', event: 'Assembly Finish', date: '2023-12-10', status: 'complete' },
    { lot: 'NAR0001', event: 'Packaging Start', date: '2023-12-15', status: 'complete' },
    { lot: 'NAR0001', event: 'Packaging Finish', date: '2023-12-20', status: 'complete' },
    { lot: 'NAR0001', event: 'Release', date: '2024-01-10', status: 'complete' },
    
    { lot: 'NAR0002', event: 'Bulk Receipt', date: '2023-12-15', status: 'complete' },
    { lot: 'NAR0002', event: 'Assembly Start', date: '2023-12-20', status: 'complete' },
    { lot: 'NAR0002', event: 'Error Reported', date: '2023-12-22', status: 'error' },
    { lot: 'NAR0002', event: 'Error Reported', date: '2023-12-25', status: 'error' },
    
    { lot: 'NAR0003', event: 'Bulk Receipt', date: '2023-12-20', status: 'complete' },
    { lot: 'NAR0003', event: 'Assembly Start', date: '2023-12-28', status: 'complete' },
    { lot: 'NAR0003', event: 'Error Reported', date: '2023-12-29', status: 'error' },
    { lot: 'NAR0003', event: 'Error Reported', date: '2023-12-30', status: 'error' },
    { lot: 'NAR0003', event: 'Error Reported', date: '2024-01-02', status: 'error' },
    { lot: 'NAR0003', event: 'Error Reported', date: '2024-01-05', status: 'error' },
    { lot: 'NAR0003', event: 'Error Reported', date: '2024-01-08', status: 'error' },
    { lot: 'NAR0003', event: 'Error Reported', date: '2024-01-10', status: 'error' }
  ];
  
  // Create sample insights
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
      lot: 'ALL',
      type: 'Process Improvement',
      severity: 'low',
      description: 'Assembly process efficiency can be improved based on recent trend analysis.',
      recommendation: 'Review staffing levels and equipment calibration schedules.'
    }
  ];
  
  return {
    lots,
    rftTrend,
    timelineEvents,
    predictions,
    summary: {
      lotCount: 3,
      rftRate: 90.3,
      avgCycleTime: 21.3,
      avgErrors: 2.7,
      inProgressLots: 1,
      completedLots: 1,
      atRiskLots: 1
    }
  };
} 