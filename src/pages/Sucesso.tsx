import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import {
  Box,
  Stack,
  Button,
  Container,
  Typography,
} from '@mui/material';

import { getAuthData } from '../services/api.ts';

const Sucesso = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const { user } = getAuthData();
    if (user?.name) {
      setUserName(user.name);
    }
  }, []);

  return (
    <Container
      maxWidth={false}
      sx={{
        py: { xs: 6, sm: 8, md: 12 },
        maxWidth: { md: '800px' },
        px: { xs: 2.5, sm: 3, md: 4 },
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Stack spacing={4} alignItems="center" sx={{ width: '100%', textAlign: 'center' }}>
        {/* Ícone de Check */}
        <Box
          component={motion.div}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 15,
            delay: 0.2,
          }}
        >
          <CheckCircleIcon
            sx={{
              fontSize: { xs: 80, sm: 100, md: 120 },
              color: 'primary.main',
            }}
          />
        </Box>

        {/* Título */}
        <Typography
          component={motion.h2}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          variant="h3"
          sx={{
            fontWeight: 600,
            fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
            color: 'text.primary',
          }}
        >
          Pedido concluído{userName ? `, ${userName}` : ''}!
        </Typography>

        {/* Mensagem principal */}
        <Typography
          component={motion.p}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          variant="body1"
          sx={{
            fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
            color: 'text.secondary',
            maxWidth: '600px',
            lineHeight: 1.6,
          }}
        >
          Em breve entraremos em contato para informar sobre o pedido.
        </Typography>

        {/* Informações de contato */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          sx={{
            mt: 2,
            p: 3,
            bgcolor: 'grey.50',
            borderRadius: 2,
            width: '100%',
            maxWidth: '500px',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              mb: 2,
              fontSize: { xs: '0.9rem', sm: '1rem' },
            }}
          >
            Qualquer dúvida, entre em contato conosco pelos meios:
          </Typography>
          <Stack spacing={1.5} alignItems="flex-start" sx={{ pl: 1 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <PhoneIcon sx={{ fontSize: 20, color: 'primary.main' }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                +55 (44) 98829-6184
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <EmailIcon sx={{ fontSize: 20, color: 'primary.main' }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                loganicontato@gmail.com
              </Typography>
            </Stack>
          </Stack>
        </Box>

        {/* Botão para voltar */}
        <Button
          component={motion.button}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          variant="contained"
          onClick={() => navigate('/produtos')}
          sx={{
            mt: 2,
            px: 4,
            py: 1.5,
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 600,
            borderRadius: 2,
          }}
        >
          Continuar comprando
        </Button>
      </Stack>
    </Container>
  );
};

export default Sucesso;

