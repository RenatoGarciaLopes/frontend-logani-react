import type React from 'react';
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
  Typography,
  useMediaQuery,
} from '@mui/material';

import UserMenu from '../common/UserMenu.tsx';
import LoginModal from '../common/LoginModal.tsx';
import CartDrawer from '../common/CartDrawer.tsx';
import { getAuthData } from '../../services/api.ts';
import { navigationLinks } from '../../data/navigation.ts';

const Header = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const toggleDrawer = () => setIsDrawerOpen((open) => !open);
  const handleOpenLoginModal = () => setIsLoginModalOpen(true);
  const handleOpenCart = () => setIsCartOpen(true);
  const handleCloseCart = () => setIsCartOpen(false);
  const handleUserIconClick = (event: React.MouseEvent<HTMLElement>) => {
    if (userName) {
      setUserMenuAnchorEl(event.currentTarget);
    } else {
      handleOpenLoginModal();
    }
  };
  const handleCloseUserMenu = () => {
    setUserMenuAnchorEl(null);
  };

  // Força atualização quando o modal de login fecha para atualizar o nome do usuário
  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
    setUpdateTrigger((prev) => prev + 1);
  };

  // Re-renderiza quando updateTrigger muda, recarregando os dados do usuário
  const authData = getAuthData();
  const userName = authData.user?.name || null;

  // Usa updateTrigger para forçar re-render quando o login é realizado
  void updateTrigger;

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
          justifyContent={{ xs: 'center', md: 'flex-start' }}
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
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                justifyContent: 'flex-end',
                pr: userName ? 10 : 0,
              }}
            >
              {renderNavLinks()}
            </Box>
          ) : null}
          {!isDesktop && (
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
              <Divider sx={{ my: 2 }} />
              <IconButton
                onClick={() => {
                  toggleDrawer();
                  handleOpenLoginModal();
                }}
                aria-label="Login"
                sx={{
                  color: 'text.primary',
                  justifyContent: 'flex-start',
                  width: '100%',
                  py: 1.5,
                }}
              >
                <Box
                  component="img"
                  src="/icons/user-bold-duotone.svg"
                  alt="Usuário"
                  sx={{ width: 24, height: 24, mr: 2 }}
                />
                <Box
                  component="span"
                  sx={{ textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.95rem' }}
                >
                  Login
                </Box>
              </IconButton>
            </Drawer>
          )}
        </Stack>
      </Container>
      {isDesktop && (
        <Box
          sx={{
            position: 'absolute',
            right: 24,
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        >
          <Stack direction="row" alignItems="center" gap={1.5}>
            {userName && (
              <Typography
                variant="body2"
                sx={{
                  color: 'text.primary',
                  opacity: 0.8,
                  fontSize: '0.9rem',
                  whiteSpace: 'nowrap',
                }}
              >
                Olá, {userName}
              </Typography>
            )}
            <IconButton
              onClick={handleUserIconClick}
              aria-label={userName ? 'Menu do usuário' : 'Login'}
              sx={{
                color: 'text.primary',
                opacity: 0.6,
                transition: 'opacity 0.3s ease',
                '&:hover': {
                  opacity: 1,
                },
              }}
            >
              <Box
                component="img"
                src="/icons/user-rounded-bold.svg"
                alt="Usuário"
                sx={{ width: 34, height: 34 }}
              />
            </IconButton>
            <IconButton
              onClick={handleOpenCart}
              aria-label="Carrinho"
              sx={{
                color: 'text.primary',
                opacity: 0.6,
                transition: 'opacity 0.3s ease',
                '&:hover': {
                  opacity: 1,
                },
              }}
            >
              <Box
                component="img"
                src="/icons/bag-bold.svg"
                alt="Carrinho"
                sx={{ width: 34, height: 34 }}
              />
            </IconButton>
          </Stack>
        </Box>
      )}
      <LoginModal open={isLoginModalOpen} onClose={handleCloseLoginModal} />
      <CartDrawer open={isCartOpen} onClose={handleCloseCart} />
      <UserMenu
        anchorEl={userMenuAnchorEl}
        open={Boolean(userMenuAnchorEl)}
        onClose={handleCloseUserMenu}
        onLogout={() => {
          setUpdateTrigger((prev) => prev + 1);
        }}
      />
    </Box>
  );
};

export default Header;
