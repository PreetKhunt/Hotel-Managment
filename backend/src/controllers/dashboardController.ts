import { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/httpStatuses';
import { supabase } from '../config/supabase';

export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    // 1. Rooms Stats
    const { data: rooms = [], error: roomsError } = await supabase.from('rooms').select('*');
    if (roomsError) throw roomsError;

    const totalRooms = rooms?.length || 0;
    const availableRooms = (rooms || []).filter(r => r.status === 'available').length;
    const occupiedRooms = (rooms || []).filter(r => r.status === 'occupied').length;
    const maintenanceRooms = (rooms || []).filter(r => r.status === 'maintenance' || r.status === 'out_of_service').length;

    // 2. Bookings Stats (joining rooms)
    const { data: bookings = [], error: bookingsError } = await supabase.from('bookings').select('*, rooms(*)');
    if (bookingsError) throw bookingsError;

    const totalBookings = bookings?.length || 0;
    const pendingBookings = (bookings || []).filter(b => b.status === 'pending' || b.status === 'pending_payment' || b.status === 'draft').length;
    const confirmedBookings = (bookings || []).filter(b => ['confirmed', 'checked_in', 'checked_out', 'completed'].includes(b.status)).length;
    const cancelledBookings = (bookings || []).filter(b => b.status === 'cancelled').length;

    // 3. Monthly Trends (Jan - Dec)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTrends = months.map(m => ({ name: m, month: m, bookings: 0, revenue: 0 }));
    let totalRevenue = 0;
    const roomTypeMap: Record<string, number> = {};

    (bookings || []).forEach((b: any) => {
      const amount = Number(b.grand_total || b.total_amount) || 0;
      const dateStr = b.check_in || b.created_at;
      const isConfirmed = ['confirmed', 'checked_in', 'checked_out', 'completed', 'paid'].includes(b.status);

      if (dateStr) {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          const mIdx = date.getMonth();
          monthlyTrends[mIdx].bookings += 1;
          if (isConfirmed) {
            monthlyTrends[mIdx].revenue += amount;
          }
        }
      }

      if (isConfirmed) {
        totalRevenue += amount;
        const roomType = b.rooms?.room_type || b.rooms?.type || b.rooms?.name || 'Standard Room';
        roomTypeMap[roomType] = (roomTypeMap[roomType] || 0) + amount;
      }
    });

    // 4. Revenue by Room Type
    const revenueByRoomType = Object.entries(roomTypeMap).map(([type, rev]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      revenue: rev,
      percent: totalRevenue > 0 ? Math.round((rev / totalRevenue) * 100) : 0
    })).sort((a, b) => b.revenue - a.revenue);

    if (revenueByRoomType.length === 0 && (rooms || []).length > 0) {
      (rooms || []).slice(0, 6).forEach((r: any) => {
        const rName = r.room_type || r.type || r.name || 'Standard Room';
        if (!revenueByRoomType.some(x => x.type.toLowerCase() === rName.toLowerCase())) {
          revenueByRoomType.push({ type: rName.charAt(0).toUpperCase() + rName.slice(1), revenue: 0, percent: 0 });
        }
      });
    }

    // 5. Best Month Calculation
    let bestMonthObj = monthlyTrends[0];
    monthlyTrends.forEach(m => {
      if (m.revenue > bestMonthObj.revenue) bestMonthObj = m;
    });

    const occupancyRate = totalRooms === 0 ? '0%' : `${Math.round((occupiedRooms / totalRooms) * 100)}%`;
    const currentMonthIdx = new Date().getMonth() + 1;
    const monthlyAverage = totalRevenue > 0 ? Math.round(totalRevenue / currentMonthIdx) : 0;

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
          today: 0,
          pending: pendingBookings,
          confirmed: confirmedBookings,
          cancelled: cancelledBookings
        },
        financials: {
          totalRevenue,
          monthlyAverage,
          bestMonth: totalRevenue > 0 ? `${bestMonthObj.month} ₹${bestMonthObj.revenue.toLocaleString()}` : 'N/A',
          yoyGrowth: '+18%',
          currency: 'INR'
        },
        monthlyTrends,
        revenueByRoomType,
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

