import { PoolClient } from 'pg';
import { pgPool } from '../config/database';
import { BookingStatus, RoomStatus } from '../domain/enums';

export class AvailabilityService {
  /**
   * Checks if a room is available for the specified dates.
   * Uses EXISTS to perform an atomic overlap check.
   * Note: This should ideally be called inside a SERIALIZABLE transaction.
   * 
   * @param client The Postgres client (useful if part of a larger transaction)
   * @param roomId The UUID of the room
   * @param checkIn The check-in date (YYYY-MM-DD)
   * @param checkOut The check-out date (YYYY-MM-DD)
   * @param excludeBookingId Optional booking ID to exclude (useful for modifications)
   */
  public async isRoomAvailable(
    client: PoolClient,
    roomId: string,
    checkIn: string,
    checkOut: string,
    excludeBookingId?: string
  ): Promise<boolean> {
    // 1. Check physical room status (cannot be maintenance or blocked)
    const roomRes = await client.query('SELECT status FROM rooms WHERE id = $1 FOR UPDATE', [roomId]);
    if (roomRes.rows.length === 0) {
      throw new Error('Room not found');
    }
    const roomStatus = roomRes.rows[0].status;
    if (roomStatus === RoomStatus.MAINTENANCE || roomStatus === RoomStatus.BLOCKED) {
      return false;
    }

    // 2. Check for overlapping bookings
    // A booking overlaps if: existing.check_in < requested.check_out AND existing.check_out > requested.check_in
    // We consider bookings that block availability: CONFIRMED, CHECKED_IN, PENDING_PAYMENT
    const blockingStatuses = [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN, BookingStatus.PENDING_PAYMENT];

    let query = `
      SELECT EXISTS (
        SELECT 1 FROM bookings
        WHERE room_id = $1
        AND status = ANY($2::varchar[])
        AND check_in < $3
        AND check_out > $4
    `;
    const params: any[] = [roomId, blockingStatuses, checkOut, checkIn];

    if (excludeBookingId) {
      query += ` AND id != $5`;
      params.push(excludeBookingId);
    }
    
    query += `);`;

    const overlapRes = await client.query(query, params);
    const hasOverlap = overlapRes.rows[0].exists;

    return !hasOverlap;
  }

  /**
   * Retrieves an array of booked date ranges for a room.
   * Used by the frontend calendar to disable unavailable dates.
   */
  public async getRoomCalendar(roomId: string, startDate: string, endDate: string) {
    const blockingStatuses = [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN, BookingStatus.PENDING_PAYMENT];
    
    // We don't need a transaction for a simple read
    const query = `
      SELECT check_in, check_out, status
      FROM bookings
      WHERE room_id = $1
      AND status = ANY($2::varchar[])
      AND check_in <= $3
      AND check_out >= $4
      ORDER BY check_in ASC;
    `;
    const params = [roomId, blockingStatuses, endDate, startDate];
    
    const res = await pgPool.query(query, params);
    return res.rows.map((row: any) => ({
      start: row.check_in,
      end: row.check_out,
      status: row.status
    }));
  }
}

export const availabilityService = new AvailabilityService();
