import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Typography, Button, Card, CardContent,
  IconButton, Chip, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Paper, Collapse, Grid, TablePagination, Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Add, Search, Visibility, Print,
  KeyboardArrowDown, KeyboardArrowUp, FileDownload,
  Clear, Receipt
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { deleteInvoice, fetchInvoices, type Invoice } from '../../redux/slices/invoiceSlice';
import { format } from 'date-fns';
import { useReactToPrint } from 'react-to-print';

// ─── Collapsible Row Sub-Component ──────────────────────────────────────────
interface RowProps {
  row: Invoice;
  onView: (row: Invoice) => void;
  onDownload: (row: Invoice) => void;
}

const Row: React.FC<RowProps> = ({ row, onView, onDownload }) => {
  const [open, setOpen] = useState(false);

  const buyerName = row.buyerName || (row.sameAsConsignee ? row.consigneeName : '') || '—';
  const buyerAddress = row.buyerAddress || (row.sameAsConsignee ? row.consigneeAddress : '') || '—';
  const buyerPhone = row.buyerPhone || (row.sameAsConsignee ? row.consigneePhone : '') || '—';
  const buyerGstin = row.buyerGstin || (row.sameAsConsignee ? row.consigneeGstin : '') || '—';
  const buyerState = row.buyerState || (row.sameAsConsignee ? row.consigneeState : '') || '—';
  const buyerStateCode = row.buyerStateCode || (row.sameAsConsignee ? row.consigneeStateCode : '') || '—';

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
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.weightmentNo || '—'}</TableCell>

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
              <Typography variant="subtitle2" fontWeight={700} color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Taxable Value (₹)</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Total (₹)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.items && row.items.map((item, idx) => (
                    <TableRow key={item.id} hover>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{item.productName}</TableCell>
                      <TableCell>{item.hsnCode}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">₹{item.rate.toFixed(2)}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell align="right">{item.discountPercentage}%</TableCell>
                      <TableCell align="right">₹{item.taxableValue.toFixed(2)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>₹{item.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  {(!row.items || row.items.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={9} align="center">No items found inside this invoice.</TableCell>
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

// ─── Main Invoices Component ────────────────────────────────────────────────
const Invoices: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { invoices, loading, error } = useAppSelector((state) => state.invoices);

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Date and search filters applied on submit
  const [filterSearch, setFilterSearch] = useState('');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');

  // Fetch invoices on component mount
  useEffect(() => {
    console.log('📋 Invoices component mounted, fetching data...');
    dispatch(fetchInvoices());
  }, [dispatch]);

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

  const handleClearFilters = () => {
    setSearchQuery('');
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
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
    setFilterSearch('');
    setFilterFromDate(fromVal);
    setFilterToDate(toVal);
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

  // Metric Totals
  const totalCount = filteredInvoices.length;
  const totalBillAmount = filteredInvoices.reduce((s, inv) => s + (inv.grandTotal || 0), 0);
  const totalTaxable = filteredInvoices.reduce((s, inv) => s + (inv.subTotal || 0), 0);
  const totalTaxAmount = filteredInvoices.reduce(
    (s, inv) => s + ((inv.totalCgst || 0) + (inv.totalSgst || 0) + (inv.totalIgst || 0)),
    0
  );

  // Excel Format CSV Exporter
  const handleExportToCSV = () => {
    const headers = [
      'Invoice No', 'Invoice Date', 'Buyer Name', 'Address', 'Phone', 'GSTIN', 'URN',
      'State', 'State Code', 'Dispatch Through', 'Destination', 'Vehicle No', 'Weightment No',
      'CGST %', 'SGST %', 'IGST %', 'Tax %', 'Total Amount', 'Bill Amount'
    ];

    const rows = filteredInvoices.map((inv) => {
      const buyer = inv.buyerName || (inv.sameAsConsignee ? inv.consigneeName : '');
      const addr = inv.buyerAddress || (inv.sameAsConsignee ? inv.consigneeAddress : '');
      const ph = inv.buyerPhone || (inv.sameAsConsignee ? inv.consigneePhone : '');
      const gst = inv.buyerGstin || (inv.sameAsConsignee ? inv.consigneeGstin : '');
      const st = inv.buyerState || (inv.sameAsConsignee ? inv.consigneeState : '');
      const stc = inv.buyerStateCode || (inv.sameAsConsignee ? inv.consigneeStateCode : '');
      return [
        inv.invoiceNumber,
        inv.invoiceDate,
        buyer,
        addr,
        ph,
        gst,
        inv.urn ? 'YES' : 'NO',
        st,
        stc,
        inv.dispatchedThrough || '',
        inv.destination || '',
        inv.vehicleNumber || '',
        inv.weightmentNo || '',
        inv.cgstPer || 0,
        inv.sgstPer || 0,
        inv.igstPer || 0,
        inv.taxPer || 0,
        inv.subTotal || 0,
        inv.grandTotal || 0
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF'
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\r\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `invoices_excel_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, fontFamily: "'Inter', sans-serif" }}>
      {/* ── Page Header: Left side Invoices, Right side Create ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h4" fontWeight={800} color="#111827">Invoices</Typography>
            {!error && invoices.length > 0 && (
              <Chip 
                label="📡 API Data" 
                size="small" 
                sx={{ bgcolor: '#d1fae5', color: '#047857', fontWeight: 600 }}
              />
            )}
            {error && invoices.length > 0 && (
              <Chip 
                label="📋 Mock Data" 
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
        <Grid container spacing={2} alignItems="center">

          <Grid item xs={12} md={4}>
            <TextField
              label="Invoice No."
              placeholder="Search Invoice Number"
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
              <Tooltip title="Download Excel">
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
              </Tooltip>

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
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>WeightmentNo</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>CGSTPer</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>SGSTPer</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>IGSTPer</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>TaxPer</th>
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
                    onDownload={(inv) => {
                      // Download invoice JSON as a file
                      const blob = new Blob([JSON.stringify(inv, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `invoice_${inv.invoiceNumber || inv.id}.json`;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      URL.revokeObjectURL(url);
                    }}
                  />
                ))}
              {filteredInvoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={20} align="center" sx={{ py: 8 }}>
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
          {viewInvoice && (
            <Box ref={printDialogRef} sx={{ p: 2, bgcolor: 'white', color: 'black', fontFamily: 'Arial, sans-serif', fontSize: '12px' }}>
              {/* Header */}
              <Box sx={{ textAlign: 'center', mb: 1 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '18px', color: 'black' }}>STONE CRUSH COMPANY</Typography>
                <Typography sx={{ fontSize: '11px', color: 'black' }}>123 Industrial Area, Bangalore, Karnataka</Typography>
                <Typography sx={{ fontSize: '11px', color: 'black' }}>GSTIN: 29AAACS2300D1Z4 | State: Karnataka (29)</Typography>
              </Box>
              <hr style={{ border: 'none', borderTop: '2px solid black', margin: '4px 0' }} />
              <Typography sx={{ textAlign: 'center', fontWeight: 800, fontSize: '13px', mb: 1, color: 'black' }}>TAX INVOICE</Typography>

              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', marginBottom: '8px' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '50%', border: '1px solid black', padding: '6px', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: 700 }}>Consignee (Ship To):</div>
                      <div style={{ fontWeight: 700 }}>{viewInvoice.consigneeName}</div>
                      <div>{viewInvoice.consigneeAddress}</div>
                      <div>GSTIN: {viewInvoice.consigneeGstin || '—'}</div>
                      <div>State: {viewInvoice.consigneeState} | Code: {viewInvoice.consigneeStateCode || '—'}</div>
                      <div>Phone: {viewInvoice.consigneePhone}</div>
                    </td>
                    <td style={{ width: '50%', border: '1px solid black', padding: '0', verticalAlign: 'top' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                          <tr>
                            <td style={{ borderBottom: '1px solid black', borderRight: '1px solid black', padding: '4px', width: '50%' }}>
                              <div style={{ fontSize: '9px', color: '#666' }}>Invoice No.</div>
                              <div style={{ fontWeight: 700 }}>{viewInvoice.invoiceNumber}</div>
                            </td>
                            <td style={{ borderBottom: '1px solid black', padding: '4px' }}>
                              <div style={{ fontSize: '9px', color: '#666' }}>Dated</div>
                              <div style={{ fontWeight: 700 }}>{viewInvoice.invoiceDate}</div>
                            </td>
                          </tr>
                          <tr>
                            <td style={{ borderBottom: '1px solid black', borderRight: '1px solid black', padding: '4px' }}>
                              <div style={{ fontSize: '9px', color: '#666' }}>Delivery Note</div>
                              <div>{viewInvoice.deliveryNote || '—'}</div>
                            </td>
                            <td style={{ borderBottom: '1px solid black', padding: '4px' }}>
                              <div style={{ fontSize: '9px', color: '#666' }}>Payment Terms</div>
                              <div>{viewInvoice.paymentTerms || '—'}</div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid black', padding: '6px', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: 700 }}>Buyer (Bill To):</div>
                      {viewInvoice.sameAsConsignee ? (
                        <div>Same as Consignee</div>
                      ) : (
                        <>
                          <div style={{ fontWeight: 700 }}>{viewInvoice.buyerName}</div>
                          <div>{viewInvoice.buyerAddress}</div>
                          <div>GSTIN: {viewInvoice.buyerGstin || '—'}</div>
                          <div>State: {viewInvoice.buyerState} | Code: {viewInvoice.buyerStateCode || '—'}</div>
                        </>
                      )}
                      {viewInvoice.urn && <div style={{ fontSize: '10px', marginTop: '4px', color: 'blue', fontWeight: 600 }}>URN: REGISTERED</div>}
                    </td>
                    <td style={{ border: '1px solid black', padding: '0', verticalAlign: 'top' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                          <tr>
                            <td style={{ borderBottom: '1px solid black', borderRight: '1px solid black', padding: '4px', width: '50%' }}>
                              <div style={{ fontSize: '9px', color: '#666' }}>Buyer Order No.</div>
                              <div>{viewInvoice.buyerOrderNumber || '—'}</div>
                            </td>
                            <td style={{ borderBottom: '1px solid black', padding: '4px' }}>
                              <div style={{ fontSize: '9px', color: '#666' }}>Buyer Order Date</div>
                              <div>{viewInvoice.buyerOrderDate || '—'}</div>
                            </td>
                          </tr>
                          <tr>
                            <td style={{ borderRight: '1px solid black', padding: '4px' }}>
                              <div style={{ fontSize: '9px', color: '#666' }}>Dispatched Through</div>
                              <div>{viewInvoice.dispatchedThrough || '—'}</div>
                            </td>
                            <td style={{ padding: '4px' }}>
                              <div style={{ fontSize: '9px', color: '#666' }}>Destination</div>
                              <div>{viewInvoice.destination || '—'}</div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid black', padding: '4px' }}>
                      <div style={{ fontSize: '9px', color: '#666' }}>Vehicle Number / Weightment No.</div>
                      <div style={{ fontWeight: 700 }}>
                        {viewInvoice.vehicleNumber || '—'}
                        {viewInvoice.weightmentNo ? ` / ${viewInvoice.weightmentNo}` : ''}
                      </div>
                    </td>
                    <td style={{ border: '1px solid black', padding: '4px' }}>
                      <div style={{ fontSize: '9px', color: '#666' }}>Terms of Delivery</div>
                      <div>{viewInvoice.termsOfDelivery || '—'}</div>
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
                    <th style={{ border: '1px solid black', padding: '4px', width: '80px', textAlign: 'right' }}>Taxable Amt (₹)</th>
                    <th style={{ border: '1px solid black', padding: '4px', width: '90px', textAlign: 'right' }}>Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {viewInvoice.items && viewInvoice.items.map((it, idx) => (
                    <tr key={it.id}>
                      <td style={{ border: '1px solid black', padding: '4px', textAlign: 'center' }}>{idx + 1}</td>
                      <td style={{ border: '1px solid black', padding: '4px' }}><strong>{it.productName}</strong></td>
                      <td style={{ border: '1px solid black', padding: '4px', textAlign: 'center' }}>{it.hsnCode}</td>
                      <td style={{ border: '1px solid black', padding: '4px', textAlign: 'right' }}>{it.quantity.toFixed(3)}</td>
                      <td style={{ border: '1px solid black', padding: '4px', textAlign: 'right' }}>{it.rate.toFixed(2)}</td>
                      <td style={{ border: '1px solid black', padding: '4px', textAlign: 'center' }}>{it.unit}</td>
                      <td style={{ border: '1px solid black', padding: '4px', textAlign: 'right' }}>{it.discountPercentage}%</td>
                      <td style={{ border: '1px solid black', padding: '4px', textAlign: 'right' }}>{it.taxableValue.toFixed(2)}</td>
                      <td style={{ border: '1px solid black', padding: '4px', textAlign: 'right' }}><strong>{it.total.toFixed(2)}</strong></td>
                    </tr>
                  ))}
                  <tr style={{ fontWeight: 700 }}>
                    <td colSpan={3} style={{ border: '1px solid black', padding: '4px', textAlign: 'right' }}>Total</td>
                    <td style={{ border: '1px solid black', padding: '4px', textAlign: 'right' }}>
                      {viewInvoice.items?.reduce((s, it) => s + it.quantity, 0).toFixed(3)}
                    </td>
                    <td colSpan={3} style={{ border: '1px solid black' }}></td>
                    <td style={{ border: '1px solid black', padding: '4px', textAlign: 'right' }}>{viewInvoice.subTotal?.toFixed(2)}</td>
                    <td style={{ border: '1px solid black', padding: '4px', textAlign: 'right' }}>₹{viewInvoice.grandTotal?.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

              {/* Totals Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', fontSize: '11px', marginTop: '-1px' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '6px', width: '60%', border: '1px solid black' }}>
                      <div>Tax Summary:</div>
                      {viewInvoice.taxPer && viewInvoice.taxPer > 0 ? (
                        <div>GST Tax @ {viewInvoice.taxPer}% is included in total amount.</div>
                      ) : (
                        <div>No Tax (0% GST)</div>
                      )}
                    </td>
                    <td style={{ padding: '6px', width: '40%', border: '1px solid black' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                        <span>Sub Total:</span>
                        <span>₹{viewInvoice.subTotal?.toFixed(2)}</span>
                      </div>
                      {viewInvoice.totalCgst > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                          <span>CGST ({viewInvoice.cgstPer}%):</span>
                          <span>₹{viewInvoice.totalCgst?.toFixed(2)}</span>
                        </div>
                      )}
                      {viewInvoice.totalSgst > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                          <span>SGST ({viewInvoice.sgstPer}%):</span>
                          <span>₹{viewInvoice.totalSgst?.toFixed(2)}</span>
                        </div>
                      )}
                      {viewInvoice.totalIgst > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                          <span>IGST ({viewInvoice.igstPer}%):</span>
                          <span>₹{viewInvoice.totalIgst?.toFixed(2)}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, borderTop: '1px solid #ddd', paddingTop: '4px' }}>
                        <span>GRAND TOTAL:</span>
                        <span>₹{viewInvoice.grandTotal?.toFixed(2)}</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Box>
          )}

        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewInvoice(null)} sx={{ fontWeight: 600 }}>Close</Button>
          <Button variant="contained" startIcon={<Print />} onClick={() => handlePrint()} sx={{ bgcolor: '#ea580c', '&:hover': { bgcolor: '#c2410c' }, fontWeight: 600 }}>
            Print / PDF
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Invoices;
