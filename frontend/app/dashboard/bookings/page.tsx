'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import StatusBadge from '@/components/shared/StatusBadge';
import { Eye, Download, Search, CalendarDays, CheckCircle, Clock, XCircle, X } from 'lucide-react';

interface Booking {
  id: string;
  booking_reference: string;
  guestName?: string; // from user later
  user_id: string;
  room_id: string;
  room_name?: string;
  check_in: string;
  check_out: string;
  grand_total: number;
  status: string;
}

export default function BookingsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);

  const { data: bookings = [], isLoading: loading } = useQuery({
    queryKey: ['bookings', statusFilter],
    queryFn: async () => {
      let url = '/bookings';
      if (statusFilter !== 'all') {
        url += `?status=${statusFilter}`;
      }
      const res = await api.get(url);
      return res.data.data;
    }
  });

  const cancelMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const res = await api.post(`/bookings/${bookingId}/cancel`);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        alert('Booking cancelled successfully! Refund has been initiated.');
        queryClient.invalidateQueries({ queryKey: ['bookings'] });
      } else {
        alert(data.message || 'Failed to cancel booking');
      }
      setCancelModalBooking(null);
    },
    onError: (err: any) => {
      console.error(err);
      alert(err.response?.data?.message || 'Network error while cancelling');
      setCancelModalBooking(null);
    }
  });

  const handleCancel = () => {
    if (cancelModalBooking) {
      cancelMutation.mutate(cancelModalBooking.id);
    }
  };

  const downloadInvoice = async (bookingId: string) => {
    try {
      const res = await api.get(`/bookings/${bookingId}/invoice`);
      const data = res.data;
      if (data.success && data.data.invoiceUrl) {
        window.open(data.data.invoiceUrl, '_blank');
      } else {
        alert('Invoice not available yet or generation failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Error fetching invoice');
    }
  };

  const total = bookings.length;
  const confirmed = bookings.filter((b: any) => b.status === 'confirmed').length;
  const pending = bookings.filter((b: any) => b.status === 'pending_payment').length;
  const cancelled = bookings.filter((b: any) => b.status === 'cancelled').length;

  const filtered = bookings.filter((b: any) => {
    const matchSearch =
      (b.booking_reference || '').toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      (b.room_name || '').toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const bookingStats = [
    { label: 'Total', value: total, icon: CalendarDays, color: '#C9A84C' },
    { label: 'Confirmed', value: confirmed, icon: CheckCircle, color: '#34d399' },
    { label: 'Pending', value: pending, icon: Clock, color: '#fbbf24' },
    { label: 'Cancelled', value: cancelled, icon: XCircle, color: '#f87171' },
  ];

  const statusFilters = [
    { label: 'All', value: 'all' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Pending Payment', value: 'pending_payment' },
    { label: 'Checked In', value: 'checked_in' },
    { label: 'Checked Out', value: 'checked_out' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.3rem', margin: 0 }}>
            Bookings Management
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            View and manage all guest reservations
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '1rem',
        }}
      >
        {bookingStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              style={{
                background: '#1A2235',
                borderRadius: '12px',
                padding: '1.25rem',
                border: '1px solid rgba(255,255,255,0.07)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.9rem',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: `${stat.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={18} color={stat.color} />
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.73rem', margin: 0 }}>
                  {stat.label}
                </p>
                <p style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.3rem', margin: 0 }}>
                  {stat.value}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Filters Row */}
      <div
        style={{
          background: '#1A2235',
          borderRadius: '12px',
          padding: '1.1rem 1.25rem',
          border: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search
            size={14}
            color="rgba(255,255,255,0.3)"
            style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reference, ID, or room..."
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '0.85rem',
              padding: '0.5rem 0.75rem 0.5rem 2.1rem',
              outline: 'none',
              width: '100%',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              style={{
                background: statusFilter === f.value ? '#C9A84C' : 'rgba(255,255,255,0.06)',
                color: statusFilter === f.value ? '#0A0F1E' : 'rgba(255,255,255,0.6)',
                border: `1px solid ${statusFilter === f.value ? '#C9A84C' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '6px',
                padding: '0.4rem 0.9rem',
                fontWeight: statusFilter === f.value ? 700 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Full Bookings Table */}
      <div
        style={{
          background: '#1A2235',
          borderRadius: '14px',
          border: '1px solid rgba(255,255,255,0.07)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', position: 'sticky', top: 0, zIndex: 1 }}>
                {['Reference', 'Room', 'Check-in', 'Check-out', 'Total', 'Status', 'Actions'].map(
                  (col) => (
                    <th
                      key={col}
                      style={{
                        color: 'rgba(255,255,255,0.45)',
                        fontSize: '0.73rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.07em',
                        padding: '0.75rem 1rem',
                        textAlign: 'left',
                        whiteSpace: 'nowrap',
                        borderBottom: '1px solid rgba(255,255,255,0.07)',
                      }}
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', padding: '2.5rem' }}>
                    Loading bookings...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', padding: '2.5rem' }}>
                    No bookings found.
                  </td>
                </tr>
              ) : (
                filtered.map((booking: any) => (
                  <tr
                    key={booking.id}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = 'rgba(201,168,76,0.04)')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = 'transparent')}
                  >
                    <td style={{ padding: '0.85rem 1rem', color: '#C9A84C', fontSize: '0.82rem', fontWeight: 600, fontFamily: 'monospace' }}>
                      {booking.booking_reference || booking.id.substring(0,8)}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem' }}>{booking.room_name || 'Room Name'}</td>
                    <td style={{ padding: '0.85rem 1rem', color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem' }}>{new Date(booking.check_in).toLocaleDateString()}</td>
                    <td style={{ padding: '0.85rem 1rem', color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem' }}>{new Date(booking.check_out).toLocaleDateString()}</td>
                    <td style={{ padding: '0.85rem 1rem', color: '#ffffff', fontSize: '0.88rem', fontWeight: 600 }}>
                      INR {parseFloat(booking.grand_total as any).toLocaleString()}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <StatusBadge status={booking.status} />
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link
                          href={`/dashboard/bookings/${booking.id}`}
                          title="View Details"
                          style={{
                            background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)',
                            borderRadius: '6px', width: '30px', height: '30px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                          }}
                        >
                          <Eye size={14} color="#C9A84C" />
                        </Link>
                        {(booking.status === 'confirmed' || booking.status === 'completed') && (
                          <button
                            title="Download Invoice"
                            onClick={() => downloadInvoice(booking.id)}
                            style={{
                              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '6px', width: '30px', height: '30px',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                            }}
                          >
                            <Download size={14} color="#C9A84C" />
                          </button>
                        )}
                        {(booking.status === 'confirmed' || booking.status === 'pending_payment') && (
                          <button
                            title="Cancel Booking"
                            onClick={() => setCancelModalBooking(booking)}
                            style={{
                              background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)',
                              borderRadius: '6px', width: '30px', height: '30px',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                            }}
                          >
                            <X size={14} color="#f87171" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancel Modal */}
      {cancelModalBooking && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#1A2235', padding: '2rem', borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)', maxWidth: '400px', width: '90%'
          }}>
            <h3 style={{ color: '#fff', margin: '0 0 1rem 0' }}>Cancel Booking?</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Are you sure you want to cancel booking <strong>{cancelModalBooking.booking_reference || cancelModalBooking.id.substring(0,8)}</strong>? 
              A refund will be calculated automatically based on the cancellation policy.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setCancelModalBooking(null)}
                disabled={cancelMutation.isPending}
                style={{
                  background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)',
                  padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer'
                }}
              >
                No, Keep it
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelMutation.isPending}
                style={{
                  background: '#f87171', color: '#000', border: 'none',
                  padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600
                }}
              >
                {cancelMutation.isPending ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
