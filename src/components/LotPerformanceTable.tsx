import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Paper,
  Chip,
  Typography,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  CircularProgress
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SearchIcon from '@mui/icons-material/Search';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import FilterListIcon from '@mui/icons-material/FilterList';
import { Sparklines, SparklinesLine, SparklinesSpots } from 'react-sparklines';
import { useDataService, LotData } from '../services/DataService';

type SortField = 'number' | 'product' | 'startDate' | 'dueDate' | 'status' | 'rftRate' | 'errors' | 'cycleTime';
type SortDirection = 'asc' | 'desc';

export const LotPerformanceTable: React.FC = () => {
  const { data, isLoading, error } = useDataService();
  const [sortField, setSortField] = useState<SortField>('startDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedLots, setSelectedLots] = useState<string[]>([]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusFilterChange = (event: SelectChangeEvent<string>) => {
    setStatusFilter(event.target.value);
  };

  const handleLotSelect = (lotId: string) => {
    if (selectedLots.includes(lotId)) {
      setSelectedLots(selectedLots.filter(id => id !== lotId));
    } else {
      setSelectedLots([...selectedLots, lotId]);
    }
  };

  const sortedAndFilteredLots = useMemo(() => {
    if (!data?.lots) return [];
    
    let filteredLots = Object.values(data.lots);

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredLots = filteredLots.filter(lot => 
        lot.number.toLowerCase().includes(searchLower) ||
        lot.product.toLowerCase().includes(searchLower) ||
        lot.customer.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (statusFilter !== 'All') {
      filteredLots = filteredLots.filter(lot => lot.status === statusFilter);
    }

    // Apply sorting
    return filteredLots.sort((a, b) => {
      if (sortField === 'number') {
        return sortDirection === 'asc' 
          ? a.number.localeCompare(b.number)
          : b.number.localeCompare(a.number);
      } else if (sortField === 'product') {
        return sortDirection === 'asc' 
          ? a.product.localeCompare(b.product)
          : b.product.localeCompare(a.product);
      } else if (sortField === 'startDate') {
        return sortDirection === 'asc' 
          ? new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          : new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      } else if (sortField === 'dueDate') {
        return sortDirection === 'asc' 
          ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      } else if (sortField === 'status') {
        return sortDirection === 'asc' 
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      } else if (sortField === 'rftRate') {
        return sortDirection === 'asc' 
          ? a.rftRate - b.rftRate
          : b.rftRate - a.rftRate;
      } else if (sortField === 'errors') {
        return sortDirection === 'asc' 
          ? a.errors - b.errors
          : b.errors - a.errors;
      } else if (sortField === 'cycleTime') {
        return sortDirection === 'asc' 
          ? a.cycleTime - b.cycleTime
          : b.cycleTime - a.cycleTime;
      }
      return 0;
    });
  }, [data?.lots, sortField, sortDirection, searchTerm, statusFilter]);

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

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <TextField
          placeholder="Search lots..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ width: 250 }}
        />
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControl size="small" variant="outlined" sx={{ minWidth: 120 }}>
            <Select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              displayEmpty
              startAdornment={
                <InputAdornment position="start">
                  <FilterListIcon fontSize="small" />
                </InputAdornment>
              }
            >
              <MenuItem value="All">All Status</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Complete">Complete</MenuItem>
              <MenuItem value="On Hold">On Hold</MenuItem>
              <MenuItem value="At Risk">At Risk</MenuItem>
            </Select>
          </FormControl>
          
          <Tooltip title="Compare Selected Lots">
            <span>
              <IconButton 
                size="small" 
                disabled={selectedLots.length < 2}
                color={selectedLots.length >= 2 ? 'primary' : 'default'}
              >
                <CompareArrowsIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>
      
      <TableContainer 
        component={Paper} 
        sx={{ 
          flex: 1, 
          overflow: 'auto',
          '& .MuiTableCell-root': {
            fontSize: '0.875rem',
            py: 1.5
          }
        }} 
        elevation={0}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell width={80} align="center" sx={{ bgcolor: 'action.hover' }}>
                Select
              </TableCell>
              <TableCell 
                onClick={() => handleSort('number')}
                sx={{ 
                  cursor: 'pointer', 
                  bgcolor: 'action.hover',
                  '&:hover': { bgcolor: 'action.selected' }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Lot Number
                  {sortField === 'number' && (
                    sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                  )}
                </Box>
              </TableCell>
              <TableCell 
                onClick={() => handleSort('product')}
                sx={{ 
                  cursor: 'pointer', 
                  bgcolor: 'action.hover',
                  '&:hover': { bgcolor: 'action.selected' }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Product
                  {sortField === 'product' && (
                    sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                  )}
                </Box>
              </TableCell>
              <TableCell 
                onClick={() => handleSort('startDate')}
                sx={{ 
                  cursor: 'pointer', 
                  bgcolor: 'action.hover',
                  '&:hover': { bgcolor: 'action.selected' }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Start Date
                  {sortField === 'startDate' && (
                    sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                  )}
                </Box>
              </TableCell>
              <TableCell 
                onClick={() => handleSort('dueDate')}
                sx={{ 
                  cursor: 'pointer', 
                  bgcolor: 'action.hover',
                  '&:hover': { bgcolor: 'action.selected' }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Due Date
                  {sortField === 'dueDate' && (
                    sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                  )}
                </Box>
              </TableCell>
              <TableCell 
                onClick={() => handleSort('status')}
                sx={{ 
                  cursor: 'pointer', 
                  bgcolor: 'action.hover',
                  '&:hover': { bgcolor: 'action.selected' }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Status
                  {sortField === 'status' && (
                    sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                  )}
                </Box>
              </TableCell>
              <TableCell 
                onClick={() => handleSort('rftRate')}
                sx={{ 
                  cursor: 'pointer', 
                  bgcolor: 'action.hover',
                  '&:hover': { bgcolor: 'action.selected' }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  RFT Rate
                  {sortField === 'rftRate' && (
                    sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                  )}
                </Box>
              </TableCell>
              <TableCell 
                onClick={() => handleSort('errors')}
                sx={{ 
                  cursor: 'pointer', 
                  bgcolor: 'action.hover',
                  '&:hover': { bgcolor: 'action.selected' }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Errors
                  {sortField === 'errors' && (
                    sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                  )}
                </Box>
              </TableCell>
              <TableCell 
                onClick={() => handleSort('cycleTime')}
                sx={{ 
                  cursor: 'pointer', 
                  bgcolor: 'action.hover',
                  '&:hover': { bgcolor: 'action.selected' }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Cycle Time
                  {sortField === 'cycleTime' && (
                    sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                  )}
                </Box>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedAndFilteredLots.map(lot => (
              <TableRow 
                key={lot.id}
                hover
                selected={selectedLots.includes(lot.id)}
                sx={{ 
                  '&.Mui-selected': {
                    backgroundColor: 'action.selected',
                    '&:hover': {
                      backgroundColor: 'action.selected',
                    }
                  }
                }}
              >
                <TableCell padding="checkbox" align="center">
                  <IconButton 
                    size="small" 
                    onClick={() => handleLotSelect(lot.id)}
                    color={selectedLots.includes(lot.id) ? 'primary' : 'default'}
                  >
                    {lot.errors > 0 ? (
                      <WarningIcon fontSize="small" color="warning" />
                    ) : (
                      <CheckCircleIcon fontSize="small" color="success" />
                    )}
                  </IconButton>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {lot.number}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{lot.product}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {lot.customer}
                  </Typography>
                </TableCell>
                <TableCell>{lot.startDate}</TableCell>
                <TableCell>{lot.dueDate}</TableCell>
                <TableCell>
                  <Chip 
                    label={lot.status} 
                    size="small" 
                    color={getStatusColor(lot.status) as any}
                    sx={{ 
                      fontWeight: 500,
                      minWidth: 90
                    }} 
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography 
                      variant="body2" 
                      fontWeight="medium"
                      color={lot.rftRate < 90 ? 'error.main' : lot.rftRate >= 95 ? 'success.main' : 'warning.main'}
                    >
                      {lot.rftRate.toFixed(1)}%
                    </Typography>
                    <Box sx={{ width: 60 }}>
                      <Sparklines data={lot.trend} height={20} margin={2}>
                        <SparklinesLine 
                          color={lot.rftRate < 90 ? '#d32f2f' : lot.rftRate >= 95 ? '#2e7d32' : '#ed6c02'} 
                          style={{ strokeWidth: 2, fill: 'none' }}
                        />
                        <SparklinesSpots size={2} />
                      </Sparklines>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography 
                    variant="body2"
                    fontWeight="medium"
                    color={lot.errors > 10 ? 'error.main' : lot.errors > 5 ? 'warning.main' : 'text.primary'}
                  >
                    {lot.errors}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography 
                      variant="body2"
                      fontWeight="medium"
                      color={
                        lot.cycleTime > lot.cycleTimeTarget * 1.2 ? 'error.main' : 
                        lot.cycleTime > lot.cycleTimeTarget ? 'warning.main' : 
                        'success.main'
                      }
                    >
                      {lot.cycleTime.toFixed(1)} days
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ ml: 0.5 }}
                    >
                      / {lot.cycleTimeTarget} days
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            
            {sortedAndFilteredLots.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No lots found matching the current filters
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Showing {sortedAndFilteredLots.length} of {data.lots ? Object.keys(data.lots).length : 0} lots
        </Typography>
        
        <Typography variant="caption" color="text.secondary">
          Selected: {selectedLots.length} lots
        </Typography>
      </Box>
    </Box>
  );
}; 