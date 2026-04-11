import { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { adminRegister } from '../api/auth';

export default function SignUpPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await adminRegister(formData);
      // Automatically log them in by saving token
      localStorage.setItem('adminToken', data.token);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400, borderRadius: 3 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold', textAlign: 'center' }}>
          Admin SignUp
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
          Create an exclusive vault key to manage your CMS.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth label="Full Name" name="name" required sx={{ mb: 2 }}
            value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            fullWidth label="Email Address" name="email" type="email" required sx={{ mb: 2 }}
            value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <TextField
            fullWidth label="Password" name="password" type="password" required sx={{ mb: 3 }}
            value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <Button
            type="submit" fullWidth variant="contained" size="large"
            disabled={loading} sx={{ fontWeight: 'bold', py: 1.5, mb: 2 }}
          >
            {loading ? 'Creating...' : 'Create Admin Account'}
          </Button>
        </form>

        <Typography variant="body2" textAlign="center">
          Already have an account? <Link to="/login" style={{ color: '#1976d2', textDecoration: 'none' }}>Login here</Link>
        </Typography>
      </Paper>
    </Box>
  );
}
