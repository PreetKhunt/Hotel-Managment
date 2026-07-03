import { differenceInDays, parseISO } from 'date-fns';

export interface PricingDetails {
  basePricePerNight: number;
  totalNights: number;
  subtotal: number;
  discount: number;
  serviceCharge: number;
}

export class PricingService {
  /**
   * Calculates the base pricing details for a stay.
   * Future expansions: Weekend pricing, Seasonal pricing, Coupons, Corporate discounts.
   */
  public calculatePricing(
    basePricePerNight: number,
    checkInDate: string | Date,
    checkOutDate: string | Date,
    discountAmount: number = 0,
    serviceChargeAmount: number = 0
  ): PricingDetails {
    const start = typeof checkInDate === 'string' ? parseISO(checkInDate) : checkInDate;
    const end = typeof checkOutDate === 'string' ? parseISO(checkOutDate) : checkOutDate;
    
    let totalNights = differenceInDays(end, start);
    if (totalNights <= 0) {
      totalNights = 1; // Minimum 1 night stay
    }

    const subtotal = (basePricePerNight * totalNights) - discountAmount + serviceChargeAmount;

    return {
      basePricePerNight,
      totalNights,
      subtotal: Math.max(subtotal, 0),
      discount: discountAmount,
      serviceCharge: serviceChargeAmount,
    };
  }
}

export const pricingService = new PricingService();
