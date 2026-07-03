'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Room } from '@/types';
import FilterSidebar, { FilterState } from '@/components/rooms/FilterSidebar';
import RoomCard from '@/components/rooms/RoomCard';
import { useRooms } from '@/hooks/useRooms';

// ─── Color Palette ────────────────────────────────────────────────────────────
const GOLD = '#C9A84C';
const BG   = '#0A0F1E';
const CARD_BG = '#1A2235';
const TEXT = '#F8FAFC';
const SECONDARY = '#94A3B8';
const BG_DARK = '#0D1526';

// ─── Sort Options ─────────────────────────────────────────────────────────────
type SortOption = 'default' | 'price-asc' | 'price-desc' | 'rating' | 'popular';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'default',    label: 'Default Order' },
  { value: 'price-asc',  label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'rating',     label: 'Highest Rated' },
  { value: 'popular',    label: 'Most Popular' },
];

// ─── Default Filter State ─────────────────────────────────────────────────────
const DEFAULT_FILTERS: FilterState = {
  types: [],
  minPrice: 0,
  maxPrice: 200000,
  guests: 0,
  amenities: [],
  minRating: 0,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function filterRooms(rooms: Room[], filters: FilterState, search: string): Room[] {
  return rooms.filter((room) => {
    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      const hit =
        room.name.toLowerCase().includes(q) ||
        room.type.toLowerCase().includes(q) ||
        (room.description || '').toLowerCase().includes(q) ||
        (room.amenities || []).some((a) => a.toLowerCase().includes(q));
      if (!hit) return false;
    }
    // Type
    if (filters.types.length > 0 && !filters.types.includes(room.type)) return false;
    // Price
    if (room.pricePerNight < filters.minPrice) return false;
    if (filters.maxPrice > 0 && room.pricePerNight > filters.maxPrice) return false;
    // Guests
    if (filters.guests > 0 && room.maxGuests < filters.guests) return false;
    // Amenities
    if (filters.amenities.length > 0) {
      const hasAll = filters.amenities.every((fa) =>
        (room.amenities || []).some((ra) => ra.toLowerCase().includes(fa.toLowerCase()))
      );
      if (!hasAll) return false;
    }
    // Rating
    if (filters.minRating > 0 && room.rating < filters.minRating) return false;
    return true;
  });
}

function sortRooms(rooms: Room[], sort: SortOption): Room[] {
  const copy = [...rooms];
  switch (sort) {
    case 'price-asc':  return copy.sort((a, b) => a.pricePerNight - b.pricePerNight);
    case 'price-desc': return copy.sort((a, b) => b.pricePerNight - a.pricePerNight);
    case 'rating':     return copy.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case 'popular':    return copy.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    default:           return copy;
  }
}

