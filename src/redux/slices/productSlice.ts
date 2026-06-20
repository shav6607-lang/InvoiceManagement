import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Product {
  id: string;
  name: string;
  hsnCode: string;
  unit: string;
  gstPercentage: number;
  rate: number;
}

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

// Mock initial data
const initialState: ProductState = {
  products: [
    { id: '1', name: 'M-Sand', hsnCode: '2517', unit: 'Ton', gstPercentage: 5, rate: 800 },
    { id: '2', name: '12MM Jelly', hsnCode: '2517', unit: 'Ton', gstPercentage: 5, rate: 700 },
    { id: '3', name: '20MM Jelly', hsnCode: '2517', unit: 'Ton', gstPercentage: 5, rate: 650 },
    { id: '4', name: 'Dust', hsnCode: '2517', unit: 'Ton', gstPercentage: 5, rate: 400 },
  ],
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    addProduct: (state, action: PayloadAction<Product>) => {
      state.products.push(action.payload);
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.products.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
    },
    deleteProduct: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter((p) => p.id !== action.payload);
    },
  },
});

export const { addProduct, updateProduct, deleteProduct } = productSlice.actions;
export default productSlice.reducer;
