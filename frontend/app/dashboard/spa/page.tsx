'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { CalendarDays, Clock, Sparkles, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SpaDashboard() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  const endpoint = user?.role?.name === 'Admin' ? '/spa/all' : '/spa/my-bookings';

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['spa', endpoint],
    queryFn: async () => {
      const res = await api.get(endpoint);
      return res.data.data || [];
    },
    enabled: !!user
  });

  const filtered = bookings.filter((r: any) => {
    if (!search) return true;
    const s = search.toLowerCase();
    const matchName = user?.role?.name === 'Admin' && r.users?.name?.toLowerCase().includes(s);
    const matchEmail = user?.role?.name === 'Admin' && r.users?.email?.toLowerCase().includes(s);
    return matchName || matchEmail || r.date.includes(s) || r.treatment.toLowerCase().includes(s);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.3rem', margin: 0 }}>
            Spa Bookings
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            {user?.role?.name === 'Admin' ? 'Manage all spa and wellness bookings.' : 'View your spa and wellness bookings.'}
          </p>
        </div>
      </div>

      <div
        style={{
          background: '#1A2235',
          borderRadius: '12px',
          padding: '1.1rem 1.25rem',
          border: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={14} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={user?.role?.name === 'Admin' ? "Search by guest name, email, date or treatment..." : "Search by date or treatment..."}
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', color: '#ffffff', fontSize: '0.85rem', padding: '0.5rem 0.75rem 0.5rem 2.1rem',
              outline: 'none', width: '100%',
            }}
          />
        </div>
      </div>

      <div style={{ background: '#1A2235', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', position: 'sticky', top: 0, zIndex: 1 }}>
                {user?.role?.name === 'Admin' && <th style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.73rem', fontWeight: 600, textTransform: 'uppercase', padding: '0.75rem 1rem', textAlign: 'left' }}>Guest</th>}
                <th style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.73rem', fontWeight: 600, textTransform: 'uppercase', padding: '0.75rem 1rem', textAlign: 'left' }}>Treatment</th>
                <th style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.73rem', fontWeight: 600, textTransform: 'uppercase', padding: '0.75rem 1rem', textAlign: 'left' }}>Date</th>
                <th style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.73rem', fontWeight: 600, textTransform: 'uppercase', padding: '0.75rem 1rem', textAlign: 'left' }}>Time</th>
                <th style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.73rem', fontWeight: 600, textTransform: 'uppercase', padding: '0.75rem 1rem', textAlign: 'left' }}>Requests</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', padding: '2.5rem' }}>Loading...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', padding: '2.5rem' }}>No bookings found.</td>
                </tr>
              ) : (
                filtered.map((r: any) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {user?.role?.name === 'Admin' && (
                      <td style={{ padding: '0.85rem 1rem', color: '#fff', fontSize: '0.85rem' }}>
                        <div>{r.users?.name || 'Unknown User'}</div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>{r.users?.email}</div>
                      </td>
                    )}
                    <td style={{ padding: '0.85rem 1rem', color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#fff' }}>
                        <Sparkles size={14} color="#C9A84C" />
                        {r.treatment}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CalendarDays size={14} color="#C9A84C" />
                        {new Date(r.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={14} color="#C9A84C" />
                        {r.time}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', maxWidth: '200px' }}>
                      <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {r.special_requests || '-'}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
