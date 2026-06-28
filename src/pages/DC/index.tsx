import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Typography, Button, Card,
  IconButton, Chip, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Collapse, Grid, TablePagination, Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Add, Search, Visibility, Print,
  KeyboardArrowDown, KeyboardArrowUp, FileDownload,
  Clear, Receipt
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { deleteDC, fetchDCs, type DC, type DCItem } from '../../redux/slices/dcSlice';
import type { CompanyInfo } from '@/types/company.types';
import { materialApi } from '@/services/api';
import { useAuthenticatedEffect } from '@/hooks/useAuthenticatedEffect';
import { useReactToPrint } from 'react-to-print';
import html2pdf from 'html2pdf.js';

// ─── Collapsible Row Sub-Component ──────────────────────────────────────────
interface RowProps {
  row: DC;
  onView: (row: DC) => void;
  onDownload: (row: DC) => void;
}

const Row: React.FC<RowProps> = ({ row, onView, onDownload }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
        {/* Actions Cell: View, Download, Expand */}
        <TableCell align="center" sx={{ whiteSpace: 'nowrap', py: 1 }}>
          <Tooltip title="View DC">
            <IconButton size="small" color="primary" onClick={() => onView(row)}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download">
            <IconButton size="small" color="success" onClick={() => onDownload(row)}>
              <FileDownload fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={open ? 'Collapse' : 'Expand'}>
            <IconButton size="small" onClick={() => setOpen(!open)}>
              {open ? <KeyboardArrowUp fontSize="small" /> : <KeyboardArrowDown fontSize="small" />}
            </IconButton>
          </Tooltip>
        </TableCell>

        {/* Core DC Details */}
        <TableCell sx={{ fontWeight: 600, color: 'primary.main', whiteSpace: 'nowrap' }}>
          {row.DCNo}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {row.DCDate || '—'}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>
          {row.VehicleNo || '—'}
        </TableCell>

        {/* Tax Rates */}
        <TableCell align="right" sx={{ fontWeight: 600 }}>{(row.CGST || 0)}%</TableCell>
        <TableCell align="right" sx={{ fontWeight: 500 }}>{(row.SGST || 0)}%</TableCell>
        <TableCell align="right" sx={{ fontWeight: 500 }}>{(row.IGST || 0)}%</TableCell>
        <TableCell align="right" sx={{ fontWeight: 500 }}>{((row.CGST || 0) + (row.SGST || 0) + (row.IGST || 0))}%</TableCell>

        {/* Total Amount */}
        <TableCell align="right" sx={{ whiteSpace: 'nowrap', fontWeight: 700, color: 'success.main' }}>
          ₹{(Number(row.TaxAmount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </TableCell>
        <TableCell align="right" sx={{ whiteSpace: 'nowrap', fontWeight: 700, color: 'success.main' }}>
          ₹{(Number(row.TotalAmount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </TableCell>
      </TableRow>

      {/* Expanded Line Items Detail Panel */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={15}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Receipt fontSize="small" /> Description of Goods
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f1f5f9' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Sl No</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Product Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>HSN Code</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Quantity</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Rate (₹)</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Unit</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Discount %</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Amount (₹)</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Discount Amount (₹)</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Final Amount (₹)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.JsonDCDetails && row.JsonDCDetails.map((item: DCItem, idx: number) => {
                    const amount = (Number(item.Qty) || 0) * (Number(item.RatePerUnit) || 0);
                    const discountAmount = (amount * (Number(item.Disc) || 0)) / 100;
                    const finalAmount = amount - discountAmount;
                    return (
                      <TableRow key={item.productId} hover>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{item.productName}</TableCell>
                        <TableCell>{item.hsnCode}</TableCell>
                        <TableCell align="right">{item.Qty}</TableCell>
                        <TableCell align="right">₹{(Number(item.RatePerUnit) || 0).toFixed(2)}</TableCell>
                        <TableCell>{item.Unit}</TableCell>
                        <TableCell align="right">{item.Disc}%</TableCell>
                        <TableCell align="right">₹{amount.toFixed(2)}</TableCell>
                        <TableCell align="right">₹{discountAmount.toFixed(2)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>₹{finalAmount.toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })}
                  {(!row.JsonDCDetails || row.JsonDCDetails.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={9} align="center">No items found in this DC.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

// ─── Main DC Component ────────────────────────────────────────────────
const DCList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { data: dcs = [], loading = false, error = null } = useAppSelector((state) => state.dcs || { data: [], loading: false, error: null });

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Date and search filters applied on submit
  const [filterSearch, setFilterSearch] = useState('');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');


  const [companies, setCompanies] = useState<CompanyInfo[]>([]);

  useAuthenticatedEffect(() => {
    const loadCompanies = async () => {
      try {
        const json = await materialApi.getCompanies();
        if (Array.isArray(json?.Data)) {
          setCompanies(json.Data);
        }
      } catch {
        // Company details are optional for list view
      }
    };
    loadCompanies();
  });

  useAuthenticatedEffect(() => {
    dispatch(fetchDCs());
  });

  React.useEffect(() => {
    const today = new Date();
    const firstDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    // Using timezone-safe formatting to avoid offset issues
    const formatDate = (date: Date) => {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    const fromVal = formatDate(firstDay);
    const toVal = formatDate(today);

    setFromDate(fromVal);
    setToDate(toVal);
    setFilterFromDate(fromVal);
    setFilterToDate(toVal);
  }, []);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [viewDC, setViewDC] = useState<DC | null>(null);

  const [downloadDC, setDownloadDC] = useState<DC | null>(null);
  const downloadDialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (downloadDC && downloadDialogRef.current) {
      const element = downloadDialogRef.current;
      const opt = {
        margin:       0.5,
        filename:     `DC_${downloadDC.DCNo}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' as const }
      };
      
      setTimeout(() => {
        html2pdf().set(opt).from(element).save().then(() => {
           setDownloadDC(null);
        });
      }, 500);
    }
  }, [downloadDC]);


  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Print Ref for Dialog print preview
  const printDialogRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: printDialogRef });

  // Filters application
  const handleSearch = () => {
    setFilterSearch(searchQuery);
    setFilterFromDate(fromDate);
    setFilterToDate(toDate);
    setPage(0);
  };



  const filteredDCs = dcs.filter((dc) => {
    const searchLower = filterSearch.toLowerCase();

    if (filterSearch) {
      const matchDCNo = dc.DCNo.toLowerCase().includes(searchLower);
      const matchVehicle = (dc.VehicleNo || '').toLowerCase().includes(searchLower);
      if (!matchDCNo && !matchVehicle) {
        return false;
      }
    }

    // Convert DD/MM/YYYY to YYYY-MM-DD for proper comparison
    if (dc.DCDate) {
      const dcDateParts = dc.DCDate.split('/');
      let normalizedDCDate = dc.DCDate;
      
      // If date is in DD/MM/YYYY format, convert to YYYY-MM-DD
      if (dcDateParts.length === 3 && dcDateParts[0].length === 2) {
        const [day, month, year] = dcDateParts;
        normalizedDCDate = `${year}-${month}-${day}`;
      }
      
      if (filterFromDate && normalizedDCDate < filterFromDate) {
        return false;
      }
      if (filterToDate && normalizedDCDate > filterToDate) {
        return false;
      }
    }
    return true;
  });

  const renderPrintContent = (printData: DC, ref?: React.Ref<HTMLDivElement>) => (
    <Box ref={ref} sx={{ p: 2, bgcolor: 'white', color: 'black', fontFamily: 'Arial, sans-serif', fontSize: '12px' }}>
              {(() => {
                const co = companies.length > 0 ? companies[0] : null;
                const coName = co?.Name ;
                const coAddress = co?.Address;
                const coGST = co?.GSTNO ;
                const coState = co?.State;
                const coCode = co?.StateCode;
                const coEmail = co?.Email ;
                const coPhone = co?.Phone ;
                return (
                  <Box sx={{ textAlign: 'center', borderBottom: '2px solid black', pb: 1, mb: 1 }}>
                    <Typography sx={{ fontWeight: 900, fontSize: '16px', color: 'black', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {coName}
                    </Typography>
                    <Typography sx={{ fontSize: '10px', color: 'black' }}>{coAddress}</Typography>
                    <Typography sx={{ fontSize: '10px', color: 'black' }}>
                      GSTIN: {coGST} | State: {coState} ({coCode})
                    </Typography>
                    {(coPhone || coEmail) && (
                      <Typography sx={{ fontSize: '10px', color: 'black' }}>
                        {coPhone ? `Ph: ${coPhone}` : ''}{coPhone && coEmail ? ' | ' : ''}Email: {coEmail}
                      </Typography>
                    )}
                  </Box>
                );
              })()}
              <hr style={{ border: 'none', borderTop: '2px solid black', margin: '4px 0' }} />
              <Typography sx={{ textAlign: 'center', fontWeight: 800, fontSize: '13px', mb: 1, color: 'black' }}>DELIVERY CHALLAN</Typography>

              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', marginBottom: '8px' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '50%', border: '1px solid black', padding: '6px', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: 700, marginBottom: '4px' }}>Consignee / Bill To:</div>
                      <div style={{ fontWeight: 700, fontSize: '12px' }}>
                        {companies.find(c => c.CompanyId === printData.CompanyId)?.Name || 'M/s. SRI MADESHWARA STONE CRUSHER'}
                      </div>
                      {companies.find(c => c.CompanyId === printData.CompanyId)?.Address && (
                        <div style={{ fontSize: '10px', marginTop: '2px' }}>
                          {companies.find(c => c.CompanyId === printData.CompanyId)?.Address}
                        </div>
                      )}
                      {companies.find(c => c.CompanyId === printData.CompanyId)?.GSTNo && (
                        <div style={{ fontSize: '10px', marginTop: '2px' }}>
                          GSTIN: {companies.find(c => c.CompanyId === printData.CompanyId)?.GSTNo}
                        </div>
                      )}
                      {companies.find(c => c.CompanyId === printData.CompanyId)?.State && (
                        <div style={{ fontSize: '10px' }}>
                          State: {companies.find(c => c.CompanyId === printData.CompanyId)?.State}
                          {companies.find(c => c.CompanyId === printData.CompanyId)?.StateCode ? ` (${companies.find(c => c.CompanyId === printData.CompanyId)?.StateCode})` : ''}
                        </div>
                      )}
                    </td>
                    <td style={{ width: '50%', border: '1px solid black', padding: '0', verticalAlign: 'top' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                          <tr>
                            <td style={{ borderBottom: '1px solid black', borderRight: '1px solid black', padding: '4px', width: '50%' }}>
                              <div style={{ fontSize: '9px', color: '#666' }}>DC No.</div>
                              <div style={{ fontWeight: 700 }}>{printData.DCNo}</div>
                            </td>
                            <td style={{ borderBottom: '1px solid black', padding: '4px' }}>
                              <div style={{ fontSize: '9px', color: '#666' }}>DC Date</div>
                              <div style={{ fontWeight: 700 }}>{printData.DCDate}</div>
                            </td>
                          </tr>
                          <tr>
                            <td style={{ borderBottom: '1px solid black', borderRight: '1px solid black', padding: '4px' }}>
                              <div style={{ fontSize: '9px', color: '#666' }}>Vehicle No.</div>
                              <div style={{ fontWeight: 700 }}>{printData.VehicleNo || '—'}</div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>

{/* Material Table */}
<table
  style={{
    width: "100%",
    borderCollapse: "collapse",
    border: "1px solid black",
    fontSize: "11px",
    marginBottom: "8px",
    marginTop: "8px", 
  }}
>
  <thead>
    <tr style={{ backgroundColor: "#f5f5f5" }}>
      <th style={{ border: "1px solid black", padding: "5px" }}>Material</th>
      <th style={{ border: "1px solid black", padding: "5px", width: "80px" }}>HSN/SAC</th>
      <th style={{ border: "1px solid black", padding: "5px", width: "70px" }}>Qty (MTs)</th>
      <th style={{ border: "1px solid black", padding: "5px", width: "80px" }}>Rate (₹)</th>
      <th style={{ border: "1px solid black", padding: "5px", width: "60px" }}>Disc %</th>
      <th style={{ border: "1px solid black", padding: "5px", width: "90px" }}>Amount</th>
      <th style={{ border: "1px solid black", padding: "5px", width: "90px" }}>Total</th>
    </tr>
  </thead>

  <tbody>
    {printData.JsonDCDetails?.map((it: DCItem) => {
      const amount =
        (Number(it.Qty) || 0) * (Number(it.RatePerUnit) || 0);

      const total =
        amount - amount * ((Number(it.Disc) || 0) / 100);

      return (
        <tr key={it.productId}>
          <td style={{ border: "1px solid black", padding: "5px" }}>
            {it.productName}
          </td>

          <td style={{ border: "1px solid black", padding: "5px", textAlign: "center" }}>
            {it.hsnCode}
          </td>

          <td style={{ border: "1px solid black", padding: "5px", textAlign: "right" }}>
            {(Number(it.Qty) || 0).toFixed(3)}
          </td>

          <td style={{ border: "1px solid black", padding: "5px", textAlign: "right" }}>
            ₹{(Number(it.RatePerUnit) || 0).toFixed(2)}
          </td>

          <td style={{ border: "1px solid black", padding: "5px", textAlign: "right" }}>
            {it.Disc}%
          </td>

          <td style={{ border: "1px solid black", padding: "5px", textAlign: "right" }}>
            ₹{amount.toFixed(2)}
          </td>

          <td style={{ border: "1px solid black", padding: "5px", textAlign: "right", fontWeight: 600 }}>
            ₹{total.toFixed(2)}
          </td>
        </tr>
      );
    })}
  </tbody>
</table>

{/* Summary Table */}
<table
  style={{
    width: "35%",
    marginLeft: "auto",
    borderCollapse: "collapse",
    border: "1px solid black",
    fontSize: "11px",
    marginTop: "8px", 
  }}
>
  <tbody>

    <tr>
      <td style={{ border: "1px solid black", padding: "6px" }}>
        Sub Total
      </td>

      <td style={{ border: "1px solid black", padding: "6px", textAlign: "right" }}>
        ₹{(printData.TaxAmount || 0).toFixed(2)}
      </td>
    </tr>

    {(printData.CGST || 0) > 0 && (
      <tr>
        <td style={{ border: "1px solid black", padding: "6px" }}>
          CGST @ {printData.CGST}%
        </td>

        <td style={{ border: "1px solid black", padding: "6px", textAlign: "right" }}>
          ₹{((printData.TaxAmount || 0) * (printData.CGST || 0) / 100).toFixed(2)}
        </td>
      </tr>
    )}

    {(printData.SGST || 0) > 0 && (
      <tr>
        <td style={{ border: "1px solid black", padding: "6px" }}>
          SGST @ {printData.SGST}%
        </td>

        <td style={{ border: "1px solid black", padding: "6px", textAlign: "right" }}>
          ₹{((printData.TaxAmount || 0) * (printData.SGST || 0) / 100).toFixed(2)}
        </td>
      </tr>
    )}

    {(printData.IGST || 0) > 0 && (
      <tr>
        <td style={{ border: "1px solid black", padding: "6px" }}>
          IGST @ {printData.IGST}%
        </td>

        <td style={{ border: "1px solid black", padding: "6px", textAlign: "right" }}>
          ₹{((printData.TaxAmount || 0) * (printData.IGST || 0) / 100).toFixed(2)}
        </td>
      </tr>
    )}

    <tr style={{ fontWeight: "bold" }}>
      <td style={{ border: "1px solid black", padding: "6px" }}>
        Grand Total
      </td>

      <td style={{ border: "1px solid black", padding: "6px", textAlign: "right" }}>
        ₹{printData.TotalAmount?.toFixed(2)}
      </td>
    </tr>

  </tbody>
</table>



              {/* Bank Details & Signatory */}
              {(() => {
                const co = companies.length > 0 ? companies[0] : null;
                const bankName = co?.BankName ;
                const bankBranch = co?.Branch ;
                const accountNo = co?.AccNo ;
                const ifscCode = co?.ISFC ;
                const bankAddress = co?.BankAddress;
                return (
                  <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', fontSize: '10px', marginTop: '3px' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '6px', width: '60%', border: '1px solid black', verticalAlign: 'top' }}>
                          <div style={{ fontWeight: 700, marginBottom: '4px' }}>Bank Details:</div>
                          <div><strong>Bank Name:</strong> {bankName}</div>
                          <div><strong>Branch:</strong> {bankBranch}</div>
                          <div><strong>Account No:</strong> {accountNo}</div>
                          <div><strong>IFSC Code:</strong> {ifscCode}</div>
                          <div><strong>Bank Address:</strong> {bankAddress}</div>
                        </td>
                        <td style={{ padding: '6px', width: '40%', border: '1px solid black', verticalAlign: 'bottom', textAlign: 'center' }}>
                          <div style={{ marginBottom: '36px', fontSize: '9px' }}></div>
                          <div style={{ fontWeight: 700, borderTop: '1px solid black', paddingTop: '4px' }}>Authorised Signatory</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                );
              })()}
            </Box>
  );

  const handleDelete = () => {
    if (deleteId) {
      dispatch(deleteDC(deleteId));
      setDeleteId(null);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };



  // Excel Format CSV Exporter
  const handleExportToCSV = () => {
    const headers = [
      'DC No', 'DC Date', 'Vehicle No', 'CGST %', 'SGST %', 'IGST %', 'Total Tax %', 'Total Amount'
    ];

    const rows = filteredDCs.map((dc) => [
      dc.DCNo,
      dc.DCDate,
      dc.VehicleNo || '',
      dc.CGST || 0,
      dc.SGST || 0,
      dc.IGST || 0,
      ((dc.CGST || 0) + (dc.SGST || 0) + (dc.IGST || 0)) || 0,
      dc.TotalAmount || 0
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF'
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\r\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DC_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, fontFamily: "'Inter', sans-serif" }}>
      {/* ── Page Header: Left side Delivery Challans, Right side Create ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827' }}>Delivery Challans</Typography>
            {error && dcs.length > 0 && (
              <Chip 
                label="📋" 
                size="small" 
                sx={{ bgcolor: '#fef3c7', color: '#d97706', fontWeight: 600 }}
              />
            )}
          </Box>
        </Box>
        <Button
          id="create-invoice-btn"
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/dc/create')}
          sx={{
            bgcolor: 'primary.main',
            '&:hover': { bgcolor: 'primary.dark' },
            boxShadow: 3,
            fontWeight: 600,
            px: 3,
            py: 1.2,
            borderRadius: 1.5
          }}
        >
          Create DC
        </Button>
      </Box>
      <Card
        elevation={0}
        sx={{
          border: '1px solid #e2e8f0',
          borderRadius: 1,
          p: 2,
          backgroundColor: '#fff'
        }}
      >
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>

          <Grid item xs={12} md={4}>
            <TextField
              label="Search DC"
              placeholder="Search by DC Number, Vehicle No, or Weightment"
              fullWidth
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2.5}>
            <TextField
              label="From Date"
              type="date"
              size="small"
              fullWidth
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2.5}>
            <TextField
              label="To Date"
              type="date"
              size="small"
              fullWidth
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>

              <Tooltip title="Search">
                <IconButton
                  color="primary"
                  onClick={handleSearch}
                  sx={{
                    border: '1px solid',
                    borderColor: 'primary.main'
                  }}
                >
                  <Search />
                </IconButton>
              </Tooltip>
              {/* <Tooltip title="Download Excel">
                <IconButton
                  color="success"
                  onClick={handleExportToCSV}
                  sx={{
                    border: '1px solid',
                    borderColor: 'success.main'
                  }}
                >
                  <FileDownload />
                </IconButton>
              </Tooltip> */}

            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* ── Collapsible Grid View Table ── */}
      <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography color="text.secondary">Loading DCs...</Typography>
            </Box>
          </Box>
        )}

        {/* Error State - Only show if no data */}
        {error && !loading && dcs.length === 0 && (
          <Box sx={{ p: 3, textAlign: 'center', bgcolor: '#fee2e2', border: '1px solid #fca5a5' }}>
            <Typography color="error" sx={{ fontWeight: 600, mb: 1 }}>
              Error Loading Delivery Challans
            </Typography>
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {error}
            </Typography>
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={() => dispatch(fetchDCs())}
            >
              Retry
            </Button>
          </Box>
        )}

        {/* Data Table - Show if not loading or has data */}
        {(!loading || dcs.length > 0) && (
          <>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader size="small" aria-label="collapsible table">
            <TableHead>
              <TableRow sx={{ '& th': { bgcolor: '#f8fafc', color: '#475569', fontWeight: 700 } }}>
                <th style={{ width: '140px', padding: '12px 16px', textAlign: 'center' }}>Actions</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>DC No</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>DC Date</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Vehicle No</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>CGST</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>SGST</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>IGST</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Tax</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Amount</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Total Amount</th>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDCs
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, idx) => (
                  <Row
                    key={row.SlNo || idx}
                    row={row}
                    onView={(dc) => setViewDC(dc)}
                    onDownload={(dc) => { setDownloadDC(dc); }}
                  />
                ))}
              {filteredDCs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={15} align="center" sx={{ py: 8 }}>
                    <Receipt sx={{ fontSize: 48, color: '#94a3b8', mb: 1 }} />
                    <Typography color="text.secondary">No DCs found matching criteria.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredDCs.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
          </>
        )}
      </Card>

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete DC</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this Delivery Challan? This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} sx={{ fontWeight: 600 }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} sx={{ fontWeight: 600 }}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* View / Print Preview Dialog */}
      <Dialog open={!!viewDC} onClose={() => setViewDC(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>DC Preview ({viewDC?.DCNo})</span>
          <IconButton onClick={() => setViewDC(null)} size="small">
            <Clear />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {viewDC && renderPrintContent(viewDC, printDialogRef)}

        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDC(null)} sx={{ fontWeight: 600 }}>Close</Button>
          <Button variant="contained" startIcon={<Print />} onClick={() => handlePrint()} sx={{ bgcolor: '#ea580c', '&:hover': { bgcolor: '#c2410c' }, fontWeight: 600 }}>
            Print / PDF
          </Button>
        </DialogActions>
      </Dialog>
    
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        {downloadDC && renderPrintContent(downloadDC, downloadDialogRef)}
      </div>
    </Box>
  );
};

export default DCList;
