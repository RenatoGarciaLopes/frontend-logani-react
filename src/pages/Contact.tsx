import { motion } from 'framer-motion';
import type { FormEvent } from 'react';
import { useState, useCallback } from 'react';

import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import {
  Box,
  Grid,
  Alert,
  Paper,
  Stack,
  Button,
  Container,
  TextField,
  Typography,
} from '@mui/material';

import { sendContactMessage } from '../services/contact.ts';

const ContactPage = () => {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsSubmitting(true);
      setFeedback(null);

      try {
        await sendContactMessage({
          name: formState.name.trim(),
          email: formState.email.trim(),
          message: formState.message.trim(),
        });

        setFeedback({
          type: 'success',
          message: 'Recebemos sua mensagem! Entraremos em contato em breve.',
        });
        setFormState({ name: '', email: '', message: '' });
      } catch (error) {
        setFeedback({
          type: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'Não foi possível enviar sua mensagem. Tente novamente.',
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [formState]
  );

  return (
    <Container
      maxWidth={false}
      sx={{
        py: { xs: 6, sm: 8, md: 12 },
        maxWidth: { md: '1200px' },
        px: { xs: 2.5, sm: 3, md: 4 },
      }}
    >
      <Stack spacing={{ xs: 4, sm: 5, md: 10 }} alignItems="center">
        <Stack spacing={{ xs: 2, md: 2 }} alignItems="center" sx={{ width: '100%' }}>
          <Typography
            component={motion.h2}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            variant="h2"
            color="text.secondary"
            sx={{
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontSize: { xs: '1.75rem', sm: '2.125rem', md: '3rem' },
              width: '100%',
              textAlign: 'center',
            }}
          >
            Contato
          </Typography>
          <Typography
            component={motion.p}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            variant="body1"
            sx={{
              maxWidth: { xs: '100%', sm: '100%', md: 560 },
              fontSize: { xs: '0.95rem', sm: '1rem', md: '1rem' },
              lineHeight: 1.6,
              textAlign: { xs: 'left', sm: 'center', md: 'center' },
              width: '100%',
            }}
          >
            Quer saber qual aroma combina com o seu momento? Escreva para nós ou fale diretamente
            pelos canais abaixo.
          </Typography>
        </Stack>

        <Grid
          container
          spacing={{ xs: 0, md: 6 }}
          justifyContent="center"
          sx={{
            '& > .MuiGrid-item': {
              paddingLeft: { xs: '0 !important', md: '24px !important' },
            },
          }}
        >
          <Grid item xs={12} sm={10} md={5}>
            <Paper
              component={motion.div}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4, md: 5 },
                bgcolor: '#f1f0ed',
                borderRadius: 4,
                width: '100%',
                mx: 'auto',
                boxSizing: 'border-box',
                mb: { xs: 4, sm: 5, md: 0 },
              }}
            >
              <Stack spacing={{ xs: 3, sm: 3.5, md: 4 }}>
                <Stack direction="row" spacing={{ xs: 1.5, sm: 2 }} alignItems="flex-start">
                  <PhoneIcon
                    color="primary"
                    sx={{
                      fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                      mt: { xs: 0.25, sm: 0.5 },
                      flexShrink: 0,
                    }}
                  />
                  <Stack>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' },
                      }}
                    >
                      Telefone
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' },
                        wordBreak: 'break-word',
                      }}
                    >
                      +55 (44) 98829-6184
                    </Typography>
                  </Stack>
                </Stack>
                <Stack direction="row" spacing={{ xs: 1.5, sm: 2 }} alignItems="flex-start">
                  <EmailIcon
                    color="primary"
                    sx={{
                      fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                      mt: { xs: 0.25, sm: 0.5 },
                      flexShrink: 0,
                    }}
                  />
                  <Stack>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' },
                      }}
                    >
                      E-mail
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' },
                        wordBreak: 'break-word',
                      }}
                    >
                      loganicontato@gmail.com
                    </Typography>
                  </Stack>
                </Stack>
                <Stack direction="row" spacing={{ xs: 1.5, sm: 2 }} alignItems="flex-start">
                  <LocationOnIcon
                    color="primary"
                    sx={{
                      fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                      mt: { xs: 0.25, sm: 0.5 },
                      flexShrink: 0,
                    }}
                  />
                  <Stack>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' },
                      }}
                    >
                      Localização
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' },
                        wordBreak: 'break-word',
                      }}
                    >
                      Maringá – Paraná
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={10} md={7}>
            <Paper
              component={motion.div}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4, md: 5 },
                borderRadius: 4,
                bgcolor: 'background.paper',
                boxShadow: '0 25px 60px rgba(106, 96, 96, 0.1)',
                width: '100%',
                mx: 'auto',
                boxSizing: 'border-box',
              }}
            >
              <Stack component="form" spacing={{ xs: 2.5, sm: 3, md: 3 }} onSubmit={handleSubmit}>
                <TextField
                  label="Nome"
                  name="name"
                  value={formState.name}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, name: event.target.value }))
                  }
                  required
                  fullWidth
                  sx={{
                    '& .MuiInputBase-input': {
                      fontSize: { xs: '0.95rem', sm: '1rem' },
                    },
                  }}
                />
                <TextField
                  label="E-mail"
                  type="email"
                  name="email"
                  value={formState.email}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, email: event.target.value }))
                  }
                  required
                  fullWidth
                  sx={{
                    '& .MuiInputBase-input': {
                      fontSize: { xs: '0.95rem', sm: '1rem' },
                    },
                  }}
                />
                <TextField
                  label="Mensagem"
                  multiline
                  minRows={4}
                  name="message"
                  value={formState.message}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, message: event.target.value }))
                  }
                  required
                  fullWidth
                  sx={{
                    '& .MuiInputBase-input': {
                      fontSize: { xs: '0.95rem', sm: '1rem' },
                    },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={isSubmitting}
                  sx={{
                    fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' },
                    py: { xs: 1.5, sm: 1.5, md: 1.5 },
                    px: { xs: 3, sm: 4 },
                    mt: { xs: 0.5, sm: 0 },
                  }}
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar mensagem'}
                </Button>
                {feedback && (
                  <Box>
                    <Alert severity={feedback.type}>{feedback.message}</Alert>
                  </Box>
                )}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
};

export default ContactPage;
