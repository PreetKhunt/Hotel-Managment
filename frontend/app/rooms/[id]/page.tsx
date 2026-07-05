'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useRoom } from '@/hooks/useRooms';
import BookingFormCard from '@/components/rooms/BookingFormCard';
import AvailabilityCalendar from '@/components/rooms/AvailabilityCalendar';

// ─── Color Palette ────────────────────────────────────────────────────────────
const GOLD = '#C9A84C';
const BG   = '#0A0F1E';
const CARD_BG = '#1A2235';
const TEXT = '#F8FAFC';
const SECONDARY = '#94A3B8';
const BG_DARK = '#0D1526';

// ─── Star Rating ─────────────────────────────────────────────────────────────
function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = rating >= star;
        const half   = !filled && rating >= star - 0.5;
        return (
          <svg key={star} width={size} height={size} viewBox="0 0 24 24"
            fill={filled || half ? GOLD : 'none'} stroke={GOLD} strokeWidth="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      })}
    </span>
  );
}

// ─── Type / Status helpers ────────────────────────────────────────────────────
function typeBadgeStyle(type: string): React.CSSProperties {
  const map: Record<string, { bg: string; color: string }> = {
    presidential: { bg: 'rgba(139,92,246,0.18)', color: '#A78BFA' },
    suite:        { bg: 'rgba(16,185,129,0.15)',  color: '#34D399' },
    deluxe:       { bg: 'rgba(201,168,76,0.18)',  color: GOLD },
    standard:     { bg: 'rgba(148,163,184,0.15)', color: SECONDARY },
  };
  const s = map[type] || map.standard;
  return {
    padding: '5px 14px', borderRadius: '20px', fontSize: '12px',
    fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
    background: s.bg, color: s.color, border: `1px solid ${s.color}33`,
  };
}

// ─── Amenity icon map ─────────────────────────────────────────────────────────
const AMENITY_ICONS: Record<string, string> = {
  'WiFi': '📶', 'TV': '📺', 'Bar': '🍸', 'Air': '❄️',
  'Service': '🛎️', 'Safe': '🔐', 'Balcony': '🌅',
  'Ocean': '🌊', 'Tub': '🛁', 'Espresso': '☕',
  'Butler': '🤵', 'Terrace': '🌿', 'Lounge': '🏢',
  'Spa': '💆', 'Gym': '💪', 'Pool': '🏊',
  'Kitchen': '🍳', 'Theater': '🎬', 'Champagne': '🥂',
  'Chef': '👨‍🍳', 'Limousine': '🚘',
};

