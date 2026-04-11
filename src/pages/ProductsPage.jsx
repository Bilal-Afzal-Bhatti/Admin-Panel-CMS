// src/pages/ProductsPage.jsx
import { useState, useCallback } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, CircularProgress,
  IconButton, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, InputAdornment, Pagination, Alert, Snackbar,
} from '@mui/material';
import AddIcon    from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon   from '@mui/icons-material/EditOutlined';
import {
  useProductList,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from '../hooks/useproducts';

// ─── Constants ────────────────────────────────────────────────────────────────
const EMPTY_FORM = { name: '', price: '', stock: '', image: '', discount: '' };

// ─── Validation ───────────────────────────────────────────────────────────────
const validate = (form) => {
  const errs = {};
  if (!form.name)                                  errs.name  = 'Product name is required.';
  if (!form.image)                                 errs.image = 'Image URL is required.';
  if (form.price === '' || Number(form.price) < 0) errs.price = 'Valid positive price is required.';
  if (form.stock === '' || Number(form.stock) < 0) errs.stock = 'Valid stock count is required.';
  return errs;
};

// ─── ProductForm ──────────────────────────────────────────────────────────────
function ProductForm({ form, setForm, errors, setErrors }) {
  const handle = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
      <TextField label="Product Name" fullWidth required
        value={form.name} onChange={handle('name')}
        error={!!errors.name} helperText={errors.name} />
      <TextField label="Image URL" fullWidth required
        placeholder="https://example.com/image.jpg"
        value={form.image} onChange={handle('image')}
        error={!!errors.image} helperText={errors.image} />
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField label="Price" type="number" fullWidth required
          InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
          value={form.price} onChange={handle('price')}
          error={!!errors.price} helperText={errors.price} />
        <TextField label="Stock" type="number" fullWidth required
          value={form.stock} onChange={handle('stock')}
          error={!!errors.stock} helperText={errors.stock} />
      </Box>
      <TextField label="Discount (Optional)" fullWidth placeholder="e.g. 20% OFF"
        value={form.discount} onChange={handle('discount')} />
    </Box>
  );
}

// ─── ProductDialog ────────────────────────────────────────────────────────────
function ProductDialog({ open, title, form, setForm, errors, setErrors, isPending, onClose, onSave }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>{title}</DialogTitle>
      <DialogContent dividers>
        <ProductForm form={form} setForm={setForm} errors={errors} setErrors={setErrors} />
      </DialogContent>
      <DialogActions sx={{ p: 2, px: 3 }}>
        <Button onClick={onClose} color="inherit" disabled={isPending}>Cancel</Button>
        <Button onClick={onSave} variant="contained" disableElevation disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Product'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const [page, setPage]             = useState(1);
  const [addOpen, setAddOpen]       = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [errors, setErrors]         = useState({});
  const [toast, setToast]           = useState({ open: false, message: '', severity: 'success' });

  const showToast = useCallback((message, severity = 'success') => {
    setToast({ open: true, message, severity });
  }, []);

  // ── Data ───────────────────────────────────────────────────────────────────
  const { data, isLoading, isError, error, prefetchNext } = useProductList(page);
  const products   = data?.products   ?? [];
  const totalPages = data?.totalPages ?? 1;

  // ── Mutations ──────────────────────────────────────────────────────────────
  const createMutation = useCreateProduct({
    onSuccess: () => { setAddOpen(false); setForm(EMPTY_FORM); setErrors({}); showToast('Product added!'); },
    onError:   (e) => showToast(e.message, 'error'),
  });

  const updateMutation = useUpdateProduct({
    onSuccess: () => { setEditTarget(null); setForm(EMPTY_FORM); setErrors({}); showToast('Product updated!'); },
    onError:   (e) => showToast(e.message, 'error'),
  });

  const deleteMutation = useDeleteProduct({
    onSuccess: () => showToast('Product deleted.'),
    onError:   (e) => showToast(e.message, 'error'),
  });

  // ── Handlers ───────────────────────────────────────────────────────────────
  const openAdd = () => { setForm(EMPTY_FORM); setErrors({}); setAddOpen(true); };

  const openEdit = (product) => {
    setEditTarget(product);
    setForm({
      name:     product.name,
      price:    String(product.price),
      stock:    String(product.stock),
      image:    product.image,
      discount: product.discount === 'No Discount' ? '' : product.discount,
    });
    setErrors({});
  };

  const handleSave = (isEdit) => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const payload = {
      ...form,
      price:    parseFloat(form.price),
      stock:    parseInt(form.stock, 10),
      discount: form.discount || 'No Discount',
    };
    if (isEdit) updateMutation.mutate({ id: editTarget._id, ...payload });
    else        createMutation.mutate(payload);
  };

  const handlePageChange = (_, v) => { setPage(v); prefetchNext(); };

  // ── States ─────────────────────────────────────────────────────────────────
  if (isLoading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
      <CircularProgress />
    </Box>
  );

  if (isError) return (
    <Alert severity="error" sx={{ mt: 3 }}>{error?.message || 'Error loading products.'}</Alert>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Box>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Products
          <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1.5 }}>
            ({data?.total ?? 0} total)
          </Typography>
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd} sx={{ borderRadius: 2 }}>
          Add Product
        </Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'background.default' }}>
              {['Product', 'Sale Price', 'Promo Info', 'Stock', 'Actions'].map((h) => (
                <TableCell key={h} align={h === 'Actions' ? 'right' : 'left'}
                  sx={{ fontWeight: 'bold', color: 'text.secondary' }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((row) => (
              <TableRow key={row._id}
                sx={{ '&:last-child td': { border: 0 }, '&:hover': { bgcolor: 'rgba(0,0,0,0.01)' } }}>

                {/* Product */}
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box component="img" src={row.image} alt={row.name}
                      sx={{ width: 48, height: 48, borderRadius: 1, objectFit: 'cover' }} />
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{row.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {row._id?.substring(0, 8)}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                {/* Price */}
                <TableCell>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    ${row.price}
                  </Typography>
                  {row.originalPrice && (
                    <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                      ${row.originalPrice}
                    </Typography>
                  )}
                </TableCell>

                {/* Discount */}
                <TableCell>
                  <Chip label={row.discount} size="small" color="error"
                    variant="outlined" sx={{ fontWeight: 'bold' }} />
                </TableCell>

                {/* Stock */}
                <TableCell>
                  <Chip
                    label={`${row.stock} in stock`} size="small" sx={{ fontWeight: 600 }}
                    color={row.stock > 10 ? 'success' : row.stock > 0 ? 'warning' : 'error'}
                  />
                </TableCell>

                {/* Actions */}
                <TableCell align="right">
                  <IconButton color="primary" size="small" onClick={() => openEdit(row)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton color="error" size="small"
                    onClick={() => deleteMutation.mutate(row._id)}
                    disabled={deleteMutation.isPending}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                  <Typography color="text.secondary">No products found. Add some!</Typography>
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

      {/* Add Dialog */}
      <ProductDialog
        open={addOpen} title="Add New Product"
        form={form} setForm={setForm} errors={errors} setErrors={setErrors}
        isPending={createMutation.isPending}
        onClose={() => setAddOpen(false)}
        onSave={() => handleSave(false)}
      />

      {/* Edit Dialog */}
      <ProductDialog
        open={!!editTarget} title="Edit Product"
        form={form} setForm={setForm} errors={errors} setErrors={setErrors}
        isPending={updateMutation.isPending}
        onClose={() => setEditTarget(null)}
        onSave={() => handleSave(true)}
      />

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