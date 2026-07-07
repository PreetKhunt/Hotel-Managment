import { Request, Response, NextFunction } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';

export class DashboardController {
  constructor(private supabase: SupabaseClient) {}

  getDashboardStats = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      let roomsStats = { total: 0, available: 0, occupied: 0, maintenance: 0 };
      let bookingsStats = { total: 0, pending: 0, confirmed: 0, cancelled: 0 };
      let operationsStats = { checkInsToday: 0, checkOutsToday: 0 };
      let revenueStats = { totalRevenue: 0, revenueThisMonth: 0, revenueToday: 0 };
      let usersStats = { total: 0, active: 0 };
      let reviewsStats = { total: 0, averageRating: 0 };

      try {
        // 1. Rooms Stats
        const { data: rooms } = await this.supabase.from('rooms').select('status, id');
        if (rooms) {
          roomsStats = {
            total: rooms.length,
            available: rooms.filter(r => r.status === 'available').length,
            occupied: rooms.filter(r => r.status === 'occupied').length,
            maintenance: rooms.filter(r => r.status === 'maintenance').length,
          };
        }

        // 2. Bookings Stats
        const { data: bookings } = await this.supabase.from('bookings').select('id, status, grand_total, check_in, check_out, created_at');
        if (bookings) {
          bookingsStats = {
            total: bookings.length,
            pending: bookings.filter(b => b.status === 'pending_payment' || b.status === 'draft').length,
            confirmed: bookings.filter(b => b.status === 'confirmed').length,
            cancelled: bookings.filter(b => b.status === 'cancelled').length,
          };

          // 3. Operations Stats
          const todayStr = new Date().toISOString().split('T')[0];
          operationsStats = {
            checkInsToday: bookings.filter(b => b.check_in && b.check_in.startsWith(todayStr)).length,
            checkOutsToday: bookings.filter(b => b.check_out && b.check_out.startsWith(todayStr)).length,
          };

          // 4. Revenue Stats
          const revenueBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed');
          const totalRevenue = revenueBookings.reduce((sum, b) => sum + (Number(b.grand_total) || 0), 0);
          const thisMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
          const revenueThisMonth = revenueBookings
            .filter(b => b.created_at && b.created_at.startsWith(thisMonth))
            .reduce((sum, b) => sum + (Number(b.grand_total) || 0), 0);
          const revenueToday = revenueBookings
            .filter(b => b.created_at && b.created_at.startsWith(todayStr))
            .reduce((sum, b) => sum + (Number(b.grand_total) || 0), 0);
            
          revenueStats = { totalRevenue, revenueThisMonth, revenueToday };
        }

        // 5. Users Stats
        const { data: users } = await this.supabase.from('users').select('status');
        if (users) {
          usersStats = {
            total: users.length,
            active: users.filter(u => u.status === 'active').length,
          };
        }

        // 6. Reviews Stats
        const { data: reviews } = await this.supabase.from('reviews').select('rating');
        if (reviews) {
          reviewsStats = {
            total: reviews.length,
            averageRating: reviews.length > 0 
              ? reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length 
              : 0,
          };
        }
      } catch (dbError) {
        console.error('[DashboardController] DB Query Failed, returning defaults:', dbError);
      }

      res.status(200).json({
        success: true,
        data: {
          rooms: roomsStats,
          bookings: bookingsStats,
          operations: operationsStats,
          revenue: revenueStats,
          users: usersStats,
          reviews: reviewsStats,
          // Legacy fallback flat fields requested by user
          totalUsers: usersStats.total,
          totalRooms: roomsStats.total,
          totalBookings: bookingsStats.total,
          totalRevenue: revenueStats.totalRevenue,
          pendingBookings: bookingsStats.pending,
        }
      });

    } catch (error) {
      console.error('[DashboardController] Fatal error:', error);
      res.status(500).json({
        success: false,
        data: {
          rooms: { total: 0, available: 0, occupied: 0, maintenance: 0 },
          bookings: { total: 0, pending: 0, confirmed: 0, cancelled: 0 },
          operations: { checkInsToday: 0, checkOutsToday: 0 },
          revenue: { totalRevenue: 0, revenueThisMonth: 0, revenueToday: 0 },
          users: { total: 0, active: 0 },
          reviews: { total: 0, averageRating: 0 },
          totalUsers: 0,
          totalRooms: 0,
          totalBookings: 0,
          totalRevenue: 0,
          pendingBookings: 0,
        }
      });
    }
  };
}
