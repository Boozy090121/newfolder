import React, { useState } from 'react';
import { Box, CssBaseline, Drawer, AppBar, Toolbar, Typography, Divider, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BarChartIcon from '@mui/icons-material/BarChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import Dashboard from './pages/Dashboard';
import LotAnalysis from './pages/LotAnalysis';

const drawerWidth = 240;

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState('dashboard');

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const renderPage = () => {
    switch (selectedPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'lot-analysis':
        return <LotAnalysis />;
      default:
        return <Dashboard />;
    }
  };

  const drawer = (
    <div>
      <Toolbar sx={{ 
        backgroundColor: 'primary.main', 
        color: 'white',
        display: 'flex',
        justifyContent: 'center',
        py: 1
      }}>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
          Novo Nordisk
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton
            selected={selectedPage === 'dashboard'}
            onClick={() => setSelectedPage('dashboard')}
          >
            <ListItemIcon>
              <DashboardIcon color={selectedPage === 'dashboard' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            selected={selectedPage === 'internal-rft'}
            onClick={() => setSelectedPage('internal-rft')}
          >
            <ListItemIcon>
              <AssessmentIcon color={selectedPage === 'internal-rft' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Internal RFT" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            selected={selectedPage === 'external-rft'}
            onClick={() => setSelectedPage('external-rft')}
          >
            <ListItemIcon>
              <BarChartIcon color={selectedPage === 'external-rft' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="External RFT" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            selected={selectedPage === 'process-metrics'}
            onClick={() => setSelectedPage('process-metrics')}
          >
            <ListItemIcon>
              <TimelineIcon color={selectedPage === 'process-metrics' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Process Metrics" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            selected={selectedPage === 'lot-analysis'}
            onClick={() => setSelectedPage('lot-analysis')}
          >
            <ListItemIcon>
              <DonutLargeIcon color={selectedPage === 'lot-analysis' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Lot Analysis" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            selected={selectedPage === 'insights'}
            onClick={() => setSelectedPage('insights')}
          >
            <ListItemIcon>
              <LightbulbIcon color={selectedPage === 'insights' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Predictive Insights" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: 'white',
          color: 'primary.main',
          boxShadow: 1
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
            Manufacturing Analytics Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="navigation menu"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        {renderPage()}
      </Box>
    </Box>
  );
} 