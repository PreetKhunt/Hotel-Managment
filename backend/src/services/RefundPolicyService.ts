import { pgPool } from '../config/database';
import { differenceInHours } from 'date-fns';

export interface RefundPolicy {
  id: string;
  name: string;
  cancellation_hours_before_checkin: number;
  refund_percentage: number;
}

export class RefundPolicyService {
  /**
   * Evaluates the refund amount based on configured policies.
   */
  public async calculateRefundAmount(
    amountPaid: number,
    checkInDate: Date,
    hotelId?: string
  ): Promise<number> {
    const hoursUntilCheckIn = differenceInHours(checkInDate, new Date());
    
    // If it's already past check-in, no refund
    if (hoursUntilCheckIn <= 0) {
      return 0;
    }

    const client = await pgPool.connect();
    try {
      // Find the appropriate policy. We order by cancellation_hours_before_checkin descending
      // and pick the first one where hoursUntilCheckIn >= policy.hours
      // We look for hotel-specific policies first, falling back to global (hotel_id IS NULL).
      const query = `
        SELECT refund_percentage 
        FROM refund_policies
        WHERE is_active = true 
          AND (hotel_id = $1 OR hotel_id IS NULL)
          AND cancellation_hours_before_checkin <= $2
        ORDER BY 
          (hotel_id IS NOT NULL) DESC, -- Prefer hotel specific
          cancellation_hours_before_checkin DESC
        LIMIT 1
      `;
      
      const res = await client.query(query, [hotelId || null, hoursUntilCheckIn]);
      
      if (res.rows.length === 0) {
        return 0; // Default to no refund if no policy matches
      }

      const percentage = parseFloat(res.rows[0].refund_percentage);
      return Math.round(amountPaid * (percentage / 100));
    } finally {
      client.release();
    }
  }
}

export const refundPolicyService = new RefundPolicyService();
