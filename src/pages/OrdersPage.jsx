import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button, CircularProgress } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCancellations, processCancellation } from '../api/admin';
import GoogleIcon from '@mui/icons-material/Google';
import LockPersonIcon from '@mui/icons-material/LockPerson';

export default function OrdersPage() {
  const queryClient = useQueryClient();

  const { data: cancellations, isLoading, isError } = useQuery({
    queryKey: ['cancellations'],
    queryFn: getCancellations,
  });

  const processMutation = useMutation({
    mutationFn: processCancellation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cancellations'] });
      alert("Cancellation processed successfully!");
    },
    onError: (error) => {
      alert(error.message);
    }
  });

  const handleProcess = (cancellationId, action) => {
    if (window.confirm(`Are you sure you want to ${action} this cancellation request?`)) {
        processMutation.mutate({ cancellationId, action });
    }
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  if (isError) return <Typography color="error">Error loading order cancellations.</Typography>;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Order Cancellations Management
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Review and process cancellation requests directly connected to the backend. Orders in 'processing' state will be securely aborted.
      </Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'background.default' }}>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Order Details</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Customer Info</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Reason</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }} align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cancellations?.map((cancel) => (
              <TableRow key={cancel._id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: 'rgba(0,0,0,0.01)' } }}>
                <TableCell>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>OrderId: {cancel.orderId?._id?.substring(0,8)}...</Typography>
                  <Typography variant="caption" color="text.secondary" display="block">Current State: <strong>{cancel.orderId?.orderStatus}</strong></Typography>
                  <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold' }}>Value: ${cancel.orderId?.totalPrice}</Typography>
                </TableCell>
                
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                     {cancel.userId?.authMethod === 'google' ? <GoogleIcon color="error" fontSize="small"/> : <LockPersonIcon color="action" fontSize="small"/>}
                     <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{cancel.userId?.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{cancel.userId?.email}</Typography>
                     </Box>
                  </Box>
                  <Chip 
                     size="small" 
                     label={cancel.userId?.authMethod === 'google' ? 'Google Auth' : 'Local Auth'} 
                     variant="outlined" 
                     sx={{ mt: 0.5, fontSize: '0.65rem', height: 20 }} 
                  />
                </TableCell>

                <TableCell>
                  <Typography variant="body2" sx={{ fontStyle: 'italic' }}>"{cancel.reason}"</Typography>
                  <Typography variant="caption" color="text.secondary">Requested: {new Date(cancel.createdAt).toLocaleDateString()}</Typography>
                </TableCell>

                <TableCell>
                  <Chip 
                    label={cancel.requestStatus} 
                    size="small" 
                    color={cancel.requestStatus === 'Pending Approval' ? 'warning' : cancel.requestStatus === 'Approved' ? 'success' : 'error'} 
                    sx={{ fontWeight: 'bold' }}
                  />
                </TableCell>

                <TableCell align="right">
                  {cancel.requestStatus === 'Pending Approval' ? (
                     <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button 
                           variant="contained" 
                           color="success" 
                           size="small" 
                           disableElevation
                           disabled={processMutation.isPending}
                           onClick={() => handleProcess(cancel._id, 'approve')}
                        >
                           Approve
                        </Button>
                        <Button 
                           variant="outlined" 
                           color="error" 
                           size="small"
                           disabled={processMutation.isPending}
                           onClick={() => handleProcess(cancel._id, 'reject')}
                        >
                           Reject
                        </Button>
                     </Box>
                  ) : (
                      <Typography variant="caption" color="text.secondary">
                         Resolved
                      </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
            
            {cancellations?.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                        <Typography color="text.secondary">No cancellation requests found.</Typography>
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
