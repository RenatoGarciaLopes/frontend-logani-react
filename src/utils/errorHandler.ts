import axios from 'axios';

export const extractErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (!axios.isAxiosError(error)) {
    return defaultMessage;
  }

  const errorData = error.response?.data;

  // Trata a estrutura de erro específica do backend
  if (errorData?.error) {
    // Tenta extrair a mensagem de details (que pode ser uma string Python)
    let errorDetail = errorData.error.details?.error?.detail;

    // Se details é uma string Python (ex: "{'error': {'detail': ErrorDetail(string='Email já cadastrado', code='invalid')}}")
    if (!errorDetail && errorData.error.details) {
      const detailsStr =
        typeof errorData.error.details === 'string'
          ? errorData.error.details
          : JSON.stringify(errorData.error.details);

      // Extrai a mensagem entre string='...' ou string="..."
      const stringMatch = detailsStr.match(/string=['"]([^'"]+)['"]/);
      if (stringMatch && stringMatch[1]) {
        errorDetail = stringMatch[1];
      } else {
        // Tenta extrair de outras formas
        const detailMatch = detailsStr.match(/detail['"]?\s*[:=]\s*['"]?([^'",}]+)/);
        if (detailMatch && detailMatch[1]) {
          errorDetail = detailMatch[1].trim();
        }
      }
    }

    // Retorna a mensagem extraída ou fallback
    return errorDetail || errorData.error.message || defaultMessage;
  }

  // Fallback para outras estruturas de erro
  return errorData?.message || errorData?.detail || error.message || defaultMessage;
};
