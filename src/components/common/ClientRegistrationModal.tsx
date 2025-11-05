import * as yup from 'yup';
import { useFormik } from 'formik';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import {
  Box,
  Step,
  Alert,
  Modal,
  Stack,
  Button,
  Stepper,
  Backdrop,
  TextField,
  StepLabel,
  Typography,
  InputAdornment,
  CircularProgress,
} from '@mui/material';

import {
  getAuthData,
  createClient,
  saveClientData,
  type CreateClientRequest,
} from '../../services/api.ts';

interface ClientRegistrationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Função para validar CPF
const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, '');

  if (cleanCPF.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  // Validação dos dígitos verificadores
  let sum = 0;
  let remainder;

  // Valida primeiro dígito
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;

  // Valida segundo dígito
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;

  return true;
};

const validationSchema = yup.object({
  name: yup.string().required('Nome é obrigatório'),
  cpf: yup
    .string()
    .required('CPF é obrigatório')
    .test('cpf-format', 'CPF deve conter 11 dígitos', (value) => {
      if (!value) return false;
      const cleanCPF = value.replace(/\D/g, '');
      return cleanCPF.length === 11;
    })
    .test('cpf-valid', 'CPF inválido', (value) => {
      if (!value) return false;
      return validateCPF(value);
    }),
  mobile_phone: yup
    .string()
    .required('Telefone é obrigatório')
    .test('phone-format', 'Telefone inválido', (value) => {
      if (!value) return false;
      const cleanPhone = value.replace(/\D/g, '');
      return cleanPhone.length === 10 || cleanPhone.length === 11;
    }),
  address: yup.object({
    postal_code: yup
      .string()
      .required('CEP é obrigatório')
      .matches(/^\d{8}$/, 'CEP deve conter 8 dígitos'),
    address: yup.string().required('Endereço é obrigatório'),
    number: yup.string().required('Número é obrigatório'),
    city: yup.string().required('Cidade é obrigatória'),
    state: yup.string().required('Estado é obrigatório').length(2, 'Estado deve ter 2 caracteres'),
    complement: yup.string(),
    province: yup.string().required('Bairro é obrigatório'),
  }),
});

const steps = ['Dados Pessoais', 'Endereço', 'Confirmação'];

interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

