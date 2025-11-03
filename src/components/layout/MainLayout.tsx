import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { Box } from '@mui/material';

import Footer from './Footer.tsx';
import Header from './Header.tsx';

const MainLayout = () => {
  const location = useLocation();

  useEffect(() => {
    // Small delay to ensure the page content is rendered
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 10);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <Box display="flex" minHeight="100vh" flexDirection="column" bgcolor="background.default">
      <Header />
      <Box component="main" flexGrow={1}>
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
};

export default MainLayout;
