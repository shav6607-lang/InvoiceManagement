import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface DCItem {
  id: string;
  productId: string;
  productName: string;
  hsnCode: string;
  quantity: number;
  rate: number;
  unit: string;
  discountPercentage: number;
  amount: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

export interface DC {
  id: string;
  dcNumber: string;
  dcDate: string;
  
  // Consignee
  consigneeName: string;
  consigneeAddress: string;
  consigneeGstin: string;
  consigneePhone: string;
  consigneeState: string;
  consigneeStateCode: string;
  
  // Buyer
  sameAsBuyer: boolean;
  buyerName: string;
  buyerAddress: string;
  buyerGstin: string;
  buyerPhone: string;
  buyerState: string;
  buyerStateCode: string;
  
  // Details
  dispatchedThrough: string;
  destination: string;
  vehicleNumber: string;
  lrRrNumber: string;
  weightmentNumber: string;
  
  // Tax rates
  cgstPer: number;
  sgstPer: number;
  igstPer: number;
  taxPer: number;
  
  // Goods
  items: DCItem[];
  
  // Totals
  subTotal: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  grandTotal: number;
}

interface DCState {
  dcs: DC[];
  loading: boolean;
  error: string | null;
}

const initialState: DCState = {
  dcs: [],
  loading: false,
  error: null,
};

const dcSlice = createSlice({
  name: 'dcs',
  initialState,
  reducers: {
    addDC: (state, action: PayloadAction<DC>) => {
      state.dcs.push(action.payload);
    },
    updateDC: (state, action: PayloadAction<DC>) => {
      const index = state.dcs.findIndex((d) => d.id === action.payload.id);
      if (index !== -1) {
        state.dcs[index] = action.payload;
      }
    },
    deleteDC: (state, action: PayloadAction<string>) => {
      state.dcs = state.dcs.filter((d) => d.id !== action.payload);
    },
  },
});

export const { addDC, updateDC, deleteDC } = dcSlice.actions;
export default dcSlice.reducer;
