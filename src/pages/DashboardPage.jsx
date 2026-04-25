// src/pages/DashboardPage.jsx
import { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, Skeleton, ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import TrendingUpIcon   from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import StorefrontIcon   from '@mui/icons-material/Storefront';
import LocalAtmIcon     from '@mui/icons-material/LocalAtm';
import GroupIcon        from '@mui/icons-material/Group';
import PendingIcon      from '@mui/icons-material/HourglassEmpty';
import {
  useDashboardStats,
  useDashboardChart,
  useDashboardRecentOrders,
} from '../hooks/useDashboard';

// ─── Status colors ────────────────────────────────────────────────────────────
const STATUS_COLOR = {
  processing: 'warning',
  shipped:    'info',
  delivered:  'success',
  cancelled:  'error',
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ title, value, icon, trend, loading, prefix = '', color = 'primary' }) {
  const isPositive = trend?.startsWith('+');

  return (
    <Card sx={{ height: '100%', borderRadius: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={500} gutterBottom>
              {title}
            </Typography>
            {loading ? (
              <Skeleton variant="text" width={100} height={48} />
            ) : (
              <Typography variant="h4" fontWeight="bold">
                {prefix}{typeof value === 'number' && prefix === '$'
                  ? value.toLocaleString('en-US', { minimumFractionDigits: 0 })
                  : value}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}.light`, width: 48, height: 48 }}>
            {icon}
          </Avatar>
        </Box>

        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 0.5 }}>
            {isPositive
              ? <TrendingUpIcon sx={{ color: 'success.main', fontSize: '1rem' }} />
              : <TrendingDownIcon sx={{ color: 'error.main', fontSize: '1rem' }} />
            }
            <Typography variant="body2"
              color={isPositive ? 'success.main' : 'error.main'} fontWeight={500}>
              {trend}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
              vs last month
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Chart Tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider',
               borderRadius: 2, p: 1.5, boxShadow: 3 }}>
      <Typography variant="caption" fontWeight="bold" display="block">{label}</Typography>
      {payload.map((p) => (
        <Typography key={p.name} variant="caption" display="block" color={p.color}>
          {p.name}: {p.name === 'sales' ? `$${p.value.toLocaleString()}` : p.value}
        </Typography>
      ))}
    </Box>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [chartView, setChartView] = useState('sales');

  const { data: statsData,  isLoading: statsLoading  } = useDashboardStats();
  const { data: chartData,  isLoading: chartLoading  } = useDashboardChart();
  const { data: ordersData, isLoading: ordersLoading } = useDashboardRecentOrders();

  const stats        = statsData?.data;
  const chartPoints  = chartData?.data  ?? [];
  const recentOrders = ordersData?.data ?? [];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">Dashboard Overview</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Welcome back! Here's what's happening today.
        </Typography>
      </Box>

      {/* ── Stat Cards ──────────────────────────────────────────────── */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          {
            title:  'Total Revenue',
            value:  stats?.totalRevenue?.value ?? 0,
            trend:  stats?.totalRevenue?.trend,
            icon:   <LocalAtmIcon />,
            prefix: '$',
            color:  'primary',
          },
          {
            title:  'Total Orders',
            value:  stats?.totalOrders?.value ?? 0,
            trend:  stats?.totalOrders?.trend,
            icon:   <StorefrontIcon />,
            prefix: '',
            color:  'secondary',
          },
          {
            title:  'New Customers',
            value:  stats?.newCustomers?.value ?? 0,
            trend:  stats?.newCustomers?.trend,
            icon:   <GroupIcon />,
            prefix: '',
            color:  'success',
          },
          {
            title:  'Pending Orders',
            value:  stats?.pendingOrders?.value ?? 0,
            trend:  null,
            icon:   <PendingIcon />,
            prefix: '',
            color:  'warning',
          },
        ].map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <StatCard {...card} loading={statsLoading} />
          </Grid>
        ))}
      </Grid>

      {/* ── Chart + Recent Orders ────────────────────────────────────── */}
      <Grid container spacing={3}>

        {/* Chart */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between',
                         alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h6" fontWeight="bold">Sales Performance</Typography>
                <ToggleButtonGroup
                  value={chartView} exclusive size="small"
                  onChange={(_, v) => v && setChartView(v)}
                >
                  <ToggleButton value="sales"  sx={{ px: 2, fontSize: 12 }}>Revenue</ToggleButton>
                  <ToggleButton value="orders" sx={{ px: 2, fontSize: 12 }}>Orders</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {chartLoading ? (
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
              ) : (
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartPoints}
                      margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false}
                        tick={{ fontSize: 12, fill: '#9ca3af' }} />
                      <YAxis axisLine={false} tickLine={false}
                        tick={{ fontSize: 12, fill: '#9ca3af' }}
                        tickFormatter={v => chartView === 'sales' ? `$${v/1000}k` : v} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone" dataKey={chartView}
                        stroke="#4F46E5" strokeWidth={3}
                        dot={{ r: 4, fill: '#4F46E5' }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Orders */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Recent Orders
              </Typography>

              {ordersLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                    <Skeleton variant="rectangular" width={40} height={40} sx={{ borderRadius: 1 }} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton width="60%" />
                      <Skeleton width="40%" />
                    </Box>
                    <Skeleton width={50} />
                  </Box>
                ))
              ) : (
                <TableContainer sx={{ maxHeight: 340, overflow: 'auto' }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        {['Order', 'Status', 'Amount'].map(h => (
                          <TableCell key={h}
                            sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: 11 }}>
                            {h}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentOrders.map((row) => (
                        <TableRow key={row._id} hover
                          sx={{ '&:last-child td': { border: 0 } }}>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600} fontFamily="monospace">
                              {row.orderId}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {row.billingInfo?.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={row.orderStatus}
                              size="small"
                              color={STATUS_COLOR[row.orderStatus]}
                              sx={{ fontWeight: 'bold', fontSize: 10 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              ${row.totalPrice?.toFixed(2)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                      {recentOrders.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                            <Typography variant="caption" color="text.secondary">
                              No orders yet.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
}