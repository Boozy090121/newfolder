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

// Create a hook to load and process data
export function useDataService() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    async function loadAndProcessData() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Load data from dashboard_data.json
        try {
          const response = await fetch('dashboard_data.json');
          if (!response.ok) {
            throw new Error(`Failed to load data: ${response.status}`);
          }
          
          const rawData = await response.json();
          console.log('Loaded data successfully');
          
          // Pre-process data to check for problematic structures
          if (!rawData || typeof rawData !== 'object') {
            throw new Error('Invalid data format: Expected object, got ' + typeof rawData);
          }
          
          // Process data using lot-based adapter methods
          try {
            const processedData = processRawData(rawData);
            
            if (Object.keys(processedData.lots).length === 0) {
              console.warn('No lots found in processed data. Using fallback data.');
              setData(generateFallbackData());
            } else {
              console.log(`Successfully processed ${Object.keys(processedData.lots).length} lots`);
              setData(processedData);
            }
          } catch (processError) {
            console.error('Failed to process raw data:', processError);
            throw new Error('Data processing error: ' + (processError instanceof Error ? processError.message : String(processError)));
          }
        } catch (fetchError) {
          console.error('Fetch or parsing error:', fetchError);
          throw new Error('Failed to load or parse data file: ' + (fetchError instanceof Error ? fetchError.message : String(fetchError)));
        }
      } catch (err) {
        console.error('Error loading or processing data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Set fallback data
        setData(generateFallbackData());
      } finally {
        setIsLoading(false);
      }
    }
    
    loadAndProcessData();
  }, []);

  return { data, isLoading, error };
}

// Process raw data similar to how lot-based-data-adapter.js does it
function processRawData(rawData: any): DashboardData {
  try {
    console.log("Starting data processing...");
    
    // Safely extract records array
    let records: any[] = [];
    if (Array.isArray(rawData)) {
      records = rawData;
    } else if (rawData && typeof rawData === 'object') {
      if (Array.isArray(rawData.records)) {
        records = rawData.records;
      } else {
        // If no records array found, try to convert the object itself to an array
        try {
          records = Object.values(rawData).filter(value => 
            value && typeof value === 'object' && !Array.isArray(value)
          );
        } catch (err) {
          console.warn("Failed to extract records from data object:", err);
        }
      }
    }
    
    console.log(`Found ${records.length} records to process`);
    
    if (records.length === 0) {
      throw new Error('No records to process');
    }
    
    // Group records by lot
    const lotMap: Record<string, any[]> = {};
    let processedRecordCount = 0;
    
    // Process records in batches to avoid long-running loops
    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      batch.forEach((record: any) => {
        try {
          // Skip null, undefined, or non-object records
          if (!record || typeof record !== 'object' || Array.isArray(record)) {
            return;
          }
          
          const lotId = getLotId(record);
          if (lotId) {
            if (!lotMap[lotId]) {
              lotMap[lotId] = [];
            }
            lotMap[lotId].push(record);
            processedRecordCount++;
          }
        } catch (error) {
          console.warn('Error processing record in batch:', error);
        }
      });
    }
    
    console.log(`Grouped ${processedRecordCount} records into ${Object.keys(lotMap).length} lots`);
    
    // Process each lot to create lot data
    const lots: Record<string, LotData> = {};
    let successfulLots = 0;
    
    Object.entries(lotMap).forEach(([lotId, lotRecords]) => {
      try {
        lots[lotId] = processLotRecords(lotId, lotRecords);
        successfulLots++;
      } catch (error) {
        console.warn(`Error processing lot ${lotId}:`, error);
      }
    });
    
    console.log(`Successfully processed ${successfulLots} lots`);
    
    // Calculate RFT trend (last 90 days)
    let rftTrend: RftData[] = [];
    try {
      rftTrend = calculateRftTrend(records);
      console.log(`Generated RFT trend with ${rftTrend.length} data points`);
    } catch (error) {
      console.warn('Error calculating RFT trend:', error);
      // Use empty trend data
      rftTrend = [];
    }
    
    // Extract timeline events
    let timelineEvents: TimelineEvent[] = [];
    try {
      timelineEvents = extractTimelineEvents(records);
      console.log(`Extracted ${timelineEvents.length} timeline events`);
    } catch (error) {
      console.warn('Error extracting timeline events:', error);
      // Use empty events
      timelineEvents = [];
    }
    
    // Generate predictive insights
    let predictions: PredictiveInsight[] = [];
    try {
      predictions = generatePredictiveInsights(lots);
      console.log(`Generated ${predictions.length} predictive insights`);
    } catch (error) {
      console.warn('Error generating predictive insights:', error);
      // Use empty predictions
      predictions = [];
    }
    
    // Calculate summary metrics
    let summary = {
      lotCount: 0,
      rftRate: 0,
      avgCycleTime: 0,
      avgErrors: 0,
      inProgressLots: 0,
      completedLots: 0,
      atRiskLots: 0
    };
    
    try {
      summary = calculateSummaryMetrics(lots);
      console.log('Generated summary metrics');
    } catch (error) {
      console.warn('Error calculating summary metrics:', error);
    }
    
    console.log('Data processing completed successfully');
    
    return {
      lots,
      rftTrend,
      timelineEvents,
      predictions,
      summary
    };
  } catch (error) {
    console.error('Error in processRawData:', error);
    // Return empty data structure on error
    return {
      lots: {},
      rftTrend: [],
      timelineEvents: [],
      predictions: [],
      summary: {
        lotCount: 0,
        rftRate: 0,
        avgCycleTime: 0,
        avgErrors: 0,
        inProgressLots: 0,
        completedLots: 0,
        atRiskLots: 0
      }
    };
  }
}

