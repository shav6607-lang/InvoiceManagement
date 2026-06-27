import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Typography, Button, Card,
  IconButton, Chip, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
   Collapse, TablePagination, Tooltip,
  CircularProgress
} from '@mui/material';

import {
  Add,Search, Visibility, Print,
  KeyboardArrowDown, KeyboardArrowUp, FileDownload,
  Clear, Receipt
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { deleteInvoice, fetchInvoices, type Invoice } from '../../redux/slices/invoiceSlice';
import { format } from 'date-fns';
import { useReactToPrint } from 'react-to-print';
import html2pdf from 'html2pdf.js';

// ─── Collapsible Row Sub-Component ──────────────────────────────────────────
interface RowProps {
  row: Invoice;
  onView: (row: Invoice) => void;
  onDownload: (row: Invoice) => void;
}

const Row: React.FC<RowProps> = ({ row, onView, onDownload }) => {
  const [open, setOpen] = useState(false);

  const buyerName = row.buyerName || '—';
  const buyerAddress = row.buyerAddress  || '—';
  const buyerPhone = row.buyerPhone  || '—';
  const buyerGstin = row.buyerGstin || '—';
  const buyerState = row.buyerState || '—';
  const buyerStateCode = row.buyerStateCode || '—';

  return (
    <>
      <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
        {/* Actions Cell: View, Download, Expand */}
        <TableCell align="center" sx={{ whiteSpace: 'nowrap', py: 1 }}>
          <Tooltip title="View Invoice">
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

        {/* Core Invoice Details */}
        <TableCell sx={{ fontWeight: 600, color: 'primary.main', whiteSpace: 'nowrap' }}>
          {row.invoiceNumber}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {row.invoiceDate ? format(new Date(row.invoiceDate), 'dd MMM yyyy') : '—'}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 500 }}>
          {buyerName}
        </TableCell>
        <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {buyerAddress}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{buyerPhone}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{buyerGstin}</TableCell>
        <TableCell align="center">
          <Chip
            label={row.urn ? 'YES' : 'NO'}
            size="small"
            color={row.urn ? 'success' : 'default'}
            sx={{ fontWeight: 600, fontSize: '0.75rem' }}
          />
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{buyerState}</TableCell>
        <TableCell align="center">{buyerStateCode}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.dispatchedThrough || '—'}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.destination || '—'}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{row.vehicleNumber || '—'}</TableCell>

        {/* Tax Rates */}
        <TableCell align="right">{row.cgstPer ? `${row.cgstPer}%` : '0%'}</TableCell>
        <TableCell align="right">{row.sgstPer ? `${row.sgstPer}%` : '0%'}</TableCell>
        <TableCell align="right">{row.igstPer ? `${row.igstPer}%` : '0%'}</TableCell>
        <TableCell align="right">{row.taxPer ? `${row.taxPer}%` : '0%'}</TableCell>

        {/* Total & Bill Amount */}
        <TableCell align="right" sx={{ whiteSpace: 'nowrap', fontWeight: 500 }}>
          ₹{row.subTotal ? row.subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
        </TableCell>
        <TableCell align="right" sx={{ whiteSpace: 'nowrap', fontWeight: 700, color: 'success.main' }}>
          ₹{row.grandTotal ? row.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
        </TableCell>
      </TableRow>

      {/* Expanded Line Items Detail Panel */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={20}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle2" color="primary" gutterBottom sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
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
                  {row.items && row.items.map((item, idx) => {
                    const discountAmount = (item.amount * item.discountPercentage) / 100;
                    const finalAmount = item.amount - discountAmount;
                    return (
                      <TableRow key={item.id} hover>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{item.productName}</TableCell>
                        <TableCell>{item.hsnCode}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">₹{item.rate.toFixed(2)}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell align="right">{item.discountPercentage}%</TableCell>
                        <TableCell align="right">₹{item.amount.toFixed(2)}</TableCell>
                        <TableCell align="right">₹{discountAmount.toFixed(2)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>₹{finalAmount.toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })}
                  {(!row.items || row.items.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={10} align="center">No items found inside this invoice.</TableCell>
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

// ─── Company Info Interface ─────────────────────────────────────────────────
interface CompanyInfo {
  CompanyId: number;
  Name: string;
  Address?: string;
  GSTNo?: string;
  State?: string;
  StateCode?: string;
  Email?: string;
  Phone?: string;
  BankName?: string;
  BankBranch?: string;
  AccountNo?: string;
  IFSCCode?: string;
  BankAddress?: string;
}

// ─── Main Invoices Component ────────────────────────────────────────────────
const Invoices: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { invoices, loading, error } = useAppSelector((state) => state.invoices);
  const { token } = useAppSelector((state) => state.auth);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [companies, setCompanies] = useState<CompanyInfo[]>([]);

  // Date and search filters applied on submit
  const [filterSearch, setFilterSearch] = useState('');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');

  // Fetch invoices on component mount
  useEffect(() => {
    console.log('📋 Invoices component mounted, fetching data...');
    dispatch(fetchInvoices());
  }, [dispatch]);

  // Fetch company details from API
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(`${API_BASE}/Material/GetCompanies`, { headers });
        const json = await res.json();
        if (Array.isArray(json?.Data)) {
          setCompanies(json.Data);
        }
      } catch (e) {
        console.error('Failed to fetch companies:', e);
      }
    };
    fetchCompanies();
  }, [token, API_BASE]);

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

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);

  const [downloadInvoice, setDownloadInvoice] = useState<Invoice | null>(null);
  const downloadDialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (downloadInvoice && downloadDialogRef.current) {
      const element = downloadDialogRef.current;
      const opt = {
        margin:       0.5,
        filename:     `Invoice_${downloadInvoice.invoiceNumber || downloadInvoice.id}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      
      setTimeout(() => {
        html2pdf().set(opt).from(element).save().then(() => {
           setDownloadInvoice(null);
        });
      }, 500);
    }
  }, [downloadInvoice]);


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



  const filteredInvoices = invoices.filter((inv) => {
    const buyer = (inv.buyerName || (inv.sameAsConsignee ? inv.consigneeName : '') || '').toLowerCase();
    const searchLower = filterSearch.toLowerCase();

    if (filterSearch) {
      const matchNumber = inv.invoiceNumber.toLowerCase().includes(searchLower);
      const matchBuyer = buyer.includes(searchLower);
      const matchVehicle = (inv.vehicleNumber || '').toLowerCase().includes(searchLower);
      const matchWeightment = (inv.weightmentNo || '').toLowerCase().includes(searchLower);
      if (!matchNumber && !matchBuyer && !matchVehicle && !matchWeightment) {
        return false;
      }
    }

    if (inv.invoiceDate) {
      if (filterFromDate && inv.invoiceDate < filterFromDate) {
        return false;
      }
      if (filterToDate && inv.invoiceDate > filterToDate) {
        return false;
      }
    }
    return true;
  });

  
  const renderPrintContent = (printData: Invoice, ref?: React.Ref<HTMLDivElement>) => (
    <Box ref={ref} sx={{ p: 2, bgcolor: 'white', color: 'black', fontFamily: 'Arial, sans-serif', fontSize: '12px' }}>
              {/* Header – Dynamic Company Details */}
              {(() => {
                const co = companies.length > 0 ? companies[0] : null;
                const coName = co?.Name ;
                const coAddress = co?.Address ;
                const coGST = co?.GSTNO ;
                const coState = co?.State;
                const coCode = co?.StateCode;
                const coEmail = co?.Email;
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
              <Typography sx={{ textAlign: 'center', fontWeight: 800, fontSize: '13px', mb: 1, color: 'black' }}>TAX INVOICE</Typography>

              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', marginBottom: '8px' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '50%', border: '1px solid black', padding: '6px', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: 700 }}>Buyer (Ship To):</div>
                      <div style={{ fontWeight: 700 }}>{printData.consigneeName}</div>
                      <div>{printData.consigneeAddress}</div>
                      <div>GSTIN: {printData.consigneeGstin || '—'}</div>
                      <div>State: {printData.consigneeState} | Code: {printData.consigneeStateCode || '—'}</div>
                      <div>Phone: {printData.consigneePhone}</div>
                    </td>
                    <td style={{ width: '50%', border: '1px solid black', padding: '0', verticalAlign: 'top' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                          <tr>
                            <td style={{ borderBottom: '1px solid black', borderRight: '1px solid black', padding: '4px', width: '50%' }}>
                              <div style={{ fontSize: '9px', color: '#666' }}>Invoice No.</div>
                              <div style={{ fontWeight: 700 }}>{printData.invoiceNumber}</div>
                            </td>
                            <td style={{ borderBottom: '1px solid black', padding: '4px' }}>
                              <div style={{ fontSize: '9px', color: '#666' }}>Dated</div>
                              <div style={{ fontWeight: 700 }}>{printData.invoiceDate}</div>
                            </td>
                          </tr>
                          <tr>
                            <td style={{ borderBottom: '1px solid black', borderRight: '1px solid black', padding: '4px' }}>
                              <div style={{ fontSize: '9px', color: '#666' }}>Delivery Note</div>
                              <div>{printData.deliveryNote || '—'}</div>
                            </td>
                            <td style={{ borderBottom: '1px solid black', padding: '4px' }}>
                              <div style={{ fontSize: '9px', color: '#666' }}>Payment Terms</div>
                              <div>{printData.paymentTerms || '—'}</div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid black', padding: '6px', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: 700 }}>Buyer (Bill To):</div>
                      {printData.sameAsConsignee ? (
                        <div>Same as Consignee</div>
                      ) : (
                        <>
                          <div style={{ fontWeight: 700 }}>{printData.buyerName}</div>
                          <div>{printData.buyerAddress}</div>
                          <div>GSTIN: {printData.buyerGstin || '—'}</div>
                          <div>State: {printData.buyerState} | Code: {printData.buyerStateCode || '—'}</div>
                          {printData.buyerPhone && <div>Phone: {printData.buyerPhone}</div>}
                        </>
                      )}
                      {printData.urn && <div style={{ fontSize: '10px', marginTop: '4px', color: 'blue', fontWeight: 600 }}>URN: REGISTERED</div>}
                    </td>
                    <td style={{ border: '1px solid black', padding: '0', verticalAlign: 'top' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                          <tr>
                            <td style={{ borderBottom: '1px solid black', borderRight: '1px solid black', padding: '4px', width: '50%' }}>
                              <div style={{ fontSize: '9px', color: '#666' }}>Buyer Order No.</div>
                              <div>{printData.buyerOrderNumber || '—'}</div>
                            </td>
                            <td style={{ borderBottom: '1px solid black', padding: '4px' }}>
                              <div style={{ fontSize: '9px', color: '#666' }}>Buyer Order Date</div>
                              <div>{printData.buyerOrderDate || '—'}</div>
                            </td>
                          </tr>
                          <tr>
                            <td style={{ borderRight: '1px solid black', padding: '4px' }}>
                              <div style={{ fontSize: '9px', color: '#666' }}>Dispatched Through</div>
                              <div>{printData.dispatchedThrough || '—'}</div>
                            </td>
                            <td style={{ padding: '4px' }}>
                              <div style={{ fontSize: '9px', color: '#666' }}>Destination</div>
                              <div>{printData.destination || '—'}</div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid black', padding: '4px' }}>
                      <div style={{ fontSize: '9px', color: '#666' }}>Vehicle Number</div>
                      <div style={{ fontWeight: 700 }}>
                        {printData.vehicleNumber || '—'}
                      </div>
                    </td>
                    <td style={{ border: '1px solid black', padding: '4px' }}>
                      <div style={{ fontSize: '9px', color: '#666' }}>Terms of Delivery</div>
                      <div>{printData.termsOfDelivery || '—'}</div>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Items Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', fontSize: '11px', marginBottom: '8px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ border: '1px solid black', padding: '4px', width: '25px' }}>Sl No</th>
                    <th style={{ border: '1px solid black', padding: '4px' }}>Description of Goods</th>
                    <th style={{ border: '1px solid black', padding: '4px', width: '60px' }}>HSN/SAC</th>
                    <th style={{ border: '1px solid black', padding: '4px', width: '80px', textAlign: 'right' }}>Quantity</th>
                    <th style={{ border: '1px solid black', padding: '4px', width: '70px', textAlign: 'right' }}>Rate (₹)</th>
                    <th style={{ border: '1px solid black', padding: '4px', width: '40px' }}>Per</th>
                    <th style={{ border: '1px solid black', padding: '4px', width: '45px', textAlign: 'right' }}>Disc %</th>
                    <th style={{ border: '1px solid black', padding: '4px', width: '80px', textAlign: 'right' }}>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {printData.items && printData.items.map((it, idx) => {
                    return (
                      <tr key={it.id}>
                        <td style={{ border: '1px solid black', padding: '4px', textAlign: 'center' }}>{idx + 1}</td>
                        <td style={{ border: '1px solid black', padding: '4px' }}><strong>{it.productName}</strong></td>
                        <td style={{ border: '1px solid black', padding: '4px', textAlign: 'center' }}>{it.hsnCode}</td>
                        <td style={{ border: '1px solid black', padding: '4px', textAlign: 'right' }}>{it.quantity.toFixed(3)}</td>
                        <td style={{ border: '1px solid black', padding: '4px', textAlign: 'right' }}>{it.rate.toFixed(2)}</td>
                        <td style={{ border: '1px solid black', padding: '4px', textAlign: 'center' }}>{it.unit}</td>
                        <td style={{ border: '1px solid black', padding: '4px', textAlign: 'right' }}>{it.discountPercentage}%</td>
                        <td style={{ border: '1px solid black', padding: '4px', textAlign: 'right' }}>{it.amount.toFixed(2)}</td>
                      </tr>
                    );
                  })}
    
                </tbody>
              </table>

              {/* Totals Table */}
<table
  style={{
    width: "35%",
    marginLeft: "auto",
    borderCollapse: "collapse",
    border: "1px solid black",
    fontSize: "11px",
    marginTop: "-1px",
  }}
>
  <tbody>
    <tr>
      <td style={{ border: "1px solid black", padding: "6px" }}>
        Amount
      </td>
      <td
        style={{
          border: "1px solid black",
          padding: "6px",
          textAlign: "right",
        }}
      >
        ₹{printData.subTotal?.toFixed(2)}
      </td>
    </tr>

    {printData.totalCgst > 0 && (
      <tr>
        <td style={{ border: "1px solid black", padding: "6px" }}>
          CGST @ {printData.cgstPer}%
        </td>
        <td
          style={{
            border: "1px solid black",
            padding: "6px",
            textAlign: "right",
          }}
        >
          ₹{printData.totalCgst?.toFixed(2)}
        </td>
      </tr>
    )}

    {printData.totalSgst > 0 && (
      <tr>
        <td style={{ border: "1px solid black", padding: "6px" }}>
          SGST @ {printData.sgstPer}%
        </td>
        <td
          style={{
            border: "1px solid black",
            padding: "6px",
            textAlign: "right",
          }}
        >
          ₹{printData.totalSgst?.toFixed(2)}
        </td>
      </tr>
    )}

    {printData.totalIgst > 0 && (
      <tr>
        <td style={{ border: "1px solid black", padding: "6px" }}>
          IGST @ {printData.igstPer}%
        </td>
        <td
          style={{
            border: "1px solid black",
            padding: "6px",
            textAlign: "right",
          }}
        >
          ₹{printData.totalIgst?.toFixed(2)}
        </td>
      </tr>
    )}

    <tr
      style={{
        background: "#f5f5f5",
        fontWeight: 700,
        fontSize: "12px",
      }}
    >
      <td style={{ border: "1px solid black", padding: "6px" }}>
        Grand Total
      </td>
      <td
        style={{
          border: "1px solid black",
          padding: "6px",
          textAlign: "right",
        }}
      >
        ₹{printData.grandTotal?.toFixed(2)}
      </td>
    </tr>
  </tbody>
</table>
              {/* Bank Details & Signatory */}
              {(() => {
                const co = companies.length > 0 ? companies[0] : null;
                const bankName = co?.BankName ;
                const bankBranch = co?.BankBranch ;
                const accountNo = co?.AccountNo;
                const ifscCode = co?.IFSCCode ;
                const bankAddress = co?.BankAddress ;
                return (
                  <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', fontSize: '10px', marginTop: '8px' }}>
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
                          <div style={{ marginBottom: '36px', fontSize: '9px' }}>   </div>
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
      dispatch(deleteInvoice(deleteId));
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


 

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, fontFamily: "'Inter', sans-serif" }}>
      {/* ── Page Header: Left side Invoices, Right side Create ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }} color="#111827">Invoices</Typography>
            {!error && invoices.length > 0 && (
              <Chip 
                label="📡" 
                size="small" 
                sx={{ bgcolor: '#d1fae5', color: '#047857', fontWeight: 600 }}
              />
            )}
            {error && invoices.length > 0 && (
              <Chip 
                label="📋" 
                size="small" 
                sx={{ bgcolor: '#fef3c7', color: '#d97706', fontWeight: 600 }}
              />
            )}
          </Box>
          <Typography variant="body2" color="#6b7280">Manage your GST invoices and exports</Typography>
        </Box>
        <Button
          id="create-invoice-btn"
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/invoices/create')}
          sx={{
            bgcolor: 'primary.main',
            '&:hover': { bgcolor: 'primary.dark' },
            boxShadow: 3,
            fontWeight: 700,
            px: 3,
            py: 1.2,
            borderRadius: 2.5
          }}
        >
          Create Invoice
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
      <Box
  sx={{
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
    gap: 2,
    alignItems: 'center',
  }}
>
  {/* Invoice No. (md spans 1 column block) */}
  <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 1' } }}>
    <TextField
      label="Invoice No."
      placeholder="Search Invoice Number"
      fullWidth
      size="small"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
    />
  </Box>

  {/* From Date */}
  <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 1' } }}>
    <TextField
      label="From Date"
      type="date"
      size="small"
      fullWidth
      value={fromDate}
      onChange={(e) => setFromDate(e.target.value)}
      slotProps={{ inputLabel: { shrink: true } }}
    />
  </Box>

  {/* To Date */}
  <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 1' } }}>
    <TextField
      label="To Date"
      type="date"
      size="small"
      fullWidth
      value={toDate}
      onChange={(e) => setToDate(e.target.value)}
      slotProps={{ inputLabel: { shrink: true } }}
    />
  </Box>

  {/* Buttons */}
  <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 1' } }}>
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-start' }}>
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
                          sx={{
                            border: '1px solid',
                            borderColor: 'success.main'
                          }}
                        >
                          <FileDownload />
                        </IconButton>
                      </Tooltip> */}
    </Box>
  </Box>
</Box>
      </Card>
      <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 1, overflow: 'hidden' }}>
        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography color="text.secondary">Loading invoices...</Typography>
            </Box>
          </Box>
        )}

        {/* Error State - Only show if no data */}
        {error && !loading && invoices.length === 0 && (
          <Box sx={{ p: 3, textAlign: 'center', bgcolor: '#fee2e2', border: '1px solid #fca5a5' }}>
            <Typography color="error" sx={{ fontWeight: 600, mb: 1 }}>
              Error Loading Invoices
            </Typography>
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {error}
            </Typography>
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={() => dispatch(fetchInvoices())}
            >
              Retry
            </Button>
          </Box>
        )}

        {/* Data Table - Show if not loading or has data */}
        {(!loading || invoices.length > 0) && (
          <>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader size="small" aria-label="collapsible table">
            <TableHead>
          <TableRow sx={{ '& th': { bgcolor: '#f8fafc', color: '#475569', fontWeight: 700 } }}>
                <th style={{ width: '140px', padding: '12px 16px', textAlign: 'center' }}>Actions</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Invoice No</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>InvoiceDate</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>BuyerName</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Address</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Phone</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>GSTNo</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>URN</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>State</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>StateCode</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>DispatchThrough</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Destination</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>VehicleNo</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>CGST</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>SGST</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>IGST</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Tax</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>TotalAmount</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>BillAmount</th>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInvoices
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <Row
                    key={row.id}
                    row={row}
                    onView={(inv) => setViewInvoice(inv)}
                    onDownload={(inv) => { setDownloadInvoice(inv); }}
                  />
                ))}
              {filteredInvoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={18} align="center" sx={{ py: 8 }}>
                    <Receipt sx={{ fontSize: 48, color: '#94a3b8', mb: 1 }} />
                    <Typography color="text.secondary">No invoices found matching criteria.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredInvoices.length}
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
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Invoice</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this invoice? This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} sx={{ fontWeight: 600 }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} sx={{ fontWeight: 600 }}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* View / Print Preview Dialog */}
      <Dialog open={!!viewInvoice} onClose={() => setViewInvoice(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Invoice Preview ({viewInvoice?.invoiceNumber})</span>
          <IconButton onClick={() => setViewInvoice(null)} size="small">
            <Clear />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {viewInvoice && renderPrintContent(viewInvoice, printDialogRef)}

        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewInvoice(null)} sx={{ fontWeight: 600 }}>Close</Button>
          <Button variant="contained" startIcon={<Print />} onClick={() => handlePrint()} sx={{ bgcolor: '#ea580c', '&:hover': { bgcolor: '#c2410c' }, fontWeight: 600 }}>
            Print / PDF
          </Button>
        </DialogActions>
      </Dialog>
    
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        {downloadInvoice && renderPrintContent(downloadInvoice, downloadDialogRef)}
      </div>
    </Box>
  );
};

export default Invoices;
