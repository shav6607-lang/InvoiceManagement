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
import { Add, Search, Edit, Delete, Inventory2 } from '@mui/icons-material';
import Grid from '@mui/material/Unstable_Grid2';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  addProduct,
  updateProduct,
  deleteProduct,
  type Product,
} from '../../redux/slices/productSlice';
import { v4 as uuidv4 } from 'uuid';

const GST_RATES = [0, 5, 12, 18, 28];
const UNITS = ['Ton', 'KG', 'MT', 'Bag', 'Cum', 'Nos', 'Sqm'];

const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  hsnCode: z.string().min(2, 'HSN Code is required'),
  unit: z.string().min(1, 'Unit is required'),
  gstPercentage: z.coerce.number().min(0).max(28),
  rate: z.coerce.number().positive('Rate must be positive'),
});

type ProductForm = z.infer<typeof productSchema>;

const Products: React.FC = () => {
  const dispatch = useAppDispatch();
  const { products } = useAppSelector((state) => state.products);
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState('');
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<ProductForm>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: { name: '', hsnCode: '', unit: 'Ton', gstPercentage: 5, rate: 0 },
  });

  const openAdd = () => {
    setEditingProduct(null);
    reset({ name: '', hsnCode: '', unit: 'Ton', gstPercentage: 5, rate: 0 });
    setOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    reset(product);
    setOpen(true);
  };

  const onSubmit = (data: ProductForm) => {
    if (editingProduct) {
      dispatch(updateProduct({ ...data, id: editingProduct.id }));
    } else {
      dispatch(addProduct({ ...data, id: uuidv4() }));
    }
    setOpen(false);
  };

  const handleDelete = () => {
    if (deleteDialogId) {
      dispatch(deleteProduct(deleteDialogId));
      setDeleteDialogId(null);
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.hsnCode.includes(search)
  );

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Product Name', flex: 1, minWidth: 160 },
    {
      field: 'hsnCode', headerName: 'HSN Code', width: 130, renderCell: (p) => (
        <Chip label={p.value} size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} />
      )
    },
    { field: 'unit', headerName: 'Unit', width: 90 },
    {
      field: 'gstPercentage', headerName: 'GST %', width: 100,
      renderCell: (p) => <Chip label={`${p.value}%`} size="small" color="primary" variant="outlined" />
    },
    {
      field: 'rate', headerName: 'Rate (₹)', width: 120,
      renderCell: (p) => <Typography sx={{ fontWeight: 600 }}>₹{Number(p.value).toLocaleString('en-IN')}</Typography>
    },
    {
      field: 'actions', headerName: 'Actions', width: 120, sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" color="primary" onClick={() => openEdit(params.row as Product)}>
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
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Products</Typography>
          <Typography variant="body2" color="text.secondary">Manage your product catalogue</Typography>
        </Box>
        <Button id="add-product-btn" variant="contained" startIcon={<Inventory2 />} onClick={openAdd}>
          Add Product
        </Button>
      </Box>

      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 3 }}>
          <TextField
            id="product-search"
            placeholder="Search by name or HSN code..."
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
        <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={2} mt={0}>
              <Grid xs={12}>
                <Controller name="name" control={control} render={({ field }) => (
                  <TextField {...field} label="Product Name" fullWidth error={!!errors.name} helperText={errors.name?.message} />
                )} />
              </Grid>
              <Grid xs={6}>
                <Controller name="hsnCode" control={control} render={({ field }) => (
                  <TextField {...field} label="HSN Code" fullWidth error={!!errors.hsnCode} helperText={errors.hsnCode?.message} />
                )} />
              </Grid>
              <Grid xs={6}>
                <Controller name="unit" control={control} render={({ field }) => (
                  <TextField {...field} label="Unit" select fullWidth error={!!errors.unit} helperText={errors.unit?.message}>
                    {UNITS.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                  </TextField>
                )} />
              </Grid>
              <Grid xs={6}>
                <Controller name="gstPercentage" control={control} render={({ field }) => (
                  <TextField {...field} label="GST %" select fullWidth error={!!errors.gstPercentage} helperText={errors.gstPercentage?.message}>
                    {GST_RATES.map((r) => <MenuItem key={r} value={r}>{r}%</MenuItem>)}
                  </TextField>
                )} />
              </Grid>
              <Grid xs={6}>
                <Controller name="rate" control={control} render={({ field }) => (
                  <TextField {...field} label="Rate (₹ per Unit)" type="number" fullWidth error={!!errors.rate} helperText={errors.rate?.message} />
                )} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" startIcon={<Add />}>
              {editingProduct ? 'Update' : 'Add Product'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteDialogId} onClose={() => setDeleteDialogId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this product?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogId(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products;
