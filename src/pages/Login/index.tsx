import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setCredentials } from '../../redux/slices/authSlice';
import { invoiceAPI } from '../../services/api';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await invoiceAPI.login(data.username, data.password);
      const respData = response || {};
      const accessToken: string =
        respData.access_token ??
        respData.accessToken ??
        respData.token ??
        respData.data?.access_token ??
        respData.data?.token ??
        '';
      const userDetails =
        respData.userDetails ?? respData.user ?? respData.data?.userDetails ?? respData.data?.user;

      // ✅ Only allow dashboard if a real non-empty token is returned
      if (accessToken && accessToken.trim() !== '') {
        dispatch(setCredentials({
          user: {
            id: String(userDetails?.UserId ?? ''),
            name: userDetails?.DisplayName ?? userDetails?.UserName ?? data.username,
            email: '',
            role: userDetails?.RoleName ?? 'user',
            UserId: userDetails?.UserId,
            UserName: userDetails?.UserName,
            RoleId: userDetails?.RoleId,
            RoleName: userDetails?.RoleName,
            DisplayName: userDetails?.DisplayName,
            CompanyName: userDetails?.CompanyName,
          },
          token: accessToken,
        }));
        navigate('/');
      } else {
        // ❌ API returned 200 but access_token is empty → invalid credentials
        setError(respData.Message || respData.message || 'Invalid username or password.');
      }
    } catch (err: any) {
      const serverMessage =
        err?.response?.data?.Message ||
        err?.response?.data?.message ||
        err?.message;
      setError(serverMessage || 'Login failed. Please check server or network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 440, px: { xs: 0, sm: 2 } }}>
      <Card
        elevation={0}
        sx={{
          border: '1px solid rgba(255,255,255,0.22)',
          borderRadius: 4,
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow:
            '0 8px 32px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.20)',
          overflow: 'visible',
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>


          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Username"
                  id="login-username"
                  fullWidth
                  margin="normal"
                  error={!!errors.username}
                  helperText={errors.username?.message}
                  autoFocus
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              )}
            />
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Password"
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  margin="normal"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  slotProps={{ input: { endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ) } }}
                />
              )}
            />
            <Button
              id="login-submit-btn"
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 700,
                fontSize: '1rem',
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                boxShadow: '0 4px 15px rgba(124,58,237,0.35)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #6d28d9, #4338ca)',
                  boxShadow: '0 6px 20px rgba(124,58,237,0.45)',
                },
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Developer Credit */}
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', fontSize: '0.78rem', lineHeight: 1.5, letterSpacing: '0.3px' }}
            >
              Developed by
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.5px', lineHeight: 1.5 }}
            >
              Sharath{' '}
              <Box
                component="span"
                sx={{ color: '#e53935', fontWeight: 900, fontSize: '0.95rem', letterSpacing: '1px' }}
              >
                Vadivelu
              </Box>
            </Typography>
          </Box>

        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
