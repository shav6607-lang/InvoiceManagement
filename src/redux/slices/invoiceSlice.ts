import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { invoiceApi } from '@/services/api';
import type { ApiInvoice } from '@/types/api.types';
import { getErrorMessage } from '@/utils/errors';
import { isAuthenticationRequiredError } from '@/utils/authErrors';

export interface InvoiceItem {
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

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  consigneeName: string;
  consigneeAddress: string;
  consigneeGstin: string;
  consigneePhone: string;
  consigneeState: string;
  consigneeStateCode?: string;
  sameAsConsignee: boolean;
  buyerName: string;
  buyerAddress: string;
  buyerGstin: string;
  buyerPhone: string;
  buyerState: string;
  buyerStateCode?: string;
  deliveryNote: string;
  paymentTerms: string;
  buyerOrderNumber: string;
  buyerOrderDate: string;
  dispatchDocumentNumber: string;
  dispatchNoteDate: string;
  dispatchedThrough: string;
  destination: string;
  vehicleNumber: string;
  lrRrNumber: string;
  termsOfDelivery: string;
  urn?: boolean;
  weightmentNo?: string;
  cgstPer?: number;
  sgstPer?: number;
  igstPer?: number;
  taxPer?: number;
  items: InvoiceItem[];
  subTotal: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  grandTotal: number;
}

interface InvoiceState {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
}

const parseApiDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const [day, month, year] = dateStr.split('/');
  return year && month && day ? `${year}-${month}-${day}` : dateStr;
};

const mapApiResponseToInvoice = (apiData: ApiInvoice): Invoice => {
  const items: InvoiceItem[] = (apiData.JsonInvoiceDetails ?? []).map((item, idx) => {
    const quantity = item.Qty || 0;
    const rate = item.RatePerUnit || 0;
    const discount = item.Disc || 0;
    const lineAmount = quantity * rate;
    const discountedAmount = lineAmount - (lineAmount * discount) / 100;
    const itemCgst = (discountedAmount * (apiData.CGSTPer || 0)) / 100;
    const itemSgst = (discountedAmount * (apiData.SGSTPer || 0)) / 100;
    const itemIgst = (discountedAmount * (apiData.GSTPer || 0)) / 100;

    return {
      id: `${apiData.SlNo}-${idx}`,
      productId: item.productId,
      productName: item.productName,
      hsnCode: item.hsnCode,
      quantity,
      rate,
      unit: item.Unit,
      discountPercentage: discount,
      amount: item.TaxAmount ?? discountedAmount,
      taxableValue: item.TaxAmount ?? discountedAmount,
      cgst: itemCgst,
      sgst: itemSgst,
      igst: itemIgst,
      total: item.Total ?? discountedAmount + itemCgst + itemSgst + itemIgst,
    };
  });

  return {
    id: `invoice-${apiData.SlNo}`,
    invoiceNumber: apiData.InvoiceNo,
    invoiceDate: parseApiDate(apiData.InvoiceDate),
    consigneeName: apiData.BuyerName ?? '',
    consigneeAddress: apiData.BuyerAddress ?? '',
    consigneeGstin: apiData.GSTNo ?? '',
    consigneePhone: apiData.BuyerPhone ?? '',
    consigneeState: apiData.State ?? '',
    consigneeStateCode: apiData.StateCode ?? '',
    sameAsConsignee: true,
    buyerName: apiData.BuyerName ?? '',
    buyerAddress: apiData.BuyerAddress ?? '',
    buyerGstin: apiData.GSTNo ?? '',
    buyerPhone: apiData.BuyerPhone ?? '',
    buyerState: apiData.State ?? '',
    buyerStateCode: apiData.StateCode ?? '',
    deliveryNote: '',
    paymentTerms: '',
    buyerOrderNumber: '',
    buyerOrderDate: '',
    dispatchDocumentNumber: '',
    dispatchNoteDate: '',
    dispatchedThrough: apiData.DispatchThrough ?? '',
    destination: apiData.Destination ?? '',
    vehicleNumber: apiData.VehicleNo ?? '',
    lrRrNumber: '',
    termsOfDelivery: '',
    urn: apiData.URN ?? false,
    weightmentNo: apiData.WeightmentNo ?? '',
    cgstPer: apiData.CGST,
    sgstPer: apiData.SGST,
    igstPer: apiData.IGST,
    taxPer: apiData.Tax,
    items,
    subTotal: apiData.TaxAmount ?? 0,
    totalCgst: 0,
    totalSgst: 0,
    totalIgst: 0,
    grandTotal: apiData.TotalAmount ?? 0,
  };
};

export const fetchInvoices = createAsyncThunk(
  'invoices/fetchInvoices',
  async (_, { rejectWithValue }) => {
    try {
      const data = await invoiceApi.getList();
      if (!Array.isArray(data)) return [];
      return data.map((invoice: ApiInvoice) => mapApiResponseToInvoice(invoice));
    } catch (error) {
      if (isAuthenticationRequiredError(error)) {
        return rejectWithValue('');
      }
      return rejectWithValue(getErrorMessage(error, 'Failed to fetch invoices'));
    }
  },
);

const initialState: InvoiceState = {
  invoices: [],
  loading: false,
  error: null,
};

const invoiceSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    addInvoice: (state, action: PayloadAction<Invoice>) => {
      state.invoices.push(action.payload);
    },
    updateInvoice: (state, action: PayloadAction<Invoice>) => {
      const index = state.invoices.findIndex((i) => i.id === action.payload.id);
      if (index !== -1) {
        state.invoices[index] = action.payload;
      }
    },
    deleteInvoice: (state, action: PayloadAction<string>) => {
      state.invoices = state.invoices.filter((i) => i.id !== action.payload);
    },
    clearInvoiceError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload;
        state.error = null;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { addInvoice, updateInvoice, deleteInvoice, clearInvoiceError } = invoiceSlice.actions;
export default invoiceSlice.reducer;
