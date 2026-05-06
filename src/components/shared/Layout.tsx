import { useState } from 'react'
import {
  Box, AppBar, Toolbar, Drawer, IconButton, Typography,
  List, ListItemButton, ListItemIcon, ListItemText, Divider,
  useMediaQuery, useTheme, Tooltip, Stack, Chip,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  DirectionsCar as CarIcon,
  Add as AddIcon,
  Build as BuildIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useVehicles } from '../../hooks'

const DRAWER_WIDTH = 240
const DRAWER_COLLAPSED = 68

export default function Layout() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { data: vehicles } = useVehicles()

  const drawerWidth = isMobile ? DRAWER_WIDTH : collapsed ? DRAWER_COLLAPSED : DRAWER_WIDTH

  const navItems = [
    { label: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { label: 'All Vehicles', icon: <CarIcon />, path: '/vehicles' },
    { label: 'Add Vehicle', icon: <AddIcon />, path: '/vehicles/new' },
  ]

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <Box sx={{ px: 2, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, minHeight: 64 }}>
        <Box
          sx={{
            width: 32, height: 32, borderRadius: '8px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <BuildIcon sx={{ fontSize: 18, color: '#0f1117' }} />
        </Box>
        {!collapsed && (
          <Box>
            <Typography variant="subtitle2" sx={{ fontFamily: '"DM Mono", monospace', fontWeight: 500, lineHeight: 1.2 }}>
              WrenchLog
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
              Maintenance Log
            </Typography>
          </Box>
        )}
      </Box>

      <Divider />

      {/* Nav */}
      <List sx={{ px: 1, pt: 1, flexGrow: 1 }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path
          return (
            <Tooltip key={item.path} title={collapsed ? item.label : ''} placement="right">
              <ListItemButton
                selected={active}
                onClick={() => { navigate(item.path); setMobileOpen(false) }}
                sx={{ justifyContent: collapsed ? 'center' : 'flex-start', px: collapsed ? 1.5 : 2 }}
              >
                <ListItemIcon sx={{ minWidth: collapsed ? 0 : 36, color: active ? 'primary.main' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: active ? 600 : 400 }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          )
        })}

        {/* Vehicle shortcuts */}
        {!collapsed && vehicles && vehicles.length > 0 && (
          <>
            <Box sx={{ px: 1, pt: 2, pb: 0.5 }}>
              <Typography variant="overline" color="text.secondary">My Vehicles</Typography>
            </Box>
            {vehicles.map((v) => (
              <ListItemButton
                key={v.id}
                selected={location.pathname === `/vehicles/${v.id}`}
                onClick={() => { navigate(`/vehicles/${v.id}`); setMobileOpen(false) }}
                sx={{ px: 2 }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CarIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                </ListItemIcon>
                <ListItemText
                  primary={v.name}
                  secondary={`${v.year} ${v.make} ${v.model}`}
                  primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 500 }}
                  secondaryTypographyProps={{ fontSize: '0.7rem' }}
                />
              </ListItemButton>
            ))}
          </>
        )}
      </List>

      {/* Collapse toggle */}
      {!isMobile && (
        <>
          <Divider />
          <Box sx={{ p: 1 }}>
            <Tooltip title={collapsed ? 'Expand' : 'Collapse'} placement="right">
              <IconButton onClick={() => setCollapsed(!collapsed)} size="small" sx={{ width: '100%', borderRadius: 2 }}>
                <ChevronLeftIcon sx={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
              </IconButton>
            </Tooltip>
          </Box>
        </>
      )}
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile AppBar */}
      {isMobile && (
        <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={() => setMobileOpen(true)} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
            <Stack direction="row" alignItems="center" gap={1}>
              <BuildIcon sx={{ color: 'primary.main', fontSize: 20 }} />
              <Typography variant="h6" sx={{ fontFamily: '"DM Mono", monospace', fontSize: '1rem' }}>
                WrenchLog
              </Typography>
            </Stack>
          </Toolbar>
        </AppBar>
      )}

      {/* Sidebar */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            transition: 'width 0.2s',
            '& .MuiDrawer-paper': { width: drawerWidth, overflowX: 'hidden', transition: 'width 0.2s' },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          pt: isMobile ? 8 : 0,
          backgroundColor: 'background.default',
          minHeight: '100vh',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  )
}
