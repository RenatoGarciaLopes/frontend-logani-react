import axios from 'axios';

import { extractErrorMessage } from '../utils/errorHandler.ts';

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.warn('VITE_API_URL não está configurada nas variáveis de ambiente');
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  data: LoginData;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface LoginData {
  user: User;
  access: string;
  refresh: string;
  expires_at: number;
}

export interface LoginResponse {
  message: string;
  data: LoginData;
}

export interface RefreshTokenData {
  access: string;
  refresh: string;
  expires_at: number;
}

export interface RefreshTokenResponse {
  message: string;
  data: RefreshTokenData;
}

const STORAGE_KEYS = {
  USER: 'auth_user',
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  EXPIRES_AT: 'auth_expires_at',
  CLIENT_ASAAS_ID: 'client_asaas_id',
  CLIENT_CPF: 'client_cpf',
  CLIENT_ADDRESS: 'client_address',
  ORDER_ID: 'order_id',
  ORDER_EXTERNAL_REFERENCE: 'order_external_reference',
} as const;

export const saveAuthData = (loginData: LoginData): void => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(loginData.user));
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, loginData.access);
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, loginData.refresh);
  localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, loginData.expires_at.toString());
};

export const getAuthData = (): {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
} => {
  const userStr = localStorage.getItem(STORAGE_KEYS.USER);
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  const expiresAtStr = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT);

  return {
    user: userStr ? JSON.parse(userStr) : null,
    accessToken,
    refreshToken,
    expiresAt: expiresAtStr ? Number.parseInt(expiresAtStr, 10) : null,
  };
};

// Flag para evitar múltiplos refreshes simultâneos
let isRefreshing = false;
// Fila de requisições que aguardam o refresh
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

// Função para processar a fila de requisições após o refresh
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Função para verificar se o token está expirado ou próximo de expirar
const isTokenExpired = (expiresAt: number | null): boolean => {
  if (!expiresAt) return true;
  // Margem de segurança de 30 segundos antes da expiração
  const marginSeconds = 30;
  const expirationTime = expiresAt * 1000; // Converte para milissegundos
  const currentTime = Date.now();
  return currentTime >= expirationTime - marginSeconds * 1000;
};

// Função para fazer refresh do token
const refreshToken = async (): Promise<string> => {
  const { refreshToken: refreshTokenValue } = getAuthData();

  if (!refreshTokenValue) {
    throw new Error('Refresh token não encontrado');
  }

  if (!API_URL) {
    throw new Error('URL da API não configurada');
  }

  try {
    // Cria uma instância do axios sem interceptors para evitar loop infinito
    const refreshApi = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    });

    const response = await refreshApi.post<RefreshTokenResponse>('/users/refresh-token/', {
      refresh: refreshTokenValue,
    });

    // A resposta vem aninhada em { message, data }
    const { access, refresh, expires_at } = response.data.data;

    // Atualiza os tokens no localStorage
    const { user } = getAuthData();
    if (user) {
      saveAuthData({
        user,
        access,
        refresh,
        expires_at,
      });
    }

    return access;
  } catch (error) {
    // Se o refresh falhar, limpa os dados de autenticação
    console.error('Erro ao renovar token:', error);
    clearAuthData();
    throw new Error('Falha ao renovar token. Faça login novamente.');
  }
};

// Interceptor para adicionar token automaticamente e verificar expiração
api.interceptors.request.use(
  async (config) => {
    const { accessToken, expiresAt } = getAuthData();

    // Se não houver token, continua normalmente (pode ser uma requisição pública)
    if (!accessToken) {
      return config;
    }

    // Verifica se o token está expirado ou próximo de expirar
    if (isTokenExpired(expiresAt)) {
      // Se já está fazendo refresh, aguarda na fila
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token && typeof token === 'string') {
              config.headers.Authorization = `Bearer ${token}`;
            } else {
              const { accessToken: newToken } = getAuthData();
              if (newToken) {
                config.headers.Authorization = `Bearer ${newToken}`;
              }
            }
            return config;
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // Inicia o processo de refresh
      isRefreshing = true;

      try {
        const newAccessToken = await refreshToken();
        processQueue(null, newAccessToken);
        config.headers.Authorization = `Bearer ${newAccessToken}`;
      } catch (error) {
        processQueue(error as Error, null);
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    } else {
      // Token ainda válido, adiciona normalmente
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros 401 e fazer refresh automático
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se o erro for 401 e não for uma tentativa de refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/users/refresh-token/')
    ) {
      // Marca a requisição como retry para evitar loops
      originalRequest._retry = true;

      // Se já está fazendo refresh, aguarda na fila
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              if (token && typeof token === 'string') {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              } else {
                const { accessToken: newToken } = getAuthData();
                if (newToken) {
                  originalRequest.headers.Authorization = `Bearer ${newToken}`;
                }
              }
              resolve(api(originalRequest));
            },
            reject: (err) => reject(err),
          });
        });
      }

      // Inicia o processo de refresh
      isRefreshing = true;

      try {
        const newAccessToken = await refreshToken();
        processQueue(null, newAccessToken);

        // Atualiza o header da requisição original
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Reexecuta a requisição original
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        // Se o refresh falhar, limpa os dados e rejeita o erro
        clearAuthData();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const clearAuthData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.EXPIRES_AT);
};

