import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  Tooltip,
  Alert,
} from '@mui/material';
import { Add, Delete, ArrowBack } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { v4 as uuidv4 } from 'uuid';


type Company = {
  CompanyId: number;
  Name: string;
  Address: string;
  GSTNO: string;
  GSTUINO: string;
  State: string;
  StateCode: string;
  Country: string;
  EMail: string;
  Phone: string;
  IsActive: boolean;
  BankName: string;
  BankAddress: string;
  AccNo: string;
  Branch: string;
  ISFC: string;
  HSNCode?: string;
  DCNum?: string;
};
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

const API_BASE = import.meta.env.VITE_API_BASE_URL ;
const genDCNo = () =>
  `DC/${new Date().getFullYear()}-${String(new Date().getFullYear() + 1).slice(2)}/${String(
    Math.floor(Math.random() * 9000 + 1000),
  )}`;

const numberToWords = (num: number): string => {
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven',
    'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const n = Math.floor(num);
  if (n === 0) return 'Zero Rupees Only';
  const convert = (x: number): string => {
    if (x < 20) return a[x];
    if (x < 100) return b[Math.floor(x / 10)] + (x % 10 ? ' ' + a[x % 10] : '');
    if (x < 1000) return a[Math.floor(x / 100)] + ' Hundred' + (x % 100 ? ' ' + convert(x % 100) : '');
    if (x < 100000) return convert(Math.floor(x / 1000)) + ' Thousand' + (x % 1000 ? ' ' + convert(x % 1000) : '');
    if (x < 10000000) return convert(Math.floor(x / 100000)) + ' Lakh' + (x % 100000 ? ' ' + convert(x % 100000) : '');
    return convert(Math.floor(x / 10000000)) + ' Crore' + (x % 10000000 ? ' ' + convert(x % 10000000) : '');
  };
  return 'INR ' + convert(n) + ' Rupees Only';
};

type FormData = {
  dcNumber: string;
  dcDate: string;
  vehicleNo: string;
};

