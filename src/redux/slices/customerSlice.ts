import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Customer {
  id: string;
  name: string;
  gstin: string;
  address: string;
  phoneNumber: string;
  state: string;
  email: string;
}

interface CustomerState {
  customers: Customer[];
  loading: boolean;
  error: string | null;
}

// Mock initial data
const initialState: CustomerState = {
  customers: [
    {
      id: '1',
      name: 'ABC Constructions',
      gstin: '29ABCDE1234F1Z5',
      address: '123 Main St, Bangalore',
      phoneNumber: '9876543210',
      state: 'Karnataka',
      email: 'contact@abcconstructions.com',
    },
  ],
  loading: false,
  error: null,
};

const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    addCustomer: (state, action: PayloadAction<Customer>) => {
      state.customers.push(action.payload);
    },
    updateCustomer: (state, action: PayloadAction<Customer>) => {
      const index = state.customers.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.customers[index] = action.payload;
      }
    },
    deleteCustomer: (state, action: PayloadAction<string>) => {
      state.customers = state.customers.filter((c) => c.id !== action.payload);
    },
  },
});

export const { addCustomer, updateCustomer, deleteCustomer } = customerSlice.actions;
export default customerSlice.reducer;