export const clearAllLocalStorage = (): void => {
  localStorage.clear();
};

export const logout = async (): Promise<void> => {
  if (!API_URL) {
    clearAllLocalStorage();
    return;
  }

  const { refreshToken, accessToken } = getAuthData();

  if (!refreshToken) {
    clearAllLocalStorage();
    return;
  }

  try {
    await api.post(
      '/users/logout/',
      { refresh: refreshToken },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  } catch (error) {
    // Mesmo se a requisição falhar, limpamos os dados localmente
    console.error('Erro ao fazer logout:', error);
  } finally {
    // Sempre limpa o localStorage, independente do sucesso da requisição
    clearAllLocalStorage();
  }
};

interface ForgotPasswordRequest {
  email: string;
}

interface ForgotPasswordResponse {
  message: string;
}

interface ResetPasswordRequest {
  token: string;
  password: string;
}

interface ResetPasswordResponse {
  message: string;
}

export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  if (!API_URL) {
    throw new Error('URL da API não configurada');
  }

  try {
    const response = await api.post<LoginResponse>('/users/login/', credentials);
    return response.data;
  } catch (error) {
    const errorMessage = extractErrorMessage(error, 'Erro ao fazer login. Tente novamente.');
    throw new Error(errorMessage);
  }
};

export const register = async (credentials: RegisterRequest): Promise<RegisterResponse> => {
  if (!API_URL) {
    throw new Error('URL da API não configurada');
  }

  try {
    const response = await api.post<RegisterResponse>('/users/register/', credentials);
    return response.data;
  } catch (error) {
    const errorMessage = extractErrorMessage(error, 'Erro ao fazer cadastro. Tente novamente.');
    throw new Error(errorMessage);
  }
};

export const forgotPassword = async (
  payload: ForgotPasswordRequest
): Promise<ForgotPasswordResponse> => {
  if (!API_URL) {
    throw new Error('URL da API não configurada');
  }

  try {
    const response = await api.post<ForgotPasswordResponse>('/users/forgot-password/', payload);
    return response.data;
  } catch (error) {
    const errorMessage = extractErrorMessage(error, 'Erro ao solicitar redefinição de senha.');
    throw new Error(errorMessage);
  }
};

export const resetPassword = async (
  payload: ResetPasswordRequest
): Promise<ResetPasswordResponse> => {
  if (!API_URL) {
    throw new Error('URL da API não configurada');
  }

  try {
    const response = await api.post<ResetPasswordResponse>('/users/reset-password/', payload);
    return response.data;
  } catch (error) {
    const errorMessage = extractErrorMessage(error, 'Erro ao redefinir senha. Tente novamente.');
    throw new Error(errorMessage);
  }
};

// Interfaces para Cliente
export interface ClientAddress {
  postal_code: string;
  number: string;
  address: string;
  city: string;
  state: string;
  complement: string;
  province: string;
}

export interface CreateClientRequest {
  name?: string;
  cpf: string;
  mobile_phone: string;
  address: ClientAddress;
}

export interface AsaasResponse {
  object: string;
  id: string;
  dateCreated: string;
  name: string;
  email: string;
  company: string | null;
  phone: string;
  mobilePhone: string;
  address: string;
  addressNumber: string;
  complement: string | null;
  province: string;
  postalCode: string;
  cpfCnpj: string;
  personType: string;
  deleted: boolean;
  additionalEmails: string | null;
  externalReference: string;
  notificationDisabled: boolean;
  observations: string | null;
  municipalInscription: string | null;
  stateInscription: string | null;
  canDelete: boolean;
  cannotBeDeletedReason: string | null;
  canEdit: boolean;
  cannotEditReason: string | null;
  city: number;
  cityName: string;
  state: string;
  country: string;
}

