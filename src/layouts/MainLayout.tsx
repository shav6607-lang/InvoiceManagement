import React from 'react';
import { Box, ThemeProvider, CssBaseline } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { lightTheme, darkTheme } from '../theme';

export const MainLayout: React.FC = () => {
  const [mode, setMode] = React.useState<'light' | 'dark'>('light');

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = React.useMemo(() => (mode === 'light' ? lightTheme : darkTheme), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        <Sidebar />
        <Header toggleColorMode={toggleColorMode} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: `calc(100% - 260px)`,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  );
};
