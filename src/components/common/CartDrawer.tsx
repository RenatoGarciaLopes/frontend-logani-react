import { Box, Drawer, Stack, Button, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

const CartDrawer = ({ open, onClose }: CartDrawerProps) => {
  // TODO: Implementar lógica do carrinho quando necessário
  const cartItems: never[] = [];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '85vw', sm: '400px', md: '450px' },
          maxWidth: '450px',
          bgcolor: 'background.default',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        },
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
        },
      }}
    >
      <Stack direction="row" justifyContent="flex-end" alignItems="center" sx={{ p: 2 }}>
        <IconButton
          onClick={onClose}
          aria-label="Fechar carrinho"
          sx={{
            color: 'text.primary',
            opacity: 0.6,
            transition: 'opacity 0.3s ease',
            '&:hover': {
              opacity: 1,
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </Stack>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          px: 3,
          pb: 6,
        }}
      >
        {cartItems.length === 0 ? (
          <>
            <Typography
              variant="h6"
              sx={{
                color: 'text.primary',
                fontWeight: 600,
                fontSize: '1.25rem',
                mb: 4,
                textAlign: 'center',
              }}
            >
              O seu carrinho está vazio
            </Typography>
            <Button
              variant="contained"
              onClick={onClose}
              fullWidth
              sx={{
                bgcolor: 'text.primary',
                color: 'background.default',
                py: 1.5,
                borderRadius: '8px',
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
                '&:hover': {
                  bgcolor: 'text.primary',
                  opacity: 0.9,
                },
              }}
            >
              Continuar a comprar
            </Button>
          </>
        ) : (
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Itens do carrinho serão exibidos aqui
          </Typography>
        )}
      </Box>
    </Drawer>
  );
};

export default CartDrawer;
