'use client';

import { motion } from 'framer-motion';
import { BedDouble, CalendarDays, DollarSign, TrendingUp, Loader2 } from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import RecentBookingsTable from '@/components/dashboard/RecentBookingsTable';
import BookingTrendChart from '@/components/dashboard/BookingTrendChart';
import RevenueChart from '@/components/dashboard/RevenueChart';
import UsersTable from '@/components/dashboard/UsersTable';
import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import api from '@/lib/api';

interface DashboardData {
  rooms: { total: number };
  bookings: { today: number };
  financials: { totalRevenue: number; monthlyAverage: number };
  occupancyRate: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role?.name !== 'Admin') {
      setLoading(false);
      return;
    }
    async function fetchStats() {
      try {
        const res = await api.get('/dashboard');
        setData(res.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [user]);

  const stats = [
    {
      title: 'Total Rooms',
      value: data ? data.rooms.total.toString() : '-',
      change: '+8%',
      changeType: 'increase' as const,
      icon: BedDouble,
      color: '#C9A84C',
    },
    {
      title: 'Bookings Today',
      value: data ? data.bookings.today.toString() : '-',
      change: '+12%',
      changeType: 'increase' as const,
      icon: CalendarDays,
      color: '#60a5fa',
    },
    {
      title: 'Revenue (USD)',
      value: data ? `$${data.financials.totalRevenue.toLocaleString()}` : '-',
      change: '+15%',
      changeType: 'increase' as const,
      icon: DollarSign,
      color: '#34d399',
    },
    {
      title: 'Occupancy Rate',
      value: data ? data.occupancyRate : '-',
      change: '+5%',
      changeType: 'increase' as const,
      icon: TrendingUp,
      color: '#a78bfa',
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#C9A84C' }}>
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.3rem', margin: 0 }}>
          Good morning,{' '}
          <span style={{ color: '#C9A84C' }}>{user?.first_name || 'Guest'}</span> 👋
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
          {user?.role?.name === 'Admin' ? "Here's what's happening at Hospitality Hub today." : "Welcome back to your dashboard."}
        </p>
      </motion.div>

      {user?.role?.name === 'Admin' ? (
        <>
          {/* Stats Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {stats.map((stat, i) => (
              <StatsCard key={i} {...stat} index={i} />
            ))}
          </div>

          {/* Charts Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '1.25rem',
            }}
          >
            <BookingTrendChart />
            <RevenueChart />
          </div>

          {/* Recent Bookings */}
          <RecentBookingsTable />

          {/* Users Table */}
          <UsersTable />
        </>
      ) : (
        <div style={{ background: '#1A2235', borderRadius: '16px', padding: '24px', border: '1px solid rgba(201,168,76,0.1)' }}>
          <h3 style={{ margin: '0 0 16px', color: '#F8FAFC', fontSize: '18px' }}>Your Profile</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', fontSize: '14px', color: '#94A3B8' }}>
            <div className="font-semibold text-white">Name</div>
            <div>{user?.first_name} {user?.last_name}</div>
            
            <div className="font-semibold text-white">Email</div>
            <div>{user?.email}</div>
            
            <div className="font-semibold text-white">Role</div>
            <div>{user?.role?.name}</div>
          </div>
        </div>
      )}
    </div>
  );
}
