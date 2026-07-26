import { useState, useCallback } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, CircularProgress,
  IconButton, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, InputAdornment, Alert, Snackbar,
  Rating, MenuItem, Tooltip, Avatar, Card
} from '@mui/material';
import AddIcon         from '@mui/icons-material/Add';
import DeleteIcon      from '@mui/icons-material/DeleteOutlined';
import EditIcon        from '@mui/icons-material/EditOutlined';
import PaletteIcon     from '@mui/icons-material/Palette';
import {
  useProductList,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from '../hooks/useProducts';

// ─── Constants ────────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  name: '', price: '', image: '', discount: '', category: 'Other', variants: [],
};

const COLOR_OPTIONS = [
  { name: 'Red',    hex: '#FF0000' }, { name: 'Blue',   hex: '#0000FF' },
  { name: 'Green',  hex: '#008000' }, { name: 'Black',  hex: '#000000' },
  { name: 'White',  hex: '#FFFFFF' }, { name: 'Yellow', hex: '#FFFF00' },
  { name: 'Pink',   hex: '#FFC0CB' }, { name: 'Purple', hex: '#800080' },
  { name: 'Orange', hex: '#FFA500' }, { name: 'Grey',   hex: '#808080' },
  { name: 'Navy',   hex: '#000080' },
];

const SIZE_OPTIONS = [
  'XS', 'S', 'M', 'L', 'XL', 'XXL',
  '38', '39', '40', '41', '42', '43', '44', 'One Size',
];

