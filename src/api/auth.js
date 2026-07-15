// auth.js
const API_URL = 'https://shoppingstore-backend.vercel.app/api/admin' || 'http://localhost:5731/api/admin';

export const adminRegister = async (userData) => {
  // Remove the redundant /api/admin from the string
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  const data = await res.json();
  console.log('Register Response:', data); // Log the response for debugging
  if (!res.ok) throw new Error(data.message || 'Failed to register admin');
  return data;
};

export const adminLogin = async (userData) => {
  // Remove the redundant /api/admin from the string
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to login');
  return data;
};

// 🌟 Added: Fetch Admin Profile (Requires Token)
export const getAdminProfile = async (token) => {
  const res = await fetch(`${API_URL}/profile`, {
    method: 'GET',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch profile');
  return data;
};