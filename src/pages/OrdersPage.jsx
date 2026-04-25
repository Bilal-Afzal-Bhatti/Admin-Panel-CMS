// src/pages/OrdersPage.jsx
import { useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, Button, CircularProgress,
  TextField, InputAdornment, MenuItem, Select, FormControl,
  InputLabel, Dialog, DialogTitle, DialogContent, DialogActions,
  Avatar, Tabs, Tab, Tooltip, IconButton,
} from '@mui/material';
import SearchIcon        from '@mui/icons-material/Search';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon   from '@mui/icons-material/CheckCircle';
import CancelIcon        from '@mui/icons-material/Cancel';
import InfoIcon          from '@mui/icons-material/Info';
import GoogleIcon        from '@mui/icons-material/Google';
import LockPersonIcon    from '@mui/icons-material/LockPerson';

import {
  useOrderList,
  useUpdateOrderStatus,
  useCancellations,
  useProcessCancellation,
} from '../hooks/useOrders';

// ─── Status chip colors ───────────────────────────────────────────────────────
const STATUS_COLOR = {
  processing: 'warning',
  shipped:    'info',
  delivered:  'success',
  cancelled:  'error',
};

const PAYMENT_COLOR = {
  pending: 'warning',
  paid:    'success',
  failed:  'error',
};

