'use client';

import { useState, useEffect } from 'react';
import StatusBadge from '@/components/shared/StatusBadge';
import { Eye, Edit2, Search } from 'lucide-react';

interface Booking {
  id: string;
  guestName: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export default function RecentBookingsTable() {
  const [search, setSearch] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    fetch('/api/v1/bookings')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setBookings(json.data);
        }
      })
      .catch((err) => console.error('Failed to fetch bookings:', err));
  }, []);

  const filtered = bookings
    .filter(
      (b) =>
        b.guestName.toLowerCase().includes(search.toLowerCase()) ||
        b.id.toLowerCase().includes(search.toLowerCase()) ||
        b.roomName.toLowerCase().includes(search.toLowerCase())
    )
    .slice(0, 8);

  return (
    <div
      style={{
        background: '#1A2235',
        borderRadius: '14px',
        border: '1px solid rgba(255,255,255,0.07)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <h3 style={{ color: '#ffffff', fontWeight: 700, fontSize: '1rem', margin: 0 }}>
          Recent Bookings
        </h3>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search
            size={15}
            color="rgba(255,255,255,0.35)"
            style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bookings..."
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '0.85rem',
              padding: '0.5rem 0.75rem 0.5rem 2.2rem',
              outline: 'none',
              width: '220px',
            }}
          />
        </div>
      </div>

      {/* Scrollable Table Wrapper */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>
          <thead>
            <tr
              style={{
                background: 'rgba(255,255,255,0.03)',
                position: 'sticky',
                top: 0,
                zIndex: 1,
              }}
            >
              {['Booking ID', 'Guest Name', 'Room', 'Check-in', 'Check-out', 'Total', 'Status', 'Actions'].map(
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
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    textAlign: 'center',
                    color: 'rgba(255,255,255,0.35)',
                    padding: '2.5rem',
                    fontSize: '0.9rem',
                  }}
                >
                  No bookings found.
                </td>
              </tr>
            ) : (
              filtered.map((booking, i) => (
                <tr
                  key={booking.id}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    transition: 'background 0.2s',
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLTableRowElement).style.background =
                      'rgba(201,168,76,0.04)')
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLTableRowElement).style.background = 'transparent')
                  }
                >
                  <td
                    style={{
                      padding: '0.85rem 1rem',
                      color: '#C9A84C',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      fontFamily: 'monospace',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {booking.id}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#ffffff', fontSize: '0.88rem', whiteSpace: 'nowrap' }}>
                    {booking.guestName}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                    {booking.roomName}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                    {booking.checkIn}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                    {booking.checkOut}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#ffffff', fontSize: '0.88rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    ${booking.totalAmount.toLocaleString()}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <StatusBadge status={booking.status} />
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        title="View"
                        style={{
                          background: 'rgba(255,255,255,0.07)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '6px',
                          width: '30px',
                          height: '30px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) =>
                          ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(201,168,76,0.2)')
                        }
                        onMouseLeave={(e) =>
                          ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)')
                        }
                      >
                        <Eye size={14} color="#C9A84C" />
                      </button>
                      <button
                        title="Edit"
                        style={{
                          background: 'rgba(255,255,255,0.07)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '6px',
                          width: '30px',
                          height: '30px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) =>
                          ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.2)')
                        }
                        onMouseLeave={(e) =>
                          ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)')
                        }
                      >
                        <Edit2 size={14} color="#818cf8" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