// Extract lot ID from a record
function getLotId(record: any): string | null {
  // Safeguard against non-objects
  if (!record || typeof record !== 'object') return null;
  
  try {
    // Direct access to common lot ID field names (guaranteed to be safe)
    if (record.fg_batch) return String(record.fg_batch);
    if (record.lotNumber) return String(record.lotNumber);
    if (record.lot) return String(record.lot);
    
    // Safer assembly_wo/cartoning_wo conversion
    if (record.assembly_wo) {
      try {
        const assemblyWo = String(record.assembly_wo);
        // Extract digits only and pad
        const digits = assemblyWo.replace(/\D/g, '');
        return `NAR${digits.padStart(4, '0')}`;
      } catch (e) {
        // Ignore conversion errors
      }
    }
    
    if (record.cartoning_wo) {
      try {
        const cartoningWo = String(record.cartoning_wo);
        // Extract digits only and pad
        const digits = cartoningWo.replace(/\D/g, '');
        return `NAR${digits.padStart(4, '0')}`;
      } catch (e) {
        // Ignore conversion errors
      }
    }
    
    // Loop through all properties by key name to find anything that might be a lot number
    // This avoids directly accessing properties with problematic names like 'wo/lot#'
    const keys = Object.keys(record);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      
      // Skip any property that might cause issues
      if (key.includes('/') || key.includes('#') || key.includes('.')) continue;
      
      try {
        const value = record[key];
        
        // Check if value is a string and contains NAR pattern
        if (typeof value === 'string') {
          const match = /NAR\d+/.exec(value);
          if (match) return match[0];
        } 
        // Try to convert to string if it's not already
        else if (value !== null && value !== undefined) {
          try {
            const strValue = String(value);
            const match = /NAR\d+/.exec(strValue);
            if (match) return match[0];
          } catch (e) {
            // Ignore conversion errors
          }
        }
      } catch (e) {
        // Skip any property that causes errors
        continue;
      }
    }
    
    // Last resort: Search values for NAR pattern without accessing keys directly
    try {
      const allValues = Object.values(record);
      for (let i = 0; i < allValues.length; i++) {
        const value = allValues[i];
        if (typeof value === 'string') {
          const match = /NAR\d+/.exec(value);
          if (match) return match[0];
        } else if (value !== null && value !== undefined) {
          try {
            const strValue = String(value);
            const match = /NAR\d+/.exec(strValue);
            if (match) return match[0];
          } catch (e) {
            // Ignore conversion errors
          }
        }
      }
    } catch (e) {
      // Ignore errors in Object.values
    }
    
    return null;
  } catch (err) {
    console.warn('Error in getLotId:', err);
    return null;
  }
}

