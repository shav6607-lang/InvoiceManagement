import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  username: string;
  password?: string; // Stored here for mock purposes only
  role: string;
  company: string;
  email: string;
}

interface UserState {
  users: User[];
}

const initialState: UserState = {
  users: [
    {
      id: '1',
      username: 'admin',
      password: 'admin123',
      role: 'Admin',
      company: 'StoneCrush Industries',
      email: 'admin@stonecrush.com',
    },
    {
      id: '2',
      username: 'manager',
      password: 'password',
      role: 'Manager',
      company: 'StoneCrush Industries',
      email: 'manager@stonecrush.com',
    },
  ],
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    addUser: (state, action: PayloadAction<User>) => {
      state.users.push(action.payload);
    },
    updateUser: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex((u) => u.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
    deleteUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter((u) => u.id !== action.payload);
    },
  },
});

export const { addUser, updateUser, deleteUser } = userSlice.actions;
export default userSlice.reducer;