const CATEGORIES = [
 'Flash Sales', 'New Arrival','Our Products', 'Electronics', 'Clothing', 'Footwear', 'Accessories', 'Home & Kitchen',
  'Beauty & Health', 'Sports & Outdoors', 'Toys & Games', 'Books', 'Other',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const calcTotalStock = (variants) =>
  (variants || []).reduce((sum, v) => sum + (Number(v.stock) || 0), 0);

// ─── Validation ───────────────────────────────────────────────────────────────
const validate = (form) => {
  const errs = {};
  if (!form.name)  errs.name  = 'Product name is required.';
  if (!form.image) errs.image = 'Image URL is required.';
  if (form.price === '' || Number(form.price) < 0) errs.price = 'Price cannot be negative.';
  return errs;
};

// ─── ProductForm ──────────────────────────────────────────────────────────────
function ProductForm({ form, setForm, errors, setErrors }) {
  const [newVariant, setNewVariant] = useState({
    color: { name: '', hex: '#000000' }, size: '', stock: 0,
  });

  const handle = (field) => (e) => {
    let val = e.target.value;
    if (field === 'price' && val < 0) val = 0;
    setForm((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleColorSelect = (e) => {
    const selected = COLOR_OPTIONS.find((c) => c.name === e.target.value);
    if (selected)
      setNewVariant((prev) => ({ ...prev, color: { name: selected.name, hex: selected.hex } }));
  };

  // ✅ UPDATED: Supports updating existing variants & preserves subdocument _id
  const addVariantToForm = () => {
    if (!newVariant.color.name || !newVariant.size) return;

    const newStockVal = Math.max(0, Number(newVariant.stock) || 0);

    setForm((prev) => {
      const existingIndex = prev.variants.findIndex(
        (v) =>
          v.color.name.toLowerCase() === newVariant.color.name.toLowerCase() &&
          v.size.toLowerCase() === newVariant.size.toLowerCase()
      );

      if (existingIndex > -1) {
        // Variant exists: Update stock & keep existing _id!
        const updatedVariants = [...prev.variants];
        updatedVariants[existingIndex] = {
          ...updatedVariants[existingIndex],
          stock: newStockVal,
        };
        return { ...prev, variants: updatedVariants };
      }

      // New variant: Append to list
      return {
        ...prev,
        variants: [
          ...prev.variants,
          { ...newVariant, stock: newStockVal },
        ],
      };
    });

    // Reset input fields
    setNewVariant({ color: { name: '', hex: '#000000' }, size: '', stock: 0 });
  };

  const removeVariantFromForm = (index) =>
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));

  const totalStock = calcTotalStock(form.variants);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>

      {/* Name */}
      <TextField
        label="Product Name" fullWidth required
        value={form.name} onChange={handle('name')}
        error={!!errors.name} helperText={errors.name}
      />

      {/* Category */}
      <TextField select label="Category" fullWidth required
        value={form.category} onChange={handle('category')}
      >
        {CATEGORIES.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
      </TextField>

      {/* Image */}
      <TextField
        label="Image URL" fullWidth required
        value={form.image} onChange={handle('image')}
        error={!!errors.image} helperText={errors.image}
      />

      {/* Price + Discount */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          label="Price" type="number" fullWidth required
          InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
          value={form.price} onChange={handle('price')}
          error={!!errors.price} helperText={errors.price}
        />

        {/* Discount */}
        <TextField
          label="Discount"
          fullWidth
          value={form.discount}
          onChange={handle('discount')}
          placeholder="No Discount"
          InputProps={{
            endAdornment: form.discount ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setForm((p) => ({ ...p, discount: '' }))}>
                  ✕
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          helperText='Leave empty for "No Discount"'
        />
      </Box>

      {/* Variant Builder */}
      <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
        ADD / UPDATE VARIANTS
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          select label="Color" size="small" sx={{ flex: 2, minWidth: 120 }}
          value={newVariant.color.name} onChange={handleColorSelect}
        >
          {COLOR_OPTIONS.map((opt) => (
            <MenuItem key={opt.name} value={opt.name}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: opt.hex, border: '1px solid #ccc' }} />
                {opt.name}
              </Box>
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select label="Size" size="small" sx={{ flex: 1.5, minWidth: 100 }}
          value={newVariant.size}
          onChange={(e) => setNewVariant((prev) => ({ ...prev, size: e.target.value }))}
        >
          {SIZE_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
        </TextField>

        <TextField
          type="number" label="Stock" size="small" sx={{ flex: 1, minWidth: 80 }}
          value={newVariant.stock}
          onChange={(e) =>
            setNewVariant((prev) => ({
              ...prev,
              stock: Math.max(0, parseInt(e.target.value) || 0),
            }))
          }
        />

        <Button
          variant="contained" size="small"
          onClick={addVariantToForm}
          disabled={!newVariant.color.name || !newVariant.size}
          sx={{ height: 40, px: 2 }}
        >
          Add / Update
        </Button>
      </Box>

      {/* Variant Chips */}
      {form.variants.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {form.variants.map((v, i) => (
            <Chip
              key={v._id || i}
              avatar={<Avatar sx={{ bgcolor: v.color.hex, width: 22, height: 22 }}> </Avatar>}
              label={`${v.color.name} / ${v.size} — ${v.stock}`}
              onDelete={() => removeVariantFromForm(i)}
              size="small"
              variant="outlined"
            />
          ))}
        </Box>
      )}

      {/* Total Stock */}
      <Box
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 2, py: 1.5, borderRadius: 2,
          bgcolor: 'action.hover',
          border: '1px dashed',
          borderColor: totalStock > 0 ? 'success.main' : 'text.disabled',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Total Stock (auto-calculated from variants)
        </Typography>
        <Typography
          variant="h6" fontWeight="bold"
          color={totalStock > 0 ? 'success.main' : 'text.disabled'}
        >
          {totalStock}
        </Typography>
      </Box>

    </Box>
  );
}

// ─── ProductDialog ─────────────────────────────────────────────────────────
function ProductDialog({
  open, title, form, setForm, errors, setErrors, isPending, onClose, onSave,
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>{title}</DialogTitle>
      <DialogContent dividers>
        <ProductForm form={form} setForm={setForm} errors={errors} setErrors={setErrors} />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={onSave} variant="contained" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Product'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── VariantViewer ─────────────────────────────────────────────────────────
function VariantViewer({ product, onClose }) {
  if (!product) return null;
  const variants = product.variants || [];

  return (
    <Dialog open={Boolean(product)} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>
        Variants — {product.name}
        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
          Total stock: {product.stock ?? 0}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Box
          sx={{
            display: 'flex', gap: 2, overflowX: 'auto', py: 1,
            '&::-webkit-scrollbar': { height: '8px' },
            '&::-webkit-scrollbar-thumb': { bgcolor: '#ccc', borderRadius: '4px' },
          }}
        >
          {variants.length > 0 ? (
            variants.map((v, i) => (
              <Card
                key={v._id || i} variant="outlined"
                sx={{ minWidth: 120, textAlign: 'center', p: 2, borderRadius: 2, flexShrink: 0 }}
              >
                <Box sx={{
                  width: 30, height: 30, borderRadius: '50%',
                  bgcolor: v.color.hex, border: '2px solid #ddd', mx: 'auto', mb: 1,
                }} />
                <Typography variant="subtitle2" fontWeight="bold">{v.color.name}</Typography>
                <Chip label={v.size} size="small" sx={{ my: 0.5 }} />
                <Typography variant="caption" color="text.secondary" display="block">Stock</Typography>
                <Typography variant="h6" color={v.stock > 0 ? 'primary.main' : 'error.main'}>
                  {v.stock}
                </Typography>
              </Card>
            ))
          ) : (
            <Typography sx={{ p: 2 }} color="text.secondary">No variants available.</Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions><Button onClick={onClose}>Close</Button></DialogActions>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const [page, setPage]                     = useState(1);
  const [addOpen, setAddOpen]               = useState(false);
  const [editTarget, setEditTarget]         = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [form, setForm]                     = useState(EMPTY_FORM);
  const [errors, setErrors]                 = useState({});
  const [toast, setToast]                   = useState({ open: false, message: '', severity: 'success' });

  const { data, isLoading } = useProductList(page);
  const products = data?.products ?? [];

  const showToast = useCallback(
    (message, severity = 'success') => setToast({ open: true, message, severity }),
    []
  );

  const createMutation = useCreateProduct({
    onSuccess: () => { setAddOpen(false); setForm(EMPTY_FORM); showToast('Product added!'); },
    onError:   (e) => showToast(e.message, 'error'),
  });

  const updateMutation = useUpdateProduct({
    onSuccess: () => { setEditTarget(null); setForm(EMPTY_FORM); showToast('Product updated!'); },
    onError:   (e) => showToast(e.message, 'error'),
  });

  const deleteMutation = useDeleteProduct({
    onSuccess: () => showToast('Product deleted.'),
    onError:   (e) => showToast(e.message, 'error'),
  });

  const handleSave = (isEdit) => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const payload = {
      name:          form.name,
      price:         parseFloat(form.price),
      originalPrice: form.originalPrice || null,
      image:         form.image,
      discount:      form.discount?.trim() || 'No Discount',
      category:      form.category,
      variants:      form.variants,
    };

    if (isEdit) updateMutation.mutate({ id: editTarget._id, ...payload });
    else        createMutation.mutate(payload);
  };

  if (isLoading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Products</Typography>
        <Button
          variant="contained" startIcon={<AddIcon />}
          onClick={() => { setForm(EMPTY_FORM); setAddOpen(true); }}
        >
          Add Product
        </Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}>
              {['Product', 'Category', 'Price', 'Discount', 'Rating', 'Variants', 'Stock', 'Actions'].map((h) => (
                <TableCell
                  key={h}
                  align={['Rating', 'Variants', 'Stock', 'Actions'].includes(h) ? 'center' : 'left'}
                  sx={{ fontWeight: 'bold' }}
                >
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {products.map((row) => (
              <TableRow key={row._id} hover>

                {/* Product */}
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box component="img" src={row.image}
                      sx={{ width: 44, height: 44, borderRadius: 1, objectFit: 'cover' }}
                    />
                    <Typography variant="body2" fontWeight={600}>{row.name}</Typography>
                  </Box>
                </TableCell>

                {/* Category */}
                <TableCell>
                  <Chip label={row.category} size="small" variant="outlined" />
                </TableCell>

                {/* Price */}
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">${row.price}</Typography>
                </TableCell>

                {/* Discount */}
                <TableCell>
                  {row.discount && row.discount !== 'No Discount' ? (
                    <Chip label={row.discount} size="small" color="warning" variant="outlined" />
                  ) : (
                    <Typography variant="caption" color="text.disabled">—</Typography>
                  )}
                </TableCell>

                {/* Rating */}
                <TableCell align="center">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                    <Rating
                      value={row.ratings?.average || 0} readOnly
                      precision={0.5} size="small" sx={{ color: '#faaf00' }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      ({row.ratings?.count || 0})
                    </Typography>
                  </Box>
                </TableCell>

                {/* Variants */}
                <TableCell align="center">
                  <Tooltip title="View variants" arrow>
                    <Box
                      onClick={() => setViewingProduct(row)}
                      sx={{
                        display: 'flex', gap: 0.5, cursor: 'pointer',
                        justifyContent: 'center', alignItems: 'center',
                      }}
                    >
                      {row.variants?.slice(0, 3).map((v, i) => (
                        <Box key={v._id || i} sx={{
                          width: 14, height: 14, borderRadius: '50%',
                          bgcolor: v.color?.hex, border: '1px solid #ddd',
                        }} />
                      ))}
                      {row.variants?.length > 3 && (
                        <Typography variant="caption">+{row.variants.length - 3}</Typography>
                      )}
                      {!row.variants?.length && (
                        <Typography variant="caption" color="text.disabled">—</Typography>
                      )}
                    </Box>
                  </Tooltip>
                </TableCell>

                {/* Stock */}
                <TableCell align="center">
                  <Chip
                    label={row.stock} size="small"
                    color={row.stock > 10 ? 'success' : 'error'}
                  />
                </TableCell>

                {/* Actions */}
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                    <Tooltip title="View Variants" arrow>
                      <IconButton color="info" size="small" onClick={() => setViewingProduct(row)}>
                        <PaletteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Edit Product" arrow>
                      <IconButton
                        color="primary" size="small"
                        onClick={() => {
                          setEditTarget(row);
                          setForm({
                            name:          row.name,
                            price:         String(row.price),
                            image:         row.image,
                            discount:      row.discount === 'No Discount' ? '' : (row.discount || ''),
                            category:      row.category,
                            originalPrice: row.originalPrice || '',
                            // ✅ Deep clone variants while preserving _id
                            variants:      row.variants
                              ? row.variants.map((v) => ({
                                  _id: v._id,
                                  color: { ...v.color },
                                  size: v.size,
                                  stock: v.stock,
                                }))
                              : [],
                          });
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete Product" arrow>
                      <IconButton
                        color="error" size="small"
                        onClick={() => deleteMutation.mutate(row._id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialogs */}
      <ProductDialog
        open={addOpen} title="Add New Product"
        form={form} setForm={setForm} errors={errors} setErrors={setErrors}
        isPending={createMutation.isPending}
        onClose={() => setAddOpen(false)}
        onSave={() => handleSave(false)}
      />
      <ProductDialog
        open={Boolean(editTarget)} title="Edit Product"
        form={form} setForm={setForm} errors={errors} setErrors={setErrors}
        isPending={updateMutation.isPending}
        onClose={() => setEditTarget(null)}
        onSave={() => handleSave(true)}
      />
      <VariantViewer product={viewingProduct} onClose={() => setViewingProduct(null)} />

      <Snackbar
        open={toast.open} autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
      >
        <Alert severity={toast.severity}>{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
}