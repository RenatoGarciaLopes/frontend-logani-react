import { Link as RouterLink } from 'react-router-dom';

import { Box, Card, Stack, Typography, CardContent, CardActionArea } from '@mui/material';

import type { Product } from '../../data/products.ts';

type ProductCardProps = {
  product: Product;
  to?: string;
};

const ProductCard = ({ product, to = '/produtos' }: ProductCardProps) => {
  return (
    <Card elevation={0} sx={{ bgcolor: 'transparent' }}>
      <CardActionArea
        component={RouterLink}
        to={to}
        sx={{
          borderRadius: 1,
          overflow: 'hidden',
          position: 'relative',
          pt: '162%', // Proporção fixa baseada na página antiga (293px width, altura proporcional)
          width: '100%',
          '&:hover .hoverImage': { opacity: 1, transform: 'scale(1.05)' },
          '&:hover .baseImage': { opacity: 0 },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            borderRadius: 1,
            overflow: 'hidden',
          }}
        >
          <Box
            className="baseImage"
            component="img"
            src={product.heroImage}
            alt={product.name}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'opacity 0.4s ease',
            }}
          />
          {product.secondaryImage && (
            <Box
              className="hoverImage"
              component="img"
              src={product.secondaryImage}
              alt={`${product.name} alternativa`}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                position: 'absolute',
                inset: 0,
                transition: 'opacity 0.4s ease, transform 0.4s ease',
                opacity: 0,
              }}
            />
          )}
        </Box>
      </CardActionArea>
      <CardContent sx={{ px: 0, pt: 3 }}>
        <Stack spacing={1.5} textAlign="center">
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              fontWeight: 400,
              fontSize: '1.125rem',
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
            }}
          >
            {product.code} {product.name.toUpperCase()}
          </Typography>
          <Typography variant="body2" color="text.primary" sx={{ fontSize: '1rem' }}>
            R$ {product.price.toFixed(2).replace('.', ',')}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
