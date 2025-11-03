import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

import { Box, Stack, Container } from '@mui/material';

import { products } from '../data/products.ts';
import ProductCard from '../components/common/ProductCard.tsx';
import SectionTitle from '../components/common/SectionTitle.tsx';

const HomePage = () => {
  const productsRef = useRef(null);
  const isProductsInView = useInView(productsRef, { once: true, margin: '-100px' });

  return (
    <Stack spacing={8} pb={{ xs: 8, md: 12 }}>
      {/* Banner Hero */}
      <Box
        component={motion.section}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        sx={{
          width: '100%',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 0,
        }}
        role="img"
        aria-label="Banner principal da Logani"
      >
        <Box
          component="img"
          src="/images/banner-mobile.png"
          alt="Banner principal da Logani"
          sx={{
            display: { xs: 'block', md: 'none' },
            width: '100%',
            height: 'auto',
            objectFit: 'cover',
            objectPosition: 'center center',
          }}
        />
        <Box
          component="img"
          src="/images/banner-desktop.png"
          alt="Banner principal da Logani"
          sx={{
            display: { xs: 'none', md: 'block' },
            width: '100%',
            height: 'auto',
            objectFit: 'cover',
            objectPosition: 'center center',
          }}
        />
      </Box>

      {/* Seção Destaque */}
      <Container
        maxWidth={false}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Box
          sx={{ width: '100%', display: 'flex', justifyContent: 'center', mb: { xs: 4, md: 6 } }}
        >
          <SectionTitle title="Destaque" align="center" />
        </Box>
      </Container>

      {/* Lista de Produtos */}
      <Container
        ref={productsRef}
        maxWidth={false}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'flex-start',
            gap: { xs: 6, md: 8 },
            width: '100%',
            maxWidth: { xs: '100%', md: '1200px' },
          }}
        >
          {products.map((product, index) => (
            <Box
              component={motion.div}
              key={product.id}
              initial={{ opacity: 0, x: -30 }}
              animate={isProductsInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              transition={{
                duration: 1.2,
                delay: index * 0.12,
                ease: [0.16, 1, 0.3, 1],
              }}
              sx={{
                width: 293,
                flexShrink: 0,
              }}
            >
              <ProductCard product={product} to={`/produtos/${product.id}`} />
            </Box>
          ))}
        </Box>
      </Container>
    </Stack>
  );
};

export default HomePage;
