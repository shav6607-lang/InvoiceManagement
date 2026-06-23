import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
} 
from '@mui/material';
import { Add, Search, Edit, Delete, Business } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { addCompany, updateCompany, deleteCompany, type Company } from '../../redux/slices/companySlice';
import { v4 as uuidv4 } from 'uuid';

declare module '@mui/material';
declare module '@mui/icons-material';
declare module '@mui/x-data-grid';

const companySchema = z.object({
  name: z.string().min(3, 'Company Name is required'),
  address: z.string().min(5, 'Address is required'),
  gstNo: z.string().min(15, 'Invalid GST No').max(15, 'Invalid GST No'),
  gstUinNo: z.string().optional(),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  email: z.string().email('Invalid Email').or(z.literal('')),
  phone: z.string().min(10, 'Invalid Phone Number'),
  bankDetails: z.string().optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

const INDIAN_STATES = [
  'Andhra Pradesh, Code : 37', 'Arunachal Pradesh, Code : 12', 'Assam, Code : 18', 'Bihar, Code : 10',
  'Chhattisgarh, Code : 22', 'Goa, Code : 30', 'Gujarat, Code : 24', 'Haryana, Code : 06',
  'Himachal Pradesh, Code : 02', 'Jharkhand, Code : 20', 'Karnataka, Code : 29', 'Kerala, Code : 32',
  'Madhya Pradesh, Code : 23', 'Maharashtra, Code : 27', 'Manipur, Code : 14', 'Meghalaya, Code : 17',
  'Mizoram, Code : 15', 'Nagaland, Code : 13', 'Odisha, Code : 21', 'Punjab, Code : 03',
  'Rajasthan, Code : 08', 'Sikkim, Code : 11', 'Tamil Nadu, Code : 33', 'Telangana, Code : 36',
  'Tripura, Code : 16', 'Uttar Pradesh, Code : 09', 'Uttarakhand, Code : 05', 'West Bengal, Code : 19',
  'Delhi, Code : 07', 'Puducherry, Code : 34', 'Chandigarh, Code : 04', 'Jammu and Kashmir, Code : 01', 'Ladakh, Code : 38',
];

const Companies: React.FC = () => {
  const dispatch = useAppDispatch();
  const { companies } = useAppSelector((state) => state.companies);

  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: { name: '', address: '', gstNo: '', gstUinNo: '', state: '', country: 'India', email: '', phone: '', bankDetails: '' },
  });

  const handleOpenDialog = (company?: Company) => {
    if (company) {
      setEditingCompany(company);
      reset({ ...company });
    } else {
      setEditingCompany(null);
      reset({ name: '', address: '', gstNo: '', gstUinNo: '', state: '', country: 'India', email: '', phone: '', bankDetails: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    reset();
  };

  const onSubmit = (data: CompanyFormData) => {
    if (editingCompany) {
      dispatch(updateCompany({ ...data, id: editingCompany.id }));
    } else {
      dispatch(addCompany({ ...data, id: uuidv4() }));
    }
    handleCloseDialog();
  };

  const handleDelete = () => {
    if (deleteDialogId) {
      dispatch(deleteCompany(deleteDialogId));
      setDeleteDialogId(null);
    }
  };

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.gstNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Company Name', flex: 1.5, minWidth: 200 },
    { field: 'gstNo', headerName: 'GST No', flex: 1, minWidth: 150 },
    { field: 'state', headerName: 'State', flex: 1, minWidth: 150 },
    { field: 'phone', headerName: 'Phone', flex: 1, minWidth: 120 },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      width: 120,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" color="primary" onClick={() => handleOpenDialog(params.row)}>
            <Edit fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => setDeleteDialogId(params.row.id)}>
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Business color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>Company Master</Typography>
            <Typography variant="body2" color="text.secondary">Manage multiple companies and their details</Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          Add Company
        </Button>
      </Box>

      <Box sx={{ display: 'flex', mb: 3 }}>
        <TextField
          placeholder="Search by name or GST..."
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: 300, bgcolor: 'background.paper' }}
          slotProps={{
            input: { startAdornment: <Search color="action" sx={{ mr: 1 }} /> }
          }}
        />
      </Box>

      <Box sx={{ height: 600, width: '100%', bgcolor: 'background.paper', borderRadius: 2 }}>
        <DataGrid
          rows={filteredCompanies}
          columns={columns}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          sx={{ border: 'none' }}
        />
      </Box>

      {/* Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          {editingCompany ? 'Edit Company' : 'Add New Company'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent dividers>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Company Name" fullWidth error={!!errors.name} helperText={errors.name?.message} />
                  )}
                />
              </Box>
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Address" fullWidth multiline rows={2} error={!!errors.address} helperText={errors.address?.message} />
                  )}
                />
              </Box>
              <Box>
                <Controller
                  name="gstNo"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="GST No" fullWidth error={!!errors.gstNo} helperText={errors.gstNo?.message} sx={{ '& .MuiInputBase-input': { textTransform: 'uppercase' } }} />
                  )}
                />
              </Box>
              <Box>
                <Controller
                  name="gstUinNo"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="GST UIN No" fullWidth error={!!errors.gstUinNo} helperText={errors.gstUinNo?.message} sx={{ '& .MuiInputBase-input': { textTransform: 'uppercase' } }} />
                  )}
                />
              </Box>
              <Box>
                <Controller
                  name="state"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="State" fullWidth error={!!errors.state} helperText={errors.state?.message}>
                      {INDIAN_STATES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </TextField>
                  )}
                />
              </Box>
              <Box>
                <Controller
                  name="country"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Country" fullWidth error={!!errors.country} helperText={errors.country?.message} />
                  )}
                />
              </Box>
              <Box>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Email Address" type="email" fullWidth error={!!errors.email} helperText={errors.email?.message} />
                  )}
                />
              </Box>
              <Box>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Phone Number" fullWidth error={!!errors.phone} helperText={errors.phone?.message} />
                  )}
                />
              </Box>
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Controller
                  name="bankDetails"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Bank Details (Account No, IFSC, Bank Name)" fullWidth multiline rows={3} placeholder="Bank: HDFC Bank&#10;Account No: 123456789&#10;IFSC: HDFC000123" error={!!errors.bankDetails} helperText={errors.bankDetails?.message} />
                  )}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingCompany ? 'Update' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteDialogId} onClose={() => setDeleteDialogId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Company</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this company?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogId(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Companies;
