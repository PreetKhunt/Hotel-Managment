'use client';

import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2, AlertCircle } from 'lucide-react';
import { Room, RoomType, RoomStatus } from '@/types';
import { useCreateRoom, useUpdateRoom } from '@/hooks/useRooms';
import { z } from 'zod';
import toast from 'react-hot-toast';

interface RoomFormModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const roomSchema = z.object({
  name: z.string().min(2, 'Room name must be at least 2 characters'),
  type: z.enum(['standard', 'deluxe', 'suite', 'presidential'] as const),
  status: z.enum(['available', 'occupied', 'maintenance', 'reserved', 'clean', 'dirty', 'under cleaning'] as const),
  pricePerNight: z.number().positive('Price must be greater than zero'),
  maxGuests: z.number().int().min(1, 'Capacity must be at least 1 guest'),
  size: z.number().positive('Room size (sq ft) must be greater than zero'),
  floor: z.number().int().min(1, 'Floor number must be at least 1'),
  bedType: z.string().min(2, 'Bed type is required (e.g. King Bed, Twin Beds)'),
  description: z.string().min(5, 'Brief description is required'),
});

const RoomFormModal: FC<RoomFormModalProps> = ({ room, isOpen, onClose, onSuccess }) => {
  const isEditing = !!room;
  const createMutation = useCreateRoom();
  const updateMutation = useUpdateRoom();

  const [formData, setFormData] = useState({
    name: '',
    type: 'deluxe' as RoomType,
    status: 'available' as RoomStatus,
    pricePerNight: 250,
    maxGuests: 2,
    size: 400,
    floor: 1,
    bedType: 'King Bed',
    description: 'Luxurious guest accommodation featuring panoramic views and signature amenities.',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (room && isOpen) {
      setFormData({
        name: room.name || '',
        type: room.type || 'deluxe',
        status: room.status || 'available',
        pricePerNight: room.pricePerNight || 250,
        maxGuests: room.maxGuests || 2,
        size: room.size || 400,
        floor: room.floor || 1,
        bedType: room.bedType || 'King Bed',
        description: room.description || '',
      });
      setErrors({});
    } else if (!room && isOpen) {
      setFormData({
        name: '',
        type: 'deluxe',
        status: 'available',
        pricePerNight: 250,
        maxGuests: 2,
        size: 400,
        floor: 1,
        bedType: 'King Bed',
        description: 'Luxurious guest accommodation featuring panoramic views and signature amenities.',
      });
      setErrors({});
    }
  }, [room, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = roomSchema.safeParse({
      ...formData,
      pricePerNight: Number(formData.pricePerNight),
      maxGuests: Number(formData.maxGuests),
      size: Number(formData.size),
      floor: Number(formData.floor),
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) fieldErrors[issue.path[0].toString()] = issue.message;
      });
      setErrors(fieldErrors);
      
      const firstError = Object.values(fieldErrors)[0];
      toast.error(firstError || 'Please fix validation errors in the form.');
      return;
    }

    try {
      if (isEditing && room) {
        await updateMutation.mutateAsync({
          id: room.id,
          data: result.data,
        });
        toast.success(`Room "${result.data.name}" updated successfully`);
      } else {
        await createMutation.mutateAsync(result.data);
        toast.success(`New Room "${result.data.name}" created successfully`);
      }
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save room details. Rolling back changes.');
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

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
          zIndex: 1050,
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
            maxWidth: '620px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
            position: 'relative',
            padding: '2rem',
            color: '#ffffff',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
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

          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.25rem', color: '#ffffff' }}>
            {isEditing ? `Edit Room Details` : `Add New Room to Inventory`}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', marginBottom: '1.5rem' }}>
            {isEditing ? `Modify pricing, capacity, status or description for ${room?.name}.` : `Configure specs and assign operational parameters for the new room.`}
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Name and Type */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: '0.35rem' }}>
                  Room Name / Identifier *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g. Deluxe Ocean Suite 305"
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${errors.name ? '#f87171' : 'rgba(255,255,255,0.15)'}`,
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
                {errors.name && <span style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.2rem', display: 'block' }}>{errors.name}</span>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: '0.35rem' }}>
                  Room Category / Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value as RoomType)}
                  style={{
                    width: '100%',
                    background: '#1A2235',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                >
                  <option value="standard">Standard Guest Room</option>
                  <option value="deluxe">Deluxe King / Queen</option>
                  <option value="suite">Executive Suite</option>
                  <option value="presidential">Presidential Penthouse</option>
                </select>
              </div>
            </div>

            {/* Price and Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: '0.35rem' }}>
                  Price per Night ($ USD) *
                </label>
                <input
                  type="number"
                  value={formData.pricePerNight}
                  onChange={(e) => handleChange('pricePerNight', parseFloat(e.target.value) || 0)}
                  min={1}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${errors.pricePerNight ? '#f87171' : 'rgba(255,255,255,0.15)'}`,
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
                {errors.pricePerNight && <span style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.2rem', display: 'block' }}>{errors.pricePerNight}</span>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: '0.35rem' }}>
                  Operational Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value as RoomStatus)}
                  style={{
                    width: '100%',
                    background: '#1A2235',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                >
                  <option value="available">Available / Vacating</option>
                  <option value="occupied">Occupied (Guest Checked-In)</option>
                  <option value="maintenance">Under Maintenance</option>
                  <option value="reserved">Reserved / Pending Check-In</option>
                  <option value="clean">Clean (Unverified)</option>
                  <option value="dirty">Requires Cleaning (Dirty)</option>
                  <option value="under cleaning">Currently Cleaning</option>
                </select>
              </div>
            </div>

            {/* Specs: Capacity, Size, Floor, Bed */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: '0.35rem' }}>
                  Max Guests *
                </label>
                <input
                  type="number"
                  value={formData.maxGuests}
                  onChange={(e) => handleChange('maxGuests', parseInt(e.target.value) || 1)}
                  min={1}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    padding: '0.6rem',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: '0.35rem' }}>
                  Size (sq ft) *
                </label>
                <input
                  type="number"
                  value={formData.size}
                  onChange={(e) => handleChange('size', parseInt(e.target.value) || 200)}
                  min={100}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    padding: '0.6rem',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: '0.35rem' }}>
                  Floor Level *
                </label>
                <input
                  type="number"
                  value={formData.floor}
                  onChange={(e) => handleChange('floor', parseInt(e.target.value) || 1)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    padding: '0.6rem',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: '0.35rem' }}>
                Bedding Configuration *
              </label>
              <input
                type="text"
                value={formData.bedType}
                onChange={(e) => handleChange('bedType', e.target.value)}
                placeholder="e.g. King Bed + Queen Sleeper Sofa"
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${errors.bedType ? '#f87171' : 'rgba(255,255,255,0.15)'}`,
                  borderRadius: '8px',
                  padding: '0.65rem 0.85rem',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: '0.35rem' }}>
                Room Description / Notes *
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe room features, view, and interior amenities..."
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${errors.description ? '#f87171' : 'rgba(255,255,255,0.15)'}`,
                  borderRadius: '8px',
                  padding: '0.65rem 0.85rem',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
              {errors.description && <span style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.2rem', display: 'block' }}>{errors.description}</span>}
            </div>

            {/* Submit Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  padding: '0.65rem 1.25rem',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  background: 'linear-gradient(135deg, #C9A84C, #a8863c)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#0A0F1E',
                  padding: '0.65rem 1.5rem',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    {isEditing ? 'Save Changes' : 'Create Room'}
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RoomFormModal;
