import { motion } from 'framer-motion';

import { Box, Grid, Stack, Container, Typography } from '@mui/material';

const AboutPage = () => {
  return (
    <Container sx={{ py: { xs: 6, md: 10 }, maxWidth: { md: '1200px' } }}>
      <Stack spacing={{ xs: 6, md: 10 }}>
        {/* Título */}
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
            textAlign: 'center',
            mb: { xs: 3, md: 6 },
          }}
        >
          Sobre
        </Typography>

        {/* Primeiro Parágrafo - Introdução centralizada */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Typography
            component={motion.p}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            variant="body1"
            sx={{
              maxWidth: { xs: '100%', md: '800px' },
              textAlign: 'justify',
              fontSize: { xs: '1.1rem', md: '1.15rem' },
              lineHeight: 1.8,
              color: 'text.secondary',
            }}
          >
            A Logani nasceu para ajudar pessoas a desacelerarem e se reconectarem consigo mesmas. Em
            meio à rotina corrida, falta tempo para o autocuidado, e é nesse momento que uma vela
            pode transformar o ambiente e o estado de espírito.
          </Typography>
        </Box>

        {/* Seção 1: Imagem da Artesã (esquerda) + Texto sobre Produção (direita) */}
        <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}>
              <Box
                component={motion.img}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                src="/images/about-artisan.jpg"
                alt="Artesã produzindo velas artesanais"
                sx={{
                  width: { xs: '85%', md: '75%' },
                  maxWidth: '450px',
                  height: 'auto',
                  borderRadius: 4,
                  boxShadow: '0 20px 50px rgba(106, 96, 96, 0.15)',
                  display: 'block',
                  objectFit: 'cover',
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                height: '100%',
                pl: { xs: 0, md: 2 },
              }}
            >
              <Typography
                component={motion.p}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                variant="body1"
                sx={{
                  textAlign: 'justify',
                  fontSize: { xs: '1.1rem', md: '1.15rem' },
                  lineHeight: 1.8,
                  color: 'text.secondary',
                  maxWidth: '100%',
                }}
              >
                Cada vela é produzida à mão, com ingredientes veganos, cera vegetal de coco (livre
                de parafina) e pavio 100% algodão. O resultado é uma queima limpa, sem toxinas,
                ideal para criar momentos de pausa e bem-estar.
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Seção 2: Texto sobre Fragrâncias (esquerda) + Imagem dos Produtos (direita) */}
        <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
          <Grid item xs={12} md={6} order={{ xs: 1, md: 1 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                height: '100%',
                pr: { xs: 0, md: 2 },
              }}
            >
              <Typography
                component={motion.p}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.6 }}
                variant="body1"
                sx={{
                  textAlign: 'justify',
                  fontSize: { xs: '1.1rem', md: '1.15rem' },
                  lineHeight: 1.8,
                  color: 'text.secondary',
                  maxWidth: '100%',
                }}
              >
                Acreditamos que fragrâncias contam histórias. Por isso, desenvolvemos coleções
                exclusivas com notas que evocam memórias, criam acolhimento e incentivam rituais de
                autocuidado. Desde o design minimalista dos recipientes até a curadoria das
                matérias-primas, tudo é pensado para harmonizar estética e sensibilidade.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6} order={{ xs: 2, md: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' } }}>
              <Box
                component={motion.img}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.7 }}
                src="/images/about-stack.png"
                alt="Velas Logani empilhadas"
                sx={{
                  width: { xs: '85%', md: '75%' },
                  maxWidth: '450px',
                  height: 'auto',
                  borderRadius: 4,
                  boxShadow: '0 20px 50px rgba(106, 96, 96, 0.15)',
                  display: 'block',
                  objectFit: 'cover',
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
};

export default AboutPage;
