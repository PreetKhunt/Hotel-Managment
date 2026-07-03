'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { bookingTrendData } from '@/lib/mockData';

interface TooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: '#1A2235',
          border: '1px solid rgba(201,168,76,0.3)',
          borderRadius: '8px',
          padding: '0.6rem 1rem',
        }}
      >
        <p style={{ color: '#C9A84C', fontWeight: 600, fontSize: '0.8rem', marginBottom: '0.25rem' }}>
          {label}
        </p>
        <p style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.95rem' }}>
          {payload[0].value} bookings
        </p>
      </div>
    );
  }
  return null;
}

export default function BookingTrendChart() {
  return (
    <div
      style={{
        background: '#1A2235',
        borderRadius: '14px',
        padding: '1.5rem',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ color: '#ffffff', fontWeight: 700, fontSize: '1rem', margin: 0 }}>
          Booking Trends 2024
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
          Monthly booking volume overview
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={bookingTrendData}
          margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
          barCategoryGap="30%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(201,168,76,0.06)' }} />
          <Bar
            dataKey="bookings"
            fill="#C9A84C"
            radius={[5, 5, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
