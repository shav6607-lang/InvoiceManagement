import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Company {
  id: string;
  name: string;
  address: string;
  gstNo: string;
  gstUinNo?: string;
  state: string;
  country: string;
  email: string;
  phone: string;
  bankDetails: string;
}

interface CompanyState {
  companies: Company[];
}

const initialState: CompanyState = {
  companies: [
    {
      id: '1',
      name: 'StoneCrush Industries',
      address: '456 Quarry Road, Industrial Area, Bengaluru - 560068',
      gstNo: '29STCRI1234F1Z5',
      state: 'KARNATAKA, Code : 29',
      country: 'India',
      email: 'info@stonecrush.com',
      phone: '9000000001',
      bankDetails: 'Bank: HDFC Bank\nAccount: 1234567890\nIFSC: HDFC0001234',
    },
  ],
};

const companySlice = createSlice({
  name: 'companies',
  initialState,
  reducers: {
    addCompany: (state, action: PayloadAction<Company>) => {
      state.companies.push(action.payload);
    },
    updateCompany: (state, action: PayloadAction<Company>) => {
      const index = state.companies.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.companies[index] = action.payload;
      }
    },
    deleteCompany: (state, action: PayloadAction<string>) => {
      state.companies = state.companies.filter((c) => c.id !== action.payload);
    },
  },
});

export const { addCompany, updateCompany, deleteCompany } = companySlice.actions;
export default companySlice.reducer;
