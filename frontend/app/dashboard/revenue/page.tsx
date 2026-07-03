'use client';

import { motion } from 'framer-motion';
import { bookingTrendData } from '@/lib/mockData';
import RevenueChart from '@/components/dashboard/RevenueChart';
import BookingTrendChart from '@/components/dashboard/BookingTrendChart';
import { DollarSign, TrendingUp, Star, BarChart2 } from 'lucide-react';

const revenueStats = [
  { label: 'Total Revenue', value: '$540,900', icon: DollarSign, color: '#C9A84C', change: '+23%' },
  { label: 'Monthly Average', value: '$45,075', icon: BarChart2, color: '#60a5fa', change: '+18%' },
  { label: 'Best Month', value: 'Dec $94,200', icon: Star, color: '#fbbf24', change: '' },
  { label: 'YoY Growth', value: '+23%', icon: TrendingUp, color: '#34d399', change: '+7pp' },
];

const revenueByRoomType = [
  { type: 'Presidential Suite', revenue: 162270, percent: 30 },
  { type: 'Deluxe Ocean View', revenue: 108180, percent: 20 },
  { type: 'Executive Suite', revenue: 94657, percent: 17.5 },
  { type: 'Junior Suite', revenue: 81135, percent: 15 },
  { type: 'Standard Double', revenue: 54090, percent: 10 },
  { type: 'Other Rooms', revenue: 40568, percent: 7.5 },
];

export default function RevenuePage() {
  const maxRevenue = Math.max(...revenueByRoomType.map((r) => r.revenue));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div>
        <h2 style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.3rem', margin: 0 }}>
          Revenue Analytics
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
          Financial performance overview for 2024
        </p>
      </div>

      {/* Revenue Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        {revenueStats.map((stat, i) => {
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
                  {stat.change} vs 2023
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Revenue Chart Full Width */}
      <RevenueChart />

      {/* Booking Trend Chart */}
      <BookingTrendChart />

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
            Breakdown of annual revenue by room category
          </p>
        </div>

        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {revenueByRoomType.map((row, i) => (
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
                    ${row.revenue.toLocaleString()}
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
          ))}
        </div>
      </motion.div>
    </div>
  );
}
