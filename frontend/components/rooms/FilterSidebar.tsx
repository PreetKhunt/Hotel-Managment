'use client';

import { motion } from 'framer-motion';

// ─── Color Palette ────────────────────────────────────────────────────────────
const GOLD = '#C9A84C';
const CARD_BG = '#1A2235';
const TEXT = '#F8FAFC';
const SECONDARY = '#94A3B8';
const BG_DARK = '#0D1526';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface FilterState {
  types: string[];
  minPrice: number;
  maxPrice: number;
  guests: number;
  amenities: string[];
  minRating: number;
}

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

const ROOM_TYPES = ['Standard', 'Deluxe', 'Suite', 'Presidential'];
const AMENITIES  = ['WiFi', 'Pool', 'Spa', 'Gym', 'Balcony', 'Ocean View'];
const RATINGS    = [{ label: '3+ ★', value: 3 }, { label: '4+ ★', value: 4 }, { label: '4.5+ ★', value: 4.5 }];

// ─── Sub-components ───────────────────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
      color: GOLD, marginBottom: '12px',
      display: 'flex', alignItems: 'center', gap: '8px',
    }}>
      <span style={{ flex: 1, height: '1px', background: 'rgba(201,168,76,0.2)' }} />
      {children}
      <span style={{ flex: 1, height: '1px', background: 'rgba(201,168,76,0.2)' }} />
    </div>
  );
}

function CheckboxRow({
  label, checked, onChange,
}: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      cursor: 'pointer', padding: '5px 0',
      color: checked ? TEXT : SECONDARY,
      fontSize: '13.5px', fontWeight: checked ? 600 : 400,
      transition: 'color 0.15s ease',
    }}>
      <span style={{
        width: '17px', height: '17px', borderRadius: '5px', flexShrink: 0,
        border: `2px solid ${checked ? GOLD : 'rgba(148,163,184,0.3)'}`,
        background: checked ? GOLD : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s ease',
      }}>
        {checked && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <polyline points="1.5,5 4,7.5 8.5,2.5" stroke="#0A0F1E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        style={{ display: 'none' }} />
      {label}
    </label>
  );
}

