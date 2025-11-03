import { useRef, useMemo, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

import SearchIcon from '@mui/icons-material/Search';
import { Box, Stack, Container, TextField, Typography, InputAdornment } from '@mui/material';

import { products } from '../data/products.ts';
import ProductCard from '../components/common/ProductCard.tsx';

const ProductsPage = () => {
  const [query, setQuery] = useState('');
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const productsRef = useRef(null);
  const isInView = useInView(productsRef, { once: true, margin: '-100px' });

  useEffect(() => {
    if (isInView) {
      setShouldAnimate(true);
    }
  }, [isInView]);

  // Trigger animation on mount (when page loads/navigates to it)
  useEffect(() => {
    // Wait for scroll animation to complete before triggering products animation
    const timer = setTimeout(() => setShouldAnimate(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Reset animation when search changes
  useEffect(() => {
    setShouldAnimate(false);
    const timer = setTimeout(() => setShouldAnimate(true), 50);
    return () => clearTimeout(timer);
  }, [query]);

  const filteredProducts = useMemo(() => {
    const normalisedQuery = query.trim().toLowerCase();

    if (!normalisedQuery) {
      return products;
    }

    return products.filter((product) => {
      const haystack = [product.name, product.code, product.description, ...product.fragranceNotes]
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalisedQuery);
    });
  }, [query]);

  return (
    <Stack spacing={8} pb={{ xs: 8, md: 12 }}>
      <Container
        maxWidth={false}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          px: { xs: 2, sm: 3, md: 4 },
          pt: { xs: 8, md: 12 },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            maxWidth: { xs: '100%', md: '1200px' },
            gap: { xs: 4, md: 8 },
          }}
        >
          {/* Seção Título e Busca */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'flex-start', md: 'center' },
              justifyContent: 'space-between',
              gap: { xs: 3, md: 0 },
              width: '100%',
            }}
          >
            <Typography
              variant="h3"
              color="text.secondary"
              sx={{
                letterSpacing: '0.08em',
                display: 'inline-flex',
                alignItems: 'center',
                my: 0,
              }}
            >
              Produtos
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                placeholder="Pesquisar produtos..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ maxWidth: 420, width: { xs: '100%', md: 'auto' } }}
              />
            </Box>
          </Box>

          {/* Lista de Produtos */}
          {filteredProducts.length > 0 ? (
            <Box
              ref={productsRef}
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'flex-start',
                gap: 10,
                width: '100%',
              }}
            >
              <AnimatePresence mode="wait">
                {filteredProducts.map((product, index) => (
                  <Box
                    component={motion.div}
                    key={product.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={shouldAnimate ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                    exit={{ opacity: 0, scale: 0.9 }}
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
                    <ProductCard product={product} to={`/produtos#${product.id}`} />
                  </Box>
                ))}
              </AnimatePresence>
            </Box>
          ) : (
            <Typography
              component={motion.span}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              variant="body1"
              color="text.secondary"
              textAlign="center"
            >
              Nenhum produto encontrado para &quot;{query}&quot;.
            </Typography>
          )}
        </Box>
      </Container>
    </Stack>
  );
};

export default ProductsPage;
