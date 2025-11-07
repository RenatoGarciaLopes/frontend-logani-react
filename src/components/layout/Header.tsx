import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
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
import CartDrawer from '../common/CartDrawer.tsx';
import LoginModal from '../common/LoginModal.tsx';
import { getAuthData } from '../../services/api.ts';
import { navigationLinks } from '../../data/navigation.ts';
import type { LoginModalMode } from '../common/LoginModal.tsx';

const Header = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [loginModalMode, setLoginModalMode] = useState<LoginModalMode>('login');
  const [resetPasswordToken, setResetPasswordToken] = useState<string | null>(null);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const toggleDrawer = () => setIsDrawerOpen((open) => !open);
  const handleOpenLoginModal = useCallback(() => {
    setResetPasswordToken(null);
    setLoginModalMode('login');
    setIsLoginModalOpen(true);
  }, []);
  const handleOpenCart = useCallback(() => {
    // Verifica se o usuário está logado antes de abrir o carrinho
    const authData = getAuthData();
    if (!authData.user) {
      handleOpenLoginModal();
    } else {
      setIsCartOpen(true);
    }
  }, [handleOpenLoginModal]);
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

  useEffect(() => {
    if (location.pathname === '/reset-password') {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      setResetPasswordToken(token);
      setLoginModalMode('resetPassword');
      setIsLoginModalOpen(true);
    } else {
      setResetPasswordToken(null);
    }
  }, [location]);

  const handleLoginModalModeChange = useCallback(
    (mode: LoginModalMode) => {
      setLoginModalMode(mode);
      if (mode !== 'resetPassword' && location.pathname === '/reset-password') {
        navigate('/', { replace: true });
      }
    },
    [location.pathname, navigate]
  );

  // Força atualização quando o modal de login fecha para atualizar o nome do usuário
  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
    setUpdateTrigger((prev) => prev + 1);
    setLoginModalMode('login');
    setResetPasswordToken(null);
    if (location.pathname === '/reset-password') {
      navigate('/', { replace: true });
    }
  };

  // Re-renderiza quando updateTrigger muda, recarregando os dados do usuário
  const authData = getAuthData();
  const userName = authData.user?.name || null;
  // Extrai apenas o primeiro nome
  const firstName = userName ? userName.split(' ')[0] : null;

  // Usa updateTrigger para forçar re-render quando o login é realizado
  void updateTrigger;

  // Escuta o evento customizado para abrir o modal de login
  useEffect(() => {
    const handleOpenLoginEvent = () => {
      handleOpenLoginModal();
    };

    window.addEventListener('openLogin', handleOpenLoginEvent);

    return () => {
      window.removeEventListener('openLogin', handleOpenLoginEvent);
    };
  }, [handleOpenLoginModal]);

  // Escuta o evento customizado para abrir o carrinho
  useEffect(() => {
    const handleOpenCartEvent = () => {
      handleOpenCart();
    };

    window.addEventListener('openCart', handleOpenCartEvent);

    return () => {
      window.removeEventListener('openCart', handleOpenCartEvent);
    };
  }, [handleOpenCart]);

  const renderNavLinks = (onNavigate?: () => void) => (
    <Stack
      component="nav"
      direction={isDesktop ? 'row' : 'column'}
      gap={isDesktop ? { md: 4, lg: 6, xl: 8 } : 3}
      alignItems={isDesktop ? 'center' : 'stretch'}
      sx={{
        textTransform: 'uppercase',
        letterSpacing: '0.2em',
        flexShrink: 1,
        minWidth: 0,
        pb: 1, // Espaço para o sublinhado
      }}
    >
      {navigationLinks.map((link) => {
        const isActive =
          link.path === '/' ? location.pathname === '/' : location.pathname.startsWith(link.path);

        return (
          <Box
            key={link.path}
            component={NavLink}
            to={link.path}
            end={link.path === '/'}
            onClick={onNavigate}
            sx={{
              position: 'relative',
              display: 'inline-block',
              fontSize: { md: '0.85rem', lg: '0.9rem', xl: '0.95rem' },
              fontWeight: isActive ? 600 : 400,
              opacity: isActive ? 1 : 0.6,
              color: 'text.primary',
              textDecoration: 'none',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              transition: 'opacity 0.3s ease, transform 0.3s ease',
              pb: 1, // Espaço para o sublinhado
              '&::after': {
                content: '""',
                position: 'absolute',
                left: 0,
                bottom: 0,
                width: '100%',
                height: 2,
                backgroundColor: 'text.primary',
                transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                transformOrigin: 'center',
                transition: 'transform 0.3s ease, opacity 0.3s ease',
                opacity: isActive ? 1 : 0,
              },
              '&:hover': {
                opacity: 1,
                transform: 'translateY(-2px)',
              },
              '&:hover::after': {
                transform: 'scaleX(1)',
                opacity: 1,
              },
            }}
          >
            {link.label}
          </Box>
        );
      })}
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
                // Ajusta o padding dinamicamente baseado no tamanho da tela para evitar sobreposição
                pr: userName
                  ? {
                      md: '200px', // Espaço para "Olá, Nome" + ícones quando logado
                      lg: '180px',
                      xl: '160px',
                    }
                  : {
                      md: '140px', // Espaço apenas para os ícones quando deslogado
                      lg: '140px',
                      xl: '140px',
                    },
                transition: 'padding-right 0.3s ease',
                overflow: 'hidden', // Previne quebra de layout
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
            </Drawer>
          )}
        </Stack>
      </Container>
      <Box
        sx={{
          position: 'absolute',
          right: { xs: 2, md: 24 },
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          zIndex: 1,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          gap={{ xs: 0.3, md: 0.1, lg: 0.5 }}
          sx={{
            pb: 2,
            flexWrap: 'nowrap',
            flexShrink: 0,
          }}
        >
          {firstName && (
            <Typography
              variant="body2"
              sx={{
                color: 'text.primary',
                opacity: 0.8,
                fontSize: { xs: '0.85rem', md: '0.85rem', lg: '0.9rem' },
                whiteSpace: 'nowrap',
                flexShrink: 0,
                display: { xs: 'none', md: 'block' },
              }}
            >
              Olá, {firstName}
            </Typography>
          )}
          <IconButton
            onClick={handleUserIconClick}
            aria-label={userName ? 'Menu do usuário' : 'Login'}
            sx={{
              color: 'text.primary',
              opacity: 0.6,
              transition: 'opacity 0.3s ease',
              flexShrink: 0,
              // Mantém um respiro entre o avatar e o ícone do carrinho
              ml: { xs: 0, md: 0.5, lg: 0.75 },
              '&:hover': {
                opacity: 1,
              },
            }}
          >
            <Box
              component="img"
              src="/icons/user-rounded-bold.svg"
              alt="Usuário"
              sx={{ width: { xs: 28, md: 32, lg: 34 }, height: { xs: 28, md: 32, lg: 34 } }}
            />
          </IconButton>
          <IconButton
            onClick={handleOpenCart}
            aria-label="Carrinho"
            sx={{
              color: 'text.primary',
              opacity: 0.6,
              transition: 'opacity 0.3s ease',
              flexShrink: 0,
              '&:hover': {
                opacity: 1,
              },
            }}
          >
            <Box
              component="img"
              src="/icons/bag-bold.svg"
              alt="Carrinho"
              sx={{ width: { xs: 28, md: 32, lg: 34 }, height: { xs: 28, md: 32, lg: 34 } }}
            />
          </IconButton>
        </Stack>
      </Box>
      <LoginModal
        open={isLoginModalOpen}
        onClose={handleCloseLoginModal}
        initialMode={loginModalMode}
        resetToken={resetPasswordToken}
        onModeChange={handleLoginModalModeChange}
      />
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
