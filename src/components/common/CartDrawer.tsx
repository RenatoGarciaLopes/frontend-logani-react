import { useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';

import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import {
  Box,
  Stack,
  Button,
  Drawer,
  Divider,
  Collapse,
  IconButton,
  Typography,
  CircularProgress,
} from '@mui/material';

import { products } from '../../data/products.ts';
import {
  type Order,
  getMyOrders,
  updateOrder,
  getClientData,
  getClientByBearerToken,
  saveClientData,
  calculateShipping,
  type ShippingOption,
  type OrderItemInOrder,
} from '../../services/api.ts';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

interface PendingChanges {
  quantityUpdates: Map<string, number>;
  itemsToRemove: Set<string>;
}

const CartDrawer = ({ open, onClose }: CartDrawerProps) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<PendingChanges>({
    quantityUpdates: new Map(),
    itemsToRemove: new Set(),
  });
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [isShippingExpanded, setIsShippingExpanded] = useState(false);

  // Função para resetar o estado do frete
  const resetShippingState = () => {
    setShippingOptions([]);
    setSelectedShipping(null);
    setShippingError(null);
    setIsShippingExpanded(false);
  };

  useEffect(() => {
    if (open) {
      fetchPendingOrders();
      // Reseta mudanças pendentes ao abrir
      setPendingChanges({
        quantityUpdates: new Map(),
        itemsToRemove: new Set(),
      });
      // Reseta estados de frete ao abrir o carrinho
      resetShippingState();
    } else {
      // Reseta estados de frete ao fechar o carrinho
      resetShippingState();
    }
  }, [open]);

  const fetchPendingOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getMyOrders('PENDING');
      setOrders(response.data.orders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pedidos');
      console.error('Erro ao buscar pedidos pendentes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const currentOrder = useMemo(() => orders[0] || null, [orders]);

  // Aplica mudanças locais aos itens do carrinho
  const cartItems = useMemo(() => {
    if (!currentOrder) return [];

    return currentOrder.items
      .filter((item) => !pendingChanges.itemsToRemove.has(item.product_id))
      .map((item) => {
        const updatedQuantity = pendingChanges.quantityUpdates.get(item.product_id);
        if (updatedQuantity !== undefined) {
          return {
            ...item,
            quantity: updatedQuantity,
            total_price: item.unit_price * updatedQuantity,
          };
        }
        return item;
      });
  }, [currentOrder, pendingChanges]);

  // Calcula o total baseado nos itens com mudanças aplicadas
  const calculatedTotal = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.total_price, 0);
    const shippingCost = selectedShipping ? selectedShipping.final_price : 0;
    return subtotal + shippingCost;
  }, [cartItems, selectedShipping]);

  // Calcula o subtotal sem frete
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.total_price, 0);
  }, [cartItems]);

  // Função para formatar preço em Real
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  // Função para obter a imagem do produto
  const getProductImage = (productId: string): string => {
    const product = products.find((p) => p.id === productId);
    return product?.heroImage || '/images/products/energia-1.png';
  };

  // Função para atualizar a quantidade de um item (apenas localmente)
  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (!currentOrder || newQuantity < 1) return;

    setPendingChanges((prev) => {
      const newUpdates = new Map(prev.quantityUpdates);
      if (newQuantity === 0) {
        newUpdates.delete(productId);
        // Adiciona à lista de remoção se quantidade for 0
        const newRemoves = new Set(prev.itemsToRemove);
        newRemoves.add(productId);
        return {
          quantityUpdates: newUpdates,
          itemsToRemove: newRemoves,
        };
      } else {
        // Remove da lista de remoção se estava lá
        const newRemoves = new Set(prev.itemsToRemove);
        newRemoves.delete(productId);
        newUpdates.set(productId, newQuantity);
        return {
          quantityUpdates: newUpdates,
          itemsToRemove: newRemoves,
        };
      }
    });
    // Reseta o estado do frete quando houver mudanças
    resetShippingState();
  };

  // Função para remover um item (apenas localmente)
  const handleDeleteItem = (productId: string) => {
    if (!currentOrder) return;

    setPendingChanges((prev) => {
      const newUpdates = new Map(prev.quantityUpdates);
      newUpdates.delete(productId);
      const newRemoves = new Set(prev.itemsToRemove);
      newRemoves.add(productId);
      return {
        quantityUpdates: newUpdates,
        itemsToRemove: newRemoves,
      };
    });
    // Reseta o estado do frete quando houver mudanças
    resetShippingState();
  };

  // Função para aplicar todas as mudanças pendentes
  const applyPendingChanges = async () => {
    if (!currentOrder || isUpdating) return;

    const hasChanges =
      pendingChanges.quantityUpdates.size > 0 || pendingChanges.itemsToRemove.size > 0;

    if (!hasChanges) return;

    setIsUpdating(true);
    setError(null);

    try {
      const items: Array<{
        action: 'update' | 'remove';
        product_id: string;
        quantity?: number;
      }> = [];

      // Adiciona atualizações de quantidade
      pendingChanges.quantityUpdates.forEach((quantity, productId) => {
        items.push({
          action: 'update',
          product_id: productId,
          quantity,
        });
      });

      // Adiciona remoções
      pendingChanges.itemsToRemove.forEach((productId) => {
        items.push({
          action: 'remove',
          product_id: productId,
        });
      });

      if (items.length > 0) {
        await updateOrder(currentOrder.order_id, { items });
        // Recarrega os pedidos após aplicar mudanças
        await fetchPendingOrders();
      }
    } catch (err) {
      console.error('Erro ao aplicar mudanças:', err);
      setError(err instanceof Error ? err.message : 'Erro ao aplicar mudanças');
      throw err;
    } finally {
      setIsUpdating(false);
      // Limpa mudanças pendentes após aplicar
      setPendingChanges({
        quantityUpdates: new Map(),
        itemsToRemove: new Set(),
      });
    }
  };

  // Handler para fechar o carrinho (aplica mudanças antes de fechar)
  const handleClose = async () => {
    try {
      await applyPendingChanges();
    } catch {
      // Se der erro, não fecha o carrinho para o usuário ver o erro
      return;
    }
    onClose();
  };

  // Handler para calcular frete
  const handleCalculateShipping = async () => {
    if (!currentOrder) {
      setShippingError('Pedido não encontrado');
      return;
    }

    // Verifica se há mudanças pendentes e aplica antes de calcular o frete
    const hasChanges =
      pendingChanges.quantityUpdates.size > 0 || pendingChanges.itemsToRemove.size > 0;

    if (hasChanges) {
      try {
        // Aplica as mudanças pendentes primeiro
        await applyPendingChanges();
        // Recarrega os pedidos para ter o pedido atualizado
        await fetchPendingOrders();
      } catch (err) {
        setShippingError('Erro ao atualizar pedido. Tente novamente.');
        console.error('Erro ao aplicar mudanças antes de calcular frete:', err);
        return;
      }
    }

    // Obtém o CEP do endereço do cliente; se não houver no localStorage, busca na API
    let clientData = getClientData();
    if (!clientData.address || !clientData.address.postal_code) {
      try {
        const clientResponse = await getClientByBearerToken();
        if ('error' in clientResponse) {
          setShippingError('Por favor, cadastre seu endereço antes de calcular o frete');
          return;
        }
        saveClientData(clientResponse);
        clientData = getClientData();
      } catch (err) {
        console.error('Erro ao buscar dados do cliente:', err);
        setShippingError('Não foi possível obter seu endereço. Tente novamente.');
        return;
      }
    }

    if (!clientData.address || !clientData.address.postal_code) {
      setShippingError('Por favor, cadastre seu endereço antes de calcular o frete');
      return;
    }

    // Remove caracteres não numéricos do CEP
    const cleanPostalCode = clientData.address.postal_code.replace(/\D/g, '');

    if (cleanPostalCode.length !== 8) {
      setShippingError('CEP inválido no seu cadastro. Por favor, atualize seu endereço');
      return;
    }

    setIsCalculatingShipping(true);
    setShippingError(null);
    setShippingOptions([]);
    setSelectedShipping(null);

    try {
      // Usa o order_id atualizado após aplicar as mudanças
      const updatedOrder = orders[0] || currentOrder;
      const response = await calculateShipping({
        to_postal_code: cleanPostalCode,
        order_id: updatedOrder.order_id,
      });

      if (response.quotes && response.quotes.length > 0) {
        setShippingOptions(response.quotes);
        // Seleciona automaticamente a opção mais barata
        const cheapestOption = response.quotes.reduce((prev, current) =>
          prev.final_price < current.final_price ? prev : current
        );
        setSelectedShipping(cheapestOption);
        setIsShippingExpanded(true);
      } else {
        setShippingError('Nenhuma opção de frete disponível para este CEP');
      }
    } catch (err) {
      setShippingError(err instanceof Error ? err.message : 'Erro ao calcular frete');
      console.error('Erro ao calcular frete:', err);
    } finally {
      setIsCalculatingShipping(false);
    }
  };

  // Formata o prazo de entrega (dias úteis)
  const formatDeliveryTime = (days: number): string => {
    if (days === 1) {
      return '1 dia útil';
    }
    return `${days} dias úteis`;
  };

  // Handler para finalizar a compra (aplica mudanças antes de finalizar)
  const handleFinalizePurchase = async () => {
    try {
      await applyPendingChanges();
      // Fecha o carrinho e navega para o checkout
      onClose();
      navigate('/checkout');
    } catch {
      // Erro já é exibido no estado
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: { xs: '85vw', sm: '400px', md: '450px' },
          maxWidth: '450px',
          bgcolor: 'background.default',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
        },
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ p: 2, pb: 1 }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: '1.25rem',
            color: 'text.primary',
          }}
        >
          O seu carrinho
        </Typography>
        <IconButton
          onClick={onClose}
          aria-label="Fechar carrinho"
          sx={{
            color: 'text.primary',
            opacity: 0.6,
            transition: 'opacity 0.3s ease',
            '&:hover': {
              opacity: 1,
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </Stack>

      <Divider />

      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {isLoading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
            }}
          >
            <CircularProgress sx={{ color: 'text.primary' }} />
          </Box>
        ) : error ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              px: 3,
            }}
          >
            <Typography
              variant="body1"
              sx={{
                color: 'error.main',
                mb: 2,
                textAlign: 'center',
              }}
            >
              {error}
            </Typography>
            <Button
              variant="outlined"
              onClick={fetchPendingOrders}
              sx={{
                textTransform: 'none',
              }}
            >
              Tentar novamente
            </Button>
          </Box>
        ) : cartItems.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              px: 3,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: 'text.primary',
                fontWeight: 600,
                fontSize: '1.25rem',
                mb: 4,
                textAlign: 'center',
              }}
            >
              O seu carrinho está vazio
            </Typography>
            <Button
              variant="contained"
              onClick={handleClose}
              fullWidth
              sx={{
                bgcolor: 'text.primary',
                color: 'background.default',
                py: 1.5,
                borderRadius: '8px',
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
                '&:hover': {
                  bgcolor: 'text.primary',
                  opacity: 0.9,
                },
              }}
            >
              Continuar a comprar
            </Button>
          </Box>
        ) : (
          <>
            {/* Headers */}
            <Stack direction="row" justifyContent="space-between" sx={{ px: 2, pt: 2, pb: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                PRODUTO
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                TOTAL
              </Typography>
            </Stack>

            {/* Lista de itens */}
            <Stack spacing={2} sx={{ px: 2, py: 1, flex: 1 }}>
              {cartItems.map((item: OrderItemInOrder, index: number) => (
                <Box
                  key={`${item.product_id}-${index}`}
                  sx={{
                    display: 'flex',
                    gap: 2,
                    alignItems: 'flex-start',
                  }}
                >
                  {/* Imagem do produto */}
                  <Box
                    component="img"
                    src={getProductImage(item.product_id)}
                    alt={item.product_name}
                    sx={{
                      width: 80,
                      height: 80,
                      objectFit: 'cover',
                      borderRadius: 1,
                      bgcolor: 'grey.100',
                      flexShrink: 0,
                    }}
                  />

                  {/* Informações do produto */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                        mb: 0.5,
                      }}
                    >
                      {item.product_name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        display: 'block',
                        mb: 1,
                      }}
                    >
                      {formatPrice(item.unit_price)}
                    </Typography>

                    {/* Controles de quantidade */}
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{
                        flexWrap: 'nowrap',
                        width: '100%',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: '20px',
                          overflow: 'hidden',
                          bgcolor: 'background.paper',
                          flexShrink: 0,
                          width: 'auto',
                          minWidth: 'fit-content',
                        }}
                      >
                        <IconButton
                          size="small"
                          sx={{
                            borderRadius: 0,
                            p: 0.5,
                            minWidth: 'auto',
                            width: 32,
                            height: 32,
                            flexShrink: 0,
                            '&:hover': {
                              bgcolor: 'action.hover',
                            },
                          }}
                          disabled={item.quantity <= 1}
                          onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}
                        >
                          <RemoveIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        <Typography
                          variant="body2"
                          sx={{
                            px: 2,
                            minWidth: 40,
                            textAlign: 'center',
                            color: 'text.primary',
                            fontWeight: 500,
                            flexShrink: 0,
                          }}
                        >
                          {item.quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          sx={{
                            borderRadius: 0,
                            p: 0.5,
                            minWidth: 'auto',
                            width: 32,
                            height: 32,
                            flexShrink: 0,
                            '&:hover': {
                              bgcolor: 'action.hover',
                            },
                          }}
                          onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                        >
                          <AddIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>

                      {/* Botão de remover */}
                      <IconButton
                        size="small"
                        sx={{
                          ml: 'auto',
                          flexShrink: 0,
                          color: 'text.secondary',
                          '&:hover': {
                            color: 'error.main',
                          },
                        }}
                        onClick={() => handleDeleteItem(item.product_id)}
                      >
                        <DeleteIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Stack>
                  </Box>

                  {/* Total do item */}
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: 'text.primary',
                      minWidth: 80,
                      textAlign: 'right',
                    }}
                  >
                    {formatPrice(item.total_price)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </>
        )}
      </Box>

      {/* Footer com cálculo de frete, total e botão */}
      {!isLoading && !error && cartItems.length > 0 && currentOrder && (
        <>
          <Divider />
          <Box sx={{ p: 2 }}>
            {/* Seção de Cálculo de Frete */}
            <Box sx={{ mb: 3 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1, cursor: 'pointer' }}
                onClick={() => setIsShippingExpanded(!isShippingExpanded)}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: 'text.primary',
                    fontSize: '1rem',
                  }}
                >
                  CALCULE SEU FRETE
                </Typography>
                <IconButton size="small" sx={{ p: 0.5 }}>
                  {isShippingExpanded ? (
                    <ExpandLessIcon sx={{ fontSize: 20 }} />
                  ) : (
                    <ExpandMoreIcon sx={{ fontSize: 20 }} />
                  )}
                </IconButton>
              </Stack>

              <Collapse in={isShippingExpanded}>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  {shippingError && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'error.main',
                        fontSize: '0.875rem',
                      }}
                    >
                      {shippingError}
                    </Typography>
                  )}
                  {shippingOptions.length === 0 && (
                    <Button
                      variant="contained"
                      onClick={handleCalculateShipping}
                      disabled={isCalculatingShipping}
                      fullWidth
                      sx={{
                        bgcolor: 'text.primary',
                        color: 'background.default',
                        borderRadius: '8px',
                        textTransform: 'none',
                        py: 1.5,
                        '&:hover': {
                          bgcolor: 'text.primary',
                          opacity: 0.9,
                        },
                        '&:disabled': {
                          bgcolor: 'text.primary',
                          opacity: 0.5,
                        },
                      }}
                    >
                      {isCalculatingShipping ? (
                        <CircularProgress size={20} sx={{ color: 'background.default' }} />
                      ) : (
                        'CALCULAR FRETE'
                      )}
                    </Button>
                  )}

                  {/* Opções de Frete */}
                  {shippingOptions.length > 0 && selectedShipping && (
                    <Box>
                      <Stack spacing={1}>
                        {shippingOptions.map((option) => (
                          <Box
                            key={option.id}
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              py: 1,
                            }}
                          >
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: 'text.primary',
                                  fontSize: '0.875rem',
                                }}
                              >
                                {option.company.name} - {option.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: 'text.secondary',
                                  fontSize: '0.75rem',
                                }}
                              >
                                {formatDeliveryTime(option.final_delivery_time)}
                              </Typography>
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: selectedShipping.id === option.id ? 600 : 400,
                                color: 'text.primary',
                                fontSize: '0.875rem',
                              }}
                            >
                              {formatPrice(option.final_price)}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Stack>
              </Collapse>
            </Box>

            {/* Subtotal */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                }}
              >
                SUBTOTAL
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                }}
              >
                {formatPrice(subtotal)}
              </Typography>
            </Stack>

            {/* Frete selecionado */}
            {selectedShipping && (
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                  }}
                >
                  Frete ({selectedShipping.company.name})
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                  }}
                >
                  {formatPrice(selectedShipping.final_price)}
                </Typography>
              </Stack>
            )}

            {/* Total */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                }}
              >
                Total
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                }}
              >
                {formatPrice(calculatedTotal)}
              </Typography>
            </Stack>

            <Button
              variant="contained"
              fullWidth
              onClick={handleFinalizePurchase}
              disabled={isUpdating}
              sx={{
                bgcolor: 'text.primary',
                color: 'background.default',
                py: 1.5,
                borderRadius: '8px',
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                mt: 2,
                '&:hover': {
                  bgcolor: 'text.primary',
                  opacity: 0.9,
                },
              }}
            >
              {isUpdating ? 'Processando...' : 'FINALIZAR A COMPRA'}
            </Button>
          </Box>
        </>
      )}
    </Drawer>
  );
};

export default CartDrawer;
