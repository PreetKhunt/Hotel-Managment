'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MessageSquare, Sparkles } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultTreatment?: string;
}

const TREATMENTS = [
  'Deep Tissue Massage',
  'Luxury Facial',
  'Seaweed Body Wrap',
  'Aromatherapy Journey',
  'Hot Stone Therapy',
  'Couples Retreat'
];

export default function SpaBookingModal({ isOpen, onClose, defaultTreatment = '' }: Props) {
  const [treatment, setTreatment] = useState(defaultTreatment || TREATMENTS[0]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/spa/book', {
        treatment,
        date,
        time,
        special_requests: specialRequests,
      });
      toast.success('Spa treatment booked successfully!');
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to book treatment. Please log in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(10, 15, 30, 0.8)',
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '500px',
              background: '#1A2235',
              borderRadius: '16px',
              border: '1px solid rgba(201,168,76,0.2)',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Header */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 600 }}>Book Spa Treatment</h3>
              <button
                onClick={onClose}
                style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    <Sparkles size={16} color="#C9A84C" />
                    Select Treatment
                  </label>
                  <select
                    required
                    value={treatment}
                    onChange={(e) => setTreatment(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', outline: 'none' }}
                  >
                    {TREATMENTS.map((t) => (
                      <option key={t} value={t} style={{ background: '#1A2235' }}>{t}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      <Calendar size={16} color="#C9A84C" />
                      Date
                    </label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      <Clock size={16} color="#C9A84C" />
                      Time
                    </label>
                    <input
                      type="time"
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    <MessageSquare size={16} color="#C9A84C" />
                    Special Requests
                  </label>
                  <textarea
                    rows={3}
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Any specific focus areas or preferences..."
                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', outline: 'none', resize: 'vertical' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#C9A84C',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#0A0F1E',
                    fontWeight: 600,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? 'Confirming...' : 'Book Treatment'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
