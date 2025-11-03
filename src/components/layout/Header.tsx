import { useState } from 'react';
import { NavLink } from 'react-router-dom';

import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Link,
  Stack,
  Drawer,
  Divider,
  useTheme,
  Container,
  IconButton,
  useMediaQuery,
} from '@mui/material';

import { navigationLinks } from '../../data/navigation.ts';

const Header = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = () => setIsDrawerOpen((open) => !open);

  const renderNavLinks = (onNavigate?: () => void) => (
    <Stack
      component="nav"
      direction={isDesktop ? 'row' : 'column'}
      gap={isDesktop ? 8 : 3}
      alignItems={isDesktop ? 'center' : 'stretch'}
      sx={{ textTransform: 'uppercase', letterSpacing: '0.2em' }}
    >
      {navigationLinks.map((link) => (
        <Link
          key={link.path}
          component={NavLink}
          to={link.path}
          end
          onClick={onNavigate}
          underline="none"
          sx={{
            position: 'relative',
            fontSize: '0.95rem',
            fontWeight: 400,
            opacity: 0.6,
            transition: 'opacity 0.3s ease, transform 0.3s ease',
            '&::after': {
              content: '""',
              position: 'absolute',
              left: 0,
              bottom: -6,
              width: '100%',
              height: 2,
              backgroundColor: 'text.primary',
              transform: 'scaleX(0)',
              transformOrigin: 'center',
              transition: 'transform 0.3s ease',
            },
            '&:hover': {
              opacity: 1,
              transform: 'translateY(-2px)',
            },
            '&:hover::after': {
              transform: 'scaleX(1)',
            },
            '&.active': {
              fontWeight: 600,
              opacity: 1,
              '&::after': {
                transform: 'scaleX(1)',
              },
            },
          }}
        >
          {link.label}
        </Link>
      ))}
    </Stack>
  );

  return (
    <Box
      component="header"
      sx={{ bgcolor: 'background.default', position: 'sticky', top: 0, zIndex: 1200 }}
    >
      <Container>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent={{ xs: 'center', md: 'space-between' }}
          py={{ xs: 2, md: 3 }}
          position="relative"
        >
          {!isDesktop && (
            <IconButton
              onClick={toggleDrawer}
              aria-label="Abrir menu"
              sx={{
                position: 'absolute',
                left: 0,
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Box component={NavLink} to="/" sx={{ display: 'inline-flex', p: 1 }}>
            <Box
              component="img"
              src="/images/logo.png"
              alt="Logotipo Logani"
              sx={{ height: '35px', width: 'auto' }}
            />
          </Box>
          {isDesktop ? (
            renderNavLinks()
          ) : (
            <Drawer
              anchor="left"
              open={isDrawerOpen}
              onClose={toggleDrawer}
              PaperProps={{
                sx: {
                  width: '70vw',
                  maxWidth: 320,
                  bgcolor: 'background.default',
                  p: 3,
                },
              }}
            >
              <Stack direction="row" justifyContent="flex-end">
                <IconButton onClick={toggleDrawer} aria-label="Fechar menu">
                  <CloseIcon />
                </IconButton>
              </Stack>
              <Divider sx={{ my: 2 }} />
              {renderNavLinks(toggleDrawer)}
            </Drawer>
          )}
        </Stack>
      </Container>
    </Box>
  );
};

export default Header;