function getIcon(amenity: string): string {
  for (const [key, icon] of Object.entries(AMENITY_ICONS)) {
    if (amenity.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return '✦';
}

// ─── Room Detail Page ─────────────────────────────────────────────────────────
export default function RoomDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { data: room, isLoading, isError } = useRoom(id);

  const [activeImage, setActiveImage] = useState(0);
  const [showBooking, setShowBooking] = useState(false);

  // ── Loading ──
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh', background: BG, display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
        gap: '20px', padding: '40px', color: SECONDARY
      }}>
        <div style={{ width: '50px', height: '50px', border: `3px solid ${GOLD}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p>Loading room details...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Not found / Error ──
  if (isError || !room) {
    return (
      <div style={{
        minHeight: '100vh', background: BG, display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
        gap: '20px', padding: '40px',
      }}>
        <div style={{ fontSize: '72px' }}>🏨</div>
        <h1 style={{ margin: 0, color: TEXT, fontSize: '28px', fontWeight: 700,
          fontFamily: 'var(--font-playfair), Georgia, serif' }}>
          Room Not Found
        </h1>
        <p style={{ color: SECONDARY, textAlign: 'center', maxWidth: '380px', lineHeight: 1.6 }}>
          The room you&apos;re looking for doesn&apos;t exist or may have been removed from our collection.
        </p>
        <Link
          href="/rooms"
          style={{
            padding: '12px 28px', borderRadius: '10px', textDecoration: 'none',
            background: 'linear-gradient(135deg, #C9A84C, #E8C96A)',
            color: '#0A0F1E', fontWeight: 700, fontSize: '15px',
            boxShadow: '0 4px 16px rgba(201,168,76,0.35)',
          }}
        >
          Browse All Rooms
        </Link>
      </div>
    );
  }

  const allImages = (room.images && room.images.length >= 3)
    ? room.images
    : [
        ...(room.images || []),
        ...Array(3 - (room.images ? room.images.length : 0)).fill(room.images?.[0] || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'),
      ];

  return (
    <div style={{ minHeight: '100vh', background: BG, color: TEXT }}>
      {/* ── Breadcrumb + Back ── */}
      <div style={{
        background: BG_DARK, borderBottom: '1px solid rgba(201,168,76,0.1)',
        padding: '14px 0',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link href="/" style={{ color: SECONDARY, fontSize: '13px', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = GOLD)}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = SECONDARY)}>
              Home
            </Link>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={SECONDARY} strokeWidth="1.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <Link href="/rooms" style={{ color: SECONDARY, fontSize: '13px', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = GOLD)}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = SECONDARY)}>
              Rooms &amp; Suites
            </Link>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={SECONDARY} strokeWidth="1.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span style={{ color: GOLD, fontSize: '13px', fontWeight: 600,
              maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {room.name}
            </span>
          </div>
          {/* Back button */}
          <Link
            href="/rooms"
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '8px 16px', borderRadius: '9px', textDecoration: 'none',
              background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.15)',
              color: SECONDARY, fontSize: '13px', fontWeight: 500, transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.background = 'rgba(201,168,76,0.1)';
              el.style.borderColor = 'rgba(201,168,76,0.3)';
              el.style.color = GOLD;
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.background = 'rgba(148,163,184,0.08)';
              el.style.borderColor = 'rgba(148,163,184,0.15)';
              el.style.color = SECONDARY;
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Rooms
          </Link>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
        <div className="room-detail-grid" style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>

          {/* ── LEFT: Details ── */}
          <div style={{ flex: '1 1 0', minWidth: 0 }}>

            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{ marginBottom: '28px' }}
            >
              {/* Main image */}
              <div style={{
                borderRadius: '20px', overflow: 'hidden', height: '420px',
                position: 'relative', marginBottom: '12px',
                border: '1px solid rgba(201,168,76,0.1)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}>
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImage}
                    src={allImages[activeImage]}
                    alt={`${room.name} - Image ${activeImage + 1}`}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.45, ease: 'easeInOut' }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800';
                    }}
                  />
                </AnimatePresence>
                {/* Gradient overlay */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to bottom, transparent 50%, rgba(10,15,30,0.6) 100%)',
                  pointerEvents: 'none',
                }} />
                {/* Image counter */}
                <div style={{
                  position: 'absolute', bottom: '16px', right: '16px',
                  background: 'rgba(10,15,30,0.75)', backdropFilter: 'blur(8px)',
                  borderRadius: '20px', padding: '5px 12px',
                  color: TEXT, fontSize: '12px', fontWeight: 600,
                  border: '1px solid rgba(255,255,255,0.1)',
                }}>
                  {activeImage + 1} / {allImages.length}
                </div>
              </div>

              {/* Thumbnails */}
              <div style={{ display: 'flex', gap: '10px' }}>
                {allImages.slice(0, 3).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    style={{
                      flex: 1, height: '90px', borderRadius: '12px', overflow: 'hidden',
                      border: `2px solid ${activeImage === i ? GOLD : 'rgba(148,163,184,0.15)'}`,
                      padding: 0, cursor: 'pointer',
                      boxShadow: activeImage === i ? `0 0 16px rgba(201,168,76,0.3)` : 'none',
                      transition: 'all 0.2s ease', outline: 'none', background: 'none',
                    }}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${i + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                        opacity: activeImage === i ? 1 : 0.6, transition: 'opacity 0.2s ease' }}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800';
                      }}
                    />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Room Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Name + Type badge */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start',
                gap: '14px', marginBottom: '12px' }}>
                <h1 style={{
                  margin: 0, fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 700, color: TEXT,
                  fontFamily: 'var(--font-playfair), Georgia, serif', lineHeight: 1.2, flex: 1,
                }}>
                  {room.name}
                </h1>
                <span style={typeBadgeStyle(room.type) as React.CSSProperties}>
                  {room.type}
                </span>
              </div>

              {/* Rating + reviews */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
                <StarRating rating={room.rating} size={18} />
                <span style={{ color: TEXT, fontSize: '16px', fontWeight: 700 }}>{room.rating.toFixed(1)}</span>
                <span style={{ color: SECONDARY, fontSize: '14px' }}>({room.reviewCount} verified reviews)</span>
                <span style={{
                  padding: '3px 10px', borderRadius: '20px',
                  background: room.status === 'available' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.12)',
                  color: room.status === 'available' ? '#34D399' : '#F87171',
                  fontSize: '12px', fontWeight: 600,
                  border: `1px solid ${room.status === 'available' ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`,
                  display: 'flex', alignItems: 'center', gap: '5px',
                }}>
                  <span style={{
                    width: '5px', height: '5px', borderRadius: '50%',
                    background: room.status === 'available' ? '#34D399' : '#F87171',
                    boxShadow: `0 0 5px ${room.status === 'available' ? '#34D399' : '#F87171'}`,
                  }} />
                  {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                </span>
              </div>

              {/* Description */}
              <div style={{
                background: CARD_BG, borderRadius: '16px', padding: '20px',
                border: '1px solid rgba(201,168,76,0.08)', marginBottom: '24px',
              }}>
                <h2 style={{
                  margin: '0 0 10px', fontSize: '12px', fontWeight: 700, color: GOLD,
                  letterSpacing: '0.04em', textTransform: 'uppercase',
                }}>
                  About This Room
                </h2>
                <p style={{ margin: 0, color: SECONDARY, fontSize: '14.5px', lineHeight: 1.75 }}>
                  {room.longDescription}
                </p>
              </div>

              {/* Specs Grid */}
              <div style={{
                background: CARD_BG, borderRadius: '16px', padding: '20px',
                border: '1px solid rgba(201,168,76,0.08)', marginBottom: '24px',
              }}>
                <h2 style={{
                  margin: '0 0 16px', fontSize: '12px', fontWeight: 700, color: GOLD,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                }}>
                  Room Specifications
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                  gap: '16px',
                }}>
                  {[
                    {
                      icon: (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5">
                          <path d="M3 7v11m18-11v11M3 12h18M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2" />
                        </svg>
                      ),
                      label: 'Bed Type',
                      value: room.bedType,
                    },
                    {
                      icon: (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                        </svg>
                      ),
                      label: 'Room Size',
                      value: `${room.size} sqft`,
                    },
                    {
                      icon: (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                          <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                      ),
                      label: 'Floor',
                      value: `Floor ${room.floor}`,
                    },
                    {
                      icon: (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                      ),
                      label: 'Max Guests',
                      value: `${room.maxGuests} guests`,
                    },
                  ].map(({ icon, label, value }) => (
                    <div key={label} style={{
                      background: BG_DARK, borderRadius: '12px', padding: '14px',
                      border: '1px solid rgba(201,168,76,0.08)',
                    }}>
                      <div style={{ marginBottom: '8px' }}>{icon}</div>
                      <div style={{ color: SECONDARY, fontSize: '11px', fontWeight: 600,
                        letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px' }}>
                        {label}
                      </div>
                      <div style={{ color: TEXT, fontSize: '14px', fontWeight: 600 }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities Grid */}
              <div style={{
                background: CARD_BG, borderRadius: '16px', padding: '20px',
                border: '1px solid rgba(201,168,76,0.08)',
              }}>
                <h2 style={{
                  margin: '0 0 16px', fontSize: '12px', fontWeight: 700, color: GOLD,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                }}>
                  Amenities &amp; Features ({room.amenities.length})
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: '10px',
                }}>
                  {room.amenities.map((amenity) => (
                    <div key={amenity} style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 12px', borderRadius: '10px',
                      background: BG_DARK, border: '1px solid rgba(148,163,184,0.1)',
                    }}>
                      <span style={{ fontSize: '18px', flexShrink: 0 }}>{getIcon(amenity)}</span>
                      <span style={{ color: SECONDARY, fontSize: '13px', fontWeight: 500, lineHeight: 1.3 }}>
                        {amenity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Availability Calendar */}
              <div style={{ marginTop: '24px' }}>
                <AvailabilityCalendar roomId={room.id} />
              </div>

              {/* Mobile booking button */}
              <div className="mobile-book-btn" style={{ display: 'none', marginTop: '24px' }}>
                <button
                  onClick={() => setShowBooking(true)}
                  style={{
                    width: '100%', padding: '14px', borderRadius: '12px', cursor: 'pointer',
                    background: 'linear-gradient(135deg, #C9A84C 0%, #E8C96A 50%, #C9A84C 100%)',
                    border: 'none', color: '#0A0F1E', fontSize: '16px', fontWeight: 700,
                    boxShadow: '0 4px 20px rgba(201,168,76,0.4)', letterSpacing: '0.04em',
                  }}
                >
                  Book This Room — ₹{room.pricePerNight.toLocaleString()}/night
                </button>
              </div>
            </motion.div>
          </div>

          {/* ── RIGHT: Sticky Booking Card ── */}
          <div className="booking-sidebar" style={{
            width: '380px', flexShrink: 0, position: 'sticky', top: '24px',
          }}>
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <BookingFormCard room={room} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile booking modal */}
      <AnimatePresence>
        {showBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              background: 'rgba(10,15,30,0.85)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'flex-end',
            }}
            onClick={() => setShowBooking(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              style={{
                width: '100%', maxHeight: '90vh', overflowY: 'auto',
                borderRadius: '24px 24px 0 0',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <BookingFormCard room={room} onClose={() => setShowBooking(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .booking-sidebar { display: block; }
        .mobile-book-btn { display: none !important; }

        @media (max-width: 1024px) {
          .booking-sidebar { display: none !important; }
          .mobile-book-btn { display: block !important; }
        }
      `}</style>
    </div>
  );
}
