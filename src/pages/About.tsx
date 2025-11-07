import { motion } from 'framer-motion';

import { Box, Grid, Stack, Container, Typography } from '@mui/material';

const AboutPage = () => {
  return (
    <Container
      maxWidth={false}
      sx={{
        py: { xs: 6, sm: 8, md: 10 },
        maxWidth: { md: '1200px' },
        px: { xs: 3, sm: 4, md: 6 },
      }}
    >
      <Stack spacing={{ xs: 5, sm: 6, md: 10 }} alignItems="center">
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
            fontSize: { xs: '1.75rem', sm: '2.125rem', md: '3rem' },
            mb: { xs: 3, sm: 4, md: 6 },
            width: '100%',
          }}
        >
          Sobre
        </Typography>

        {/* Primeiro Parágrafo - Introdução centralizada */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            px: { xs: 1, sm: 2, md: 3 },
          }}
        >
          <Typography
            component={motion.p}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            variant="body1"
            sx={{
              maxWidth: { xs: '100%', sm: '100%', md: '800px' },
              textAlign: { xs: 'justify', sm: 'justify', md: 'justify' },
              fontSize: { xs: '0.95rem', sm: '1rem', md: '1.15rem' },
              lineHeight: { xs: 1.7, sm: 1.75, md: 1.8 },
              color: 'text.secondary',
              px: { xs: 0, sm: 0, md: 0 },
            }}
          >
            A Logani nasceu para ajudar pessoas a desacelerarem e se reconectarem consigo mesmas. Em
            meio à rotina corrida, falta tempo para o autocuidado, e é nesse momento que uma vela
            pode transformar o ambiente e o estado de espírito.
          </Typography>
        </Box>

        {/* Seção 1: Imagem da Artesã (esquerda) + Texto sobre Produção (direita) */}
        <Grid
          container
          spacing={{ xs: 4, sm: 5, md: 6 }}
          alignItems="center"
          justifyContent="center"
          sx={{
            '& > .MuiGrid-item': {
              paddingLeft: { xs: '0 !important', sm: '0 !important', md: '24px !important' },
            },
          }}
        >
          <Grid
            item
            xs={12}
            sm={12}
            md={6}
            sx={{ display: 'flex', justifyContent: 'center', px: { xs: 0, sm: 0, md: 0 } }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                mx: 'auto',
                mb: { xs: 2, sm: 3, md: 0 },
              }}
            >
              <Box
                component={motion.img}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                src="/images/about-artisan.jpg"
                alt="Artesã produzindo velas artesanais"
                sx={{
                  width: { xs: '100%', sm: '90%', md: '75%' },
                  maxWidth: { xs: '100%', sm: '500px', md: '450px' },
                  height: 'auto',
                  borderRadius: 4,
                  boxShadow: '0 20px 50px rgba(106, 96, 96, 0.15)',
                  display: 'block',
                  objectFit: 'cover',
                  mx: 'auto',
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={12} md={6}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                height: '100%',
                px: { xs: 1, sm: 2, md: 3 },
              }}
            >
              <Typography
                component={motion.p}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                variant="body1"
                sx={{
                  textAlign: { xs: 'justify', sm: 'justify', md: 'justify' },
                  fontSize: { xs: '0.95rem', sm: '1rem', md: '1.15rem' },
                  lineHeight: { xs: 1.7, sm: 1.75, md: 1.8 },
                  color: 'text.secondary',
                  maxWidth: '100%',
                  width: '100%',
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
        <Grid
          container
          spacing={{ xs: 4, sm: 5, md: 6 }}
          alignItems="center"
          justifyContent="center"
          sx={{
            '& > .MuiGrid-item': {
              paddingLeft: { xs: '0 !important', sm: '0 !important', md: '24px !important' },
            },
          }}
        >
          <Grid item xs={12} sm={12} md={6} order={{ xs: 1, sm: 1, md: 1 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                height: '100%',
                px: { xs: 1, sm: 2, md: 3 },
                mb: { xs: 2, sm: 3, md: 0 },
              }}
            >
              <Typography
                component={motion.p}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.6 }}
                variant="body1"
                sx={{
                  textAlign: { xs: 'justify', sm: 'justify', md: 'justify' },
                  fontSize: { xs: '0.95rem', sm: '1rem', md: '1.15rem' },
                  lineHeight: { xs: 1.7, sm: 1.75, md: 1.8 },
                  color: 'text.secondary',
                  maxWidth: '100%',
                  width: '100%',
                }}
              >
                Acreditamos que fragrâncias contam histórias. Por isso, desenvolvemos coleções
                exclusivas com notas que evocam memórias, criam acolhimento e incentivam rituais de
                autocuidado. Desde o design minimalista dos recipientes até a curadoria das
                matérias-primas, tudo é pensado para harmonizar estética e sensibilidade.
              </Typography>
            </Box>
          </Grid>
          <Grid
            item
            xs={12}
            sm={12}
            md={6}
            order={{ xs: 2, sm: 2, md: 2 }}
            sx={{ display: 'flex', justifyContent: 'center', px: { xs: 0, sm: 0, md: 0 } }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                mx: 'auto',
              }}
            >
              <Box
                component={motion.img}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.7 }}
                src="/images/about-stack.png"
                alt="Velas Logani empilhadas"
                sx={{
                  width: { xs: '100%', sm: '90%', md: '75%' },
                  maxWidth: { xs: '100%', sm: '500px', md: '450px' },
                  height: 'auto',
                  borderRadius: 4,
                  boxShadow: '0 20px 50px rgba(106, 96, 96, 0.15)',
                  display: 'block',
                  objectFit: 'cover',
                  mx: 'auto',
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
