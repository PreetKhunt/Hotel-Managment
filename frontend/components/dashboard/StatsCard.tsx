'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: LucideIcon;
  color: string;
  index?: number;
}

export default function StatsCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color,
  index = 0,
}: StatsCardProps) {
  const isIncrease = changeType === 'increase';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      style={{
        background: '#1A2235',
        borderRadius: '14px',
        padding: '1.5rem',
        border: '1px solid rgba(255,255,255,0.07)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
      }}
    >
      {/* Subtle gradient accent top-right */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '120px',
          height: '120px',
          background: `radial-gradient(circle at top right, ${color}15 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Top Row: title + icon */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1.1rem',
        }}
      >
        <p
          style={{
            color: 'rgba(255,255,255,0.55)',
            fontSize: '0.82rem',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {title}
        </p>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: `${color}22`,
            border: `1px solid ${color}44`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={20} color={color} />
        </div>
      </div>

      {/* Value */}
      <p
        style={{
          color: '#ffffff',
          fontSize: 'clamp(1.6rem, 3vw, 2.1rem)',
          fontWeight: 700,
          lineHeight: 1,
          marginBottom: '0.75rem',
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </p>

      {/* Change Indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.2rem',
            color: isIncrease ? '#34d399' : '#f87171',
            fontSize: '0.82rem',
            fontWeight: 600,
          }}
        >
          {isIncrease ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {change}
        </div>
        <span style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.78rem' }}>
          vs last month
        </span>
      </div>

      {/* Bottom border accent */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, ${color}, transparent)`,
          opacity: 0.5,
        }}
      />
    </motion.div>
  );
}