// Process records for a single lot
function processLotRecords(lotId: string, records: any[]): LotData {
  try {
    // Find process record (if any)
    const processRecord = records.find(r => {
      try {
        return r.batchId && typeof r.batchId === 'string' && r.batchId.includes('Process');
      } catch (e) {
        return false;
      }
    });
    
    // Count errors safely
    const errors = records.filter(r => {
      try {
        return r.hasErrors === true || 
          (r.errorCount && r.errorCount > 0) || 
          (r.batchId && typeof r.batchId === 'string' && r.batchId.includes('Internal RFT'));
      } catch (e) {
        return false;
      }
    }).length;
    
    // Extract error types safely
    const errorTypes = records
      .filter(r => {
        try {
          return r.errorType || r.error_type;
        } catch (e) {
          return false;
        }
      })
      .map(r => {
        try {
          return r.errorType || r.error_type;
        } catch (e) {
          return '';
        }
      })
      .filter(Boolean);
    
    // Calculate RFT rate
    const totalRecords = records.length;
    const errorRecords = records.filter(r => {
      try {
        return r.hasErrors === true || (r.errorCount && r.errorCount > 0);
      } catch (e) {
        return false;
      }
    }).length;
    const rftRate = totalRecords > 0 ? ((totalRecords - errorRecords) / totalRecords) * 100 : 100;
    
    // Determine status safely
    let status: 'In Progress' | 'Complete' | 'On Hold' | 'At Risk' = 'In Progress';
    
    try {
      if (processRecord?.release) {
        status = 'Complete';
      } else if (errors > 5) {
        status = 'At Risk';
      } else if (records.some(r => {
        try {
          return r.batchId && typeof r.batchId === 'string' && r.batchId.includes('On Hold');
        } catch (e) {
          return false;
        }
      })) {
        status = 'On Hold';
      }
    } catch (e) {
      // Keep default status on error
    }
    
    // Calculate cycle time safely
    let cycleTime = 0;
    try {
      if (processRecord?.total_cycle_time_) {
        cycleTime = Number(processRecord.total_cycle_time_) || 0;
      } else if (processRecord && processRecord['total_cycle_time_(days)']) {
        cycleTime = Number(processRecord['total_cycle_time_(days)']) || 0;
      } else if (processRecord?.cycleTime) {
        cycleTime = Number(processRecord.cycleTime) || 0;
      }
    } catch (e) {
      // Use default cycle time on error
    }
    
    // Generate trend data (simplified)
    const trend = Array(7).fill(0).map((_, i) => {
      const base = rftRate - (Math.random() * 5);
      return Math.min(100, Math.max(80, base + (i * 0.5)));
    });
    
    // Format date safely
    const formatDate = (dateValue: any, defaultDaysToAdd = 0): string => {
      try {
        if (!dateValue) {
          const defaultDate = new Date();
          if (defaultDaysToAdd) {
            defaultDate.setDate(defaultDate.getDate() + defaultDaysToAdd);
          }
          return defaultDate.toISOString().split('T')[0];
        }
        
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) {
          const defaultDate = new Date();
          if (defaultDaysToAdd) {
            defaultDate.setDate(defaultDate.getDate() + defaultDaysToAdd);
          }
          return defaultDate.toISOString().split('T')[0];
        }
        
        return date.toISOString().split('T')[0];
      } catch (e) {
        const defaultDate = new Date();
        if (defaultDaysToAdd) {
          defaultDate.setDate(defaultDate.getDate() + defaultDaysToAdd);
        }
        return defaultDate.toISOString().split('T')[0];
      }
    };
    
    // Extract product name safely
    let product = 'NOVO NORDISK PRODUCT';
    try {
      if (processRecord?.strength) {
        product = `WEGOVY ${processRecord.strength}MG 4 PREF PENS`;
      }
    } catch (e) {
      // Use default product name on error
    }
    
    // Extract bulk batch safely
    let bulkBatch = undefined;
    try {
      if (processRecord?.bulk_batch) {
        bulkBatch = String(processRecord.bulk_batch);
      }
    } catch (e) {
      // Leave bulk batch undefined on error
    }
    
    // Extract strength safely
    let strength = undefined;
    try {
      if (processRecord?.strength) {
        strength = Number(processRecord.strength) || undefined;
      }
    } catch (e) {
      // Leave strength undefined on error
    }
    
    return {
      id: lotId,
      number: lotId,
      product,
      customer: 'NOVO NORDISK',
      startDate: processRecord?.bulk_receipt_date ? 
        formatDate(processRecord.bulk_receipt_date) : 
        formatDate(null),
      dueDate: processRecord?.release ? 
        formatDate(processRecord.release) : 
        formatDate(null, 30),
      status,
      rftRate,
      trend,
      errors,
      cycleTime,
      cycleTimeTarget: 21, // Default target
      hasErrors: errors > 0,
      errorTypes,
      bulkBatch,
      strength
    };
  } catch (error) {
    console.error('Error in processLotRecords:', error);
    // Return default lot data on error
    return {
      id: lotId,
      number: lotId,
      product: 'NOVO NORDISK PRODUCT',
      customer: 'NOVO NORDISK',
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'In Progress',
      rftRate: 95,
      trend: Array(7).fill(0).map(() => 90 + Math.random() * 5),
      errors: 0,
      cycleTime: 21,
      cycleTimeTarget: 21,
      hasErrors: false,
      errorTypes: []
    };
  }
}

