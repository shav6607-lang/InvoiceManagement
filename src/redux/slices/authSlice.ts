import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  // Fields from API userDetails
  UserId?: number;
  UserName?: string;
  RoleId?: number;
  RoleName?: string;
  DisplayName?: string;
  CompanyName?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const getInitialUser = (): User | null => {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) return null;
  try {
    return JSON.parse(storedUser);
  } catch {
    return null;
  }
};

// Validate token: must exist and be non-empty
const getInitialToken = (): string | null => {
  const t = localStorage.getItem('token');
  return t && t.trim() !== '' ? t : null;
};

const initialToken = getInitialToken();

// If no valid token found on load, clear any stale user data
if (!initialToken) {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

const initialState: AuthState = {
  user: initialToken ? getInitialUser() : null,
  token: initialToken,
  isAuthenticated: !!initialToken,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
