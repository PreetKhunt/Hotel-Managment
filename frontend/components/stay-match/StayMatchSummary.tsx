'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { StayMatchPreferences } from '@/lib/stay-match';
import BadgePill from './BadgePill';

const GOLD = '#C9A84C';
const CARD_BG = '#1A2235';
const TEXT_PRIMARY = '#F8FAFC';
const TEXT_SECONDARY = '#94A3B8';
const BORDER_GOLD = 'rgba(201, 168, 76, 0.3)';

interface StayMatchSummaryProps {
  preferences: StayMatchPreferences;
  matchCount: number;
  onEdit: () => void;
  onReset: () => void;
}

export default function StayMatchSummary({
  preferences,
  matchCount,
  onEdit,
  onReset,
}: StayMatchSummaryProps) {
  // Collect active preference tags into a unified display list
  const activeTags: { label: string; icon?: string }[] = [];

  if (preferences.purpose) {
    activeTags.push({ label: preferences.purpose, icon: '💼' });
  }
  if (preferences.budget) {
    activeTags.push({ label: `₹${preferences.budget}`, icon: '💎' });
  }
  if (preferences.guests) {
    activeTags.push({ label: `${preferences.guests} Guest${preferences.guests > 1 ? 's' : ''}`, icon: '👥' });
  }
  if (preferences.bedType && preferences.bedType !== 'No Preference') {
    activeTags.push({ label: `${preferences.bedType} Bed`, icon: '🛏️' });
  }
  (preferences.amenities || []).forEach((am) => {
    activeTags.push({ label: am, icon: '✨' });
  });
  (preferences.environment || []).forEach((env) => {
    activeTags.push({ label: env, icon: '🌙' });
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{
        background: CARD_BG,
        borderRadius: '20px',
        border: `1px solid ${BORDER_GOLD}`,
        padding: '24px 28px',
        marginBottom: '32px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ color: GOLD, fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              ✨ Active Stay Match
            </span>
            <span style={{
              background: 'rgba(201, 168, 76, 0.15)',
              color: GOLD,
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '12px',
              border: '1px solid rgba(201, 168, 76, 0.3)'
            }}>
              {matchCount} {matchCount === 1 ? 'Room' : 'Rooms'} Found
            </span>
          </div>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: TEXT_PRIMARY, fontFamily: 'var(--font-playfair), Georgia, serif' }}>
            Tailored Recommendations for Your Journey
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={onEdit}
            style={{
              padding: '9px 18px',
              borderRadius: '10px',
              background: 'rgba(201, 168, 76, 0.15)',
              border: '1px solid rgba(201, 168, 76, 0.4)',
              color: GOLD,
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(201, 168, 76, 0.25)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(201, 168, 76, 0.15)';
            }}
          >
            ⚙️ Edit Preferences
          </button>
          <button
            type="button"
            onClick={onReset}
            style={{
              padding: '9px 16px',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#F87171',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239, 68, 68, 0.2)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239, 68, 68, 0.1)';
            }}
          >
            ✕ Reset
          </button>
        </div>
      </div>

      {/* Preference Tags Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingTop: '14px', borderTop: '1px solid rgba(148, 163, 184, 0.12)' }}>
        <span style={{ fontSize: '13px', color: TEXT_SECONDARY, alignSelf: 'center', marginRight: '4px', fontWeight: 500 }}>
          Your Preferences:
        </span>
        {activeTags.map((tag, i) => (
          <BadgePill
            key={i}
            icon={tag.icon}
            label={tag.label}
            color={TEXT_PRIMARY}
            bgColor="#0D1526"
          />
        ))}
      </div>
    </motion.div>
  );
}
