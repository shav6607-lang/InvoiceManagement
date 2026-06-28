import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dcApi } from '@/services/api';
import { getErrorMessage, unwrapArrayResponse } from '@/utils/errors';
import { isAuthenticationRequiredError } from '@/utils/authErrors';
import type { AppDispatch } from '../store';

export interface DCItem {
  productId: string;
  productName: string;
  hsnCode: string;
  Qty: number;
  RatePerUnit: number;
  Unit: string;
  Disc: number;
  TaxAmount: number;
}

export interface DC {
  SlNo: number;
  CompanyId: number;
  DCNo: string;
  DCDate: string;
  VehicleNo: string;
  CGST: number;
  SGST: number;
  IGST: number;
  TaxAmount: number;
  TotalAmount: number;
  IsActive: boolean;
  CreatedBy: number;
  CreatedOn: string;
  JsonDCDetails: DCItem[];
}

interface DCState {
  data: DC[];
  loading: boolean;
  error: string | null;
}

const initialState: DCState = {
  data: [],
  loading: false,
  error: null,
};

export const fetchDCs = createAsyncThunk(
  'dcs/fetchDCs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dcApi.getList();
      const dcArray = unwrapArrayResponse<DC>(response);
      if (!Array.isArray(response) && dcArray.length === 0 && response && typeof response === 'object') {
        return rejectWithValue('Invalid API response format');
      }
      return dcArray;
    } catch (error) {
      if (isAuthenticationRequiredError(error)) {
        return rejectWithValue('');
      }
      return rejectWithValue(getErrorMessage(error, 'Failed to fetch delivery challans'));
    }
  },
);

export const deleteDC = createAsyncThunk(
  'dcs/deleteDC',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      await dcApi.delete(id);
      dispatch(fetchDCs());
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to delete delivery challan'));
    }
  },
);

const dcSlice = createSlice({
  name: 'dcs',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDCs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDCs.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchDCs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteDC.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = dcSlice.actions;

/** @deprecated Use deleteDC thunk directly */
export const deleteDCAction = (id: number) => (dispatch: AppDispatch) => dispatch(deleteDC(id));

export default dcSlice.reducer;
