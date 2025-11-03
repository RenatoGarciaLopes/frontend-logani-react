import { NavLink } from 'react-router-dom';

import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import InstagramIcon from '@mui/icons-material/Instagram';
import {
  Box,
  Link,
  Stack,
  Divider,
  useTheme,
  Container,
  IconButton,
  Typography,
  useMediaQuery,
} from '@mui/material';

import { navigationLinks } from '../../data/navigation.ts';

const Footer = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <Box component="footer" sx={{ bgcolor: 'secondary.main', color: '#fff', mt: 8 }}>
      <Container sx={{ py: { xs: 3, md: 4 } }}>
        <Stack spacing={{ xs: 3, md: 4 }} alignItems="center">
          {isDesktop && (
            <Stack direction="row" spacing={4} justifyContent="center" component="nav">
              {navigationLinks.map((link) => (
                <Link
                  key={link.path}
                  component={NavLink}
                  to={link.path}
                  underline="none"
                  sx={{
                    color: '#fff',
                    letterSpacing: '0.25em',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    opacity: 0.9,
                    '&:hover': { opacity: 1 },
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Stack>
          )}

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={{ xs: 2, md: 3 }}
            justifyContent="space-between"
            alignItems="center"
            sx={{ width: '100%' }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Box
                component="img"
                src="/images/logo.png"
                alt="Logotipo Logani"
                sx={{ height: 40, filter: 'brightness(0) invert(1)' }}
              />
            </Box>
            <Stack spacing={1} textAlign="center" sx={{ color: '#fff' }}>
              <Typography variant="body2" sx={{ fontSize: '0.95rem' }}>
                +55 (44) 98829-6184
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.95rem' }}>
                loganicontato@gmail.com
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.95rem' }}>
                Maringá – Paraná
              </Typography>
            </Stack>
            <Stack direction="row" spacing={2}>
              <IconButton
                component="a"
                href="https://wa.me/5544988296184"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: '#fff', '&:hover': { color: '#e5e5e5' } }}
                aria-label="WhatsApp"
              >
                <WhatsAppIcon />
              </IconButton>
              <IconButton
                component="a"
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: '#fff', '&:hover': { color: '#e5e5e5' } }}
                aria-label="Instagram"
              >
                <InstagramIcon />
              </IconButton>
            </Stack>
          </Stack>

          <Divider sx={{ bgcolor: 'rgba(255,255,255,0.3)', width: '100%', my: 2 }} />

          <Typography variant="body2" sx={{ opacity: 0.8, textAlign: 'center' }}>
            © Logani 2025. Todos os direitos reservados.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
