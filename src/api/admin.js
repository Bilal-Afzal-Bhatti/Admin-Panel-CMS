// Base URL dynamically loaded from .env
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5731/api/admin'; 

// Utility to grab admin token perfectly
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('adminToken') || 'dev-token'}`,
});

export const getCancellations = async () => {
  const res = await fetch(`${API_URL}/cancellations`, { headers: getHeaders() });
  
  if (!res.ok) throw new Error('Failed to fetch cancellations');
  return res.json();
};

export const processCancellation = async ({ cancellationId, action }) => {
  const res = await fetch(`${API_URL}/cancellations/${cancellationId}/process`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ action })
  });
  
  if (!res.ok) {
     const error = await res.json();
     throw new Error(error.message || 'Failed to process cancellation');
  }
  
  return res.json();
};
