import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import customerReducer from './slices/customerSlice';
import productReducer from './slices/productSlice';
import invoiceReducer from './slices/invoiceSlice';
import dcReducer from './slices/dcSlice';
import userReducer from './slices/userSlice';
import companyReducer from './slices/companySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    customers: customerReducer,
    products: productReducer,
    invoices: invoiceReducer,
    dcs: dcReducer,
    users: userReducer,
    companies: companyReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
