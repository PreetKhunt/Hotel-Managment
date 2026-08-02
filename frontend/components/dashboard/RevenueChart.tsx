'use client';

import React, { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import api from '@/lib/api';

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
          ₹{payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
}

const defaultMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => ({
  name: m,
  month: m,
  bookings: 0,
  revenue: 0
}));

interface RevenueChartProps {
  data?: any[];
}

export default function RevenueChart({ data: propData }: RevenueChartProps) {
  const [chartData, setChartData] = useState<any[]>(propData || defaultMonths);

  useEffect(() => {
    if (propData && propData.length > 0) {
      setChartData(propData);
      return;
    }
    async function fetchRevenueData() {
      try {
        const res = await api.get('/dashboard');
        if (res.data?.data?.monthlyTrends) {
          setChartData(res.data.data.monthlyTrends);
        }
      } catch (error) {
        console.error('Failed to load revenue trends from DB:', error);
      }
    }
    fetchRevenueData();
  }, [propData]);

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
          Revenue Overview ({new Date().getFullYear()})
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
          Monthly revenue performance from PostgreSQL (INR)
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={chartData}
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
            tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
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
