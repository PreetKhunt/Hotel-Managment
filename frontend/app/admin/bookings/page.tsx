'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Loader2, Eye, CheckCircle, LogOut, RefreshCw } from 'lucide-react';

export default function BookingsManagement() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/super-admin/bookings');
      setBookings(data.data || []);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setUpdatingId(id);
      const res = await api.patch(`/super-admin/bookings/${id}/status`, { status: newStatus });
      if (res.data.success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
        );
      }
    } catch (error) {
      console.error('Status update failed:', error);
      alert('Failed to update booking status. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin w-8 h-8 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-sm text-gray-500">Manage guest check-ins, departures, and automated housekeeping turnovers.</p>
        </div>
        <button
          onClick={fetchBookings}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quick Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 text-sm">
                  No bookings found in the database.
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {booking.users?.first_name || 'Guest'} {booking.users?.last_name || ''}
                    <span className="block text-xs text-gray-400 font-normal">{booking.users?.email || booking.id.substring(0, 8)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                    {booking.rooms?.name || 'Unassigned'}
                    {booking.rooms?.room_type && (
                      <span className="block text-xs text-gray-400 capitalize">{booking.rooms.room_type}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{new Date(booking.check_in).toLocaleDateString()} &rarr; {new Date(booking.check_out).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">₹{booking.grand_total}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full capitalize ${
                      booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      booking.status === 'checked_in' ? 'bg-green-100 text-green-800' :
                      booking.status === 'checked_out' ? 'bg-purple-100 text-purple-800' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {updatingId === booking.id ? (
                      <span className="inline-flex items-center text-xs text-gray-400">
                        <Loader2 className="animate-spin w-4 h-4 mr-1" /> Updating...
                      </span>
                    ) : (
                      <>
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => handleStatusChange(booking.id, 'checked_in')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 transition shadow-sm"
                            title="Check In Guest (Set room to Occupied)"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Check In
                          </button>
                        )}
                        {booking.status === 'checked_in' && (
                          <button
                            onClick={() => handleStatusChange(booking.id, 'checked_out')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-md hover:bg-purple-700 transition shadow-sm"
                            title="Check Out & Trigger Turnover Cleaning"
                          >
                            <LogOut className="w-3.5 h-3.5" /> Check Out & Clean
                          </button>
                        )}
                      </>
                    )}
                    <button
                      onClick={() => window.open(`/dashboard/bookings/${booking.id}`, '_blank')}
                      className="inline-flex items-center p-1.5 text-gray-500 hover:text-indigo-600 transition rounded-md hover:bg-gray-100"
                      title="View Booking Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
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
