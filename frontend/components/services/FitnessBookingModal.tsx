'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, User, ChevronDown } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface FitnessBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultService?: string;
}

const servicesList = [
  'Personal Training',
  'General Gym Access',
  'Yoga Class',
  'Pilates Session',
  'Functional Training',
];

const trainersList = [
  'No Preference',
  'Alex Rivera (Strength)',
  'Sarah Jenkins (Yoga/Pilates)',
  'Marcus Webb (Functional)',
];

export default function FitnessBookingModal({ isOpen, onClose, defaultService = '' }: FitnessBookingModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    booking_type: defaultService || servicesList[0],
    trainer_name: trainersList[0],
    booking_date: '',
    booking_time: '',
    duration: 60,
    special_requests: '',
  });

  useEffect(() => {
    if (defaultService) {
      setFormData((prev) => ({ ...prev, booking_type: defaultService }));
    }
  }, [defaultService]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        trainer_name: formData.trainer_name === 'No Preference' ? undefined : formData.trainer_name,
      };

      await api.post('/fitness/book', payload);
      toast.success('Fitness session scheduled successfully!');
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to schedule session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-[#0A0F1E] border border-[rgba(201,168,76,0.2)] rounded-2xl overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-[rgba(255,255,255,0.05)] bg-[#1A2235]">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Elite Fitness Centre</h3>
                  <p className="text-sm text-gray-400">Schedule your premium session</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Service</label>
                <div className="relative">
                  <select
                    required
                    value={formData.booking_type}
                    onChange={(e) => setFormData({ ...formData, booking_type: e.target.value })}
                    className="w-full bg-[#1A2235] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#C9A84C] transition-colors appearance-none"
                  >
                    {servicesList.map((svc) => (
                      <option key={svc} value={svc}>{svc}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Trainer</label>
                <div className="relative">
                  <select
                    value={formData.trainer_name}
                    onChange={(e) => setFormData({ ...formData, trainer_name: e.target.value })}
                    className="w-full bg-[#1A2235] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 pl-11 text-white focus:outline-none focus:border-[#C9A84C] transition-colors appearance-none"
                  >
                    {trainersList.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.booking_date}
                      onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
                      className="w-full bg-[#1A2235] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 pl-11 text-white focus:outline-none focus:border-[#C9A84C] transition-colors [color-scheme:dark]"
                    />
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Time</label>
                  <div className="relative">
                    <input
                      type="time"
                      required
                      value={formData.booking_time}
                      onChange={(e) => setFormData({ ...formData, booking_time: e.target.value })}
                      className="w-full bg-[#1A2235] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 pl-11 text-white focus:outline-none focus:border-[#C9A84C] transition-colors [color-scheme:dark]"
                    />
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Duration (minutes)</label>
                <div className="relative">
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="w-full bg-[#1A2235] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#C9A84C] transition-colors appearance-none"
                  >
                    <option value={30}>30 mins</option>
                    <option value={60}>60 mins</option>
                    <option value={90}>90 mins</option>
                    <option value={120}>120 mins</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Goals or Special Requests</label>
                <textarea
                  rows={3}
                  value={formData.special_requests}
                  onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
                  placeholder="Any specific fitness goals or requirements?"
                  className="w-full bg-[#1A2235] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#C9A84C] transition-colors resize-none placeholder-gray-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-lg font-semibold text-white mt-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #C9A84C 0%, #A07A2E 100%)',
                }}
              >
                {loading ? 'Scheduling...' : 'Confirm Session'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
