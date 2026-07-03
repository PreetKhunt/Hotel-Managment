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

  async updateHotelSettings(hotelId: string, data: Partial<HotelSettings>): Promise<HotelSettings> {
    // Only allow safe updatable fields in settings
    const safeData: Partial<HotelSettings> = {};
    const updatableKeys: (keyof HotelSettings)[] = [
      'hotelName', 'currency', 'timezone', 'gstPercentage', 'checkInTime',
      'checkOutTime', 'maximumBookingDays', 'freeCancellationHours', 
      'invoicePrefix', 'bookingPrefix', 'supportEmail', 'supportPhone', 
      'logoUrl', 'featureFlags'
    ];

    for (const key of updatableKeys) {
      if (data[key] !== undefined) {
         // TypeScript doesn't let us dynamically assign different types easily without casting
         (safeData as any)[key] = data[key];
      }
    }

    if (Object.keys(safeData).length === 0) {
       return this.getHotelSettings(hotelId);
    }

    return this.settingsRepo.update(hotelId, safeData);
  }
}
