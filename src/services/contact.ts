const FORM_SUBMIT_ENDPOINT = 'https://formsubmit.co/ajax/renato.lopes232025@gmail.com';

export interface ContactFormData {
  nome: string;
  email: string;
  mensagem: string;
}

interface FormSubmitResponse {
  success: string;
  message?: string;
}

const GENERIC_ERROR_MESSAGE =
  'Não foi possível enviar sua mensagem agora. Tente novamente em instantes.';

export const sendContactMessage = async (payload: ContactFormData): Promise<void> => {
  try {
    const response = await fetch(FORM_SUBMIT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        Nome: payload.nome,
        Email: payload.email,
        Mensagem: payload.mensagem,
        _subject: 'Contato via site Logani',
        _template: 'box',
      }),
    });

    const responseBody = (await response.json().catch(() => null)) as FormSubmitResponse | null;

    if (!response.ok) {
      const errorMessage = responseBody?.message ?? GENERIC_ERROR_MESSAGE;
      throw new Error(errorMessage);
    }

    if (!responseBody || responseBody.success !== 'true') {
      const errorMessage = responseBody?.message ?? GENERIC_ERROR_MESSAGE;
      throw new Error(errorMessage);
    }
  } catch (error) {
    if (error instanceof Error && error.message) {
      throw error;
    }
    throw new Error(GENERIC_ERROR_MESSAGE);
  }
};