function ToggleButton({
  label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '7px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
        fontWeight: active ? 700 : 500,
        background: active ? 'linear-gradient(135deg, #C9A84C, #E8C96A)' : 'rgba(148,163,184,0.08)',
        color: active ? '#0A0F1E' : SECONDARY,
        border: active ? 'none' : '1px solid rgba(148,163,184,0.2)',
        transition: 'all 0.2s ease',
        boxShadow: active ? '0 2px 12px rgba(201,168,76,0.25)' : 'none',
      }}
    >
      {label}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FilterSidebar({ filters, onChange }: FilterSidebarProps) {
  // ── Type toggles ──
  function toggleType(type: string) {
    const lower = type.toLowerCase();
    const next = filters.types.includes(lower)
      ? filters.types.filter((t) => t !== lower)
      : [...filters.types, lower];
    onChange({ ...filters, types: next });
  }

  // ── Amenity toggles ──
  function toggleAmenity(amenity: string) {
    const next = filters.amenities.includes(amenity)
      ? filters.amenities.filter((a) => a !== amenity)
      : [...filters.amenities, amenity];
    onChange({ ...filters, amenities: next });
  }

  // ── Clear all ──
  function clearAll() {
    onChange({ types: [], minPrice: 10000, maxPrice: 100000, guests: 0, amenities: [], minRating: 0 });
  }

  const hasActiveFilters =
    filters.types.length > 0 ||
    filters.minPrice > 0 ||
    filters.maxPrice < 100000 ||
    filters.guests > 0 ||
    filters.amenities.length > 0 ||
    filters.minRating > 0;

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: CARD_BG,
        borderRadius: '16px',
        border: '1px solid rgba(201,168,76,0.1)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        width: '100%',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: TEXT,
            fontFamily: 'var(--font-playfair), Georgia, serif' }}>
            Filters
          </h2>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#F87171', fontSize: '12px', fontWeight: 600, padding: '4px 8px',
              borderRadius: '6px', transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'none')}
          >
            Clear All
          </button>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'rgba(148,163,184,0.1)' }} />

      {/* ── Room Type ── */}
      <div>
        <SectionTitle>Room Type</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {ROOM_TYPES.map((type) => (
            <CheckboxRow
              key={type}
              label={type}
              checked={filters.types.includes(type.toLowerCase())}
              onChange={() => toggleType(type)}
            />
          ))}
        </div>
      </div>

      {/* ── Price Range ── */}
      <div>
        <SectionTitle>Price Range</SectionTitle>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '11px', color: SECONDARY, display: 'block', marginBottom: '5px' }}>Min (₹)</label>
            <input
              type="number"
              min={0}
              max={filters.maxPrice}
              value={filters.minPrice}
              onChange={(e) => onChange({ ...filters, minPrice: Number(e.target.value) })}
              style={{
                width: '100%', padding: '8px 10px', borderRadius: '8px',
                background: BG_DARK, border: '1px solid rgba(148,163,184,0.2)',
                color: TEXT, fontSize: '13px', outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => ((e.currentTarget as HTMLInputElement).style.borderColor = GOLD)}
              onBlur={(e) => ((e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(148,163,184,0.2)')}
            />
          </div>
          <span style={{ color: SECONDARY, fontSize: '14px', marginTop: '16px' }}>—</span>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '11px', color: SECONDARY, display: 'block', marginBottom: '5px' }}>Max (₹)</label>
            <input
              type="number"
              min={filters.minPrice}
              max={100000}
              value={filters.maxPrice}
              onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
              style={{
                width: '100%', padding: '8px 10px', borderRadius: '8px',
                background: BG_DARK, border: '1px solid rgba(148,163,184,0.2)',
                color: TEXT, fontSize: '13px', outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => ((e.currentTarget as HTMLInputElement).style.borderColor = GOLD)}
              onBlur={(e) => ((e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(148,163,184,0.2)')}
            />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
          <span style={{ color: SECONDARY, fontSize: '11px' }}>₹{filters.minPrice}</span>
          <span style={{ color: GOLD, fontSize: '12px', fontWeight: 600 }}>
            ₹{filters.minPrice} – ₹{filters.maxPrice}
          </span>
          <span style={{ color: SECONDARY, fontSize: '11px' }}>₹{filters.maxPrice}</span>
        </div>
      </div>

      {/* ── Guests ── */}
      <div>
        <SectionTitle>Guests</SectionTitle>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <ToggleButton
            label="Any"
            active={filters.guests === 0}
            onClick={() => onChange({ ...filters, guests: 0 })}
          />
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <ToggleButton
              key={n}
              label={String(n)}
              active={filters.guests === n}
              onClick={() => onChange({ ...filters, guests: n })}
            />
          ))}
        </div>
      </div>

      {/* ── Amenities ── */}
      <div>
        <SectionTitle>Amenities</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {AMENITIES.map((amenity) => (
            <CheckboxRow
              key={amenity}
              label={amenity}
              checked={filters.amenities.includes(amenity)}
              onChange={() => toggleAmenity(amenity)}
            />
          ))}
        </div>
      </div>

      {/* ── Rating ── */}
      <div>
        <SectionTitle>Rating</SectionTitle>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <ToggleButton
            label="All"
            active={filters.minRating === 0}
            onClick={() => onChange({ ...filters, minRating: 0 })}
          />
          {RATINGS.map((r) => (
            <ToggleButton
              key={r.value}
              label={r.label}
              active={filters.minRating === r.value}
              onClick={() => onChange({ ...filters, minRating: r.value })}
            />
          ))}
        </div>
      </div>

      {/* ── Clear All Button ── */}
      <button
        onClick={clearAll}
        style={{
          padding: '11px', borderRadius: '10px', cursor: 'pointer',
          background: hasActiveFilters ? 'rgba(201,168,76,0.1)' : 'rgba(148,163,184,0.06)',
          border: `1px solid ${hasActiveFilters ? 'rgba(201,168,76,0.3)' : 'rgba(148,163,184,0.15)'}`,
          color: hasActiveFilters ? GOLD : SECONDARY,
          fontSize: '13px', fontWeight: 600, letterSpacing: '0.04em',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          if (hasActiveFilters) {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(201,168,76,0.18)';
          }
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = hasActiveFilters
            ? 'rgba(201,168,76,0.1)'
            : 'rgba(148,163,184,0.06)';
        }}
      >
        {hasActiveFilters ? '✕ Clear All Filters' : 'No Active Filters'}
      </button>
    </motion.aside>
  );
}
