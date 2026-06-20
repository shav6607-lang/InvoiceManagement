import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { invoiceAPI } from '../../services/api';

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
  
  // Consignee
  consigneeName: string;
  consigneeAddress: string;
  consigneeGstin: string;
  consigneePhone: string;
  consigneeState: string;
  consigneeStateCode?: string;
  
  // Buyer
  sameAsConsignee: boolean;
  buyerName: string;
  buyerAddress: string;
  buyerGstin: string;
  buyerPhone: string;
  buyerState: string;
  buyerStateCode?: string;
  
  // Details
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
  
  // New fields
  urn?: boolean;
  weightmentNo?: string;
  cgstPer?: number;
  sgstPer?: number;
  igstPer?: number;
  taxPer?: number;
  
  // Goods
  items: InvoiceItem[];
  
  // Totals
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

// Helper function to convert API response to Invoice format
const mapApiResponseToInvoice = (apiData: any): Invoice => {
  // Parse DD/MM/YYYY date to YYYY-MM-DD format
  const parseDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
  };

  const items: InvoiceItem[] = (apiData.JsonInvoiceDetails || []).map((item: any, idx: number) => {
    const quantity = item.Qty || 0;
    const rate = item.RatePerUnit || 0;
    const discount = item.Disc || 0;
    
    // Calculate line item amount: Qty * Rate
    const lineAmount = quantity * rate;
    
    // Apply discount if any
    const discountedAmount = lineAmount - (lineAmount * discount / 100);
    
    // Line item tax amounts (will be calculated based on invoice-level tax rates)
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
      amount: item.TaxAmount || discountedAmount,
      taxableValue: item.TaxAmount || discountedAmount,
      cgst: itemCgst,
      sgst: itemSgst,
      igst: itemIgst,
      total: item.Total || (discountedAmount + itemCgst + itemSgst + itemIgst),
    };
  });

  // Calculate totals from items
  const subTotal = items.reduce((sum, item) => sum + item.taxableValue, 0);
  const totalCgst = items.reduce((sum, item) => sum + item.cgst, 0);
  const totalSgst = items.reduce((sum, item) => sum + item.sgst, 0);
  const totalIgst = items.reduce((sum, item) => sum + item.igst, 0);

  return {
    id: `invoice-${apiData.SlNo}-${Date.now()}`,
    invoiceNumber: apiData.InvoiceNo,
    invoiceDate: parseDate(apiData.InvoiceDate),
    consigneeName: apiData.BuyerName || '',
    consigneeAddress: apiData.BuyerAddress || '',
    consigneeGstin: apiData.GSTNo || '',
    consigneePhone: apiData.BuyerPhone || '',
    consigneeState: apiData.State || '',
    consigneeStateCode: apiData.StateCode || '',
    sameAsConsignee: true,
    buyerName: apiData.BuyerName || '',
    buyerAddress: apiData.BuyerAddress || '',
    buyerGstin: apiData.GSTNo || '',
    buyerPhone: apiData.BuyerPhone || '',
    buyerState: apiData.State || '',
    buyerStateCode: apiData.StateCode || '',
    deliveryNote: '',
    paymentTerms: '',
    buyerOrderNumber: '',
    buyerOrderDate: '',
    dispatchDocumentNumber: '',
    dispatchNoteDate: '',
    dispatchedThrough: apiData.DispatchThrough || '',
    destination: apiData.Destination || '',
    vehicleNumber: apiData.VehicleNo || '',
    lrRrNumber: '',
    termsOfDelivery: '',
    urn: apiData.URN || false,
    weightmentNo: apiData.WeightmentNo || '',
    cgstPer: apiData.CGSTPer,
    sgstPer: apiData.SGSTPer,
    igstPer: apiData.GSTPer,
    taxPer: apiData.TaxPer,
    items,
    subTotal,
    totalCgst,
    totalSgst,
    totalIgst,
    grandTotal: apiData.TotalAmount,
  };
};

