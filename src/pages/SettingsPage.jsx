// src/pages/SettingsPage.jsx
import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Avatar, Divider,
  Switch, MenuItem, Select, FormControl, InputLabel,
  CircularProgress, Alert, Snackbar, Chip, Tab, Tabs,
  Dialog, DialogTitle, DialogContent, DialogActions,
  InputAdornment, IconButton,
} from '@mui/material';
import EditIcon        from '@mui/icons-material/EditOutlined';
import LockIcon        from '@mui/icons-material/LockOutlined';
import StoreIcon       from '@mui/icons-material/StorefrontOutlined';
import NotifIcon       from '@mui/icons-material/NotificationsOutlined';
import PaletteIcon     from '@mui/icons-material/PaletteOutlined';
import DangerIcon      from '@mui/icons-material/WarningAmberOutlined';
import VisibilityIcon  from '@mui/icons-material/Visibility';
import VisibilityOff   from '@mui/icons-material/VisibilityOff';
import LightModeIcon   from '@mui/icons-material/LightModeOutlined';
import DarkModeIcon    from '@mui/icons-material/DarkModeOutlined';
import { useThemeMode } from '../context/ThemeContext';
import {
  useProfile,
  useUpdateProfile,
  useChangePassword,
  useStoreSettings,
  useUpdateStoreSettings,
  useNotificationSettings,
  useUpdateNotificationSettings,
} from '../hooks/useSettings';

// ─── Constants ────────────────────────────────────────────────────────────────
const CURRENCIES = ['USD', 'EUR', 'GBP', 'PKR', 'AED', 'SAR', 'INR'];

const TABS = [
  { label: 'Profile',    icon: <EditIcon    sx={{ fontSize: 18 }} /> },
  { label: 'Password',   icon: <LockIcon    sx={{ fontSize: 18 }} /> },
  { label: 'Store',      icon: <StoreIcon   sx={{ fontSize: 18 }} /> },
  { label: 'Notifications', icon: <NotifIcon sx={{ fontSize: 18 }} /> },
  { label: 'Appearance', icon: <PaletteIcon sx={{ fontSize: 18 }} /> },
  { label: 'Danger Zone',icon: <DangerIcon  sx={{ fontSize: 18 }} /> },
];

// ─── Section Wrapper ──────────────────────────────────────────────────────────
function Section({ title, subtitle, children }) {
  return (
    <Paper sx={{ p: 3.5, borderRadius: 3, boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.08)', mb: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>{title}</Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>{subtitle}</Typography>
      )}
      <Divider sx={{ mb: 3 }} />
      {children}
    </Paper>
  );
}