// ─── Order Detail Dialog ──────────────────────────────────────────────────────
function OrderDetailDialog({ order, open, onClose, onStatusChange, isUpdating }) {
  if (!order) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>
        Order Details — {order.orderId}
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

          {/* Status + Payment */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip label={order.orderStatus?.toUpperCase()}
              color={STATUS_COLOR[order.orderStatus]} sx={{ fontWeight: 'bold' }} />
            <Chip label={`Payment: ${order.paymentStatus?.toUpperCase()}`}
              color={PAYMENT_COLOR[order.paymentStatus]} variant="outlined" sx={{ fontWeight: 'bold' }} />
            <Chip label={order.paymentMethod?.toUpperCase()} variant="outlined" />
          </Box>

          {/* Customer */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              CUSTOMER
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {order.billingInfo?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {order.billingInfo?.email} · {order.billingInfo?.phone}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {order.billingInfo?.address}
              {order.billingInfo?.apartment ? `, ${order.billingInfo.apartment}` : ''},
              {order.billingInfo?.city}, {order.billingInfo?.zipcode}
            </Typography>
          </Box>

          {/* Items */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              ITEMS
            </Typography>
            {order.items?.map((item, i) => (
              <Box key={i} sx={{
                display: 'flex', alignItems: 'center', gap: 2,
                py: 1.5, borderBottom: '1px solid', borderColor: 'divider',
              }}>
                <Avatar src={item.image} variant="rounded"
                  sx={{ width: 52, height: 52, bgcolor: 'grey.100' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight="bold">{item.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Qty: {item.quantity}
                  </Typography>
                </Box>
                <Typography variant="body2" fontWeight="bold">
                  ${(item.price * item.quantity).toFixed(2)}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Total */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">
              Total: ${order.totalPrice?.toFixed(2)}
            </Typography>
          </Box>

          {/* Status Update */}
          {order.orderStatus !== 'cancelled' && order.orderStatus !== 'delivered' && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                UPDATE STATUS
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {order.orderStatus === 'processing' && (
                  <Button
                    variant="contained" color="info" size="small"
                    startIcon={<LocalShippingIcon />}
                    disabled={isUpdating}
                    onClick={() => onStatusChange(order._id, 'shipped')}
                  >
                    Mark as Shipped
                  </Button>
                )}
                {order.orderStatus === 'shipped' && (
                  <Button
                    variant="contained" color="success" size="small"
                    startIcon={<CheckCircleIcon />}
                    disabled={isUpdating}
                    onClick={() => onStatusChange(order._id, 'delivered')}
                  >
                    Mark as Delivered
                  </Button>
                )}
                <Button
                  variant="outlined" color="error" size="small"
                  startIcon={<CancelIcon />}
                  disabled={isUpdating}
                  onClick={() => onStatusChange(order._id, 'cancelled')}
                >
                  Cancel Order
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Cancellation Dialog ──────────────────────────────────────────────────────
function CancellationDialog({ cancel, open, onClose, onProcess, isProcessing }) {
  const [adminComment, setAdminComment] = useState('');
  if (!cancel) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>
        Cancellation Request
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">ORDER ID</Typography>
            <Typography variant="body1" fontWeight="bold">
              {cancel.orderId?.orderId}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">CUSTOMER</Typography>
            <Typography variant="body2" fontWeight="bold">{cancel.userId?.name}</Typography>
            <Typography variant="body2" color="text.secondary">{cancel.userId?.email}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">REASON</Typography>
            <Typography variant="body2" fontStyle="italic">"{cancel.reason}"</Typography>
            {cancel.additionalNotes && (
              <Typography variant="caption" color="text.secondary">
                Notes: {cancel.additionalNotes}
              </Typography>
            )}
          </Box>
          <TextField
            label="Admin Comment (optional)"
            multiline rows={2} fullWidth size="small"
            value={adminComment}
            onChange={(e) => setAdminComment(e.target.value)}
            placeholder="Add a note for the customer..."
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} color="inherit">Close</Button>
        <Button
          variant="outlined" color="error" size="small"
          disabled={isProcessing}
          onClick={() => onProcess(cancel._id, 'reject', adminComment)}
        >
          Reject
        </Button>
        <Button
          variant="contained" color="success" size="small"
          disabled={isProcessing}
          onClick={() => onProcess(cancel._id, 'approve', adminComment)}
        >
          Approve Cancellation
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

 export default function OrdersPage() {
  const [tab,            setTab]           = useState(0);
  const [search,         setSearch]        = useState('');
  const [statusFilter,   setStatusFilter]  = useState('');
  const [page,           setPage]          = useState(1);
  const [selectedOrder,  setSelectedOrder] = useState(null);
  const [selectedCancel, setSelectedCancel]= useState(null);

  // ── Hooks ─────────────────────────────────────────────────────────────────
  const { data: ordersData,    isLoading: ordersLoading  } = useOrderList({
    page, search, status: statusFilter,
  });

  const { data: cancellations, isLoading: cancelLoading  } = useCancellations();

  const statusMutation = useUpdateOrderStatus({
    onSuccess: () => setSelectedOrder(null),
  });

  const cancelMutation = useProcessCancellation({
    onSuccess: () => setSelectedCancel(null),
  });

  const orders       = ordersData?.data  ?? [];
  const totalPages   = ordersData?.pages ?? 1;
  const pendingCount = cancellations?.filter(
    c => c.requestStatus === 'Pending Approval'
  ).length ?? 0;

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
        Orders Management
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage all orders, update statuses and process cancellation requests.
      </Typography>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="All Orders" />
        <Tab label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            Cancellation Requests
            {pendingCount > 0 && (
              <Chip label={pendingCount} size="small" color="error" sx={{ height: 18, fontSize: 10 }} />
            )}
          </Box>
        } />
      </Tabs>

      {/* ── Tab 0: All Orders ─────────────────────────────────────────── */}
      {tab === 0 && (
        <Box>
          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField
              size="small" placeholder="Search by Order ID..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
              sx={{ width: 260 }}
            />
            <FormControl size="small" sx={{ width: 180 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter} label="Status"
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="shipped">Shipped</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {ordersLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.03)' }}>
                    {['Order ID', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Actions'].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 'bold', fontSize: 12 }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order._id} hover>

                      {/* Order ID */}
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold" fontFamily="monospace">
                          {order.orderId}
                        </Typography>
                      </TableCell>

                      {/* Customer */}
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {order.billingInfo?.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.billingInfo?.email}
                        </Typography>
                      </TableCell>

                      {/* Items */}
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {order.items?.slice(0, 3).map((item, i) => (
                            <Tooltip key={i} title={item.name} arrow>
                              <Avatar src={item.image} variant="rounded"
                                sx={{ width: 32, height: 32, bgcolor: 'grey.100' }} />
                            </Tooltip>
                          ))}
                          {order.items?.length > 3 && (
                            <Avatar variant="rounded"
                              sx={{ width: 32, height: 32, bgcolor: 'grey.200', fontSize: 11 }}>
                              +{order.items.length - 3}
                            </Avatar>
                          )}
                        </Box>
                      </TableCell>

                      {/* Total */}
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          ${order.totalPrice?.toFixed(2)}
                        </Typography>
                      </TableCell>

                      {/* Payment */}
                      <TableCell>
                        <Chip
                          label={order.paymentStatus}
                          size="small"
                          color={PAYMENT_COLOR[order.paymentStatus]}
                          sx={{ fontWeight: 'bold', fontSize: 10 }}
                        />
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Chip
                          label={order.orderStatus}
                          size="small"
                          color={STATUS_COLOR[order.orderStatus]}
                          sx={{ fontWeight: 'bold', fontSize: 10 }}
                        />
                      </TableCell>

                      {/* Date */}
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </Typography>
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {/* View details */}
                          <Tooltip title="View Details" arrow>
                            <IconButton size="small" color="primary"
                              onClick={() => setSelectedOrder(order)}>
                              <InfoIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {/* Quick ship */}
                          {order.orderStatus === 'processing' && (
                            <Tooltip title="Mark as Shipped" arrow>
                              <IconButton size="small" color="info"
                                disabled={statusMutation.isPending}
                                onClick={() => statusMutation.mutate({
                                  orderId: order._id, status: 'shipped'
                                })}>
                                <LocalShippingIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {/* Quick deliver */}
                          {order.orderStatus === 'shipped' && (
                            <Tooltip title="Mark as Delivered" arrow>
                              <IconButton size="small" color="success"
                                disabled={statusMutation.isPending}
                                onClick={() => statusMutation.mutate({
                                  orderId: order._id, status: 'delivered'
                                })}>
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}

                  {orders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary">No orders found.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 3 }}>
              <Button size="small" disabled={page === 1}
                onClick={() => setPage(p => p - 1)}>← Prev</Button>
              <Typography variant="body2" sx={{ alignSelf: 'center' }}>
                Page {page} of {totalPages}
              </Typography>
              <Button size="small" disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}>Next →</Button>
            </Box>
          )}
        </Box>
      )}

      {/* ── Tab 1: Cancellations ──────────────────────────────────────── */}
      {tab === 1 && (
        <Box>
          {cancelLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.03)' }}>
                    {['Order', 'Customer', 'Reason', 'Status', 'Requested', 'Action'].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 'bold', fontSize: 12 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cancellations?.map((cancel) => (
                    <TableRow key={cancel._id} hover>

                      <TableCell>
                        <Typography variant="body2" fontWeight="bold" fontFamily="monospace">
                          {cancel.orderId?.orderId}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ${cancel.orderId?.totalPrice?.toFixed(2)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {cancel.userId?.authMethod === 'google'
                            ? <GoogleIcon color="error" fontSize="small" />
                            : <LockPersonIcon color="action" fontSize="small" />
                          }
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {cancel.userId?.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {cancel.userId?.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontStyle="italic" sx={{ maxWidth: 200 }}>
                          "{cancel.reason}"
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={cancel.requestStatus}
                          size="small"
                          color={
                            cancel.requestStatus === 'Pending Approval' ? 'warning' :
                            cancel.requestStatus === 'Approved'         ? 'success' : 'error'
                          }
                          sx={{ fontWeight: 'bold', fontSize: 10 }}
                        />
                      </TableCell>

                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(cancel.createdAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {cancel.requestStatus === 'Pending Approval' ? (
                          <Button
                            variant="contained" size="small" disableElevation
                            onClick={() => setSelectedCancel(cancel)}
                          >
                            Review
                          </Button>
                        ) : (
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Resolved
                            </Typography>
                            {cancel.adminComment && (
                              <Tooltip title={cancel.adminComment} arrow>
                                <InfoIcon fontSize="small" sx={{ ml: 0.5, color: 'text.disabled', verticalAlign: 'middle' }} />
                              </Tooltip>
                            )}
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}

                  {cancellations?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary">
                          No cancellation requests found.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* Dialogs */}
      <OrderDetailDialog
        order={selectedOrder}
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        isUpdating={statusMutation.isPending}
        onStatusChange={(orderId, status) =>
          statusMutation.mutate({ orderId, status })
        }
      />

      <CancellationDialog
        cancel={selectedCancel}
        open={Boolean(selectedCancel)}
        onClose={() => setSelectedCancel(null)}
        isProcessing={cancelMutation.isPending}
        onProcess={(cancellationId, action, adminComment) =>
          cancelMutation.mutate({ cancellationId, action, adminComment })
        }
      />
    </Box>
  );
}