// ─── Empty State ─────────────────────────────────────────────────────────────
function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        textAlign: 'center', padding: '80px 40px',
        background: CARD_BG, borderRadius: '20px',
        border: '1px solid rgba(201,168,76,0.1)',
        gridColumn: '1 / -1',
      }}
    >
      <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔍</div>
      <h3 style={{ margin: '0 0 8px', color: TEXT, fontSize: '22px', fontWeight: 700,
        fontFamily: 'var(--font-playfair), Georgia, serif' }}>
        No rooms found
      </h3>
      <p style={{ color: SECONDARY, fontSize: '14px', margin: '0 0 24px', lineHeight: 1.6 }}>
        Try adjusting your filters or search query to discover our available rooms.
      </p>
      <button
        onClick={onClear}
        style={{
          padding: '12px 28px', borderRadius: '10px', cursor: 'pointer',
          background: 'linear-gradient(135deg, #C9A84C, #E8C96A)',
          border: 'none', color: '#0A0F1E', fontWeight: 700, fontSize: '14px',
          boxShadow: '0 4px 16px rgba(201,168,76,0.3)',
        }}
      >
        Clear All Filters
      </button>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RoomsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const { data: rooms = [], isLoading, isError } = useRooms();

  const filteredRooms = useMemo(() => {
    const filtered = filterRooms(rooms, filters, searchQuery);
    return sortRooms(filtered, sortBy);
  }, [searchQuery, filters, sortBy, rooms]);

  function clearAll() {
    setFilters(DEFAULT_FILTERS);
    setSearchQuery('');
    setSortBy('default');
  }

  const hasActiveFilters =
    filters.types.length > 0 ||
    filters.minPrice > 0 ||
    filters.maxPrice < 5000 ||
    filters.guests > 0 ||
    filters.amenities.length > 0 ||
    filters.minRating > 0 ||
    searchQuery.trim().length > 0;

  return (
    <div style={{ minHeight: '100vh', background: BG, color: TEXT }}>
      {/* ── Page Header ── */}
      <div style={{
        background: `linear-gradient(135deg, #0A0F1E 0%, #0D1526 40%, #111827 100%)`,
        borderBottom: '1px solid rgba(201,168,76,0.15)',
        padding: '48px 0 36px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{
          position: 'absolute', top: '-60px', right: '-60px',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-40px', left: '10%',
          width: '200px', height: '200px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Link href="/" style={{ color: SECONDARY, fontSize: '13px', textDecoration: 'none',
              transition: 'color 0.2s' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = GOLD)}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = SECONDARY)}
            >
              Home
            </Link>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={SECONDARY} strokeWidth="1.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span style={{ color: GOLD, fontSize: '13px', fontWeight: 600 }}>Rooms &amp; Suites</span>
          </div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ height: '2px', width: '32px', background: `linear-gradient(90deg, transparent, ${GOLD})` }} />
              <span style={{ color: GOLD, fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Our Collection
              </span>
              <div style={{ height: '2px', width: '32px', background: `linear-gradient(90deg, ${GOLD}, transparent)` }} />
            </div>
            <h1 style={{
              margin: 0, fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: TEXT, lineHeight: 1.15,
              fontFamily: 'var(--font-playfair), Georgia, serif',
            }}>
              Rooms &amp; <span style={{ color: GOLD }}>Suites</span>
            </h1>
            <p style={{ color: SECONDARY, fontSize: '15px', marginTop: '10px', lineHeight: 1.6, maxWidth: '540px' }}>
              Discover our curated collection of premium rooms and suites, each designed to offer
              an unparalleled luxury experience tailored to your needs.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
        {/* ── Search + Sort bar ── */}
        <div style={{
          display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          {/* Search */}
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={SECONDARY} strokeWidth="2"
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search rooms, amenities, type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '12px 12px 12px 42px',
                borderRadius: '12px', background: CARD_BG,
                border: '1px solid rgba(148,163,184,0.2)',
                color: TEXT, fontSize: '14px', outline: 'none',
                boxSizing: 'border-box', transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => ((e.currentTarget as HTMLInputElement).style.borderColor = GOLD)}
              onBlur={(e) => ((e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(148,163,184,0.2)')}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: SECONDARY,
                  fontSize: '16px', padding: '0', lineHeight: 1,
                }}
              >✕</button>
            )}
          </div>

          {/* Sort */}
          <div style={{ position: 'relative' }}>
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={SECONDARY} strokeWidth="2"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            >
              <path d="M3 6h18M6 12h12M9 18h6" />
            </svg>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              style={{
                padding: '12px 16px 12px 34px',
                borderRadius: '12px', background: CARD_BG,
                border: '1px solid rgba(148,163,184,0.2)',
                color: TEXT, fontSize: '14px', outline: 'none', cursor: 'pointer',
                appearance: 'none',
              }}
              onFocus={(e) => ((e.currentTarget as HTMLSelectElement).style.borderColor = GOLD)}
              onBlur={(e) => ((e.currentTarget as HTMLSelectElement).style.borderColor = 'rgba(148,163,184,0.2)')}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} style={{ background: '#1A2235' }}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setMobileFilterOpen((p) => !p)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 18px', borderRadius: '12px', cursor: 'pointer',
              background: mobileFilterOpen ? 'rgba(201,168,76,0.15)' : CARD_BG,
              border: `1px solid ${mobileFilterOpen ? 'rgba(201,168,76,0.4)' : 'rgba(148,163,184,0.2)'}`,
              color: mobileFilterOpen ? GOLD : SECONDARY, fontSize: '14px', fontWeight: 600,
              transition: 'all 0.2s ease',
            }}
            className="lg-hide"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filters
            {hasActiveFilters && (
              <span style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: GOLD, boxShadow: `0 0 6px ${GOLD}`,
              }} />
            )}
          </button>
        </div>

        {/* Mobile filter panel */}
        <AnimatePresence>
          {mobileFilterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{ overflow: 'hidden', marginBottom: '24px' }}
            >
              <FilterSidebar filters={filters} onChange={setFilters} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Results count ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '20px', flexWrap: 'wrap', gap: '8px',
        }}>
          <p style={{ margin: 0, color: SECONDARY, fontSize: '14px' }}>
            Showing{' '}
            <span style={{ color: GOLD, fontWeight: 700 }}>{filteredRooms.length}</span>
            {' '}of{' '}
            <span style={{ color: TEXT, fontWeight: 600 }}>{rooms.length}</span>
            {' '}rooms
            {hasActiveFilters && (
              <span style={{ color: SECONDARY }}> with active filters</span>
            )}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearAll}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: '4px 10px',
                color: '#F87171', fontSize: '12px', fontWeight: 600, borderRadius: '6px',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'none')}
            >
              ✕ Clear all
            </button>
          )}
        </div>

        {/* ── Two-column layout ── */}
        <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start' }}>
          {/* Sidebar — desktop only */}
          <div style={{ width: '288px', flexShrink: 0, position: 'sticky', top: '24px' }}
            className="sidebar-desktop">
            <FilterSidebar filters={filters} onChange={setFilters} />
          </div>

          {/* Room Grid */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '80px 40px', color: SECONDARY }}>
                <div style={{ width: '40px', height: '40px', border: `3px solid ${GOLD}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
                <p>Loading rooms...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : isError ? (
              <div style={{ textAlign: 'center', padding: '80px 40px', color: '#ef4444' }}>
                <p>Failed to load rooms. Please try again later.</p>
              </div>
            ) : filteredRooms.length === 0 ? (
              <EmptyState onClear={clearAll} />
            ) : (
              <motion.div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '24px',
                }}
              >
                <AnimatePresence mode="popLayout">
                  {filteredRooms.map((room, i) => (
                    <motion.div
                      key={room.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: i * 0.04 }}
                    >
                      <RoomCard room={room} index={i} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .sidebar-desktop { display: block; }
        .lg-hide { display: none; }
        select option { background: #1A2235; color: #F8FAFC; }

        @media (max-width: 1024px) {
          .sidebar-desktop { display: none !important; }
          .lg-hide { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