// ─── Toast Hook ───────────────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const show = useCallback((message, severity = 'success') => {
    setToast({ open: true, message, severity });
  }, []);
  const hide = () => setToast((t) => ({ ...t, open: false }));
  return { toast, show, hide };
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 0 — PROFILE
// ══════════════════════════════════════════════════════════════════════════════
function ProfileTab({ showToast }) {
  const { data: profile, isLoading } = useProfile();
  const [form, setForm] = useState({ name: '', email: '', avatar: '' });

  useEffect(() => {
    if (profile) {
      setForm({ name: profile.name || '', email: profile.email || '', avatar: profile.avatar || '' });
    }
  }, [profile]);

  const updateMutation = useUpdateProfile({
    onSuccess: () => showToast('Profile updated successfully!'),
    onError:   (e) => showToast(e.message, 'error'),
  });

  if (isLoading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;

  return (
    <Section title="Admin Profile" subtitle="Update your personal information">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 3 }}>
        <Avatar src={profile?.avatar} sx={{ width: 72, height: 72 }} />
        <Box>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>{profile?.name}</Typography>
          <Chip label={profile?.role || 'admin'} size="small" color="primary"
            sx={{ mt: 0.5, textTransform: 'capitalize' }} />
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <TextField label="Full Name" fullWidth
          value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
        <TextField label="Email Address" fullWidth type="email"
          value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
        <TextField label="Avatar URL (optional)" fullWidth
          placeholder="https://example.com/avatar.jpg"
          value={form.avatar} onChange={(e) => setForm((p) => ({ ...p, avatar: e.target.value }))} />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" disableElevation
            disabled={updateMutation.isPending}
            onClick={() => updateMutation.mutate(form)}>
            {updateMutation.isPending ? 'Saving...' : 'Save Profile'}
          </Button>
        </Box>
      </Box>
    </Section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 1 — PASSWORD
// ══════════════════════════════════════════════════════════════════════════════
function PasswordTab({ showToast }) {
  const [form, setForm]     = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [show, setShow]     = useState({ current: false, new: false, confirm: false });

  const mutation = useChangePassword({
    onSuccess: () => { showToast('Password changed successfully!'); setForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); },
    onError:   (e) => showToast(e.message, 'error'),
  });

  const validate = () => {
    const errs = {};
    if (!form.currentPassword)                     errs.currentPassword = 'Current password is required.';
    if (form.newPassword.length < 8)               errs.newPassword     = 'Must be at least 8 characters.';
    if (form.newPassword !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handle      = (field) => (e) => { setForm((p) => ({ ...p, [field]: e.target.value })); if (errors[field]) setErrors((p) => ({ ...p, [field]: '' })); };
  const toggleShow  = (field) => setShow((p) => ({ ...p, [field]: !p[field] }));
  const VisToggle   = ({ field }) => (
    <InputAdornment position="end">
      <IconButton onClick={() => toggleShow(field)} edge="end" size="small">
        {show[field] ? <VisibilityOff fontSize="small" /> : <VisibilityIcon fontSize="small" />}
      </IconButton>
    </InputAdornment>
  );

  return (
    <Section title="Change Password" subtitle="Use a strong password of at least 8 characters">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <TextField label="Current Password" fullWidth type={show.current ? 'text' : 'password'}
          value={form.currentPassword} onChange={handle('currentPassword')}
          error={!!errors.currentPassword} helperText={errors.currentPassword}
          InputProps={{ endAdornment: <VisToggle field="current" /> }} />
        <TextField label="New Password" fullWidth type={show.new ? 'text' : 'password'}
          value={form.newPassword} onChange={handle('newPassword')}
          error={!!errors.newPassword} helperText={errors.newPassword}
          InputProps={{ endAdornment: <VisToggle field="new" /> }} />
        <TextField label="Confirm New Password" fullWidth type={show.confirm ? 'text' : 'password'}
          value={form.confirmPassword} onChange={handle('confirmPassword')}
          error={!!errors.confirmPassword} helperText={errors.confirmPassword}
          InputProps={{ endAdornment: <VisToggle field="confirm" /> }} />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" disableElevation disabled={mutation.isPending}
            onClick={() => { if (validate()) mutation.mutate(form); }}>
            {mutation.isPending ? 'Changing...' : 'Change Password'}
          </Button>
        </Box>
      </Box>
    </Section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 2 — STORE
// ══════════════════════════════════════════════════════════════════════════════
function StoreTab({ showToast }) {
  const { data: store, isLoading } = useStoreSettings();
  const [form, setForm] = useState({ storeName: '', storeEmail: '', currency: 'USD', storeLogo: '', lowStockAlert: 10 });

  useEffect(() => { if (store) setForm(store); }, [store]);

  const mutation = useUpdateStoreSettings({
    onSuccess: () => showToast('Store settings saved!'),
    onError:   (e) => showToast(e.message, 'error'),
  });

  if (isLoading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;

  const handle = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  return (
    <Section title="Store Settings" subtitle="Manage your store information and preferences">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <TextField label="Store Name" fullWidth value={form.storeName} onChange={handle('storeName')} />
        <TextField label="Store Email" fullWidth type="email" value={form.storeEmail} onChange={handle('storeEmail')} />
        <TextField label="Store Logo URL (optional)" fullWidth placeholder="https://example.com/logo.png"
          value={form.storeLogo} onChange={handle('storeLogo')} />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Currency</InputLabel>
            <Select value={form.currency} label="Currency" onChange={handle('currency')}>
              {CURRENCIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="Low Stock Alert (qty)" fullWidth type="number"
            value={form.lowStockAlert} onChange={handle('lowStockAlert')}
            helperText="Get alerted when stock falls below this number" />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" disableElevation disabled={mutation.isPending}
            onClick={() => mutation.mutate(form)}>
            {mutation.isPending ? 'Saving...' : 'Save Store Settings'}
          </Button>
        </Box>
      </Box>
    </Section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 3 — NOTIFICATIONS
// ══════════════════════════════════════════════════════════════════════════════
function NotificationsTab({ showToast }) {
  const { data: notifs, isLoading } = useNotificationSettings();
  const mutation = useUpdateNotificationSettings({
    onSuccess: () => showToast('Notification preferences saved!'),
    onError:   () => showToast('Failed to update notifications', 'error'),
  });

  if (isLoading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;

  const toggle = (field) => mutation.mutate({ ...notifs, [field]: !notifs[field] });

  const NOTIF_ITEMS = [
    { field: 'newOrder',       label: 'New Order',       desc: 'Get notified when a new order is placed'        },
    { field: 'lowStock',       label: 'Low Stock Alert', desc: 'Get notified when product stock is running low' },
    { field: 'newCustomer',    label: 'New Customer',    desc: 'Get notified when a new customer registers'     },
    { field: 'orderDelivered', label: 'Order Delivered', desc: 'Get notified when an order is marked delivered' },
  ];

  return (
    <Section title="Notification Preferences" subtitle="Choose what you want to be notified about">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {NOTIF_ITEMS.map(({ field, label, desc }) => (
          <Box key={field} sx={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider',
          }}>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>{label}</Typography>
              <Typography variant="body2" color="text.secondary">{desc}</Typography>
            </Box>
            <Switch checked={notifs?.[field] ?? false} onChange={() => toggle(field)}
              disabled={mutation.isPending} color="primary" />
          </Box>
        ))}
      </Box>
    </Section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 4 — APPEARANCE
// ══════════════════════════════════════════════════════════════════════════════
function AppearanceTab({ showToast }) {
  const { mode, toggleMode } = useThemeMode();
  const isDark = mode === 'dark';

  return (
    <Section title="Appearance" subtitle="Customize how the admin panel looks">
      {/* Theme Toggle */}
      <Box sx={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', mb: 2,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {isDark
            ? <DarkModeIcon sx={{ color: '#818CF8' }} />
            : <LightModeIcon sx={{ color: '#F59E0B' }} />
          }
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            </Typography>
          </Box>
        </Box>
        <Switch
          checked={isDark}
          onChange={() => {
            toggleMode();
            showToast(`Switched to ${isDark ? 'light' : 'dark'} mode`);
          }}
          color="primary"
        />
      </Box>

      {/* Preview Cards */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>Preview</Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        {/* Light preview */}
        <Box
          onClick={() => { if (isDark) { toggleMode(); showToast('Switched to light mode'); } }}
          sx={{
            flex: 1, p: 2, borderRadius: 2, cursor: 'pointer',
            bgcolor: '#F9FAFB', border: '2px solid',
            borderColor: !isDark ? 'primary.main' : 'transparent',
            transition: 'border-color 0.2s',
          }}
        >
          <Box sx={{ bgcolor: '#FFFFFF', borderRadius: 1, p: 1, mb: 1, boxShadow: '0 1px 3px rgb(0 0 0 / 0.1)' }}>
            <Box sx={{ width: 40, height: 6, bgcolor: '#4F46E5', borderRadius: 1, mb: 0.5 }} />
            <Box sx={{ width: 60, height: 4, bgcolor: '#E5E7EB', borderRadius: 1 }} />
          </Box>
          <Typography variant="caption" sx={{ color: '#111827', fontWeight: 600 }}>Light</Typography>
        </Box>

        {/* Dark preview */}
        <Box
          onClick={() => { if (!isDark) { toggleMode(); showToast('Switched to dark mode'); } }}
          sx={{
            flex: 1, p: 2, borderRadius: 2, cursor: 'pointer',
            bgcolor: '#0F0F1A', border: '2px solid',
            borderColor: isDark ? 'primary.main' : 'transparent',
            transition: 'border-color 0.2s',
          }}
        >
          <Box sx={{ bgcolor: '#1A1A2E', borderRadius: 1, p: 1, mb: 1, boxShadow: '0 1px 3px rgb(0 0 0 / 0.3)' }}>
            <Box sx={{ width: 40, height: 6, bgcolor: '#818CF8', borderRadius: 1, mb: 0.5 }} />
            <Box sx={{ width: 60, height: 4, bgcolor: '#2D2D44', borderRadius: 1 }} />
          </Box>
          <Typography variant="caption" sx={{ color: '#F3F4F6', fontWeight: 600 }}>Dark</Typography>
        </Box>
      </Box>
    </Section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 5 — DANGER ZONE
// ══════════════════════════════════════════════════════════════════════════════
function DangerZoneTab({ showToast }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [input, setInput]             = useState('');
  const CONFIRM_WORD                  = 'DELETE';

  const handleDelete = () => {
    showToast('Account deletion not yet implemented', 'warning');
    setConfirmOpen(false);
    setInput('');
  };

  return (
    <Paper sx={{
      p: 3.5, borderRadius: 3,
      border: '1px solid', borderColor: 'error.light',
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.08)',
    }}>
      <Typography variant="h6" sx={{ fontWeight: 700, color: 'error.main', mb: 0.5 }}>Danger Zone</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>Irreversible and destructive actions</Typography>
      <Divider sx={{ mb: 3 }} />
      <Box sx={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'error.light',
      }}>
        <Box>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>Delete Admin Account</Typography>
          <Typography variant="body2" color="text.secondary">Permanently delete this admin account. This cannot be undone.</Typography>
        </Box>
        <Button variant="outlined" color="error" onClick={() => setConfirmOpen(true)}>Delete Account</Button>
      </Box>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', color: 'error.main' }}>Confirm Account Deletion</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>This will permanently delete your admin account and all associated data.</Alert>
          <Typography variant="body2" sx={{ mb: 1.5 }}>Type <strong>{CONFIRM_WORD}</strong> to confirm:</Typography>
          <TextField fullWidth size="small" placeholder={CONFIRM_WORD}
            value={input} onChange={(e) => setInput(e.target.value)} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setConfirmOpen(false); setInput(''); }} color="inherit">Cancel</Button>
          <Button variant="contained" color="error" disabled={input !== CONFIRM_WORD} onClick={handleDelete}>
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function SettingsPage() {
  const [tab, setTab] = useState(0);
  const { toast, show: showToast, hide: hideToast } = useToast();

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>Settings</Typography>

      <Paper sx={{ borderRadius: 3, mb: 3, boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.08)' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}
          variant="scrollable" scrollButtons="auto" sx={{ px: 1 }}>
          {TABS.map(({ label, icon }) => (
            <Tab key={label} label={label} icon={icon} iconPosition="start"
              sx={{ minHeight: 56, textTransform: 'none', fontWeight: 600, gap: 0.5 }} />
          ))}
        </Tabs>
      </Paper>

      {tab === 0 && <ProfileTab       showToast={showToast} />}
      {tab === 1 && <PasswordTab      showToast={showToast} />}
      {tab === 2 && <StoreTab         showToast={showToast} />}
      {tab === 3 && <NotificationsTab showToast={showToast} />}
      {tab === 4 && <AppearanceTab    showToast={showToast} />}
      {tab === 5 && <DangerZoneTab    showToast={showToast} />}

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={hideToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={toast.severity} variant="filled" sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}