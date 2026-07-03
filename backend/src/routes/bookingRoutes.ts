import { Router } from 'express';
import { createBooking, verifyPayment, getBookingHistory, cancelBookingController, getInvoice, emailInvoice } from '../controllers/bookingController';
import { idempotencyMiddleware } from '../middleware/idempotency';
import { bookingLimiter, paymentVerificationLimiter } from '../middleware/rateLimiter';

import { authenticate } from '../middleware/auth';

// A placeholder for auth middleware until Milestone 3
// We now use the real authenticate middleware, but some tests or old code might need it aliased
const requireAuthPlaceholder = authenticate;

const router = Router();

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roomId
 *               - checkIn
 *               - checkOut
 *               - guests
 *             properties:
 *               userId:
 *                 type: string
 *               roomId:
 *                 type: string
 *               checkIn:
 *                 type: string
 *                 format: date
 *               checkOut:
 *                 type: string
 *                 format: date
 *               guests:
 *                 type: integer
 *               specialRequests:
 *                 type: string
 *     responses:
 *       200:
 *         description: Booking initialized successfully
 */
// POST /api/v1/bookings
router.post('/', requireAuthPlaceholder, bookingLimiter as any, idempotencyMiddleware, createBooking);

/**
 * @swagger
 * /bookings/verify:
 *   post:
 *     summary: Verify Razorpay payment
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               razorpayOrderId:
 *                 type: string
 *               razorpayPaymentId:
 *                 type: string
 *               signature:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment verified
 */
// POST /api/v1/bookings/verify
router.post('/verify', requireAuthPlaceholder, paymentVerificationLimiter as any, verifyPayment);

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Get booking history for a user
 *     tags: [Bookings]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking history retrieved
 */
// GET /api/v1/bookings
router.get('/', requireAuthPlaceholder, getBookingHistory);

/**
 * @swagger
 * /bookings/{id}/cancel:
 *   post:
 *     summary: Cancel a booking
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Booking cancelled
 */
// POST /api/v1/bookings/:id/cancel
router.post('/:id/cancel', requireAuthPlaceholder, cancelBookingController);

/**
 * @swagger
 * /bookings/{id}/invoice:
 *   get:
 *     summary: Get invoice URL for a booking
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoice URL retrieved
 */
// GET /api/v1/bookings/:id/invoice
router.get('/:id/invoice', requireAuthPlaceholder, getInvoice);

/**
 * @swagger
 * /bookings/{id}/invoice/email:
 *   post:
 *     summary: Email invoice to user
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Invoice email queued
 */
// POST /api/v1/bookings/:id/invoice/email
router.post('/:id/invoice/email', requireAuthPlaceholder, emailInvoice);

export default router;