export interface ClientData {
  id: string;
  name: string;
  cpf: string;
  phone: string | null;
  mobile_phone: string;
  registration_date: string;
  active: boolean;
  asaas_id: string;
  address: ClientAddress;
}

export interface GetClientByBearerTokenResponse {
  data: {
    user: User;
    client: ClientData;
  };
}

export interface CreateClientResponse {
  message: string;
  data: {
    local_id: string;
    asaas_id: string;
    name: string;
    cpf: string;
    asaas_response: AsaasResponse;
  };
}

export interface ClientNotFoundError {
  error: {
    code: string;
    message: string;
    timestamp: string;
  };
}

// Função para buscar cliente pelo bearer token
export const getClientByBearerToken = async (): Promise<
  GetClientByBearerTokenResponse | ClientNotFoundError
> => {
  if (!API_URL) {
    throw new Error('URL da API não configurada');
  }

  const { accessToken } = getAuthData();
  if (!accessToken) {
    throw new Error('Usuário não autenticado');
  }

  try {
    const response = await api.get<GetClientByBearerTokenResponse>(
      '/clients/client-by-bearer-token'
    );
    return response.data;
  } catch (error: unknown) {
    if (
      axios.isAxiosError(error) &&
      (error.response?.status === 404 || error.response?.data?.error?.code === 'NOT_FOUND')
    ) {
      return error.response.data as ClientNotFoundError;
    }
    const errorMessage = extractErrorMessage(error, 'Erro ao buscar cliente. Tente novamente.');
    throw new Error(errorMessage);
  }
};

// Função para criar cliente
export const createClient = async (
  clientData: CreateClientRequest
): Promise<CreateClientResponse> => {
  if (!API_URL) {
    throw new Error('URL da API não configurada');
  }

  try {
    const response = await api.post<CreateClientResponse>('/clients/create/', clientData);
    return response.data;
  } catch (error) {
    const errorMessage = extractErrorMessage(error, 'Erro ao criar cliente. Tente novamente.');
    throw new Error(errorMessage);
  }
};

// Funções para gerenciar dados do cliente no localStorage
export const saveClientData = (
  clientResponse: CreateClientResponse | GetClientByBearerTokenResponse
): void => {
  let asaasId: string;
  let cpf: string;
  let addressData: ClientAddress;

  // Verifica se é a resposta de criação (CreateClientResponse) ou busca (GetClientByBearerTokenResponse)
  if ('client' in clientResponse.data) {
    // Resposta de getClientByBearerToken
    const { asaas_id: asaasIdValue, cpf: clientCpf, address } = clientResponse.data.client;
    asaasId = asaasIdValue;
    cpf = clientCpf;
    addressData = address;
  } else {
    // Resposta de createClient (CreateClientResponse)
    const { asaas_id, cpf: clientCpf, asaas_response } = clientResponse.data;
    asaasId = asaas_id;
    cpf = clientCpf;
    addressData = {
      postal_code: asaas_response.postalCode,
      number: asaas_response.addressNumber,
      address: asaas_response.address,
      city: asaas_response.cityName,
      state: asaas_response.state,
      complement: asaas_response.complement || '',
      province: asaas_response.province,
    };
  }

  localStorage.setItem(STORAGE_KEYS.CLIENT_ASAAS_ID, asaasId);
  localStorage.setItem(STORAGE_KEYS.CLIENT_CPF, cpf);
  localStorage.setItem(STORAGE_KEYS.CLIENT_ADDRESS, JSON.stringify(addressData));
};

export const getClientData = (): {
  asaasId: string | null;
  cpf: string | null;
  address: ClientAddress | null;
} => {
  const asaasId = localStorage.getItem(STORAGE_KEYS.CLIENT_ASAAS_ID);
  const cpf = localStorage.getItem(STORAGE_KEYS.CLIENT_CPF);
  const addressStr = localStorage.getItem(STORAGE_KEYS.CLIENT_ADDRESS);

  return {
    asaasId,
    cpf,
    address: addressStr ? JSON.parse(addressStr) : null,
  };
};

// Interfaces para Pedidos
export interface OrderItem {
  product_id: string | number;
  quantity: number;
}

export interface CreateOrderRequest {
  items: OrderItem[];
}

