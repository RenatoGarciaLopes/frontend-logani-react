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

const STORAGE_KEYS = {
  USER: 'auth_user',
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  EXPIRES_AT: 'auth_expires_at',
  CLIENT_ASAAS_ID: 'client_asaas_id',
  CLIENT_CPF: 'client_cpf',
  CLIENT_ADDRESS: 'client_address',
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

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    const { accessToken } = getAuthData();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
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
  name: string;
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
  CreateClientResponse | ClientNotFoundError
> => {
  if (!API_URL) {
    throw new Error('URL da API não configurada');
  }

  const { accessToken } = getAuthData();
  if (!accessToken) {
    throw new Error('Usuário não autenticado');
  }

  try {
    const response = await api.get<CreateClientResponse>('/clients/client-by-bearer-token', {});
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
    const response = await api.post<CreateClientResponse>('/clients/', clientData);
    return response.data;
  } catch (error) {
    const errorMessage = extractErrorMessage(error, 'Erro ao criar cliente. Tente novamente.');
    throw new Error(errorMessage);
  }
};

// Funções para gerenciar dados do cliente no localStorage
export const saveClientData = (clientResponse: CreateClientResponse): void => {
  const { asaas_id, cpf, asaas_response } = clientResponse.data;

  localStorage.setItem(STORAGE_KEYS.CLIENT_ASAAS_ID, asaas_id);
  localStorage.setItem(STORAGE_KEYS.CLIENT_CPF, cpf);

  const addressData = {
    postal_code: asaas_response.postalCode,
    number: asaas_response.addressNumber,
    address: asaas_response.address,
    city: asaas_response.cityName,
    state: asaas_response.state,
    complement: asaas_response.complement || '',
    province: asaas_response.province,
  };

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
