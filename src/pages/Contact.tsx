import { useState } from 'react';
import type { FormEvent } from 'react';
import { motion } from 'framer-motion';

import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Box, Grid, Paper, Stack, Button, Container, TextField, Typography } from '@mui/material';

const ContactPage = () => {
  const [formState, setFormState] = useState({ nome: '', email: '', mensagem: '' });
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback('Recebemos sua mensagem! Entraremos em contato em breve.');
    setFormState({ nome: '', email: '', mensagem: '' });
  };

  return (
    <Container sx={{ py: { xs: 8, md: 12 } }}>
      <Stack spacing={{ xs: 6, md: 10 }}>
        <Stack spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }}>
          <Typography
            component={motion.h2}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            variant="h2"
            color="text.secondary"
            sx={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
          >
            Contato
          </Typography>
          <Typography
            component={motion.p}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            variant="body1"
            sx={{ maxWidth: 560 }}
          >
            Quer saber qual aroma combina com o seu momento? Escreva para nós ou fale diretamente
            pelos canais abaixo.
          </Typography>
        </Stack>

        <Grid container spacing={{ xs: 6, md: 8 }}>
          <Grid item xs={12} md={5}>
            <Paper
              component={motion.div}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              elevation={0}
              sx={{ p: { xs: 4, md: 5 }, bgcolor: '#f1f0ed', borderRadius: 4 }}
            >
              <Stack spacing={4}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <PhoneIcon color="primary" />
                  <Stack>
                    <Typography
                      variant="subtitle2"
                      sx={{ textTransform: 'uppercase', letterSpacing: '0.2em' }}
                    >
                      Telefone
                    </Typography>
                    <Typography variant="body1">+55 (44) 98829-6184</Typography>
                  </Stack>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <EmailIcon color="primary" />
                  <Stack>
                    <Typography
                      variant="subtitle2"
                      sx={{ textTransform: 'uppercase', letterSpacing: '0.2em' }}
                    >
                      E-mail
                    </Typography>
                    <Typography variant="body1">loganicontato@gmail.com</Typography>
                  </Stack>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <LocationOnIcon color="primary" />
                  <Stack>
                    <Typography
                      variant="subtitle2"
                      sx={{ textTransform: 'uppercase', letterSpacing: '0.2em' }}
                    >
                      Localização
                    </Typography>
                    <Typography variant="body1">Maringá – Paraná</Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={7}>
            <Paper
              component={motion.div}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              elevation={0}
              sx={{
                p: { xs: 4, md: 5 },
                borderRadius: 4,
                bgcolor: 'background.paper',
                boxShadow: '0 25px 60px rgba(106, 96, 96, 0.1)',
              }}
            >
              <Stack component="form" spacing={3} onSubmit={handleSubmit}>
                <TextField
                  label="Nome"
                  value={formState.nome}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, nome: event.target.value }))
                  }
                  required
                />
                <TextField
                  label="E-mail"
                  type="email"
                  value={formState.email}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, email: event.target.value }))
                  }
                  required
                />
                <TextField
                  label="Mensagem"
                  multiline
                  minRows={4}
                  value={formState.mensagem}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, mensagem: event.target.value }))
                  }
                  required
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Enviar mensagem
                </Button>
                {feedback && (
                  <Box>
                    <Typography variant="body2" color="primary.main">
                      {feedback}
                    </Typography>
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
