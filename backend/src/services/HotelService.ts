import { IHotelRepository, IHotelSettingsRepository } from '../domain/repositories/IHotelRepository';
import { Hotel, HotelSettings } from '../domain/entities/Hotel';
import { AppError, ErrorCode } from '../utils/AppError';

export class HotelService {
  constructor(
    private readonly hotelRepo: IHotelRepository,
    private readonly settingsRepo: IHotelSettingsRepository
  ) {}

  async getHotelDetails(hotelId: string): Promise<Hotel> {
    const hotel = await this.hotelRepo.findById(hotelId);
    if (!hotel) {
      throw new AppError('Hotel not found', 404, ErrorCode.NOT_FOUND);
    }
    return hotel;
  }

  async getHotelSettings(hotelId: string): Promise<HotelSettings> {
    const settings = await this.settingsRepo.findByHotelId(hotelId);
    if (!settings) {
      throw new AppError('Hotel settings not found', 404, ErrorCode.NOT_FOUND);
    }
    return settings;
  }

  async updateHotelSettings(hotelId: string, data: Partial<HotelSettings> | Record<string, any>): Promise<HotelSettings> {
    // Only allow safe updatable fields in settings
    const safeData: Record<string, any> = {};
    const updatableKeys: string[] = [
      'hotelName', 'hotel_name', 'currency', 'timezone', 'gstPercentage', 'gst_percentage', 'checkInTime',
      'check_in_time', 'checkOutTime', 'check_out_time', 'maximumBookingDays', 'maximum_booking_days', 'freeCancellationHours',
      'free_cancellation_hours', 'invoicePrefix', 'invoice_prefix', 'bookingPrefix', 'booking_prefix', 'supportEmail', 'support_email',
      'supportPhone', 'support_phone', 'logoUrl', 'logo_url', 'description', 'address', 'phone', 'email', 'cancellationPolicy', 'cancellation_policy',
      'bannerImages', 'banner_images', 'socialLinks', 'social_links', 'featureFlags', 'feature_flags'
    ];

    for (const key of updatableKeys) {
      if ((data as Record<string, any>)[key] !== undefined) {
         safeData[key] = (data as Record<string, any>)[key];
      }
    }

    if (Object.keys(safeData).length === 0) {
       return this.getHotelSettings(hotelId);
    }

    return this.settingsRepo.update(hotelId, safeData);
  }
}
