// src/pages/CustomersPage.jsx
import { useState, useCallback, useDeferredValue } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, CircularProgress, IconButton, Chip,
  Avatar, Alert, Pagination, TextField, InputAdornment, MenuItem,
  Select, FormControl, InputLabel, Snackbar, Tooltip, Dialog,
  DialogTitle, DialogContent, DialogActions, Button, Divider,
} from '@mui/material';
import SearchIcon     from '@mui/icons-material/Search';
import DeleteIcon     from '@mui/icons-material/DeleteOutlined';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import GoogleIcon     from '@mui/icons-material/Google';
import PersonIcon     from '@mui/icons-material/Person';
import { useCustomerList, useDeleteCustomer } from '../hooks/useCustomers';

// ─── Summary Card ─────────────────────────────────────────────────────────────
function SummaryCard({ label, value, color = 'text.primary' }) {
  return (
    <Paper sx={{
      p: 2.5, borderRadius: 3, flex: 1, minWidth: 130,
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.08)',
    }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', color }}>{value ?? '—'}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{label}</Typography>
    </Paper>
  );
}

// ─── Auth Badge ───────────────────────────────────────────────────────────────
function AuthBadge({ method }) {
  return method === 'google' ? (
    <Chip
      icon={<GoogleIcon sx={{ fontSize: 14 }} />}
      label="Google" size="small"
      sx={{ bgcolor: '#fce8e6', color: '#c5221f', fontWeight: 600, border: 'none' }}
    />
  ) : (
    <Chip
      icon={<PersonIcon sx={{ fontSize: 14 }} />}
      label="Local" size="small"
      sx={{ bgcolor: '#e8f0fe', color: '#1a73e8', fontWeight: 600, border: 'none' }}
    />
  );
}

// ─── Customer Detail Dialog ───────────────────────────────────────────────────
function CustomerDetailDialog({ customer, onClose }) {
  if (!customer) return null;
  return (
    <Dialog open={!!customer} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>Customer Detail</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, py: 1 }}>
          <Avatar src={customer.avatar} sx={{ width: 72, height: 72 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{customer.name}</Typography>
          <Typography variant="body2" color="text.secondary">{customer.email}</Typography>
          <AuthBadge method={customer.authMethod} />
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {[
            ['ID',       customer._id],
            ['Verified', customer.isVerified ? 'Yes' : 'No'],
            ['Wishlist', `${customer.wishlist?.length ?? 0} items`],
            ['Joined',   new Date(customer.createdAt).toLocaleDateString()],
          ].map(([label, value]) => (
            <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">{label}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{value}</Typography>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" fullWidth>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CustomersPage() {
  const [page, setPage]             = useState(1);
  const [search, setSearch]         = useState('');
  const [authFilter, setAuthFilter] = useState('');
  const [viewTarget, setViewTarget] = useState(null);
  const [toast, setToast]           = useState({ open: false, message: '', severity: 'success' });

  const deferredSearch = useDeferredValue(search);

  const showToast = useCallback((message, severity = 'success') => {
    setToast({ open: true, message, severity });
  }, []);

  // ── Data ───────────────────────────────────────────────────────────────────
  const { data, isLoading, isError, error, prefetchNext } = useCustomerList({
    page,
    authMethod: authFilter,
    search:     deferredSearch,
  });

  const customers  = data?.customers  ?? [];
  const summary    = data?.summary    ?? {};
  const totalPages = data?.totalPages ?? 1;

  // ── Mutations ──────────────────────────────────────────────────────────────
  const deleteMutation = useDeleteCustomer({
    onSuccess: () => showToast('Customer deleted.'),
    onError:   (e) => showToast(e.message, 'error'),
  });

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSearch     = (e) => { setSearch(e.target.value); setPage(1); };
  const handleAuthFilter = (e) => { setAuthFilter(e.target.value); setPage(1); };
  const handlePageChange = (_, v) => { setPage(v); prefetchNext(); };

  // ── States ─────────────────────────────────────────────────────────────────
  if (isLoading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
      <CircularProgress />
    </Box>
  );

  if (isError) return (
    <Alert severity="error" sx={{ mt: 3 }}>
      {error?.message || 'Error loading customers.'}
    </Alert>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Box>

      {/* Header */}
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
        Customers
        <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1.5 }}>
          ({summary.total ?? 0} total)
        </Typography>
      </Typography>

      {/* Summary Cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <SummaryCard label="Total Customers" value={summary.total}      color="text.primary"  />
        <SummaryCard label="Google Auth"     value={summary.googleAuth} color="#c5221f"       />
        <SummaryCard label="Local Auth"      value={summary.localAuth}  color="#1a73e8"       />
        <SummaryCard label="Verified"        value={summary.verified}   color="success.main"  />
        <SummaryCard label="Unverified"      value={summary.unverified} color="warning.main"  />
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2.5, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search by name or email..."
          size="small" value={search} onChange={handleSearch}
          sx={{ minWidth: 260 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Auth Method</InputLabel>
          <Select value={authFilter} label="Auth Method" onChange={handleAuthFilter}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="google">Google</MenuItem>
            <MenuItem value="local">Local</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'background.default' }}>
              {['Customer', 'Email', 'Auth', 'Verified', 'Wishlist', 'Joined', 'Actions'].map((h) => (
                <TableCell key={h} align={h === 'Actions' ? 'right' : 'left'}
                  sx={{ fontWeight: 'bold', color: 'text.secondary' }}>{h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((row) => (
              <TableRow key={row._id}
                sx={{ '&:last-child td': { border: 0 }, '&:hover': { bgcolor: 'rgba(0,0,0,0.01)' } }}>

                {/* Customer */}
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar src={row.avatar} sx={{ width: 36, height: 36 }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row._id?.substring(0, 8)}...
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                {/* Email */}
                <TableCell>
                  <Typography variant="body2">{row.email}</Typography>
                </TableCell>

                {/* Auth */}
                <TableCell><AuthBadge method={row.authMethod} /></TableCell>

                {/* Verified */}
                <TableCell>
                  <Chip
                    label={row.isVerified ? 'Verified' : 'Unverified'} size="small"
                    color={row.isVerified ? 'success' : 'warning'} sx={{ fontWeight: 600 }}
                  />
                </TableCell>

                {/* Wishlist */}
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {row.wishlist?.length ?? 0} items
                  </Typography>
                </TableCell>

                {/* Joined */}
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(row.createdAt).toLocaleDateString()}
                  </Typography>
                </TableCell>

                {/* Actions */}
                <TableCell align="right">
                  <Tooltip title="View details">
                    <IconButton size="small" color="primary" onClick={() => setViewTarget(row)}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete customer">
                    <IconButton size="small" color="error"
                      onClick={() => deleteMutation.mutate(row._id)}
                      disabled={deleteMutation.isPending}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}

            {customers.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                  <Typography color="text.secondary">No customers found.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
        </Box>
      )}

      {/* Detail Dialog */}
      <CustomerDetailDialog customer={viewTarget} onClose={() => setViewTarget(null)} />

      {/* Toast */}
      <Snackbar
        open={toast.open} autoHideDuration={3000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={toast.severity} variant="filled" sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>

    </Box>
  );
}