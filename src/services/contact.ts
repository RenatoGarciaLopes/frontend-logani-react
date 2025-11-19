import { api, API_URL } from './api.ts';
import { extractErrorMessage } from '../utils/errorHandler.ts';

export interface ContactRequest {
  name: string;
  email: string;
  message: string;
}

export interface ContactResponse {
  message: string;
}

export const sendContactMessage = async (payload: ContactRequest): Promise<ContactResponse> => {
  if (!API_URL) {
    throw new Error('URL da API não configurada');
  }

  try {
    const response = await api.post<ContactResponse>('/emails/contact/', payload);
    return response.data;
  } catch (error) {
    const errorMessage = extractErrorMessage(
      error,
      'Não foi possível enviar sua mensagem. Tente novamente em instantes.'
    );
    throw new Error(errorMessage);
  }
};
