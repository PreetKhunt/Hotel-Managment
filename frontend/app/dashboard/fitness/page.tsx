'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Dumbbell, Clock, Calendar, Search } from 'lucide-react';

interface FitnessBooking {
  id: string;
  user_id: string;
  booking_type: string;
  trainer_name?: string;
  booking_date: string;
  booking_time: string;
  duration: number;
  status: string;
  special_requests?: string;
  users?: {
    name: string;
    email: string;
  };
}

export default function FitnessDashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<FitnessBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = user?.role?.name === 'Admin';

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const endpoint = isAdmin ? '/fitness/all' : '/fitness/my-bookings';
      const response = await api.get(endpoint);
      setBookings(response.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch fitness bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [isAdmin]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/fitness/${id}/status`, { status: newStatus });
      toast.success(`Booking ${newStatus}`);
      fetchBookings();
    } catch (err: any) {
      toast.error('Failed to update status');
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      if (isAdmin) {
        await api.delete(`/fitness/${id}`);
      } else {
        await api.patch(`/fitness/${id}/status`, { status: 'cancelled' });
      }
      toast.success(isAdmin ? 'Booking deleted' : 'Booking cancelled');
      fetchBookings();
    } catch (err: any) {
      toast.error('Failed to cancel booking');
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      b.booking_type.toLowerCase().includes(searchLower) ||
      (b.trainer_name && b.trainer_name.toLowerCase().includes(searchLower)) ||
      (b.users?.name && b.users.name.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Fitness Centre Bookings</h1>
          <p className="text-gray-400 mt-1">
            {isAdmin ? 'Manage all fitness centre and PT sessions' : 'View and manage your fitness schedule'}
          </p>
        </div>

        {isAdmin && (
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1A2235] border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-[#C9A84C]"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-[#1A2235] rounded-xl h-24 border border-gray-800" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-[#1A2235] border border-[rgba(255,255,255,0.05)] rounded-2xl p-12 text-center">
          <Dumbbell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">No bookings found</h3>
          <p className="text-gray-400">
            {searchTerm ? 'No results match your search criteria.' : "You haven't scheduled any fitness sessions yet."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-[#1A2235] border border-[rgba(255,255,255,0.05)] rounded-xl p-6 hover:border-[rgba(201,168,76,0.3)] transition-colors"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[rgba(201,168,76,0.1)] flex items-center justify-center flex-shrink-0">
                    <Dumbbell className="w-6 h-6 text-[#C9A84C]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      {booking.booking_type}
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${
                        booking.status === 'confirmed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        booking.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      }`}>
                        {booking.status.toUpperCase()}
                      </span>
                    </h3>
                    
                    {isAdmin && booking.users && (
                      <p className="text-sm text-gray-400 mt-1">Guest: {booking.users.name}</p>
                    )}
                    
                    {booking.trainer_name && (
                      <p className="text-sm text-[#C9A84C] mt-1">Trainer: {booking.trainer_name}</p>
                    )}

                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" /> {booking.booking_date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" /> {booking.booking_time} ({booking.duration} min)
                      </span>
                    </div>

                    {booking.special_requests && (
                      <p className="text-sm text-gray-500 mt-3 italic">
                        " {booking.special_requests} "
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
                  {isAdmin && booking.status !== 'completed' && booking.status !== 'cancelled' && (
                    <button
                      onClick={() => handleStatusChange(booking.id, 'completed')}
                      className="px-4 py-2 bg-[rgba(255,255,255,0.05)] hover:bg-green-500/20 hover:text-green-400 text-gray-300 rounded-lg text-sm font-medium transition-colors flex-1"
                    >
                      Mark Complete
                    </button>
                  )}
                  {booking.status !== 'cancelled' && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      className="px-4 py-2 bg-[rgba(248,113,113,0.1)] hover:bg-[rgba(248,113,113,0.2)] text-red-400 rounded-lg text-sm font-medium transition-colors flex-1"
                    >
                      {isAdmin ? 'Delete' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