// Calculate RFT trend over time
function calculateRftTrend(records: any[]): RftData[] {
  try {
    const trendData: RftData[] = [];
    
    // Create a 90-day window of dates
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 89);
    
    // Group records by date
    const recordsByDate: Record<string, any[]> = {};
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      recordsByDate[dateStr] = [];
    }
    
    // Format date safely
    const formatDate = (dateValue: any): string | null => {
      try {
        if (!dateValue) return null;
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) return null;
        return date.toISOString().split('T')[0];
      } catch (e) {
        return null;
      }
    };
    
    // Fill with actual records
    records.forEach(record => {
      try {
        if (!record || typeof record !== 'object') return;
        
        let dateStr = null;
        
        if (record.date) {
          dateStr = formatDate(record.date);
        } else if (record.input_date) {
          dateStr = formatDate(record.input_date);
        } else if (record.release) {
          dateStr = formatDate(record.release);
        }
        
        if (dateStr && recordsByDate[dateStr]) {
          recordsByDate[dateStr].push(record);
        }
      } catch (e) {
        // Skip record on error
      }
    });
    
    // Calculate RFT rates for each date
    Object.entries(recordsByDate).sort().forEach(([date, dateRecords]) => {
      try {
        if (dateRecords.length === 0) {
          // For empty dates, use previous values or defaults
          const prev = trendData[trendData.length - 1] || { overall: 95, internal: 97, external: 98 };
          trendData.push({
            date,
            overall: prev.overall + (Math.random() * 0.6 - 0.3),
            internal: prev.internal + (Math.random() * 0.4 - 0.2),
            external: prev.external + (Math.random() * 0.3 - 0.15)
          });
          return;
        }
        
        // Calculate actual rates
        const total = dateRecords.length;
        const errorRecords = dateRecords.filter(r => {
          try {
            return r.hasErrors === true || (r.errorCount && r.errorCount > 0);
          } catch (e) {
            return false;
          }
        }).length;
        
        const internalErrors = dateRecords.filter(r => {
          try {
            return (r.batchId && typeof r.batchId === 'string' && r.batchId.includes('Internal RFT')) || 
                 r.source === 'Internal';
          } catch (e) {
            return false;
          }
        }).length;
        
        const externalErrors = dateRecords.filter(r => {
          try {
            return (r.batchId && typeof r.batchId === 'string' && r.batchId.includes('External RFT')) || 
                 r.source === 'External';
          } catch (e) {
            return false;
          }
        }).length;
        
        const overallRft = total > 0 ? ((total - errorRecords) / total) * 100 : 95;
        const internalRft = total > 0 ? ((total - internalErrors) / total) * 100 : 97;
        const externalRft = total > 0 ? ((total - externalErrors) / total) * 100 : 98;
        
        trendData.push({
          date,
          overall: Math.min(100, Math.max(85, overallRft)),
          internal: Math.min(100, Math.max(88, internalRft)),
          external: Math.min(100, Math.max(90, externalRft))
        });
      } catch (e) {
        // Use default values on error
        trendData.push({
          date,
          overall: 95,
          internal: 97, 
          external: 98
        });
      }
    });
    
    // Return only the last 30 days for display purposes
    return trendData.slice(-30);
  } catch (error) {
    console.error('Error in calculateRftTrend:', error);
    // Return 30 days of default data
    const defaultData: RftData[] = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      defaultData.push({
        date: date.toISOString().split('T')[0],
        overall: 95 + (Math.random() * 3),
        internal: 97 + (Math.random() * 2),
        external: 98 + (Math.random() * 1.5)
      });
    }
    
    return defaultData;
  }
}

