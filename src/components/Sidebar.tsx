import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  Avatar,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Receipt as ReceiptIcon,
  LocalShipping as ShippingIcon,
  Logout as LogoutIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { logout } from '../redux/slices/authSlice';

const drawerWidth = 260;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Invoices', icon: <ReceiptIcon />, path: '/invoices' },
  { text: 'DC', icon: <ShippingIcon />, path: '/dc' },
];

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { user } = useAppSelector((state) => state.auth);

  const isLight = theme.palette.mode === 'light';

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: isLight 
            ? 'linear-gradient(180deg, #0369a1 0%, #0ea5e9 100%)' 
            : 'linear-gradient(180deg, #075985 0%, #0c4a6e 100%)',
          color: isLight ? '#f0f9ff' : '#e0f2fe',
          borderRight: 'none',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        },
      }}
    >
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1.5,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <BusinessIcon sx={{ color: '#ffffff', fontSize: 20 }} />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight="bold" sx={{ color: '#ffffff', lineHeight: 1.2 }}>
            StoneCrush
          </Typography>
          <Typography variant="caption" sx={{ color: isLight ? 'rgba(255, 255, 255, 0.7)' : 'rgba(224, 242, 254, 0.6)' }}>
            GST Invoice System
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ borderColor: isLight ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)' }} />
      
      <Box sx={{ overflow: 'auto', mt: 2, flexGrow: 1 }}>
        <List>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5, px: 2 }}>
                <ListItemButton
                  selected={isActive}
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    color: isActive 
                      ? '#ffffff' 
                      : (isLight ? 'rgba(255, 255, 255, 0.75)' : 'rgba(224, 242, 254, 0.6)'),
                    mb: 0.5,
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(255, 255, 255, 0.18)',
                      color: '#ffffff',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.28)',
                      },
                      '& .MuiListItemIcon-root': {
                        color: '#ffffff',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: isActive 
                        ? '#ffffff' 
                        : (isLight ? 'rgba(255, 255, 255, 0.75)' : 'rgba(224, 242, 254, 0.6)'),
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '0.9rem',
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Box
        sx={{
          mt: 'auto',
          p: 2,
          borderTop: '1px solid',
          borderColor: isLight ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: isLight ? '#0369a1' : '#075985',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            fontWeight: 600,
            fontSize: '0.95rem',
          }}
        >
          {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
        </Avatar>
        <Box sx={{ overflow: 'hidden', flexGrow: 1 }}>
          <Typography variant="subtitle2" fontWeight={600} noWrap sx={{ color: '#ffffff', lineHeight: 1.2 }}>
            {user?.name || 'Admin'}
          </Typography>
          <Typography
            variant="caption"
            noWrap
            sx={{
              display: 'block',
              color: isLight ? 'rgba(255, 255, 255, 0.7)' : 'rgba(224, 242, 254, 0.6)',
              lineHeight: 1.2,
            }}
          >
            {user?.email || 'admin@stonecrush.com'}
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={handleLogout}
          sx={{
            color: isLight ? 'rgba(255, 255, 255, 0.8)' : 'rgba(224, 242, 254, 0.7)',
            '&:hover': {
              color: '#ffffff',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            },
          }}
        >
          <LogoutIcon fontSize="small" />
        </IconButton>
      </Box>
    </Drawer>
  );
};
