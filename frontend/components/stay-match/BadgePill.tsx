'use client';

import React from 'react';

const GOLD = '#C9A84C';

interface BadgePillProps {
  icon?: string;
  label: string;
  color?: string;
  bgColor?: string;
}

export default function BadgePill({
  icon,
  label,
  color = GOLD,
  bgColor = 'rgba(201, 168, 76, 0.15)',
}: BadgePillProps) {
  return (
    <span
      style={{
        padding: '4px 10px',
        borderRadius: '16px',
        fontSize: '11.5px',
        fontWeight: 700,
        color: color,
        background: bgColor,
        border: `1px solid ${color}44`,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        whiteSpace: 'nowrap',
      }}
    >
      {icon && <span>{icon}</span>}
      <span>{label}</span>
    </span>
  );
}