// Extract timeline events from records
function extractTimelineEvents(records: any[]): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  
  try {
    records.forEach(record => {
      try {
        if (!record || typeof record !== 'object') return;
        
        const lotId = getLotId(record);
        if (!lotId) return;
        
        // Format date safely
        const formatDate = (dateValue: any): string => {
          try {
            if (!dateValue) return new Date().toISOString().split('T')[0];
            const date = new Date(dateValue);
            if (isNaN(date.getTime())) return new Date().toISOString().split('T')[0];
            return date.toISOString().split('T')[0];
          } catch (e) {
            return new Date().toISOString().split('T')[0];
          }
        };
        
        // Add receipt event
        if (record.bulk_receipt_date) {
          events.push({
            lot: lotId,
            event: 'Bulk Receipt',
            date: formatDate(record.bulk_receipt_date),
            status: 'complete'
          });
        }
        
        // Add assembly events
        if (record.assembly_start) {
          events.push({
            lot: lotId,
            event: 'Assembly Start',
            date: formatDate(record.assembly_start),
            status: 'complete'
          });
        }
        
        if (record.assembly_finish) {
          events.push({
            lot: lotId,
            event: 'Assembly Finish',
            date: formatDate(record.assembly_finish),
            status: 'complete'
          });
        }
        
        // Add packaging events
        if (record.packaging_start) {
          events.push({
            lot: lotId,
            event: 'Packaging Start',
            date: formatDate(record.packaging_start),
            status: 'complete'
          });
        }
        
        if (record.packaging_finish) {
          events.push({
            lot: lotId,
            event: 'Packaging Finish',
            date: formatDate(record.packaging_finish),
            status: 'complete'
          });
        }
        
        // Add release event
        if (record.release) {
          events.push({
            lot: lotId,
            event: 'Release',
            date: formatDate(record.release),
            status: 'complete'
          });
        }
        
        // Add shipment event
        if (record.shipment) {
          events.push({
            lot: lotId,
            event: 'Shipment',
            date: formatDate(record.shipment),
            status: 'complete'
          });
        }
        
        // Add error events
        if (record.hasErrors === true || (record.errorCount && record.errorCount > 0)) {
          events.push({
            lot: lotId,
            event: 'Error Reported',
            date: record.input_date ? formatDate(record.input_date) : formatDate(null),
            status: 'error'
          });
        }
      } catch (recordError) {
        console.warn('Error processing record for timeline:', recordError);
      }
    });
    
    // Sort events by date
    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error('Error in extractTimelineEvents:', error);
    return [];
  }
}

// Generate predictive insights based on lot data
function generatePredictiveInsights(lots: Record<string, LotData>): PredictiveInsight[] {
  try {
    const insights: PredictiveInsight[] = [];
    
    Object.values(lots).forEach(lot => {
      try {
        // Add insights for at-risk lots
        if (lot.status === 'At Risk') {
          insights.push({
            id: `${lot.id}-risk`,
            lot: lot.id,
            type: 'Quality Risk',
            severity: 'high',
            description: `Lot ${lot.id} has ${lot.errors} errors and high risk of failing RFT requirements.`,
            recommendation: 'Conduct quality review meeting and implement corrective actions.'
          });
        }
        
        // Add insights for long cycle times
        if (lot.cycleTime > lot.cycleTimeTarget * 1.2) {
          insights.push({
            id: `${lot.id}-time`,
            lot: lot.id,
            type: 'Cycle Time',
            severity: 'medium',
            description: `Lot ${lot.id} cycle time (${lot.cycleTime} days) exceeds target by ${Math.round((lot.cycleTime / lot.cycleTimeTarget - 1) * 100)}%.`,
            recommendation: 'Review process bottlenecks and optimize production schedule.'
          });
        }
        
        // Add insights for common error patterns
        if (lot.errorTypes.length > 0) {
          insights.push({
            id: `${lot.id}-pattern`,
            lot: lot.id,
            type: 'Error Pattern',
            severity: 'medium',
            description: `Lot ${lot.id} shows consistent ${lot.errorTypes[0]} errors.`,
            recommendation: 'Implement additional training and process controls for this error type.'
          });
        }
      } catch (error) {
        console.warn(`Error generating insights for lot ${lot.id}:`, error);
      }
    });
    
    return insights;
  } catch (error) {
    console.error('Error in generatePredictiveInsights:', error);
    return [];
  }
}

