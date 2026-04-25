// src/hooks/useDashboard.js
import { useQuery } from '@tanstack/react-query';
import {
  getDashboardStats,
  getDashboardChart,
  getDashboardRecentOrders,
} from '../api/dashboard';

export const useDashboardStats = () =>
  useQuery({
    queryKey:  ['dashboard', 'stats'],
    queryFn:   getDashboardStats,
    staleTime: 1000 * 60 * 5,
  });

export const useDashboardChart = (period = 'monthly') =>
  useQuery({
    queryKey:  ['dashboard', 'chart', period],
    queryFn:   () => getDashboardChart(period),
    staleTime: 1000 * 60 * 5,
  });

export const useDashboardRecentOrders = () =>
  useQuery({
    queryKey:  ['dashboard', 'recent-orders'],
    queryFn:   getDashboardRecentOrders,
    staleTime: 1000 * 60 * 2,
  });