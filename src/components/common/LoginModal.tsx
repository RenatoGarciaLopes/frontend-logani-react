import * as yup from 'yup';
import { useFormik } from 'formik';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState, useEffect, useCallback } from 'react';

import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {
  Box,
  Link,
  Alert,
  Modal,
  Stack,
  Button,
  Backdrop,
  TextField,
  Typography,
  InputAdornment,
  CircularProgress,
} from '@mui/material';

import {
  login,
  register,
  saveAuthData,
  resetPassword,
  forgotPassword,
} from '../../services/api.ts';

export type LoginModalMode = 'login' | 'register' | 'forgotPassword' | 'resetPassword';

type FormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  initialMode?: LoginModalMode;
  resetToken?: string | null;
  onModeChange?: (mode: LoginModalMode) => void;
}

const getValidationSchema = (mode: LoginModalMode) => {
  const emailSchema = yup.string().email('Email inválido').required('Email é obrigatório');
  const passwordSchema = yup
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .matches(/[A-Z]/, 'Senha deve conter ao menos uma letra maiúscula')
    .matches(/\d/, 'Senha deve conter ao menos um dígito numérico')
    .matches(/[^A-Za-z0-9]/, 'Senha deve incluir ao menos um caractere especial')
    .required('Senha é obrigatória');

  switch (mode) {
    case 'register':
      return yup.object({
        name: yup.string().required('Nome é obrigatório'),
        email: emailSchema,
        password: passwordSchema,
      });
    case 'forgotPassword':
      return yup.object({
        email: emailSchema,
      });
    case 'resetPassword':
      return yup.object({
        password: passwordSchema,
        confirmPassword: yup
          .string()
          .oneOf([yup.ref('password')], 'As senhas devem ser iguais')
          .required('Confirmação de senha é obrigatória'),
      });
    case 'login':
    default:
      return yup.object({
        email: emailSchema,
        password: passwordSchema,
      });
  }
};