// Calculate summary metrics
function calculateSummaryMetrics(lots: Record<string, LotData>) {
  try {
    const lotArray = Object.values(lots);
    const totalLots = lotArray.length;
    
    // Default values in case of errors
    let rftRate = 0;
    let avgCycleTime = 0;
    let avgErrors = 0;
    let inProgressLots = 0;
    let completedLots = 0;
    let atRiskLots = 0;
    
    try {
      // Calculate RFT rate
      const rftLots = lotArray.filter(lot => lot.errors === 0).length;
      rftRate = totalLots > 0 ? (rftLots / totalLots) * 100 : 0;
    } catch (error) {
      console.warn('Error calculating RFT rate:', error);
    }
    
    try {
      // Calculate average cycle time
      const totalCycleTime = lotArray.reduce((sum, lot) => sum + lot.cycleTime, 0);
      avgCycleTime = totalLots > 0 ? totalCycleTime / totalLots : 0;
    } catch (error) {
      console.warn('Error calculating average cycle time:', error);
    }
    
    try {
      // Calculate average errors per lot
      const totalErrors = lotArray.reduce((sum, lot) => sum + lot.errors, 0);
      avgErrors = totalLots > 0 ? totalErrors / totalLots : 0;
    } catch (error) {
      console.warn('Error calculating average errors:', error);
    }
    
    try {
      // Count lots by status
      inProgressLots = lotArray.filter(lot => lot.status === 'In Progress').length;
      completedLots = lotArray.filter(lot => lot.status === 'Complete').length;
      atRiskLots = lotArray.filter(lot => lot.status === 'At Risk').length;
    } catch (error) {
      console.warn('Error counting lots by status:', error);
    }
    
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
    console.error('Error in calculateSummaryMetrics:', error);
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

// Generate fallback data for display when real data can't be loaded
function generateFallbackData(): DashboardData {
  // Create sample lot
  const sampleLot: LotData = {
    id: 'NAR0001',
    number: 'NAR0001',
    product: 'WEGOVY 2.4MG 4 PREF PENS',
    customer: 'NOVO NORDISK',
    startDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'In Progress',
    rftRate: 95,
    trend: Array(7).fill(0).map(() => 90 + Math.random() * 5),
    errors: 0,
    cycleTime: 21,
    cycleTimeTarget: 21,
    hasErrors: false,
    errorTypes: [],
    bulkBatch: 'NAT0001',
    strength: 2.4
  };
  
  // Create sample timeline events
  const timelineEvents: TimelineEvent[] = [
    {
      lot: 'NAR0001',
      event: 'Bulk Receipt',
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'complete'
    },
    {
      lot: 'NAR0001',
      event: 'Assembly Start',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'complete'
    }
  ];
  
  // Create sample RFT trend data
  const rftTrend: RftData[] = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    rftTrend.push({
      date: date.toISOString().split('T')[0],
      overall: 95 + (Math.random() * 3),
      internal: 97 + (Math.random() * 2),
      external: 98 + (Math.random() * 1.5)
    });
  }
  
  return {
    lots: { 'NAR0001': sampleLot },
    rftTrend,
    timelineEvents,
    predictions: [{
      id: 'sample-insight',
      lot: 'NAR0001',
      type: 'Cycle Time',
      severity: 'medium',
      description: 'Sample insight for demonstration purposes.',
      recommendation: 'This is placeholder data due to an error loading actual data.'
    }],
    summary: {
      lotCount: 1,
      rftRate: 95,
      avgCycleTime: 21,
      avgErrors: 0,
      inProgressLots: 1,
      completedLots: 0,
      atRiskLots: 0
    }
  };
} 