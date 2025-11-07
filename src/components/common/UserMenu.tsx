import { useState } from 'react';

import LogoutIcon from '@mui/icons-material/Logout';
import { Stack, Button, Popover, Divider, Typography } from '@mui/material';

import { logout, getAuthData } from '../../services/api.ts';

interface UserMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

const UserMenu = ({ anchorEl, open, onClose, onLogout }: UserMenuProps) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const authData = getAuthData();
  const { user } = authData;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      onClose();
      if (onLogout) {
        onLogout();
      }
      // Recarrega a página para atualizar o estado
      window.location.reload();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Mesmo com erro, recarrega a página
      window.location.reload();
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        sx: {
          mt: 0.75,
          minWidth: 280,
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
        },
      }}
    >
      <Stack sx={{ p: 2, gap: 1.5 }}>
        <Stack>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: '1.1rem',
              color: 'text.primary',
              mb: 0.25,
            }}
          >
            {user.name}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontSize: '0.9rem',
              opacity: 0.8,
            }}
          >
            {user.email}
          </Typography>
        </Stack>

        <Divider
          sx={{
            borderStyle: 'dashed',
            borderColor: 'divider',
            my: 0.75,
          }}
        />

        <Button
          onClick={handleLogout}
          disabled={isLoggingOut}
          startIcon={<LogoutIcon sx={{ color: '#FF6B35' }} />}
          sx={{
            justifyContent: 'flex-start',
            textTransform: 'none',
            color: '#FF6B35',
            fontWeight: 600,
            fontSize: '0.95rem',
            py: 1.25,
            px: 2,
            borderRadius: 1,
            bgcolor: 'rgba(255, 107, 53, 0.08)',
            '&:hover': {
              bgcolor: 'rgba(255, 107, 53, 0.12)',
            },
          }}
        >
          Sair
        </Button>
      </Stack>
    </Popover>
  );
};

export default UserMenu;
