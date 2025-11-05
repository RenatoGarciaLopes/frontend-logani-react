import { useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';

import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Box,
  Stack,
  Button,
  Divider,
  Accordion,
  Container,
  TextField,
  IconButton,
  Typography,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material';

import { products } from '../data/products.ts';
import ProductCard from '../components/common/ProductCard.tsx';
import ClientRegistrationModal from '../components/common/ClientRegistrationModal.tsx';
import {
  saveClientData,
  getClientByBearerToken,
  handleOrderAfterClientSave,
  type GetClientByBearerTokenResponse,
} from '../services/api.ts';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  const product = useMemo(() => products.find((p) => p.id === id), [id]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Produtos relacionados (outros produtos excluindo o atual)
  const relatedProducts = useMemo(() => products.filter((p) => p.id !== id), [id]);

  if (!product) {
    return <Navigate to="/produtos" replace />;
  }

  const selectedImage = product.images[selectedImageIndex] || product.heroImage;

  const handleBuyClick = async () => {
    setIsLoading(true);
    try {
      const response = await getClientByBearerToken();

      // Verifica se é um erro NOT_FOUND
      if ('error' in response && response.error.code === 'NOT_FOUND') {
        setIsClientModalOpen(true);
        setIsLoading(false);
        return;
      }

      // Se retornou dados do cliente, salva no localStorage
      if ('data' in response) {
        saveClientData(response as GetClientByBearerTokenResponse);
        // Gerencia o pedido após salvar os dados do cliente
        // Usa o ID do produto (assumindo que o backend espera um ID numérico)
        // Se o backend espera outro formato, ajuste aqui
        const productId = product.id; // ou um mapeamento para ID numérico
        await handleOrderAfterClientSave(productId, quantity);
      }
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClientRegistrationSuccess = () => {
    // Fecha o modal após cadastro bem-sucedido
    setIsClientModalOpen(false);
  };

  return (
    <Stack spacing={{ xs: 6, md: 10 }} pb={{ xs: 8, md: 12 }}>
      <Container
        maxWidth={false}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          px: { xs: 2, sm: 3, md: 4 },
          pt: { xs: 4, md: 8 },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 4, md: 5 },
            width: '100%',
            maxWidth: { xs: '100%', md: '1200px' },
            alignItems: { xs: 'center', md: 'flex-start' },
          }}
        >
          {/* Galeria de Imagens */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row-reverse' },
              gap: { xs: 2, md: 5 },
              alignItems: { xs: 'center', md: 'flex-start' },
              width: { xs: '100%', md: 'auto' },
            }}
          >
            {/* Imagem Principal */}
            <Box
              component="img"
              src={selectedImage}
              alt={`${product.code} ${product.name}`}
              sx={{
                width: { xs: '100%', sm: 400, md: 480 },
                height: { xs: 'auto', sm: 400, md: 480 },
                aspectRatio: '1 / 1',
                objectFit: 'cover',
                borderRadius: 1,
                maxWidth: '100%',
              }}
            />

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <Stack
                direction={{ xs: 'row', sm: 'column' }}
                spacing={2}
                sx={{
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {product.images.map((image, index) => (
                  <Box
                    key={index}
                    component="img"
                    src={image}
                    alt={`${product.code} ${product.name} ${index + 1}`}
                    onClick={() => setSelectedImageIndex(index)}
                    sx={{
                      width: { xs: 60, sm: 80, md: 110 },
                      height: { xs: 60, sm: 80, md: 110 },
                      borderRadius: 1.25,
                      cursor: 'pointer',
                      border:
                        selectedImageIndex === index
                          ? '2px solid #6A6060'
                          : '2px solid transparent',
                      opacity: selectedImageIndex === index ? 1 : 0.7,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        opacity: 1,
                        filter: 'brightness(0.95)',
                      },
                    }}
                  />
                ))}
              </Stack>
            )}
          </Box>

          {/* Informações do Produto */}
          <Stack
            spacing={3}
            sx={{
              width: { xs: '100%', md: 'auto' },
              maxWidth: { xs: '100%', md: 400 },
              mt: { xs: 0, md: 5 },
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', md: '3rem' },
                fontWeight: 500,
                color: 'text.secondary',
                fontFamily: '"Work Sans", sans-serif',
              }}
            >
              {product.code} {product.name.toUpperCase()}
            </Typography>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontSize: { xs: '1.5rem', md: '1.875rem' },
                  fontWeight: 400,
                  color: 'text.secondary',
                }}
              >
                R$ {product.price.toFixed(2).replace('.', ',')}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  border: '1px solid',
                  borderColor: 'rgba(106, 96, 96, 0.25)',
                  borderRadius: 999,
                  bgcolor: 'background.paper',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  height: { xs: 36, md: 44 },
                  px: 0.5,
                }}
              >
                <IconButton
                  aria-label="Diminuir quantidade"
                  size="small"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={quantity <= 1}
                  sx={{
                    width: { xs: 32, md: 40 },
                    height: { xs: 32, md: 40 },
                    color: '#6A6060',
                    '&.Mui-disabled': {
                      color: 'rgba(0, 0, 0, 0.26)',
                    },
                  }}
                >
                  <RemoveIcon sx={{ fontSize: { xs: 16, md: 18 } }} />
                </IconButton>
                <TextField
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const value = Number.parseInt(e.target.value, 10) || 1;
                    setQuantity(Math.max(1, Math.min(10, value)));
                  }}
                  inputProps={{
                    min: 1,
                    max: 10,
                    style: { textAlign: 'center' },
                  }}
                  sx={{
                    width: { xs: 40, md: 52 },
                    height: '100%',
                    '& .MuiOutlinedInput-root': {
                      height: '100%',
                      '& fieldset': { border: 'none' },
                      '& input': {
                        padding: 0,
                        height: '100%',
                        fontSize: { xs: '1rem', md: '1.125rem' },
                        color: '#2C2727',
                        fontWeight: 400,
                        letterSpacing: '0.02em',
                        '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                          WebkitAppearance: 'none',
                          margin: 0,
                        },
                        MozAppearance: 'textfield',
                      },
                    },
                  }}
                />
                <IconButton
                  aria-label="Aumentar quantidade"
                  size="small"
                  onClick={() => setQuantity((prev) => Math.min(10, prev + 1))}
                  disabled={quantity >= 10}
                  sx={{
                    width: { xs: 32, md: 40 },
                    height: { xs: 32, md: 40 },
                    color: '#6A6060',
                    '&.Mui-disabled': {
                      color: 'rgba(0, 0, 0, 0.26)',
                    },
                  }}
                >
                  <AddIcon sx={{ fontSize: { xs: 16, md: 18 } }} />
                </IconButton>
              </Box>
            </Box>

            <Button
              variant="contained"
              onClick={handleBuyClick}
              disabled={isLoading}
              sx={{
                bgcolor: '#2C2727',
                color: '#fff',
                px: 3,
                py: 1.5,
                fontSize: { xs: '1.25rem', md: '2rem' },
                fontWeight: 600,
                width: { xs: '100%', md: 300 },
                height: { xs: 50, md: 60 },
                borderRadius: 1,
                '&:hover': {
                  bgcolor: '#1a1a1a',
                },
                '&:disabled': {
                  bgcolor: '#2C2727',
                  opacity: 0.6,
                },
              }}
            >
              Comprar
            </Button>
          </Stack>
        </Box>
      </Container>

      {/* Descrição e Accordion */}
      <Container
        maxWidth={false}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: { xs: '100%', md: '1200px' },
          }}
        >
          {/* Título com Divisores */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              my: { xs: 4, md: 6 },
            }}
          >
            <Divider
              sx={{
                flexGrow: 1,
                maxWidth: '30%',
                borderColor: 'text.primary',
                borderWidth: 1,
              }}
            />
            <Typography
              variant="h4"
              sx={{
                fontSize: { xs: '1.25rem', md: '2.5rem' },
                fontWeight: 300,
                color: 'text.secondary',
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              {product.code} {product.name.toUpperCase()} –{' '}
              {product.fragranceNotes.length > 0
                ? `Fragrância de ${product.fragranceNotes[0].toLowerCase()}`
                : 'Fragrância especial'}
            </Typography>
            <Divider
              sx={{
                flexGrow: 1,
                maxWidth: '30%',
                borderColor: 'text.primary',
                borderWidth: 1,
              }}
            />
          </Box>

          {/* Descrição Completa */}
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '1rem', md: '1.25rem' },
              lineHeight: 1.6,
              textAlign: 'justify',
              color: 'text.secondary',
              mb: 3,
              mx: { xs: 1, md: '145px' },
            }}
          >
            {product.fullDescription}
            <br />
            <br />
            <Box component="i" sx={{ fontSize: '0.95em' }}>
              Todas as velas da Coleção Ímpar acompanham a caixa exclusiva produzida à mão.
            </Box>
          </Typography>

          {/* Accordion */}
          <Stack spacing={0} sx={{ mx: { xs: 1, md: '145px' } }}>
            {/* Fragrância */}
            {product.fragranceDetails && (
              <Accordion
                sx={{
                  bgcolor: 'transparent',
                  boxShadow: 'none',
                  borderTop: '1px solid rgba(0, 0, 0, 0.5)',
                  '&:before': { display: 'none' },
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <ExpandMoreIcon
                      sx={{
                        transition: 'transform 0.4s ease',
                        color: 'text.secondary',
                      }}
                    />
                  }
                  sx={{
                    px: 1.25,
                    py: 1.5,
                    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
                      transform: 'rotate(180deg)',
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: { xs: '1rem', md: '1.25rem' },
                      fontWeight: 500,
                      color: 'text.secondary',
                    }}
                  >
                    {product.fragranceNotes.length > 0
                      ? `Fragrância de ${product.fragranceNotes[0].toLowerCase()}`
                      : 'Fragrância especial'}
                    :
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 1.25, py: 2 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: { xs: '0.95rem', md: '1.125rem' },
                      lineHeight: 1.7,
                      color: 'text.secondary',
                      textAlign: 'justify',
                    }}
                  >
                    Aroma intenso com notas marcantes e adocicadas.
                    <br />
                    <br />
                    <strong>Família Olfativa:</strong> {product.fragranceDetails.family}
                    <br />
                    <strong>Notas de saída:</strong> {product.fragranceDetails.topNotes.join(', ')}
                    <br />
                    <strong>Notas de corpo:</strong>{' '}
                    {product.fragranceDetails.middleNotes.join(', ')}
                    <br />
                    <strong>Notas de fundo:</strong> {product.fragranceDetails.baseNotes.join(', ')}
                    <br />
                    <strong>Projeção do aroma no ambiente:</strong>{' '}
                    {product.fragranceDetails.projection}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Composição */}
            <Accordion
              sx={{
                bgcolor: 'transparent',
                boxShadow: 'none',
                borderTop: '1px solid rgba(0, 0, 0, 0.5)',
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary
                expandIcon={
                  <ExpandMoreIcon
                    sx={{
                      transition: 'transform 0.4s ease',
                      color: 'text.secondary',
                    }}
                  />
                }
                sx={{
                  px: 1.25,
                  py: 1.5,
                  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
                    transform: 'rotate(180deg)',
                  },
                }}
              >
                <Typography
                  sx={{
                    fontSize: { xs: '1rem', md: '1.25rem' },
                    fontWeight: 500,
                    color: 'text.secondary',
                  }}
                >
                  Composição:
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 1.25, py: 2 }}>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: '0.95rem', md: '1.125rem' },
                    lineHeight: 1.7,
                    color: 'text.secondary',
                    textAlign: 'justify',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {product.composition}
                </Typography>
              </AccordionDetails>
            </Accordion>

            {/* Cuidados */}
            <Accordion
              sx={{
                bgcolor: 'transparent',
                boxShadow: 'none',
                borderTop: '1px solid rgba(0, 0, 0, 0.5)',
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary
                expandIcon={
                  <ExpandMoreIcon
                    sx={{
                      transition: 'transform 0.4s ease',
                      color: 'text.secondary',
                    }}
                  />
                }
                sx={{
                  px: 1.25,
                  py: 1.5,
                  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
                    transform: 'rotate(180deg)',
                  },
                }}
              >
                <Typography
                  sx={{
                    fontSize: { xs: '1rem', md: '1.25rem' },
                    fontWeight: 500,
                    color: 'text.secondary',
                  }}
                >
                  Cuidados:
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 1.25, py: 2 }}>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: '0.95rem', md: '1.125rem' },
                    lineHeight: 1.7,
                    color: 'text.secondary',
                    textAlign: 'justify',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {product.care}
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Stack>
        </Box>
      </Container>

      {/* Produtos Relacionados */}
      {relatedProducts.length > 0 && (
        <Container
          maxWidth={false}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            px: { xs: 2, sm: 3, md: 4 },
            pt: { xs: 4, md: 6 },
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: { xs: '100%', md: '1200px' },
            }}
          >
            {/* Título com Divisores */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                my: { xs: 4, md: 6 },
              }}
            >
              <Divider
                sx={{
                  width: { xs: '20%', md: 610 },
                  borderColor: 'text.secondary',
                  borderWidth: 1,
                }}
              />
              <Typography
                variant="h3"
                sx={{
                  fontSize: { xs: '1.5rem', md: '3.75rem' },
                  fontWeight: 300,
                  color: 'text.secondary',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                Produtos relacionados
              </Typography>
              <Divider
                sx={{
                  width: { xs: '20%', md: 610 },
                  borderColor: 'text.secondary',
                  borderWidth: 1,
                }}
              />
            </Box>

            {/* Lista de Produtos */}
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: { xs: 4, md: 10 },
                pb: { xs: 4, md: 8 },
              }}
            >
              {relatedProducts.slice(0, 2).map((relatedProduct) => (
                <Box
                  key={relatedProduct.id}
                  sx={{
                    width: 293,
                    flexShrink: 0,
                  }}
                >
                  <ProductCard product={relatedProduct} to={`/produtos/${relatedProduct.id}`} />
                </Box>
              ))}
            </Box>
          </Box>
        </Container>
      )}

      {/* Modal de Cadastro de Cliente */}
      <ClientRegistrationModal
        open={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSuccess={handleClientRegistrationSuccess}
      />
    </Stack>
  );
};

export default ProductDetailPage;