const LoginModal = ({
  open,
  onClose,
  initialMode = 'login',
  resetToken = null,
  onModeChange,
}: LoginModalProps) => {
  const [mode, setMode] = useState<LoginModalMode>(initialMode);
  const [currentResetToken, setCurrentResetToken] = useState<string | null>(resetToken);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleModeUpdate = useCallback(
    (nextMode: LoginModalMode) => {
      if (mode === nextMode) {
        return;
      }
      setMode(nextMode);
      onModeChange?.(nextMode);
    },
    [mode, onModeChange]
  );

  useEffect(() => {
    handleModeUpdate(initialMode);
  }, [initialMode, handleModeUpdate]);

  useEffect(() => {
    setCurrentResetToken(resetToken);
  }, [resetToken]);

  const validationSchema = useMemo(() => getValidationSchema(mode), [mode]);

  const formik = useFormik<FormValues>({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      try {
        switch (mode) {
          case 'register': {
            const response = await register({
              name: values.name,
              email: values.email,
              password: values.password,
            });

            console.log('Cadastro realizado com sucesso:', response);

            if (response.data) {
              saveAuthData(response.data);
            }

            setSuccessMessage('Cadastro realizado com sucesso!');

            setTimeout(() => {
              onClose();
              formik.resetForm();
              setSuccessMessage(null);
              handleModeUpdate('login');
            }, 2000);
            break;
          }
          case 'forgotPassword': {
            await forgotPassword({
              email: values.email,
            });

            setSuccessMessage('Clique no link no seu email');
            formik.resetForm();
            break;
          }
          case 'resetPassword': {
            if (!currentResetToken) {
              throw new Error(tokenMessage);
            }

            await resetPassword({
              token: currentResetToken,
              password: values.password,
            });

            setSuccessMessage('Senha redefinida com sucesso!');
            setTimeout(() => {
              formik.resetForm();
              setSuccessMessage(null);
              setCurrentResetToken(null);
              handleModeUpdate('login');
              onClose();
            }, 2000);
            break;
          }
          case 'login':
          default: {
            const response = await login({
              email: values.email,
              password: values.password,
            });

            console.log('Login realizado com sucesso:', response);

            if (response.data) {
              saveAuthData(response.data);
            }

            setSuccessMessage('Login realizado com sucesso!');

            setTimeout(() => {
              onClose();
              formik.resetForm();
              setSuccessMessage(null);
            }, 2000);
            break;
          }
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : mode === 'register'
              ? 'Erro ao fazer cadastro. Tente novamente.'
              : mode === 'forgotPassword'
                ? 'Erro ao solicitar redefinição de senha. Tente novamente.'
                : mode === 'resetPassword'
                  ? 'Erro ao redefinir senha. Tente novamente.'
                  : 'Erro ao fazer login. Tente novamente.'
        );
      } finally {
        setIsLoading(false);
      }
    },
    enableReinitialize: true,
  });

  const resetFormState = useCallback(() => {
    formik.resetForm();
    setError(null);
    setSuccessMessage(null);
    setShowPassword(false);
  }, [formik]);

  useEffect(() => {
    if (!open) {
      return;
    }
    resetFormState();
  }, [mode, open, resetFormState]);

  const handleModeSwitch = () => {
    const nextMode = mode === 'login' ? 'register' : 'login';
    resetFormState();
    handleModeUpdate(nextMode);
  };

  const handleForgotPasswordClick = () => {
    resetFormState();
    handleModeUpdate('forgotPassword');
  };

  const handleBackToLogin = () => {
    resetFormState();
    handleModeUpdate('login');
    setCurrentResetToken(null);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const tokenMessage = 'Token inválido ou expirado. Solicite uma nova redefinição.';

  useEffect(() => {
    if (mode !== 'resetPassword') {
      return;
    }

    if (!currentResetToken) {
      setError((prev) => (prev === tokenMessage ? prev : tokenMessage));
    } else if (error === tokenMessage) {
      setError(null);
    }
  }, [mode, currentResetToken, error]);

  const passwordLabel = mode === 'resetPassword' ? 'Nova senha' : 'Senha';
  const submitLabel = (() => {
    switch (mode) {
      case 'register':
        return 'Cadastrar';
      case 'forgotPassword':
        return 'Enviar';
      case 'resetPassword':
        return 'Redefinir senha';
      case 'login':
      default:
        return 'Entrar';
    }
  })();

  const titleLabel = (() => {
    switch (mode) {
      case 'register':
        return 'Cadastrar';
      case 'forgotPassword':
        return 'Recuperar senha';
      case 'resetPassword':
        return 'Redefinir senha';
      case 'login':
      default:
        return 'Entrar';
    }
  })();

  const isEmailFieldVisible = mode !== 'resetPassword';
  const isPasswordFieldVisible =
    mode === 'login' || mode === 'register' || mode === 'resetPassword';
  const showForgotPasswordLink = mode === 'login' && !successMessage;
  const isSubmitDisabled =
    isLoading || !!successMessage || (mode === 'resetPassword' && !currentResetToken);
  const areFieldsDisabled = !!successMessage || (mode === 'resetPassword' && !currentResetToken);

  return (
    <Modal
      open={open}
      onClose={onClose}
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
          maxWidth: 400,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          pt: 5,
          outline: 'none',
          opacity: open ? 1 : 0,
          transform: open ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.9)',
          transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
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
              onClick={onClose}
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
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
            >
              <Typography
                variant="h5"
                component="h2"
                sx={{
                  fontWeight: 500,
                  textAlign: 'center',
                  letterSpacing: '0.05em',
                }}
              >
                {titleLabel}
              </Typography>
            </motion.div>
          </AnimatePresence>

          {/* Formulário */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <form onSubmit={formik.handleSubmit}>
                <Stack spacing={3}>
                  {error && (
                    <Alert severity="error" sx={{ mb: 4 }}>
                      {error}
                    </Alert>
                  )}
                  {successMessage && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                      {successMessage}
                    </Alert>
                  )}
                  {(mode === 'forgotPassword' || mode === 'resetPassword') && (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {mode === 'forgotPassword'
                        ? 'Informe o e-mail cadastrado para receber o link de redefinição de senha.'
                        : 'Defina uma nova senha para acessar sua conta.'}
                    </Typography>
                  )}
                  <AnimatePresence>
                    {mode === 'register' && (
                      <motion.div
                        key="name-field"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        style={{ overflow: 'visible' }}
                      >
                        <TextField
                          fullWidth
                          id="name"
                          name="name"
                          label="Nome"
                          value={formik.values.name}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.name && Boolean(formik.errors.name)}
                          helperText={formik.touched.name && formik.errors.name}
                          disabled={areFieldsDisabled}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {isEmailFieldVisible && (
                    <TextField
                      fullWidth
                      id="email"
                      name="email"
                      label="Email"
                      type="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.email && Boolean(formik.errors.email)}
                      helperText={formik.touched.email && formik.errors.email}
                      disabled={areFieldsDisabled}
                    />
                  )}
                  {isPasswordFieldVisible && (
                    <TextField
                      fullWidth
                      id="password"
                      name="password"
                      label={passwordLabel}
                      type={showPassword ? 'text' : 'password'}
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.password && Boolean(formik.errors.password)}
                      helperText={formik.touched.password && formik.errors.password}
                      disabled={areFieldsDisabled}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowPassword}
                              edge="end"
                              disabled={areFieldsDisabled}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                  {mode === 'resetPassword' && (
                    <TextField
                      fullWidth
                      id="confirmPassword"
                      name="confirmPassword"
                      label="Confirme a nova senha"
                      type={showPassword ? 'text' : 'password'}
                      value={formik.values.confirmPassword}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)
                      }
                      helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                      disabled={areFieldsDisabled}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowPassword}
                              edge="end"
                              disabled={areFieldsDisabled}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                  {showForgotPasswordLink && (
                    <Box sx={{ textAlign: 'right' }}>
                      <Link
                        component="button"
                        type="button"
                        onClick={handleForgotPasswordClick}
                        sx={{
                          color: 'text.primary',
                          textDecoration: 'none',
                          fontSize: '0.85rem',
                          fontWeight: 500,
                          '&:hover': {
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        Esqueci minha senha
                      </Link>
                    </Box>
                  )}
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={isSubmitDisabled}
                    sx={{
                      mt: 2,
                      bgcolor: 'text.primary',
                      '&:hover': {
                        bgcolor: 'text.secondary',
                      },
                      '&:disabled': {
                        bgcolor: 'text.secondary',
                        opacity: 0.6,
                      },
                    }}
                  >
                    {isLoading ? <CircularProgress size={24} color="inherit" /> : submitLabel}
                  </Button>
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    {mode === 'login' && (
                      <>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                          Não tem uma conta?
                        </Typography>
                        <Link
                          component="button"
                          type="button"
                          onClick={handleModeSwitch}
                          sx={{
                            color: 'text.primary',
                            textDecoration: 'none',
                            fontWeight: 500,
                            '&:hover': {
                              textDecoration: 'underline',
                            },
                          }}
                        >
                          Cadastre-se
                        </Link>
                      </>
                    )}
                    {mode === 'register' && (
                      <>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                          Já tem uma conta?
                        </Typography>
                        <Link
                          component="button"
                          type="button"
                          onClick={handleModeSwitch}
                          sx={{
                            color: 'text.primary',
                            textDecoration: 'none',
                            fontWeight: 500,
                            '&:hover': {
                              textDecoration: 'underline',
                            },
                          }}
                        >
                          Fazer login
                        </Link>
                      </>
                    )}
                    {(mode === 'forgotPassword' || mode === 'resetPassword') && (
                      <>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                          {mode === 'forgotPassword'
                            ? 'Lembrou da senha?'
                            : 'Deseja acessar sua conta?'}
                        </Typography>
                        <Link
                          component="button"
                          type="button"
                          onClick={handleBackToLogin}
                          sx={{
                            color: 'text.primary',
                            textDecoration: 'none',
                            fontWeight: 500,
                            '&:hover': {
                              textDecoration: 'underline',
                            },
                          }}
                        >
                          Fazer login
                        </Link>
                      </>
                    )}
                  </Box>
                </Stack>
              </form>
            </motion.div>
          </AnimatePresence>
        </Stack>
      </Box>
    </Modal>
  );
};

export default LoginModal;
