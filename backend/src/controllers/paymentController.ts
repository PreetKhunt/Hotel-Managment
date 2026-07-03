import { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/httpStatuses';
import { razorpay } from '../config/razorpay';
import { supabase } from '../config/supabase';
import crypto from 'crypto';
import { env } from '../config/env';

export const getPayments = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase.from('payments').select('*').order('created_at', { ascending: false });

    if (error) throw error;

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Payments fetched from Supabase',
      data
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Failed to fetch payments' });
  }
};

export const createPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookingId, amount } = req.body;

    // 1. Create Order in Razorpay (amount is in paise, so multiply by 100)
    const options = {
      amount: Math.round(Number(amount) * 100),
      currency: 'USD', // Adjust to INR if using an Indian account without international payments enabled
      receipt: `receipt_${bookingId}`,
    };

    const order = await razorpay.orders.create(options);

    // 2. Insert pending payment in Supabase
    const { data, error } = await supabase
      .from('payments')
      .insert([
        {
          booking_id: bookingId,
          razorpay_order_id: order.id,
          amount,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Payment order created',
      data: {
        payment: data,
        orderId: order.id
      }
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Failed to create payment order' });
  }
};

export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // 1. Generate our own signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generated_signature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    // 2. Compare signatures securely
    if (generated_signature !== razorpay_signature) {
       res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'Invalid payment signature' });
       return;
    }

    // 3. Signature is valid. Update payment status in Supabase.
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: 'success'
      })
      .eq('razorpay_order_id', razorpay_order_id)
      .select()
      .single();

    if (paymentError) throw paymentError;

    // 4. Update the related booking status to 'confirmed'
    const { error: bookingError } = await supabase
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', payment.booking_id);

    if (bookingError) throw bookingError;

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Payment verified successfully',
      data: payment
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Failed to verify payment' });
  }
};
