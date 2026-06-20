import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  
  IconButton,
  InputAdornment,
  Chip,
  MenuItem,
} from '@mui/material';
import {
  Add,
  Search,
  Edit,
  Delete,
  PersonAdd,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  addCustomer,
  updateCustomer,
  deleteCustomer,
  type Customer,
} from '../../redux/slices/customerSlice';
import { v4 as uuidv4 } from 'uuid';
const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Puducherry','Chandigarh','Jammu and Kashmir','Ladakh',
];

const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  gstin: z.string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format')
    .or(z.literal('URP')).or(z.literal('')),
  address: z.string().min(5, 'Address is required'),
  phoneNumber: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  state: z.string().min(1, 'State is required'),
  email: z.string().email('Invalid email').or(z.literal('')),
});

type CustomerForm = z.infer<typeof customerSchema>;

const Customers: React.FC = () => {
  const dispatch = useAppDispatch();
  const { customers } = useAppSelector((state) => state.customers);
  const [open, setOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [search, setSearch] = useState('');
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
    defaultValues: { name: '', gstin: '', address: '', phoneNumber: '', state: '', email: '' },
  });

  const openAdd = () => {
    setEditingCustomer(null);
    reset({ name: '', gstin: '', address: '', phoneNumber: '', state: '', email: '' });
    setOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    reset(customer);
    setOpen(true);
  };

  const onSubmit = (data: CustomerForm) => {
    if (editingCustomer) {
      dispatch(updateCustomer({ ...data, id: editingCustomer.id }));
    } else {
      dispatch(addCustomer({ ...data, id: uuidv4() }));
    }
    setOpen(false);
  };

  const handleDelete = () => {
    if (deleteDialogId) {
      dispatch(deleteCustomer(deleteDialogId));
      setDeleteDialogId(null);
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.gstin.toLowerCase().includes(search.toLowerCase()) ||
      c.phoneNumber.includes(search)
  );

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Customer Name', flex: 1, minWidth: 160 },
    { field: 'gstin', headerName: 'GSTIN', flex: 1, minWidth: 180, renderCell: (p) => (
      <Chip label={p.value} size="small" variant="outlined" sx={{ fontFamily: 'monospace', fontSize: 11 }} />
    )},
    { field: 'phoneNumber', headerName: 'Phone', width: 130 },
    { field: 'state', headerName: 'State', width: 140 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 180 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" color="primary" onClick={() => openEdit(params.row as Customer)}>
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
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Customers</Typography>
          <Typography variant="body2" color="text.secondary">Manage your customer master data</Typography>
        </Box>
        <Button id="add-customer-btn" variant="contained" startIcon={<PersonAdd />} onClick={openAdd}>
          Add Customer
        </Button>
      </Box>

      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 3 }}>
          <TextField
            id="customer-search"
            placeholder="Search by name, GSTIN, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ mb: 2, minWidth: 320 }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> } }}
          />
          <DataGrid
            rows={filtered}
            columns={columns}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            disableRowSelectionOnClick
            autoHeight
            sx={{ border: 'none' }}
          />
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCustomer ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
         <DialogContent>
  <Box
    sx={{
      mt: 0,
      display: 'grid',
      gridTemplateColumns: 'repeat(12, 1fr)',
      gap: 2
    }}
  >
    <Box sx={{ gridColumn: 'span 12' }}>
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Customer Name"
            fullWidth
            error={!!errors.name}
            helperText={errors.name?.message}
          />
        )}
      />
    </Box>

    <Box sx={{ gridColumn: 'span 12' }}>
      <Controller
        name="address"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Address"
            fullWidth
            multiline
            rows={2}
            error={!!errors.address}
            helperText={errors.address?.message}
          />
        )}
      />
    </Box>

    <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
      <Controller
        name="phoneNumber"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Phone Number"
            fullWidth
            error={!!errors.phoneNumber}
            helperText={errors.phoneNumber?.message}
          />
        )}
      />
    </Box>

    <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
      <Controller
        name="state"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="State"
            select
            fullWidth
            error={!!errors.state}
            helperText={errors.state?.message}
          >
            {INDIAN_STATES.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
        )}
      />
    </Box>

    <Box sx={{ gridColumn: 'span 12' }}>
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Email (Optional)"
            fullWidth
            error={!!errors.email}
            helperText={errors.email?.message}
          />
        )}
      />
    </Box>
  </Box>
</DialogContent>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" startIcon={<Add />}>
              {editingCustomer ? 'Update' : 'Add Customer'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteDialogId} onClose={() => setDeleteDialogId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Customer</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this customer? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogId(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Customers;
