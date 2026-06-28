import React, { useState } from 'react';
import {
  Box, Typography, Button, Card,
  IconButton, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Tooltip, Chip, MenuItem,
  FormControlLabel, Checkbox, InputAdornment,
  CircularProgress, Alert, Snackbar,
} from '@mui/material';
import {
  Add, Edit, Search, Inventory2 as Inventory2Icon,
  CheckCircle, Cancel, Refresh,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppSelector } from '../../redux/hooks';
import { materialApi } from '@/services/api';
import { useAuthenticatedEffect } from '@/hooks/useAuthenticatedEffect';
import { getErrorMessage } from '@/utils/errors';

const MATERIAL_TYPES = [
  { value: 1, label: 'Invoice' },
  { value: 2, label: 'Delivery' },
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface Company {
  CompanyId: number;
  Name: string;
}

interface Material {
  MaterialId: number;
  CompanyId: number;
  CompanyName?: string;
  MaterialName: string;
  RatePerUnit: number;
  IsActive: boolean;
  MaterialType: number;
  MaterialTypeName?: string;
}

// ─── Validation Schema ────────────────────────────────────────────────────────
const materialSchema = z.object({
  CompanyId: z.coerce.number().min(1, 'Company is required'),
  MaterialName: z.string().min(1, 'Material name is required'),
  RatePerUnit: z.coerce.number().min(0.01, 'Rate must be greater than 0'),
  IsActive: z.boolean(),
  MaterialType: z.coerce.number().min(1, 'Material type is required'),
});

type MaterialForm = z.infer<typeof materialSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const materialTypeName = (type: number) =>
  MATERIAL_TYPES.find((t) => t.value === type)?.label ?? '—';

// ─── Main Component ───────────────────────────────────────────────────────────
const Materials: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  // ── List state ──
  const [materials, setMaterials] = useState<Material[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ── Dialog state ──
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  // ── Form ──
  const { control, handleSubmit, reset, formState: { errors } } = useForm<MaterialForm>({
    resolver: zodResolver(materialSchema) as any,
    defaultValues: {
      CompanyId: 0,
      MaterialName: '',
      RatePerUnit: 0,
      IsActive: true,
      MaterialType: 1,
    },
  });

  // ── Auth headers ──
  const fetchData = async () => {
    setListLoading(true);
    setListError(null);
    try {
      const [companyJson, materialJson] = await Promise.all([
        materialApi.getCompanies(),
        materialApi.getList(),
      ]);

      if (Array.isArray(companyJson?.Data)) setCompanies(companyJson.Data);
      if (Array.isArray(materialJson?.Data)) setMaterials(materialJson.Data);
    } catch {
      setListError('Failed to load data. Please check the backend connection.');
    } finally {
      setListLoading(false);
    }
  };

  useAuthenticatedEffect(() => {
    fetchData();
  });

  // ── Open Add Dialog ──
  const openAdd = () => {
    setEditingMaterial(null);
    setSaveError(null);
    reset({ CompanyId: 0, MaterialName: '', RatePerUnit: 0, IsActive: true, MaterialType: 1 });
    setDialogOpen(true);
  };

  // ── Open Edit Dialog ──
  const openEdit = (mat: Material) => {
    setEditingMaterial(mat);
    setSaveError(null);
    reset({
      CompanyId: mat.CompanyId,
      MaterialName: mat.MaterialName,
      RatePerUnit: mat.RatePerUnit,
      IsActive: mat.IsActive,
      MaterialType: mat.MaterialType,
    });
    setDialogOpen(true);
  };

  // ── Submit (Add / Update) ──
  const onSubmit = async (data: MaterialForm) => {
    setSaving(true);
    setSaveError(null);
    try {
      const payload = {
        MaterialId: editingMaterial?.MaterialId ?? 0,
        CompanyId: data.CompanyId,
        MaterialName: data.MaterialName,
        RatePerUnit: data.RatePerUnit,
        IsActive: data.IsActive,
        MaterialType: data.MaterialType,
        UserId: user?.UserId ?? 0,
      };

      await materialApi.addMaterial(payload);

      setDialogOpen(false);
      setSnackbar({
        open: true,
        message: editingMaterial
          ? 'Material updated successfully!'
          : 'Material added successfully!',
        severity: 'success',
      });
      await fetchData(); // Refresh list
    } catch (err: unknown) {
      setSaveError(getErrorMessage(err, 'An error occurred while saving.'));
    } finally {
      setSaving(false);
    }
  };

  // ── Filter ──
  const filtered = materials.filter(
    (m) =>
      m.MaterialName.toLowerCase().includes(search.toLowerCase()) ||
      (m.CompanyName ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const companyName = (id: number) =>
    companies.find((c) => c.CompanyId === id)?.Name ?? `Company #${id}`;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

      {/* ── Page Header ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }} color="#111827">
            Material Master
          </Typography>
          <Typography variant="body2" color="#6b7280">
            Manage materials used in invoices and delivery challans
          </Typography>
        </Box>
        <Button
          id="add-material-btn"
          variant="contained"
          startIcon={<Add />}
          onClick={openAdd}
          sx={{
            bgcolor: '#2563eb',
            '&:hover': { bgcolor: '#1e40af' },
            boxShadow: 3,
            fontWeight: 700,
            px: 3,
            py: 1.2,
            borderRadius: 2.5,
          }}
        >
          Add Material
        </Button>
      </Box>

      {/* ── Search & Refresh Bar ── */}
      <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search by material name or company..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            size="small"
            sx={{ minWidth: 320 }}
            slotProps={{ input: { startAdornment: (<InputAdornment position="start"><Search fontSize="small" /></InputAdornment>) } }}
          />
          <Tooltip title="Refresh">
            <IconButton
              color="primary"
              onClick={fetchData}
              sx={{ border: '1px solid', borderColor: 'primary.main' }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
          <Box sx={{ ml: 'auto' }}>
            <Chip
              label={`${filtered.length} material${filtered.length !== 1 ? 's' : ''}`}
              size="small"
              variant="outlined"
              color="primary"
              sx={{ fontWeight: 600 }}
            />
          </Box>
        </Box>
      </Card>

      {/* ── Error Banner ── */}
      {listError && (
        <Alert severity="error" onClose={() => setListError(null)}>
          {listError}
        </Alert>
      )}

      {/* ── Data Table ── */}
      <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 560 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow sx={{ '& th': { bgcolor: '#f8fafc', color: '#475569', fontWeight: 700, fontSize: '0.8rem', borderBottom: '2px solid #e2e8f0' } }}>
                <TableCell sx={{ width: 90 }}>Actions</TableCell>
                <TableCell>Material Name</TableCell>
                <TableCell>Company</TableCell>
                <TableCell align="right">Rate / Unit (₹)</TableCell>
                <TableCell align="center">Type</TableCell>
                <TableCell align="center">Active</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {listLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <CircularProgress size={32} />
                    <Typography color="text.secondary" sx={{ mt: 2 }}>Loading materials…</Typography>
                  </TableCell>
                </TableRow>
              ) : paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Inventory2Icon sx={{ fontSize: 48, color: '#94a3b8', mb: 1, display: 'block', mx: 'auto' }} />
                    <Typography color="text.secondary">
                      {search ? 'No materials match your search.' : 'No materials found. Click "Add Material" to get started.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((mat) => (
                  <TableRow key={mat.MaterialId} hover sx={{ '&:nth-of-type(even)': { bgcolor: '#f8fafc' } }}>
                    <TableCell sx={{ py: 1 }}>
                      <Tooltip title="Edit Material">
                        <IconButton size="small" color="primary" onClick={() => openEdit(mat)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>
                      {mat.MaterialName}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={mat.CompanyName || companyName(mat.CompanyId)}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#0369a1' }}>
                      ₹{Number(mat.RatePerUnit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={materialTypeName(mat.MaterialType)}
                        size="small"
                        color={mat.MaterialType === 1 ? 'primary' : 'warning'}
                        sx={{ fontWeight: 600, fontSize: '0.72rem' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {mat.IsActive ? (
                        <CheckCircle sx={{ color: '#16a34a', fontSize: 20 }} />
                      ) : (
                        <Cancel sx={{ color: '#dc2626', fontSize: 20 }} />
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filtered.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        />
      </Card>

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{
          fontWeight: 800,
          background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
          color: '#fff',
          pb: 2,
        }}>
          {editingMaterial ? '✏️ Edit Material' : '➕ Add Material'}
        </DialogTitle>

        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ pt: 3 }}>

            {saveError && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSaveError(null)}>
                {saveError}
              </Alert>
            )}

            {/* Company Dropdown */}
            <Controller
              name="CompanyId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Company *"
                  select
                  fullWidth
                  size="small"
                  sx={{ mb: 2 }}
                  error={!!errors.CompanyId}
                  helperText={errors.CompanyId?.message}
                >
                  <MenuItem value={0} disabled>— Select Company —</MenuItem>
                  {companies.map((c) => (
                    <MenuItem key={c.CompanyId} value={c.CompanyId}>
                      {c.Name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            {/* Material Name */}
            <Controller
              name="MaterialName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Material Name *"
                  fullWidth
                  size="small"
                  sx={{ mb: 2 }}
                  error={!!errors.MaterialName}
                  helperText={errors.MaterialName?.message}
                  placeholder="e.g. M-Sand, 12MM Jelly, River Sand"
                />
              )}
            />

            {/* Rate Per Unit */}
            <Controller
              name="RatePerUnit"
              control={control}
              render={({ field }) => (
                  <TextField
                  {...field}
                  label="Rate Per Unit (₹) *"
                  type="number"
                  fullWidth
                  size="small"
                  sx={{ mb: 2 }}
                  error={!!errors.RatePerUnit}
                  helperText={errors.RatePerUnit?.message}
                  slotProps={{ htmlInput: { min: 0, step: 0.01 }, input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
                />
              )}
            />

            {/* Material Type Dropdown */}
            <Controller
              name="MaterialType"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Material Type *"
                  select
                  fullWidth
                  size="small"
                  sx={{ mb: 2 }}
                  error={!!errors.MaterialType}
                  helperText={errors.MaterialType?.message}
                >
                  {MATERIAL_TYPES.map((t) => (
                    <MenuItem key={t.value} value={t.value}>
                      {t.label} ({t.value})
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            {/* Is Active Checkbox */}
            <Controller
              name="IsActive"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      color="primary"
                    />
                  }
                    label={
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Active
                    </Typography>
                  }
                />
              )}
            />
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button
              onClick={() => setDialogOpen(false)}
              disabled={saving}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Add />}
              sx={{
                bgcolor: '#2563eb',
                '&:hover': { bgcolor: '#1e40af' },
                fontWeight: 700,
                borderRadius: 2,
                minWidth: 140,
              }}
            >
              {saving ? 'Saving…' : editingMaterial ? 'Update Material' : 'Add Material'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ── Success / Error Snackbar ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          variant="filled"
          sx={{ fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Materials;
