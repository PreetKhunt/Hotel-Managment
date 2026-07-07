import { Request, Response, NextFunction } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';

export class DashboardController {
  constructor(private supabase: SupabaseClient) {}

  getDashboardStats = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Rooms Stats
      const { data: rooms, error: roomsError } = await this.supabase
        .from('rooms')
        .select('status, id');
      if (roomsError) throw roomsError;
      
      const roomsStats = {
        total: rooms.length,
        available: rooms.filter(r => r.status === 'available').length,
        occupied: rooms.filter(r => r.status === 'occupied').length,
        maintenance: rooms.filter(r => r.status === 'maintenance').length,
      };

      // 2. Bookings Stats
      const { data: bookings, error: bookingsError } = await this.supabase
        .from('bookings')
        .select('id, status, grand_total, check_in, check_out, created_at');
      if (bookingsError) throw bookingsError;

      const bookingsStats = {
        total: bookings.length,
        pending: bookings.filter(b => b.status === 'pending_payment' || b.status === 'draft').length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length,
      };

      // 3. Operations Stats
      const todayStr = new Date().toISOString().split('T')[0];
      const operationsStats = {
        checkInsToday: bookings.filter(b => b.check_in && b.check_in.startsWith(todayStr)).length,
        checkOutsToday: bookings.filter(b => b.check_out && b.check_out.startsWith(todayStr)).length,
      };

      // 4. Revenue Stats
      // Only include confirmed and completed
      const revenueBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed');
      
      const totalRevenue = revenueBookings.reduce((sum, b) => sum + (Number(b.grand_total) || 0), 0);
      
      const thisMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const revenueThisMonth = revenueBookings
        .filter(b => b.created_at.startsWith(thisMonth))
        .reduce((sum, b) => sum + (Number(b.grand_total) || 0), 0);

      const revenueToday = revenueBookings
        .filter(b => b.created_at.startsWith(todayStr))
        .reduce((sum, b) => sum + (Number(b.grand_total) || 0), 0);
        
      const revenueStats = {
        totalRevenue,
        revenueThisMonth,
        revenueToday
      };

      // 5. Users Stats
      const { data: users, error: usersError } = await this.supabase
        .from('users')
        .select('status');
      if (usersError) throw usersError;

      const usersStats = {
        total: users.length,
        active: users.filter(u => u.status === 'active').length,
      };

      // 6. Reviews Stats
      const { data: reviews, error: reviewsError } = await this.supabase
        .from('reviews')
        .select('rating');
      if (reviewsError) throw reviewsError;
      
      const reviewsStats = {
        total: reviews.length,
        averageRating: reviews.length > 0 
          ? reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length 
          : 0,
      };

      res.status(200).json({
        success: true,
        data: {
          rooms: roomsStats,
          bookings: bookingsStats,
          operations: operationsStats,
          revenue: revenueStats,
          users: usersStats,
          reviews: reviewsStats
        }
      });

    } catch (error) {
      next(error);
    }
  };
}
