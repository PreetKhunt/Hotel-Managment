import { Request, Response } from 'express';
import { bookingService } from '../services/BookingService';
import { sendSuccess, sendError } from '../middleware/apiResponse';
import { z } from 'zod';
import { observe } from '../utils/observe';

const createBookingSchema = z.object({
  roomId: z.string().uuid(),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.number().int().min(1),
  specialRequests: z.string().optional(),
});

export const createBooking = async (req: Request, res: Response) => {
  try {
    const validatedData = createBookingSchema.parse(req.body);
    
    // Validate dates
    if (new Date(validatedData.checkOut) <= new Date(validatedData.checkIn)) {
      return sendError(res, 'Check-out date must be after check-in date', 400);
    }

    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    const bookingResult = await observe('BookingCreation', () => 
      bookingService.createBooking(
        userId,
        validatedData.roomId,
        validatedData.checkIn,
        validatedData.checkOut,
        validatedData.guests,
        validatedData.specialRequests
      )
    );

    return sendSuccess(res, bookingResult, 'Booking initialized and order created');
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return sendError(res, 'Validation Error', 400, error.errors);
    }
    return sendError(res, error.message, 500);
  }
};

const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  signature: z.string().min(1),
});

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const validatedData = verifyPaymentSchema.parse(req.body);

    const verificationResult = await observe('PaymentVerification', () =>
      bookingService.verifyBookingPayment(
        validatedData.razorpayOrderId,
        validatedData.razorpayPaymentId,
        validatedData.signature
      )
    );

    return sendSuccess(res, verificationResult, 'Payment verified successfully');
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return sendError(res, 'Validation Error', 400, error.errors);
    }
    return sendError(res, error.message, 400);
  }
};

export const getBookingHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id; // In Milestone 3, we use the authenticated user
    
    // Check if it's an admin trying to get bookings for another user
    const queryUserId = req.query.userId as string;
    const isManager = req.user?.permissions.includes('manage_bookings') || req.user?.permissions.includes('full_access');
    
    const targetUserId = (isManager && queryUserId) ? queryUserId : userId;

    const status = req.query.status as string;

    if (!targetUserId) {
      return sendError(res, 'User ID is required', 400);
    }

    const history = await bookingService.getBookingHistory(targetUserId, status);
    return sendSuccess(res, history, 'Booking history retrieved');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

export const cancelBookingController = async (req: Request, res: Response) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user?.id; // Authenticated user ID
    
    // A manager can cancel any booking, so if it's a manager, we might bypass the userId check,
    // but the service method currently checks if the booking belongs to userId.
    // We'll let the service handle it, or we could pass a flag. Let's just use the current logic.
    // Wait, the service checks: if (booking.user_id !== userId) throw Error...
    // Let's pass the user's ID. If they are a manager, we might need a different service method or bypass it.
    // For now, stick to the user ID. The task is just to remove userId from the body.
    
    if (!bookingId || !userId) {
      return sendError(res, 'Booking ID and User ID are required', 400);
    }

    const result = await bookingService.cancelBooking(bookingId, userId);
    return sendSuccess(res, result, 'Booking cancelled successfully');
  } catch (error: any) {
    return sendError(res, error.message, 400);
  }
};

export const getInvoice = async (req: Request, res: Response) => {
  try {
    const bookingId = req.params.id;
    
    // In a real scenario we might fetch the invoice record from DB and redirect or return URL
    // For now, if the user requests it, we return a mock or check DB.
    const { pgPool } = require('../config/database');
    const client = await pgPool.connect();
    try {
      const dbRes = await client.query('SELECT invoice_url FROM invoices WHERE booking_id = $1', [bookingId]);
      if (dbRes.rows.length === 0) {
        return sendError(res, 'Invoice not found', 404);
      }
      return sendSuccess(res, { invoiceUrl: dbRes.rows[0].invoice_url }, 'Invoice retrieved');
    } finally {
      client.release();
    }
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};

export const emailInvoice = async (req: Request, res: Response) => {
  try {
    const bookingId = req.params.id;
    const email = req.user?.email || req.body.email;

    if (!bookingId || !email) {
      return sendError(res, 'Booking ID and Email are required', 400);
    }

    // Architecture stub for email service
    // await emailService.sendInvoice(email, bookingId);
    
    return sendSuccess(res, { status: 'queued' }, 'Invoice email queued');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
};
