import * as yup from 'yup';
import { useState } from 'react';
import { useFormik } from 'formik';
import { motion, AnimatePresence } from 'framer-motion';

import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
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
  CircularProgress,
} from '@mui/material';

import { login, register, saveAuthData } from '../../services/api.ts';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

const getValidationSchema = (mode: 'login' | 'register') => {
  const baseSchema = {
    email: yup.string().email('Email inválido').required('Email é obrigatório'),
    password: yup
      .string()
      .min(6, 'Senha deve ter no mínimo 6 caracteres')
      .required('Senha é obrigatória'),
  };

  if (mode === 'register') {
    return yup.object({
      name: yup.string().required('Nome é obrigatório'),
      ...baseSchema,
    });
  }

  return yup.object(baseSchema);
};

const LoginModal = ({ open, onClose }: LoginModalProps) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
    },
    validationSchema: getValidationSchema(mode),
    onSubmit: async (values) => {
      setIsLoading(true);
      setError(null);

      try {
        if (mode === 'register') {
          const response = await register({
            name: values.name,
            email: values.email,
            password: values.password,
          });

          console.log('Cadastro realizado com sucesso:', response);

          // Salva os dados de autenticação no localStorage
          if (response.data) {
            saveAuthData(response.data);
          }

          // Mostra mensagem de sucesso
          setSuccessMessage('Cadastro realizado com sucesso!');

          // Fecha o modal após um delay para o usuário ver a mensagem
          setTimeout(() => {
            onClose();
            formik.resetForm();
            setSuccessMessage(null);
            setMode('login'); // Volta para o modo de login após cadastro
          }, 2000);
        } else {
          const response = await login({
            email: values.email,
            password: values.password,
          });

          console.log('Login realizado com sucesso:', response);

          // Salva os dados de autenticação no localStorage
          if (response.data) {
            saveAuthData(response.data);
          }

          // Mostra mensagem de sucesso
          setSuccessMessage('Login realizado com sucesso!');

          // Fecha o modal após um delay para o usuário ver a mensagem
          setTimeout(() => {
            onClose();
            formik.resetForm();
            setSuccessMessage(null);
          }, 2000);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : mode === 'register'
              ? 'Erro ao fazer cadastro. Tente novamente.'
              : 'Erro ao fazer login. Tente novamente.'
        );
      } finally {
        setIsLoading(false);
      }
    },
    enableReinitialize: true,
  });

  const handleModeSwitch = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    formik.resetForm();
  };

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
                {mode === 'login' ? 'Entrar' : 'Cadastrar'}
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
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  )}
                  {successMessage && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                      {successMessage}
                    </Alert>
                  )}
                  <AnimatePresence>
                    {mode === 'register' && (
                      <motion.div
                        key="name-field"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        style={{ overflow: 'visible', marginTop: 0 }}
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
                          disabled={!!successMessage}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
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
                    disabled={!!successMessage}
                  />
                  <TextField
                    fullWidth
                    id="password"
                    name="password"
                    label="Senha"
                    type="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.password && Boolean(formik.errors.password)}
                    helperText={formik.touched.password && formik.errors.password}
                    disabled={!!successMessage}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={isLoading}
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
                    {isLoading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : mode === 'login' ? (
                      'Entrar'
                    ) : (
                      'Cadastrar'
                    )}
                  </Button>
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                      {mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
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
                      {mode === 'login' ? 'Cadastre-se' : 'Fazer login'}
                    </Link>
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