// Async thunk for user login
export const loginUser = createAsyncThunk(
  'invoices/loginUser',
  async (credentials: { username: string; password: string }, { rejectWithValue, dispatch }) => {
    try {
      console.log('🔐 Logging in user:', credentials.username);
      const response = await invoiceAPI.login(credentials.username, credentials.password);
      
      // Extract token from response
      const token = response.token || response.accessToken || response.data?.token;
      
      if (!token) {
        console.error('❌ No token in login response:', response);
        return rejectWithValue('No token received from backend');
      }
      
      console.log('✅ Login successful, token received');
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Fetch invoices after successful login
      dispatch(fetchInvoices());
      
      return { token, user: response.user || response.data?.user };
    } catch (error: any) {
      console.error('❌ Login failed:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

// Async thunk for fetching invoices
export const fetchInvoices = createAsyncThunk(
  'invoices/fetchInvoices',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔍 Fetching invoices from API...');
      const data = await invoiceAPI.getInvoiceList();
      console.log('✅ API Response received:', data);
      
      if (!Array.isArray(data)) {
        console.warn('⚠️ API response is not an array:', data);
        return [];
      }
      
      const mappedData = data.map((invoice: any) => {
        console.log('📦 Mapping invoice:', invoice.InvoiceNo);
        return mapApiResponseToInvoice(invoice);
      });
      
      console.log('✨ Mapped invoices:', mappedData);
      return mappedData;
    } catch (error) {
      console.error('❌ Error fetching invoices:', error);
      return rejectWithValue('Failed to fetch invoices');
    }
  }
);

const initialState: InvoiceState = {
  invoices: [
    {
      id: 'mock-inv-1',
      invoiceNumber: 'INV/2026-27/1001',
      invoiceDate: '2026-06-10',
      consigneeName: 'ABC Constructions',
      consigneeAddress: '123 Main St, Bangalore, Karnataka',
      consigneeGstin: '29ABCDE1234F1Z5',
      consigneePhone: '9876543210',
      consigneeState: 'Karnataka',
      consigneeStateCode: '29',
      sameAsConsignee: true,
      buyerName: 'ABC Constructions',
      buyerAddress: '123 Main St, Bangalore, Karnataka',
      buyerGstin: '29ABCDE1234F1Z5',
      buyerPhone: '9876543210',
      buyerState: 'Karnataka',
      buyerStateCode: '29',
      deliveryNote: 'DN-9923',
      paymentTerms: '15 Days',
      buyerOrderNumber: 'PO-882',
      buyerOrderDate: '2026-06-08',
      dispatchDocumentNumber: 'LR-4421',
      dispatchNoteDate: '2026-06-10',
      dispatchedThrough: 'VRL Logistics',
      destination: 'Mangalore',
      vehicleNumber: 'KA-03-HA-8829',
      lrRrNumber: 'LR-4421',
      termsOfDelivery: 'Ex-Works',
      urn: true,
      weightmentNo: 'W-9923',
      cgstPer: 2.5,
      sgstPer: 2.5,
      igstPer: 0,
      taxPer: 5,
      items: [
        {
          id: 'item-1',
          productId: '1',
          productName: 'M-Sand',
          hsnCode: '2517',
          quantity: 24.5,
          rate: 800,
          unit: 'MTs',
          discountPercentage: 0,
          amount: 19600,
          taxableValue: 19600,
          cgst: 490,
          sgst: 490,
          igst: 0,
          total: 20580,
        },
      ],
      subTotal: 19600,
      totalCgst: 490,
      totalSgst: 490,
      totalIgst: 0,
      grandTotal: 20580,
    },
    {
      id: 'mock-inv-2',
      invoiceNumber: 'INV/2026-27/1002',
      invoiceDate: '2026-06-12',
      consigneeName: 'Sree Bala Builders',
      consigneeAddress: '45 G.N. Road, Chennai, Tamil Nadu',
      consigneeGstin: '33XYZDE5678A1ZA',
      consigneePhone: '9008877665',
      consigneeState: 'Tamil Nadu',
      consigneeStateCode: '33',
      sameAsConsignee: true,
      buyerName: 'Sree Bala Builders',
      buyerAddress: '45 G.N. Road, Chennai, Tamil Nadu',
      buyerGstin: '33XYZDE5678A1ZA',
      buyerPhone: '9008877665',
      buyerState: 'Tamil Nadu',
      buyerStateCode: '33',
      deliveryNote: 'DN-9944',
      paymentTerms: 'Immediate',
      buyerOrderNumber: 'PO-901',
      buyerOrderDate: '2026-06-11',
      dispatchDocumentNumber: 'LR-8821',
      dispatchNoteDate: '2026-06-12',
      dispatchedThrough: 'Sree Travels',
      destination: 'Chennai',
      vehicleNumber: 'TN-22-BY-4512',
      lrRrNumber: 'LR-8821',
      termsOfDelivery: 'FOB',
      urn: false,
      weightmentNo: 'W-9944',
      cgstPer: 0,
      sgstPer: 0,
      igstPer: 18,
      taxPer: 18,
      items: [
        {
          id: 'item-2',
          productId: '2',
          productName: '12MM Jelly',
          hsnCode: '2517',
          quantity: 15.0,
          rate: 700,
          unit: 'Ton',
          discountPercentage: 2,
          amount: 10500,
          taxableValue: 10290,
          cgst: 0,
          sgst: 0,
          igst: 1852.2,
          total: 12142.2,
        },
      ],
      subTotal: 10290,
      totalCgst: 0,
      totalSgst: 0,
      totalIgst: 1852.2,
      grandTotal: 12142.2,
    },
  ],
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log('⏳ loginUser.pending - Logging in...');
      })
      .addCase(loginUser.fulfilled, (state, _action) => {
        state.loading = false;
        console.log('✅ loginUser.fulfilled - User logged in successfully');
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        const errorMsg = action.payload as string;
        console.error('❌ loginUser.rejected - Error:', errorMsg);
        state.error = errorMsg;
      })
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log('⏳ fetchInvoices.pending - Loading started');
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        console.log('✅ fetchInvoices.fulfilled - Received', action.payload.length, 'invoices from API');
        state.invoices = action.payload.length > 0 ? action.payload : state.invoices;
        state.error = null;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        const errorMsg = action.payload as string;
        console.error('❌ fetchInvoices.rejected - Error:', errorMsg);
        console.error('💾 Keeping mock data as fallback. Count:', state.invoices.length);
        state.error = errorMsg;
        // Keep existing mock data as fallback
      });
  },
});

export const { addInvoice, updateInvoice, deleteInvoice } = invoiceSlice.actions;
export default invoiceSlice.reducer;