const CreateDC: React.FC = () => {
  const navigate = useNavigate();
  //const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyHsnCode, setCompanyHsnCode] = useState<string>('');
  const [materials, setMaterials] = useState<any[]>([]);
  const [items, setItems] = useState<DCItem[]>([]);
  const [taxOption, setTaxOption] = useState<'none' | '5' | '18'>('none');
  const [zeroTaxRate, setZeroTaxRate] = useState<number>(0);
  const [cgstSgstRate, setCgstSgstRate] = useState<number>(5);
  const [igstRate, setIgstRate] = useState<number>(18);
  const [apiError, setApiError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const { control, handleSubmit, formState: { errors }, setValue } = useForm<FormData>({
    defaultValues: {
      //dcNumber: genDCNo(),
      dcNumber: '',
      dcDate: new Date().toISOString().split('T')[0],
      vehicleNo: '',
    },
  });

  useEffect(() => {
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    
    fetch(`${API_BASE}/Material/GetCompanies`, { headers })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.Data) && data.Data.length > 0) {
          const company = data.Data[0];
          setSelectedCompany(company);
          // Store and set DCNum from company
          if (company.DCNum) {
            setValue('dcNumber', company.DCNum);
          }
          // Store HSNCode from company
          if (company.HSNCode) {
            setCompanyHsnCode(company.HSNCode);
          }
        }
      })
      .catch(() => {
        setSelectedCompany(null);
      });

    fetch(`${API_BASE}/Material/GetList?companyId=1&materialType=2`, { headers })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.Data)) {
          setMaterials(data.Data);
        }
      })
      .catch(() => {
        setMaterials([]);
      });
  }, [token, setValue]);

  const recalcItem = useCallback((item: DCItem, tax: 'none' | '5' | '18', zeroRate: number, cgstSgstRateVal: number, igstRateVal: number): DCItem => {
    const amount = item.quantity * item.rate;
    const discount = (amount * item.discountPercentage) / 100;
    const taxableValue = amount - discount;
    
    let taxRate = 0;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    
    if (tax === 'none') {
      taxRate = zeroRate;
      const gstAmount = (taxableValue * taxRate) / 100;
      cgst = gstAmount / 2;
      sgst = gstAmount / 2;
    } else if (tax === '5') {
      taxRate = cgstSgstRateVal;
      const gstAmount = (taxableValue * taxRate) / 100;
      cgst = gstAmount / 2;
      sgst = gstAmount / 2;
    } else if (tax === '18') {
      taxRate = igstRateVal;
      const gstAmount = (taxableValue * taxRate) / 100;
      igst = gstAmount;
    }
    
    const totalGst = cgst + sgst + igst;
    return { ...item, amount, taxableValue, cgst, sgst, igst, total: taxableValue + totalGst };
  }, []);

  const updateItem = (id: string, field: string, value: any) => {
    setItems((prev) => prev.map((item) => {
      if (item.id !== id) return item;
      const normalizedValue = field === 'productId' ? String(value) : value;
      let updated = { ...item, [field]: normalizedValue } as DCItem;
      if (field === 'productId') {
        const mat = materials.find((m) => m.MaterialId === Number(normalizedValue));
        if (mat) {
          updated.productName = mat.MaterialName;
          updated.hsnCode =  companyHsnCode;
          updated.rate = mat.RatePerUnit || 0;
        }
      }
      return recalcItem(updated, taxOption, zeroTaxRate, cgstSgstRate, igstRate);
    }));
  };

  useEffect(() => {
    setItems((prev) => prev.map((item) => recalcItem(item, taxOption, zeroTaxRate, cgstSgstRate, igstRate)));
  }, [taxOption, zeroTaxRate, cgstSgstRate, igstRate, recalcItem]);

  const addItem = () => {
    setItems((prev) => [...prev, {
      id: uuidv4(),
      productId: '',
      productName: '',
      hsnCode: companyHsnCode,
      quantity: 1,
      rate: 0,
      unit: 'MTs',
      discountPercentage: 0,
      amount: 0,
      taxableValue: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      total: 0,
    }]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subTotal = items.reduce((sum, item) => sum + item.taxableValue, 0);
  const totalCgst = items.reduce((sum, item) => sum + item.cgst, 0);
  const totalSgst = items.reduce((sum, item) => sum + item.sgst, 0);
  const totalIgst = items.reduce((sum, item) => sum + item.igst, 0);
  const grandTotal = subTotal + totalCgst + totalSgst + totalIgst;

  const onSubmit = handleSubmit(async (data) => {
    setApiError(null);
    setSaving(true);

    let taxRate = 0;
    let cgstPer = 0;
    let sgstPer = 0;
    let igstPer = 0;

    if (taxOption === 'none') {
      taxRate = zeroTaxRate;
      cgstPer = zeroTaxRate / 2;
      sgstPer = zeroTaxRate / 2;
    } else if (taxOption === '5') {
      taxRate = cgstSgstRate;
      cgstPer = cgstSgstRate / 2;
      sgstPer = cgstSgstRate / 2;
    } else if (taxOption === '18') {
      taxRate = igstRate;
      igstPer = igstRate;
    }

    const payload = {
      Id: 0,
      DCNumber: data.dcNumber,
      DCDate: data.dcDate,
      VehicleNumber: data.vehicleNo,
      CgstPer: cgstPer,
      SgstPer: sgstPer,
      IgstPer: igstPer,
      TaxPer: taxRate,
      Items: items.map((item) => ({
        Id: item.id,
        ProductId: String(item.productId),
        ProductName: item.productName,
        HsnCode: item.hsnCode,
        Quantity: item.quantity,
        Rate: item.rate,
        Unit: item.unit,
        DiscountPercentage: item.discountPercentage,
        Amount: item.amount,
        TaxableValue: item.taxableValue,
        Cgst: item.cgst,
        Sgst: item.sgst,
        Igst: item.igst,
        Total: item.total,
      })),
      SubTotal: subTotal,
      TotalCgst: totalCgst,
      TotalSgst: totalSgst,
      TotalIgst: totalIgst,
      GrandTotal: grandTotal,
    };

    try {
      const response = await fetch(`${API_BASE}/DC/AddDC`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const text = await response.text();
      let responseData = null;
      try {
        responseData = text ? JSON.parse(text) : null;
      } catch {
        // ignore
      }
      if (!response.ok) {
        const message = responseData?.Message || responseData?.message || text || 'Failed to submit delivery challan.';
        throw new Error(message);
      }
      setSaveSuccess(true);
      setTimeout(() => navigate('/dc'), 1200);
    } catch (error: any) {
      setApiError(error?.message || 'Unable to submit delivery challan.');
    } finally {
      // setSaving(false);
    }
  });

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton onClick={() => navigate('/dc')} size="small" sx={{ bgcolor: 'white', boxShadow: 1 }}>
            <ArrowBack />
          </IconButton>
          <Typography sx={{ fontSize: '1.25rem', fontWeight: 700 }}>Create Delivery Challan</Typography>
        </Box>
      </Box>

      {apiError && <Alert severity="error" sx={{ mb: 2 }}>{apiError}</Alert>}
      {saveSuccess && <Alert severity="success" sx={{ mb: 2 }}>Delivery Challan submitted successfully. Redirecting…</Alert>}

       <Paper 
        sx={{ 
          mb: 3, 
          p: 1.5, 
          borderRadius: 2, 
          border: '1px solid #181a1e', 
          bgcolor: '#ffffff',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.04)'
        }}
      >
        {selectedCompany ? (
          <Box 
            sx={{ 
              display: 'grid', 
              gap: 2,
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } // Puts Company and Bank side-by-side on desktop
            }}
          >
            {/* Left: Company Details Block */}
            <Box sx={{ bgcolor: '#f8fafc', p: 1.5, borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
              <Typography
                sx={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#1e3a8a',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  mb: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'between'
                }}
              >
                Company Profile
                <Box component="span" sx={{ ml: 'auto', px: 1, py: 0.25, bgcolor: '#dbeafe', color: '#2563eb', borderRadius: 1, fontSize: '0.65rem' }}>INFO</Box>
              </Typography>
      
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', pb: 0.75 }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>Name</Typography>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f172a', textAlign: 'right' }}>{selectedCompany.Name}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', pb: 0.75 }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>Email</Typography>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f172a', textAlign: 'right', wordBreak: 'break-all' }}>{selectedCompany.EMail}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', pb: 0.75 }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>GST / UINO</Typography>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f172a', textAlign: 'right' }}>{selectedCompany.GSTNO || selectedCompany.GSTUINO || '—'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', pb: 0.75 }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>State / Code</Typography>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f172a', textAlign: 'right' }}>{selectedCompany.State} ({selectedCompany.StateCode})</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', pt: 0.25 }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mb: 0.25 }}>Address</Typography>
                  <Typography sx={{ fontSize: '0.725rem', fontWeight: 500, color: '#334155', lineHeight: 1.3 }}>{selectedCompany.Address}</Typography>
                </Box>
              </Box>
            </Box>
      
            {/* Right: Bank Details Block */}
            <Box sx={{ bgcolor: '#f8fafc', p: 1.5, borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
              <Typography
                sx={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#065f46',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  mb: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'between'
                }}
              >
                Bank Credentials
                <Box component="span" sx={{ ml: 'auto', px: 1, py: 0.25, bgcolor: '#d1fae5', color: '#059669', borderRadius: 1, fontSize: '0.65rem' }}>BANK</Box>
              </Typography>
      
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', pb: 0.75 }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>Bank Name</Typography>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f172a', textAlign: 'right' }}>{selectedCompany.BankName}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', pb: 0.75 }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>Branch</Typography>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f172a', textAlign: 'right' }}>{selectedCompany.Branch}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', pb: 0.75 }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>Account No</Typography>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a', textAlign: 'right', fontFamily: 'monospace' }}>{selectedCompany.AccNo}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', pb: 0.75 }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>IFSC Code</Typography>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a', textAlign: 'right', fontFamily: 'monospace' }}>{selectedCompany.ISFC}</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', pt: 0.25 }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mb: 0.25 }}>Bank Address</Typography>
                  <Typography sx={{ fontSize: '0.725rem', fontWeight: 500, color: '#334155', lineHeight: 1.3 }}>{selectedCompany.BankAddress}</Typography>
                </Box>
              </Box>
            </Box>
      
          </Box>
        ) : (
          <Box sx={{ py: 2, textAlign: 'center', color: 'text.secondary' }}>
            <Typography sx={{ fontSize: '0.75rem' }}>Loading details...</Typography>
          </Box>
        )}
      </Paper>

      <Paper 
  sx={{ 
    mb: 3, 
    p: 1.5, 
    borderRadius: 2, 
    border: '1px solid #e2e8f0', 
    bgcolor: '#ffffff',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.04)'
  }}
