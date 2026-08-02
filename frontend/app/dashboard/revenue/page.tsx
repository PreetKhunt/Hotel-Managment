'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import RevenueChart from '@/components/dashboard/RevenueChart';
import BookingTrendChart from '@/components/dashboard/BookingTrendChart';
import { DollarSign, TrendingUp, Star, BarChart2, Loader2, RefreshCw } from 'lucide-react';
import api from '@/lib/api';

export default function RevenuePage() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard');
      setDashboardData(res.data?.data || null);
    } catch (error) {
      console.error('Error loading live revenue analytics from DB:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const stats = [
    {
      label: 'Total Revenue',
      value: `₹${(dashboardData?.financials?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: '#C9A84C',
      change: '+18%',
    },
    {
      label: 'Monthly Average',
      value: `₹${(dashboardData?.financials?.monthlyAverage || 0).toLocaleString()}`,
      icon: BarChart2,
      color: '#60a5fa',
      change: '+12%',
    },
    {
      label: 'Best Month',
      value: dashboardData?.financials?.bestMonth || 'N/A',
      icon: Star,
      color: '#fbbf24',
      change: '',
    },
    {
      label: 'YoY Growth',
      value: dashboardData?.financials?.yoyGrowth || '+18%',
      icon: TrendingUp,
      color: '#34d399',
      change: '+5pp',
    },
  ];

  const roomTypeBreakdown: Array<{ type: string; revenue: number; percent: number }> = dashboardData?.revenueByRoomType || [];

  if (loading && !dashboardData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin w-8 h-8 text-indigo-400" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.3rem', margin: 0 }}>
            Revenue Analytics
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Live financial performance overview from PostgreSQL ({new Date().getFullYear()})
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-700 transition shadow"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Metrics
        </button>
      </div>

      {/* Revenue Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              style={{
                background: '#1A2235',
                borderRadius: '12px',
                padding: '1.4rem',
                border: '1px solid rgba(255,255,255,0.07)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '100px',
                  height: '100px',
                  background: `radial-gradient(circle at top right, ${stat.color}12 0%, transparent 70%)`,
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  {stat.label}
                </span>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: `${stat.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={17} color={stat.color} />
                </div>
              </div>
              <p style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.4rem', margin: '0 0 0.4rem', letterSpacing: '-0.02em' }}>
                {stat.value}
              </p>
              {stat.change && (
                <span style={{ color: '#34d399', fontSize: '0.78rem', fontWeight: 600 }}>
                  {stat.change} vs prev
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Revenue Chart Full Width */}
      <RevenueChart data={dashboardData?.monthlyTrends} />

      {/* Booking Trend Chart */}
      <BookingTrendChart data={dashboardData?.monthlyTrends} />

      {/* Revenue by Room Type Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{
          background: '#1A2235',
          borderRadius: '14px',
          border: '1px solid rgba(255,255,255,0.07)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <h3 style={{ color: '#ffffff', fontWeight: 700, fontSize: '1rem', margin: 0 }}>
            Revenue by Room Type
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
            Live PostgreSQL breakdown of revenue by room category
          </p>
        </div>

        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {roomTypeBreakdown.length === 0 ? (
            <p className="text-gray-400 text-sm py-4 text-center">No revenue recorded across room categories yet.</p>
          ) : (
            roomTypeBreakdown.map((row, i) => (
              <div key={i}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.4rem',
                  }}
                >
                  <span style={{ color: '#ffffff', fontSize: '0.88rem', fontWeight: 500 }}>
                    {row.type}
                  </span>
                  <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                    <span style={{ color: '#C9A84C', fontWeight: 600, fontSize: '0.88rem' }}>
                      ₹{row.revenue.toLocaleString()}
                    </span>
                    <span
                      style={{
                        background: 'rgba(201,168,76,0.12)',
                        color: '#C9A84C',
                        borderRadius: '4px',
                        padding: '0.15rem 0.5rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        minWidth: '42px',
                        textAlign: 'center',
                      }}
                    >
                      {row.percent}%
                    </span>
                  </div>
                </div>
                {/* Progress Bar */}
                <div
                  style={{
                    height: '6px',
                    background: 'rgba(255,255,255,0.07)',
                    borderRadius: '3px',
                    overflow: 'hidden',
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${row.percent}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 + 0.3 }}
                    style={{
                      height: '100%',
                      background: `linear-gradient(90deg, #C9A84C, rgba(201,168,76,0.5))`,
                      borderRadius: '3px',
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
