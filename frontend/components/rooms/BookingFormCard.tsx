'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Room } from '@/types';

// ─── Color Palette ────────────────────────────────────────────────────────────
const GOLD = '#C9A84C';
const CARD_BG = '#1A2235';
const TEXT = '#F8FAFC';
const SECONDARY = '#94A3B8';
const BG_DARK = '#0D1526';

import api from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';

// ─── Props ────────────────────────────────────────────────────────────────────
interface BookingFormCardProps {
  room: Room;
  onClose?: () => void;
}

interface FormState {
  checkIn: string;
  checkOut: string;
  guests: number;
  specialRequests: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function getTomorrowStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function calcNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const a = new Date(checkIn).getTime();
  const b = new Date(checkOut).getTime();
  const diff = Math.round((b - a) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

function InputLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{
      display: 'block', fontSize: '11px', fontWeight: 700,
      color: SECONDARY, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px',
    }}>
      {children}
    </label>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function BookingFormCard({ room, onClose }: BookingFormCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [form, setForm] = useState<FormState>({
    checkIn: getTodayStr(),
    checkOut: getTomorrowStr(),
    guests: 1,
    specialRequests: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const nights = calcNights(form.checkIn, form.checkOut);
  const subtotal = room.pricePerNight * nights;
  const taxRate = 0.12;
  const taxes = Math.round(subtotal * taxRate);
  const total = subtotal + taxes;

  function handleField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (nights <= 0) return;

    if (!user) {
      toast.error('Please log in to make a booking.');
      return;
    }

    setLoading(true);
    try {
      // Redirect to Checkout page with booking parameters
      const qs = new URLSearchParams({
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        guests: form.guests.toString(),
        specialRequests: form.specialRequests,
      }).toString();
      
      router.push(`/checkout/${room.id}?${qs}`);
    } catch (err: any) {
      console.error(err);
      toast.error(`Error: ${err.message || 'An error occurred. Please try again.'}`);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setSubmitted(false);
    setForm({ checkIn: getTodayStr(), checkOut: getTomorrowStr(), guests: 1, specialRequests: '' });
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: '9px',
    background: BG_DARK, border: '1px solid rgba(148,163,184,0.2)',
    color: TEXT, fontSize: '14px', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s ease',
  };

  return (
    <div style={{
      background: CARD_BG,
      borderRadius: '20px',
      border: '1px solid rgba(201,168,76,0.18)',
      boxShadow: '0 8px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(201,168,76,0.06)',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Gold accent line */}
      <div style={{
        height: '3px',
        background: 'linear-gradient(90deg, transparent, #C9A84C, #E8C96A, #C9A84C, transparent)',
      }} />

      <div style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ color: GOLD, fontSize: '24px', fontWeight: 700, lineHeight: 1 }}>
              ₹{room.pricePerNight.toLocaleString()}
              <span style={{ color: SECONDARY, fontSize: '14px', fontWeight: 400 }}>/night</span>
            </div>
            <div style={{ color: SECONDARY, fontSize: '12px', marginTop: '4px' }}>
              {room.name}
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'rgba(148,163,184,0.1)', border: '1px solid rgba(148,163,184,0.15)',
                borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer',
                color: SECONDARY, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', lineHeight: 1, flexShrink: 0,
              }}
            >
              ✕
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {submitted ? (
            /* ── Success State ── */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{ textAlign: 'center', padding: '16px 0' }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
                style={{
                  width: '72px', height: '72px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.1))',
                  border: '2px solid #34D399',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                  boxShadow: '0 0 30px rgba(52,211,153,0.25)',
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                style={{ margin: '0 0 8px', color: TEXT, fontSize: '20px', fontWeight: 700,
                  fontFamily: 'var(--font-playfair), Georgia, serif' }}
              >
                Booking Confirmed!
              </motion.h3>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                style={{ color: SECONDARY, fontSize: '13px', lineHeight: 1.6, margin: '0 0 8px' }}
              >
                Your reservation for <strong style={{ color: TEXT }}>{room.name}</strong> has been placed.
                A confirmation email will be sent shortly.
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{
                  background: BG_DARK, borderRadius: '10px', padding: '14px',
                  margin: '16px 0', border: '1px solid rgba(201,168,76,0.15)',
                  textAlign: 'left',
                }}
              >
                {[
                  ['Check-in',  form.checkIn],
                  ['Check-out', form.checkOut],
                  ['Guests',    String(form.guests)],
                  ['Nights',    String(nights)],
                  ['Total',     `₹${total.toLocaleString()}`],
                ].map(([label, val]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                    <span style={{ color: SECONDARY, fontSize: '12px' }}>{label}</span>
                    <span style={{ color: label === 'Total' ? GOLD : TEXT, fontSize: '12px', fontWeight: label === 'Total' ? 700 : 400 }}>
                      {val}
                    </span>
                  </div>
                ))}
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                onClick={handleReset}
                style={{
                  width: '100%', padding: '12px', borderRadius: '10px', cursor: 'pointer',
                  background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)',
                  color: GOLD, fontSize: '14px', fontWeight: 600, transition: 'all 0.2s ease',
                }}
              >
                Make Another Booking
              </motion.button>
            </motion.div>
          ) : (
            /* ── Booking Form ── */
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              {/* Dates row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <InputLabel>Check-in</InputLabel>
                  <input
                    type="date"
                    required
                    min={getTodayStr()}
                    value={form.checkIn}
                    onChange={(e) => handleField('checkIn', e.target.value)}
                    style={inputStyle}
                    onFocus={(e) => ((e.currentTarget as HTMLInputElement).style.borderColor = GOLD)}
                    onBlur={(e) => ((e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(148,163,184,0.2)')}
                  />
                </div>
                <div>
                  <InputLabel>Check-out</InputLabel>
                  <input
                    type="date"
                    required
                    min={form.checkIn || getTodayStr()}
                    value={form.checkOut}
                    onChange={(e) => handleField('checkOut', e.target.value)}
                    style={inputStyle}
                    onFocus={(e) => ((e.currentTarget as HTMLInputElement).style.borderColor = GOLD)}
                    onBlur={(e) => ((e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(148,163,184,0.2)')}
                  />
                </div>
              </div>

              {/* Nights indicator */}
              {nights > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  style={{
                    background: 'rgba(201,168,76,0.08)', borderRadius: '8px', padding: '8px 12px',
                    border: '1px solid rgba(201,168,76,0.2)', textAlign: 'center',
                    color: GOLD, fontSize: '13px', fontWeight: 600,
                  }}
                >
                  🌙 {nights} night{nights > 1 ? 's' : ''}
                </motion.div>
              )}

              {/* Guests */}
              <div>
                <InputLabel>Number of Guests</InputLabel>
                <select
                  value={form.guests}
                  onChange={(e) => handleField('guests', Number(e.target.value))}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                  onFocus={(e) => ((e.currentTarget as HTMLSelectElement).style.borderColor = GOLD)}
                  onBlur={(e) => ((e.currentTarget as HTMLSelectElement).style.borderColor = 'rgba(148,163,184,0.2)')}
                >
                  {Array.from({ length: room.maxGuests }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n} style={{ background: '#1A2235' }}>
                      {n} Guest{n > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Special requests */}
              <div>
                <InputLabel>Special Requests <span style={{ color: SECONDARY, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></InputLabel>
                <textarea
                  value={form.specialRequests}
                  onChange={(e) => handleField('specialRequests', e.target.value)}
                  placeholder="e.g., early check-in, anniversary setup, dietary requirements..."
                  rows={3}
                  style={{
                    ...inputStyle, resize: 'vertical', minHeight: '80px',
                    fontFamily: 'inherit', lineHeight: '1.5',
                  }}
                  onFocus={(e) => ((e.currentTarget as HTMLTextAreaElement).style.borderColor = GOLD)}
                  onBlur={(e) => ((e.currentTarget as HTMLTextAreaElement).style.borderColor = 'rgba(148,163,184,0.2)')}
                />
              </div>

              {/* Price summary */}
              {nights > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    background: BG_DARK, borderRadius: '12px', padding: '16px',
                    border: '1px solid rgba(201,168,76,0.12)',
                  }}
                >
                  <div style={{ fontSize: '12px', color: SECONDARY, fontWeight: 600, letterSpacing: '0.08em',
                    textTransform: 'uppercase', marginBottom: '10px' }}>
                    Price Summary
                  </div>
                  {[
                    [`₹${room.pricePerNight.toLocaleString()} × ${nights} night${nights > 1 ? 's' : ''}`, `₹${subtotal.toLocaleString()}`],
                    ['Taxes & fees (12%)', `₹${taxes.toLocaleString()}`],
                  ].map(([label, val]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                      <span style={{ color: SECONDARY, fontSize: '13px' }}>{label}</span>
                      <span style={{ color: TEXT, fontSize: '13px' }}>{val}</span>
                    </div>
                  ))}
                  <div style={{ height: '1px', background: 'rgba(201,168,76,0.15)', margin: '10px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: TEXT, fontSize: '15px', fontWeight: 700 }}>Total</span>
                    <span style={{ color: GOLD, fontSize: '20px', fontWeight: 800 }}>
                      ₹{total.toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={nights <= 0 || loading}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%', padding: '14px',
                  borderRadius: '11px', cursor: nights > 0 ? 'pointer' : 'not-allowed',
                  background: nights > 0
                    ? 'linear-gradient(135deg, #C9A84C 0%, #E8C96A 50%, #C9A84C 100%)'
                    : 'rgba(148,163,184,0.15)',
                  border: 'none',
                  color: nights > 0 ? '#0A0F1E' : SECONDARY,
                  fontSize: '15px', fontWeight: 700, letterSpacing: '0.04em',
                  boxShadow: nights > 0 ? '0 4px 20px rgba(201,168,76,0.4)' : 'none',
                  transition: 'all 0.2s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                {loading ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                      style={{ animation: 'spin 1s linear infinite' }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Processing...
                  </>
                ) : nights > 0 ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 12V22H4V12" />
                      <path d="M22 7H2v5h20V7z" />
                      <path d="M12 22V7" />
                      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                    </svg>
                    Proceed to Checkout
                  </>
                ) : (
                  'Select Dates to Book'
                )}
              </motion.button>

              <p style={{ textAlign: 'center', color: SECONDARY, fontSize: '11px', margin: 0 }}>
                Free cancellation up to 24 hours before check-in
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.7); cursor: pointer; }
        select option { background: #1A2235; color: #F8FAFC; }
      `}</style>
    </div>
  );
}
