import { useState, useCallback } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, CircularProgress,
  IconButton, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, InputAdornment, Alert, Snackbar,
  Rating, MenuItem, Tooltip, Avatar, List, ListItem, Card
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import PaletteIcon from '@mui/icons-material/Palette';
import {
  useProductList,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from '../hooks/useproducts';

// ─── Constants ────────────────────────────────────────────────────────────────
const EMPTY_FORM = { 
  name: '', price: '', stock: '', image: '', discount: '', category: 'Other', colors: [] 
};

const COLOR_OPTIONS = [
  { name: 'Red', hex: '#FF0000' }, { name: 'Blue', hex: '#0000FF' },
  { name: 'Green', hex: '#008000' }, { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' }, { name: 'Yellow', hex: '#FFFF00' },
  { name: 'Pink', hex: '#FFC0CB' }, { name: 'Purple', hex: '#800080' },
  { name: 'Orange', hex: '#FFA500' }, { name: 'Grey', hex: '#808080' },
  { name: 'Navy', hex: '#000080' },
];

const CATEGORIES = [
  'Electronics', 'Clothing', 'Footwear', 'Accessories', 'Home & Kitchen', 
  'Beauty & Health', 'Sports & Outdoors', 'Toys & Games', 'Books', 'Other'
];

// ─── Validation ─────────────────────────────────────────────────────────────
const validate = (form) => {
  const errs = {};
  if (!form.name) errs.name = 'Product name is required.';
  if (!form.image) errs.image = 'Image URL is required.';
  if (form.price === '' || Number(form.price) < 0) errs.price = 'Price cannot be negative.';
  if (form.stock === '' || Number(form.stock) < 0) errs.stock = 'Stock cannot be negative.';
  return errs;
};

// ─── ProductForm ──────────────────────────────────────────────────────────────
function ProductForm({ form, setForm, errors, setErrors }) {
  const [newColor, setNewColor] = useState({ name: '', hex: '#000000', stock: 0 });

  const handle = (field) => (e) => {
    let val = e.target.value;
    if ((field === 'price' || field === 'stock') && val < 0) val = 0; 
    setForm((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleColorSelect = (e) => {
    const selectedColor = COLOR_OPTIONS.find(c => c.name === e.target.value);
    setNewColor({ ...newColor, name: selectedColor.name, hex: selectedColor.hex });
  };

  const addColorToForm = () => {
    if (!newColor.name) return;
    const safeStock = Math.max(0, newColor.stock);
    setForm(prev => ({
      ...prev,
      colors: [...(prev.colors || []), { ...newColor, stock: safeStock }],
      stock: Number(prev.stock || 0) + safeStock
    }));
    setNewColor({ name: '', hex: '#000000', stock: 0 }); 
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
      <TextField label="Product Name" fullWidth required value={form.name} onChange={handle('name')} error={!!errors.name} helperText={errors.name} />
      <TextField select label="Category" fullWidth required value={form.category || 'Other'} onChange={handle('category')}>
        {CATEGORIES.map((option) => (<MenuItem key={option} value={option}>{option}</MenuItem>))}
      </TextField>
      <TextField label="Image URL" fullWidth required value={form.image} onChange={handle('image')} error={!!errors.image} helperText={errors.image} />
      
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField label="Price" type="number" fullWidth required InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} value={form.price} onChange={handle('price')} error={!!errors.price} helperText={errors.price} />
        <TextField label="Total Stock" type="number" fullWidth required value={form.stock} onChange={handle('stock')} error={!!errors.stock} helperText={errors.stock} InputProps={{ readOnly: (form.colors?.length > 0) }} />
      </Box>

      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <TextField select label="Select Color" size="small" sx={{ flex: 2 }} value={newColor.name} onChange={handleColorSelect}>
          {COLOR_OPTIONS.map((option) => (
            <MenuItem key={option.name} value={option.name}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: option.hex, border: '1px solid #ccc' }} />
                {option.name}
              </Box>
            </MenuItem>
          ))}
        </TextField>
        <TextField type="number" label="Stock" size="small" sx={{ flex: 1 }} value={newColor.stock} 
          onChange={(e) => setNewColor({...newColor, stock: Math.max(0, parseInt(e.target.value) || 0)})} 
        />
        <Button variant="contained" onClick={addColorToForm} sx={{ height: 40 }}>Add</Button>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {form.colors?.map((c, i) => (
          <Chip key={i} label={`${c.name} (${c.stock})`} avatar={<Avatar sx={{ bgcolor: c.hex, width: 24, height: 24 }}> </Avatar>}
            onDelete={() => {
              setForm(prev => ({
                ...prev,
                colors: prev.colors.filter((_, idx) => idx !== i),
                stock: Math.max(0, prev.stock - c.stock)
              }))
            }}
          />
        ))}
      </Box>
      <TextField label="Discount (Optional)" fullWidth value={form.discount} onChange={handle('discount')} />
    </Box>
  );
}

// ─── ProductDialog ──────────────────────────────────────────────────────────
function ProductDialog({ open, title, form, setForm, errors, setErrors, isPending, onClose, onSave }) {
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

// ─── VariantViewer (Horizontal Scrolling) ──────────────────────────────────
function VariantViewer({ product, onClose }) {
  if (!product) return null;
  return (
    <Dialog open={Boolean(product)} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>
        Variants for {product.name}
      </DialogTitle>
      <DialogContent dividers sx={{ pb: 3 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            gap: 2, 
            overflowX: 'auto', 
            py: 1,
            // Custom scrollbar for better UI
            '&::-webkit-scrollbar': { height: '8px' },
            '&::-webkit-scrollbar-thumb': { bgcolor: '#ccc', borderRadius: '4px' }
          }}
        >
          {product.colors?.length > 0 ? (
            product.colors.map((c, i) => (
              <Card 
                key={i} 
                variant="outlined" 
                sx={{ 
                  minWidth: 120, 
                  textAlign: 'center', 
                  p: 2, 
                  borderRadius: 2,
                  flexShrink: 0,
                  bgcolor: 'background.default'
                }}
              >
                <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: c.hex, border: '2px solid #ddd', mx: 'auto', mb: 1 }} />
                <Typography variant="subtitle2" fontWeight="bold">{c.name}</Typography>
                <Typography variant="caption" color="text.secondary">Stock</Typography>
                <Typography variant="h6" color={c.stock > 0 ? 'primary.main' : 'error.main'}>
                  {c.stock}
                </Typography>
              </Card>
            ))
          ) : (
            <Typography sx={{ p: 2 }} color="text.secondary">No color variants available.</Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions><Button onClick={onClose}>Close</Button></DialogActions>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const { data, isLoading } = useProductList(page);
  const products = data?.products ?? [];

  const showToast = useCallback((message, severity = 'success') => setToast({ open: true, message, severity }), []);

  const createMutation = useCreateProduct({
    onSuccess: () => { setAddOpen(false); setForm(EMPTY_FORM); showToast('Product added!'); },
    onError: (e) => showToast(e.message, 'error'),
  });

  const updateMutation = useUpdateProduct({
    onSuccess: () => { setEditTarget(null); setForm(EMPTY_FORM); showToast('Product updated!'); },
    onError: (e) => showToast(e.message, 'error'),
  });

  const deleteMutation = useDeleteProduct({
    onSuccess: () => showToast('Product deleted.'),
    onError: (e) => showToast(e.message, 'error'),
  });

  const handleSave = (isEdit) => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const payload = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock, 10) };
    if (isEdit) updateMutation.mutate({ id: editTarget._id, ...payload });
    else createMutation.mutate(payload);
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Products</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => {setForm(EMPTY_FORM); setAddOpen(true);}}>Add Product</Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
           <TableRow sx={{ bgcolor: 'background.default' }}>
  {['Product', 'Category', 'Price', 'Variants', 'Stock', 'Actions'].map((h) => (
    <TableCell 
      key={h} 
      sx={{ 
        fontWeight: 'bold',
        // If it's the Actions column, nudge it right with padding
        pl: h === 'Actions' ? 10 : 2, 
        // Ensure the text itself stays left-aligned but shifted
        textAlign: 'left' 
      }}
    >
      {h}
    </TableCell>
  ))}
</TableRow>
          </TableHead>
          <TableBody>
            {products.map((row) => (
              <TableRow key={row._id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box component="img" src={row.image} sx={{ width: 44, height: 44, borderRadius: 1 }} />
                    <Typography variant="body2" fontWeight={600}>{row.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell><Chip label={row.category} size="small" variant="outlined" /></TableCell>
                <TableCell><Typography variant="body2" fontWeight="bold">${row.price}</Typography></TableCell>
                
                {/* Variants Cell */}
                <TableCell>
                  <Tooltip title="Click to view stock details" arrow>
                    <Box 
                      onClick={() => setViewingProduct(row)} 
                      sx={{ display: 'flex', gap: 0.5, cursor: 'pointer', alignItems: 'center' }}
                    >
                      {row.colors?.slice(0, 3).map((c, i) => (
                        <Box key={i} sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: c.hex, border: '1px solid #ddd' }} />
                      ))}
                      {row.colors?.length > 3 && <Typography variant="caption">+{row.colors.length - 3}</Typography>}
                    </Box>
                  </Tooltip>
                </TableCell>

                <TableCell><Chip label={row.stock} size="small" color={row.stock > 10 ? 'success' : 'error'} /></TableCell>
                
                <TableCell align="center">
                  <Tooltip title="Quick View Variants" arrow>
                    <IconButton color="info" onClick={() => setViewingProduct(row)}><PaletteIcon /></IconButton>
                  </Tooltip>
                  <Tooltip title="Edit Product" arrow>
                    <IconButton color="primary" onClick={() => {setEditTarget(row); setForm({...row, price: String(row.price), stock: String(row.stock)});}}><EditIcon /></IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Product" arrow>
                    <IconButton color="error" onClick={() => deleteMutation.mutate(row._id)}><DeleteIcon /></IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialogs */}
      <ProductDialog open={addOpen} title="Add New Product" form={form} setForm={setForm} errors={errors} setErrors={setErrors} isPending={createMutation.isPending} onClose={() => setAddOpen(false)} onSave={() => handleSave(false)} />
      <ProductDialog open={Boolean(editTarget)} title="Edit Product" form={form} setForm={setForm} errors={errors} setErrors={setErrors} isPending={updateMutation.isPending} onClose={() => setEditTarget(null)} onSave={() => handleSave(true)} />
      <VariantViewer product={viewingProduct} onClose={() => setViewingProduct(null)} />
      
      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({...toast, open: false})}>
        <Alert severity={toast.severity}>{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
}