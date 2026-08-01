'use client';

import React from 'react';

const GOLD = '#C9A84C';
const GOLD_LIGHT = '#E8C96A';
const CARD_BG = '#1A2235';
const CARD_BG_ACTIVE = 'rgba(201, 168, 76, 0.12)';
const TEXT_PRIMARY = '#F8FAFC';
const TEXT_SECONDARY = '#94A3B8';
const BORDER_DEFAULT = 'rgba(148, 163, 184, 0.18)';

interface PreferenceCardProps {
  label: string;
  icon?: string;
  description?: string;
  isSelected: boolean;
  onClick: () => void;
  layout?: 'card' | 'compact';
}

export default function PreferenceCard({
  label,
  icon,
  description,
  isSelected,
  onClick,
  layout = 'card',
}: PreferenceCardProps) {
  if (layout === 'compact') {
    return (
      <button
        type="button"
        onClick={onClick}
        style={{
          flex: '1',
          minWidth: '130px',
          padding: '20px 16px',
          borderRadius: '16px',
          background: isSelected ? 'linear-gradient(135deg, rgba(201, 168, 76, 0.25), rgba(201, 168, 76, 0.1))' : CARD_BG,
          border: `2px solid ${isSelected ? GOLD : BORDER_DEFAULT}`,
          color: isSelected ? GOLD_LIGHT : TEXT_PRIMARY,
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontWeight: 700,
          fontSize: '16px',
          transition: 'all 0.2s ease',
          boxShadow: isSelected ? '0 8px 24px rgba(201, 168, 76, 0.2)' : 'none',
        }}
      >
        {icon && <span style={{ fontSize: '28px' }}>{icon}</span>}
        <span>{label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        textAlign: 'left',
        padding: '16px',
        borderRadius: '16px',
        background: isSelected ? CARD_BG_ACTIVE : CARD_BG,
        border: `2px solid ${isSelected ? GOLD : BORDER_DEFAULT}`,
        color: TEXT_PRIMARY,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        transition: 'all 0.2s ease',
        boxShadow: isSelected ? '0 8px 24px rgba(201, 168, 76, 0.15)' : 'none',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(201, 168, 76, 0.35)';
      }}
      onMouseLeave={(e) => {
        if (!isSelected) (e.currentTarget as HTMLButtonElement).style.borderColor = BORDER_DEFAULT;
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        {icon && <span style={{ fontSize: '24px' }}>{icon}</span>}
        <div
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            border: `2px solid ${isSelected ? GOLD : 'rgba(148, 163, 184, 0.4)'}`,
            background: isSelected ? GOLD : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isSelected && (
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0D1526' }} />
          )}
        </div>
      </div>
      <div style={{ fontWeight: 700, fontSize: '15px', color: isSelected ? GOLD_LIGHT : TEXT_PRIMARY }}>
        {label}
      </div>
      {description && (
        <div style={{ fontSize: '12.5px', color: TEXT_SECONDARY, lineHeight: 1.45 }}>
          {description}
        </div>
      )}
    </button>
  );
}
