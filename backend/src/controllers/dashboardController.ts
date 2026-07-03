import { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/httpStatuses';
import { supabase } from '../config/supabase';

export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    // 1. Rooms Stats
    const { data: rooms, error: roomsError } = await supabase.from('rooms').select('status');
    if (roomsError) throw roomsError;

    const totalRooms = rooms.length;
    const availableRooms = rooms.filter(r => r.status === 'available').length;
    const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
    const maintenanceRooms = rooms.filter(r => r.status === 'maintenance').length;

    // 2. Bookings Stats
    const { data: bookings, error: bookingsError } = await supabase.from('bookings').select('status, total_amount');
    if (bookingsError) throw bookingsError;

    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;

    // Financials
    const totalRevenue = bookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + Number(b.total_amount), 0);

    const occupancyRate = totalRooms === 0 ? '0%' : `${Math.round((occupiedRooms / totalRooms) * 100)}%`;

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Dashboard statistics fetched from Supabase',
      data: {
        rooms: {
          total: totalRooms,
          available: availableRooms,
          occupied: occupiedRooms,
          maintenance: maintenanceRooms
        },
        bookings: {
          total: totalBookings,
          today: 0, // Simplified for now
          pending: pendingBookings,
          confirmed: confirmedBookings,
          cancelled: cancelledBookings
        },
        financials: {
          totalRevenue,
          monthlyAverage: totalRevenue > 0 ? Math.round(totalRevenue / 12) : 0,
          currency: 'USD'
        },
        occupancyRate
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};
