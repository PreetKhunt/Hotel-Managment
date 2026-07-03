'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
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
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
}

export default function RevenueChart() {
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
          Revenue Overview 2024
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
          Monthly revenue performance (USD)
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={bookingTrendData}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
            </linearGradient>
          </defs>
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
            tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(201,168,76,0.2)', strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#C9A84C"
            strokeWidth={2.5}
            fill="url(#revenueGradient)"
            dot={{ fill: '#C9A84C', r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#C9A84C', strokeWidth: 2, stroke: '#0A0F1E' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
