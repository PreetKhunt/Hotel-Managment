import Razorpay from 'razorpay';
import crypto from 'crypto';
import { env } from '../config/env';

export interface PaymentOrderDetails {
  orderId: string;
  amount: number;
  currency: string;
}

export class PaymentService {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
  }

  /**
   * Creates a Razorpay Order
   * @param amount The amount in the smallest currency unit (e.g., paise for INR)
   * @param receipt An internal reference ID
   * @param currency Default is 'INR'
   */
  public async createOrder(amount: number, receipt: string, currency: string = 'INR'): Promise<PaymentOrderDetails> {
    const options = {
      amount,
      currency,
      receipt,
    };

    try {
      const order = await this.razorpay.orders.create(options);
      return {
        orderId: order.id,
        amount: order.amount as number,
        currency: order.currency,
      };
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw new Error('Payment gateway error while creating order.');
    }
  }

  /**
   * Verifies the Razorpay payment signature
   */
  public verifySignature(orderId: string, paymentId: string, signature: string): boolean {
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === signature;
  }

  /**
   * Issues a refund using Razorpay API
   */
  public async issueRefund(paymentId: string, amount: number): Promise<boolean> {
    try {
      if (!paymentId) return false;
      
      const refundOptions: any = {};
      
      // Amount should be in paise if it's INR.
      if (amount > 0) {
        refundOptions.amount = amount;
      }
      
      await this.razorpay.payments.refund(paymentId, refundOptions);
      return true;
    } catch (error: any) {
      console.error('Refund failed:', error.error ? error.error.description : error);
      throw new Error(`Refund failed: ${error.error ? error.error.description : 'Unknown error'}`);
    }
  }
}

export const paymentService = new PaymentService();
