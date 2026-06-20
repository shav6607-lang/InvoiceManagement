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
} from '@mui/material';
import { Add, Search, Edit, Delete, Security } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { addUser, updateUser, deleteUser, type User } from '../../redux/slices/userSlice';
import { v4 as uuidv4 } from 'uuid';

const userSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.string().min(1, 'Role is required'),
  company: z.string().min(1, 'Company is required'),
  email: z.string().email('Invalid email address'),
});

type UserFormData = z.infer<typeof userSchema>;

const ROLES = ['Admin', 'Manager', 'Clerk', 'Viewer'];

const Users: React.FC = () => {
  const dispatch = useAppDispatch();
  const { users } = useAppSelector((state) => state.users);
  const { companies } = useAppSelector((state) => state.companies);

  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: { username: '', password: '', role: '', company: '', email: '' },
  });

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      reset({ ...user });
    } else {
      setEditingUser(null);
      reset({ username: '', password: '', role: '', company: '', email: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    reset();
  };

  const onSubmit = (data: UserFormData) => {
    if (editingUser) {
      dispatch(updateUser({ ...data, id: editingUser.id }));
    } else {
      dispatch(addUser({ ...data, id: uuidv4() }));
    }
    handleCloseDialog();
  };

  const handleDelete = () => {
    if (deleteDialogId) {
      dispatch(deleteUser(deleteDialogId));
      setDeleteDialogId(null);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: GridColDef[] = [
    { field: 'username', headerName: 'Username', flex: 1, minWidth: 150 },
    { field: 'email', headerName: 'Email', flex: 1.5, minWidth: 200 },
    { field: 'role', headerName: 'Role', flex: 1, minWidth: 120 },
    { field: 'company', headerName: 'Company', flex: 1, minWidth: 150 },
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
          <Security color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>User Master</Typography>
            <Typography variant="body2" color="text.secondary">Manage application users and roles</Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          Add User
        </Button>
      </Box>

      <Box sx={{ display: 'flex', mb: 3 }}>
        <TextField
          placeholder="Search by username, email or company..."
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
          rows={filteredUsers}
          columns={columns}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          sx={{ border: 'none' }}
        />
      </Box>

      {/* User Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          {editingUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent dividers>
            <Box sx={{ display: 'grid', gap: 2 }}>
              <Controller
                name="username"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Username" fullWidth error={!!errors.username} helperText={errors.username?.message} />
                )}
              />
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Email Address" type="email" fullWidth error={!!errors.email} helperText={errors.email?.message} />
                )}
              />
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Password" type="password" fullWidth error={!!errors.password} helperText={errors.password?.message} />
                )}
              />
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Role" fullWidth error={!!errors.role} helperText={errors.role?.message}>
                    {ROLES.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                  </TextField>
                )}
              />
              <Controller
                name="company"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Company" fullWidth error={!!errors.company} helperText={errors.company?.message}>
                    {companies.map((c) => <MenuItem key={c.id} value={c.name}>{c.name}</MenuItem>)}
                  </TextField>
                )}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingUser ? 'Update' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteDialogId} onClose={() => setDeleteDialogId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this user? They will not be able to log in.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogId(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;
