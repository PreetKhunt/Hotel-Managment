import { pgPool } from '../config/database';
import { availabilityService } from './AvailabilityService';
import { pricingService } from './PricingService';
import { taxService } from './TaxService';
import { paymentService } from './PaymentService';
import { invoiceService } from './InvoiceService';
import { BookingStatus, PaymentStatus, RoomStatus } from '../domain/enums';
import crypto from 'crypto';

export class BookingService {
  /**
   * Generates a readable booking reference HH-YYYY-XXXXXX
   */
  private generateBookingReference(): string {
    const year = new Date().getFullYear();
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 chars
    return `HH-${year}-${randomHex}`;
  }

  /**
   * Main entry point to create a booking.
   * Ensures SERIALIZABLE isolation to prevent race conditions.
   */
  public async createBooking(
    userId: string,
    roomId: string,
    checkIn: string,
    checkOut: string,
    guests: number,
    specialRequests?: string
  ) {
    let retries = 3;
    while (retries > 0) {
      const client = await pgPool.connect();
      try {
        await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

        // 1. Check availability inside transaction lock
        const isAvailable = await availabilityService.isRoomAvailable(client, roomId, checkIn, checkOut);
        if (!isAvailable) {
          throw new Error('Room is not available for the selected dates.');
        }

        // 2. Fetch Room Base Price
        const roomRes = await client.query('SELECT price_per_night FROM rooms WHERE id = $1', [roomId]);
        const basePrice = roomRes.rows[0].price_per_night;

        // 3. Pricing & Taxes
        const pricing = pricingService.calculatePricing(basePrice, checkIn, checkOut);
        const taxes = taxService.calculateTaxes(pricing.subtotal);

        // 4. Generate Reference
        const bookingReference = this.generateBookingReference();
        const store = require('../utils/logger').loggerContext.getStore();
        if (store) {
          store.set('bookingReference', bookingReference);
        }

        // 5. Insert Booking
        const insertBookingQuery = `
          INSERT INTO bookings (
            user_id, room_id, check_in, check_out, guests, status, booking_reference,
            room_price, cgst_amount, sgst_amount, igst_amount, tax_percentage, discount,
            service_charge, subtotal, grand_total, special_requests, total_amount
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
          ) RETURNING id;
        `;
        const bookingValues = [
          userId, roomId, checkIn, checkOut, guests, BookingStatus.PENDING_PAYMENT, bookingReference,
          pricing.basePricePerNight, taxes.cgstAmount, taxes.sgstAmount, taxes.igstAmount, taxes.taxPercentage,
          pricing.discount, pricing.serviceCharge, pricing.subtotal, taxes.grandTotal, specialRequests || null,
          taxes.grandTotal // total_amount legacy field support
        ];
        
        const bookingRes = await client.query(insertBookingQuery, bookingValues);
        const bookingId = bookingRes.rows[0].id;

        // 6. Create Razorpay Order
        const amountInPaise = Math.round(taxes.grandTotal * 100);
        const rpOrder = await paymentService.createOrder(amountInPaise, bookingReference);

        // 7. Insert Payment
        const insertPaymentQuery = `
          INSERT INTO payments (
            booking_id, razorpay_order_id, amount, currency, status
          ) VALUES ($1, $2, $3, $4, $5) RETURNING id;
        `;
        await client.query(insertPaymentQuery, [
          bookingId, rpOrder.orderId, taxes.grandTotal, rpOrder.currency, PaymentStatus.CREATED
        ]);

        // 8. Insert Audit Log
        await client.query(`
          INSERT INTO booking_audit_logs (booking_id, action, performed_by, new_state, reason)
          VALUES ($1, $2, $3, $4, $5)
        `, [bookingId, 'BookingCreated', userId, BookingStatus.PENDING_PAYMENT, 'User initiated booking']);

        await client.query('COMMIT');
        
        return {
          bookingId,
          bookingReference,
          grandTotal: taxes.grandTotal,
          razorpayOrderId: rpOrder.orderId
        };
      } catch (error: any) {
        await client.query('ROLLBACK');
        
        // 40001 is the PostgreSQL error code for serialization failure
        if (error.code === '40001') {
          retries -= 1;
          if (retries === 0) {
            throw new Error('System is currently busy. Please try again.');
          }
          // Exponential backoff or simple delay before retry
          await new Promise(res => setTimeout(res, 100));
        } else {
          throw error;
        }
      } finally {
        client.release();
      }
    }
    throw new Error('System is currently busy. Please try again later.');
  }

