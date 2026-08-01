'use client';

import React from 'react';
import { motion } from 'framer-motion';

const GOLD = '#C9A84C';
const CARD_BG = '#1A2235';
const TEXT_PRIMARY = '#F8FAFC';
const TEXT_SECONDARY = '#94A3B8';

interface StayMatchEmptyStateProps {
  onEdit: () => void;
  onReset: () => void;
}

export default function StayMatchEmptyState({ onEdit, onReset }: StayMatchEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        textAlign: 'center',
        padding: '80px 40px',
        background: CARD_BG,
        borderRadius: '24px',
        border: '1px solid rgba(201, 168, 76, 0.2)',
        gridColumn: '1 / -1',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}
    >
      <div style={{ fontSize: '64px', marginBottom: '20px' }}>✨🔍</div>
      <h3 style={{
        margin: '0 0 12px',
        color: TEXT_PRIMARY,
        fontSize: '24px',
        fontWeight: 700,
        fontFamily: 'var(--font-playfair), Georgia, serif',
      }}>
        No Exact Rooms Matched All Preferences
      </h3>
      <p style={{
        color: TEXT_SECONDARY,
        fontSize: '15px',
        margin: '0 auto 28px',
        lineHeight: 1.6,
        maxWidth: '520px',
      }}>
        We couldn&apos;t find an available suite that simultaneously meets every selected amenity, bed type, and budget tier. We recommend slightly relaxing your amenity filters or expanding your budget range.
      </p>
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={onEdit}
          style={{
            padding: '12px 28px',
            borderRadius: '12px',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #C9A84C, #E8C96A)',
            border: 'none',
            color: '#0A0F1E',
            fontWeight: 700,
            fontSize: '14px',
            boxShadow: '0 4px 16px rgba(201, 168, 76, 0.3)',
            transition: 'opacity 0.2s',
          }}
        >
          ⚙️ Modify Preferences
        </button>
        <button
          type="button"
          onClick={onReset}
          style={{
            padding: '12px 28px',
            borderRadius: '12px',
            cursor: 'pointer',
            background: 'rgba(148, 163, 184, 0.1)',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            color: TEXT_PRIMARY,
            fontWeight: 600,
            fontSize: '14px',
            transition: 'background 0.2s',
          }}
        >
          View All Rooms
        </button>
      </div>
    </motion.div>
  );
}
