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
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setCredentials } from '@/redux/slices/authSlice';
import { authApi } from '@/services/api';
import { extractAccessToken, extractUserDetails, mapLoginUser } from '@/utils/auth';
import { getErrorMessage } from '@/utils/errors';
import { ROUTES } from '@/constants';
import { keyframes } from '@mui/system';

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
      navigate(ROUTES.DASHBOARD, { replace: true });
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
      const response = await authApi.login(data.username, data.password);
      const accessToken = extractAccessToken(response);
      const userDetails = extractUserDetails(response);

      if (accessToken.trim() !== '') {
        dispatch(setCredentials({
          user: mapLoginUser(userDetails, data.username),
          token: accessToken,
        }));
        navigate(ROUTES.DASHBOARD);
      } else {
        setError(response.Message ?? response.message ?? 'Invalid username or password.');
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Login failed. Please check server or network.'));
    } finally {
      setLoading(false);
    }
  };
 const nameAnimation = keyframes`
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.07);
    filter: blur(1px);
  }

  60% {
    opacity: 1;
    transform: translateY(-4px) scale(1.15);
    filter: blur(0);
  }

  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
`;

  return (
    <Box sx={{ width: '100%', maxWidth: 440, px: { xs: 0, sm: 2 } }}>
      <Card
        elevation={0}
        sx={{
          border: '1px solid rgba(255,255,255,0.22)',
          borderRadius: 2,
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow:
            '0 8px 32px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.20)',
          overflow: 'visible',
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                letterSpacing: '0.3px',
                mb: 0.5,
              }}
            >
              Welcome Back
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Please enter your credentials to access the system
            </Typography>
          </Box>

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
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0.3 } }}
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
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0.3 } }}
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
                borderRadius: 0.3,
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
    variant="caption"
    color="text.secondary"
    sx={{ display: 'block', mb: 0.5 }}
  >
    Developed & Maintained By
  </Typography>

  <Typography
    variant="body2"
    sx={{
      fontWeight: 700,
     color: '#3949AB',
      letterSpacing: '0.3px',
      animation: `${nameAnimation} 1.5s ease-out forwards`,
    }}
  >
    Sharath Vadivelu
  </Typography>
</Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
