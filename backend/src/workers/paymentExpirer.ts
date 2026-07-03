import cron from 'node-cron';
import { pgPool } from '../config/database';
import { logger } from '../utils/logger';
import { BookingStatus, RoomStatus } from '../domain/enums';

// Run every 5 minutes
export const startPaymentExpirer = () => {
  cron.schedule('*/5 * * * *', async () => {
    logger.info('🕒 Running Payment Expirer Worker...');
    const client = await pgPool.connect();
    
    try {
      await client.query('BEGIN');

      // 1. Find pending_payment bookings older than 15 minutes
      const result = await client.query(`
        SELECT id, room_id 
        FROM bookings 
        WHERE status = $1 
        AND created_at < NOW() - INTERVAL '15 minutes'
        FOR UPDATE
      `, [BookingStatus.PENDING_PAYMENT]);

      if (result.rows.length === 0) {
        await client.query('COMMIT');
        return;
      }

      logger.info(`Found ${result.rows.length} expired bookings to process.`);

      for (const row of result.rows) {
        // 2. Update booking status
        await client.query(`
          UPDATE bookings SET status = $1 WHERE id = $2
        `, [BookingStatus.EXPIRED, row.id]);

        // 3. Update room status back to available if it's reserved
        await client.query(`
          UPDATE rooms SET status = $1 WHERE id = $2 AND status = $3
        `, [RoomStatus.AVAILABLE, row.room_id, RoomStatus.RESERVED]);

        // 4. Create Audit Log
        await client.query(`
          INSERT INTO booking_audit_logs (booking_id, action, previous_state, new_state, reason)
          VALUES ($1, $2, $3, $4, $5)
        `, [row.id, 'BookingExpired', BookingStatus.PENDING_PAYMENT, BookingStatus.EXPIRED, 'Payment timeout']);
        
        logger.info(`Expired booking: ${row.id}`);
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`❌ Payment Expirer failed: ${error instanceof Error ? error.message : error}`);
    } finally {
      client.release();
    }
  });
};
