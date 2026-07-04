'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRooms } from '@/hooks/useRooms';
import StatusBadge from '@/components/shared/StatusBadge';
import { Plus, Edit2, Eye, BedDouble, CheckCircle, XCircle, Wrench, Loader2 } from 'lucide-react';
import { Room } from '@/types';

type FilterStatus = 'all' | 'available' | 'occupied' | 'maintenance';

const statusFilters: { label: string; value: FilterStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Available', value: 'available' },
  { label: 'Occupied', value: 'occupied' },
  { label: 'Maintenance', value: 'maintenance' },
];

export default function RoomsPage() {
  const [filter, setFilter] = useState<FilterStatus>('all');
  
  const { data: rooms = [], isLoading, isError } = useRooms();

  const { totalRooms, available, occupied, maintenance, filtered } = useMemo(() => {
    const totalRooms = rooms.length;
    const available = rooms.filter((r: Room) => r.status === 'available').length;
    const occupied = rooms.filter((r: Room) => r.status === 'occupied').length;
    const maintenance = rooms.filter((r: Room) => r.status === 'maintenance').length;
    
    const filtered = filter === 'all' ? rooms : rooms.filter((r: Room) => r.status === filter);
    
    return { totalRooms, available, occupied, maintenance, filtered };
  }, [rooms, filter]);

  const roomStats = [
    { label: 'Total Rooms', value: totalRooms, icon: BedDouble, color: '#C9A84C' },
    { label: 'Available', value: available, icon: CheckCircle, color: '#34d399' },
    { label: 'Occupied', value: occupied, icon: XCircle, color: '#f87171' },
    { label: 'Maintenance', value: maintenance, icon: Wrench, color: '#fbbf24' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.3rem', margin: 0 }}>
            Room Management
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Manage and monitor all hotel rooms
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          style={{
            background: 'linear-gradient(135deg, #C9A84C, #a8863c)',
            color: '#0A0F1E',
            border: 'none',
            borderRadius: '8px',
            padding: '0.65rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <Plus size={16} />
          Add New Room
        </motion.button>
      </div>

      {/* Stats Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '1rem',
        }}
      >
        {roomStats.map((stat, i) => {
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
                gap: '1rem',
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
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem', margin: 0 }}>
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

      {/* Filter Buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            style={{
              background: filter === f.value ? '#C9A84C' : 'rgba(255,255,255,0.06)',
              color: filter === f.value ? '#0A0F1E' : 'rgba(255,255,255,0.65)',
              border: `1px solid ${filter === f.value ? '#C9A84C' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '8px',
              padding: '0.45rem 1.1rem',
              fontWeight: filter === f.value ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Rooms Grid */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: 'rgba(255,255,255,0.5)' }}>
          <Loader2 className="animate-spin" size={32} />
        </div>
      ) : isError ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: '#f87171' }}>
          Failed to load rooms.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {filtered.map((room: Room, i: number) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              style={{
                background: '#1A2235',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.07)',
                overflow: 'hidden',
                transition: 'border-color 0.3s',
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(201,168,76,0.4)')
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)')
              }
            >
              {/* Room Type Color Bar */}
              <div
                style={{
                  height: '4px',
                  background:
                    room.status === 'available'
                      ? '#34d399'
                      : room.status === 'occupied'
                      ? '#f87171'
                      : '#fbbf24',
                }}
              />

              <div style={{ padding: '1.25rem' }}>
                {/* Room Name + Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <h4 style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.97rem', margin: 0 }}>
                      {room.name}
                    </h4>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', marginTop: '0.2rem' }}>
                      Floor {room.floor} &bull; {room.type}
                    </p>
                  </div>
                  <StatusBadge status={room.status} />
                </div>

                {/* Price */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.1rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem' }}>Per night</span>
                  <span style={{ color: '#C9A84C', fontWeight: 700, fontSize: '1rem' }}>
                    ${room.pricePerNight.toLocaleString()}
                  </span>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <button
                    style={{
                      flex: 1,
                      background: 'rgba(201,168,76,0.1)',
                      border: '1px solid rgba(201,168,76,0.25)',
                      borderRadius: '6px',
                      color: '#C9A84C',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      padding: '0.45rem 0',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <Eye size={13} />
                    View
                  </button>
                  <button
                    style={{
                      flex: 1,
                      background: 'rgba(99,102,241,0.1)',
                      border: '1px solid rgba(99,102,241,0.25)',
                      borderRadius: '6px',
                      color: '#818cf8',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      padding: '0.45rem 0',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <Edit2 size={13} />
                    Edit
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
