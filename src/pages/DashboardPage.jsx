import { Box, Grid, Card, CardContent, Typography, Avatar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import GroupIcon from '@mui/icons-material/Group';

const data = [
  { name: 'Jan', sales: 4000 },
  { name: 'Feb', sales: 3000 },
  { name: 'Mar', sales: 5000 },
  { name: 'Apr', sales: 4500 },
  { name: 'May', sales: 6000 },
  { name: 'Jun', sales: 5500 },
  { name: 'Jul', sales: 7000 },
];

const recentOrders = [
  { id: '#ORD-001', customer: 'John Doe', date: '2026-04-09', amount: '$120.00', status: 'Delivered' },
  { id: '#ORD-002', customer: 'Jane Smith', date: '2026-04-08', amount: '$45.00', status: 'Pending' },
  { id: '#ORD-003', customer: 'Bob Johnson', date: '2026-04-07', amount: '$340.50', status: 'Processing' },
  { id: '#ORD-004', customer: 'Alice Williams', date: '2026-04-07', amount: '$78.90', status: 'Delivered' },
];

const StatCard = ({ title, value, icon, trend }) => (
  <Card sx={{ height: '100%', borderRadius: 3 }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
            {title}
          </Typography>
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
            {value}
          </Typography>
        </Box>
        <Avatar sx={{ bgcolor: 'primary.light', width: 48, height: 48 }}>
          {icon}
        </Avatar>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
        <TrendingUpIcon sx={{ color: 'success.main', fontSize: '1rem', mr: 0.5 }} />
        <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
          {trend}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
          vs last month
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Dashboard Overview
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Revenue" value="$45,231" icon={<LocalAtmIcon />} trend="+12.5%" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Orders" value="1,245" icon={<StorefrontIcon />} trend="+8.2%" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="New Customers" value="842" icon={<GroupIcon />} trend="+5.4%" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Conversion Rate" value="3.48%" icon={<TrendingUpIcon />} trend="+1.2%" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                Sales Performance
              </Typography>
              <Box sx={{ height: 300, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Line type="monotone" dataKey="sales" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Recent Orders
              </Typography>
              <TableContainer component={Box} sx={{ maxHeight: 310, overflow: 'auto' }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Order</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Status</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentOrders.map((row) => (
                      <TableRow key={row.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell component="th" scope="row">
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{row.id}</Typography>
                          <Typography variant="caption" color="text.secondary">{row.customer}</Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ 
                            bgcolor: row.status === 'Delivered' ? 'success.light' : row.status === 'Pending' ? 'warning.light' : 'info.light',
                            color: row.status === 'Delivered' ? 'success.dark' : row.status === 'Pending' ? 'warning.dark' : 'info.dark',
                            px: 1, py: 0.5, borderRadius: 1, display: 'inline-block', fontSize: '0.75rem', fontWeight: 'bold',
                            opacity: 0.8
                          }}>
                            {row.status}
                          </Box>
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 500 }}>{row.amount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