>
  <Typography
    sx={{
      fontSize: '0.85rem',
      fontWeight: 700,
      mb: 1.25,
      color: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      gap: 1,
    }}
  >
    <Box sx={{ width: 3, height: 12, bgcolor: '#f59e0b', borderRadius: 1 }} />
    Delivery Challan Details
  </Typography>

  <Box 
    sx={{ 
      display: 'grid', 
      gap: 1.25, 
      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' } 
    }}
  >
    <Controller 
      name="dcNumber" 
      control={control} 
      rules={{ required: 'DC number required' }} 
      render={({ field }) => (
        <TextField 
          {...field} 
          label="1. DC Number *" 
          fullWidth 
          size="small" 
          disabled
          error={!!errors.dcNumber} 
          helperText={errors.dcNumber?.message} 
          slotProps={{ htmlInput: { style: { fontSize: '0.825rem', padding: '7.5px 10px' } }, inputLabel: { style: { fontSize: '0.825rem' } } }}
        />
      )} 
    />
    
    <Controller 
      name="dcDate" 
      control={control} 
      rules={{ required: 'DC date required' }} 
      render={({ field }) => (
        <TextField 
          {...field} 
          label="2. DC Date *" 
          type="date" 
          fullWidth 
          size="small" 
          error={!!errors.dcDate} 
          helperText={errors.dcDate?.message} 
          slotProps={{ inputLabel: { shrink: true, style: { fontSize: '0.825rem' } }, htmlInput: { style: { fontSize: '0.825rem', padding: '7.5px 10px' } } }} 
        />
      )} 
    />
    
    <Controller 
      name="vehicleNo" 
      control={control} 
      render={({ field }) => (
        <TextField 
          {...field} 
          label="3. Vehicle Number" 
          fullWidth 
          size="small" 
          slotProps={{ htmlInput: { style: { fontSize: '0.825rem', padding: '7.5px 10px' } }, inputLabel: { style: { fontSize: '0.825rem' } } }}
        />
      )} 
    />
  </Box>
