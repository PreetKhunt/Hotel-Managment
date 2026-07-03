import { Pool } from 'pg';
import { IHotelSettingsRepository } from '../IHotelRepository';
import { HotelSettings } from '../../entities/Hotel';
import { AppError, ErrorCode } from '../../../utils/AppError';

export class HotelSettingsRepository implements IHotelSettingsRepository {
  constructor(private readonly pool: Pool) {}

  private mapToHotelSettings(row: any): HotelSettings {
    return {
      id: row.id,
      hotelId: row.hotel_id,
      hotelName: row.hotel_name,
      currency: row.currency,
      timezone: row.timezone,
      gstPercentage: parseFloat(row.gst_percentage),
      checkInTime: row.check_in_time,
      checkOutTime: row.check_out_time,
      maximumBookingDays: row.maximum_booking_days,
      freeCancellationHours: row.free_cancellation_hours,
      invoicePrefix: row.invoice_prefix,
      bookingPrefix: row.booking_prefix,
      supportEmail: row.support_email,
      supportPhone: row.support_phone,
      logoUrl: row.logo_url,
      featureFlags: row.feature_flags,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async findByHotelId(hotelId: string): Promise<HotelSettings | null> {
    const res = await this.pool.query('SELECT * FROM hotel_settings WHERE hotel_id = $1', [hotelId]);
    if (res.rows.length === 0) return null;
    return this.mapToHotelSettings(res.rows[0]);
  }

  async update(hotelId: string, data: Partial<HotelSettings>): Promise<HotelSettings> {
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const dbMapping: Record<string, string> = {
      hotelName: 'hotel_name',
      currency: 'currency',
      timezone: 'timezone',
      gstPercentage: 'gst_percentage',
      checkInTime: 'check_in_time',
      checkOutTime: 'check_out_time',
      maximumBookingDays: 'maximum_booking_days',
      freeCancellationHours: 'free_cancellation_hours',
      invoicePrefix: 'invoice_prefix',
      bookingPrefix: 'booking_prefix',
      supportEmail: 'support_email',
      supportPhone: 'support_phone',
      logoUrl: 'logo_url',
      featureFlags: 'feature_flags'
    };

    for (const [key, value] of Object.entries(data)) {
      if (dbMapping[key] !== undefined && value !== undefined) {
        updates.push(`"${dbMapping[key]}" = $${idx}`);
        // If JSON object, pg handles it appropriately or we need to stringify, pg client handles objects for jsonb
        values.push(value);
        idx++;
      }
    }

    if (updates.length === 0) {
      const existing = await this.findByHotelId(hotelId);
      if (!existing) throw new AppError('Hotel settings not found', 404, ErrorCode.NOT_FOUND);
      return existing;
    }

    values.push(hotelId);
    const query = `
      UPDATE hotel_settings 
      SET ${updates.join(', ')} 
      WHERE hotel_id = $${idx} 
      RETURNING *
    `;

    const res = await this.pool.query(query, values);
    if (res.rows.length === 0) {
      throw new AppError('Hotel settings not found', 404, ErrorCode.NOT_FOUND);
    }
    return this.mapToHotelSettings(res.rows[0]);
  }
}