export interface OrderItemResponse {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface CreateOrderResponse {
  message: string;
  data: {
    order_id: string;
    external_reference: string;
    client: {
      id: string;
      name: string;
    };
    items: OrderItemResponse[];
    subtotal: number;
    total: number;
    total_items: number;
    status: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
    confirmed_at: string | null;
  };
}

export interface OrderItemInOrder {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Order {
  order_id: string;
  external_reference: string;
  total: number;
  subtotal: number;
  status: string;
  total_items: number;
  items: OrderItemInOrder[];
  created_at: string;
  updated_at: string;
  confirmed_at: string | null;
}

export interface MyOrdersResponse {
  message: string;
  data: {
    orders: Order[];
    count: number;
    filters_applied: {
      status: string | null;
      exclude_cancelled: boolean;
    };
  };
}

export interface UpdateOrderItem {
  action: 'add' | 'remove' | 'update';
  product_id: string | number;
  quantity?: number;
}

export interface UpdateOrderRequest {
  items: UpdateOrderItem[];
}

export interface UpdateOrderResponse {
  message: string;
  data: unknown;
}

// Função para buscar meus pedidos
export const getMyOrders = async (status?: string): Promise<MyOrdersResponse> => {
  if (!API_URL) {
    throw new Error('URL da API não configurada');
  }

  try {
    const params = status ? { status } : {};
    const response = await api.get<MyOrdersResponse>('/orders/my-orders/', { params });
    return response.data;
  } catch (error) {
    const errorMessage = extractErrorMessage(error, 'Erro ao buscar pedidos. Tente novamente.');
    throw new Error(errorMessage);
  }
};

// Função para criar pedido
export const createOrder = async (orderData: CreateOrderRequest): Promise<CreateOrderResponse> => {
  if (!API_URL) {
    throw new Error('URL da API não configurada');
  }

  try {
    const response = await api.post<CreateOrderResponse>('/orders/create/', orderData);
    return response.data;
  } catch (error) {
    const errorMessage = extractErrorMessage(error, 'Erro ao criar pedido. Tente novamente.');
    throw new Error(errorMessage);
  }
};

// Função para atualizar pedido
export const updateOrder = async (
  orderId: string,
  updateData: UpdateOrderRequest
): Promise<UpdateOrderResponse> => {
  if (!API_URL) {
    throw new Error('URL da API não configurada');
  }

  try {
    const response = await api.patch<UpdateOrderResponse>(`/orders/update/${orderId}/`, updateData);
    return response.data;
  } catch (error) {
    const errorMessage = extractErrorMessage(error, 'Erro ao atualizar pedido. Tente novamente.');
    throw new Error(errorMessage);
  }
};

// Função para salvar dados do pedido no localStorage
export const saveOrderData = (orderId: string, externalReference: string): void => {
  localStorage.setItem(STORAGE_KEYS.ORDER_ID, orderId);
  localStorage.setItem(STORAGE_KEYS.ORDER_EXTERNAL_REFERENCE, externalReference);
};

// Função para gerenciar pedido após salvar dados do cliente
export const handleOrderAfterClientSave = async (
  productId: string | number,
  quantity: number = 1
): Promise<void> => {
  try {
    // Verifica se já existe pedidos PENDING
    const myOrders = await getMyOrders('PENDING');

    // Se não houver pedidos PENDING, cria um novo
    if (myOrders.data.count === 0 || myOrders.data.orders.length === 0) {
      const createResponse = await createOrder({
        items: [{ product_id: productId, quantity }],
      });

      const { order_id, external_reference } = createResponse.data;

      // Salva no localStorage
      saveOrderData(order_id, external_reference);
    } else {
      // Se já existe pedido PENDING, verifica se o produto já está no pedido
      const currentOrder = myOrders.data.orders[0];
      const existingItem = currentOrder.items.find((item) => item.product_id === productId);

      if (!existingItem) {
        // Produto não está no pedido, adiciona com action: "add"
        await updateOrder(currentOrder.order_id, {
          items: [
            {
              action: 'add',
              product_id: productId,
              quantity,
            },
          ],
        });
      } else {
        // Produto já está no pedido, atualiza somando as quantidades
        const newQuantity = existingItem.quantity + quantity;
        await updateOrder(currentOrder.order_id, {
          items: [
            {
              action: 'update',
              product_id: productId,
              quantity: newQuantity,
            },
          ],
        });
      }
    }
  } catch (error) {
    console.error('Erro ao gerenciar pedido:', error);
    // Não lança erro para não quebrar o fluxo principal
  }
};

// Interfaces para Cálculo de Frete
export interface CalculateShippingRequest {
  to_postal_code: string;
  order_id: string;
}

export interface ShippingCompany {
  id: number;
  name: string;
  picture: string;
}

export interface ShippingOption {
  id: number;
  name: string;
  price: string;
  custom_price: string;
  currency: string;
  delivery_time: number;
  custom_delivery_time: number;
  company: ShippingCompany;
  final_price: number;
  final_delivery_time: number;
}

export interface CalculateShippingResponse {
  quotes: ShippingOption[];
  count: number;
  products_source: string;
}

// Função para calcular frete
export const calculateShipping = async (
  request: CalculateShippingRequest
): Promise<CalculateShippingResponse> => {
  if (!API_URL) {
    throw new Error('URL da API não configurada');
  }

  try {
    const response = await api.post<CalculateShippingResponse>('/shippings/calculate/', request);
    return response.data;
  } catch (error) {
    const errorMessage = extractErrorMessage(error, 'Erro ao calcular frete. Tente novamente.');
    throw new Error(errorMessage);
  }
};

// -----------------------------
// Atualização de Cliente
// -----------------------------
export interface UpdateClientRequest {
  name?: string;
  mobile_phone?: string;
  address?: ClientAddress;
}

export interface UpdateClientResponse {
  message: string;
  data: unknown;
}

export const updateClient = async (payload: UpdateClientRequest): Promise<UpdateClientResponse> => {
  if (!API_URL) {
    throw new Error('URL da API não configurada');
  }

  try {
    const response = await api.patch<UpdateClientResponse>('/clients/update/', payload);
    // Se endereço foi enviado, atualiza o localStorage para manter consistência
    if (payload.address) {
      try {
        saveClientAddressLocal(payload.address);
      } catch {
        // Evita quebrar o fluxo por falha no localStorage
      }
    }
    return response.data;
  } catch (error) {
    const errorMessage = extractErrorMessage(error, 'Erro ao atualizar dados do cliente.');
    throw new Error(errorMessage);
  }
};

// Utilitário: atualizar somente o endereço no localStorage
export const saveClientAddressLocal = (address: ClientAddress): void => {
  localStorage.setItem(STORAGE_KEYS.CLIENT_ADDRESS, JSON.stringify(address));
};

// -----------------------------
// Adicionar frete ao pedido
// -----------------------------
export interface AddShippingRequest {
  service_id: number;
  service_name: string;
  price: number | string;
  custom_price: number | string;
  delivery_time: number;
  custom_delivery_time: number;
  currency: string;
  company: ShippingCompany;
}

export interface AddShippingResponse {
  message: string;
  data: unknown;
}

export const addOrderShipping = async (
  orderId: string,
  payload: AddShippingRequest
): Promise<AddShippingResponse> => {
  if (!API_URL) {
    throw new Error('URL da API não configurada');
  }

  try {
    const response = await api.post<AddShippingResponse>(
      `/orders/add-shipping/${orderId}/`,
      payload
    );
    return response.data;
  } catch (error) {
    const errorMessage = extractErrorMessage(error, 'Erro ao adicionar frete ao pedido.');
    throw new Error(errorMessage);
  }
};

// -----------------------------
// Criação de Checkout
// -----------------------------

export interface CheckoutCallbackUrls {
  successUrl: string;
  cancelUrl: string;
  expiredUrl: string;
}

export type CheckoutChargeType = 'DETACHED' | 'INSTALLMENT';
export type CheckoutPaymentMethod = 'PIX' | 'CREDIT_CARD';

export interface CreateCheckoutRequest {
  customer: string;
  chargeTypes: CheckoutChargeType[];
  minutesToExpire: number;
  callback: CheckoutCallbackUrls;
  paymentMethods: CheckoutPaymentMethod[];
  installment: {
    maxInstallmentCount: number;
  };
  externalReference: string;
}

export interface CreateCheckoutResponse {
  message: string;
  data: {
    local_id: string;
    asaas_id: string;
    checkout_url: string;
    name: string;
    value: number;
    status: string;
    expires_at: string;
    payment_id: string;
    asaas_response: unknown;
  };
}

export const createCheckout = async (
  payload: CreateCheckoutRequest
): Promise<CreateCheckoutResponse> => {
  if (!API_URL) {
    throw new Error('URL da API não configurada');
  }

  try {
    const response = await api.post<CreateCheckoutResponse>('/checkouts/create/', payload);
    return response.data;
  } catch (error) {
    const errorMessage = extractErrorMessage(error, 'Erro ao criar checkout. Tente novamente.');
    throw new Error(errorMessage);
  }
};
