import { useNavigate } from 'react-router-dom';
import { useRef, useMemo, useState, useEffect } from 'react';

import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import {
  Box,
  Grid,
  Stack,
  Button,
  Divider,
  Collapse,
  MenuItem,
  Container,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  CircularProgress,
} from '@mui/material';

import { products } from '../data/products.ts';
import type { Order, ShippingOption, OrderItemInOrder } from '../services/api.ts';
import {
  isAddressDifferent,
  mapDeliveryFormToClientAddress,
  mapShippingOptionToAddShippingRequest,
} from '../utils/checkout.ts';
import {
  getAuthData,
  getMyOrders,
  updateClient,
  getClientData,
  saveClientData,
  createCheckout,
  addOrderShipping,
  calculateShipping,
  getClientByBearerToken,
  type CheckoutChargeType,
  type CheckoutPaymentMethod,
} from '../services/api.ts';

const API_URL = import.meta.env.VITE_API_URL;

const BRAZILIAN_STATES = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
];

interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

const Checkout = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [isLoadingCEP, setIsLoadingCEP] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [isDeliveryExpanded, setIsDeliveryExpanded] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Dados do formulário de entrega
  const clientData = getClientData();
  const [deliveryForm, setDeliveryForm] = useState({
    country: 'Brasil',
    firstName: clientData.address ? '' : '',
    lastName: clientData.address ? '' : '',
    postalCode: clientData.address?.postal_code || '',
    address: clientData.address?.address || '',
    number: clientData.address?.number || '',
    complement: clientData.address?.complement || '',
    province: clientData.address?.province || '',
    city: clientData.address?.city || '',
    state: clientData.address?.state || '',
    phone: '',
  });

  useEffect(() => {
    fetchPendingOrders();
    fetchClientAddress();
  }, []);

  const fetchClientAddress = async () => {
    // Primeiro tenta pegar do localStorage
    const localClientData = getClientData();
    const { user } = getAuthData();

    if (localClientData.address) {
      // Se tem dados no localStorage, usa eles
      const nameParts = user?.name?.split(' ') || [];
      setDeliveryForm((prev) => ({
        ...prev,
        firstName: nameParts[0] || prev.firstName,
        lastName: nameParts.slice(1).join(' ') || prev.lastName,
        postalCode: localClientData.address?.postal_code || prev.postalCode,
        address: localClientData.address?.address || prev.address,
        number: localClientData.address?.number || prev.number,
        complement: localClientData.address?.complement || prev.complement,
        province: localClientData.address?.province || prev.province,
        city: localClientData.address?.city || prev.city,
        state: localClientData.address?.state || prev.state,
      }));
    } else {
      // Se não tem no localStorage, busca na API
      try {
        const response = await getClientByBearerToken();

        if ('data' in response && response.data.client) {
          // Salva os dados no localStorage
          saveClientData(response);

          // Preenche o formulário com os dados da API
          const { address } = response.data.client;
          const clientName = response.data.client.name || response.data.user.name || '';
          const nameParts = clientName.split(' ');

          setDeliveryForm((prev) => ({
            ...prev,
            firstName: nameParts[0] || prev.firstName,
            lastName: nameParts.slice(1).join(' ') || prev.lastName,
            postalCode: address.postal_code || prev.postalCode,
            address: address.address || prev.address,
            number: address.number || prev.number,
            complement: address.complement || prev.complement,
            province: address.province || prev.province,
            city: address.city || prev.city,
            state: address.state || prev.state,
            phone: response.data.client.mobile_phone || prev.phone,
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar dados do cliente:', error);
        // Se der erro, mantém o formulário vazio
      }
    }
  };

  const fetchPendingOrders = async () => {
    setIsLoading(true);
    try {
      const response = await getMyOrders('PENDING');
      setOrders(response.data.orders);
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const currentOrder = useMemo(() => orders[0] || null, [orders]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const lastSearchedCEP = useRef<string>('');

  // Marca que a carga inicial foi concluída após buscar os dados do cliente
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setIsInitialLoad(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Busca endereço automaticamente quando o CEP é alterado
  useEffect(() => {
    // Ignora a busca na carga inicial
    if (isInitialLoad) {
      return;
    }

    const cleanPostalCode = deliveryForm.postalCode.replace(/\D/g, '');

    // Se o CEP foi limpo ou reduzido, reseta a referência
    if (cleanPostalCode.length < 8) {
      lastSearchedCEP.current = '';
      return;
    }

    // Evita buscar o mesmo CEP novamente
    if (cleanPostalCode.length === 8 && cleanPostalCode !== lastSearchedCEP.current) {
      const cepToSearch = cleanPostalCode; // Captura o valor limpo atual

      // Limpa os campos de endereço antes da nova busca para não exibir dados antigos
      setDeliveryForm((prev) => ({
        ...prev,
        address: '',
        province: '',
        city: '',
        state: '',
      }));

      const timeoutId = setTimeout(() => {
        // Verifica novamente o CEP atual antes de buscar
        const currentCleanCEP = deliveryForm.postalCode.replace(/\D/g, '');
        if (currentCleanCEP.length === 8 && currentCleanCEP === cepToSearch) {
          lastSearchedCEP.current = currentCleanCEP;
          // Passa o CEP limpo diretamente (a função também limpa internamente, mas está ok)
          fetchAddressByCEP(cepToSearch);
        }
      }, 500); // Debounce de 500ms para evitar múltiplas chamadas

      return () => clearTimeout(timeoutId);
    }
  }, [deliveryForm.postalCode, isInitialLoad]);

  // Calcula frete automaticamente quando há pedido e CEP válido
  useEffect(() => {
    if (currentOrder && deliveryForm.postalCode) {
      const cleanPostalCode = deliveryForm.postalCode.replace(/\D/g, '');
      if (cleanPostalCode.length === 8 && !selectedShipping && !isCalculatingShipping) {
        handleCalculateShipping(cleanPostalCode);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOrder, deliveryForm.postalCode]);

  const cartItems = useMemo(() => {
    if (!currentOrder) return [];
    return currentOrder.items;
  }, [currentOrder]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.total_price, 0);
  }, [cartItems]);

  const total = useMemo(() => {
    const shippingCost = selectedShipping ? selectedShipping.final_price : 0;
    return subtotal + shippingCost;
  }, [subtotal, selectedShipping]);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const getProductImage = (productId: string): string => {
    const product = products.find((p) => p.id === productId);
    return product?.heroImage || '/images/products/energia-1.png';
  };

  const formatDeliveryTime = (days: number): string => {
    if (days === 1) {
      return '1 dia útil';
    }
    return `${days} dias úteis`;
  };

  const formatCEP = (value: string): string => {
    const cleanValue = value.replace(/\D/g, '').slice(0, 8);
    if (cleanValue.length <= 5) return cleanValue;
    return `${cleanValue.slice(0, 5)}-${cleanValue.slice(5)}`;
  };

  const fetchAddressByCEP = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, '');

    if (cleanCEP.length !== 8) {
      return;
    }

    setIsLoadingCEP(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data: ViaCEPResponse = await response.json();

      if (data.erro) {
        // CEP inválido: mantém os campos em branco
        setDeliveryForm((prev) => ({
          ...prev,
          address: '',
          province: '',
          city: '',
          state: '',
        }));
        return;
      }

      setDeliveryForm((prev) => ({
        ...prev,
        address: data.logradouro || '',
        province: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || '',
      }));
    } catch (err) {
      console.error('Erro ao buscar CEP:', err);
    } finally {
      setIsLoadingCEP(false);
    }
  };

  const handleCEPBlur = () => {
    const cep = deliveryForm.postalCode;
    if (cep.replace(/\D/g, '').length === 8) {
      fetchAddressByCEP(cep);
      // Calcula frete automaticamente após buscar CEP
      handleCalculateShipping(cep.replace(/\D/g, ''));
    }
  };

  const handleCalculateShipping = async (postalCode?: string) => {
    if (!currentOrder) return;

    const cep = postalCode || deliveryForm.postalCode.replace(/\D/g, '');
    if (cep.length !== 8) {
      return;
    }

    setIsCalculatingShipping(true);
    setShippingOptions([]);
    setSelectedShipping(null);

    try {
      const response = await calculateShipping({
        to_postal_code: cep,
        order_id: currentOrder.order_id,
      });

      if (response.quotes && response.quotes.length > 0) {
        setShippingOptions(response.quotes);
        // Seleciona automaticamente a opção mais barata
        const cheapestOption = response.quotes.reduce((prev, current) =>
          prev.final_price < current.final_price ? prev : current
        );
        setSelectedShipping(cheapestOption);
      }
    } catch (err) {
      console.error('Erro ao calcular frete:', err);
    } finally {
      setIsCalculatingShipping(false);
    }
  };

  const handlePayNow = async () => {
    if (!currentOrder || !selectedShipping) return;

    try {
      setIsProcessingPayment(true);

      // Atualiza o endereço do cliente se houver mudanças
      const latestClient = getClientData();
      const customerId = latestClient.asaasId;

      if (!customerId) {
        console.error('ID do cliente (ASAAS) não encontrado no localStorage.');
        alert('Não foi possível iniciar o pagamento. Faça login novamente.');
        return;
      }
      const newAddress = mapDeliveryFormToClientAddress({
        postalCode: deliveryForm.postalCode,
        number: deliveryForm.number,
        address: deliveryForm.address,
        city: deliveryForm.city,
        state: deliveryForm.state,
        complement: deliveryForm.complement,
        province: deliveryForm.province,
      });

      if (isAddressDifferent(latestClient.address, newAddress)) {
        await updateClient({ address: newAddress });
      }

      // Adiciona o frete ao pedido
      const shippingPayload = mapShippingOptionToAddShippingRequest(selectedShipping);
      await addOrderShipping(currentOrder.order_id, shippingPayload);

      // const frontUrl = window.location.origin;
      const chargeTypes: CheckoutChargeType[] = ['DETACHED', 'INSTALLMENT'];
      const paymentMethods: CheckoutPaymentMethod[] = ['PIX', 'CREDIT_CARD'];

      const checkoutPayload = {
        customer: customerId,
        chargeTypes,
        minutesToExpire: 60,
        callback: {
          successUrl: `${API_URL}/sucesso`,
          cancelUrl: `${API_URL}/falha`,
          expiredUrl: `${API_URL}/expirado`,
        },
        paymentMethods,
        installment: {
          maxInstallmentCount: 5,
        },
        externalReference: currentOrder.external_reference,
      };

      const checkoutResponse = await createCheckout(checkoutPayload);
      const checkoutUrl = checkoutResponse?.data?.checkout_url;

      if (!checkoutUrl) {
        throw new Error('URL do checkout não foi retornada.');
      }

      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!currentOrder || cartItems.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h5" sx={{ mb: 4, textAlign: 'center' }}>
          Seu carrinho está vazio
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button variant="contained" onClick={() => navigate('/produtos')}>
            Continuar comprando
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Grid container spacing={4}>
        {/* Coluna Esquerda - Formulário de Entrega */}
        <Grid item xs={12} md={7}>
          <Stack spacing={4}>
            {/* Título Entrega */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                Entrega
              </Typography>

              {/* Visualização Resumida */}
              {!isDeliveryExpanded && (
                <Box
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                    position: 'relative',
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => setIsDeliveryExpanded(true)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      p: 0.5,
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src="/icons/pen-bold.svg"
                      alt="Editar"
                      sx={{
                        width: 20,
                        height: 20,
                        filter:
                          'brightness(0) saturate(100%) invert(67%) sepia(8%) saturate(500%) hue-rotate(5deg) brightness(95%) contrast(85%)',
                      }}
                    />
                  </IconButton>
                  <Stack spacing={1}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {deliveryForm.firstName || deliveryForm.lastName
                        ? `${deliveryForm.firstName} ${deliveryForm.lastName}`.trim()
                        : 'Nome não informado'}
                    </Typography>
                    {deliveryForm.address && (
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {deliveryForm.address}
                        {deliveryForm.number && `, ${deliveryForm.number}`}
                        {deliveryForm.complement && ` - ${deliveryForm.complement}`}
                      </Typography>
                    )}
                    {(deliveryForm.province ||
                      deliveryForm.city ||
                      deliveryForm.state ||
                      deliveryForm.postalCode) && (
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {[
                          deliveryForm.province,
                          deliveryForm.city,
                          deliveryForm.state,
                          formatCEP(deliveryForm.postalCode),
                        ]
                          .filter(Boolean)
                          .join(' - ')}
                      </Typography>
                    )}
                    {!deliveryForm.address && !deliveryForm.city && (
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Clique no ícone de editar para preencher o endereço
                      </Typography>
                    )}
                  </Stack>
                </Box>
              )}

              {/* Formulário Expandido */}
              <Collapse in={isDeliveryExpanded}>
                <Stack spacing={3} sx={{ mt: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Editar endereço de entrega
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => setIsDeliveryExpanded(false)}
                      sx={{ color: 'text.secondary' }}
                    >
                      {isDeliveryExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Stack>

                  {/* CEP */}
                  <TextField
                    fullWidth
                    label="CEP"
                    value={formatCEP(deliveryForm.postalCode)}
                    onChange={(e) => {
                      const formatted = formatCEP(e.target.value);
                      setDeliveryForm((prev) => ({ ...prev, postalCode: formatted }));
                    }}
                    onBlur={handleCEPBlur}
                    InputProps={{
                      endAdornment: isLoadingCEP ? (
                        <InputAdornment position="end">
                          <CircularProgress size={20} />
                        </InputAdornment>
                      ) : (
                        <InputAdornment position="end">
                          <SearchIcon sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* Endereço */}
                  <TextField
                    fullWidth
                    label="Endereço"
                    value={deliveryForm.address}
                    onChange={(e) =>
                      setDeliveryForm((prev) => ({ ...prev, address: e.target.value }))
                    }
                  />

                  {/* Número e Complemento lado a lado */}
                  <Stack direction="row" spacing={2}>
                    <TextField
                      fullWidth
                      label="Número"
                      value={deliveryForm.number}
                      onChange={(e) =>
                        setDeliveryForm((prev) => ({ ...prev, number: e.target.value }))
                      }
                    />
                    <TextField
                      fullWidth
                      label="Complemento"
                      value={deliveryForm.complement}
                      onChange={(e) =>
                        setDeliveryForm((prev) => ({ ...prev, complement: e.target.value }))
                      }
                    />
                  </Stack>

                  {/* Bairro */}
                  <TextField
                    fullWidth
                    label="Bairro"
                    value={deliveryForm.province}
                    onChange={(e) =>
                      setDeliveryForm((prev) => ({ ...prev, province: e.target.value }))
                    }
                  />

                  {/* Cidade e Estado lado a lado */}
                  <Stack direction="row" spacing={2}>
                    <TextField
                      fullWidth
                      label="Cidade"
                      value={deliveryForm.city}
                      onChange={(e) =>
                        setDeliveryForm((prev) => ({ ...prev, city: e.target.value }))
                      }
                    />
                    <TextField
                      fullWidth
                      select
                      label="Estado (UF)"
                      value={deliveryForm.state}
                      onChange={(e) =>
                        setDeliveryForm((prev) => ({ ...prev, state: e.target.value }))
                      }
                    >
                      {BRAZILIAN_STATES.map((state) => (
                        <MenuItem key={state} value={state}>
                          {state}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>
                </Stack>
              </Collapse>
            </Box>

            {/* Seção de Envio */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                Envio
              </Typography>

              {isCalculatingShipping ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress />
                </Box>
              ) : shippingOptions.length > 0 ? (
                <Stack spacing={1.5}>
                  {shippingOptions.map((option) => (
                    <Box
                      key={option.id}
                      onClick={() => setSelectedShipping(option)}
                      sx={{
                        border: '1px solid',
                        borderColor:
                          selectedShipping?.id === option.id ? 'primary.main' : 'divider',
                        borderRadius: 1,
                        p: 2,
                        bgcolor:
                          selectedShipping?.id === option.id ? 'grey.50' : 'background.paper',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: 'grey.50',
                        },
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {option.company.name} - {option.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {formatDeliveryTime(option.final_delivery_time)}
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {formatPrice(option.final_price)}
                        </Typography>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Informe o CEP para calcular o frete
                </Typography>
              )}
            </Box>

            {/* Botão Pagar Agora */}
            <Button
              variant="contained"
              fullWidth
              onClick={handlePayNow}
              disabled={!selectedShipping || isProcessingPayment}
              sx={{
                bgcolor: 'primary.main',
                color: 'background.default',
                py: 1.5,
                borderRadius: 1,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
                '&:disabled': {
                  bgcolor: 'grey.300',
                },
              }}
            >
              {isProcessingPayment ? 'Processando...' : 'Pagar agora'}
            </Button>

            {/* Links do Rodapé */}
            <Stack
              direction="row"
              spacing={2}
              flexWrap="wrap"
              sx={{ justifyContent: 'center', mt: 2 }}
            ></Stack>
          </Stack>
        </Grid>

        {/* Coluna Direita - Resumo do Pedido */}
        <Grid item xs={12} md={5}>
          <Box
            sx={{
              position: { md: 'sticky' },
              top: { md: 20 },
              bgcolor: 'background.paper',
              borderRadius: 1,
              p: 3,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Resumo do pedido
            </Typography>

            {/* Lista de Itens */}
            <Stack spacing={2} sx={{ mb: 3 }}>
              {cartItems.map((item: OrderItemInOrder) => (
                <Stack key={item.product_id} direction="row" spacing={2}>
                  <Box sx={{ position: 'relative', flexShrink: 0 }}>
                    <Box
                      component="img"
                      src={getProductImage(item.product_id)}
                      alt={item.product_name}
                      sx={{
                        width: 60,
                        height: 60,
                        objectFit: 'cover',
                        borderRadius: 1,
                        bgcolor: 'grey.100',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -8,
                        left: -8,
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: 'text.primary',
                        color: 'background.default',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      {item.quantity}
                    </Box>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                      {item.product_name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {formatPrice(item.total_price)}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>

            {/* Código de Desconto */}
            <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Código de desconto ou cartão de oferta"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
              />
              <Button variant="outlined" size="small" sx={{ textTransform: 'none', minWidth: 100 }}>
                Aplicar
              </Button>
            </Stack>

            {/* Resumo de Valores */}
            <Stack spacing={1.5} sx={{ mb: 3 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Subtotal · {cartItems.reduce((sum, item) => sum + item.quantity, 0)} itens
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {formatPrice(subtotal)}
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between">
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Envio
                  </Typography>
                  <HelpOutlineIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                </Stack>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {selectedShipping ? formatPrice(selectedShipping.final_price) : 'R$ 0,00'}
                </Typography>
              </Stack>
            </Stack>

            <Divider sx={{ my: 2 }} />

            {/* Total */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Total
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                BRL {formatPrice(total)}
              </Typography>
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Checkout;