</Paper>



        <Paper 
       sx={{ 
         mb: 3, 
         p: 1.5, 
         borderRadius: 2, 
         border: '1px solid #e2e8f0',
         boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
         bgcolor: '#ffffff'
       }}
     >
       {/* Header Section */}
       <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
         <Box>
           <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
             <Box sx={{ width: 3, height: 12, bgcolor: '#2563eb', borderRadius: 1 }} />
             Description of Goods
           </Typography>
         </Box>
         <Button 
           variant="contained" 
           startIcon={<Add />} 
           size="small" 
           onClick={addItem} 
           sx={{ 
             bgcolor: '#2563eb', 
             fontSize: '0.75rem', 
             padding: '4px 10px',
             textTransform: 'none',
             '&:hover': { bgcolor: '#1e40af' } 
           }}
         >
           Add Row
         </Button>
       </Box>
     
       {/* Compact Goods Table */}
       <Box sx={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 1.5, mb: 2 }}>
         <Table size="small" sx={{ minWidth: 800 }}>
           <TableHead>
             <TableRow sx={{ bgcolor: '#f8fafc' }}>
               {['#', 'Material', 'HSN/SAC', 'Qty (MTs)', 'Rate (₹)', 'Disc %', 'Amount', 'Total', ''].map((heading) => (
                 <TableCell 
                   key={heading} 
                   sx={{ 
                     color: '#475569', 
                     fontWeight: 700, 
                     fontSize: '0.725rem', 
                     py: 1, 
                     px: 1.25,
                     borderBottom: '1px solid #e2e8f0' 
                   }}
                 >
                   {heading}
                 </TableCell>
               ))}
             </TableRow>
           </TableHead>
           <TableBody>
             {items.map((item, index) => (
               <TableRow key={item.id} sx={{ '&:hover': { bgcolor: '#f1f5f9' } }}>
                 <TableCell sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.75rem', py: 0.75, px: 1.25 }}>{index + 1}</TableCell>
                 
                 {/* 1. Material */}
                 <TableCell sx={{ minWidth: 160, py: 0.5, px: 1 }}>
                   <TextField
                     select
                     size="small"
                     fullWidth
                     value={item.productId}
                     onChange={(e) => updateItem(item.id, 'productId', e.target.value)}
                     slotProps={{ select: { style: { fontSize: '0.775rem', padding: '5px 8px' } } }}
                   >
                     {materials.map((mat) => (
                       <MenuItem key={mat.MaterialId} value={`${mat.MaterialId}`} sx={{ fontSize: '0.775rem' }}>
                         {mat.MaterialName}
                       </MenuItem>
                     ))}
                   </TextField>
                 </TableCell>
     
                 {/* 2. HSN/SAC */}
                 <TableCell sx={{ py: 0.5, px: 1 }}>
                   <Typography sx={{ color: '#475569', fontSize: '0.775rem' }}>{item.hsnCode || '—'}</Typography>
                 </TableCell>
     
                 {/* 3. Qty */}
                 <TableCell sx={{ width: 100, py: 0.5, px: 1 }}>
                   <TextField
                     size="small"
                     type="number"
                     value={item.quantity}
                     slotProps={{ htmlInput: { min: 0, step: 0.001, style: { textAlign: 'right', fontSize: '0.775rem', padding: '5px 8px' } } }}
                     onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                   />
                 </TableCell>
     
                 {/* 4. Rate */}
                 <TableCell sx={{ width: 110, py: 0.5, px: 1 }}>
                   <TextField
                     size="small"
                     type="number"
                     value={item.rate}
                     slotProps={{ htmlInput: { min: 0, step: 0.01, style: { textAlign: 'right', fontSize: '0.775rem', padding: '5px 8px' } } }}
                     onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                   />
                 </TableCell>
     
                 {/* 5. Disc % */}
                 <TableCell sx={{ width: 80, py: 0.5, px: 1 }}>
                   <TextField
                     size="small"
                     type="number"
                     value={item.discountPercentage}
                     slotProps={{ htmlInput: { min: 0, max: 100, step: 0.1, style: { textAlign: 'right', fontSize: '0.775rem', padding: '5px 8px' } } }}
                     onChange={(e) => updateItem(item.id, 'discountPercentage', parseFloat(e.target.value) || 0)}
                   />
                 </TableCell>
     
                 {/* 6. Amount */}
                 <TableCell sx={{ py: 0.5, px: 1.25 }}>
                   <Typography sx={{ fontWeight: 600, fontSize: '0.775rem', color: '#0f172a' }}>₹{item.taxableValue.toFixed(2)}</Typography>
                 </TableCell>
     
                 {/* 7. Total */}
                 <TableCell sx={{ py: 0.5, px: 1.25 }}>
                   <Typography sx={{ fontWeight: 700, fontSize: '0.775rem', color: '#2563eb' }}>₹{item.total.toFixed(2)}</Typography>
                 </TableCell>
     
                 {/* Actions */}
                 <TableCell sx={{ py: 0.5, px: 1 }}>
                   <Tooltip title="Remove row">
                     <IconButton size="small" color="error" onClick={() => removeItem(item.id)} sx={{ p: 0.25 }}>
                       <Delete sx={{ fontSize: '1rem' }} />
                     </IconButton>
                   </Tooltip>
                 </TableCell>
               </TableRow>
             ))}
             {items.length === 0 && (
               <TableRow>
                 <TableCell colSpan={9} align="center">
                   <Box sx={{ py: 3, color: 'text.secondary' }}>
                     <Typography sx={{ fontSize: '0.775rem' }}>No items added yet. Click Add Row to begin.</Typography>
                   </Box>
                 </TableCell>
               </TableRow>
             )}
           </TableBody>
         </Table>
       </Box>
     
       {/* Footer Layout: Left Side Tax Box & Right Side Total Box */}
       {items.length > 0 && (
         <Box 
           sx={{ 
             display: 'grid', 
             gap: 2, 
             gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
             alignItems: 'start'
           }}
         >
           {/* LEFT SIDE: Inline Tax Configuration & Picker */}
           <Box 
             sx={{ 
               p: 1.25, 
               borderRadius: 1.5, 
               border: '1px solid #e2e8f0', 
               bgcolor: '#f8fafc' 
             }}
           >
             <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', mb: 1, letterSpacing: '0.05em' }}>
               Tax Structure Setup
             </Typography>
             <RadioGroup 
               value={taxOption} 
               onChange={(e) => setTaxOption(e.target.value as 'none' | '5' | '18')}
               sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}
             >
               {/* 1. Zero Tax with Editable Field */}
               <FormControlLabel
                 value="none"
                 control={<Radio size="small" sx={{ p: 0.5 }} />}
                 label={
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                     <Chip 
                       label="Zero Tax" 
                       size="small" 
                       variant={taxOption === 'none' ? 'filled' : 'outlined'} 
                       sx={{ fontSize: '0.7rem', height: 22, fontWeight: 600, color: taxOption === 'none' ? 'white' : '#64748b', bgcolor: taxOption === 'none' ? '#64748b' : 'transparent', borderColor: '#64748b' }} 
                     />
                     <TextField
                       type="number"
                       size="small"
                       value={zeroTaxRate}
                       onChange={(e) => setZeroTaxRate(parseFloat(e.target.value) || 0)}
                       slotProps={{ htmlInput: { step: 0.01, min: 0, max: 100, style: { textAlign: 'right', fontSize: '0.75rem', padding: '4px 8px' } } }}
                       sx={{ width: 70 }}
                     />
                     <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>%</Typography>
                   </Box>
                 }
                 sx={{ m: 0 }}
               />
     
               {/* 2. CGST + SGST with Editable Field */}
               <FormControlLabel
                 value="5"
                 control={<Radio size="small" sx={{ p: 0.5 }} />}
                 label={
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                     <Chip 
                       label="CGST + SGST" 
                       size="small" 
                       variant={taxOption === '5' ? 'filled' : 'outlined'} 
                       sx={{ fontSize: '0.7rem', height: 22, fontWeight: 700, color: taxOption === '5' ? 'white' : '#2563eb', bgcolor: taxOption === '5' ? '#2563eb' : 'transparent', borderColor: '#2563eb' }} 
                     />
                     <TextField
                       type="number"
                       size="small"
                       value={cgstSgstRate}
                       onChange={(e) => setCgstSgstRate(parseFloat(e.target.value) || 0)}
                       slotProps={{ htmlInput: { step: 0.01, min: 0, max: 100, style: { textAlign: 'right', fontSize: '0.75rem', padding: '4px 8px' } } }}
                       sx={{ width: 70 }}
                     />
                     <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>%</Typography>
                   </Box>
                 }
                 sx={{ m: 0 }}
               />
     
               {/* 3. IGST with Editable Field */}
               <FormControlLabel
                 value="18"
                 control={<Radio size="small" sx={{ p: 0.5 }} />}
                 label={
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                     <Chip 
                       label="IGST" 
                       size="small" 
                       variant={taxOption === '18' ? 'filled' : 'outlined'} 
                       sx={{ fontSize: '0.7rem', height: 22, fontWeight: 700, color: taxOption === '18' ? 'white' : '#0891b2', bgcolor: taxOption === '18' ? '#0891b2' : 'transparent', borderColor: '#0891b2' }} 
                     />
                     <TextField
                       type="number"
                       size="small"
                       value={igstRate}
                       onChange={(e) => setIgstRate(parseFloat(e.target.value) || 0)}
                       slotProps={{ htmlInput: { step: 0.01, min: 0, max: 100, style: { textAlign: 'right', fontSize: '0.75rem', padding: '4px 8px' } } }}
                       sx={{ width: 70 }}
                     />
                     <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>%</Typography>
                   </Box>
                 }
                 sx={{ m: 0 }}
               />
             </RadioGroup>
           </Box>
     
           {/* RIGHT SIDE: Financial Totals Box */}
           <Box 
             sx={{ 
               p: 1.5, 
               borderRadius: 1.5, 
               border: '1px solid #fed7aa', 
               bgcolor: '#ffffff',
               ml: { md: 'auto' },
               width: { xs: '100%', md: 320 }
             }}
           >
             <Box sx={{ display: 'grid', gap: 0.75 }}>
               <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                 <Typography sx={{ fontSize: '0.775rem', color: '#64748b' }}>Sub Total</Typography>
                 <Typography sx={{ fontSize: '0.775rem', fontWeight: 700, color: '#0f172a' }}>₹{subTotal.toFixed(2)}</Typography>
               </Box>
               
               {taxOption === 'none' && (
                 <>
                   <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                     <Typography sx={{ fontSize: '0.775rem', color: '#64748b' }}>CGST @ {(zeroTaxRate / 2).toFixed(2)}%</Typography>
                     <Typography sx={{ fontSize: '0.775rem', fontWeight: 500, color: '#0f172a' }}>₹{totalCgst.toFixed(2)}</Typography>
                   </Box>
                   <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                     <Typography sx={{ fontSize: '0.775rem', color: '#64748b' }}>SGST @ {(zeroTaxRate / 2).toFixed(2)}%</Typography>
                     <Typography sx={{ fontSize: '0.775rem', fontWeight: 500, color: '#0f172a' }}>₹{totalSgst.toFixed(2)}</Typography>
                   </Box>
                 </>
               )}
               
               {taxOption === '5' && (
                 <>
                   <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                     <Typography sx={{ fontSize: '0.775rem', color: '#64748b' }}>CGST @ {(cgstSgstRate / 2).toFixed(2)}%</Typography>
                     <Typography sx={{ fontSize: '0.775rem', fontWeight: 500, color: '#0f172a' }}>₹{totalCgst.toFixed(2)}</Typography>
                   </Box>
                   <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                     <Typography sx={{ fontSize: '0.775rem', color: '#64748b' }}>SGST @ {(cgstSgstRate / 2).toFixed(2)}%</Typography>
                     <Typography sx={{ fontSize: '0.775rem', fontWeight: 500, color: '#0f172a' }}>₹{totalSgst.toFixed(2)}</Typography>
                   </Box>
                 </>
               )}
               
               {taxOption === '18' && (
                 <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                   <Typography sx={{ fontSize: '0.775rem', color: '#64748b' }}>IGST @ {igstRate.toFixed(2)}%</Typography>
                   <Typography sx={{ fontSize: '0.775rem', fontWeight: 500, color: '#0f172a' }}>₹{totalIgst.toFixed(2)}</Typography>
                 </Box>
               )}
               
               <Box 
                 sx={{ 
                   display: 'flex', 
                   justifyContent: 'space-between', 
                   mt: 0.5, 
                   bgcolor: '#2563eb', 
                   color: 'white', 
                   p: 1, 
                   borderRadius: 1 
                 }}
               >
                 <Typography sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Grand Total</Typography>
                 <Typography sx={{ fontWeight: 700, fontSize: '0.8rem' }}>₹{grandTotal.toFixed(2)}</Typography>
               </Box>
               
               <Typography sx={{ fontSize: '0.675rem', color: '#64748b', mt: 0.5, lineHeight: 1.25, wordBreak: 'break-word' }}>
                 {numberToWords(grandTotal)}
               </Typography>
             </Box>
           </Box>
         </Box>
       )}
     </Paper>

      {/* Submit Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/dc')}
          sx={{ borderColor: '#cbd5e1', color: '#475569', '&:hover': { bgcolor: '#f1f5f9' } }}
        >
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={onSubmit} 
          disabled={items.length === 0} 
          sx={{ bgcolor: '#2563eb', '&:hover': { bgcolor: '#1e40af' }, px: 3 }}
        >
          Submit
        </Button>
      </Box>
    </Box>
  );
};

export default CreateDC;
