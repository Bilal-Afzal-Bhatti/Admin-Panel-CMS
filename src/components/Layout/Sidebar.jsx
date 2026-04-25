import { 
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Toolbar, Typography, Box, Divider, useTheme, useMediaQuery, Button
} from '@mui/material';
import DashboardIcon    from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon       from '@mui/icons-material/People';
import InventoryIcon    from '@mui/icons-material/Inventory';
import SettingsIcon     from '@mui/icons-material/Settings';
import LogoutIcon       from '@mui/icons-material/Logout';
import { useLocation, useNavigate } from 'react-router-dom';

const drawerWidth = 260;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />,    path: '/' },
  { text: 'Products',  icon: <InventoryIcon />,    path: '/products' },
  { text: 'Orders',    icon: <ShoppingCartIcon />, path: '/orders' },
  { text: 'Customers', icon: <PeopleIcon />,       path: '/customers' },
  { text: 'Settings',  icon: <SettingsIcon />,     path: '/settings' },
];

export default function Sidebar({ mobileOpen, handleDrawerToggle }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const theme     = useTheme();
  const isMobile  = useMediaQuery(theme.breakpoints.down('md'));

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login', { replace: true });
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Header ────────────────────────────────────────────────────── */}
      <Toolbar sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 2.5 }}>
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>
          CMS ADMIN
        </Typography>
        {/* ✅ store name below */}
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', letterSpacing: 2, textTransform: 'uppercase', mt: 0.5 }}>
          EXCLUSIVE STORE
        </Typography>
      </Toolbar>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* ── Nav items ─────────────────────────────────────────────────── */}
      <List sx={{ px: 2, pt: 2, flex: 1 }}>
        {menuItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) handleDrawerToggle();
                }}
                sx={{
                  borderRadius: 2,
                  backgroundColor: active ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.15)' },
                }}
              >
                <ListItemIcon sx={{
                  color: active ? theme.palette.primary.light : 'rgba(255,255,255,0.7)',
                  minWidth: 40,
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: active ? 600 : 400,
                    color: active ? '#fff' : 'rgba(255,255,255,0.7)',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* ── Logout ────────────────────────────────────────────────────── */}
      <Box sx={{ px: 2, pb: 3 }}>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 2 }} />
        <Button
          fullWidth
          onClick={handleLogout}
          startIcon={<LogoutIcon />}
          sx={{
            justifyContent: 'flex-start',
            borderRadius: 2,
            color: 'rgba(255,255,255,0.7)',
            px: 2,
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: '#fff',
            },
          }}
        >
          Logout
        </Button>
      </Box>

    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { sm: 0 } }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}