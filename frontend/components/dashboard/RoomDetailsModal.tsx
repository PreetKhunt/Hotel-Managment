'use client';

import { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BedDouble, Users, Maximize, Layers, CheckCircle, Clock, Wrench, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Room } from '@/types';
import StatusBadge from '@/components/shared/StatusBadge';
import { useHousekeepingTasks, useMaintenanceRequests } from '@/hooks/useOperationalModules';

interface RoomDetailsModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
}

const RoomDetailsModal: FC<RoomDetailsModalProps> = ({ room, isOpen, onClose, onEdit }) => {
  const { data: hkTasks = [], isLoading: hkLoading } = useHousekeepingTasks(
    room ? { room_id: room.id } : undefined
  );
  const { data: mainRequests = [], isLoading: mainLoading } = useMaintenanceRequests(
    room ? { room_id: room.id } : undefined
  );

  if (!isOpen || !room) return null;

  const latestHk = hkTasks.length > 0 ? hkTasks[0] : null;
  const recentMaintenance = mainRequests.slice(0, 3);

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(10, 15, 30, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1.5rem',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          style={{
            background: '#141B2D',
            border: '1px solid rgba(201, 168, 76, 0.3)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '750px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
            position: 'relative',
            padding: '2rem',
            color: '#ffffff',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>

          {/* Header Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div>
              <span style={{ color: '#C9A84C', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                Floor {room.floor} &bull; {room.type}
              </span>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.25rem 0 0', color: '#ffffff' }}>
                {room.name}
              </h2>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <StatusBadge status={room.status} />
              {onEdit && (
                <button
                  onClick={() => {
                    onClose();
                    onEdit();
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #C9A84C, #a8863c)',
                    color: '#0A0F1E',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.5rem 1.1rem',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Edit Room
                </button>
              )}
            </div>
          </div>

          {/* Gallery Preview */}
          <div style={{ marginBottom: '1.75rem', borderRadius: '12px', overflow: 'hidden', height: '240px', background: '#0A0F1E', position: 'relative' }}>
            <img
              src={room.images?.[0] || 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200'}
              alt={room.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(transparent, rgba(10, 15, 30, 0.95))',
                padding: '1rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
              }}
            >
              <span style={{ color: '#ffffff', fontSize: '1.2rem', fontWeight: 700 }}>
                ${room.pricePerNight.toLocaleString()} <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: 400 }}>/ night</span>
              </span>
              <span style={{ background: 'rgba(201, 168, 76, 0.2)', border: '1px solid #C9A84C', padding: '0.25rem 0.75rem', borderRadius: '6px', color: '#C9A84C', fontSize: '0.8rem', fontWeight: 700 }}>
                {room.images?.length || 1} Photo{(room.images?.length || 1) > 1 ? 's' : ''} available
              </span>
            </div>
          </div>

          {/* Key Specifications */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '1rem',
              marginBottom: '1.75rem',
            }}
          >
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Users size={20} color="#C9A84C" />
              <div>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', margin: 0 }}>Max Capacity</p>
                <p style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>{room.maxGuests || 2} Guests</p>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Maximize size={20} color="#34d399" />
              <div>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', margin: 0 }}>Room Size</p>
                <p style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>{room.size || 350} sq ft</p>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <BedDouble size={20} color="#818cf8" />
              <div>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', margin: 0 }}>Bedding</p>
                <p style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>{room.bedType || 'Queen Bed'}</p>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Layers size={20} color="#fbbf24" />
              <div>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', margin: 0 }}>Floor Level</p>
                <p style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Level {room.floor || 1}</p>
              </div>
            </div>
          </div>

          {/* Description & Amenities */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
              Room Overview
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', marginBottom: '1rem' }}>
              {room.longDescription || room.description || 'Enterprise grade luxury guest room equipped with state-of-the-art climate control, automated ambient lighting, high-speed fiber wi-fi, and signature plush bedding.'}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {(room.amenities || ['Free Wi-Fi', 'Room Service', 'Flat Screen TV', 'Minibar', 'Air Conditioning']).map((amenity, idx) => (
                <span
                  key={idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    color: 'rgba(255,255,255,0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <CheckCircle size={13} color="#C9A84C" />
                  {amenity}
                </span>
              ))}
            </div>
          </div>

          {/* Real-time Operational Statuses */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem' }}>
            {/* Housekeeping Realtime Audit */}
            <div style={{ background: 'rgba(10, 15, 30, 0.6)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Clock size={16} color="#34d399" />
                <h5 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>Housekeeping Status</h5>
              </div>
              {hkLoading ? (
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Syncing operational status...</p>
              ) : latestHk ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>Current Task:</span>
                    <StatusBadge status={latestHk.status} />
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                    Assigned: {latestHk.assigned_name || 'Team Pool'}
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontSize: '0.82rem' }}>
                  <ShieldCheck size={16} />
                  <span>Room inspected & clean. No pending turnover tasks.</span>
                </div>
              )}
            </div>

            {/* Maintenance Realtime Audit */}
            <div style={{ background: 'rgba(10, 15, 30, 0.6)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Wrench size={16} color="#fbbf24" />
                <h5 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>Maintenance History</h5>
              </div>
              {mainLoading ? (
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Loading work orders...</p>
              ) : recentMaintenance.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {recentMaintenance.map((req) => (
                    <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.35rem' }}>
                      <span style={{ color: '#ffffff', fontWeight: 600 }}>{req.issue_type}</span>
                      <StatusBadge status={req.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem' }}>
                  <AlertTriangle size={15} color="rgba(255,255,255,0.3)" />
                  <span>No maintenance records found for this room.</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RoomDetailsModal;