const ClientRegistrationModal = ({ open, onClose, onSuccess }: ClientRegistrationModalProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCEP, setIsLoadingCEP] = useState(false);
  const [cepValidated, setCepValidated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik<CreateClientRequest>({
    initialValues: {
      name: '',
      cpf: '',
      mobile_phone: '',
      address: {
        postal_code: '',
        number: '',
        address: '',
        city: '',
        state: '',
        complement: '',
        province: '',
      },
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      setError(null);

      try {
        // Remove máscaras antes de enviar
        const cleanValues: CreateClientRequest = {
          ...values,
          cpf: values.cpf.replace(/\D/g, ''),
          mobile_phone: values.mobile_phone.replace(/\D/g, ''),
        };

        const response = await createClient(cleanValues);
        saveClientData(response);
        onSuccess();
        handleClose();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Erro ao cadastrar cliente. Tente novamente.'
        );
      } finally {
        setIsLoading(false);
      }
    },
  });

  // Preenche o nome automaticamente quando o modal abrir
  useEffect(() => {
    if (open) {
      const { user } = getAuthData();
      if (user?.name) {
        formik.setFieldValue('name', user.name);
      }
      // Reset do estado de CEP validado quando o modal abrir
      setCepValidated(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Reset do estado de CEP validado quando o CEP for alterado
  useEffect(() => {
    const cleanCEP = formik.values.address.postal_code.replace(/\D/g, '');
    if (cleanCEP.length !== 8 && cepValidated) {
      setCepValidated(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.address.postal_code]);

  const handleClose = () => {
    formik.resetForm();
    setActiveStep(0);
    setError(null);
    setIsLoading(false);
    setCepValidated(false);
    onClose();
  };

  const handleNext = () => {
    if (activeStep === 0) {
      // Validar dados pessoais
      formik.setTouched({
        name: true,
        cpf: true,
        mobile_phone: true,
      });
      if (!formik.errors.name && !formik.errors.cpf && !formik.errors.mobile_phone) {
        setActiveStep(1);
      }
    } else if (activeStep === 1) {
      // Validar endereço
      formik.setTouched({
        address: {
          postal_code: true,
          address: true,
          number: true,
          city: true,
          state: true,
          province: true,
        },
      });
      if (
        !formik.errors.address?.postal_code &&
        !formik.errors.address?.address &&
        !formik.errors.address?.number &&
        !formik.errors.address?.city &&
        !formik.errors.address?.state &&
        !formik.errors.address?.province
      ) {
        setActiveStep(2);
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Função para formatar CPF com máscara: 000.000.000-00
  const formatCPF = (value: string): string => {
    const cleanValue = value.replace(/\D/g, '').slice(0, 11);
    if (cleanValue.length <= 3) return cleanValue;
    if (cleanValue.length <= 6) return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3)}`;
    if (cleanValue.length <= 9)
      return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3, 6)}.${cleanValue.slice(6)}`;
    return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3, 6)}.${cleanValue.slice(6, 9)}-${cleanValue.slice(9, 11)}`;
  };

  // Função para formatar telefone com máscara: (00) 00000-0000 ou (00) 0000-0000
  const formatPhone = (value: string): string => {
    const cleanValue = value.replace(/\D/g, '').slice(0, 11);
    if (cleanValue.length <= 2) return cleanValue;
    if (cleanValue.length <= 6) return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2)}`;
    if (cleanValue.length <= 10)
      return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2, 6)}-${cleanValue.slice(6)}`;
    return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2, 7)}-${cleanValue.slice(7, 11)}`;
  };

  // Função para exibir CPF formatado (apenas para visualização)
  const displayCPF = (value: string): string => {
    return formatCPF(value);
  };

  // Função para exibir telefone formatado (apenas para visualização)
  const displayPhone = (value: string): string => {
    return formatPhone(value);
  };

  const formatCEP = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 8);
  };

  // Função para buscar endereço pelo CEP usando ViaCEP
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
        setError('CEP não encontrado');
        setCepValidated(false);
        return;
      }

      // Preenche os campos automaticamente (exceto complemento)
      formik.setFieldValue('address.address', data.logradouro || '');
      formik.setFieldValue('address.province', data.bairro || '');
      formik.setFieldValue('address.city', data.localidade || '');
      formik.setFieldValue('address.state', data.uf || '');
      // Não preenche o complemento automaticamente

      // Limpa erros se houver
      setError(null);

      // Marca o CEP como validado para habilitar os outros campos
      setCepValidated(true);

      // Marca os campos como tocados e valida
      formik.setTouched({
        ...formik.touched,
        address: {
          ...formik.touched.address,
          postal_code: true,
          address: true,
          province: true,
          city: true,
          state: true,
        },
      });

      // Valida os campos preenchidos
      await formik.validateField('address.address');
      await formik.validateField('address.province');
      await formik.validateField('address.city');
      await formik.validateField('address.state');
    } catch (err) {
      setError('Erro ao buscar CEP. Tente novamente.');
      setCepValidated(false);
      console.error('Erro ao buscar CEP:', err);
    } finally {
      setIsLoadingCEP(false);
    }
  };

  const handleCEPBlur = () => {
    formik.handleBlur({ target: { name: 'address.postal_code' } } as { target: { name: string } });
    const cep = formik.values.address.postal_code;
    if (cep.replace(/\D/g, '').length === 8) {
      fetchAddressByCEP(cep);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Stack spacing={3}>
            <TextField
              fullWidth
              id="name"
              name="name"
              label="Nome Completo"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
            <TextField
              fullWidth
              id="cpf"
              name="cpf"
              label="CPF"
              value={formik.values.cpf}
              onChange={(e) => {
                const formatted = formatCPF(e.target.value);
                formik.setFieldValue('cpf', formatted);
              }}
              onBlur={formik.handleBlur}
              error={formik.touched.cpf && Boolean(formik.errors.cpf)}
              helperText={formik.touched.cpf && formik.errors.cpf}
              placeholder="000.000.000-00"
              inputProps={{ maxLength: 14 }}
            />
            <TextField
              fullWidth
              id="mobile_phone"
              name="mobile_phone"
              label="Telefone"
              value={formik.values.mobile_phone}
              onChange={(e) => {
                const formatted = formatPhone(e.target.value);
                formik.setFieldValue('mobile_phone', formatted);
              }}
              onBlur={formik.handleBlur}
              error={formik.touched.mobile_phone && Boolean(formik.errors.mobile_phone)}
              helperText={formik.touched.mobile_phone && formik.errors.mobile_phone}
              placeholder="(00) 00000-0000"
              inputProps={{ maxLength: 15 }}
            />
          </Stack>
        );
      case 1:
        return (
          <Stack spacing={3}>
            <TextField
              fullWidth
              id="postal_code"
              name="address.postal_code"
              label="CEP"
              value={formik.values.address.postal_code}
              onChange={(e) => {
                const formatted = formatCEP(e.target.value);
                formik.setFieldValue('address.postal_code', formatted);
              }}
              onBlur={handleCEPBlur}
              error={
                formik.touched.address?.postal_code && Boolean(formik.errors.address?.postal_code)
              }
              helperText={
                formik.touched.address?.postal_code && formik.errors.address?.postal_code
                  ? formik.errors.address.postal_code
                  : isLoadingCEP
                    ? 'Buscando endereço...'
                    : ''
              }
              disabled={isLoadingCEP}
              InputProps={{
                endAdornment: isLoadingCEP ? (
                  <InputAdornment position="end">
                    <CircularProgress size={20} />
                  </InputAdornment>
                ) : null,
              }}
              inputProps={{ maxLength: 8 }}
              placeholder="00000000"
            />
            <TextField
              fullWidth
              id="address"
              name="address.address"
              label="Endereço"
              value={formik.values.address.address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.address && Boolean(formik.errors.address?.address)}
              helperText={formik.touched.address && formik.errors.address?.address}
              disabled={!cepValidated}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                id="number"
                name="address.number"
                label="Número"
                value={formik.values.address.number}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.address?.number && Boolean(formik.errors.address?.number)}
                helperText={formik.touched.address?.number && formik.errors.address?.number}
                disabled={!cepValidated}
              />
              <TextField
                fullWidth
                id="complement"
                name="address.complement"
                label="Complemento"
                value={formik.values.address.complement}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.address?.complement && Boolean(formik.errors.address?.complement)
                }
                helperText={formik.touched.address?.complement && formik.errors.address?.complement}
                disabled={!cepValidated}
              />
            </Stack>
            <TextField
              fullWidth
              id="province"
              name="address.province"
              label="Bairro"
              value={formik.values.address.province}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.address?.province && Boolean(formik.errors.address?.province)}
              helperText={formik.touched.address?.province && formik.errors.address?.province}
              disabled={!cepValidated}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                id="city"
                name="address.city"
                label="Cidade"
                value={formik.values.address.city}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.address?.city && Boolean(formik.errors.address?.city)}
                helperText={formik.touched.address?.city && formik.errors.address?.city}
                disabled={!cepValidated}
              />
              <TextField
                fullWidth
                id="state"
                name="address.state"
                label="Estado (UF)"
                value={formik.values.address.state}
                onChange={(e) => {
                  formik.setFieldValue('address.state', e.target.value.toUpperCase().slice(0, 2));
                }}
                onBlur={formik.handleBlur}
                error={formik.touched.address?.state && Boolean(formik.errors.address?.state)}
                helperText={formik.touched.address?.state && formik.errors.address?.state}
                inputProps={{ maxLength: 2 }}
                disabled={!cepValidated}
              />
            </Stack>
          </Stack>
        );
      case 2:
        return (
          <Stack spacing={2}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Revise seus dados antes de confirmar:
            </Typography>
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                Dados Pessoais:
              </Typography>
              <Typography variant="body2">Nome: {formik.values.name}</Typography>
              <Typography variant="body2">CPF: {displayCPF(formik.values.cpf)}</Typography>
              <Typography variant="body2">
                Telefone: {displayPhone(formik.values.mobile_phone)}
              </Typography>
            </Box>
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                Endereço:
              </Typography>
              <Typography variant="body2">
                {formik.values.address.address}, {formik.values.address.number}
                {formik.values.address.complement && ` - ${formik.values.address.complement}`}
              </Typography>
              <Typography variant="body2">
                {formik.values.address.province} - {formik.values.address.city} /{' '}
                {formik.values.address.state}
              </Typography>
              <Typography variant="body2">CEP: {formik.values.address.postal_code}</Typography>
            </Box>
          </Stack>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: 'blur(4px)',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
          },
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '90%',
          maxWidth: 600,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          pt: 5,
          outline: 'none',
          opacity: open ? 1 : 0,
          transform: open ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.9)',
          transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
      >
        <Stack spacing={3}>
          {/* Logo e botão fechar */}
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="flex-start"
            position="relative"
          >
            <Box
              component="img"
              src="/images/logo.png"
              alt="Logotipo Logani"
              sx={{ height: '35px', width: 'auto' }}
            />
            <IconButton
              onClick={handleClose}
              size="small"
              sx={{
                color: 'text.secondary',
                position: 'absolute',
                right: 0,
                top: 0,
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>

          {/* Título */}
          <Typography
            variant="h5"
            component="h2"
            sx={{
              fontWeight: 500,
              textAlign: 'center',
              letterSpacing: '0.05em',
            }}
          >
            Cadastro de Cliente
          </Typography>

          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Mensagem de erro */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Conteúdo do step */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>

          {/* Botões de navegação */}
          <Stack direction="row" justifyContent="space-between" spacing={2}>
            <Button
              onClick={activeStep === 0 ? handleClose : handleBack}
              disabled={isLoading}
              variant="outlined"
            >
              {activeStep === 0 ? 'Cancelar' : 'Voltar'}
            </Button>
            {activeStep === steps.length - 1 ? (
              <Button
                onClick={() => formik.handleSubmit()}
                variant="contained"
                disabled={isLoading}
                sx={{
                  bgcolor: 'text.primary',
                  '&:hover': {
                    bgcolor: 'text.secondary',
                  },
                }}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Confirmar'}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                variant="contained"
                sx={{
                  bgcolor: 'text.primary',
                  '&:hover': {
                    bgcolor: 'text.secondary',
                  },
                }}
              >
                Próximo
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
};

export default ClientRegistrationModal;
