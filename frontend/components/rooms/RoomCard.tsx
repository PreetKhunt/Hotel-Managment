'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Room } from '@/types';

// ─── Color Palette ────────────────────────────────────────────────────────────
const GOLD = '#C9A84C';
const CARD_BG = '#1A2235';
const TEXT = '#F8FAFC';
const SECONDARY = '#94A3B8';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function typeLabel(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function typeBadgeColor(type: string): { bg: string; color: string } {
  switch (type) {
    case 'presidential': return { bg: 'rgba(139,92,246,0.18)', color: '#A78BFA' };
    case 'suite':        return { bg: 'rgba(16,185,129,0.15)', color: '#34D399' };
    case 'deluxe':       return { bg: 'rgba(201,168,76,0.18)', color: GOLD };
    default:             return { bg: 'rgba(148,163,184,0.15)', color: SECONDARY };
  }
}

function statusBadgeStyle(status: string): { bg: string; color: string; dot: string } {
  switch (status) {
    case 'available':   return { bg: 'rgba(16,185,129,0.15)',  color: '#34D399', dot: '#34D399' };
    case 'occupied':    return { bg: 'rgba(239,68,68,0.15)',   color: '#F87171', dot: '#F87171' };
    case 'reserved':    return { bg: 'rgba(234,179,8,0.15)',   color: '#FCD34D', dot: '#FCD34D' };
    case 'maintenance': return { bg: 'rgba(148,163,184,0.15)', color: SECONDARY, dot: SECONDARY };
    default:            return { bg: 'rgba(148,163,184,0.15)', color: SECONDARY, dot: SECONDARY };
  }
}

function StarRatingInline({ rating }: { rating: number }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = rating >= star;
        const half   = !filled && rating >= star - 0.5;
        return (
          <svg key={star} width="13" height="13" viewBox="0 0 24 24"
            fill={filled || half ? GOLD : 'none'}
            stroke={GOLD} strokeWidth="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      })}
    </span>
  );
}

const AMENITY_ICONS: Record<string, string> = {
  'WiFi': '📶', 'TV': '📺', 'Bar': '🍸', 'Air': '❄️',
  'Service': '🛎️', 'Safe': '🔐', 'Balcony': '🌅',
  'Ocean': '🌊', 'Tub': '🛁', 'Espresso': '☕',
  'Butler': '🤵', 'Terrace': '🌿', 'Lounge': '🏢',
  'Spa': '💆', 'Gym': '💪', 'Pool': '🏊',
};

function getAmenityIcon(amenity: string): string {
  for (const [key, icon] of Object.entries(AMENITY_ICONS)) {
    if (amenity.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return '✦';
}

interface RoomCardProps {
  room: Room;
  index?: number;
}

export default function RoomCard({ room, index = 0 }: RoomCardProps) {
  const typeBadge   = typeBadgeColor(room.type);
  const statusBadge = statusBadgeStyle(room.status);
  const topThree    = room.amenities.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.25, ease: 'easeOut' } }}
      style={{
        background: CARD_BG,
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(201,168,76,0.12)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'box-shadow 0.25s ease, border-color 0.25s ease',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.boxShadow = '0 16px 48px rgba(201,168,76,0.18), 0 4px 24px rgba(0,0,0,0.45)';
        el.style.borderColor = 'rgba(201,168,76,0.35)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.boxShadow = '0 4px 24px rgba(0,0,0,0.35)';
        el.style.borderColor = 'rgba(201,168,76,0.12)';
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: '220px', overflow: 'hidden', flexShrink: 0 }}>
        <motion.img
          src={room.images[0]}
          alt={room.name}
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800';
          }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.02) 50%, rgba(10,15,30,0.5) 100%)',
          pointerEvents: 'none',
        }} />
        {/* Type badge */}
        <span style={{
          position: 'absolute', top: '12px', left: '12px',
          padding: '4px 10px', borderRadius: '20px',
          fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
          background: typeBadge.bg, color: typeBadge.color,
          backdropFilter: 'blur(8px)', border: `1px solid ${typeBadge.color}33`,
        }}>
          {typeLabel(room.type)}
        </span>
        {/* Status badge */}
        <span style={{
          position: 'absolute', top: '12px', right: '12px',
          padding: '4px 10px', borderRadius: '20px',
          fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'capitalize',
          background: statusBadge.bg, color: statusBadge.color,
          backdropFilter: 'blur(8px)', border: `1px solid ${statusBadge.color}33`,
          display: 'flex', alignItems: 'center', gap: '5px',
        }}>
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: statusBadge.dot, display: 'inline-block',
            boxShadow: `0 0 6px ${statusBadge.dot}`,
          }} />
          {room.status}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
        {/* Name + Price */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <h3 style={{
            margin: 0, fontSize: '17px', fontWeight: 700, color: TEXT, lineHeight: 1.3,
            fontFamily: 'var(--font-playfair), Georgia, serif', flex: 1,
          }}>
            {room.name}
          </h3>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ color: GOLD, fontSize: '20px', fontWeight: 700, lineHeight: 1 }}>
              ${room.pricePerNight.toLocaleString()}
            </div>
            <div style={{ color: SECONDARY, fontSize: '11px', marginTop: '2px' }}>/night</div>
          </div>
        </div>

        {/* Rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <StarRatingInline rating={room.rating} />
          <span style={{ color: TEXT, fontSize: '13px', fontWeight: 600 }}>{room.rating.toFixed(1)}</span>
          <span style={{ color: SECONDARY, fontSize: '12px' }}>({room.reviewCount} reviews)</span>
        </div>

        {/* Amenity chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {topThree.map((amenity) => (
            <span key={amenity} style={{
              padding: '3px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: 500,
              color: SECONDARY, background: 'rgba(148,163,184,0.08)',
              border: '1px solid rgba(148,163,184,0.15)',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              <span>{getAmenityIcon(amenity)}</span>
              {amenity}
            </span>
          ))}
          {room.amenities.length > 3 && (
            <span style={{
              padding: '3px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: 500,
              color: GOLD, background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)',
            }}>
              +{room.amenities.length - 3} more
            </span>
          )}
        </div>

        {/* Specs */}
        <div style={{
          display: 'flex', gap: '16px', paddingTop: '10px',
          borderTop: '1px solid rgba(148,163,184,0.1)',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={SECONDARY} strokeWidth="1.5">
              <path d="M3 7v11m18-11v11M3 12h18M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2" />
            </svg>
            <span style={{ color: SECONDARY, fontSize: '12px' }}>{room.bedType}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={SECONDARY} strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
            </svg>
            <span style={{ color: SECONDARY, fontSize: '12px' }}>{room.size} sqft</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={SECONDARY} strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span style={{ color: SECONDARY, fontSize: '12px' }}>Up to {room.maxGuests}</span>
          </div>
        </div>

        {/* CTA */}
        <Link
          href={`/rooms/${room.id}`}
          style={{
            display: 'block', marginTop: 'auto', padding: '11px 0',
            textAlign: 'center', borderRadius: '10px',
            background: 'linear-gradient(135deg, #C9A84C 0%, #E8C96A 50%, #C9A84C 100%)',
            color: '#0A0F1E', fontWeight: 700, fontSize: '14px', letterSpacing: '0.04em',
            textDecoration: 'none', transition: 'opacity 0.2s ease, transform 0.15s ease',
            boxShadow: '0 4px 16px rgba(201,168,76,0.3)',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.opacity = '0.88';
            el.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          }}
          onClick={(e) => e.stopPropagation()}
        >
          View Details
        </Link>
      </div>
    </motion.div>
  );
}