  /**
   * Verifies payment and confirms the booking.
   * Idempotent operation.
   */
  public async verifyBookingPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    signature: string
  ) {
    // 1. Verify Signature locally
    const isValid = paymentService.verifySignature(razorpayOrderId, razorpayPaymentId, signature);
    if (!isValid) {
      throw new Error('Invalid payment signature');
    }

    const client = await pgPool.connect();
    try {
      await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

      // 2. Fetch current payment & booking status
      const pRes = await client.query(`
        SELECT p.id, p.status as p_status, 
               b.id as b_id, b.status as b_status, b.room_id,
               b.subtotal, b.cgst_amount, b.sgst_amount, b.igst_amount, b.grand_total
        FROM payments p
        JOIN bookings b ON p.booking_id = b.id
        WHERE p.razorpay_order_id = $1 FOR UPDATE
      `, [razorpayOrderId]);

      if (pRes.rows.length === 0) throw new Error('Order not found');

      const { 
        id: paymentId, p_status, 
        b_id: bookingId, b_status, room_id: roomId,
        subtotal: b_subtotal, cgst_amount: b_cgst, sgst_amount: b_sgst, igst_amount: b_igst, grand_total: b_grand_total
      } = pRes.rows[0];

      // 3. Idempotency Check
      if (p_status === PaymentStatus.PAID && b_status === BookingStatus.CONFIRMED) {
        await client.query('ROLLBACK');
        return { bookingId, status: 'already_confirmed' }; // Safe replay
      }

      // 4. Update Payment
      await client.query(`
        UPDATE payments 
        SET status = $1, razorpay_payment_id = $2, razorpay_signature = $3, paid_at = NOW() 
        WHERE id = $4
      `, [PaymentStatus.PAID, razorpayPaymentId, signature, paymentId]);

      // 5. Update Booking
      await client.query(`
        UPDATE bookings SET status = $1 WHERE id = $2
      `, [BookingStatus.CONFIRMED, bookingId]);

      // 6. Update Room physical state
      await client.query(`
        UPDATE rooms SET status = $1 WHERE id = $2
      `, [RoomStatus.RESERVED, roomId]);

      // 7. Audit Log
      await client.query(`
        INSERT INTO booking_audit_logs (booking_id, action, previous_state, new_state, reason)
        VALUES ($1, $2, $3, $4, $5)
      `, [bookingId, 'PaymentVerified', b_status, BookingStatus.CONFIRMED, 'Payment signature verified successfully']);

      // Note: In a true event-driven system, we would emit `PaymentSuccessfulEvent` here.
      // For now, we synchronously generate the invoice to satisfy the workflow.
      const invoice = await invoiceService.generateInvoice(
        bookingId,
        b_subtotal || 0, // In a real scenario we should fetch these snapshotted amounts
        b_cgst || 0,
        b_sgst || 0,
        b_igst || 0,
        b_grand_total || 0
      );
      
      return { bookingId, status: 'confirmed', invoice };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  /**
   * Retrieves booking history for a user, optionally filtered by status
   */
  public async getBookingHistory(userId: string, status?: string) {
    const client = await pgPool.connect();
    try {
      let query = `
        SELECT b.*, r.name as room_name, r.images as room_images
        FROM bookings b
        JOIN rooms r ON b.room_id = r.id
        WHERE b.user_id = $1
      `;
      const values: any[] = [userId];

      if (status) {
        query += ` AND b.status = $2`;
        values.push(status);
      }

      query += ` ORDER BY b.created_at DESC`;

      const res = await client.query(query, values);
      return res.rows;
    } finally {
      client.release();
    }
  }

  /**
   * Cancels a booking, issues refund according to policy, frees up room.
   */
  public async cancelBooking(bookingId: string, userId: string) {
    const client = await pgPool.connect();
    try {
      await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

      // 1. Fetch Booking and Payment Info
      const bRes = await client.query(`
        SELECT b.id, b.status, b.check_in, b.grand_total, b.room_id, b.user_id,
               p.id as payment_id, p.razorpay_payment_id, p.status as payment_status
        FROM bookings b
        LEFT JOIN payments p ON b.id = p.booking_id
        WHERE b.id = $1 FOR UPDATE
      `, [bookingId]);

      if (bRes.rows.length === 0) throw new Error('Booking not found');
      
      const booking = bRes.rows[0];

      if (booking.user_id !== userId) {
        throw new Error('Unauthorized'); // Basic protection
      }

      // 2. Validate booking state
      const allowedToCancel = [
        BookingStatus.PENDING_PAYMENT,
        BookingStatus.CONFIRMED
      ];

      if (!allowedToCancel.includes(booking.status)) {
        throw new Error(`Cannot cancel booking from state: ${booking.status}`);
      }

      let refundAmount = 0;

      // 3. If paid, calculate refund and process it
      if (booking.status === BookingStatus.CONFIRMED && booking.payment_status === PaymentStatus.PAID) {
        // Need refundPolicyService
        const { refundPolicyService } = require('./RefundPolicyService'); // inline require to avoid circular dep if any
        refundAmount = await refundPolicyService.calculateRefundAmount(
          parseFloat(booking.grand_total),
          new Date(booking.check_in)
        );

        if (refundAmount > 0 && booking.razorpay_payment_id) {
          const refundSuccess = await paymentService.issueRefund(booking.razorpay_payment_id, refundAmount * 100); // in paise
          if (!refundSuccess) {
             throw new Error('Razorpay Refund API failed');
          }
        }
        
        // Update payment to REFUNDED or PARTIALLY_REFUNDED
        await client.query(`
          UPDATE payments 
          SET status = $1 
          WHERE id = $2
        `, [PaymentStatus.REFUNDED, booking.payment_id]);
      }

      // 4. Update Booking Status
      await client.query(`
        UPDATE bookings 
        SET status = $1, refund_amount = $2 
        WHERE id = $3
      `, [BookingStatus.CANCELLED, refundAmount, bookingId]);

      // 5. Free up the room (only if it was reserved/confirmed)
      if (booking.status === BookingStatus.CONFIRMED) {
         await client.query(`UPDATE rooms SET status = $1 WHERE id = $2`, [RoomStatus.AVAILABLE, booking.room_id]);
      }

      // 6. Audit Log
      await client.query(`
        INSERT INTO booking_audit_logs (booking_id, action, previous_state, new_state, performed_by, reason)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [bookingId, 'BookingCancelled', booking.status, BookingStatus.CANCELLED, userId, 'User initiated cancellation']);

      // Note: Event system would emit BookingCancelledEvent to trigger notifications
      
      await client.query('COMMIT');
      return { bookingId, refundAmount, status: BookingStatus.CANCELLED };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export const bookingService = new BookingService();
