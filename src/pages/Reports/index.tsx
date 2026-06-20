import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Tabs, Tab, Button,
  Table, TableHead, TableRow, TableCell, TableBody,
  Chip, Divider,
} from '@mui/material';
import { Download, Assessment } from '@mui/icons-material';
import { useAppSelector } from '../../redux/hooks';
import * as XLSX from 'xlsx';

interface TabPanelProps { children?: React.ReactNode; index: number; value: number; }
const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box pt={3}>{children}</Box>}
  </div>
);

const Reports: React.FC = () => {
  const { invoices } = useAppSelector((s) => s.invoices);
  const [tab, setTab] = useState(0);

  const totalTaxable = invoices.reduce((s, inv) => s + inv.subTotal, 0);
  const totalCgst = invoices.reduce((s, inv) => s + inv.totalCgst, 0);
  const totalSgst = invoices.reduce((s, inv) => s + inv.totalSgst, 0);
  const totalIgst = invoices.reduce((s, inv) => s + inv.totalIgst, 0);
  const grandTotal = invoices.reduce((s, inv) => s + inv.grandTotal, 0);

  // Product-wise aggregation
  const productWise: Record<string, { name: string; qty: number; taxable: number; total: number }> = {};
  invoices.forEach((inv) => {
    inv.items.forEach((item) => {
      if (!productWise[item.productName]) {
        productWise[item.productName] = { name: item.productName, qty: 0, taxable: 0, total: 0 };
      }
      productWise[item.productName].qty += item.quantity;
      productWise[item.productName].taxable += item.taxableValue;
      productWise[item.productName].total += item.total;
    });
  });

  // Customer-wise aggregation
  const customerWise: Record<string, { name: string; count: number; taxable: number; total: number }> = {};
  invoices.forEach((inv) => {
    const name = inv.buyerName || inv.consigneeName;
    if (!customerWise[name]) {
      customerWise[name] = { name, count: 0, taxable: 0, total: 0 };
    }
    customerWise[name].count += 1;
    customerWise[name].taxable += inv.subTotal;
    customerWise[name].total += inv.grandTotal;
  });

  const exportSalesRegister = () => {
    const data = invoices.map((inv) => ({
      'Invoice No': inv.invoiceNumber,
      'Date': inv.invoiceDate,
      'Customer': inv.buyerName || inv.consigneeName,
      'Taxable Amount': inv.subTotal.toFixed(2),
      'CGST': inv.totalCgst.toFixed(2),
      'SGST': inv.totalSgst.toFixed(2),
      'IGST': inv.totalIgst.toFixed(2),
      'Grand Total': inv.grandTotal.toFixed(2),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sales Register');
    XLSX.writeFile(wb, 'sales_register.xlsx');
  };

  const EmptyState = () => (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Assessment sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
      <Typography variant="h6" color="text.secondary">No invoice data yet</Typography>
      <Typography variant="body2" color="text.secondary">Create invoices to view reports here.</Typography>
    </Box>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Reports</Typography>
          <Typography variant="body2" color="text.secondary">Business analytics and tax summaries</Typography>
        </Box>
        <Button id="export-excel-btn" variant="outlined" startIcon={<Download />} onClick={exportSalesRegister}>
          Export to Excel
        </Button>
      </Box>

      {/* GST Summary Cards */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
        {[
          { label: 'Total CGST', value: totalCgst, color: '#3B82F6' },
          { label: 'Total SGST', value: totalSgst, color: '#10B981' },
          { label: 'Total IGST', value: totalIgst, color: '#F59E0B' },
          { label: 'Grand Total', value: grandTotal, color: '#8B5CF6' },
        ].map((item) => (
          <Card key={item.label} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', flex: 1, minWidth: 180 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">{item.label}</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: item.color }}>
                ₹{item.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 3 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
            <Tab label="Sales Register" />
            <Tab label="Product-wise Sales" />
            <Tab label="Customer-wise Sales" />
            <Tab label="GST Summary" />
          </Tabs>

          <TabPanel value={tab} index={0}>
            {invoices.length === 0 ? <EmptyState /> : (
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell><strong>Invoice No</strong></TableCell>
                    <TableCell><strong>Customer</strong></TableCell>
                    <TableCell align="right"><strong>Taxable</strong></TableCell>
                    <TableCell align="right"><strong>GST</strong></TableCell>
                    <TableCell align="right"><strong>Total</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv.id} hover>
                      <TableCell>{inv.invoiceDate}</TableCell>
                      <TableCell><Typography color="primary.main" sx={{ fontWeight: 600 }}>{inv.invoiceNumber}</Typography></TableCell>
                      <TableCell>{inv.buyerName || inv.consigneeName}</TableCell>
                      <TableCell align="right">₹{inv.subTotal.toFixed(2)}</TableCell>
                      <TableCell align="right">₹{(inv.totalCgst + inv.totalSgst + inv.totalIgst).toFixed(2)}</TableCell>
                      <TableCell align="right"><strong>₹{inv.grandTotal.toFixed(2)}</strong></TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell colSpan={3}><strong>Total</strong></TableCell>
                    <TableCell align="right"><strong>₹{totalTaxable.toFixed(2)}</strong></TableCell>
                    <TableCell align="right"><strong>₹{(totalCgst + totalSgst + totalIgst).toFixed(2)}</strong></TableCell>
                    <TableCell align="right"><strong>₹{grandTotal.toFixed(2)}</strong></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}
          </TabPanel>

          <TabPanel value={tab} index={1}>
            {Object.keys(productWise).length === 0 ? <EmptyState /> : (
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell><strong>Product</strong></TableCell>
                    <TableCell align="right"><strong>Total Qty</strong></TableCell>
                    <TableCell align="right"><strong>Taxable Amount</strong></TableCell>
                    <TableCell align="right"><strong>Total Sales</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.values(productWise).map((p) => (
                    <TableRow key={p.name} hover>
                      <TableCell><Chip label={p.name} size="small" /></TableCell>
                      <TableCell align="right">{p.qty.toFixed(2)}</TableCell>
                      <TableCell align="right">₹{p.taxable.toFixed(2)}</TableCell>
                      <TableCell align="right"><strong>₹{p.total.toFixed(2)}</strong></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabPanel>

          <TabPanel value={tab} index={2}>
            {Object.keys(customerWise).length === 0 ? <EmptyState /> : (
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell><strong>Customer</strong></TableCell>
                    <TableCell align="right"><strong>Invoices</strong></TableCell>
                    <TableCell align="right"><strong>Taxable Amount</strong></TableCell>
                    <TableCell align="right"><strong>Total Sales</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.values(customerWise).map((c) => (
                    <TableRow key={c.name} hover>
                      <TableCell>{c.name}</TableCell>
                      <TableCell align="right">{c.count}</TableCell>
                      <TableCell align="right">₹{c.taxable.toFixed(2)}</TableCell>
                      <TableCell align="right"><strong>₹{c.total.toFixed(2)}</strong></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabPanel>

          <TabPanel value={tab} index={3}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell><strong>Tax Type</strong></TableCell>
                  <TableCell align="right"><strong>Amount</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow><TableCell>Total CGST</TableCell><TableCell align="right">₹{totalCgst.toFixed(2)}</TableCell></TableRow>
                <TableRow><TableCell>Total SGST</TableCell><TableCell align="right">₹{totalSgst.toFixed(2)}</TableCell></TableRow>
                <TableRow><TableCell>Total IGST</TableCell><TableCell align="right">₹{totalIgst.toFixed(2)}</TableCell></TableRow>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell><strong>Total GST Collected</strong></TableCell>
                  <TableCell align="right"><strong>₹{(totalCgst + totalSgst + totalIgst).toFixed(2)}</strong></TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: 'primary.main', borderRadius: 2, color: 'white' }}>
              <Typography sx={{ fontWeight: 700 }}>Grand Total (Incl. GST)</Typography>
              <Typography sx={{ fontWeight: 700 }}>₹{grandTotal.toFixed(2)}</Typography>
            </Box>
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Reports;
