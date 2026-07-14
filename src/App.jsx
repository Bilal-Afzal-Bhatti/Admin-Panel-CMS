// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeModeProvider } from './context/ThemeContext';
import MainLayout      from './components/Layout/MainLayout';
import DashboardPage   from './pages/DashboardPage';
import ProductsPage    from './pages/ProductsPage';
import OrdersPage      from './pages/OrdersPage';
import GenericPage     from './pages/GenericPage';
import SignUpPage      from './pages/SignUpPage';
import LoginPage       from './pages/LoginPage';
import CustomersPage   from './pages/CustomersPage';
import SettingsPage    from './pages/SettingsPage';

const queryClient = new QueryClient();

const AuthGuard = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeModeProvider>  {/* replaces old ThemeProvider */}
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/login"  element={<LoginPage />} />

            {/* Protected */}
            <Route path="/" element={<AuthGuard><MainLayout /></AuthGuard>}>
              <Route index          element={<DashboardPage />} />
              <Route path="products"  element={<ProductsPage />} />
              <Route path="orders"    element={<OrdersPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="settings"  element={<SettingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeModeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;