import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { DCAPI } from '../../services/api';

// Exact match to API response structure
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
      console.log('🔍 [fetchDCs] Starting API call...');
      const data = await DCAPI.GetDCList();
      console.log('✅ [fetchDCs] API response received');
      console.log('✅ [fetchDCs] Response type:', typeof data);
      console.log('✅ [fetchDCs] Is array?:', Array.isArray(data));
      console.log('✅ [fetchDCs] Data length:', Array.isArray(data) ? data.length : 'N/A');
      console.log('✅ [fetchDCs] Full response:', data);
      
      // Handle case where API wraps data in a response object
      let dcArray = data;
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        // If it's wrapped, try to extract array from common properties
        if (data.data && Array.isArray(data.data)) {
          console.log('⚠️ [fetchDCs] Data was wrapped in .data property');
          dcArray = data.data;
        } else if (data.result && Array.isArray(data.result)) {
          console.log('⚠️ [fetchDCs] Data was wrapped in .result property');
          dcArray = data.result;
        } else {
          console.error('❌ [fetchDCs] Response is not array and no wrapping property found');
          return rejectWithValue('Invalid API response format');
        }
      }
      
      console.log('✅ [fetchDCs] Returning array with length:', dcArray.length);
      return dcArray;
    } catch (error: any) {
      console.error('❌ [fetchDCs] Error:', error);
      console.error('❌ [fetchDCs] Error message:', error.message);
      console.error('❌ [fetchDCs] Error response:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch DCs');
    }
  }
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
        console.log('⏳ [fetchDCs.pending] Loading DCs...');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDCs.fulfilled, (state, action) => {
        console.log('✅ [fetchDCs.fulfilled] DCs loaded successfully');
        console.log('✅ [fetchDCs.fulfilled] Received', action.payload.length, 'DCs');
        console.log('✅ [fetchDCs.fulfilled] Payload:', action.payload);
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchDCs.rejected, (state, action) => {
        console.log('❌ [fetchDCs.rejected] Failed to load DCs');
        console.log('❌ [fetchDCs.rejected] Error:', action.payload);
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = dcSlice.actions;

export const deleteDC = (id: number) => async (dispatch: any) => {
  try {
    await DCAPI.DeleteDC(id);
    // Refresh the list after deletion
    dispatch(fetchDCs());
  } catch (error: any) {
    console.error('Delete error:', error);
  }
};

export default dcSlice.reducer;
